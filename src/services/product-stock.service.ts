import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import debugFactory from 'debug';
import {ProductRepository} from '../repositories';
import {StockRepository} from '../repositories/stock.repository';
const debug = debugFactory('shopping-cart-api:services:ProductStockService');
export class ProductStockService {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(StockRepository)
    public stockRepository: StockRepository,

  ) { }
  async checkAndUpdateStock(productId: string, quantity: number): Promise<boolean> {
    const lockKey = `lock:product:${productId}`;
    const productKey = `product:${productId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isLocked = await this.stockRepository.acquireLock(lockKey, 5);
    debug("check if locked %s", isLocked)
    if (!isLocked) return false; // Retry or fail if locked

    try {
      // Fetch the product stock and check if available
      debug("Fetch product %s stock and check if available %s", productId, quantity)
      const product = await this.productRepository.findById(productId);
      debug("product in stock %s, quantity available : %s", product.stock < quantity, product.stock)
      if (product.stock < quantity) return false;

      // Update the stock and save to the database
      product.stock -= quantity;
      await Promise.all([
        this.stockRepository.addCount(productKey, product.stock),
        this.productRepository.addStock(productId, -quantity),
      ]);
    } finally {
      await this.stockRepository.releaseLock(lockKey); // Release lock
    }
    return true;
  }

  async addStock(productId: string, quantity: number): Promise<boolean> {
    const lockKey = `lock:product:${productId}`;
    const productKey = `product:${productId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isLocked = await this.stockRepository.acquireLock(lockKey, 5);

    if (!isLocked) return false; // Retry or fail if locked

    try {
      // Fetch the product stock and check if available
      const product = await this.productRepository.findById(productId);
      // Update the stock and save to the database
      product.stock += quantity;
      await Promise.all([
        this.stockRepository.addCount(productKey, product.stock),
        this.productRepository.addStock(productId, quantity),
      ]);
    } finally {
      await this.stockRepository.releaseLock(lockKey); // Release lock
    }
    return true;
  }


  async ensureInStock(productId: string, quantity: number): Promise<void> {
    const lockKey = `lock:product:${productId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isLocked = await this.stockRepository.acquireLock(lockKey, 5);

    if (!isLocked) throw new HttpErrors.BadRequest(`Multitple request submitted`); // Retry or fail if locked
    let available
    try {
      // Fetch the product stock and check if available
      const product = await this.productRepository.findById(productId);
      debug("Fetch product %s stock and check if available %s", productId, quantity)
      available = (product.stock >= quantity);
    } finally {
      await this.stockRepository.releaseLock(lockKey); // Release lock
    }

    if (!available)
      throw new HttpErrors.BadRequest(`Not enough product ${productId} in stock`)
  }
}
