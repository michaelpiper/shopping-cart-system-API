export interface IProduct {
  productId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface ICart {
  userId: string;
  items: ICartItem[];
  totalAmount: number;
}

export interface ICreateCart {
  items: ICartItem[];
  totalAmount: number;
}

export interface ICreateCart {
  userId: string;
  items: ICartItem[];
  totalAmount: number;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface ICheckout {
  userId: string;
  cartId: string;
  totalAmount: number;
}
