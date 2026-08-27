-- AlterTable
ALTER TABLE `customers` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `gudang` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `suppliers` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `jadwal_tanam` (
    `id` VARCHAR(191) NOT NULL,
    `kodeJadwalTanam` VARCHAR(191) NOT NULL,
    `periodeTanam` VARCHAR(191) NULL,
    `periodeTanamMulai` DATETIME(3) NULL,
    `periodeTanamSelesai` DATETIME(3) NULL,
    `musimTanam` VARCHAR(191) NULL,
    `tujuanProduksi` VARCHAR(191) NULL,
    `tipeProduksi` VARCHAR(191) NULL,
    `statusJadwal` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `penanggungJawab` VARCHAR(191) NULL,
    `deskripsi` TEXT NULL,
    `greenhouseId` VARCHAR(191) NULL,
    `commodityId` VARCHAR(191) NULL,
    `varietyId` VARCHAR(191) NULL,
    `luasTanam` DOUBLE NOT NULL DEFAULT 0,
    `asalBenih` VARCHAR(191) NULL,
    `jumlahBenihDiperlukan` DOUBLE NULL DEFAULT 0,
    `jarakTanam` VARCHAR(191) NULL,
    `sistemTanam` VARCHAR(191) NULL,
    `targetProduksi` DOUBLE NULL DEFAULT 0,
    `standarKualitas` VARCHAR(191) NULL,
    `perkecambahanMin` DOUBLE NULL,
    `tanggalPersemaian` DATETIME(3) NULL,
    `tanggalTanam` DATETIME(3) NULL,
    `perkiraanPanen` DATETIME(3) NULL,
    `siklusTanamHari` INTEGER NULL DEFAULT 0,
    `metodeTanam` VARCHAR(191) NULL,
    `kepadatanTanam` VARCHAR(191) NULL,
    `irigasi` VARCHAR(191) NULL,
    `sumberAir` VARCHAR(191) NULL,
    `catatan` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jadwal_tanam_kodeJadwalTanam_key`(`kodeJadwalTanam`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_tanam_detail` (
    `id` VARCHAR(191) NOT NULL,
    `jadwalTanamId` VARCHAR(191) NOT NULL,
    `greenhouseId` VARCHAR(191) NULL,
    `namaLahan` VARCHAR(191) NOT NULL,
    `luas` DOUBLE NOT NULL DEFAULT 0,
    `tipeLahan` VARCHAR(191) NULL DEFAULT 'Lahan Terbuka',
    `irigasi` VARCHAR(191) NULL,
    `sumberAir` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_tanam_personil` (
    `id` VARCHAR(191) NOT NULL,
    `jadwalTanamId` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `peran` VARCHAR(191) NOT NULL,
    `kontak` VARCHAR(191) NULL,
    `tugas` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_tanam_peralatan` (
    `id` VARCHAR(191) NOT NULL,
    `jadwalTanamId` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL DEFAULT 1,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'Unit',
    `kondisi` VARCHAR(191) NOT NULL DEFAULT 'Baik',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_tanam_dokumen` (
    `id` VARCHAR(191) NOT NULL,
    `jadwalTanamId` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `fileUrl` TEXT NOT NULL,
    `fileSize` VARCHAR(191) NULL,
    `fileType` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `panen` (
    `id` VARCHAR(191) NOT NULL,
    `kodePanen` VARCHAR(191) NOT NULL,
    `jadwalTanamId` VARCHAR(191) NULL,
    `kesiapanPanenId` VARCHAR(191) NULL,
    `commodityId` VARCHAR(191) NULL,
    `varietyId` VARCHAR(191) NULL,
    `kesiapanLahanId` VARCHAR(191) NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `lahan` VARCHAR(191) NOT NULL,
    `tanggalPanen` DATETIME(3) NOT NULL,
    `luasHa` DOUBLE NOT NULL DEFAULT 0,
    `produksiKg` DOUBLE NOT NULL DEFAULT 0,
    `hasilKgHa` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Selesai',
    `penanggungJawab` VARCHAR(191) NULL,
    `metodePanen` VARCHAR(191) NULL DEFAULT 'Combine Harvester',
    `produksiKotorKg` DOUBLE NULL DEFAULT 0,
    `kadarAir` DOUBLE NULL DEFAULT 14,
    `kebersihan` DOUBLE NULL DEFAULT 98,
    `catatan` TEXT NULL,
    `dokumen` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `panen_kodePanen_key`(`kodePanen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_lahan` (
    `id` VARCHAR(191) NOT NULL,
    `kodeLahan` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `luas` DOUBLE NOT NULL DEFAULT 0,
    `tanggalTanam` VARCHAR(191) NULL,
    `umurHst` VARCHAR(191) NULL,
    `kondisi` VARCHAR(191) NOT NULL DEFAULT 'Baik',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `phTanah` DOUBLE NULL DEFAULT 6.5,
    `kelembapan` DOUBLE NULL DEFAULT 78,
    `suhuTanah` DOUBLE NULL DEFAULT 28,
    `nutrisiNpk` VARCHAR(191) NULL DEFAULT 'Optimal',
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `monitoring_lahan_kodeLahan_key`(`kodeLahan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_greenhouse` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `kodeGreenhouse` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `luas` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `kondisi` VARCHAR(191) NOT NULL DEFAULT 'Baik',
    `aktivitasTerakhir` VARCHAR(191) NULL,
    `suhuRataRata` DOUBLE NULL DEFAULT 26.5,
    `kelembapanRata` DOUBLE NULL DEFAULT 70.0,
    `intensitasCahaya` DOUBLE NULL DEFAULT 12500,
    `phAirIrigasi` DOUBLE NULL DEFAULT 6.2,
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `monitoring_greenhouse_kodeGreenhouse_key`(`kodeGreenhouse`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kesiapan_panen` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `kodeLahan` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NULL DEFAULT 'Blok A - Petak 1',
    `komoditas` VARCHAR(191) NULL,
    `varietas` VARCHAR(191) NULL,
    `greenhouseId` VARCHAR(191) NULL,
    `commodityId` VARCHAR(191) NULL,
    `varietyId` VARCHAR(191) NULL,
    `jadwalTanamId` VARCHAR(191) NULL,
    `tanggalTanam` VARCHAR(191) NULL,
    `umurHst` INTEGER NOT NULL DEFAULT 0,
    `prediksiPanen` VARCHAR(191) NULL,
    `statusKesiapan` VARCHAR(191) NOT NULL DEFAULT 'Belum Siap',
    `yieldEst` DOUBLE NOT NULL DEFAULT 0,
    `kadarAir` DOUBLE NULL DEFAULT 14.0,
    `kuningDaun` DOUBLE NULL DEFAULT 80,
    `kekerasanBiji` VARCHAR(191) NULL DEFAULT 'Keras',
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `kesiapan_panen_kodeLahan_key`(`kodeLahan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengeringan` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `alatPengering` VARCHAR(191) NOT NULL,
    `beratMasuk` DOUBLE NOT NULL DEFAULT 0,
    `kadarAirMasuk` DOUBLE NOT NULL DEFAULT 0,
    `kadarAirTarget` DOUBLE NOT NULL DEFAULT 12.0,
    `kadarAirSaatIni` DOUBLE NOT NULL DEFAULT 0,
    `beratKeluar` DOUBLE NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Proses',
    `selesai` VARCHAR(191) NULL,
    `suhuRataRata` DOUBLE NULL DEFAULT 41.5,
    `durasiJam` DOUBLE NULL DEFAULT 0,
    `lokasi` VARCHAR(191) NULL DEFAULT 'Gudang Pengeringan 1',
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pengeringan_kodeBatch_key`(`kodeBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch_produksi` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `sumberBahan` VARCHAR(191) NOT NULL,
    `tanggalMulai` VARCHAR(191) NOT NULL,
    `tanggalSelesai` VARCHAR(191) NOT NULL,
    `targetKg` DOUBLE NOT NULL DEFAULT 0,
    `hasilKg` DOUBLE NULL DEFAULT 0,
    `yieldPercent` DOUBLE NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Proses',
    `lokasi` VARCHAR(191) NULL DEFAULT 'Blok A',
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `batch_produksi_kodeBatch_key`(`kodeBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch_lots` (
    `id` VARCHAR(191) NOT NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `kodeLot` VARCHAR(191) NOT NULL,
    `batchProduksiId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `batch_lots_kodeBatch_key`(`kodeBatch`),
    UNIQUE INDEX `batch_lots_kodeLot_key`(`kodeLot`),
    UNIQUE INDEX `batch_lots_batchProduksiId_key`(`batchProduksiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sortasi` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `alatSortasi` VARCHAR(191) NOT NULL DEFAULT 'Air Screen Cleaner 01',
    `beratMasuk` DOUBLE NOT NULL DEFAULT 0,
    `hasilLulus` DOUBLE NOT NULL DEFAULT 0,
    `hasilTolak` DOUBLE NOT NULL DEFAULT 0,
    `recovery` DOUBLE NOT NULL DEFAULT 0,
    `tanggalSortasi` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Selesai',
    `lokasi` VARCHAR(191) NULL DEFAULT 'Gudang Sortasi 1',
    `operator` VARCHAR(191) NULL DEFAULT 'Admin',
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sortasi_kodeBatch_key`(`kodeBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `kodeBatch` VARCHAR(191) NOT NULL,
    `komoditas` VARCHAR(191) NOT NULL,
    `varietas` VARCHAR(191) NOT NULL,
    `treatment` VARCHAR(191) NOT NULL DEFAULT 'Fungisida + Insektisida',
    `dosis` VARCHAR(191) NOT NULL DEFAULT '2.5 ml/kg',
    `operator` VARCHAR(191) NOT NULL DEFAULT 'Slamet Riyadi',
    `beratAwal` DOUBLE NOT NULL DEFAULT 0,
    `beratAkhir` DOUBLE NOT NULL DEFAULT 0,
    `loss` DOUBLE NOT NULL DEFAULT 0,
    `tanggalSelesai` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Selesai',
    `lokasi` VARCHAR(191) NULL DEFAULT 'Ruang Treatment 1',
    `catatan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `treatment_kodeBatch_key`(`kodeBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stok_benih` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NULL,
    `produkBenih` VARCHAR(191) NOT NULL,
    `kategoriBenih` VARCHAR(191) NULL DEFAULT 'Benih Utama',
    `batchLot` VARCHAR(191) NOT NULL,
    `tanggalProduksi` VARCHAR(191) NOT NULL,
    `expired` VARCHAR(191) NOT NULL,
    `gudang` VARCHAR(191) NOT NULL,
    `stokKg` DOUBLE NOT NULL DEFAULT 0,
    `reservedKg` DOUBLE NOT NULL DEFAULT 0,
    `availableKg` DOUBLE NOT NULL DEFAULT 0,
    `dayaTumbuh` DOUBLE NOT NULL DEFAULT 90,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Aman',
    `keterangan` TEXT NULL,
    `dibuatOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `diubahOleh` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stok_benih_batchLot_key`(`batchLot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jadwal_tanam` ADD CONSTRAINT `jadwal_tanam_greenhouseId_fkey` FOREIGN KEY (`greenhouseId`) REFERENCES `greenhouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam` ADD CONSTRAINT `jadwal_tanam_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam` ADD CONSTRAINT `jadwal_tanam_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam_detail` ADD CONSTRAINT `jadwal_tanam_detail_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam_personil` ADD CONSTRAINT `jadwal_tanam_personil_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam_peralatan` ADD CONSTRAINT `jadwal_tanam_peralatan_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_tanam_dokumen` ADD CONSTRAINT `jadwal_tanam_dokumen_jadwalTanamId_fkey` FOREIGN KEY (`jadwalTanamId`) REFERENCES `jadwal_tanam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `panen` ADD CONSTRAINT `panen_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `panen` ADD CONSTRAINT `panen_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `panen` ADD CONSTRAINT `panen_kesiapanPanenId_fkey` FOREIGN KEY (`kesiapanPanenId`) REFERENCES `kesiapan_panen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kesiapan_panen` ADD CONSTRAINT `kesiapan_panen_greenhouseId_fkey` FOREIGN KEY (`greenhouseId`) REFERENCES `greenhouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kesiapan_panen` ADD CONSTRAINT `kesiapan_panen_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `commodities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kesiapan_panen` ADD CONSTRAINT `kesiapan_panen_varietyId_fkey` FOREIGN KEY (`varietyId`) REFERENCES `varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batch_lots` ADD CONSTRAINT `batch_lots_batchProduksiId_fkey` FOREIGN KEY (`batchProduksiId`) REFERENCES `batch_produksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
