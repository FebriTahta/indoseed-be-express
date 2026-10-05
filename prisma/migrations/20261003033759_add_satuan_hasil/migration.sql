-- AlterTable
ALTER TABLE `commodities` ADD COLUMN `satuanHasil` VARCHAR(191) NULL DEFAULT 'Kg';

-- AlterTable
ALTER TABLE `greenhouses` ADD COLUMN `varietas` VARCHAR(191) NULL,
    ADD COLUMN `varietyId` VARCHAR(191) NULL,
    MODIFY `komoditasUtama` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `jadwal_tanam` ADD COLUMN `estimasiHasilPerHa` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `keterangan` TEXT NULL,
    ADD COLUMN `kodePetani` VARCHAR(191) NULL,
    ADD COLUMN `komoditas` VARCHAR(191) NULL,
    ADD COLUMN `namaPetani` VARCHAR(191) NULL,
    ADD COLUMN `partnerId` VARCHAR(191) NULL,
    ADD COLUMN `perencanaanProduksiId` VARCHAR(191) NULL,
    ADD COLUMN `varietas` VARCHAR(191) NULL,
    MODIFY `statusJadwal` VARCHAR(191) NOT NULL DEFAULT 'Dalam Proses';

-- AlterTable
ALTER TABLE `jadwal_tanam_detail` ADD COLUMN `estimasiPanen` DATETIME(3) NULL,
    ADD COLUMN `keterangan` TEXT NULL,
    ADD COLUMN `kodeLahan` VARCHAR(191) NULL,
    ADD COLUMN `komoditasVarietas` VARCHAR(191) NULL,
    ADD COLUMN `rencanaTanam` DATETIME(3) NULL,
    ADD COLUMN `statusLahan` VARCHAR(191) NULL DEFAULT 'Siap Tanam',
    ADD COLUMN `targetProduksi` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `panen` ADD COLUMN `beratBruto` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `beratNetto` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `blokLahan` VARCHAR(191) NULL,
    ADD COLUMN `dokumentasi` JSON NULL,
    ADD COLUMN `jenisHasil` VARCHAR(191) NULL DEFAULT 'Glondong / Buah',
    ADD COLUMN `jumlahBuah` INTEGER NULL DEFAULT 0,
    ADD COLUMN `kodeJadwalTanam` VARCHAR(191) NULL,
    ADD COLUMN `kondisiHasil` VARCHAR(191) NULL DEFAULT 'Baik',
    ADD COLUMN `perkiraanHasil` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `petani` VARCHAR(191) NULL,
    ADD COLUMN `petaniKode` VARCHAR(191) NULL,
    ADD COLUMN `rencanaPanen` DATETIME(3) NULL,
    ADD COLUMN `statusPengolahan` VARCHAR(191) NULL DEFAULT 'Menunggu Pengolahan',
    MODIFY `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin Produksi',
    MODIFY `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin Produksi';

-- AlterTable
ALTER TABLE `partners` ADD COLUMN `atasNama` VARCHAR(191) NULL,
    ADD COLUMN `catatan` TEXT NULL,
    ADD COLUMN `commodityId` VARCHAR(191) NULL,
    ADD COLUMN `dokumen` TEXT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `namaBank` VARCHAR(191) NULL,
    ADD COLUMN `noRekening` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `test_methods` ADD COLUMN `alatDigunakan` TEXT NULL,
    ADD COLUMN `catatan` TEXT NULL,
    ADD COLUMN `jenisUji` VARCHAR(191) NULL,
    ADD COLUMN `komoditas` VARCHAR(191) NULL,
    ADD COLUMN `tanggalBerlaku` DATETIME(3) NULL,
    ADD COLUMN `versiMetode` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `pemeriksaan_lahan` (
    `id` VARCHAR(191) NOT NULL,
    `noPemeriksaan` VARCHAR(191) NOT NULL,
    `pemeriksaanKe` INTEGER NOT NULL DEFAULT 1,
    `jadwalTanamId` VARCHAR(191) NULL,
    `kodeJadwalTanam` VARCHAR(191) NOT NULL,
    `tanggalPemeriksaan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `petani` VARCHAR(191) NOT NULL,
    `lahan` VARCHAR(191) NOT NULL,
    `fase` VARCHAR(191) NOT NULL DEFAULT 'Vegetatif',
    `petugasQc` VARCHAR(191) NOT NULL,
    `persentaseKemurnian` DOUBLE NOT NULL DEFAULT 100.0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Memenuhi',
    `jumlahTanamanDiamati` INTEGER NOT NULL DEFAULT 1000,
    `tanamanSesuai` INTEGER NOT NULL DEFAULT 1000,
    `tanamanOffType` INTEGER NOT NULL DEFAULT 0,
    `keterangan` VARCHAR(191) NULL DEFAULT 'Memenuhi standar',
    `catatan` TEXT NULL,
    `temuanOffType` JSON NULL,
    `dokumentasi` JSON NULL,
    `roguingData` JSON NULL,
    `riwayatData` JSON NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pemeriksaan_lahan_noPemeriksaan_key`(`noPemeriksaan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perencanaan_produksi` (
    `id` VARCHAR(191) NOT NULL,
    `noPerencanaan` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietyId` VARCHAR(191) NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `targetProduksi` DOUBLE NOT NULL DEFAULT 0,
    `aktualProduksi` DOUBLE NOT NULL DEFAULT 0,
    `produksiTerpenuhi` DOUBLE NOT NULL DEFAULT 0,
    `targetLuasLahan` DOUBLE NOT NULL DEFAULT 0,
    `lahanTersedia` DOUBLE NOT NULL DEFAULT 0,
    `realisasiTanam` DOUBLE NOT NULL DEFAULT 0,
    `periode` VARCHAR(191) NOT NULL,
    `periodeMulai` DATETIME(3) NULL,
    `periodeSelesai` DATETIME(3) NULL,
    `metodeTanam` VARCHAR(191) NOT NULL DEFAULT 'Pindah Tanam',
    `kebutuhanBenih` DOUBLE NOT NULL DEFAULT 0,
    `estimasiHasilPerHa` DOUBLE NOT NULL DEFAULT 0,
    `partnerId` VARCHAR(191) NULL,
    `namaPetani` VARCHAR(191) NULL,
    `greenhouseId` VARCHAR(191) NULL,
    `namaLahan` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `catatan` TEXT NULL,
    `estimasiPanen` VARCHAR(191) NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `perencanaan_produksi_noPerencanaan_key`(`noPerencanaan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perencanaan_produksi_petani` (
    `id` VARCHAR(191) NOT NULL,
    `perencanaanProduksiId` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NULL,
    `namaPetani` VARCHAR(191) NOT NULL,
    `greenhouseId` VARCHAR(191) NULL,
    `namaLahan` VARCHAR(191) NULL,
    `luasLahan` DOUBLE NOT NULL DEFAULT 0,
    `targetProduksi` DOUBLE NOT NULL DEFAULT 0,
    `tanggalTanam` DATETIME(3) NULL,
    `tanggalPanen` DATETIME(3) NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_parameters` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `namaModul` VARCHAR(191) NOT NULL DEFAULT 'UMUM',
    `tipeNilai` VARCHAR(191) NOT NULL DEFAULT 'NUMBER',
    `satuan` VARCHAR(191) NULL,
    `batasLulus` DOUBLE NULL,
    `deskripsi` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `master_parameters_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_parameter_options` (
    `id` VARCHAR(191) NOT NULL,
    `parameterId` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `bobot` DOUBLE NOT NULL DEFAULT 0,
    `urutan` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `master_parameter_options_parameterId_kode_key`(`parameterId`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variety_parameters` (
    `id` VARCHAR(191) NOT NULL,
    `varietyId` VARCHAR(191) NOT NULL,
    `parameterId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NULL,
    `nilaiNumber` DOUBLE NULL,
    `nilaiText` VARCHAR(191) NULL,
    `operator` VARCHAR(191) NULL,
    `nilaiMin` DOUBLE NULL,
    `nilaiMax` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `variety_parameters_parameterId_fkey`(`parameterId`),
    INDEX `variety_parameters_varietyId_fkey`(`varietyId`),
    UNIQUE INDEX `variety_parameters_varietyId_parameterId_key`(`varietyId`, `parameterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `harvest_types` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `varietyId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `harvest_types_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `harvest_type_prices` (
    `id` VARCHAR(191) NOT NULL,
    `harvestTypeId` VARCHAR(191) NOT NULL,
    `harga` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kontrak_panens` (
    `id` VARCHAR(191) NOT NULL,
    `noKontrak` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietyId` VARCHAR(191) NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `tipePanenan` VARCHAR(191) NOT NULL DEFAULT 'Glondong / Fresh',
    `nilaiKontrak` DOUBLE NOT NULL DEFAULT 0,
    `feeKelompok` DOUBLE NULL DEFAULT 0,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'Kg',
    `umurPanen` INTEGER NOT NULL DEFAULT 0,
    `periodeMulai` DATETIME(3) NULL,
    `periodeSelesai` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `keterangan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kontrak_panens_noKontrak_key`(`noKontrak`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persetujuan_produksi` (
    `id` VARCHAR(191) NOT NULL,
    `noPengajuan` VARCHAR(191) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL DEFAULT 'Jadwal Tanam',
    `judul` VARCHAR(191) NOT NULL,
    `pengaju` VARCHAR(191) NOT NULL DEFAULT 'Petugas Produksi',
    `tanggalPengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Proses',
    `alasanRevisi` TEXT NULL,
    `catatanReview` TEXT NULL,
    `disetujuiOleh` VARCHAR(191) NULL,
    `tanggalPersetujuan` DATETIME(3) NULL,
    `lampiranFile` TEXT NULL,
    `lampiranSize` VARCHAR(191) NULL,
    `jadwalTanamId` VARCHAR(191) NULL,
    `dataSebelumnya` JSON NULL,
    `dataPengajuan` JSON NULL,
    `riwayatFlow` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `persetujuan_produksi_noPengajuan_key`(`noPengajuan`),
    UNIQUE INDEX `persetujuan_produksi_jadwalTanamId_key`(`jadwalTanamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penanggung_jawab` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `greenhouses` ADD CONSTRAINT `greenhouses_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partners` ADD CONSTRAINT `partners_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam` ADD CONSTRAINT `jadwal_tanam_perencanaanProduksiId_fkey` FOREIGN KEY (`perencanaanProduksiId`) REFERENCES `perencanaan_produksi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam` ADD CONSTRAINT `jadwal_tanam_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `panen` ADD CONSTRAINT `panen_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pemeriksaan_lahan` ADD CONSTRAINT `pemeriksaan_lahan_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi` ADD CONSTRAINT `perencanaan_produksi_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi` ADD CONSTRAINT `perencanaan_produksi_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi` ADD CONSTRAINT `perencanaan_produksi_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi` ADD CONSTRAINT `perencanaan_produksi_greenhouseId_fkey` FOREIGN KEY (`greenhouseId`) REFERENCES `greenhouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi_petani` ADD CONSTRAINT `fk_dist_perencanaan` FOREIGN KEY (`perencanaanProduksiId`) REFERENCES `perencanaan_produksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi_petani` ADD CONSTRAINT `fk_dist_partner` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_produksi_petani` ADD CONSTRAINT `fk_dist_greenhouse` FOREIGN KEY (`greenhouseId`) REFERENCES `greenhouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_parameter_options` ADD CONSTRAINT `master_parameter_options_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `master_parameters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variety_parameters` ADD CONSTRAINT `variety_parameters_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variety_parameters` ADD CONSTRAINT `variety_parameters_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `master_parameters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variety_parameters` ADD CONSTRAINT `variety_parameters_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `master_parameter_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `harvest_types` ADD CONSTRAINT `harvest_types_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `harvest_type_prices` ADD CONSTRAINT `harvest_type_prices_harvestTypeId_fkey` FOREIGN KEY (`harvestTypeId`) REFERENCES `harvest_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontrak_panens` ADD CONSTRAINT `kontrak_panens_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontrak_panens` ADD CONSTRAINT `kontrak_panens_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `persetujuan_produksi` ADD CONSTRAINT `persetujuan_produksi_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
