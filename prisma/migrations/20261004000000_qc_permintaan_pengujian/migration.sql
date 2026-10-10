-- AlterTable
ALTER TABLE `test_methods` ADD COLUMN `tipe` VARCHAR(191) NULL,
    ADD COLUMN `varietas` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `test_method_documents` (
    `id` VARCHAR(191) NOT NULL,
    `testMethodId` VARCHAR(191) NOT NULL,
    `namaFile` VARCHAR(191) NOT NULL,
    `fileUrl` TEXT NOT NULL,
    `tipeFile` VARCHAR(191) NULL,
    `ukuran` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permintaan_pengujian` (
    `id` VARCHAR(191) NOT NULL,
    `noPermintaan` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `kodeBatch` VARCHAR(191) NOT NULL,
    `batchProduksiId` VARCHAR(191) NULL,
    `komoditas` VARCHAR(191) NULL,
    `varietas` VARCHAR(191) NULL,
    `tipe` VARCHAR(191) NULL DEFAULT 'QC / Benih',
    `petani` VARCHAR(191) NULL,
    `lahan` VARCHAR(191) NULL,
    `panen` VARCHAR(191) NULL,
    `jumlahSampel` DOUBLE NULL DEFAULT 0,
    `satuanSampel` VARCHAR(191) NULL DEFAULT 'gram',
    `metodeSampling` VARCHAR(191) NULL DEFAULT 'sop',
    `pengambilSampel` VARCHAR(191) NULL DEFAULT 'Andi Pratama',
    `pemohon` VARCHAR(191) NOT NULL DEFAULT 'produksi',
    `prioritas` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Menunggu Persetujuan',
    `catatan` TEXT NULL,
    `fileLampiranUrl` TEXT NULL,
    `fileLampiranNama` VARCHAR(191) NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permintaan_pengujian_noPermintaan_key`(`noPermintaan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permintaan_pengujian_parameters` (
    `id` VARCHAR(191) NOT NULL,
    `permintaanId` VARCHAR(191) NOT NULL,
    `parameterId` VARCHAR(191) NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NULL,
    `metodeId` VARCHAR(191) NULL,
    `metode` VARCHAR(191) NULL,
    `metodeKode` VARCHAR(191) NULL,
    `metodeNama` VARCHAR(191) NULL,
    `standar` VARCHAR(191) NULL,
    `satuan` VARCHAR(191) NULL,
    `checked` BOOLEAN NOT NULL DEFAULT true,
    `definisi` TEXT NULL,
    `keterangan` TEXT NULL,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permintaan_pengujian_dokumen` (
    `id` VARCHAR(191) NOT NULL,
    `permintaanId` VARCHAR(191) NOT NULL,
    `namaFile` VARCHAR(191) NOT NULL,
    `fileUrl` TEXT NOT NULL,
    `tipeFile` VARCHAR(191) NULL,
    `ukuran` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `test_method_documents` ADD CONSTRAINT `test_method_documents_testMethodId_fkey` FOREIGN KEY (`testMethodId`) REFERENCES `test_methods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian` ADD CONSTRAINT `permintaan_pengujian_batchProduksiId_fkey` FOREIGN KEY (`batchProduksiId`) REFERENCES `batch_produksi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian_parameters` ADD CONSTRAINT `permintaan_pengujian_parameters_permintaanId_fkey` FOREIGN KEY (`permintaanId`) REFERENCES `permintaan_pengujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian_parameters` ADD CONSTRAINT `permintaan_pengujian_parameters_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `test_parameters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian_parameters` ADD CONSTRAINT `permintaan_pengujian_parameters_metodeId_fkey` FOREIGN KEY (`metodeId`) REFERENCES `test_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permintaan_pengujian_dokumen` ADD CONSTRAINT `permintaan_pengujian_dokumen_permintaanId_fkey` FOREIGN KEY (`permintaanId`) REFERENCES `permintaan_pengujian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

