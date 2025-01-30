export type AddChartRequest = {
  userId: string;
  items: ChartItems;
};
type ChartItems = {
  productId: string;
  quantity: number;
};

export type ChartResponse = {
  message?: string;
  totalAmount?: number;
  chartItems?: ChartItemsResponse[];
};

type ChartItemsResponse = {
  productId: string;
  name: string;
  price: number;
  description: String;
  quantity: number;
};

export type UpdateChartItemsRequest = {
  chartId: string;
  productId: string;
  quantity: number;
};

export type DeleteChartItemsRequest = {
  chartId: string;
  productId: string;
};
