import { ProductCategory } from '@prisma/client';

export type CreateProductRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
};
export type UpdateProductRequest = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
};
export type DeleteProductRequest = {
  id: string;
};
export type ProductResponse = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  message?: string;
  category?: ProductCategory;
};
export type FilterProductRequest = {
  name?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page: number;
  size: number;
};
export type SearchProductRequest = {
  name?: string;
  price?: number;
  page: number;
  size: number;
};
