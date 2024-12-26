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
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
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
export type ProductFilterRequest = {
  name?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'stock';
  order?: 'asc' | 'desc';
};
export type SearchProductRequest = {
  name?: string;
  phone?: string;
  email?: string;
  page: number;
  size: number;
};
