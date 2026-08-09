/*
  Warnings:

  - You are about to drop the column `tglDibuat` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `tglDiubah` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `alamat` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `tglDiubah` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the `gudangs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customers` DROP COLUMN `tglDibuat`,
    DROP COLUMN `tglDiubah`,
    MODIFY `pic` VARCHAR(191) NULL,
    MODIFY `kota` VARCHAR(191) NULL,
    MODIFY `alamat` TEXT NULL,
    MODIFY `tglBergabung` DATETIME(3) NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `suppliers` DROP COLUMN `alamat`,
    DROP COLUMN `tglDiubah`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `gudangs`;

-- CreateTable
CREATE TABLE `reference_standards` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL DEFAULT 'Standar Acuan',
    `organisasi` VARCHAR(191) NULL,
    `versiTahun` VARCHAR(191) NULL,
    `kategori` VARCHAR(191) NULL,
    `deskripsi` TEXT NULL,
    `fileUrl` TEXT NULL,
    `bahasa` VARCHAR(191) NULL,
    `catatan` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `documentId` VARCHAR(191) NULL,

    UNIQUE INDEX `reference_standards_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_methods` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `standarId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `documentId` VARCHAR(191) NULL,

    UNIQUE INDEX `test_methods_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_parameters` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NULL,
    `satuan` VARCHAR(191) NULL,
    `batasAcuan` VARCHAR(191) NULL,
    `definisi` TEXT NULL,
    `keterangan` TEXT NULL,
    `metodeId` VARCHAR(191) NULL,
    `standarId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `test_parameters_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_documents` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `jenisDokumen` VARCHAR(191) NULL,
    `versi` VARCHAR(191) NULL,
    `tanggalBerlaku` DATETIME(3) NULL,
    `deskripsi` TEXT NULL,
    `tipeFile` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `fileSize` VARCHAR(191) NULL,
    `fileUrl` TEXT NULL,
    `tingkatAkses` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `catatan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `support_documents_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_certificates` (
    `id` VARCHAR(191) NOT NULL,
    `noSertifikat` VARCHAR(191) NOT NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `parameter` TEXT NULL,
    `tglUji` DATETIME(3) NULL,
    `tglTerbit` DATETIME(3) NULL,
    `berlakuHingga` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Menunggu',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qc_certificates_noSertifikat_key`(`noSertifikat`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_daya_tumbuh` (
    `id` VARCHAR(191) NOT NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NULL,
    `varietyId` VARCHAR(191) NULL,
    `tanggalUji` DATETIME(3) NULL,
    `petugasUji` VARCHAR(191) NULL,
    `metodeUji` VARCHAR(191) NULL,
    `jumlahSampel` INTEGER NULL,
    `dayaTumbuh` DOUBLE NULL,
    `batasMinimal` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Sedang Diuji',
    `sertifikat` VARCHAR(191) NULL,
    `jumlahBenihDitanam` INTEGER NULL,
    `jumlahBerkecambah` INTEGER NULL,
    `jumlahTidakBerkecambah` INTEGER NULL,
    `waktuUjiHari` INTEGER NULL,
    `suhuUji` VARCHAR(191) NULL,
    `mediaUji` VARCHAR(191) NULL,
    `kelembabanMedia` VARCHAR(191) NULL,
    `catatan` TEXT NULL,
    `parameterUji` TEXT NULL,
    `lampiranUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qc_daya_tumbuh_kodeBatch_key`(`kodeBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_kadar_air` (
    `id` VARCHAR(191) NOT NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NULL,
    `varietyId` VARCHAR(191) NULL,
    `testMethodId` VARCHAR(191) NULL,
    `lotNumber` VARCHAR(191) NULL,
    `tanggalUji` DATETIME(3) NULL,
    `lokasiLab` VARCHAR(191) NULL,
    `petugasUji` VARCHAR(191) NULL,
    `jumlahSampel` INTEGER NULL,
    `kadarAir` DOUBLE NULL,
    `batasMaksimal` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Sedang Diuji',
    `sertifikat` VARCHAR(191) NULL,
    `alat` VARCHAR(191) NULL,
    `suhuUji` VARCHAR(191) NULL,
    `waktuPengeringan` VARCHAR(191) NULL,
    `ulangan` VARCHAR(191) NULL,
    `beratAwal` DOUBLE NULL,
    `beratAkhir` DOUBLE NULL,
    `catatan` TEXT NULL,
    `parameterUji` TEXT NULL,
    `lampiranUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qc_kadar_air_kodeBatch_key`(`kodeBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gudang` (
    `id` VARCHAR(191) NOT NULL,
    `kodeGudang` VARCHAR(191) NOT NULL,
    `namaGudang` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `tglDibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gudang_kodeGudang_key`(`kodeGudang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `namaWebsite` VARCHAR(191) NOT NULL,
    `titleWebsite` VARCHAR(191) NOT NULL,
    `logoWebsite` TEXT NULL,
    `logoColor` VARCHAR(191) NULL DEFAULT '#11b238',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reference_standards` ADD CONSTRAINT `reference_standards_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `support_documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_methods` ADD CONSTRAINT `test_methods_standarId_fkey` FOREIGN KEY (`standarId`) REFERENCES `reference_standards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_methods` ADD CONSTRAINT `test_methods_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `support_documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_parameters` ADD CONSTRAINT `test_parameters_metodeId_fkey` FOREIGN KEY (`metodeId`) REFERENCES `test_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_parameters` ADD CONSTRAINT `test_parameters_standarId_fkey` FOREIGN KEY (`standarId`) REFERENCES `reference_standards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_daya_tumbuh` ADD CONSTRAINT `qc_daya_tumbuh_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_daya_tumbuh` ADD CONSTRAINT `qc_daya_tumbuh_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_kadar_air` ADD CONSTRAINT `qc_kadar_air_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_kadar_air` ADD CONSTRAINT `qc_kadar_air_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_kadar_air` ADD CONSTRAINT `qc_kadar_air_testMethodId_fkey` FOREIGN KEY (`testMethodId`) REFERENCES `test_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
