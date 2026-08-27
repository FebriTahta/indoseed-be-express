import { prisma } from './utils/prisma';

async function seedPenguji() {
  console.log("Seeding Laboratorium...");
  const lab1 = await prisma.laboratorium.create({
    data: { kodeLaboratorium: 'LAB-01', namaLaboratorium: 'Lab. Benih Utama', alamat: 'Gedung A' }
  });
  const lab2 = await prisma.laboratorium.create({
    data: { kodeLaboratorium: 'LAB-02', namaLaboratorium: 'Lab. Fisiologi Benih', alamat: 'Gedung B' }
  });
  const lab3 = await prisma.laboratorium.create({
    data: { kodeLaboratorium: 'LAB-03', namaLaboratorium: 'Lab. Patologi Benih', alamat: 'Gedung C' }
  });

  console.log("Seeding Test Methods...");
  const tmDayaTumbuh = await prisma.testMethod.upsert({
    where: { kode: 'TM-01' },
    update: {},
    create: { kode: 'TM-01', nama: 'Daya Tumbuh' }
  });
  const tmKadarAir = await prisma.testMethod.upsert({
    where: { kode: 'TM-02' },
    update: {},
    create: { kode: 'TM-02', nama: 'Kadar Air' }
  });
  const tmKemurnian = await prisma.testMethod.upsert({
    where: { kode: 'TM-03' },
    update: {},
    create: { kode: 'TM-03', nama: 'Kemurnian' }
  });
  const tmVigor = await prisma.testMethod.upsert({
    where: { kode: 'TM-04' },
    update: {},
    create: { kode: 'TM-04', nama: 'Vigor' }
  });

  console.log("Seeding Penguji...");
  const pengujis = [
    {
      kodePenguji: 'PGJ-0001', nama: 'Andi Pratama', labId: lab1.id, status: 'Aktif',
      sertifikasi: 'ISTA', berlaku: '2026-06-12', methods: [tmDayaTumbuh.id, tmKadarAir.id, tmKemurnian.id]
    },
    {
      kodePenguji: 'PGJ-0002', nama: 'Siti Nurhaliza', labId: lab1.id, status: 'Aktif',
      sertifikasi: 'ISTA', berlaku: '2026-09-20', methods: [tmKadarAir.id, tmVigor.id, tmDayaTumbuh.id]
    },
    {
      kodePenguji: 'PGJ-0003', nama: 'Budi Santoso', labId: lab2.id, status: 'Aktif',
      sertifikasi: 'ISTA', berlaku: '2026-08-15', methods: [tmDayaTumbuh.id, tmKemurnian.id]
    },
    {
      kodePenguji: 'PGJ-0004', nama: 'Rina Wulandari', labId: lab2.id, status: 'Aktif',
      sertifikasi: 'ISO 17025', berlaku: '2026-11-10', methods: [tmKadarAir.id, tmVigor.id]
    },
    {
      kodePenguji: 'PGJ-0005', nama: 'Dedi Kurniawan', labId: lab1.id, status: 'Aktif',
      sertifikasi: 'ISTA', berlaku: '2026-07-18', methods: [tmKemurnian.id, tmKadarAir.id]
    },
    {
      kodePenguji: 'PGJ-0006', nama: 'Maya Lestari', labId: lab3.id, status: 'Aktif',
      sertifikasi: 'ISTA', berlaku: '2026-10-22', methods: [tmVigor.id, tmDayaTumbuh.id]
    },
    {
      kodePenguji: 'PGJ-0007', nama: 'Fajar Nugroho', labId: lab3.id, status: 'Nonaktif',
      sertifikasi: null, berlaku: null, methods: [tmVigor.id]
    },
    {
      kodePenguji: 'PGJ-0008', nama: 'Lia Anggraini', labId: lab1.id, status: 'Aktif',
      sertifikasi: 'ISO 17025', berlaku: '2026-07-05', methods: [tmDayaTumbuh.id, tmKadarAir.id, tmKemurnian.id]
    },
    {
      kodePenguji: 'PGJ-0009', nama: 'Agus Setiawan', labId: lab2.id, status: 'Aktif',
      sertifikasi: 'ISTA', berlaku: '2026-12-30', methods: [tmKadarAir.id, tmKemurnian.id]
    },
    {
      kodePenguji: 'PGJ-0010', nama: 'Nanda Putri', labId: lab1.id, status: 'Aktif',
      sertifikasi: null, berlaku: null, methods: [tmVigor.id, tmDayaTumbuh.id]
    }
  ];

  for (const p of pengujis) {
    const penguji = await prisma.penguji.create({
      data: {
        kodePenguji: p.kodePenguji,
        nama: p.nama,
        laboratoriumId: p.labId,
        status: p.status,
        metodeUji: {
          create: p.methods.map(id => ({ testMethodId: id }))
        }
      }
    });

    if (p.sertifikasi) {
      await prisma.sertifikasi.create({
        data: {
          pengujiId: penguji.id,
          namaSertifikasi: p.sertifikasi,
          berlakuHingga: new Date(p.berlaku!),
          status: 'Aktif'
        }
      });
    }
  }

  console.log("Seeding complete!");
}

seedPenguji().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
