-- AlterTable
ALTER TABLE `partners` ADD COLUMN `kelompokTaniId` VARCHAR(191) NULL,
    ADD COLUMN `penanggungJawabId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `penanggung_jawab` ADD COLUMN `areaModul` VARCHAR(191) NULL DEFAULT 'Produksi',
    ADD COLUMN `catatan` TEXT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `kodePersonel` VARCHAR(191) NULL,
    ADD COLUMN `lokasi` VARCHAR(191) NULL DEFAULT 'Semua Lokasi',
    ADD COLUMN `noHp` VARCHAR(191) NULL,
    ADD COLUMN `peran` VARCHAR(191) NULL DEFAULT 'Penanggung Jawab',
    ADD COLUMN `tanggalMulai` DATETIME(3) NULL,
    ADD COLUMN `tanggalSelesai` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `kelompok_tani` (
    `id` VARCHAR(191) NOT NULL,
    `kodeKelompok` VARCHAR(191) NOT NULL,
    `namaKelompok` VARCHAR(191) NOT NULL,
    `ketua` VARCHAR(191) NOT NULL,
    `noHpKetua` VARCHAR(191) NULL,
    `tahunBerdiri` VARCHAR(191) NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `desa` VARCHAR(191) NULL,
    `kecamatan` VARCHAR(191) NULL,
    `kabupaten` VARCHAR(191) NULL,
    `komoditasUtama` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NULL,
    `jumlahAnggota` INTEGER NOT NULL DEFAULT 0,
    `deskripsi` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `penanggungJawabId` VARCHAR(191) NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kelompok_tani_kodeKelompok_key`(`kodeKelompok`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `partners` ADD CONSTRAINT `partners_penanggungJawabId_fkey` FOREIGN KEY (`penanggungJawabId`) REFERENCES `penanggung_jawab`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partners` ADD CONSTRAINT `partners_kelompokTaniId_fkey` FOREIGN KEY (`kelompokTaniId`) REFERENCES `kelompok_tani`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelompok_tani` ADD CONSTRAINT `kelompok_tani_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelompok_tani` ADD CONSTRAINT `kelompok_tani_penanggungJawabId_fkey` FOREIGN KEY (`penanggungJawabId`) REFERENCES `penanggung_jawab`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

