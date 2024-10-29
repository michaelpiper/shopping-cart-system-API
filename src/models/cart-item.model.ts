
import {Entity, model, property} from '@loopback/repository';

/**
 * Item in a shopping cart
 */
@model()
export class CartItem extends Entity {
  /**
   * Product id
   */
  @property({id: true})
  productId: string;

  /**
   * Product name
   */
  @property()
  name: string;

  /**
   * Quantity
   */
  @property()
  quantity: number;
  /**
   * Price
   */
  @property()
  price?: number;

  constructor(data?: Partial<CartItem>) {
    super(data);
  }
}
