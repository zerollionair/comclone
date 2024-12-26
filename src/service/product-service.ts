import {
  CreateProductRequest,
  DeleteProductRequest,
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

  static async delete(request: DeleteProductRequest): Promise<boolean> {
    request = ProductValidation.DELETE.parse(request);
    await this.ProductMustExist(request.id);

    await prismaClient.product.delete({
      where: {
        id: request.id,
      },
    });
    return true;
  }

  static async search(
    request: SearchProductRequest,
  ): Promise<Pageable<ProductResponse>> {
    request = ProductValidation.SEARCH.parse(request);
  }

  static async ProductMustExist(productId: string): Promise<Product> {
    const product = await prismaClient.product.findFirst({
      where: {
        id: productId,
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
