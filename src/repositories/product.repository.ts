
import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Product, ProductRelations} from '../models';
const {ObjectID} = require('loopback-connector-mongodb')
export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.productId,
  ProductRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Product, dataSource);
  }

  async incrementField(
    id: typeof Product.prototype.productId,
    fieldName: string,
    incrementBy: number
  ): Promise<void> {
    await this.dataSource.connector?.collection('Product').updateOne(
      {_id: ObjectID(id)},
      {$inc: {[fieldName]: incrementBy}}
    );
  }
  addStock(id: typeof Product.prototype.productId, incrementBy: number) {
    return this.incrementField(id, 'stock', incrementBy)
  }
}
