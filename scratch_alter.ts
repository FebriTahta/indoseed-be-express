import prisma from './src/utils/prisma';

async function alterTable() {
  try {
    const queries = [
      "ALTER TABLE sortasi ADD COLUMN IF NOT EXISTS petani VARCHAR(191) NULL",
      "ALTER TABLE sortasi ADD COLUMN IF NOT EXISTS petaniKode VARCHAR(191) NULL",
      "ALTER TABLE sortasi ADD COLUMN IF NOT EXISTS noLot VARCHAR(191) NULL",
      "ALTER TABLE sortasi ADD COLUMN IF NOT EXISTS gudangBahanId VARCHAR(191) NULL",
      "ALTER TABLE sortasi ADD COLUMN IF NOT EXISTS rincianReject LONGTEXT NULL",
      "ALTER TABLE sortasi ADD COLUMN IF NOT EXISTS dokumentasi LONGTEXT NULL",
    ];

    for (const q of queries) {
      await prisma.$executeRawUnsafe(q);
      console.log('Executed:', q);
    }
    console.log('ALTER TABLE SUCCESSFUL');
  } catch (e) {
    console.error('Error altering table:', e);
  } finally {
    await prisma.$disconnect();
  }
}

alterTable();
