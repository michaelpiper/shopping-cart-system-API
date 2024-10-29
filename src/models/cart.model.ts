import {belongsTo, Entity, model, property} from '@loopback/repository';
import {ICart} from '../interfaces';
import {CartItem} from './cart-item.model';
import {User} from './user.model';

@model()
export class Cart extends Entity implements ICart {

  @belongsTo(() => User)
  userId: string;

  @property.array(CartItem)
  items: CartItem[];

  @property({
    type: 'number',
    required: true,
  })
  totalAmount: number;


  constructor(data?: Partial<Cart>) {
    super(data);
  }
}
