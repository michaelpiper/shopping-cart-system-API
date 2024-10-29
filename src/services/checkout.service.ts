// export class CheckoutService {
//   async checkout(cartId: string, userId: string): Promise<IOrder> {
//     const cart = await cartRepository.findById(cartId);

//     // Check each product’s stock
//     for (const item of cart.items) {
//       const stockAvailable = await checkAndUpdateStock(item.productId, item.quantity);
//       if (!stockAvailable) throw new Error('Product out of stock');
//     }

//     // If successful, finalize the checkout
//     await cartRepository.deleteById(cartId);
//     return {userId, cartId, totalAmount: cart.totalAmount};
//   }
// }
