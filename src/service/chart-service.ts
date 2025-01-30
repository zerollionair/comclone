import { ChartValidation } from '../validation/chart-validation';
import { prismaClient } from '../application/database';
import {
  AddChartRequest,
  ChartResponse,
  DeleteChartItemsRequest,
  UpdateChartItemsRequest,
} from '../model/chart-model';
import { HTTPException } from 'hono/http-exception';

export class ChartService {
  static async addToChart(request: AddChartRequest): Promise<ChartResponse> {
    request = ChartValidation.CREATE.parse(request);

    return prismaClient.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: request.items.productId,
        },
        select: {
          id: true,
          price: true,
          stock: true,
        },
      });

      if (!product) {
        throw new HTTPException(404, {
          message: `Product with id ${request.items.productId} not found`,
        });
      }

      if (product.stock < request.items.quantity) {
        throw new HTTPException(404, {
          message: `insufficient stock product with id ${product.id}`,
        });
      }

      await tx.product.update({
        where: { id: request.items.productId },
        data: {
          stock: {
            decrement: request.items.quantity,
          },
        },
      });

      const totalAmount = product.price * request.items.quantity;

      const existingChart = await tx.chart.upsert({
        where: {
          userId: request.userId,
        },
        update: { totalAmount: { increment: totalAmount } },
        create: {
          userId: request.userId,
          totalAmount: totalAmount,
        },
        select: {
          id: true,
        },
      });

      await tx.chartItem.upsert({
        where: {
          chartId: existingChart.id,
          productId: request.items.productId,
        },
        update: {
          quantity: { increment: request.items.quantity },
        },
        create: {
          chartId: existingChart.id,
          productId: request.items.productId,
          quantity: request.items.quantity,
        },
      });

      return {
        message: 'Success Add To Chart',
      };
    });
  }

  static async update(
    request: UpdateChartItemsRequest,
  ): Promise<ChartResponse> {
    request = ChartValidation.UPDATE.parse(request);

    return prismaClient.$transaction(async (tx) => {
      const chartItem = await tx.chartItem.findFirst({
        where: {
          chartId: request.chartId,
          productId: request.productId,
        },
        select: {
          quantity: true,
          products: {
            select: {
              id: true,
              stock: true,
            },
          },
        },
      });

      if (!chartItem) {
        throw new HTTPException(400, {
          message: `chart item with id ${request.chartId} not found`,
        });
      }

      console.log(chartItem);
      const quantityDelta = request.quantity - chartItem.quantity;

      if (quantityDelta > 0 && chartItem.products.stock < quantityDelta)
        throw new HTTPException(400, {
          message: `insufficient product with id ${request.productId}`,
        });

      await Promise.all([
        tx.chartItem.update({
          where: {
            chartId: request.chartId,
            productId: request.productId,
          },
          data: {
            quantity: request.quantity,
          },
        }),
        quantityDelta !== 0
          ? tx.product.update({
              where: {
                id: request.productId,
              },
              data: {
                stock:
                  quantityDelta > 0
                    ? {
                        decrement: quantityDelta,
                      }
                    : { increment: Math.abs(quantityDelta) },
              },
            })
          : Promise.resolve(),
      ]);

      const items = await tx.chartItem.findMany({
        where: {
          chartId: request.chartId,
        },
        select: {
          quantity: true,
          productId: true,
          products: {
            select: {
              price: true,
            },
          },
        },
      });

      const totalAmount = items.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0,
      );

      await tx.chart.update({
        where: {
          id: request.chartId,
        },
        data: {
          totalAmount: totalAmount,
        },
      });

      return {
        message: 'Chart Updated Successfully',
      };
    });
  }

  static async delete(
    request: DeleteChartItemsRequest,
  ): Promise<ChartResponse> {
    request = ChartValidation.DELETE.parse(request);

    return prismaClient.$transaction(async (tx) => {
      const returnStock = await tx.chartItem.findFirst({
        where: {
          chartId: request.chartId,
          productId: request.productId,
        },
        select: {
          quantity: true,
        },
      });

      if (!returnStock) {
        throw new HTTPException(400, { message: 'Chart item not found' });
      }

      const product = await tx.product.update({
        where: {
          id: request.productId,
        },
        data: {
          stock: {
            increment: returnStock.quantity,
          },
        },
      });

      await Promise.all([
        tx.chartItem.deleteMany({
          where: {
            chartId: request.chartId,
            productId: request.productId,
          },
        }),

        tx.chart.update({
          where: {
            id: request.chartId,
          },
          data: {
            totalAmount: { decrement: returnStock.quantity * product.price },
          },
        }),
      ]);

      return {
        message: 'Chart Deleted Successfully',
      };
    });
  }

  static async get(chartId: string): Promise<ChartResponse> {
    chartId = ChartValidation.GET.parse(chartId);

    const Items = await prismaClient.chartItem.findMany({
      where: {
        chartId: chartId,
      },
      select: {
        quantity: true,
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
        charts: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    return {
      message: 'List Items Successfull',
      totalAmount: Items.length > 0 ? Items[0].charts.totalAmount : 0,
      chartItems: Items.map((item) => ({
        productId: item.products.id,
        name: item.products.name,
        description: item.products.description,
        price: item.products.price,
        quantity: item.quantity,
      })),
    };
  }
}
