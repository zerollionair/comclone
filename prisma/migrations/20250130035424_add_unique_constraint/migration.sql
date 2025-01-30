/*
  Warnings:

  - You are about to drop the column `price` on the `ChartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chartId]` on the table `ChartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `ChartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChartItem" DROP COLUMN "price";

-- CreateIndex
CREATE UNIQUE INDEX "ChartItem_chartId_key" ON "ChartItem"("chartId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartItem_productId_key" ON "ChartItem"("productId");
