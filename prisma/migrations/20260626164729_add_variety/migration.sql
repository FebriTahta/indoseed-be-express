-- CreateTable
CREATE TABLE `varieties` (
    `id` VARCHAR(191) NOT NULL,
    `kodeVarietas` VARCHAR(191) NOT NULL,
    `namaVarietas` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NOT NULL,
    `asalPemulia` VARCHAR(191) NULL,
    `tahunRilis` INTEGER NULL,
    `deskripsi` TEXT NULL,
    `umurTanam` VARCHAR(191) NULL,
    `tinggiTanaman` VARCHAR(191) NULL,
    `bentukBiji` VARCHAR(191) NULL,
    `warnaGabah` VARCHAR(191) NULL,
    `potensiHasil` VARCHAR(191) NULL,
    `anjuranDataran` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `image` TEXT NULL,
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `tglDiubah` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `varieties_kodeVarietas_key`(`kodeVarietas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `varieties` ADD CONSTRAINT `varieties_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
