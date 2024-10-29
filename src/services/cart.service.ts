import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import debugFactory from 'debug';
import {ICartItem} from '../interfaces';
import {Cart, Order} from '../models';
import {CartRepository, ProductRepository} from '../repositories';
import {OrderService} from './order.service';
const debug = debugFactory('shopping-cart-api:services:CartService');
export class CartService {

  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(CartRepository)
    public cartRepository: CartRepository,
    @inject('services.OrderService')
    protected orderService: OrderService
  ) { }


  async ensureNoDuplicateProduct(cart: Cart): Promise<void> {
    const products = new Map()
    const check = (item: ICartItem) => {
      debug('checking product %s', item.productId)
      if (products.has(item.productId)) {
        throw new HttpErrors.Conflict(`Duplicate product id found ${item.productId}`)
      }
      products.set(item.productId, true)

    }
    for (const item of cart.items) {
      await Promise.resolve().then(() => check(item))
    }
  }


  async createOrder(userId: string, cart: Cart): Promise<Order> {
    const order = await this.orderService.createFromCart(userId, cart)
    await this.cartRepository.delete(userId);
    return order
  }
}
