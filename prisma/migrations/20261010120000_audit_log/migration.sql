-- CreateTable
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `modul` VARCHAR(191) NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `entitas` VARCHAR(191) NULL,
    `entitasId` VARCHAR(191) NULL,
    `entitasKode` VARCHAR(191) NULL,
    `keterangan` TEXT NOT NULL,
    `perubahan` JSON NULL,
    `metode` VARCHAR(191) NULL,
    `endpoint` VARCHAR(500) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `perangkat` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    INDEX `audit_logs_username_idx`(`username`),
    INDEX `audit_logs_modul_idx`(`modul`),
    INDEX `audit_logs_aksi_idx`(`aksi`),
    INDEX `audit_logs_entitas_idx`(`entitas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
