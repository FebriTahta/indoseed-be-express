import { prisma } from './src/utils/prisma';

async function main() {
  console.log('Creating table perencanaan_produksi if not exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`perencanaan_produksi\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`noPerencanaan\` VARCHAR(191) NOT NULL,
      \`produk\` VARCHAR(191) NOT NULL,
      \`commodityId\` VARCHAR(191) NULL,
      \`komoditas\` VARCHAR(191) NOT NULL,
      \`varietyId\` VARCHAR(191) NULL,
      \`varietas\` VARCHAR(191) NOT NULL,
      \`targetProduksi\` DOUBLE NOT NULL DEFAULT 0,
      \`aktualProduksi\` DOUBLE NOT NULL DEFAULT 0,
      \`produksiTerpenuhi\` DOUBLE NOT NULL DEFAULT 0,
      \`targetLuasLahan\` DOUBLE NOT NULL DEFAULT 0,
      \`lahanTersedia\` DOUBLE NOT NULL DEFAULT 0,
      \`realisasiTanam\` DOUBLE NOT NULL DEFAULT 0,
      \`periode\` VARCHAR(191) NOT NULL,
      \`periodeMulai\` DATETIME(3) NULL,
      \`periodeSelesai\` DATETIME(3) NULL,
      \`metodeTanam\` VARCHAR(191) NOT NULL DEFAULT 'Pindah Tanam',
      \`kebutuhanBenih\` DOUBLE NOT NULL DEFAULT 0,
      \`estimasiHasilPerHa\` DOUBLE NOT NULL DEFAULT 0,
      \`partnerId\` VARCHAR(191) NULL,
      \`namaPetani\` VARCHAR(191) NULL,
      \`greenhouseId\` VARCHAR(191) NULL,
      \`namaLahan\` VARCHAR(191) NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'Draft',
      \`catatan\` TEXT NULL,
      \`estimasiPanen\` VARCHAR(191) NULL,
      \`dibuatOleh\` VARCHAR(191) NULL DEFAULT 'Admin',
      \`diubahOleh\` VARCHAR(191) NULL DEFAULT 'Admin',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`perencanaan_produksi_noPerencanaan_key\` (\`noPerencanaan\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  console.log('Table perencanaan_produksi created successfully!');
}

main()
  .catch((e) => {
    console.error('Error creating table:', e);
  })
  .finally(() => prisma.$disconnect());
