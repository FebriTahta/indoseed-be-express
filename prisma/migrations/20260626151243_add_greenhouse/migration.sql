-- CreateTable
CREATE TABLE `greenhouses` (
    `id` VARCHAR(191) NOT NULL,
    `kodeLahan` VARCHAR(191) NOT NULL,
    `namaLahan` VARCHAR(191) NOT NULL,
    `jenisLahan` VARCHAR(191) NOT NULL DEFAULT 'Greenhouse',
    `komoditasUtama` VARCHAR(191) NOT NULL,
    `komoditasColor` VARCHAR(191) NOT NULL DEFAULT 'emerald',
    `komoditasIcon` VARCHAR(191) NOT NULL DEFAULT 'ri-leaf-line',
    `lokasi` VARCHAR(191) NOT NULL,
    `luas` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `detailLokasi` TEXT NULL,
    `koordinat` VARCHAR(191) NULL,
    `petaniMitra` VARCHAR(191) NULL,
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `keterangan` TEXT NULL,
    `image` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `greenhouses_kodeLahan_key`(`kodeLahan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
