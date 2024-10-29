
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  HttpErrors,
  param,
  post,
  requestBody
} from '@loopback/rest';
import {Order} from '../models';
import {UserRepository} from '../repositories';
import {basicAuthorization} from '../services';
import {ProductStockService} from '../services/product-stock.service';
import {OPERATION_SECURITY_SPEC} from '../utils';

/**
 * Controller for User's Orders
 */
export class UserOrderController {
  constructor(
    @repository(UserRepository)
    protected userRepo: UserRepository,
    @inject('services.ProductStockService')
    protected productStockService: ProductStockService
  ) { }

  /**
   * Create or update the orders for a given user
   * @param userId User id
   * @param cart Shopping cart
   */
  @post('/users/{userId}/orders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User.Order model instance',
        content: {'application/json': {schema: {'x-ts-type': Order}}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async createOrder(
    @param.path.string('userId') userId: string,
    @requestBody() order: Order,
  ): Promise<Order> {
    order.date = new Date().toString();

    const inStock = await Promise.all(order.products.map(({productId, quantity}) => this.productStockService.checkAndUpdateStock(productId, quantity).then((available) => ({available, productId, quantity}))))

    if (inStock.some(({available}) => available === false)) {
      await Promise.all(inStock.filter(({available}) => available === true).map(({productId, quantity}) => this.productStockService.addStock(productId, quantity)))
      throw new HttpErrors.BadRequest("Product not instock");
    }

    return this.userRepo
      .orders(userId)
      .create(order)
      .catch(e => {
        throw HttpErrors(400);
      });
  }

  @get('/users/{userId}/orders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: "Array of User's Orders",
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Order}},
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async findOrders(
    @param.path.string('userId') userId: string,
    @param.query.object('filter', getFilterSchemaFor(Order))
    filter?: Filter<Order>,
  ): Promise<Order[]> {
    const orders = await this.userRepo.orders(userId).find(filter);
    return orders;
  }

  @del('/users/{userId}/orders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User.Order DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  async deleteOrders(
    @param.path.string('userId') userId: string,
    @param.query.object('where', getWhereSchemaFor(Order)) where?: Where<Order>,
  ): Promise<Count> {
    return this.userRepo.orders(userId).delete(where);
  }
}
