/*
  Warnings:

  - You are about to drop the column `isBan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isBan",
DROP COLUMN "refreshToken",
ADD COLUMN     "blacklist" BOOLEAN NOT NULL DEFAULT false;
