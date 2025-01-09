import { OrderValidation } from '../validation/order-validation';
import { prismaClient } from '../application/database';
import { CreateOrderRequest, OrderResponse } from '../model/order-model';
import { HTTPException } from 'hono/http-exception';

export class OrderService {
  static async create(request: CreateOrderRequest): Promise<OrderResponse> {
    request = OrderValidation.CREATE.parse(request);

    const { userId, items } = request;

    return prismaClient.$transaction(async (tx) => {
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          price: true,
        },
      });

      const productPriceMap = new Map(
        products.map((product) => [product.id, product.price]),
      );

      let totalAmount = 0;
      const orderItems = items.map((item) => {
        const productPrice = productPriceMap.get(item.productId);
        if (productPrice == undefined) {
          throw new HTTPException(400, {
            message: `product with id {item.productId} not found `,
          });
        }
        totalAmount += productPrice * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: productPrice,
        };
      });
      const order = await tx.order.create({
        data: { userId, totalAmount, status: 'PENDING' },
      });

      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      return {
        message: `Order created successfully.`,
        order: {
          id: order.id,
          userId: userId,
          totalAmount: order.totalAmount,
          status: order.status,
        },
        orderItems,
      };
    });
  }
}
