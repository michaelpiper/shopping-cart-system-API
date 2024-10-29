import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import debugFactory from 'debug';
import {ProductRepository} from '../repositories';
const debug = debugFactory('shopping-cart-api:services:ProductService');
export class ProductService {

  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,

  ) { }
  async ensureProductExist(productId: string): Promise<void> {
    try {
      await this.productRepository.findById(productId, {
        fields: ['productId'],
      })
    } catch (error) {
      debug("Error retrievung product Id", error);
      throw new HttpErrors.BadRequest(`Invalid product id provided '${productId}`)
    }
  }
}
