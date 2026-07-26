import prisma from './src/utils/prisma';

async function main() {
  console.log('Seeding QC Reference Standards, Test Methods, and Test Parameters...');

  // 1. Seed Reference Standards
  const standards = [
    { kode: 'STD-001', nama: 'ISTA 2023', jenis: 'Standar Acuan', deskripsi: 'International Rules for Seed Testing', organisasi: 'ISTA', versiTahun: '2023' },
    { kode: 'STD-002', nama: 'SNI 01-2891-1992', jenis: 'Standar Acuan', deskripsi: 'Cara Uji Benih Hortikultura', organisasi: 'BSN', versiTahun: '1992' },
    { kode: 'STD-003', nama: 'ISO 9001:2015', jenis: 'Standar Acuan', deskripsi: 'Sistem Manajemen Mutu', organisasi: 'ISO', versiTahun: '2015' },
    { kode: 'STD-004', nama: 'ISO 17025:2017', jenis: 'Standar Acuan', deskripsi: 'Laboratorium Pengujian & Kalibrasi', organisasi: 'ISO', versiTahun: '2017' }
  ];

  const createdStandards: Record<string, any> = {};

  for (const s of standards) {
    createdStandards[s.nama] = await prisma.referenceStandard.upsert({
      where: { kode: s.kode },
      update: s,
      create: s,
    });
  }

  // 2. Seed Test Methods
  const methods = [
    { kode: 'ISTA 5.2.1', nama: 'Germination Test', deskripsi: 'Metode antara kertas merang untuk uji perkecambahan', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 2.2', nama: 'Moisture Content', deskripsi: 'Metode oven 103°C ± 2°C selama 17 ± 1 jam', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 2.10', nama: 'Pure Seed', deskripsi: 'Metode pemisahan fisik berdasarkan bentuk dan ukuran', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 7.3', nama: 'Vigor Test (Accelerated Aging)', deskripsi: 'Metode penuaan cepat (accelerated aging)', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 7.4', nama: 'Pathogen Test', deskripsi: 'Metode blotter test untuk deteksi patogen', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 2.3', nama: 'Dead Seed Test', deskripsi: 'Deteksi benih mati', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'SNI 01-3924-1995', nama: 'Thousand Seed Weight', deskripsi: 'Penimbangan 1000 biji', standarId: createdStandards['SNI 01-2891-1992'].id },
    { kode: 'ISTA 2.7', nama: 'Other Seed Determination', deskripsi: 'Identifikasi benih spesies lain', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 2.9', nama: 'Inert Matter Determination', deskripsi: 'Identifikasi kotoran benih', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 5.1.1', nama: 'Normal Germination', deskripsi: 'Perhitungan kecambah normal', standarId: createdStandards['ISTA 2023'].id },
    { kode: 'ISTA 5.2.2', nama: 'Viability Test', deskripsi: 'Pengujian viabilitas dengan tetrazolium', standarId: createdStandards['ISTA 2023'].id }
  ];

  const createdMethods: Record<string, any> = {};

  for (const m of methods) {
    createdMethods[m.kode] = await prisma.testMethod.upsert({
      where: { kode: m.kode },
      update: m,
      create: m,
    });
  }

  // 3. Seed Test Parameters
  const parameters = [
    { kode: 'PRM-001', nama: 'Daya Tumbuh', kategori: 'Fisiologis', batasAcuan: '>= 80', satuan: '%', keterangan: 'Pengujian dilakukan dengan media kertas merang pada suhu 25°C ± 2°C selama 7 hari.', metodeId: createdMethods['ISTA 5.2.1'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-002', nama: 'Kadar Air', kategori: 'Fisik', batasAcuan: '<= 12', satuan: '%', keterangan: 'Oven method', metodeId: createdMethods['ISTA 2.2'].id, standarId: createdStandards['SNI 01-2891-1992'].id },
    { kode: 'PRM-003', nama: 'Kemurnian', kategori: 'Fisik', batasAcuan: '>= 98', satuan: '%', keterangan: 'Pemisahan manual', metodeId: createdMethods['ISTA 2.10'].id, standarId: createdStandards['SNI 01-2891-1992'].id },
    { kode: 'PRM-004', nama: 'Vigor', kategori: 'Fisiologis', batasAcuan: '>= 70', satuan: '%', keterangan: 'Accelerated aging test', metodeId: createdMethods['ISTA 7.3'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-005', nama: 'Uji Patogen', kategori: 'Kesehatan', batasAcuan: 'Bebas', satuan: '-', keterangan: 'Blotter test', metodeId: createdMethods['ISTA 7.4'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-006', nama: 'Benih Mati', kategori: 'Fisiologis', batasAcuan: '<= 2', satuan: '%', keterangan: '-', metodeId: createdMethods['ISTA 2.3'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-007', nama: 'Berat 1000 Biji', kategori: 'Fisik', batasAcuan: '-', satuan: 'gram', keterangan: '-', metodeId: createdMethods['SNI 01-3924-1995'].id, standarId: createdStandards['SNI 01-2891-1992'].id },
    { kode: 'PRM-008', nama: 'Benih Lain (Other Seed)', kategori: 'Fisik', batasAcuan: '<= 0.5', satuan: '%', keterangan: '-', metodeId: createdMethods['ISTA 2.7'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-009', nama: 'Kotoran (Inert Matter)', kategori: 'Fisik', batasAcuan: '<= 2', satuan: '%', keterangan: '-', metodeId: createdMethods['ISTA 2.9'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-010', nama: 'Kecambah Normal', kategori: 'Fisiologis', batasAcuan: '>= 80', satuan: '%', keterangan: '-', metodeId: createdMethods['ISTA 5.1.1'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-011', nama: 'Kecambah Abnormal', kategori: 'Fisiologis', batasAcuan: '<= 20', satuan: '%', keterangan: '-', metodeId: createdMethods['ISTA 5.1.1'].id, standarId: createdStandards['ISTA 2023'].id },
    { kode: 'PRM-012', nama: 'Uji Viabilitas', kategori: 'Fisiologis', batasAcuan: '>= 70', satuan: '%', keterangan: '-', metodeId: createdMethods['ISTA 5.2.2'].id, standarId: createdStandards['ISTA 2023'].id },
  ];

  for (const p of parameters) {
    await prisma.testParameter.upsert({
      where: { kode: p.kode },
      update: p,
      create: p,
    });
  }

  console.log('QC seed completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
