-- AlterTable
ALTER TABLE `penguji` ADD COLUMN `tanggalBergabung` DATE NULL,
    ADD COLUMN `berlakuHingga` DATE NULL;

-- AlterTable
ALTER TABLE `sertifikasi` ADD COLUMN `nomorSertifikat` VARCHAR(191) NULL,
    ADD COLUMN `tanggalSertifikat` DATE NULL;

-- AlterTable
ALTER TABLE `audit_logs` ADD COLUMN `impersonatedBy` VARCHAR(191) NULL;
