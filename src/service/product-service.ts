import {
  CreateProductRequest,
  FilterProductRequest,
  ProductResponse,
  SearchProductRequest,
  UpdateProductRequest,
} from '../model/product-model';
import { Pageable } from '../model/page-model';
import { ProductValidation } from '../validation/product-validation';
import { prismaClient } from '../application/database';
import { HTTPException } from 'hono/http-exception';
import { Product } from '@prisma/client';

export class ProductService {
  static async create(request: CreateProductRequest): Promise<ProductResponse> {
    request = ProductValidation.CREATE.parse(request);

    const totalProductWithSameName = await prismaClient.product.count({
      where: {
        name: request.name,
      },
    });
    if (totalProductWithSameName != 0) {
      throw new HTTPException(400, {
        message: 'Product Already Exists',
      });
    }
    await prismaClient.product.create({
      data: request,
    });

    return { message: 'Product Created' };
  }

  static async update(request: UpdateProductRequest): Promise<ProductResponse> {
    request = ProductValidation.UPDATE.parse(request);
    await this.ProductMustExist(request.id);

    const updatedProduct: Partial<Product> = {};

    if (request.name) {
      updatedProduct.name = request.name;
    }
    if (request.description) {
      updatedProduct.description = request.description;
    }
    if (request.price) {
      updatedProduct.price = request.price;
    }
    if (request.stock) {
      updatedProduct.stock = request.stock;
    }
    if (request.category) {
      updatedProduct.category = request.category;
    }
    await prismaClient.product.update({
      where: {
        id: request.id,
      },
      data: updatedProduct,
    });

    return { message: 'updated successfully' };
  }

  static async delete(request: string): Promise<ProductResponse> {
    request = ProductValidation.DELETE.parse(request);
    await this.ProductMustExist(request);

    await prismaClient.product.delete({
      where: {
        id: request,
      },
    });
    return { message: 'deleted successfully' };
  }

  static async getById(productId: string): Promise<ProductResponse> {
    productId = ProductValidation.GET.parse(productId);
    return await this.ProductMustExist(productId);
  }

  static async search(
    request: SearchProductRequest,
  ): Promise<Pageable<ProductResponse>> {
    request = ProductValidation.SEARCH.parse(request);

    let filters = [];

    if (request.name) {
      filters.push({
        name: {
          contains: request.name,
        },
      });
    }

    if (request.price) {
      filters.push({
        price: {
          equals: request.price,
        },
      });
    }

    const skip = (request.page - 1) * request.size;

    const products = await prismaClient.product.findMany({
      where: {
        AND: filters,
      },
      take: request.size,
      skip: skip,
    });

    if (products.length === 0) {
      throw new Error('No products found with the given filters');
    }

    const totalProduct = await prismaClient.product.count({
      where: {
        AND: filters,
      },
    });

    return {
      data: products.map((product) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
      })),
      paging: {
        current_page: request.page,
        size: request.size,
        total_page: Math.ceil(totalProduct / request.size),
      },
    };
  }

  static async filter(
    request: FilterProductRequest,
  ): Promise<Pageable<ProductResponse>> {
    request = ProductValidation.FILTER.parse(request);

    let filters = [];

    if (request.name) {
      filters.push({
        name: {
          contains: request.name,
        },
      });
    }
    if (request.minPrice || request.maxPrice) {
      filters.push({
        price: {
          gte: request.minPrice,
          lte: request.maxPrice,
        },
      });
    }
    if (request.category) {
      filters.push({
        category: request.category,
      });
    }
    if (request.inStock) {
      filters.push({
        stock: {
          gte: 1,
        },
      });
    }

    const skip = (request.page - 1) * request.size;

    const products = await prismaClient.product.findMany({
      where: {
        AND: filters,
      },
      take: request.size,
      skip: skip,
    });

    const totalProduct = await prismaClient.product.count({
      where: {
        AND: filters,
      },
    });

    return {
      data: products.map((product) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
      })),
      paging: {
        current_page: request.page,
        size: request.size,
        total_page: Math.ceil(totalProduct / request.size),
      },
    };
  }
  static async ProductMustExist(productId: string): Promise<ProductResponse> {
    const product = await prismaClient.product.findFirst({
      where: {
        id: productId,
      },
      select: {
        name: true,
        description: true,
        price: true,
        stock: true,
        category: true,
      },
    });
    if (!product) {
      throw new HTTPException(400, {
        message: 'Product not found',
      });
    }
    return product;
  }
}
