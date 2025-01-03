import { z, ZodType } from 'zod';

export class ProductValidation {
  private static productCategoryEnum = z.enum([
    'ELECTRONICS',
    'FASHION',
    'FOOD',
    'HOME',
    'BEAUTY',
    'SPORTS',
    'TOYS',
    'AUTOMOTIVE',
    'BOOKS',
  ]);

  static readonly CREATE: ZodType = z.object({
    name: z.string().min(4).max(100),
    description: z.string().min(4).max(100),
    price: z.number().min(4),
    stock: z.number().min(1),
    category: this.productCategoryEnum,
  });

  static readonly GET: ZodType = z.string().min(4).max(100);

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(4).max(100),
    name: z.string().min(4).max(100).optional(),
    description: z.string().min(4).max(100).optional(),
    price: z.number().positive().optional(),
    stock: z.number().min(1).optional(),
    category: this.productCategoryEnum.optional(),
  });
  static readonly DELETE: ZodType = z.string().min(4).max(100);

  static readonly SEARCH: ZodType = z.object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });

  static readonly FILTER: ZodType = z.object({
    name: z.string().min(1).optional(),
    category: this.productCategoryEnum.optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
