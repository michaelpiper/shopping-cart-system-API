import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Cart, Order} from '../models';
import {UserRepository} from '../repositories';
import {ProductStockService} from './product-stock.service';

export class OrderService {

  constructor(
    @repository(UserRepository)
    public userRepo: UserRepository,
    @inject('services.ProductStockService')
    protected productStockService: ProductStockService
  ) {

  }
  async create(order: Order) {
    const inStock = await Promise.all(order.products.map(({productId, quantity}) => this.productStockService.checkAndUpdateStock(productId, quantity).then((available) => ({available, productId, quantity}))))
    if (inStock.some(({available}) => available === false)) {
      await Promise.all(inStock.filter(({available}) => available === true).map(({productId, quantity}) => this.productStockService.addStock(productId, quantity)))
      throw new HttpErrors.BadRequest(`Product not instock ${inStock.filter(({available}) => available === false).map(({productId}) => (productId))}`);
    }
    return this.userRepo
      .orders(order.userId)
      .create(order)
      .catch(e => {
        throw HttpErrors(400);
      });
  }

  async createFromCart(userId: string, cart: Cart) {
    const order = new Order({
      userId: userId,
      products: cart.items,
    })
    order.date = new Date().toString();
    return this.create(order);
  }
}
