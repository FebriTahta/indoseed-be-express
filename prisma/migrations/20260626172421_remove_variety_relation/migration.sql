/*
  Warnings:

  - You are about to drop the column `varietyId` on the `greenhouses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `greenhouses` DROP FOREIGN KEY `greenhouses_varietyId_fkey`;

-- DropIndex
DROP INDEX `greenhouses_varietyId_fkey` ON `greenhouses`;

-- AlterTable
ALTER TABLE `greenhouses` DROP COLUMN `varietyId`;
