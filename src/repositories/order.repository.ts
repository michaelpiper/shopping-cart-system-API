
import {inject} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Order} from '../models';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.orderId
> {
  constructor(@inject('datasources.mongo') dataSource: juggler.DataSource) {
    super(Order, dataSource);
  }
}
