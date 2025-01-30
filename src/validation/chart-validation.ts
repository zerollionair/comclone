import { z, ZodType } from 'zod';

export class ChartValidation {
  static readonly CREATE: ZodType = z.object({
    userId: z.string().min(4).max(100),
    items: z.object({
      productId: z.string().min(4).max(100),
      quantity: z.number().positive(),
    }),
  });

  static readonly GET: ZodType = z.string().min(4).max(100);

  static readonly DELETE: ZodType = z.object({
    chartId: z.string().min(4).max(100),
    productId: z.string().min(4).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    chartId: z.string().min(4).max(100),
    productId: z.string().min(4).max(100),
    quantity: z.number().positive(),
  });
}
