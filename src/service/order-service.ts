import { OrderValidation } from '../validation/order-validation';
import { prismaClient } from '../application/database';
import { CreateOrderRequest, OrderResponse } from '../model/order-model';
import { HTTPException } from 'hono/http-exception';
import { map } from 'zod';

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

      const productMap = new Map(
        products.map((product) => [product.id, product.price]),
      );

      const orderItems = items.map((item) => {
        const productPrice = productMap.get(item.productId);
        if (productPrice == undefined)
          throw new HTTPException(400, {
            message: `product with id {item.productId} not found`,
          });

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: productPrice,
        };
      });
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: { userId, totalAmount, status: 'PENDING' },
      });
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({ ...item, orderId: order.id })),
      });

      const { createdAt, updatedAt, ...orderWithoutDate } = order;
      return {
        message: 'Order created successfully',
        order: orderWithoutDate,
        orderItems,
      };
    });
  }
}
