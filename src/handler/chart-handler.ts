import { Hono } from 'hono';
import {
  AddChartRequest,
  DeleteChartItemsRequest,
  UpdateChartItemsRequest,
} from '../model/chart-model';
import { ChartService } from '../service/chart-service';

export const chartHandler = new Hono();

chartHandler.post('chart', async (c) => {
  const payload = c.get('jwtPayload');
  const request = (await c.req.json()) as AddChartRequest;
  request.userId = payload.id;

  const response = await ChartService.addToChart(request);

  return c.json({
    data: response,
  });
});

chartHandler.put('chart/:chartId/product/:productId', async (c) => {
  const request = (await c.req.json()) as UpdateChartItemsRequest;
  request.chartId = String(c.req.param('chartId'));
  request.productId = String(c.req.param('productId'));

  const response = await ChartService.update(request);

  return c.json({
    data: response,
  });
});

chartHandler.delete('chart/:chartId/product/:productId', async (c) => {
  const request = {} as DeleteChartItemsRequest;
  request.chartId = String(c.req.param('chartId'));
  request.productId = String(c.req.param('productId'));

  const response = await ChartService.delete(request);

  return c.json({
    data: response,
  });
});

chartHandler.get('chart/:chartId/products', async (c) => {
  const request = String(c.req.param('chartId'));
  const response = await ChartService.get(request);

  return c.json({
    data: response,
  });
});
