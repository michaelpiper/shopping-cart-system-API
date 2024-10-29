import {Entity, model, property} from '@loopback/repository';

@model()
export class Stock extends Entity {

  @property({
    type: 'number',
    required: true,
  })
  count: number;


  constructor(data?: Partial<Stock>) {
    super(data);
  }
}
