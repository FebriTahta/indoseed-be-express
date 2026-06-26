-- CreateTable
CREATE TABLE `partners` (
    `id` VARCHAR(191) NOT NULL,
    `kodePetani` VARCHAR(191) NOT NULL,
    `namaPetani` VARCHAR(191) NOT NULL,
    `kelompokTani` VARCHAR(191) NOT NULL,
    `komoditasUtama` VARCHAR(191) NOT NULL,
    `noKtp` VARCHAR(191) NULL,
    `noTelepon` VARCHAR(191) NULL,
    `alamat` TEXT NULL,
    `luasLahan` DOUBLE NOT NULL DEFAULT 0.0,
    `pengalaman` INTEGER NOT NULL DEFAULT 0,
    `tglBergabung` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `image` TEXT NULL,
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `tglDiubah` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `partners_kodePetani_key`(`kodePetani`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
