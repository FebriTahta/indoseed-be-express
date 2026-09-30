import { prisma } from '../src/utils/prisma';

async function main() {
  console.log('Seeding Kontrak Panen...');

  const initialContracts = [
    {
      noKontrak: 'KTR-PNH-2026-001',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 12000,
      satuan: 'Kg',
      umurPanen: 70,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak untuk produksi melon Tere F1 dengan kualitas buah grade A.',
    },
    {
      noKontrak: 'KTR-PNH-2026-002',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      tipePanenan: 'OC / Benih',
      nilaiKontrak: 35000,
      satuan: 'Kg',
      umurPanen: 80,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak hasil panen benih melon Tere F1 bersertifikat.',
    },
    {
      noKontrak: 'KTR-PNH-2026-003',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 25000,
      satuan: 'Kg',
      umurPanen: 90,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak panen cabai keriting segar kualitas ekspor.',
    },
    {
      noKontrak: 'KTR-PNH-2026-004',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      tipePanenan: 'OC / Benih',
      nilaiKontrak: 75000,
      satuan: 'Kg',
      umurPanen: 110,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak benih cabai keriting murni unggul bersertifikat.',
    },
    {
      noKontrak: 'KTR-PNH-2026-005',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 7000,
      satuan: 'Kg',
      umurPanen: 115,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak gabah kering panen Inpari 32 kadar air standar.',
    },
    {
      noKontrak: 'KTR-PNH-2026-006',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      tipePanenan: 'OC / Benih',
      nilaiKontrak: 15000,
      satuan: 'Kg',
      umurPanen: 125,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak calon benih padi Inpari 32 bersertifikat resmi.',
    },
    {
      noKontrak: 'KTR-PNH-2026-007',
      komoditas: 'Tomat',
      varietas: 'Tomat Servo F1',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 18000,
      satuan: 'Kg',
      umurPanen: 85,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Tidak Aktif',
      keterangan: 'Kontrak panen buah segar tomat Servo F1 periode lalu.',
    },
    {
      noKontrak: 'KTR-PNH-2026-008',
      komoditas: 'Cabai',
      varietas: 'Cabai Rawit',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 22000,
      satuan: 'Kg',
      umurPanen: 95,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak panen buah cabai rawit merah segar grade super.',
    },
    {
      noKontrak: 'KTR-PNH-2026-009',
      komoditas: 'Bawang Merah',
      varietas: 'Bima Brebes',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 22000,
      satuan: 'Kg',
      umurPanen: 100,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Aktif',
      keterangan: 'Kontrak panen umbi bawang merah Bima Brebes kualitas super.',
    },
    {
      noKontrak: 'KTR-PNH-2026-010',
      komoditas: 'Kacang Panjang',
      varietas: 'Kacang Panjang',
      tipePanenan: 'Glondong / Fresh',
      nilaiKontrak: 12000,
      satuan: 'Kg',
      umurPanen: 60,
      periodeMulai: new Date('2026-01-01'),
      periodeSelesai: new Date('2026-12-31'),
      status: 'Draft',
      keterangan: 'Draft kontrak panen polong kacang panjang segar.',
    },
  ];

  for (const item of initialContracts) {
    const existing = await (prisma as any).kontrakPanen.findUnique({
      where: { noKontrak: item.noKontrak },
    });

    // Match commodity if possible
    let commodityId: string | null = null;
    let varietyId: string | null = null;

    const comm = await prisma.commodity.findFirst({
      where: { namaKomoditas: { contains: item.komoditas } },
    });
    if (comm) commodityId = comm.id;

    const varItem = await prisma.variety.findFirst({
      where: { namaVarietas: { contains: item.varietas } },
    });
    if (varItem) varietyId = varItem.id;

    if (!existing) {
      await (prisma as any).kontrakPanen.create({
        data: {
          ...item,
          commodityId,
          varietyId,
        },
      });
      console.log(`Created ${item.noKontrak}: ${item.komoditas} - ${item.varietas}`);
    } else {
      console.log(`Already exists: ${item.noKontrak}`);
    }
  }

  console.log('Seeding Kontrak Panen completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
