
import {inject} from '@loopback/context';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {promisify} from 'util';
import {RedisDataSource} from '../datasources/redis.datasource';
import {Cart, CartItem} from '../models';
import {retry, Task} from '../utils/retry';

export class CartRepository extends DefaultKeyValueRepository<Cart> {
  constructor(@inject('datasources.redis') dataSource: RedisDataSource) {
    super(Cart, dataSource);
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
  addItem(userId: string, item: CartItem) {
    const task: Task<Cart> = {
      run: async () => {
        const addItemToCart = (cart: Cart | null) => {
          cart = cart ?? new Cart({userId});
          cart.items = cart.items ?? [];
          const itemIdx = cart.items.findIndex(({productId}) => (productId === item.productId))

          if (itemIdx === -1) {
            cart.items.push(item);

          } else {
            cart.items[itemIdx] = item;

          }
          return cart;
        };
        const result = await this.checkAndSet(userId, addItemToCart);
        return {
          done: result != null,
          value: result,
        };
      },
      description: `update the shopping cart for '${userId}'`,
    };
    return retry(task, {maxTries: 10, interval: 10});
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
    userId: string,
    check: (current: Cart | null) => Cart | null,
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
    await execute('WATCH', [userId]);
    let cart: Cart | null = await this.get(userId);
    cart = check(cart);
    if (!cart) return null;
    await execute('MULTI', []);
    await this.set(userId, cart);
    const result = await execute('EXEC', []);
    return result == null ? null : cart;
  }
}
