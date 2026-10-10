-- AlterTable
ALTER TABLE `permintaan_pengujian` ADD COLUMN `alasanPenolakan` TEXT NULL,
    ADD COLUMN `catatanPengujian` TEXT NULL,
    ADD COLUMN `catatanReview` TEXT NULL,
    ADD COLUMN `direviewOleh` VARCHAR(191) NULL,
    ADD COLUMN `disetujuiOleh` VARCHAR(191) NULL,
    ADD COLUMN `hasilAkhir` VARCHAR(191) NULL,
    ADD COLUMN `kondisiSampel` VARCHAR(191) NULL,
    ADD COLUMN `laboratoriumId` VARCHAR(191) NULL,
    ADD COLUMN `noPengujian` VARCHAR(191) NULL,
    ADD COLUMN `noSampel` VARCHAR(191) NULL,
    ADD COLUMN `pengambilSampelId` VARCHAR(191) NULL,
    ADD COLUMN `petugasQcId` VARCHAR(191) NULL,
    ADD COLUMN `rekomendasi` VARCHAR(191) NULL,
    ADD COLUMN `tanggalDisetujui` DATETIME(3) NULL,
    ADD COLUMN `tanggalMulaiUji` DATETIME(3) NULL,
    ADD COLUMN `tanggalReview` DATETIME(3) NULL,
    ADD COLUMN `tanggalSampling` DATETIME(3) NULL,
    ADD COLUMN `tanggalSelesaiUji` DATETIME(3) NULL,
    ALTER COLUMN `pengambilSampel` DROP DEFAULT;

-- AlterTable
ALTER TABLE `permintaan_pengujian_dokumen` ADD COLUMN `diunggahOleh` VARCHAR(191) NULL,
    ADD COLUMN `kategori` VARCHAR(191) NOT NULL DEFAULT 'Permintaan',
    ADD COLUMN `keterangan` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `permintaan_pengujian_parameters` ADD COLUMN `batasAcuan` VARCHAR(191) NULL,
    ADD COLUMN `catatanHasil` TEXT NULL,
    ADD COLUMN `diujiOleh` VARCHAR(191) NULL,
    ADD COLUMN `hasilTeks` VARCHAR(191) NULL,
    ADD COLUMN `nilaiHasil` DOUBLE NULL,
    ADD COLUMN `statusHasil` VARCHAR(191) NULL,
    ADD COLUMN `tanggalUji` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `permintaan_pengujian_riwayat` (
    `id` VARCHAR(191) NOT NULL,
    `permintaanId` VARCHAR(191) NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `statusDari` VARCHAR(191) NULL,
    `statusKe` VARCHAR(191) NULL,
    `keterangan` TEXT NULL,
    `oleh` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `permintaan_pengujian_riwayat_permintaanId_idx`(`permintaanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_method_riwayat` (
    `id` VARCHAR(191) NOT NULL,
    `testMethodId` VARCHAR(191) NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `keterangan` TEXT NULL,
    `oleh` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `test_method_riwayat_testMethodId_idx`(`testMethodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_lookups` (
    `id` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `urutan` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `qc_lookups_kategori_status_idx`(`kategori`, `status`),
    UNIQUE INDEX `qc_lookups_kategori_kode_key`(`kategori`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `permintaan_pengujian_noPengujian_key` ON `permintaan_pengujian`(`noPengujian`);

-- CreateIndex
CREATE UNIQUE INDEX `permintaan_pengujian_noSampel_key` ON `permintaan_pengujian`(`noSampel`);

-- CreateIndex
CREATE INDEX `permintaan_pengujian_status_idx` ON `permintaan_pengujian`(`status`);

-- CreateIndex
CREATE INDEX `permintaan_pengujian_kodeBatch_idx` ON `permintaan_pengujian`(`kodeBatch`);

-- AddForeignKey
ALTER TABLE `permintaan_pengujian` ADD CONSTRAINT `permintaan_pengujian_pengambilSampelId_fkey` FOREIGN KEY (`pengambilSampelId`) REFERENCES `penguji`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian` ADD CONSTRAINT `permintaan_pengujian_petugasQcId_fkey` FOREIGN KEY (`petugasQcId`) REFERENCES `penguji`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian` ADD CONSTRAINT `permintaan_pengujian_laboratoriumId_fkey` FOREIGN KEY (`laboratoriumId`) REFERENCES `laboratorium`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian_riwayat` ADD CONSTRAINT `permintaan_pengujian_riwayat_permintaanId_fkey` FOREIGN KEY (`permintaanId`) REFERENCES `permintaan_pengujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_method_riwayat` ADD CONSTRAINT `test_method_riwayat_testMethodId_fkey` FOREIGN KEY (`testMethodId`) REFERENCES `test_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

