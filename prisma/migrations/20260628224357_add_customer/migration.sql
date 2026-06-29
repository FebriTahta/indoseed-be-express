-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(191) NOT NULL,
    `kodeCust` VARCHAR(191) NOT NULL,
    `namaCust` VARCHAR(191) NOT NULL,
    `pic` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `NPWP` VARCHAR(191) NULL,
    `noTelepon` VARCHAR(191) NULL,
    `kota` VARCHAR(191) NOT NULL,
    `kodePos` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `isTop` BOOLEAN NOT NULL DEFAULT false,
    `limitKredit` DOUBLE NOT NULL DEFAULT 0.0,
    `remainKredit` DOUBLE NOT NULL DEFAULT 0.0,
    `tglBergabung` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `tglDiubah` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_kodeCust_key`(`kodeCust`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
