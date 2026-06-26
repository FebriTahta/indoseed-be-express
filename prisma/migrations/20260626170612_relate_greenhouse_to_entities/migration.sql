-- AlterTable
ALTER TABLE `greenhouses` ADD COLUMN `commodityId` VARCHAR(191) NULL,
    ADD COLUMN `partnerId` VARCHAR(191) NULL,
    ADD COLUMN `varietyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `greenhouses` ADD CONSTRAINT `greenhouses_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `greenhouses` ADD CONSTRAINT `greenhouses_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `greenhouses` ADD CONSTRAINT `greenhouses_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
