/// <reference types="node" />
import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log(`Start seeding ...`);
  
  const superadminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin',
    },
  });

  const hashedPassword = await bcrypt.hash('superadmin', 10);

  const superadminUser = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@example.com', // placeholder
      password: hashedPassword,
      isEmailVerified: true,
      defaultRoleId: superadminRole.id,
      roles: {
        create: {
          roleId: superadminRole.id,
        },
      },
    },
  });

  // Seeding Commodities
  const commodities = [
    {
      kodeKomoditas: 'KOM-001',
      namaKomoditas: 'Padi',
      kategori: 'Serealia',
      deskripsi: 'Tanaman pangan penghasil beras',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-002',
      namaKomoditas: 'Jagung',
      kategori: 'Serealia',
      deskripsi: 'Tanaman pangan penghasil biji jagung',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-003',
      namaKomoditas: 'Kedelai',
      kategori: 'Legum',
      deskripsi: 'Tanaman kacang-kacangan penghasil kedelai',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-004',
      namaKomoditas: 'Kacang Tanah',
      kategori: 'Legum',
      deskripsi: 'Tanaman kacang-kacangan penghasil kacang tanah',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-005',
      namaKomoditas: 'Kacang Hijau',
      kategori: 'Legum',
      deskripsi: 'Tanaman kacang-kacangan penghasil kacang hijau',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-006',
      namaKomoditas: 'Ubi Kayu',
      kategori: 'Umbi',
      deskripsi: 'Tanaman umbi-umbian penghasil ketela pohon',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-007',
      namaKomoditas: 'Ubi Jalar',
      kategori: 'Umbi',
      deskripsi: 'Tanaman umbi-umbian penghasil ubi jalar',
      status: 'Aktif',
    },
    {
      kodeKomoditas: 'KOM-008',
      namaKomoditas: 'Cabai',
      kategori: 'Hortikultura',
      deskripsi: 'Tanaman hortikultura penghasil cabai',
      status: 'Tidak Aktif',
    },
  ];

  for (const item of commodities) {
    await prisma.commodity.upsert({
      where: { kodeKomoditas: item.kodeKomoditas },
      update: {},
      create: {
        kodeKomoditas: item.kodeKomoditas,
        namaKomoditas: item.namaKomoditas,
        kategori: item.kategori,
        deskripsi: item.deskripsi,
        status: item.status,
        dibuatOleh: 'Admin',
        diubahOleh: 'Admin',
      },
    });
  }

  // Seeding Varieties
  const varieties = [
    {
      kodeVarietas: 'VAR-001',
      namaVarietas: 'Inpari 32',
      commodityKode: 'KOM-001', // Padi
      asalPemulia: 'BB Padi',
      tahunRilis: 2014,
      status: 'Aktif',
      deskripsi: 'Varietas padi unggul baru hasil pemuliaan BB Padi. Memiliki potensi hasil tinggi dan kualitas beras baik.',
      umurTanam: '115 - 120 hari',
      tinggiTanaman: '95 - 105 cm',
      bentukBiji: 'Ramping',
      warnaGabah: 'Kuning bersih',
      potensiHasil: '7 - 8 ton/ha',
      anjuranDataran: 'Rendah - Menengah',
    },
    {
      kodeVarietas: 'VAR-002',
      namaVarietas: 'Inpari 42',
      commodityKode: 'KOM-001', // Padi
      asalPemulia: 'BB Padi',
      tahunRilis: 2017,
      status: 'Aktif',
      deskripsi: 'Tahan terhadap penyakit blas dan wereng coklat tipe 1.',
      umurTanam: '112 hari',
      tinggiTanaman: '97 cm',
      bentukBiji: 'Medium',
      warnaGabah: 'Kuning bersih',
      potensiHasil: '10.58 ton/ha',
      anjuranDataran: 'Irigasi dataran rendah',
    },
    {
      kodeVarietas: 'VAR-003',
      namaVarietas: 'Ciherang',
      commodityKode: 'KOM-001', // Padi
      asalPemulia: 'BB Padi',
      tahunRilis: 1995,
      status: 'Aktif',
      deskripsi: 'Varietas populer, nasi pulen dan wangi, menjadi standar beras premium.',
      umurTanam: '116 - 125 hari',
      tinggiTanaman: '107 - 115 cm',
      bentukBiji: 'Panjang ramping',
      warnaGabah: 'Kuning bersih',
      potensiHasil: '5 - 8.5 ton/ha',
      anjuranDataran: 'Rendah - Menengah',
    },
    {
      kodeVarietas: 'VAR-004',
      namaVarietas: 'Mekongga',
      commodityKode: 'KOM-001', // Padi
      asalPemulia: 'BB Padi',
      tahunRilis: 2009,
      status: 'Aktif',
      deskripsi: 'Potensi hasil tinggi, cocok untuk dataran rendah irigasi.',
      umurTanam: '116 - 120 hari',
      tinggiTanaman: '91 - 106 cm',
      bentukBiji: 'Ramping',
      warnaGabah: 'Kuning bersih',
      potensiHasil: '6 - 8.4 ton/ha',
      anjuranDataran: 'Rendah - Irigasi',
    },
    {
      kodeVarietas: 'VAR-005',
      namaVarietas: 'Situ Bagendit',
      commodityKode: 'KOM-001', // Padi
      asalPemulia: 'BB Padi',
      tahunRilis: 2007,
      status: 'Aktif',
      deskripsi: 'Tahan penyakit, umur genjah, sangat adaptif di lahan kering maupun sawah.',
      umurTanam: '110 - 120 hari',
      tinggiTanaman: '99 - 105 cm',
      bentukBiji: 'Ramping',
      warnaGabah: 'Kuning bersih',
      potensiHasil: '4 - 6 ton/ha',
      anjuranDataran: 'Lahan Kering & Sawah Rendah',
    },
    {
      kodeVarietas: 'VAR-006',
      namaVarietas: 'Jagung Hibrida P-21',
      commodityKode: 'KOM-002', // Jagung
      asalPemulia: 'PT. Pioneer',
      tahunRilis: 2018,
      status: 'Aktif',
      deskripsi: 'Hibrida silang tunggal, potensi hasil tinggi dan tongkol besar berisi penuh.',
      umurTanam: '100 - 105 hari',
      tinggiTanaman: '210 cm',
      bentukBiji: 'Setengah mutiara',
      warnaGabah: 'Oranye kekuningan',
      potensiHasil: '8 - 11 ton/ha',
      anjuranDataran: 'Rendah - Menengah',
    },
    {
      kodeVarietas: 'VAR-007',
      namaVarietas: 'Jagung Hibrida N-27',
      commodityKode: 'KOM-002', // Jagung
      asalPemulia: 'PT. Pioneer',
      tahunRilis: 2020,
      status: 'Aktif',
      deskripsi: 'Toleran kekeringan, adaptif dataran rendah dengan rendemen tinggi.',
      umurTanam: '98 - 103 hari',
      tinggiTanaman: '195 cm',
      bentukBiji: 'Mutiara',
      warnaGabah: 'Kuning terang',
      potensiHasil: '9 - 12 ton/ha',
      anjuranDataran: 'Dataran Rendah',
    },
    {
      kodeVarietas: 'VAR-008',
      namaVarietas: 'Kedelai Grobogan',
      commodityKode: 'KOM-003', // Kedelai
      asalPemulia: 'Balitkabi',
      tahunRilis: 2016,
      status: 'Aktif',
      deskripsi: 'Umur genjah, biji super besar, produksi tinggi dan disukai industri tahu/tempe.',
      umurTanam: '76 hari',
      tinggiTanaman: '50 - 60 cm',
      bentukBiji: 'Bulat besar',
      warnaGabah: 'Kuning bersih',
      potensiHasil: '2.77 - 3.4 ton/ha',
      anjuranDataran: 'Rendah - Menengah',
    },
    {
      kodeVarietas: 'VAR-009',
      namaVarietas: 'Kedelai Anjasmoro',
      commodityKode: 'KOM-003', // Kedelai
      asalPemulia: 'Balitkabi',
      tahunRilis: 2000,
      status: 'Tidak Aktif',
      deskripsi: 'Varietas nasional biji bulat besar, tahan pecah polong.',
      umurTanam: '82 - 93 hari',
      tinggiTanaman: '64 - 90 cm',
      bentukBiji: 'Bulat',
      warnaGabah: 'Kuning',
      potensiHasil: '2.03 - 2.25 ton/ha',
      anjuranDataran: 'Rendah - Menengah',
    },
    {
      kodeVarietas: 'VAR-010',
      namaVarietas: 'Kacang Tanah Kelinci',
      commodityKode: 'KOM-004', // Kacang Tanah
      asalPemulia: 'Balitkabi',
      tahunRilis: 2012,
      status: 'Aktif',
      deskripsi: 'Produksi polong tinggi, tahan penyakit layu bakteri.',
      umurTanam: '90 - 95 hari',
      tinggiTanaman: '45 - 55 cm',
      bentukBiji: 'Bulat lonjong',
      warnaGabah: 'Merah muda',
      potensiHasil: '2.5 - 3.2 ton/ha',
      anjuranDataran: 'Rendah',
    }
  ];

  for (const item of varieties) {
    const commodity = await prisma.commodity.findUnique({
      where: { kodeKomoditas: item.commodityKode }
    });

    if (commodity) {
      const { commodityKode, ...varietyData } = item;
      await prisma.variety.upsert({
        where: { kodeVarietas: item.kodeVarietas },
        update: {},
        create: {
          ...varietyData,
          commodityId: commodity.id,
          dibuatOleh: 'Admin',
          diubahOleh: 'Admin'
        }
      });
    }
  }

  // Seeding Partners (Petani Mitra)
  const partners = [
    {
      kodePetani: 'PM-001',
      namaPetani: 'Budi Santoso',
      kelompokTani: 'Karya Tani',
      komoditasUtama: 'Padi',
      noKtp: '3271012305800001',
      noTelepon: '0812-3456-7890',
      alamat: 'Dusun Sukamaju RT 02/RW 01, Desa Sukamaju, Kec. Cisarua, Kab. Bogor, Jawa Barat 16750',
      luasLahan: 2.50,
      pengalaman: 12,
      tglBergabung: new Date('2022-03-15T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-002',
      namaPetani: 'Siti Nurhayati',
      kelompokTani: 'Tani Makmur',
      komoditasUtama: 'Padi',
      noKtp: '3271012305800002',
      noTelepon: '0812-3456-7891',
      alamat: 'Dusun Karanganyar RT 03/RW 02, Desa Karanganyar, Kab. Subang, Jawa Barat 41211',
      luasLahan: 1.75,
      pengalaman: 8,
      tglBergabung: new Date('2023-05-10T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-003',
      namaPetani: 'Agus Widodo',
      kelompokTani: 'Subur Abadi',
      komoditasUtama: 'Jagung',
      noKtp: '3271012305800003',
      noTelepon: '0812-3456-7892',
      alamat: 'Dusun Sidomulyo RT 01/RW 04, Desa Sidomulyo, Kab. Lamongan, Jawa Timur 62251',
      luasLahan: 3.20,
      pengalaman: 15,
      tglBergabung: new Date('2021-11-20T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-004',
      namaPetani: 'Rizky Pratama',
      kelompokTani: 'Maju Bersama',
      komoditasUtama: 'Kedelai',
      noKtp: '3271012305800004',
      noTelepon: '0812-3456-7893',
      alamat: 'Desa Majujaya RT 02/RW 05, Kec. Pakusari, Kab. Jember, Jawa Timur 68181',
      luasLahan: 1.50,
      pengalaman: 6,
      tglBergabung: new Date('2024-01-15T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-005',
      namaPetani: 'Dedi Kurniawan',
      kelompokTani: 'Sejahtera',
      komoditasUtama: 'Kacang Tanah',
      noKtp: '3271012305800005',
      noTelepon: '0812-3456-7894',
      alamat: 'Kampung Sejahtera RT 04/RW 02, Desa Sukarasa, Kab. Garut, Jawa Barat 44111',
      luasLahan: 1.80,
      pengalaman: 10,
      tglBergabung: new Date('2022-09-01T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-006',
      namaPetani: 'Yuniar Putri',
      kelompokTani: 'Tani Mandiri',
      komoditasUtama: 'Cabai',
      noKtp: '3271012305800006',
      noTelepon: '0812-3456-7895',
      alamat: 'Dusun Mandiri RT 01/RW 01, Desa Kalierang, Kab. Wonosobo, Jawa Tengah 56351',
      luasLahan: 0.60,
      pengalaman: 5,
      tglBergabung: new Date('2024-04-10T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-007',
      namaPetani: 'Hendra Wijaya',
      kelompokTani: 'Lestari',
      komoditasUtama: 'Padi',
      noKtp: '3271012305800007',
      noTelepon: '0812-3456-7896',
      alamat: 'Desa Lestari RT 05/RW 03, Kec. Wanasari, Kab. Brebes, Jawa Tengah 52252',
      luasLahan: 2.00,
      pengalaman: 14,
      tglBergabung: new Date('2021-06-15T00:00:00Z'),
      status: 'Non Aktif',
    },
    {
      kodePetani: 'PM-008',
      namaPetani: 'M. Fadli',
      kelompokTani: 'Harapan Tani',
      komoditasUtama: 'Jagung',
      noKtp: '3271012305800008',
      noTelepon: '0812-3456-7897',
      alamat: 'Kampung Harapan RT 02/RW 01, Desa Sukamulya, Kab. Subang, Jawa Barat 41212',
      luasLahan: 2.75,
      pengalaman: 11,
      tglBergabung: new Date('2022-12-10T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-009',
      namaPetani: 'Dian Prasetyo',
      kelompokTani: 'Tani Subur',
      komoditasUtama: 'Kedelai',
      noKtp: '3271012305800009',
      noTelepon: '0812-3456-7898',
      alamat: 'Dusun Subur RT 03/RW 06, Desa Sukajaya, Kab. Lamongan, Jawa Timur 62252',
      luasLahan: 1.30,
      pengalaman: 7,
      tglBergabung: new Date('2023-08-25T00:00:00Z'),
      status: 'Aktif',
    },
    {
      kodePetani: 'PM-010',
      namaPetani: 'Indra Gunawan',
      kelompokTani: 'Makmur Jaya',
      komoditasUtama: 'Kacang Hijau',
      noKtp: '3271012305800010',
      noTelepon: '0812-3456-7899',
      alamat: 'Desa Makmur RT 01/RW 03, Kec. Patrang, Kab. Jember, Jawa Timur 68111',
      luasLahan: 0.90,
      pengalaman: 9,
      tglBergabung: new Date('2023-02-18T00:00:00Z'),
      status: 'Aktif',
    }
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { kodePetani: partner.kodePetani },
      update: {},
      create: {
        ...partner,
        dibuatOleh: 'Admin',
        diubahOleh: 'Admin',
      }
    });
  }

  console.log({ superadminUser, superadminRole });
  await seedQC(prisma);
  console.log(`Seeding finished.`);
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

async function seedQC(prisma: any) {
  console.log('Seeding QC Reference Standards, Test Methods, and Test Parameters...');

  const standards = [
    { kode: 'ISTA 2023', nama: 'ISTA International Rules for Seed Testing', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Aturan internasional untuk pengujian kualitas benih', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'SNI 01-2891-1992', nama: 'Cara Uji Benih Hortikultura', organisasi: 'BSN', versiTahun: '1992', deskripsi: 'Metode pengujian benih hortikultura', jenis: 'Standar Nasional', bahasa: 'Indonesia', status: 'Aktif' },
    { kode: 'ISO 9001:2015', nama: 'Sistem Manajemen Mutu', organisasi: 'ISO', versiTahun: '2015', deskripsi: 'Persyaratan sistem manajemen mutu', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISO 17025:2017', nama: 'Persyaratan Umum Laboratorium Pengujian', organisasi: 'ISO', versiTahun: '2017', deskripsi: 'Persyaratan kompetensi laboratorium pengujian', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'SNI 7883:2013', nama: 'Benih Sayuran', organisasi: 'BSN', versiTahun: '2013', deskripsi: 'Persyaratan mutu benih sayuran', jenis: 'Standar Nasional', bahasa: 'Indonesia', status: 'Aktif' },
    { kode: 'SNI 8272:2016', nama: 'Benih Tanaman Pangan', organisasi: 'BSN', versiTahun: '2016', deskripsi: 'Persyaratan mutu benih tanaman pangan', jenis: 'Standar Nasional', bahasa: 'Indonesia', status: 'Aktif' },
    { kode: 'ISTA 6.2', nama: 'Purity Determination', organisasi: 'ISTA', versiTahun: '2020', deskripsi: 'Metode penentuan kemurnian benih', jenis: 'Metode Uji Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 5.2.1', nama: 'Germination Test', organisasi: 'ISTA', versiTahun: '2021', deskripsi: 'Metode pengujian daya tumbuh benih', jenis: 'Metode Uji Internasional', bahasa: 'Inggris', status: 'Aktif' }
  ];

  const createdStandards: Record<string, any> = {};
  for (const s of standards) {
    createdStandards[s.kode] = await prisma.referenceStandard.upsert({ where: { kode: s.kode }, update: s, create: s });
  }

  const methods = [
    { kode: 'ISTA 5.2.1', nama: 'Germination Test', deskripsi: 'Metode antara kertas merang untuk uji perkecambahan', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 2.2', nama: 'Moisture Content', deskripsi: 'Metode oven 103°C ± 2°C selama 17 ± 1 jam', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 2.10', nama: 'Purity Analysis', deskripsi: 'Metode pemisahan fisik berdasarkan bentuk dan ukuran', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 7.3', nama: 'Vigor Test', deskripsi: 'Metode penuaan cepat (accelerated aging)', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 7.4', nama: 'Pathogen Test', deskripsi: 'Metode blotter test untuk deteksi patogen', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 2.3', nama: 'Weight Determination', deskripsi: 'Pengukuran berat 1000 biji', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 2.7', nama: 'Other Seed Test', deskripsi: 'Pengujian benih lain (other seed)', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 2.9', nama: 'Inert Matter Test', deskripsi: 'Pengujian kotoran (inert matter)', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 5.1.1', nama: 'Normal & Abnormal Seed', deskripsi: 'Pengujian kecambah normal dan abnormal', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'ISTA 5.2.2', nama: 'Viability Test', deskripsi: 'Uji viabilitas benih', standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
  ];

  const createdMethods: Record<string, any> = {};
  for (const m of methods) {
    createdMethods[m.kode] = await prisma.testMethod.upsert({ where: { kode: m.kode }, update: m, create: m });
  }

  const parameters = [
    { kode: 'P001', nama: 'Daya Tumbuh', kategori: 'Fisiologis', batasAcuan: '>= 80', satuan: '%', definisi: 'Persentase kecambah normal yang dihasilkan dari benih murni dalam kondisi optimal pada periode waktu tertentu.', keterangan: 'Pengujian dilakukan dengan media kertas merang pada suhu 25°C ± 2°C selama 7 hari.', metodeId: createdMethods['ISTA 5.2.1'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P002', nama: 'Kadar Air', kategori: 'Fisik', batasAcuan: '<= 12', satuan: '%', definisi: 'Kandungan air dalam benih', keterangan: 'Oven method', metodeId: createdMethods['ISTA 2.2'].id, standarId: createdStandards['SNI 01-2891-1992'].id, status: 'Aktif' },
    { kode: 'P003', nama: 'Kemurnian', kategori: 'Fisik', batasAcuan: '>= 98', satuan: '%', definisi: 'Persentase berat benih murni dari spesies yang diuji dalam suatu contoh uji', keterangan: 'Pemisahan manual', metodeId: createdMethods['ISTA 2.10'].id, standarId: createdStandards['SNI 01-2891-1992'].id, status: 'Aktif' },
    { kode: 'P004', nama: 'Vigor', kategori: 'Fisiologis', batasAcuan: '>= 70', satuan: '%', definisi: 'Kemampuan benih untuk tumbuh normal pada kondisi suboptimal', keterangan: 'Accelerated aging test', metodeId: createdMethods['ISTA 7.3'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P005', nama: 'Uji Patogen', kategori: 'Kesehatan', batasAcuan: 'Bebas', satuan: '-', definisi: 'Pemeriksaan keberadaan patogen (jamur, bakteri, virus) pada benih', keterangan: 'Blotter test', metodeId: createdMethods['ISTA 7.4'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P006', nama: 'Benih Mati', kategori: 'Fisiologis', batasAcuan: '<= 2', satuan: '%', definisi: 'Benih yang tidak dapat berkecambah', keterangan: '-', metodeId: createdMethods['ISTA 2.3'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P007', nama: 'Berat 1000 Biji', kategori: 'Fisik', batasAcuan: '-', satuan: 'gram', definisi: 'Berat dari 1000 butir benih murni yang dihitung secara acak', keterangan: '-', metodeId: createdMethods['ISTA 2.3'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P008', nama: 'Benih Lain (Other Seed)', kategori: 'Fisik', batasAcuan: '<= 0,5', satuan: '%', definisi: 'Benih dari spesies tanaman lain atau gulma yang terdapat dalam contoh', keterangan: '-', metodeId: createdMethods['ISTA 2.7'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P009', nama: 'Kotoran (Inert Matter)', kategori: 'Fisik', batasAcuan: '<= 2', satuan: '%', definisi: 'Benda mati, potongan benih, atau materi lain yang bukan benih murni', keterangan: '-', metodeId: createdMethods['ISTA 2.9'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P010', nama: 'Kecambah Normal', kategori: 'Fisiologis', batasAcuan: '>= 80', satuan: '%', definisi: 'Kecambah yang menunjukkan potensi untuk berkembang menjadi tanaman normal', keterangan: '-', metodeId: createdMethods['ISTA 5.1.1'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P011', nama: 'Kecambah Abnormal', kategori: 'Fisiologis', batasAcuan: '<= 20', satuan: '%', definisi: 'Kecambah yang cacat, tidak lengkap, atau terinfeksi yang tidak dapat tumbuh normal', keterangan: '-', metodeId: createdMethods['ISTA 5.1.1'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' },
    { kode: 'P012', nama: 'Uji Viabilitas', kategori: 'Fisiologis', batasAcuan: '>= 70', satuan: '%', definisi: 'Potensi hidup benih', keterangan: '-', metodeId: createdMethods['ISTA 5.2.2'].id, standarId: createdStandards['ISTA 2023'].id, status: 'Aktif' }
  ];

  for (const p of parameters) {
    await prisma.testParameter.upsert({ where: { kode: p.kode }, update: p, create: p });
  }

  const documents = [
    { kode: 'DOC-QC-001', nama: 'Prosedur Pengujian Daya Tumbuh', kategori: 'Prosedur', tipeFile: 'PDF', versi: '2.1', tanggalBerlaku: new Date('2024-05-01'), status: 'Aktif' },
    { kode: 'DOC-QC-002', nama: 'Prosedur Pengujian Kadar Air', kategori: 'Prosedur', tipeFile: 'PDF', versi: '1.3', tanggalBerlaku: new Date('2024-02-10'), status: 'Aktif' },
    { kode: 'DOC-QC-013', nama: 'Formulir Pencatatan Hasil Uji', kategori: 'Formulir', tipeFile: 'XLSX', versi: '1.5', tanggalBerlaku: new Date('2024-04-15'), status: 'Aktif' },
    { kode: 'DOC-QC-018', nama: 'Panduan Interpretasi Hasil Uji', kategori: 'Referensi', tipeFile: 'PDF', versi: '1.0', tanggalBerlaku: new Date('2024-01-25'), status: 'Kadaluarsa' }
  ];

  for (const doc of documents) {
    await prisma.supportDocument.upsert({ where: { kode: doc.kode }, update: doc, create: doc });
  }

  await seedQcCertificates(prisma);
  await seedQcDayaTumbuh(prisma);
  await seedQcKadarAir(prisma);
}

async function seedQcCertificates(prisma: any) {
  console.log('Seeding QC Certificates...');
  const certificates = [
    { noSertifikat: "QC-2026-0001", kodeBatch: "QC-2606-0001", komoditas: "Padi", varietas: "Inpari 32", parameter: "5 Parameter", tglUji: new Date("2026-06-11"), tglTerbit: new Date("2026-06-12"), status: "Diterbitkan", berlakuHingga: new Date("2026-12-12") },
    { noSertifikat: "QC-2026-0002", kodeBatch: "QC-2606-0002", komoditas: "Jagung", varietas: "Pioneer 21", parameter: "5 Parameter", tglUji: new Date("2026-06-11"), tglTerbit: new Date("2026-06-12"), status: "Diterbitkan", berlakuHingga: new Date("2026-12-12") },
    { noSertifikat: "QC-2026-0005", kodeBatch: "QC-2606-0005", komoditas: "Jagung", varietas: "Bisi 18", parameter: "5 Parameter", tglUji: new Date("2026-06-09"), tglTerbit: new Date("2026-06-10"), status: "Menunggu", berlakuHingga: new Date("2026-12-10") },
    { noSertifikat: "QC-2026-0009", kodeBatch: "QC-2606-0009", komoditas: "Padi", varietas: "Mekongga", parameter: "5 Parameter", tglUji: new Date("2026-06-07"), tglTerbit: new Date("2026-06-08"), status: "Tidak Lulus", berlakuHingga: null },
  ];

  for (const cert of certificates) {
    await prisma.qcCertificate.upsert({ where: { noSertifikat: cert.noSertifikat }, update: cert, create: cert });
  }
}

async function seedQcDayaTumbuh(prisma: any) {
  console.log('Seeding QC Daya Tumbuh...');
  
  const parameters = JSON.stringify([
    { parameter: 'Daya Tumbuh', satuan: '%', batasMinimal: 85, hasilUji: 96.50, status: 'Lulus' },
    { parameter: 'Kadar Air', satuan: '%', batasMinimal: 12, hasilUji: 10.5, status: 'Lulus' },
    { parameter: 'Kemurnian', satuan: '%', batasMinimal: 98, hasilUji: 99.2, status: 'Lulus' },
    { parameter: 'Benih Mati', satuan: '%', batasMinimal: 2, hasilUji: 1.5, status: 'Lulus' },
    { parameter: 'Benih Lain (Other Seed)', satuan: '%', batasMinimal: 0.5, hasilUji: 0.1, status: 'Lulus' }
  ]);

  const tests = [
    { kodeBatch: 'QC-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', tanggalUji: new Date('2026-06-11'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 96.50, batasMinimal: 85, status: 'Lulus', sertifikat: 'CT-2606-0001', jumlahBenihDitanam: 400, jumlahBerkecambah: 386, jumlahTidakBerkecambah: 14, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang', kelembabanMedia: '70 - 80 %', parameterUji: parameters },
    { kodeBatch: 'QC-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', tanggalUji: new Date('2026-06-10'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 93.20, batasMinimal: 80, status: 'Lulus', sertifikat: 'CT-2606-0002' },
    { kodeBatch: 'QC-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', tanggalUji: new Date('2026-06-10'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 88.70, batasMinimal: 80, status: 'Lulus', sertifikat: 'CT-2606-0003' },
    { kodeBatch: 'QC-2606-0004', komoditas: 'Padi', varietas: 'Inpari 42', tanggalUji: new Date('2026-06-09'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 79.50, batasMinimal: 85, status: 'Tidak Lulus', sertifikat: '-' },
    { kodeBatch: 'QC-2606-0005', komoditas: 'Jagung', varietas: 'Bisi 18', tanggalUji: new Date('2026-06-09'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 91.10, batasMinimal: 80, status: 'Lulus', sertifikat: 'CT-2606-0005' },
    { kodeBatch: 'QC-2606-0006', komoditas: 'Padi', varietas: 'Ciherang', tanggalUji: new Date('2026-06-08'), petugasUji: 'Dewi Lestari', metodeUji: 'Top of Paper', jumlahSampel: 400, dayaTumbuh: 90.30, batasMinimal: 85, status: 'Lulus', sertifikat: 'CT-2606-0006' },
    { kodeBatch: 'QC-2606-0007', komoditas: 'Kedelai', varietas: 'Dega 1', tanggalUji: new Date('2026-06-07'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 73.20, batasMinimal: 80, status: 'Tidak Lulus', sertifikat: '-' },
    { kodeBatch: 'QC-2606-0008', komoditas: 'Jagung', varietas: 'Pioneer 21', tanggalUji: new Date('2026-06-06'), petugasUji: 'Dewi Lestari', metodeUji: 'ISTA', jumlahSampel: 400, dayaTumbuh: 94.80, batasMinimal: 80, status: 'Lulus', sertifikat: 'CT-2606-0008' },
  ];

  for (const test of tests) {
    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: test.komoditas } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: test.varietas } });

    const { komoditas, varietas, ...testData } = test;

    await prisma.qcDayaTumbuh.upsert({ 
      where: { kodeBatch: test.kodeBatch }, 
      update: { ...testData, commodityId: commodity?.id, varietyId: variety?.id }, 
      create: { ...testData, commodityId: commodity?.id, varietyId: variety?.id } 
    });
  }
}

async function seedQcKadarAir(prisma: any) {
  console.log('Seeding QC Kadar Air...');
  
  const parameters = JSON.stringify([
    { parameter: 'Kadar Air', satuan: '%', batasMaksimal: 13, hasilUji: 11.2, status: 'Memenuhi' }
  ]);

  const tests = [
    { kodeBatch: 'QC-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', lotNumber: 'LOT-2606-0001', tanggalUji: new Date('2026-06-11'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 11.2, batasMaksimal: 13.0, status: 'Memenuhi', sertifikat: 'CT-2606-0001', alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', ulangan: '2 kali', beratAwal: 5.0, beratAkhir: 4.4, parameterUji: parameters },
    { kodeBatch: 'QC-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', lotNumber: 'LOT-2606-0002', tanggalUji: new Date('2026-06-11'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 13.8, batasMaksimal: 14.0, status: 'Mendekati', sertifikat: 'CT-2606-0002' },
    { kodeBatch: 'QC-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', lotNumber: 'LOT-2606-0003', tanggalUji: new Date('2026-06-10'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 9.6, batasMaksimal: 13.0, status: 'Memenuhi', sertifikat: 'CT-2606-0003' },
    { kodeBatch: 'QC-2606-0004', komoditas: 'Padi', varietas: 'Inpari 42', lotNumber: 'LOT-2606-0004', tanggalUji: new Date('2026-06-10'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 12.6, batasMaksimal: 13.0, status: 'Memenuhi', sertifikat: 'CT-2606-0004' },
    { kodeBatch: 'QC-2606-0005', komoditas: 'Jagung', varietas: 'Bisi 18', lotNumber: 'LOT-2606-0005', tanggalUji: new Date('2026-06-09'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 14.7, batasMaksimal: 14.0, status: 'Tidak Memenuhi', sertifikat: 'CT-2606-0005' },
    { kodeBatch: 'QC-2606-0006', komoditas: 'Padi', varietas: 'Ciherang', lotNumber: 'LOT-2606-0006', tanggalUji: new Date('2026-06-08'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 11.5, batasMaksimal: 13.0, status: 'Memenuhi', sertifikat: 'CT-2606-0006' },
    { kodeBatch: 'QC-2606-0007', komoditas: 'Kedelai', varietas: 'Dega 1', lotNumber: 'LOT-2606-0007', tanggalUji: new Date('2026-06-08'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 10.3, batasMaksimal: 13.0, status: 'Memenuhi', sertifikat: 'CT-2606-0007' },
    { kodeBatch: 'QC-2606-0010', komoditas: 'Jagung', varietas: 'NK 212', lotNumber: 'LOT-2606-0010', tanggalUji: new Date('2026-06-07'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', jumlahSampel: 116, kadarAir: 15.6, batasMaksimal: 14.0, status: 'Tidak Memenuhi', sertifikat: 'CT-2606-0010' },
  ];

  for (const test of tests) {
    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: test.komoditas } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: test.varietas } });
    const testMethod = await prisma.testMethod.findFirst({ where: { nama: test.testMethodName } });

    const { komoditas, varietas, testMethodName, ...testData } = test;

    await prisma.qcKadarAir.upsert({ 
      where: { kodeBatch: test.kodeBatch }, 
      update: { ...testData, commodityId: commodity?.id, varietyId: variety?.id, testMethodId: testMethod?.id }, 
      create: { ...testData, commodityId: commodity?.id, varietyId: variety?.id, testMethodId: testMethod?.id } 
    });
  }
}
