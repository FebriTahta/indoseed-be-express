import { prisma } from '../src/utils/prisma';

async function seedPenanggungJawab() {
  const initialData = [
    {
      kodePersonel: 'PJ-001',
      nama: 'Budi Santoso',
      peran: 'Kepala Produksi',
      areaModul: 'Produksi',
      lokasi: 'Semua Lokasi',
      noHp: '0812 3456 7890',
      email: 'budi@perusahaan.co.id',
      status: 'Aktif',
      catatan: 'Bertanggung jawab penuh atas seluruh alur produksi benih perusahaan.',
    },
    {
      kodePersonel: 'PJ-002',
      nama: 'Andi Wijaya',
      peran: 'Penanggung Jawab',
      areaModul: 'Produksi',
      lokasi: 'Ngantang',
      noHp: '0813 2222 3333',
      email: 'andi@perusahaan.co.id',
      status: 'Aktif',
      catatan: 'Penanggung jawab lapangan blok produksi Ngantang.',
    },
    {
      kodePersonel: 'PJ-003',
      nama: 'Dedi Kurniawan',
      peran: 'Penanggung Jawab',
      areaModul: 'Produksi',
      lokasi: 'Wajak',
      noHp: '0856 1111 4444',
      email: 'dedi@perusahaan.co.id',
      status: 'Aktif',
      catatan: 'Penanggung jawab lapangan blok produksi Wajak.',
    },
    {
      kodePersonel: 'PJ-004',
      nama: 'Siti Aminah',
      peran: 'Penanggung Jawab',
      areaModul: 'QC & Laboratorium',
      lokasi: 'Semua Lokasi',
      noHp: '0812 9876 5432',
      email: 'siti@perusahaan.co.id',
      status: 'Aktif',
      catatan: 'Penanggung jawab pengujian mutu benih dan laboratorium sentral.',
    },
    {
      kodePersonel: 'PJ-005',
      nama: 'Agus Setiawan',
      peran: 'Penanggung Jawab',
      areaModul: 'Gudang',
      lokasi: 'Ngantang',
      noHp: '0813 5678 9012',
      email: 'agus@perusahaan.co.id',
      status: 'Aktif',
      catatan: 'Penanggung jawab penyimpanan stok dan inventory gudang Ngantang.',
    },
  ];

  for (const item of initialData) {
    const existing = await prisma.penanggungJawab.findFirst({
      where: {
        OR: [
          { kodePersonel: item.kodePersonel },
          { nama: item.nama },
        ],
      },
    });

    if (existing) {
      await prisma.penanggungJawab.update({
        where: { id: existing.id },
        data: item,
      });
      console.log(`Updated ${item.kodePersonel} - ${item.nama}`);
    } else {
      await prisma.penanggungJawab.create({
        data: item,
      });
      console.log(`Created ${item.kodePersonel} - ${item.nama}`);
    }
  }

  console.log('Seed penanggung jawab completed successfully!');
}

seedPenanggungJawab()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
