import { OrderStatus } from '@prisma/client';

export type CreateOrderRequest = {
  userId: string;
  items: OrderItems[];
};
type OrderItems = {
  productId: string;
  quantity: number;
};

export type OrderResponse = {
  message?: string;
  order: Order;
  orderItems: OrderItemsResponse[];
};
type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
};
type OrderItemsResponse = {
  productId: string;
  quantity: number;
  price: number;
};
