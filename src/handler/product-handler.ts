import { Hono } from 'hono';
import {
  CreateProductRequest,
  DeleteProductRequest,
  FilterProductRequest,
  SearchProductRequest,
  UpdateProductRequest,
} from '../model/product-model';
import { ProductService } from '../service/product-service';

export const productHandler = new Hono();

productHandler.post('products', async (c) => {
  const request = (await c.req.json()) as CreateProductRequest;
  const response = await ProductService.create(request);

  return c.json({
    data: response,
  });
});
productHandler.put('products/:id', async (c) => {
  const request = (await c.req.json()) as UpdateProductRequest;
  request.id = String(c.req.param('id'));

  const response = await ProductService.update(request);

  return c.json({
    data: response,
  });
});
productHandler.delete('products/:id', async (c) => {
  const request = String(c.req.param('id'));
  const response = await ProductService.delete(request);

  return c.json({
    data: response,
  });
});
productHandler.get('products/:id', async (c) => {
  const request = String(c.req.param('id'));

  const response = await ProductService.getById(request);

  return c.json({
    data: response,
  });
});

productHandler.get('products-search', async (c) => {
  const request: SearchProductRequest = {
    name: c.req.query('name'),
    price: c.req.query('price')
      ? Number(c.req.query('price')) || undefined
      : undefined,
    page: c.req.query('page') ? Number(c.req.query('page')) : 1,
    size: c.req.query('size') ? Number(c.req.query('size')) : 10,
  };
  const response = await ProductService.search(request);

  return c.json({
    data: response,
  });
});

productHandler.get('products-filter', async (c) => {
  const request: FilterProductRequest = {
    name: c.req.query('name') || undefined,
    category: c.req.query('category') || undefined,
    minPrice: c.req.query('minPrice')
      ? Number(c.req.query('minPrice'))
      : undefined,
    maxPrice: c.req.query('maxPrice')
      ? Number(c.req.query('maxPrice'))
      : undefined,
    inStock: c.req.query('inStock')
      ? c.req.query('inStock') === 'true'
      : undefined,
    page: c.req.query('page') ? Number(c.req.query('page')) : 1,
    size: c.req.query('size') ? Number(c.req.query('size')) : 10,
  };

  const response = await ProductService.filter(request);

  return c.json({
    data: response,
  });
});
