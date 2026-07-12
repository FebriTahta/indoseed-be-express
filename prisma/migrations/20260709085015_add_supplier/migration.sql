-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(191) NOT NULL,
    `kodeSupplier` VARCHAR(191) NOT NULL,
    `namaSupplier` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `tglDiubah` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',

    UNIQUE INDEX `suppliers_kodeSupplier_key`(`kodeSupplier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
