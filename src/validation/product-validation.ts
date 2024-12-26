import { z, ZodType } from 'zod';
import { ProductCategory } from '@prisma/client';

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

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(4).max(100),
    name: z.string().min(4).max(100),
    description: z.string().min(4).max(100),
    price: z.number().min(4),
    stock: z.number().min(1),
    category: this.productCategoryEnum,
  });
  static readonly DELETE: ZodType = z.object({
    id: z.string().min(4).max(100),
  });

  static readonly SEARCH: ZodType = z.object({
    name: z.string().min(1).optional(),
    price: z.number().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
