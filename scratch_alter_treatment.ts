import prisma from './src/utils/prisma';

async function alterTreatmentTable() {
  try {
    const queries = [
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS petani VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS petaniKode VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS lahan VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS metodeTreatment VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS bahan VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS jumlahBenih DOUBLE DEFAULT 0",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS noLot VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS gudangBahanId VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS tanggalProses VARCHAR(191) NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS fotoDokumentasi LONGTEXT NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS tahapanProses LONGTEXT NULL",
      "ALTER TABLE treatment ADD COLUMN IF NOT EXISTS riwayatTreatment LONGTEXT NULL",
    ];

    for (const q of queries) {
      await prisma.$executeRawUnsafe(q);
      console.log('Executed:', q);
    }
    console.log('ALTER TREATMENT TABLE SUCCESSFUL');
  } catch (e) {
    console.error('Error altering treatment table:', e);
  } finally {
    await prisma.$disconnect();
  }
}

alterTreatmentTable();
