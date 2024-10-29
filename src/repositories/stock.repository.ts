

import {inject} from '@loopback/context';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {promisify} from 'util';
import {RedisDataSource} from '../datasources/redis.datasource';
import {Stock} from '../models/stock.model';
import {retry, Task} from '../utils';

import debugModule from 'debug';
const debug = debugModule('shopping-cart-api:stock:StockRepository');

export class StockRepository extends DefaultKeyValueRepository<Stock> {
  constructor(@inject('datasources.redis') dataSource: RedisDataSource) {
    super(Stock, dataSource);
  }

  /**
   * Add an item to the shopping cart with optimistic lock to allow concurrent
   * `adding to cart` from multiple devices. If race condition happens, it will
   * try 10 times at an interval of 10 ms. Timeout will be reported as an error.
   *
   * @param userId User id
   * @param item Item to be added
   * @returns A promise that's resolved with the updated Cart instance
   *
   */
  addCount(ref: string, count: number) {
    const task: Task<Stock> = {
      run: async () => {
        const addCountToStock = (stock: Stock | null) => {
          stock = stock ?? new Stock({count});
          stock.count = stock.count ?? 0;
          return stock;
        };
        const result = await this.checkAndSet(ref, addCountToStock);
        return {
          done: result != null,
          value: result,
        };
      },
      description: `update the stock count cart for '${ref}'`,
    };
    return retry(task, {maxTries: 1, interval: 10});
  }

  /**
   * Use Redis WATCH and Transaction to check and set against a key
   * See https://redis.io/topics/transactions#optimistic-locking-using-check-and-set
   *
   * Ideally, this method should be made available by `KeyValueRepository`.
   *
   * @param userId User id
   * @param check A function that checks the current value and produces a new
   * value. It returns `null` to abort.
   *
   * @returns A promise that's resolved with the updated Cart instance
   * or with null if the transaction failed due to a race condition.
   * See https://github.com/NodeRedis/node_redis#optimistic-locks
   */
  async checkAndSet(
    ref: string,
    check: (current: Stock | null) => Stock | null,
  ) {
    const connector = this.kvModelClass.dataSource!.connector!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const execute = promisify((cmd: string, args: any[], cb: Function) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      connector.execute!(cmd, args, cb);
    });
    /**
     * - WATCH userId
     * - GET userId
     * - check(cart)
     * - MULTI
     * - SET userId
     * - EXEC
     */
    await execute('WATCH', [ref]);
    let cart: Stock | null = await this.get(ref);
    cart = check(cart);
    if (!cart) return null;
    await execute('MULTI', []);
    await this.set(ref, cart);
    const result = await execute('EXEC', []);
    return result == null ? null : cart;
  }

  async acquireLock(lockKey: string, expiry: number = 5): Promise<boolean> {
    const connector = this.kvModelClass.dataSource!.connector!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const execute = promisify((cmd: string, args: any[], cb: Function) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      connector.execute!(cmd, args, cb);
    });
    debug("acquiring lock")
    // Try to set the lock with an expiry time
    let result: string | undefined | null = await execute('SET', [lockKey, 'LOCKED', 'NX', 'EX', expiry]) as string | null;
    result = result?.toString()
    debug("acquireLock result: (%s)", result)
    debug("acquireLock result is OK: (%s) ", result === 'OK')
    return result === 'OK'; // Returns true if the lock was acquired
  }

  async releaseLock(lockKey: string): Promise<void> {
    const connector = this.kvModelClass.dataSource!.connector!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const execute = promisify((cmd: string, args: any[], cb: Function) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      connector.execute!(cmd, args, cb);
    });
    await execute('DEL', [lockKey]);
  }
}
