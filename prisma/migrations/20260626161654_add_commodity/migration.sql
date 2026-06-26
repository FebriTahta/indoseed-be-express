-- CreateTable
CREATE TABLE `commodities` (
    `id` VARCHAR(191) NOT NULL,
    `kodeKomoditas` VARCHAR(191) NOT NULL,
    `namaKomoditas` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `image` TEXT NULL,
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `tglDiubah` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `commodities_kodeKomoditas_key`(`kodeKomoditas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
