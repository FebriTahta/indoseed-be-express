-- DropForeignKey
ALTER TABLE `qc_daya_tumbuh` DROP FOREIGN KEY `qc_daya_tumbuh_commodityId_fkey`;

-- DropForeignKey
ALTER TABLE `qc_daya_tumbuh` DROP FOREIGN KEY `qc_daya_tumbuh_varietyId_fkey`;

-- DropForeignKey
ALTER TABLE `qc_kadar_air` DROP FOREIGN KEY `qc_kadar_air_commodityId_fkey`;

-- DropForeignKey
ALTER TABLE `qc_kadar_air` DROP FOREIGN KEY `qc_kadar_air_testMethodId_fkey`;

-- DropForeignKey
ALTER TABLE `qc_kadar_air` DROP FOREIGN KEY `qc_kadar_air_varietyId_fkey`;

-- DropForeignKey
ALTER TABLE `test_parameters` DROP FOREIGN KEY `test_parameters_standarId_fkey`;

-- DropIndex
DROP INDEX `test_parameters_standarId_fkey` ON `test_parameters`;

-- AlterTable
ALTER TABLE `test_parameters` DROP COLUMN `standarId`;

-- DropTable
DROP TABLE `qc_daya_tumbuh`;

-- DropTable
DROP TABLE `qc_kadar_air`;

-- CreateTable
CREATE TABLE `qc_tests` (
    `id` VARCHAR(191) NOT NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `jenisUji` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NULL,
    `varietyId` VARCHAR(191) NULL,
    `testMethodId` VARCHAR(191) NOT NULL,
    `tanggalUji` DATETIME(3) NULL,
    `petugasUjiId` VARCHAR(191) NULL,
    `lokasiLab` VARCHAR(191) NULL,
    `jumlahSampel` INTEGER NULL,
    `nilaiHasil` DOUBLE NULL,
    `batasAcuan` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Sedang Diuji',
    `sertifikat` VARCHAR(191) NULL,
    `detailUji` JSON NULL,
    `catatan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qc_tests_kodeBatch_testMethodId_key`(`kodeBatch`, `testMethodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_lampiran` (
    `id` VARCHAR(191) NOT NULL,
    `qcTestId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratorium` (
    `id` VARCHAR(191) NOT NULL,
    `kodeLaboratorium` VARCHAR(191) NOT NULL,
    `namaLaboratorium` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `alamat` TEXT NULL,
    `telepon` VARCHAR(191) NULL,
    `nomorAkreditasi` VARCHAR(191) NULL,
    `lembagaAkreditasi` VARCHAR(191) NULL,
    `tanggalAkreditasi` DATE NULL,
    `tanggalBerlakuAkreditasi` DATE NULL,
    `ruangLingkupPengujian` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `laboratorium_kodeLaboratorium_key`(`kodeLaboratorium`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penguji` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `kodePenguji` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `laboratoriumId` VARCHAR(191) NULL,
    `noTelepon` VARCHAR(191) NULL,
    `foto` TEXT NULL,
    `keterangan` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `penguji_userId_key`(`userId`),
    UNIQUE INDEX `penguji_kodePenguji_key`(`kodePenguji`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sertifikasi` (
    `id` VARCHAR(191) NOT NULL,
    `pengujiId` VARCHAR(191) NOT NULL,
    `namaSertifikasi` VARCHAR(191) NOT NULL,
    `berlakuHingga` DATETIME(3) NULL,
    `lampiranUrl` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penguji_test_methods` (
    `pengujiId` VARCHAR(191) NOT NULL,
    `testMethodId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`pengujiId`, `testMethodId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qc_tests` ADD CONSTRAINT `qc_tests_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_tests` ADD CONSTRAINT `qc_tests_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_tests` ADD CONSTRAINT `qc_tests_testMethodId_fkey` FOREIGN KEY (`testMethodId`) REFERENCES `test_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_tests` ADD CONSTRAINT `qc_tests_petugasUjiId_fkey` FOREIGN KEY (`petugasUjiId`) REFERENCES `penguji`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_lampiran` ADD CONSTRAINT `qc_lampiran_qcTestId_fkey` FOREIGN KEY (`qcTestId`) REFERENCES `qc_tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penguji` ADD CONSTRAINT `penguji_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penguji` ADD CONSTRAINT `penguji_laboratoriumId_fkey` FOREIGN KEY (`laboratoriumId`) REFERENCES `laboratorium`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sertifikasi` ADD CONSTRAINT `sertifikasi_pengujiId_fkey` FOREIGN KEY (`pengujiId`) REFERENCES `penguji`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penguji_test_methods` ADD CONSTRAINT `penguji_test_methods_pengujiId_fkey` FOREIGN KEY (`pengujiId`) REFERENCES `penguji`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penguji_test_methods` ADD CONSTRAINT `penguji_test_methods_testMethodId_fkey` FOREIGN KEY (`testMethodId`) REFERENCES `test_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

