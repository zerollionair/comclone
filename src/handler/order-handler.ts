import { Hono } from 'hono';
import { CreateOrderRequest } from '../model/order-model';
import { OrderService } from '../service/order-service';

export const orderHandler = new Hono();

orderHandler.post('orders', async (c) => {
  const payload = c.get('jwtPayload');
  const request = (await c.req.json()) as CreateOrderRequest;
  request.userId = payload.id;

  const response = await OrderService.create(request);

  return c.json({
    data: response,
  });
});
