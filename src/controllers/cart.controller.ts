import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  HttpErrors,
  param,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import debugFactory from 'debug';
import {Cart, CartItem, Order} from '../models';
import {CartRepository} from '../repositories';
import {basicAuthorization} from '../services';
import {CartService} from '../services/cart.service';
import {ProductStockService} from '../services/product-stock.service';
import {ProductService} from '../services/product.service';
import {OPERATION_SECURITY_SPEC} from '../utils';
const debug = debugFactory('shopping-cart-api');

/**
 * Controller for shopping cart
 */
export class CartController {
  constructor(
    @inject(SecurityBindings.USER)
    public currentUserProfile: UserProfile,
    @repository(CartRepository)
    public cartRepository: CartRepository,
    @inject('services.ProductService')
    public productService: ProductService,
    @inject('services.ProductStockService')
    public productStockService: ProductStockService
    ,
    @inject('services.CartService')
    public cartService: CartService
  ) { }

  /**
   * Create the shopping cart for a given user
   * @param userId User id
   * @param cart Shopping cart
   */
  @post('/carts/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User shopping cart is created or updated',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async create(
    @param.path.string('userId') userId: string,
    @requestBody({description: 'shopping cart'}) cart: Cart,
  ): Promise<void> {
    debug('Create shopping cart %s: %j', userId, cart);
    await this.cartService.ensureNoDuplicateProduct(cart);

    await Promise.all(cart.items.map(({productId, quantity}) => Promise.all([
      this.productService.ensureProductExist(productId),
      this.productStockService.ensureInStock(productId, quantity)
    ])))
    await this.cartRepository.set(userId, cart);
  }

  /**
   * Create or update the shopping cart for a given user
   * @param userId User id
   * @param cart Shopping cart
   */
  @put('/carts/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User shopping cart is created or updated',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async set(
    @param.path.string('userId') userId: string,
    @requestBody({description: 'shopping cart'}) cart: Cart,
  ): Promise<void> {
    debug('Create shopping cart %s: %j', userId, cart);

    await this.cartService.ensureNoDuplicateProduct(cart);

    await Promise.all(cart.items.map(({productId, quantity}) =>
      Promise.all([
        this.productService.ensureProductExist(productId),
        this.productStockService.ensureInStock(productId, quantity)
      ])))
    await this.cartRepository.set(userId, cart);
  }

  /**
   * Retrieve the shopping cart by user id
   * @param userId User id
   */
  @get('/carts/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User shopping cart is read',
        content: {'application/json': {schema: {'x-ts-type': Cart}}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async get(
    @param.path.string('userId') userId: string,
  ): Promise<Cart> {
    debug('Get shopping cart %s', userId);
    const cart = await this.cartRepository.get(userId);
    debug('Shopping cart %s: %j', userId, cart);
    if (cart == null) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${userId}`,
      );
    } else {
      return cart;
    }
  }

  /**
   * Delete the shopping cart by user id
   * @param userId User id
   */
  @del('/carts/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User shopping cart is deleted',
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async remove(@param.path.string('userId') userId: string): Promise<void> {
    debug('Remove shopping cart %s', userId);
    await this.cartRepository.delete(userId);
  }

  /**
   * Add an item to the shopping cart for a given user
   * @param userId User id
   * @param cart Shopping cart item to be added
   */
  @post('/carts/{userId}/items', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User shopping cart item is created',
        content: {
          'application/json': {schema: {'x-ts-type': Cart}},
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async addItem(
    @param.path.string('userId') userId: string,
    @requestBody({description: 'shopping cart item'}) item: CartItem,
  ): Promise<Cart> {
    debug('Add item %j to shopping cart %s', item, userId);
    await Promise.all([
      this.productService.ensureProductExist(item.productId),
      this.productStockService.ensureInStock(item.productId, item.quantity)
    ])
    return this.cartRepository.addItem(userId, item);
  }



  /**
   * Create or update the shopping cart for a given user
   * @param userId User id
   * @param cart Shopping cart
   */
  @put('/carts/{userId}/checkout', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User shopping cart checkout created',
        content: {'application/json': {schema: {'x-ts-type': Order}}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async checkout(
    @param.path.string('userId') userId: string,
  ): Promise<Order> {
    debug('Create shopping order from cart %s', userId);

    debug('Get shopping cart %s', userId);
    const cart = await this.cartRepository.get(userId);
    debug('Shopping cart %s: %j', userId, cart);
    if (cart == null) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${userId}`,
      );
    } else {
      return this.cartService.createOrder(userId, cart);
    }
  }
}
