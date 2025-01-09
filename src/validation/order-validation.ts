import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly CREATE: ZodType = z.object({
    userId: z.string().min(4).max(100),
    items: z.array(
      z.object({
        productId: z.string().min(4).max(100),
        quantity: z.number().positive(),
      }),
    ),
  });
}
