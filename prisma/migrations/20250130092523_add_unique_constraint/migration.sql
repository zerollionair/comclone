/*
  Warnings:

  - A unique constraint covering the columns `[chartId]` on the table `ChartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChartItem_chartId_key" ON "ChartItem"("chartId");
