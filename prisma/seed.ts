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
  await seedPenguji(prisma);
  await seedQC(prisma);
  await seedModulProduksi(prisma);
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
    { kode: 'ISTA 2-001', nama: 'ISTA 2-001 Kadar Air', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode penentuan kadar air', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-106', nama: 'ISTA 2-106 Kemurnian Benih', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode penentuan kemurnian benih', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-007', nama: 'ISTA 2-007 Daya Berkecambah', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengujian daya tumbuh benih', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-004', nama: 'ISTA 2-004 Vigor', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengujian vigor benih', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-103', nama: 'ISTA 2-103 Benih Murni', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengujian benih murni', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-105', nama: 'ISTA 2-105 Benih Tanaman Lain', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengujian benih tanaman lain', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-107', nama: 'ISTA 2-107 Kotoran Benih', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengujian kotoran benih', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-101', nama: 'ISTA 2-101 Berat 1.000 Butir', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengukuran berat 1000 butir', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'ISTA 2-032', nama: 'ISTA 2-032 Kesehatan Benih', organisasi: 'ISTA', versiTahun: '2023', deskripsi: 'Metode pengujian kesehatan benih', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'AOAC 942.05', nama: 'AOAC 942.05 Kadar Abu', organisasi: 'AOAC', versiTahun: '2020', deskripsi: 'Metode pengujian kadar abu', jenis: 'Standar Internasional', bahasa: 'Inggris', status: 'Aktif' },
    { kode: 'SNI 06-6989.11-2004', nama: 'SNI pH', organisasi: 'BSN', versiTahun: '2004', deskripsi: 'Metode pengujian pH', jenis: 'Standar Nasional', bahasa: 'Indonesia', status: 'Aktif' },
    { kode: 'SNI 6989.84-2019', nama: 'SNI Logam Berat', organisasi: 'BSN', versiTahun: '2019', deskripsi: 'Metode pengujian logam berat', jenis: 'Standar Nasional', bahasa: 'Indonesia', status: 'Aktif' }
  ];

  const createdStandards: Record<string, any> = {};
  for (const s of standards) {
    createdStandards[s.kode] = await prisma.referenceStandard.upsert({ where: { kode: s.kode }, update: s, create: s });
  }

  const methods = [
    { kode: 'MT-001', nama: 'Kadar Air', jenisUji: 'Fisik', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-001'].id, status: 'Aktif' },
    { kode: 'MT-002', nama: 'Kemurnian Benih', jenisUji: 'Visual', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-106'].id, status: 'Aktif' },
    { kode: 'MT-003', nama: 'Daya Berkecambah', jenisUji: 'Fisiologi', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-007'].id, status: 'Aktif' },
    { kode: 'MT-004', nama: 'Vigor', jenisUji: 'Fisiologi', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-004'].id, status: 'Aktif' },
    { kode: 'MT-005', nama: 'Benih Murni', jenisUji: 'Visual', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-103'].id, status: 'Aktif' },
    { kode: 'MT-006', nama: 'Benih Tanaman Lain', jenisUji: 'Visual', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-105'].id, status: 'Aktif' },
    { kode: 'MT-007', nama: 'Kotoran Benih', jenisUji: 'Visual', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-107'].id, status: 'Aktif' },
    { kode: 'MT-008', nama: 'Berat 1.000 Butir', jenisUji: 'Fisik', komoditas: 'Semua Komoditas', standarId: createdStandards['ISTA 2-101'].id, status: 'Aktif' },
    { kode: 'MT-009', nama: 'Kesehatan Benih', jenisUji: 'Biologis', komoditas: 'Sayuran, Padi, Jagung', standarId: createdStandards['ISTA 2-032'].id, status: 'Aktif' },
    { kode: 'MT-010', nama: 'Kadar Abu', jenisUji: 'Kimia', komoditas: 'Padi, Jagung', standarId: createdStandards['AOAC 942.05'].id, status: 'Aktif' },
    { kode: 'MT-011', nama: 'pH', jenisUji: 'Kimia', komoditas: 'Cabai, Tomat', standarId: createdStandards['SNI 06-6989.11-2004'].id, status: 'Aktif' },
    { kode: 'MT-012', nama: 'Logam Berat (Pb, Cd, Hg)', jenisUji: 'Kimia', komoditas: 'Semua Komoditas', standarId: createdStandards['SNI 6989.84-2019'].id, status: 'Nonaktif' }
  ];

  const createdMethods: Record<string, any> = {};
  for (const m of methods) {
    createdMethods[m.kode] = await prisma.testMethod.upsert({ where: { kode: m.kode }, update: m, create: m });
  }

  const parameters = [
    { kode: 'P001', nama: 'Daya Tumbuh', kategori: 'Fisiologis', batasAcuan: '>= 80', satuan: '%', definisi: 'Persentase kecambah normal yang dihasilkan dari benih murni dalam kondisi optimal pada periode waktu tertentu.', keterangan: 'Pengujian dilakukan dengan media kertas merang pada suhu 25°C ± 2°C selama 7 hari.', metodeId: createdMethods['MT-003'].id, status: 'Aktif' },
    { kode: 'P002', nama: 'Kadar Air', kategori: 'Fisik', batasAcuan: '<= 12', satuan: '%', definisi: 'Kandungan air dalam benih', keterangan: 'Oven method', metodeId: createdMethods['MT-001'].id, status: 'Aktif' },
    { kode: 'P003', nama: 'Kemurnian', kategori: 'Fisik', batasAcuan: '>= 98', satuan: '%', definisi: 'Persentase berat benih murni dari spesies yang diuji dalam suatu contoh uji', keterangan: 'Pemisahan manual', metodeId: createdMethods['MT-002'].id, status: 'Aktif' },
    { kode: 'P004', nama: 'Vigor', kategori: 'Fisiologis', batasAcuan: '>= 70', satuan: '%', definisi: 'Kemampuan benih untuk tumbuh normal pada kondisi suboptimal', keterangan: 'Accelerated aging test', metodeId: createdMethods['MT-004'].id, status: 'Aktif' },
    { kode: 'P005', nama: 'Uji Patogen', kategori: 'Kesehatan', batasAcuan: 'Bebas', satuan: '-', definisi: 'Pemeriksaan keberadaan patogen (jamur, bakteri, virus) pada benih', keterangan: 'Blotter test', metodeId: createdMethods['MT-009'].id, status: 'Aktif' },
    { kode: 'P006', nama: 'Benih Mati', kategori: 'Fisiologis', batasAcuan: '<= 2', satuan: '%', definisi: 'Benih yang tidak dapat berkecambah', keterangan: '-', metodeId: createdMethods['MT-003'].id, status: 'Aktif' },
    { kode: 'P007', nama: 'Berat 1000 Biji', kategori: 'Fisik', batasAcuan: '-', satuan: 'gram', definisi: 'Berat dari 1000 butir benih murni yang dihitung secara acak', keterangan: '-', metodeId: createdMethods['MT-008'].id, status: 'Aktif' },
    { kode: 'P008', nama: 'Benih Lain (Other Seed)', kategori: 'Fisik', batasAcuan: '<= 0,5', satuan: '%', definisi: 'Benih dari spesies tanaman lain atau gulma yang terdapat dalam contoh', keterangan: '-', metodeId: createdMethods['MT-006'].id, status: 'Aktif' },
    { kode: 'P009', nama: 'Kotoran (Inert Matter)', kategori: 'Fisik', batasAcuan: '<= 2', satuan: '%', definisi: 'Benda mati, potongan benih, atau materi lain yang bukan benih murni', keterangan: '-', metodeId: createdMethods['MT-007'].id, status: 'Aktif' },
    { kode: 'P010', nama: 'Kecambah Normal', kategori: 'Fisiologis', batasAcuan: '>= 80', satuan: '%', definisi: 'Kecambah yang menunjukkan potensi untuk berkembang menjadi tanaman normal', keterangan: '-', metodeId: createdMethods['MT-003'].id, status: 'Aktif' },
    { kode: 'P011', nama: 'Kecambah Abnormal', kategori: 'Fisiologis', batasAcuan: '<= 20', satuan: '%', definisi: 'Kecambah yang cacat, tidak lengkap, atau terinfeksi yang tidak dapat tumbuh normal', keterangan: '-', metodeId: createdMethods['MT-003'].id, status: 'Aktif' },
    { kode: 'P012', nama: 'Uji Viabilitas', kategori: 'Fisiologis', batasAcuan: '>= 70', satuan: '%', definisi: 'Potensi hidup benih', keterangan: '-', metodeId: createdMethods['MT-003'].id, status: 'Aktif' }
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
  await seedQcTests(prisma);
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





async function seedQcTests(prisma: any) {
  console.log('Seeding QC Tests...');

  const dewi = await prisma.penguji.findFirst({ where: { nama: 'Dewi Lestari' } });
  const budi = await prisma.penguji.findFirst({ where: { nama: 'Budi Santoso' } });
  const ratna = await prisma.penguji.findFirst({ where: { nama: 'Ratna Sari' } });

  const dewiId = dewi?.id || null;
  const budiId = budi?.id || null;
  const ratnaId = ratna?.id || null;

  const tests = [
    // --- Daya Tumbuh ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-12'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 75.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 300, jumlahTidakBerkecambah: 100, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-16'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 82.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 328, jumlahTidakBerkecambah: 72, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Padi', varietas: 'IR 64', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-20'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 70.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 280, jumlahTidakBerkecambah: 120, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0004', komoditas: 'Jagung', varietas: 'Bisi 2', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-24'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 78.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 312, jumlahTidakBerkecambah: 88, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0005', komoditas: 'Jagung', varietas: 'Pioneer 21', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-28'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 65.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 260, jumlahTidakBerkecambah: 140, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0006', komoditas: 'Kedelai', varietas: 'Anjasmoro', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-01'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 85.0, batasAcuan: 85, status: 'Lulus', sertifikat: 'CT-DT-001',
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 340, jumlahTidakBerkecambah: 60, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0007', komoditas: 'Kedelai', varietas: 'Grobogan', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-05'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 75.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 300, jumlahTidakBerkecambah: 100, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0008', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-09'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 70.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 280, jumlahTidakBerkecambah: 120, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0009', komoditas: 'Padi', varietas: 'Ciherang', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-11'), petugasUjiId: dewiId, testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 96.5, batasAcuan: 85, status: 'Lulus', sertifikat: 'CT-DT-002',
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 386, jumlahTidakBerkecambah: 14, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    
    // --- Kadar Air ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-05-15'), petugasUjiId: dewiId, testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 11.2, batasAcuan: 13.0, status: 'Lulus', sertifikat: 'CT-KA-001',
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.4 }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-05-18'), petugasUjiId: dewiId, testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 12.5, batasAcuan: 13.0, status: 'Lulus', sertifikat: null,
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.37 }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Jagung', varietas: 'Bisi 2', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-05-22'), petugasUjiId: dewiId, testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 14.1, batasAcuan: 12.0, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.29 }
    },
    { 
      kodeBatch: 'BP-2606-0004', komoditas: 'Kedelai', varietas: 'Anjasmoro', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-06-02'), petugasUjiId: dewiId, testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 10.5, batasAcuan: 11.0, status: 'Lulus', sertifikat: 'CT-KA-002',
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.47 }
    },

    // --- Kemurnian ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kemurnian', 
      tanggalUji: new Date('2026-05-13'), petugasUjiId: budiId, testMethodName: 'Purity Analysis', 
      jumlahSampel: 500, nilaiHasil: 99.2, batasAcuan: 98.0, status: 'Memenuhi', sertifikat: 'CT-KM-001',
      detailUji: { beratBenihMurni: 496, beratTanamanLain: 1, beratGulma: 1, beratBahanAsing: 2, alatInstrumen: 'Timbangan Digital' }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Jagung', varietas: 'Bisi 2', jenisUji: 'Kemurnian', 
      tanggalUji: new Date('2026-05-25'), petugasUjiId: budiId, testMethodName: 'Purity Analysis', 
      jumlahSampel: 900, nilaiHasil: 97.5, batasAcuan: 98.0, status: 'Mendekati', sertifikat: null,
      detailUji: { beratBenihMurni: 877.5, beratTanamanLain: 10, beratGulma: 2.5, beratBahanAsing: 10, alatInstrumen: 'Timbangan Digital' }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Kedelai', varietas: 'Grobogan', jenisUji: 'Kemurnian', 
      tanggalUji: new Date('2026-06-06'), petugasUjiId: budiId, testMethodName: 'Purity Analysis', 
      jumlahSampel: 1000, nilaiHasil: 94.8, batasAcuan: 98.0, status: 'Tidak Memenuhi', sertifikat: null,
      detailUji: { beratBenihMurni: 948, beratTanamanLain: 20, beratGulma: 10, beratBahanAsing: 22, alatInstrumen: 'Timbangan Digital' }
    },

    // --- Vigor ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Vigor', 
      tanggalUji: new Date('2026-05-14'), petugasUjiId: ratnaId, testMethodName: 'Vigor Test', 
      jumlahSampel: 400, nilaiHasil: 880, batasAcuan: 800, status: 'Memenuhi', sertifikat: 'CT-VG-001',
      detailUji: { kategori: 'Tinggi', alatInstrumen: 'Germinator', suhuRuangan: '26°C' }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', jenisUji: 'Vigor', 
      tanggalUji: new Date('2026-05-29'), petugasUjiId: ratnaId, testMethodName: 'Vigor Test', 
      jumlahSampel: 400, nilaiHasil: 750, batasAcuan: 800, status: 'Mendekati', sertifikat: null,
      detailUji: { kategori: 'Sedang', alatInstrumen: 'Germinator', suhuRuangan: '27°C' }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', jenisUji: 'Vigor', 
      tanggalUji: new Date('2026-06-03'), petugasUjiId: ratnaId, testMethodName: 'Vigor Test', 
      jumlahSampel: 400, nilaiHasil: 590, batasAcuan: 800, status: 'Tidak Memenuhi', sertifikat: null,
      detailUji: { kategori: 'Rendah', alatInstrumen: 'Germinator', suhuRuangan: '26°C' }
    }
  ];

  for (const test of tests) {
    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: test.komoditas } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: test.varietas } });
    const testMethod = await prisma.testMethod.findFirst({ where: { nama: test.testMethodName } });

    const { komoditas, varietas, testMethodName, ...testData } = test;

    if (testMethod) {
      let targetBatch = test.kodeBatch;
      const existingBatch = await prisma.batchProduksi.findFirst({ where: { komoditas: test.komoditas } });
      if (existingBatch) {
        targetBatch = existingBatch.kodeBatch;
      }
      
      await prisma.qcTest.upsert({ 
        where: { kodeBatch_testMethodId: { kodeBatch: targetBatch, testMethodId: testMethod.id } }, 
        update: { ...testData, kodeBatch: targetBatch, commodityId: commodity?.id, varietyId: variety?.id, testMethodId: testMethod.id }, 
        create: { ...testData, kodeBatch: targetBatch, commodityId: commodity?.id, varietyId: variety?.id, testMethodId: testMethod.id } 
      });
    }
  }
}

async function seedJadwalTanam(prisma: any) {
  console.log('Seeding Jadwal Tanam (10 data)...');

  const jadwalTanams = [
    {
      kodeJadwalTanam: 'JT-2606-0001',
      periodeTanam: 'Juni 2026 - September 2026',
      periodeTanamMulai: new Date('2026-06-01'),
      periodeTanamSelesai: new Date('2026-09-25'),
      musimTanam: 'Musim Kemarau (MK I)',
      tujuanProduksi: 'Benih Bersertifikat (FS)',
      tipeProduksi: 'FS (Foundation Seed)',
      statusJadwal: 'Berjalan',
      penanggungJawab: 'Budi Santoso',
      deskripsi: 'Jadwal penanaman benih padi varietas Inpari 32 untuk produksi FS.',
      komoditasNama: 'Padi',
      varietasNama: 'Inpari 32',
      luasTanam: 2.5,
      asalBenih: 'BB Padi Subang',
      jumlahBenihDiperlukan: 62.5,
      jarakTanam: '25 cm x 25 cm',
      sistemTanam: 'Jajar Legowo 4:1',
      targetProduksi: 17500,
      standarKualitas: 'SNI 01-6233-2015 (Kemurnian 99%, Daya Tumbuh 85%)',
      perkecambahanMin: 85,
      tanggalPersemaian: new Date('2026-05-15'),
      tanggalTanam: new Date('2026-06-01'),
      perkiraanPanen: new Date('2026-09-25'),
      siklusTanamHari: 115,
      metodeTanam: 'Transplanting (Pindah Tanam)',
      kepadatanTanam: '160.000 rumpun/ha',
      irigasi: 'Irigasi Teknis Intermittent',
      sumberAir: 'Waduk Jatiluhur',
      catatan: 'Pengawasan ketat terhadap serangan hama wereng coklat.',
      detailLahan: [
        { namaLahan: 'Lahan Utama A1', luas: 1.5, tipeLahan: 'Lahan Sawah Irigasi', irigasi: 'Irigasi Teknis', sumberAir: 'Waduk Jatiluhur' },
        { namaLahan: 'Lahan Pendukung A2', luas: 1.0, tipeLahan: 'Lahan Sawah Irigasi', irigasi: 'Irigasi Teknis', sumberAir: 'Waduk Jatiluhur' },
      ],
      personil: [
        { nama: 'Budi Santoso', peran: 'Penanggung Jawab', kontak: '0812-3456-7890', tugas: 'Koordinasi seluruh kegiatan lapangan' },
        { nama: 'Ahmad Subagja', peran: 'Teknisi Lapangan', kontak: '0813-9876-5432', tugas: 'Monitoring harian dan pemupukan' },
      ],
      peralatan: [
        { nama: 'Combine Harvester', jenis: 'Mesin Panen', jumlah: 1, satuan: 'Unit', kondisi: 'Baik' },
        { nama: 'Hand Tractor', jenis: 'Mesin Olah Tanah', jumlah: 2, satuan: 'Unit', kondisi: 'Baik' },
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0002',
      periodeTanam: 'Juni 2026 - Oktober 2026',
      periodeTanamMulai: new Date('2026-06-10'),
      periodeTanamSelesai: new Date('2026-10-02'),
      musimTanam: 'Musim Kemarau (MK I)',
      tujuanProduksi: 'Benih Pokok (SS)',
      tipeProduksi: 'SS (Stock Seed)',
      statusJadwal: 'Berjalan',
      penanggungJawab: 'Siti Nurhayati',
      deskripsi: 'Penanaman benih padi Inpari 42 tahan blas dan wereng.',
      komoditasNama: 'Padi',
      varietasNama: 'Inpari 42',
      luasTanam: 3.0,
      asalBenih: 'BB Padi Sukamandi',
      jumlahBenihDiperlukan: 75.0,
      jarakTanam: '20 cm x 20 cm',
      sistemTanam: 'Jajar Legowo 2:1',
      targetProduksi: 22500,
      standarKualitas: 'SNI 01-6233-2015 (Kemurnian 98%, Daya Tumbuh 85%)',
      perkecambahanMin: 85,
      tanggalPersemaian: new Date('2026-05-25'),
      tanggalTanam: new Date('2026-06-10'),
      perkiraanPanen: new Date('2026-10-02'),
      siklusTanamHari: 112,
      metodeTanam: 'Transplanting (Pindah Tanam)',
      kepadatanTanam: '250.000 rumpun/ha',
      irigasi: 'Saluran Primer Subak',
      sumberAir: 'Sungai Citarum',
      catatan: 'Varietas tahan penyakit blas.',
      detailLahan: [
        { namaLahan: 'Blok B Subang 1', luas: 3.0, tipeLahan: 'Lahan Sawah Irigasi', irigasi: 'Saluran Primer Subak', sumberAir: 'Sungai Citarum' }
      ],
      personil: [
        { nama: 'Siti Nurhayati', peran: 'Penanggung Jawab', kontak: '0812-3456-7891', tugas: 'Pengawasan mutu benih' }
      ],
      peralatan: [
        { nama: 'Transplanter Robotik', jenis: 'Mesin Tanam', jumlah: 1, satuan: 'Unit', kondisi: 'Sangat Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0003',
      periodeTanam: 'Mei 2026 - Agustus 2026',
      periodeTanamMulai: new Date('2026-05-20'),
      periodeTanamSelesai: new Date('2026-08-30'),
      musimTanam: 'Musim Kemarau (MK I)',
      tujuanProduksi: 'Benih Komersial (ES)',
      tipeProduksi: 'ES (Extension Seed)',
      statusJadwal: 'Berjalan',
      penanggungJawab: 'Agus Widodo',
      deskripsi: 'Produksi jagung hibrida P-21 kualitas unggul.',
      komoditasNama: 'Jagung',
      varietasNama: 'Jagung Hibrida P-21',
      luasTanam: 4.0,
      asalBenih: 'PT Pioneer Hibrida',
      jumlahBenihDiperlukan: 80.0,
      jarakTanam: '75 cm x 20 cm',
      sistemTanam: 'Baris Tunggal (Single Row)',
      targetProduksi: 32000,
      standarKualitas: 'Standar Mutu Benih Jagung Hibrida ES',
      perkecambahanMin: 90,
      tanggalPersemaian: new Date('2026-05-15'),
      tanggalTanam: new Date('2026-05-20'),
      perkiraanPanen: new Date('2026-08-30'),
      siklusTanamHari: 102,
      metodeTanam: 'Tabela (Tanam Biji Langsung)',
      kepadatanTanam: '66.666 tanaman/ha',
      irigasi: 'Drip Irrigation (Tetes)',
      sumberAir: 'Sumur Dalam (Deep Well)',
      catatan: 'Pemupukan susulan NPK pada HST 15 dan 30.',
      detailLahan: [
        { namaLahan: 'Lahan Dryland C1', luas: 4.0, tipeLahan: 'Lahan Kering Tegal', irigasi: 'Drip Irrigation', sumberAir: 'Sumur Dalam' }
      ],
      personil: [
        { nama: 'Agus Widodo', peran: 'Penanggung Jawab', kontak: '0812-3456-7892', tugas: 'Manajemen budidaya jagung' }
      ],
      peralatan: [
        { nama: 'Seed Planter Corn', jenis: 'Alat Tanam', jumlah: 2, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0004',
      periodeTanam: 'Juli 2026 - September 2026',
      periodeTanamMulai: new Date('2026-07-01'),
      periodeTanamSelesai: new Date('2026-09-15'),
      musimTanam: 'Musim Kemarau (MK II)',
      tujuanProduksi: 'Benih Bersertifikat (FS)',
      tipeProduksi: 'FS (Foundation Seed)',
      statusJadwal: 'Disetujui',
      penanggungJawab: 'Rizky Pratama',
      deskripsi: 'Budidaya kedelai varietas Grobogan biji besar.',
      komoditasNama: 'Kedelai',
      varietasNama: 'Kedelai Grobogan',
      luasTanam: 2.0,
      asalBenih: 'Balitkabi Malang',
      jumlahBenihDiperlukan: 100.0,
      jarakTanam: '40 cm x 15 cm',
      sistemTanam: 'Tanpa Olah Tanah (TOT)',
      targetProduksi: 5400,
      standarKualitas: 'Mutu Benih Kedelai Kelas FS',
      perkecambahanMin: 85,
      tanggalPersemaian: new Date('2026-06-25'),
      tanggalTanam: new Date('2026-07-01'),
      perkiraanPanen: new Date('2026-09-15'),
      siklusTanamHari: 76,
      metodeTanam: 'Tanam Langsung Mulsa Jerami',
      kepadatanTanam: '166.000 tanaman/ha',
      irigasi: 'Sprinkler / Pompa Air',
      sumberAir: 'Sungai Brantas',
      catatan: 'Varietas genjah 76 hari panen.',
      detailLahan: [
        { namaLahan: 'Petak Jember D1', luas: 2.0, tipeLahan: 'Sawah Sisa Padi', irigasi: 'Sprinkler', sumberAir: 'Sungai Brantas' }
      ],
      personil: [
        { nama: 'Rizky Pratama', peran: 'Penanggung Jawab', kontak: '0812-3456-7893', tugas: 'Supervisi TOT Kedelai' }
      ],
      peralatan: [
        { nama: 'Pompa Sprinkler', jenis: 'Alat Irigasi', jumlah: 1, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0005',
      periodeTanam: 'Januari 2026 - Mei 2026',
      periodeTanamMulai: new Date('2026-01-15'),
      periodeTanamSelesai: new Date('2026-05-20'),
      musimTanam: 'Musim Hujan (MH 2025/2026)',
      tujuanProduksi: 'Benih Penjenis (BS)',
      tipeProduksi: 'BS (Breeder Seed)',
      statusJadwal: 'Selesai',
      penanggungJawab: 'Ir. Handoko',
      deskripsi: 'Perbanyakan benih penjenis Ciherang standar pemuliaan.',
      komoditasNama: 'Padi',
      varietasNama: 'Ciherang',
      luasTanam: 1.5,
      asalBenih: 'Koleksi Plasma Nutfah BB Padi',
      jumlahBenihDiperlukan: 37.5,
      jarakTanam: '25 cm x 25 cm',
      sistemTanam: 'Jajar Legowo 4:1',
      targetProduksi: 9800,
      standarKualitas: 'Kemurnian Varietal 100% (Breeder Seed)',
      perkecambahanMin: 95,
      tanggalPersemaian: new Date('2025-12-25'),
      tanggalTanam: new Date('2026-01-15'),
      perkiraanPanen: new Date('2026-05-20'),
      siklusTanamHari: 125,
      metodeTanam: 'Transplanting Manual Single Seedling',
      kepadatanTanam: '160.000 rumpun/ha',
      irigasi: 'Irigasi Teknis Kontinu',
      sumberAir: 'Saluran Subak Central',
      catatan: 'Panen telah selesai dengan hasil 10.2 ton.',
      detailLahan: [
        { namaLahan: 'Lahan Riset E1', luas: 1.5, tipeLahan: 'Lahan Sawah Irigasi', irigasi: 'Irigasi Teknis', sumberAir: 'Saluran Subak Central' }
      ],
      personil: [
        { nama: 'Ir. Handoko', peran: 'Pemulia Tanaman', kontak: '0811-2233-4455', tugas: 'Riset & Pemuliaan BS' }
      ],
      peralatan: [
        { nama: 'Thresher Manual Special', jenis: 'Perontok Benih', jumlah: 1, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0006',
      periodeTanam: 'Juni 2026 - September 2026',
      periodeTanamMulai: new Date('2026-06-15'),
      periodeTanamSelesai: new Date('2026-09-25'),
      musimTanam: 'Musim Kemarau (MK I)',
      tujuanProduksi: 'Benih Pokok (SS)',
      tipeProduksi: 'SS (Stock Seed)',
      statusJadwal: 'Berjalan',
      penanggungJawab: 'M. Fadli',
      deskripsi: 'Perbanyakan jagung N-27 toleran kekeringan.',
      komoditasNama: 'Jagung',
      varietasNama: 'Jagung Hibrida N-27',
      luasTanam: 5.0,
      asalBenih: 'PT Pioneer Hibrida',
      jumlahBenihDiperlukan: 100.0,
      jarakTanam: '70 cm x 20 cm',
      sistemTanam: 'Baris Ganda (Double Row)',
      targetProduksi: 45000,
      standarKualitas: 'Standar Mutu Benih Jagung SS',
      perkecambahanMin: 88,
      tanggalPersemaian: new Date('2026-06-10'),
      tanggalTanam: new Date('2026-06-15'),
      perkiraanPanen: new Date('2026-09-25'),
      siklusTanamHari: 100,
      metodeTanam: 'Tabela Mesin Penanam',
      kepadatanTanam: '71.400 tanaman/ha',
      irigasi: 'Pompa Diesel Sungai',
      sumberAir: 'Sungai Serayu',
      catatan: 'Monitoring intensif pada fase pembungaan.',
      detailLahan: [
        { namaLahan: 'Lahan Kebun F1', luas: 5.0, tipeLahan: 'Lahan Kering', irigasi: 'Pompa Diesel', sumberAir: 'Sungai Serayu' }
      ],
      personil: [
        { nama: 'M. Fadli', peran: 'Penanggung Jawab', kontak: '0812-3456-7897', tugas: 'Manajemen Lapangan' }
      ],
      peralatan: [
        { nama: 'Tractor 4-Wheel', jenis: 'Olah Tanah Heavy', jumlah: 1, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0007',
      periodeTanam: 'Juli 2026 - Oktober 2026',
      periodeTanamMulai: new Date('2026-07-10'),
      periodeTanamSelesai: new Date('2026-10-10'),
      musimTanam: 'Musim Kemarau (MK II)',
      tujuanProduksi: 'Benih Bersertifikat (FS)',
      tipeProduksi: 'FS (Foundation Seed)',
      statusJadwal: 'Disetujui',
      penanggungJawab: 'Dedi Kurniawan',
      deskripsi: 'Budidaya kacang tanah varietas Kelinci di lahan bedengan bermulsa.',
      komoditasNama: 'Kacang Tanah',
      varietasNama: 'Kacang Tanah Kelinci',
      luasTanam: 1.8,
      asalBenih: 'Balitkabi Malang',
      jumlahBenihDiperlukan: 180.0,
      jarakTanam: '40 cm x 10 cm',
      sistemTanam: 'Bedengan Bermulsa Plastik',
      targetProduksi: 4500,
      standarKualitas: 'Mutu Benih Kacang Tanah Kelas FS',
      perkecambahanMin: 85,
      tanggalPersemaian: new Date('2026-07-01'),
      tanggalTanam: new Date('2026-07-10'),
      perkiraanPanen: new Date('2026-10-10'),
      siklusTanamHari: 92,
      metodeTanam: 'Tanam Biji Manual',
      kepadatanTanam: '250.000 tanaman/ha',
      irigasi: 'Irigasi Alur (Furrow Irrigation)',
      sumberAir: 'Sumur Pantek',
      catatan: 'Persiapan lahan bedengan dan pemasangan mulsa.',
      detailLahan: [
        { namaLahan: 'Lahan Garut G1', luas: 1.8, tipeLahan: 'Lahan Bedengan Mulsa', irigasi: 'Furrow Irrigation', sumberAir: 'Sumur Pantek' }
      ],
      personil: [
        { nama: 'Dedi Kurniawan', peran: 'Penanggung Jawab', kontak: '0812-3456-7894', tugas: 'Supervisi Mulsa & Tanam' }
      ],
      peralatan: [
        { nama: 'Pelubang Mulsa', jenis: 'Alat Tanam Manual', jumlah: 5, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0008',
      periodeTanam: 'Februari 2026 - Juni 2026',
      periodeTanamMulai: new Date('2026-02-01'),
      periodeTanamSelesai: new Date('2026-06-05'),
      musimTanam: 'Musim Hujan (MH 2025/2026)',
      tujuanProduksi: 'Benih Komersial (ES)',
      tipeProduksi: 'ES (Extension Seed)',
      statusJadwal: 'Selesai',
      penanggungJawab: 'Hendra Wijaya',
      deskripsi: 'Penanaman benih padi Mekongga potensi hasil 8.4 ton/ha.',
      komoditasNama: 'Padi',
      varietasNama: 'Mekongga',
      luasTanam: 3.5,
      asalBenih: 'BB Padi Sukamandi',
      jumlahBenihDiperlukan: 87.5,
      jarakTanam: '25 cm x 25 cm',
      sistemTanam: 'Tegel Standard',
      targetProduksi: 24500,
      standarKualitas: 'SNI 01-6233-2015 (Kemurnian 98%, Daya Tumbuh 80%)',
      perkecambahanMin: 80,
      tanggalPersemaian: new Date('2026-01-10'),
      tanggalTanam: new Date('2026-02-01'),
      perkiraanPanen: new Date('2026-06-05'),
      siklusTanamHari: 120,
      metodeTanam: 'Transplanting Manual',
      kepadatanTanam: '160.000 rumpun/ha',
      irigasi: 'Irigasi Teknis',
      sumberAir: 'Saluran Sekunder Cimanuk',
      catatan: 'Panen berhasil dilaksanakan pada awal Juni 2026.',
      detailLahan: [
        { namaLahan: 'Lahan Brebes H1', luas: 3.5, tipeLahan: 'Lahan Sawah Irigasi', irigasi: 'Irigasi Teknis', sumberAir: 'Saluran Sekunder Cimanuk' }
      ],
      personil: [
        { nama: 'Hendra Wijaya', peran: 'Penanggung Jawab', kontak: '0812-3456-7896', tugas: 'Manajemen Panen' }
      ],
      peralatan: [
        { nama: 'Power Thresher', jenis: 'Perontok Padi', jumlah: 2, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0009',
      periodeTanam: 'Agustus 2026 - November 2026',
      periodeTanamMulai: new Date('2026-08-01'),
      periodeTanamSelesai: new Date('2026-10-30'),
      musimTanam: 'Musim Kemarau (MK II)',
      tujuanProduksi: 'Benih Pokok (SS)',
      tipeProduksi: 'SS (Stock Seed)',
      statusJadwal: 'Draft',
      penanggungJawab: 'Dian Prasetyo',
      deskripsi: 'Rencana perbanyakan kedelai Anjasmoro tahan pecah polong.',
      komoditasNama: 'Kedelai',
      varietasNama: 'Kedelai Anjasmoro',
      luasTanam: 1.2,
      asalBenih: 'Balitkabi Malang',
      jumlahBenihDiperlukan: 60.0,
      jarakTanam: '40 cm x 15 cm',
      sistemTanam: 'Tanpa Olah Tanah (TOT)',
      targetProduksi: 2800,
      standarKualitas: 'Mutu Benih Kedelai Kelas SS',
      perkecambahanMin: 85,
      tanggalPersemaian: new Date('2026-07-25'),
      tanggalTanam: new Date('2026-08-01'),
      perkiraanPanen: new Date('2026-10-30'),
      siklusTanamHari: 90,
      metodeTanam: 'Tabela Tanpa Olah Tanah',
      kepadatanTanam: '166.000 tanaman/ha',
      irigasi: 'Sprinkler / Pompa Air',
      sumberAir: 'Embung Desa',
      catatan: 'Masih dalam rancangan pengajuan anggaran.',
      detailLahan: [
        { namaLahan: 'Petak Lamongan I1', luas: 1.2, tipeLahan: 'Sawah Sisa Padi', irigasi: 'Sprinkler', sumberAir: 'Embung Desa' }
      ],
      personil: [
        { nama: 'Dian Prasetyo', peran: 'Penanggung Jawab', kontak: '0812-3456-7898', tugas: 'Penyusun Rencana Draft' }
      ],
      peralatan: [
        { nama: 'Sprinkler Portable', jenis: 'Irigasi', jumlah: 1, satuan: 'Set', kondisi: 'Baik' }
      ],
    },
    {
      kodeJadwalTanam: 'JT-2606-0010',
      periodeTanam: 'Mei 2026 - Agustus 2026',
      periodeTanamMulai: new Date('2026-05-01'),
      periodeTanamSelesai: new Date('2026-08-20'),
      musimTanam: 'Musim Kemarau (MK I)',
      tujuanProduksi: 'Uji Coba Adaptasi Lahan Kering',
      tipeProduksi: 'Trial / Riset',
      statusJadwal: 'Dibatalkan',
      penanggungJawab: 'Dewi Lestari',
      deskripsi: 'Uji coba penanaman padi Situ Bagendit di lahan tadah hujan.',
      komoditasNama: 'Padi',
      varietasNama: 'Situ Bagendit',
      luasTanam: 1.0,
      asalBenih: 'BB Padi Subang',
      jumlahBenihDiperlukan: 25.0,
      jarakTanam: '25 cm x 25 cm',
      sistemTanam: 'Tanam Benih Langsung (TABELA)',
      targetProduksi: 4000,
      standarKualitas: 'Uji Coba Internal',
      perkecambahanMin: 80,
      tanggalPersemaian: new Date('2026-04-20'),
      tanggalTanam: new Date('2026-05-01'),
      perkiraanPanen: new Date('2026-08-20'),
      siklusTanamHari: 110,
      metodeTanam: 'Tabela Gogo Rancah',
      kepadatanTanam: '160.000 rumpun/ha',
      irigasi: 'Rainfed (Tadah Hujan)',
      sumberAir: 'Tadah Hujan',
      catatan: 'Dibatalkan karena curah hujan tidak mencukupi.',
      detailLahan: [
        { namaLahan: 'Lahan Dryland J1', luas: 1.0, tipeLahan: 'Lahan Tadah Hujan', irigasi: 'Tadah Hujan', sumberAir: 'Tadah Hujan' }
      ],
      personil: [
        { nama: 'Dewi Lestari', peran: 'Penanggung Jawab', kontak: '0812-3456-7899', tugas: 'Evaluasi Riset' }
      ],
      peralatan: [
        { nama: 'Hand Sprayer', jenis: 'Semprot Hama', jumlah: 2, satuan: 'Unit', kondisi: 'Baik' }
      ],
    },
  ];

  for (const item of jadwalTanams) {
    const { komoditasNama, varietasNama, detailLahan, personil, peralatan, ...jadwalData } = item;

    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: komoditasNama } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: varietasNama } });

    const createdJadwal = await prisma.jadwalTanam.upsert({
      where: { kodeJadwalTanam: item.kodeJadwalTanam },
      update: {
        ...jadwalData,
        commodityId: commodity?.id,
        varietyId: variety?.id,
      },
      create: {
        ...jadwalData,
        commodityId: commodity?.id,
        varietyId: variety?.id,
        dibuatOleh: 'Admin',
        diubahOleh: 'Admin',
      },
    });

    if (detailLahan && detailLahan.length > 0) {
      await prisma.jadwalTanamDetail.deleteMany({ where: { jadwalTanamId: createdJadwal.id } });
      for (const dl of detailLahan) {
        await prisma.jadwalTanamDetail.create({
          data: {
            jadwalTanamId: createdJadwal.id,
            ...dl,
          },
        });
      }
    }

    if (personil && personil.length > 0) {
      await prisma.jadwalTanamPersonil.deleteMany({ where: { jadwalTanamId: createdJadwal.id } });
      for (const p of personil) {
        await prisma.jadwalTanamPersonil.create({
          data: {
            jadwalTanamId: createdJadwal.id,
            ...p,
          },
        });
      }
    }

    if (peralatan && peralatan.length > 0) {
      await prisma.jadwalTanamPeralatan.deleteMany({ where: { jadwalTanamId: createdJadwal.id } });
      for (const pr of peralatan) {
        await prisma.jadwalTanamPeralatan.create({
          data: {
            jadwalTanamId: createdJadwal.id,
            ...pr,
          },
        });
      }
    }
  }
  console.log('Seeding Jadwal Tanam completed successfully.');
}

async function seedMonitoringLahan(prisma: any) {
  console.log('Seeding Monitoring Lahan (10 data)...');
  const items = [
    { kodeLahan: 'LA-2605-0001', lokasi: 'Blok A Subang - Petak 1', komoditas: 'Padi', varietas: 'Inpari 32', luas: 2.5, tanggalTanam: '01/05/2026', umurHst: '45 HST', kondisi: 'Sangat Baik', status: 'Aktif', latitude: -6.5950, longitude: 106.8166, phTanah: 6.5, kelembapan: 78, suhuTanah: 28.0, nutrisiNpk: 'Optimal', catatan: 'Fase pembentukan anakan optimal.' },
    { kodeLahan: 'LA-2605-0002', lokasi: 'Blok A Subang - Petak 2', komoditas: 'Padi', varietas: 'Inpari 42', luas: 3.0, tanggalTanam: '10/05/2026', umurHst: '36 HST', kondisi: 'Baik', status: 'Aktif', latitude: -6.5962, longitude: 106.8175, phTanah: 6.2, kelembapan: 80, suhuTanah: 27.5, nutrisiNpk: 'Optimal', catatan: 'Pemupukan susulan I telah selesai.' },
    { kodeLahan: 'LA-2605-0003', lokasi: 'Blok B Karawang - Petak 1', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', luas: 4.0, tanggalTanam: '20/04/2026', umurHst: '56 HST', kondisi: 'Baik', status: 'Aktif', latitude: -6.3021, longitude: 107.3012, phTanah: 6.8, kelembapan: 72, suhuTanah: 29.0, nutrisiNpk: 'Tinggi', catatan: 'Fase vegetatif akhir, pertumbuhan seragam.' },
    { kodeLahan: 'LA-2605-0004', lokasi: 'Blok B Karawang - Petak 2', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', luas: 2.0, tanggalTanam: '15/05/2026', umurHst: '31 HST', kondisi: 'Sangat Baik', status: 'Aktif', latitude: -6.3035, longitude: 107.3025, phTanah: 6.6, kelembapan: 75, suhuTanah: 28.5, nutrisiNpk: 'Optimal', catatan: 'Pembentukan bintil akar berjalan baik.' },
    { kodeLahan: 'LA-2605-0005', lokasi: 'Blok C Lamongan - Petak 1', komoditas: 'Padi', varietas: 'Ciherang', luas: 1.5, tanggalTanam: '01/04/2026', umurHst: '75 HST', kondisi: 'Baik', status: 'Aktif', latitude: -7.1211, longitude: 112.4150, phTanah: 6.4, kelembapan: 82, suhuTanah: 27.0, nutrisiNpk: 'Cukup', catatan: 'Fase pengisian bulir padi (filling grain).' },
    { kodeLahan: 'LA-2605-0006', lokasi: 'Blok C Lamongan - Petak 2', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', luas: 5.0, tanggalTanam: '05/05/2026', umurHst: '41 HST', kondisi: 'Waspada (Hama)', status: 'Aktif', latitude: -7.1225, longitude: 112.4162, phTanah: 6.7, kelembapan: 70, suhuTanah: 29.5, nutrisiNpk: 'Optimal', catatan: 'Penyemprotan pengendali ulat grayak.' },
    { kodeLahan: 'LA-2605-0007', lokasi: 'Blok D Garut - Petak 1', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', luas: 1.8, tanggalTanam: '25/04/2026', umurHst: '51 HST', kondisi: 'Baik', status: 'Aktif', latitude: -7.2215, longitude: 107.9045, phTanah: 6.3, kelembapan: 76, suhuTanah: 26.5, nutrisiNpk: 'Optimal', catatan: 'Fase pembentukan ginofor (gynophore).' },
    { kodeLahan: 'LA-2605-0008', lokasi: 'Blok D Garut - Petak 2', komoditas: 'Padi', varietas: 'Mekongga', luas: 3.5, tanggalTanam: '12/04/2026', umurHst: '64 HST', kondisi: 'Sangat Baik', status: 'Aktif', latitude: -7.2230, longitude: 107.9060, phTanah: 6.5, kelembapan: 80, suhuTanah: 27.2, nutrisiNpk: 'Optimal', catatan: 'Kondisi tanaman sehat tanpa gejala penyakit.' },
    { kodeLahan: 'LA-2605-0009', lokasi: 'Blok E Subang - Petak 3', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', luas: 1.2, tanggalTanam: '01/06/2026', umurHst: '14 HST', kondisi: 'Perlu Pemupukan', status: 'Aktif', latitude: -6.5980, longitude: 106.8190, phTanah: 6.1, kelembapan: 77, suhuTanah: 28.0, nutrisiNpk: 'Kurang', catatan: 'Jadwal pemupukan NPK susulan pertama.' },
    { kodeLahan: 'LA-2605-0010', lokasi: 'Blok E Subang - Petak 4', komoditas: 'Padi', varietas: 'Situ Bagendit', luas: 1.0, tanggalTanam: '01/03/2026', umurHst: '106 HST', kondisi: 'Baik', status: 'Istirahat', latitude: -6.5995, longitude: 106.8205, phTanah: 6.5, kelembapan: 70, suhuTanah: 29.0, nutrisiNpk: 'Optimal', catatan: 'Lahan pasca panen sedang dalam persiapan pengolahan tanah.' },
  ];

  for (const item of items) {
    await prisma.monitoringLahan.upsert({
      where: { kodeLahan: item.kodeLahan },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });
  }
  console.log('Seeding Monitoring Lahan completed.');
}

async function seedMonitoringGreenhouse(prisma: any) {
  console.log('Seeding Monitoring Greenhouse (10 data)...');
  const items = [
    { no: 1, kodeGreenhouse: 'GH-01', lokasi: 'Blok A - Greenhouse 1', komoditas: 'Padi', varietas: 'Inpari 32 (BS)', luas: 500, status: 'Aktif', kondisi: 'Sangat Baik', aktivitasTerakhir: 'Penyiraman Otomatis Drip', suhuRataRata: 26.5, kelembapanRata: 70.0, intensitasCahaya: 12500, phAirIrigasi: 6.2, catatan: 'Kontrol suhu dan kelembapan stabil.' },
    { no: 2, kodeGreenhouse: 'GH-02', lokasi: 'Blok A - Greenhouse 2', komoditas: 'Padi', varietas: 'Ciherang (BS)', luas: 500, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Pemeriksaan Rutin Hama', suhuRataRata: 27.0, kelembapanRata: 68.5, intensitasCahaya: 13000, phAirIrigasi: 6.4, catatan: 'Pembibitan benih penjenis.' },
    { no: 3, kodeGreenhouse: 'GH-03', lokasi: 'Blok B - Greenhouse 1', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', luas: 750, status: 'Aktif', kondisi: 'Sangat Baik', aktivitasTerakhir: 'Inokulasi Polinasi Buatan', suhuRataRata: 28.0, kelembapanRata: 65.0, intensitasCahaya: 14500, phAirIrigasi: 6.5, catatan: 'Fase persilangan galur tetua.' },
    { no: 4, kodeGreenhouse: 'GH-04', lokasi: 'Blok B - Greenhouse 2', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', luas: 600, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Pemupukan Otomatis AB Mix', suhuRataRata: 26.0, kelembapanRata: 72.0, intensitasCahaya: 12000, phAirIrigasi: 6.3, catatan: 'Pengamatan respon nutrisi.' },
    { no: 5, kodeGreenhouse: 'GH-05', lokasi: 'Blok C - Greenhouse 1', komoditas: 'Padi', varietas: 'Inpari 42', luas: 500, status: 'Aktif', kondisi: 'Sangat Baik', aktivitasTerakhir: 'Pengukuran pH dan EC', suhuRataRata: 26.8, kelembapanRata: 69.0, intensitasCahaya: 12800, phAirIrigasi: 6.2, catatan: 'Semua sensor berfungsi dengan akurat.' },
    { no: 6, kodeGreenhouse: 'GH-06', lokasi: 'Blok C - Greenhouse 2', komoditas: 'Cabai', varietas: 'Cabai Hibrida C1', luas: 400, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Pruning / Perampalan Daun', suhuRataRata: 27.5, kelembapanRata: 66.0, intensitasCahaya: 13500, phAirIrigasi: 6.0, catatan: 'Tanaman dalam fase berbunga.' },
    { no: 7, kodeGreenhouse: 'GH-07', lokasi: 'Blok D - Greenhouse 1', komoditas: 'Padi', varietas: 'Mekongga (Parental)', luas: 800, status: 'Aktif', kondisi: 'Sangat Baik', aktivitasTerakhir: 'Sanitasi Greenhouse', suhuRataRata: 26.2, kelembapanRata: 71.5, intensitasCahaya: 12200, phAirIrigasi: 6.3, catatan: 'Sterilisasi rutin pintu masuk (airlock).' },
    { no: 8, kodeGreenhouse: 'GH-08', lokasi: 'Blok D - Greenhouse 2', komoditas: 'Jagung', varietas: 'Jagung N-27 (Parental)', luas: 750, status: 'Pemeliharaan', kondisi: 'Stabil', aktivitasTerakhir: 'Perbaikan Sistem Irigasi Drip', suhuRataRata: 28.5, kelembapanRata: 64.0, intensitasCahaya: 15000, phAirIrigasi: 6.6, catatan: 'Pengantian nozzle drip yang tersumbat.' },
    { no: 9, kodeGreenhouse: 'GH-09', lokasi: 'Blok E - Greenhouse 1', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', luas: 500, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Monitoring Kelembapan Media', suhuRataRata: 26.7, kelembapanRata: 70.5, intensitasCahaya: 12400, phAirIrigasi: 6.4, catatan: 'Perkecambahan 96%.' },
    { no: 10, kodeGreenhouse: 'GH-10', lokasi: 'Blok E - Greenhouse 2', komoditas: 'Padi', varietas: 'Situ Bagendit', luas: 500, status: 'Aktif', kondisi: 'Sangat Baik', aktivitasTerakhir: 'Pemeriksaan Venting Atap', suhuRataRata: 26.4, kelembapanRata: 69.5, intensitasCahaya: 12600, phAirIrigasi: 6.2, catatan: 'Sirkulasi udara alami berjalan baik.' },
  ];

  for (const item of items) {
    await prisma.monitoringGreenhouse.upsert({
      where: { kodeGreenhouse: item.kodeGreenhouse },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });
  }
  console.log('Seeding Monitoring Greenhouse completed.');
}

async function seedKesiapanPanen(prisma: any) {
  console.log('Seeding Kesiapan Panen (10 data)...');
  const items = [
    { no: 1, kodeLahan: 'KP-2606-0001', lokasi: 'Blok A Subang - Petak 1', komoditas: 'Padi', varietas: 'Inpari 32', tanggalTanam: '01/02/2026', umurHst: 115, prediksiPanen: '25/05/2026', statusKesiapan: 'Siap Panen', yieldEst: 17500, kadarAir: 14.2, kuningDaun: 92, kekerasanBiji: 'Keras', catatan: 'Gabah menguning 92%, siap pemanenan.' },
    { no: 2, kodeLahan: 'KP-2606-0002', lokasi: 'Blok A Subang - Petak 2', komoditas: 'Padi', varietas: 'Inpari 42', tanggalTanam: '10/02/2026', umurHst: 110, prediksiPanen: '02/06/2026', statusKesiapan: 'Siap Panen', yieldEst: 22500, kadarAir: 14.5, kuningDaun: 88, kekerasanBiji: 'Keras', catatan: 'Siap dikombain minggu ini.' },
    { no: 3, kodeLahan: 'KP-2606-0003', lokasi: 'Blok B Karawang - Petak 1', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', tanggalTanam: '15/02/2026', umurHst: 100, prediksiPanen: '28/05/2026', statusKesiapan: 'Siap Panen', yieldEst: 32000, kadarAir: 18.0, kuningDaun: 95, kekerasanBiji: 'Keras', catatan: 'Klobot mengering, kelopak jagung cokelat.' },
    { no: 4, kodeLahan: 'KP-2606-0004', lokasi: 'Blok B Karawang - Petak 2', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', tanggalTanam: '01/03/2026', umurHst: 76, prediksiPanen: '16/05/2026', statusKesiapan: 'Siap Panen', yieldEst: 5400, kadarAir: 13.8, kuningDaun: 90, kekerasanBiji: 'Keras', catatan: 'Polong cokelat tua dan rontok daun alami.' },
    { no: 5, kodeLahan: 'KP-2606-0005', lokasi: 'Blok C Lamongan - Petak 1', komoditas: 'Padi', varietas: 'Ciherang', tanggalTanam: '01/03/2026', umurHst: 95, prediksiPanen: '15/06/2026', statusKesiapan: 'Mendekati Panen', yieldEst: 9800, kadarAir: 18.5, kuningDaun: 75, kekerasanBiji: 'Sedang', catatan: 'Memasuki kematangan fisiologis 75%.' },
    { no: 6, kodeLahan: 'KP-2606-0006', lokasi: 'Blok C Lamongan - Petak 2', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', tanggalTanam: '10/03/2026', umurHst: 85, prediksiPanen: '20/06/2026', statusKesiapan: 'Mendekati Panen', yieldEst: 45000, kadarAir: 22.0, kuningDaun: 70, kekerasanBiji: 'Sedang', catatan: 'Black layer pada Biji mulai terbentuk.' },
    { no: 7, kodeLahan: 'KP-2606-0007', lokasi: 'Blok D Garut - Petak 1', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', tanggalTanam: '20/03/2026', umurHst: 80, prediksiPanen: '20/06/2026', statusKesiapan: 'Mendekati Panen', yieldEst: 4500, kadarAir: 20.0, kuningDaun: 70, kekerasanBiji: 'Sedang', catatan: 'Pengecekan sampel polong isi.' },
    { no: 8, kodeLahan: 'KP-2606-0008', lokasi: 'Blok D Garut - Petak 2', komoditas: 'Padi', varietas: 'Mekongga', tanggalTanam: '01/04/2026', umurHst: 70, prediksiPanen: '01/07/2026', statusKesiapan: 'Belum Siap', yieldEst: 24500, kadarAir: 24.0, kuningDaun: 40, kekerasanBiji: 'Lunak', catatan: 'Fase adonan (dough stage).' },
    { no: 9, kodeLahan: 'KP-2606-0009', lokasi: 'Blok E Subang - Petak 3', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', tanggalTanam: '15/04/2026', umurHst: 55, prediksiPanen: '10/07/2026', statusKesiapan: 'Belum Siap', yieldEst: 2800, kadarAir: 28.0, kuningDaun: 20, kekerasanBiji: 'Lunak', catatan: 'Pengisian polong (pod filling).' },
    { no: 10, kodeLahan: 'KP-2606-0010', lokasi: 'Blok E Subang - Petak 4', komoditas: 'Padi', varietas: 'Situ Bagendit', tanggalTanam: '01/05/2026', umurHst: 45, prediksiPanen: '15/08/2026', statusKesiapan: 'Belum Siap', yieldEst: 4000, kadarAir: 30.0, kuningDaun: 10, kekerasanBiji: 'Sangat Lunak', catatan: 'Fase pembungaan akhir.' },
  ];

  for (const item of items) {
    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: item.komoditas } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: item.varietas } });

    await prisma.kesiapanPanen.upsert({
      where: { kodeLahan: item.kodeLahan },
      update: {
        ...item,
        commodityId: commodity?.id,
        varietyId: variety?.id,
      },
      create: {
        ...item,
        commodityId: commodity?.id,
        varietyId: variety?.id,
        dibuatOleh: 'Admin',
        diubahOleh: 'Admin',
      },
    });
  }
  console.log('Seeding Kesiapan Panen completed.');
}

async function seedPanen(prisma: any) {
  console.log('Seeding Panen (10 data)...');
  const items = [
    { kodePanen: 'PN-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', lahan: 'Blok A Subang - Petak 1', tanggalPanen: new Date('2026-05-25'), luasHa: 2.5, produksiKg: 16800, hasilKgHa: 6720, status: 'Selesai', penanggungJawab: 'Budi Santoso', metodePanen: 'Combine Harvester', produksiKotorKg: 17500, kadarAir: 14.2, kebersihan: 98.0, catatan: 'Hasil panen bersih dan kualitas baik.' },
    { kodePanen: 'PN-2606-0002', komoditas: 'Padi', varietas: 'Inpari 42', lahan: 'Blok A Subang - Petak 2', tanggalPanen: new Date('2026-06-02'), luasHa: 3.0, produksiKg: 21500, hasilKgHa: 7166.67, status: 'Selesai', penanggungJawab: 'Siti Nurhayati', metodePanen: 'Combine Harvester', produksiKotorKg: 22200, kadarAir: 14.0, kebersihan: 97.5, catatan: 'Produktivitas melampaui target.' },
    { kodePanen: 'PN-2606-0003', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', lahan: 'Blok B Karawang - Petak 1', tanggalPanen: new Date('2026-05-28'), luasHa: 4.0, produksiKg: 31000, hasilKgHa: 7750, status: 'Selesai', penanggungJawab: 'Agus Widodo', metodePanen: 'Manual (Arit/Sabit)', produksiKotorKg: 32500, kadarAir: 18.0, kebersihan: 96.0, catatan: 'Tongkol jagung besar berisi.' },
    { kodePanen: 'PN-2606-0004', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', lahan: 'Blok B Karawang - Petak 2', tanggalPanen: new Date('2026-05-16'), luasHa: 2.0, produksiKg: 5200, hasilKgHa: 2600, status: 'Selesai', penanggungJawab: 'Rizky Pratama', metodePanen: 'Manual (Sabit)', produksiKotorKg: 5450, kadarAir: 13.5, kebersihan: 97.0, catatan: 'Biji kedelai utuh dan tidak pecah.' },
    { kodePanen: 'PN-2606-0005', komoditas: 'Padi', varietas: 'Ciherang', lahan: 'Blok C Lamongan - Petak 1', tanggalPanen: new Date('2026-05-20'), luasHa: 1.5, produksiKg: 10200, hasilKgHa: 6800, status: 'Selesai', penanggungJawab: 'Ir. Handoko', metodePanen: 'Combine Harvester', produksiKotorKg: 10500, kadarAir: 14.5, kebersihan: 98.5, catatan: 'Benih penjenis BS lulus inspeksi.' },
    { kodePanen: 'PN-2606-0006', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', lahan: 'Blok C Lamongan - Petak 2', tanggalPanen: new Date('2026-06-05'), luasHa: 5.0, produksiKg: 43500, hasilKgHa: 8700, status: 'Selesai', penanggungJawab: 'M. Fadli', metodePanen: 'Corn Harvester Machine', produksiKotorKg: 45200, kadarAir: 19.5, kebersihan: 95.5, catatan: 'Panen skala besar lancar.' },
    { kodePanen: 'PN-2606-0007', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', lahan: 'Blok D Garut - Petak 1', tanggalPanen: new Date('2026-06-08'), luasHa: 1.8, produksiKg: 4300, hasilKgHa: 2388.89, status: 'Selesai', penanggungJawab: 'Dedi Kurniawan', metodePanen: 'Manual (Pencabutan)', produksiKotorKg: 4600, kadarAir: 19.0, kebersihan: 94.0, catatan: 'Polong isi penuh.' },
    { kodePanen: 'PN-2606-0008', komoditas: 'Padi', varietas: 'Mekongga', lahan: 'Blok D Garut - Petak 2', tanggalPanen: new Date('2026-06-05'), luasHa: 3.5, produksiKg: 24100, hasilKgHa: 6885.71, status: 'Selesai', penanggungJawab: 'Hendra Wijaya', metodePanen: 'Combine Harvester', produksiKotorKg: 24800, kadarAir: 14.1, kebersihan: 98.0, catatan: 'Panen musim hujan berjalan baik.' },
    { kodePanen: 'PN-2606-0009', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', lahan: 'Blok E Subang - Petak 3', tanggalPanen: new Date('2026-06-10'), luasHa: 1.2, produksiKg: 2700, hasilKgHa: 2250, status: 'Dalam Proses', penanggungJawab: 'Dian Prasetyo', metodePanen: 'Manual (Sabit)', produksiKotorKg: 2850, kadarAir: 14.8, kebersihan: 96.0, catatan: 'Proses perontokan polong.' },
    { kodePanen: 'PN-2606-0010', komoditas: 'Padi', varietas: 'Situ Bagendit', lahan: 'Blok E Subang - Petak 4', tanggalPanen: new Date('2026-06-11'), luasHa: 1.0, produksiKg: 3850, hasilKgHa: 3850, status: 'Dalam Proses', penanggungJawab: 'Dewi Lestari', metodePanen: 'Combine Harvester', produksiKotorKg: 4000, kadarAir: 15.0, kebersihan: 97.0, catatan: 'Pengangkutan ke gudang pengeringan.' },
  ];

  for (const item of items) {
    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: item.komoditas } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: item.varietas } });

    await prisma.panen.upsert({
      where: { kodePanen: item.kodePanen },
      update: {
        ...item,
        commodityId: commodity?.id,
        varietyId: variety?.id,
      },
      create: {
        ...item,
        commodityId: commodity?.id,
        varietyId: variety?.id,
        dibuatOleh: 'Admin',
        diubahOleh: 'Admin',
      },
    });
  }
  console.log('Seeding Panen completed.');
}

async function seedBatchProduksi(prisma: any) {
  console.log('Seeding Batch Produksi (10 data)...');
  const items = [
    { no: 1, kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', sumberBahan: 'PN-2606-0001', tanggalMulai: '01/06/2026', tanggalSelesai: '07/06/2026', targetKg: 16800, hasilKg: 16200, yieldPercent: 96.43, status: 'Selesai', lokasi: 'Gudang Processing A', catatan: 'Batch benih padi FS utama.' },
    { no: 2, kodeBatch: 'BP-2606-0002', komoditas: 'Padi', varietas: 'Inpari 42', sumberBahan: 'PN-2606-0002', tanggalMulai: '03/06/2026', tanggalSelesai: '09/06/2026', targetKg: 21500, hasilKg: 20800, yieldPercent: 96.74, status: 'Selesai', lokasi: 'Gudang Processing A', catatan: 'Batch benih padi SS.' },
    { no: 3, kodeBatch: 'BP-2606-0003', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', sumberBahan: 'PN-2606-0003', tanggalMulai: '30/05/2026', tanggalSelesai: '05/06/2026', targetKg: 31000, hasilKg: 29500, yieldPercent: 95.16, status: 'Selesai', lokasi: 'Gudang Processing B', catatan: 'Batch benih jagung hibrida.' },
    { no: 4, kodeBatch: 'BP-2606-0004', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', sumberBahan: 'PN-2606-0004', tanggalMulai: '18/05/2026', tanggalSelesai: '23/05/2026', targetKg: 5200, hasilKg: 5050, yieldPercent: 97.12, status: 'Selesai', lokasi: 'Gudang Processing C', catatan: 'Batch benih kedelai FS.' },
    { no: 5, kodeBatch: 'BP-2606-0005', komoditas: 'Padi', varietas: 'Ciherang', sumberBahan: 'PN-2606-0005', tanggalMulai: '22/05/2026', tanggalSelesai: '27/05/2026', targetKg: 10200, hasilKg: 9950, yieldPercent: 97.55, status: 'Selesai', lokasi: 'Gudang Processing A', catatan: 'Batch benih penjenis BS.' },
    { no: 6, kodeBatch: 'BP-2606-0006', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', sumberBahan: 'PN-2606-0006', tanggalMulai: '06/06/2026', tanggalSelesai: '12/06/2026', targetKg: 43500, hasilKg: 41200, yieldPercent: 94.71, status: 'Proses', lokasi: 'Gudang Processing B', catatan: 'Proses pipil dan pengeringan.' },
    { no: 7, kodeBatch: 'BP-2606-0007', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', sumberBahan: 'PN-2606-0007', tanggalMulai: '09/06/2026', tanggalSelesai: '15/06/2026', targetKg: 4300, hasilKg: 4100, yieldPercent: 95.35, status: 'Proses', lokasi: 'Gudang Processing C', catatan: 'Proses pemisahan polong.' },
    { no: 8, kodeBatch: 'BP-2606-0008', komoditas: 'Padi', varietas: 'Mekongga', sumberBahan: 'PN-2606-0008', tanggalMulai: '06/06/2026', tanggalSelesai: '12/06/2026', targetKg: 24100, hasilKg: 23200, yieldPercent: 96.27, status: 'Proses', lokasi: 'Gudang Processing A', catatan: 'Pengolahan pasca panen.' },
    { no: 9, kodeBatch: 'BP-2606-0009', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', sumberBahan: 'PN-2606-0009', tanggalMulai: '11/06/2026', tanggalSelesai: '17/06/2026', targetKg: 2700, hasilKg: 0, yieldPercent: 0, status: 'Pending', lokasi: 'Gudang Processing C', catatan: 'Menunggu antrean tempat pengeringan.' },
    { no: 10, kodeBatch: 'BP-2606-0010', komoditas: 'Padi', varietas: 'Situ Bagendit', sumberBahan: 'PN-2606-0010', tanggalMulai: '12/06/2026', tanggalSelesai: '18/06/2026', targetKg: 3850, hasilKg: 0, yieldPercent: 0, status: 'Pending', lokasi: 'Gudang Processing A', catatan: 'Menunggu verifikasi kadar air awal.' },
  ];

  for (const item of items) {
    const batch = await prisma.batchProduksi.upsert({
      where: { kodeBatch: item.kodeBatch },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });

    const kodeLot = `LOT-${item.kodeBatch.replace('BP-', '')}`;
    await prisma.batchLot.upsert({
      where: { kodeBatch: item.kodeBatch },
      update: { kodeLot, batchProduksiId: batch.id },
      create: {
        kodeBatch: item.kodeBatch,
        kodeLot,
        batchProduksiId: batch.id
      }
    });
  }
  console.log('Seeding Batch Produksi & Batch Lot completed.');
}

async function seedPengeringan(prisma: any) {
  console.log('Seeding Pengeringan (10 data)...');
  const items = [
    { no: 1, kodeBatch: 'DRY-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', alatPengering: 'Vertical Dryer 10T #1', beratMasuk: 16800, kadarAirMasuk: 22.5, kadarAirTarget: 12.0, kadarAirSaatIni: 11.8, beratKeluar: 14750, status: 'Selesai', selesai: '03/06/2026 16:00', suhuRataRata: 41.5, durasiJam: 18.0, lokasi: 'Gudang Pengeringan 1', catatan: 'Kadar air akhir aman 11.8%.' },
    { no: 2, kodeBatch: 'DRY-2606-0002', komoditas: 'Padi', varietas: 'Inpari 42', alatPengering: 'Vertical Dryer 10T #2', beratMasuk: 21500, kadarAirMasuk: 23.0, kadarAirTarget: 12.0, kadarAirSaatIni: 12.0, beratKeluar: 18850, status: 'Selesai', selesai: '05/06/2026 10:00', suhuRataRata: 42.0, durasiJam: 20.0, lokasi: 'Gudang Pengeringan 1', catatan: 'Proses pengeringan sempurna.' },
    { no: 3, kodeBatch: 'DRY-2606-0003', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', alatPengering: 'Bed Dryer 5T #1', beratMasuk: 31000, kadarAirMasuk: 25.0, kadarAirTarget: 13.0, kadarAirSaatIni: 12.8, beratKeluar: 26650, status: 'Selesai', selesai: '02/06/2026 18:00', suhuRataRata: 45.0, durasiJam: 24.0, lokasi: 'Gudang Pengeringan 2', catatan: 'Pengeringan jagung tongkol.' },
    { no: 4, kodeBatch: 'DRY-2606-0004', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', alatPengering: 'Lantai Jemur (Sun Drying)', beratMasuk: 5200, kadarAirMasuk: 19.0, kadarAirTarget: 11.5, kadarAirSaatIni: 11.4, beratKeluar: 4750, status: 'Selesai', selesai: '20/05/2026 15:00', suhuRataRata: 35.0, durasiJam: 16.0, lokasi: 'Lantai Jemur Utama', catatan: 'Penjemuran alami dengan sinar matahari.' },
    { no: 5, kodeBatch: 'DRY-2606-0005', komoditas: 'Padi', varietas: 'Ciherang', alatPengering: 'Vertical Dryer 10T #1', beratMasuk: 10200, kadarAirMasuk: 21.8, kadarAirTarget: 12.0, kadarAirSaatIni: 11.9, beratKeluar: 9050, status: 'Selesai', selesai: '24/05/2026 11:00', suhuRataRata: 41.0, durasiJam: 16.5, lokasi: 'Gudang Pengeringan 1', catatan: 'Pengeringan benih BS terkontrol.' },
    { no: 6, kodeBatch: 'DRY-2606-0006', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', alatPengering: 'Bed Dryer 5T #2', beratMasuk: 43500, kadarAirMasuk: 26.0, kadarAirTarget: 13.0, kadarAirSaatIni: 16.5, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 44.5, durasiJam: 12.0, lokasi: 'Gudang Pengeringan 2', catatan: 'Masih dalam siklus pengeringan 12 jam lagi.' },
    { no: 7, kodeBatch: 'DRY-2606-0007', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', alatPengering: 'Lantai Jemur (Sun Drying)', beratMasuk: 4300, kadarAirMasuk: 21.0, kadarAirTarget: 10.0, kadarAirSaatIni: 14.0, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 36.0, durasiJam: 8.0, lokasi: 'Lantai Jemur Utama', catatan: 'Penjemuran hari kedua.' },
    { no: 8, kodeBatch: 'DRY-2606-0008', komoditas: 'Padi', varietas: 'Mekongga', alatPengering: 'Vertical Dryer 10T #2', beratMasuk: 24100, kadarAirMasuk: 22.0, kadarAirTarget: 12.0, kadarAirSaatIni: 15.2, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 41.8, durasiJam: 10.0, lokasi: 'Gudang Pengeringan 1', catatan: 'Proses pengeringan batch 8.' },
    { no: 9, kodeBatch: 'DRY-2606-0009', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', alatPengering: 'Lantai Jemur (Sun Drying)', beratMasuk: 2700, kadarAirMasuk: 18.5, kadarAirTarget: 11.5, kadarAirSaatIni: 18.5, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 34.0, durasiJam: 2.0, lokasi: 'Lantai Jemur B', catatan: 'Baru masuk lantai jemur.' },
    { no: 10, kodeBatch: 'DRY-2606-0010', komoditas: 'Padi', varietas: 'Situ Bagendit', alatPengering: 'Vertical Dryer 10T #1', beratMasuk: 3850, kadarAirMasuk: 23.5, kadarAirTarget: 12.0, kadarAirSaatIni: 23.5, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 40.0, durasiJam: 1.0, lokasi: 'Gudang Pengeringan 1', catatan: 'Pre-heating alat dryer.' },
  ];

  for (const item of items) {
    await prisma.pengeringan.upsert({
      where: { kodeBatch: item.kodeBatch },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });
  }
  console.log('Seeding Pengeringan completed.');
}

async function seedSortasi(prisma: any) {
  console.log('Seeding Sortasi (10 data)...');
  const items = [
    { no: 1, kodeBatch: 'SRT-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', alatSortasi: 'Air Screen Cleaner 01', beratMasuk: 14750, hasilLulus: 14160, hasilTolak: 590, recovery: 96.0, tanggalSortasi: '04/06/2026', status: 'Selesai', lokasi: 'Gudang Sortasi 1', operator: 'Slamet Riyadi', catatan: 'Pemisahan gabah hampa & kotoran fisik.' },
    { no: 2, kodeBatch: 'SRT-2606-0002', komoditas: 'Padi', varietas: 'Inpari 42', alatSortasi: 'Air Screen Cleaner 01', beratMasuk: 18850, hasilLulus: 18134, hasilTolak: 716, recovery: 96.2, tanggalSortasi: '06/06/2026', status: 'Selesai', lokasi: 'Gudang Sortasi 1', operator: 'Slamet Riyadi', catatan: 'Kebersihan benih 98.5%.' },
    { no: 3, kodeBatch: 'SRT-2606-0003', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', alatSortasi: 'Gravity Separator 02', beratMasuk: 26650, hasilLulus: 25317, hasilTolak: 1333, recovery: 95.0, tanggalSortasi: '03/06/2026', status: 'Selesai', lokasi: 'Gudang Sortasi 2', operator: 'Bambang S.', catatan: 'Pemisahan biji jagung berdasarkan berat jenis.' },
    { no: 4, kodeBatch: 'SRT-2606-0004', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', alatSortasi: 'Spiral Separator 01', beratMasuk: 4750, hasilLulus: 4617, hasilTolak: 133, recovery: 97.2, tanggalSortasi: '21/05/2026', status: 'Selesai', lokasi: 'Gudang Sortasi 3', operator: 'Dewi Lestari', catatan: 'Pemisahan biji kedelai pecah dan keriput.' },
    { no: 5, kodeBatch: 'SRT-2606-0005', komoditas: 'Padi', varietas: 'Ciherang', alatSortasi: 'Color Sorter Optical #1', beratMasuk: 9050, hasilLulus: 8823, hasilTolak: 227, recovery: 97.5, tanggalSortasi: '25/05/2026', status: 'Selesai', lokasi: 'Gudang Sortasi 1', operator: 'Slamet Riyadi', catatan: 'Sortasi optical benih penjenis BS.' },
    { no: 6, kodeBatch: 'SRT-2606-0006', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', alatSortasi: 'Air Screen Cleaner 02', beratMasuk: 35000, hasilLulus: 33425, hasilTolak: 1575, recovery: 95.5, tanggalSortasi: '10/06/2026', status: 'Proses', lokasi: 'Gudang Sortasi 2', operator: 'Bambang S.', catatan: 'Sedang proses sortasi gelombang kedua.' },
    { no: 7, kodeBatch: 'SRT-2606-0007', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', alatSortasi: 'Manual Hand Sorting', beratMasuk: 3800, hasilLulus: 3648, hasilTolak: 152, recovery: 96.0, tanggalSortasi: '11/06/2026', status: 'Selesai', lokasi: 'Gudang Sortasi 3', operator: 'Siti Nurhayati', catatan: 'Sortasi manual polong rusak.' },
    { no: 8, kodeBatch: 'SRT-2606-0008', komoditas: 'Padi', varietas: 'Mekongga', alatSortasi: 'Air Screen Cleaner 01', beratMasuk: 20000, hasilLulus: 19240, hasilTolak: 760, recovery: 96.2, tanggalSortasi: '12/06/2026', status: 'Proses', lokasi: 'Gudang Sortasi 1', operator: 'Slamet Riyadi', catatan: 'Proses pembersihan jerami halus.' },
    { no: 9, kodeBatch: 'SRT-2606-0009', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', alatSortasi: 'Spiral Separator 01', beratMasuk: 2400, hasilLulus: 2328, hasilTolak: 72, recovery: 97.0, tanggalSortasi: '12/06/2026', status: 'Proses', lokasi: 'Gudang Sortasi 3', operator: 'Dewi Lestari', catatan: 'Persiapan mesin spiral.' },
    { no: 10, kodeBatch: 'SRT-2606-0010', komoditas: 'Padi', varietas: 'Situ Bagendit', alatSortasi: 'Air Screen Cleaner 02', beratMasuk: 3500, hasilLulus: 3360, hasilTolak: 140, recovery: 96.0, tanggalSortasi: '13/06/2026', status: 'Proses', lokasi: 'Gudang Sortasi 1', operator: 'Bambang S.', catatan: 'Pemeriksaan saringan mesh.' },
  ];

  for (const item of items) {
    await prisma.sortasi.upsert({
      where: { kodeBatch: item.kodeBatch },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });
  }
  console.log('Seeding Sortasi completed.');
}

async function seedTreatment(prisma: any) {
  console.log('Seeding Treatment (10 data)...');
  const items = [
    { no: 1, kodeBatch: 'TRT-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', treatment: 'Fungisida Mankozeb + Insektisida Red Dye', dosis: '2.5 ml/kg', operator: 'Slamet Riyadi', beratAwal: 14160, beratAkhir: 14140, loss: 20, tanggalSelesai: '05/06/2026', status: 'Selesai', lokasi: 'Ruang Treatment 1', catatan: 'Warna merah pekat merata, pelapisan fungisida protektif.' },
    { no: 2, kodeBatch: 'TRT-2606-0002', komoditas: 'Padi', varietas: 'Inpari 42', treatment: 'Fungisida Mankozeb + Insektisida Red Dye', dosis: '2.5 ml/kg', operator: 'Slamet Riyadi', beratAwal: 18134, beratAkhir: 18110, loss: 24, tanggalSelesai: '07/06/2026', status: 'Selesai', lokasi: 'Ruang Treatment 1', catatan: 'Treatment benih SS kelas unggul.' },
    { no: 3, kodeBatch: 'TRT-2606-0003', komoditas: 'Jagung', varietas: 'Jagung Hibrida P-21', treatment: 'Insektisida Imidakloprid Pink Polymer', dosis: '3.0 ml/kg', operator: 'Bambang S.', beratAwal: 25317, beratAkhir: 25280, loss: 37, tanggalSelesai: '04/06/2026', status: 'Selesai', lokasi: 'Ruang Treatment 2', catatan: 'Perlindungan dari lalat bibit.' },
    { no: 4, kodeBatch: 'TRT-2606-0004', komoditas: 'Kedelai', varietas: 'Kedelai Grobogan', treatment: 'Inokulan Rhizobium + Fungisida Thiram', dosis: '2.0 g/kg', operator: 'Dewi Lestari', beratAwal: 4617, beratAkhir: 4610, loss: 7, tanggalSelesai: '22/05/2026', status: 'Selesai', lokasi: 'Ruang Treatment 3', catatan: 'Treatment bio-inokulan bintil akar.' },
    { no: 5, kodeBatch: 'TRT-2606-0005', komoditas: 'Padi', varietas: 'Ciherang', treatment: 'Fungisida Mankozeb Premium', dosis: '2.0 ml/kg', operator: 'Slamet Riyadi', beratAwal: 8823, beratAkhir: 8815, loss: 8, tanggalSelesai: '26/05/2026', status: 'Selesai', lokasi: 'Ruang Treatment 1', catatan: 'Treatment benih penjenis BS.' },
    { no: 6, kodeBatch: 'TRT-2606-0006', komoditas: 'Jagung', varietas: 'Jagung Hibrida N-27', treatment: 'Insektisida Imidakloprid', dosis: '3.0 ml/kg', operator: 'Bambang S.', beratAwal: 33425, beratAkhir: 33390, loss: 35, tanggalSelesai: '11/06/2026', status: 'Proses', lokasi: 'Ruang Treatment 2', catatan: 'Pencampuran larutan formulasi.' },
    { no: 7, kodeBatch: 'TRT-2606-0007', komoditas: 'Kacang Tanah', varietas: 'Kacang Tanah Kelinci', treatment: 'Fungisida Karbendazim', dosis: '2.0 g/kg', operator: 'Siti Nurhayati', beratAwal: 3648, beratAkhir: 3642, loss: 6, tanggalSelesai: '11/06/2026', status: 'Selesai', lokasi: 'Ruang Treatment 3', catatan: 'Pengeringan larutan pelapis.' },
    { no: 8, kodeBatch: 'TRT-2606-0008', komoditas: 'Padi', varietas: 'Mekongga', treatment: 'Fungisida Mankozeb + Insektisida Red Dye', dosis: '2.5 ml/kg', operator: 'Slamet Riyadi', beratAwal: 19240, beratAkhir: 19215, loss: 25, tanggalSelesai: '13/06/2026', status: 'Proses', lokasi: 'Ruang Treatment 1', catatan: 'Batch 8 dalam mesin treater.' },
    { no: 9, kodeBatch: 'TRT-2606-0009', komoditas: 'Kedelai', varietas: 'Kedelai Anjasmoro', treatment: 'Inokulan Rhizobium', dosis: '2.0 g/kg', operator: 'Dewi Lestari', beratAwal: 2328, beratAkhir: 2324, loss: 4, tanggalSelesai: '13/06/2026', status: 'Proses', lokasi: 'Ruang Treatment 3', catatan: 'Penimbangan dosis bio-inokulan.' },
    { no: 10, kodeBatch: 'TRT-2606-0010', komoditas: 'Padi', varietas: 'Situ Bagendit', treatment: 'Fungisida Mankozeb', dosis: '2.5 ml/kg', operator: 'Bambang S.', beratAwal: 3360, beratAkhir: 3355, loss: 5, tanggalSelesai: '14/06/2026', status: 'Proses', lokasi: 'Ruang Treatment 1', catatan: 'Penyiapan tangki pencampur.' },
  ];

  for (const item of items) {
    await prisma.treatment.upsert({
      where: { kodeBatch: item.kodeBatch },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });
  }
  console.log('Seeding Treatment completed.');
}

async function seedStokBenih(prisma: any) {
  console.log('Seeding Stok Benih (10 data)...');
  const items = [
    { no: 1, produkBenih: 'Benih Padi Inpari 32 FS (Kemasan 5kg)', kategoriBenih: 'Benih Utama (FS)', batchLot: 'LOT-2606-0001', tanggalProduksi: '06/06/2026', expired: '06/12/2026', gudang: 'Gudang Benih Utama Subang', stokKg: 14140, reservedKg: 3000, availableKg: 11140, dayaTumbuh: 94.0, status: 'Aman', keterangan: 'Kualitas benih siap salur kemurnian 99%.' },
    { no: 2, produkBenih: 'Benih Padi Inpari 42 SS (Kemasan 5kg)', kategoriBenih: 'Benih Pokok (SS)', batchLot: 'LOT-2606-0002', tanggalProduksi: '08/06/2026', expired: '08/12/2026', gudang: 'Gudang Benih Utama Subang', stokKg: 18110, reservedKg: 4000, availableKg: 14110, dayaTumbuh: 93.5, status: 'Aman', keterangan: 'Stok benih pokok siap didistribusikan.' },
    { no: 3, produkBenih: 'Benih Jagung Hibrida P-21 ES (Kemasan 1kg)', kategoriBenih: 'Benih Sebar (ES)', batchLot: 'LOT-2606-0003', tanggalProduksi: '05/06/2026', expired: '05/12/2026', gudang: 'Gudang Benih Karawang', stokKg: 25280, reservedKg: 6000, availableKg: 19280, dayaTumbuh: 95.0, status: 'Aman', keterangan: 'Kemasan alupoil 1kg higienis.' },
    { no: 4, produkBenih: 'Benih Kedelai Grobogan FS (Kemasan 10kg)', kategoriBenih: 'Benih Utama (FS)', batchLot: 'LOT-2606-0004', tanggalProduksi: '23/05/2026', expired: '23/11/2026', gudang: 'Gudang Benih Karawang', stokKg: 4610, reservedKg: 1000, availableKg: 3610, dayaTumbuh: 91.0, status: 'Aman', keterangan: 'Benih kedelai bersertifikat.' },
    { no: 5, produkBenih: 'Benih Padi Ciherang BS (Kemasan 2kg)', kategoriBenih: 'Benih Penjenis (BS)', batchLot: 'LOT-2606-0005', tanggalProduksi: '27/05/2026', expired: '27/11/2026', gudang: 'Gudang Riset Subang', stokKg: 8815, reservedKg: 2000, availableKg: 6815, dayaTumbuh: 96.0, status: 'Aman', keterangan: 'Benih penjenis pemuliaan.' },
    { no: 6, produkBenih: 'Benih Jagung Hibrida N-27 ES (Kemasan 1kg)', kategoriBenih: 'Benih Sebar (ES)', batchLot: 'LOT-2606-0006', tanggalProduksi: '12/06/2026', expired: '12/12/2026', gudang: 'Gudang Benih Lamongan', stokKg: 33390, reservedKg: 5000, availableKg: 28390, dayaTumbuh: 92.5, status: 'Aman', keterangan: 'Stok jagung tahan kering.' },
    { no: 7, produkBenih: 'Benih Kacang Tanah Kelinci FS (Kemasan 10kg)', kategoriBenih: 'Benih Utama (FS)', batchLot: 'LOT-2606-0007', tanggalProduksi: '12/06/2026', expired: '12/12/2026', gudang: 'Gudang Benih Garut', stokKg: 3642, reservedKg: 800, availableKg: 2842, dayaTumbuh: 89.0, status: 'Aman', keterangan: 'Polong benih kacang tanah pilihan.' },
    { no: 8, produkBenih: 'Benih Padi Mekongga ES (Kemasan 5kg)', kategoriBenih: 'Benih Sebar (ES)', batchLot: 'LOT-2606-0008', tanggalProduksi: '14/06/2026', expired: '14/12/2026', gudang: 'Gudang Benih Garut', stokKg: 19215, reservedKg: 3000, availableKg: 16215, dayaTumbuh: 90.5, status: 'Aman', keterangan: 'Siap kirim ke mitra tani.' },
    { no: 9, produkBenih: 'Benih Kedelai Anjasmoro SS (Kemasan 10kg)', kategoriBenih: 'Benih Pokok (SS)', batchLot: 'LOT-2606-0009', tanggalProduksi: '14/06/2026', expired: '14/12/2026', gudang: 'Gudang Benih Lamongan', stokKg: 2324, reservedKg: 500, availableKg: 1824, dayaTumbuh: 88.5, status: 'Menipis', keterangan: 'Stok menipis perlu alokasi batch baru.' },
    { no: 10, produkBenih: 'Benih Padi Situ Bagendit FS (Kemasan 5kg)', kategoriBenih: 'Benih Utama (FS)', batchLot: 'LOT-2606-0010', tanggalProduksi: '15/06/2026', expired: '15/12/2026', gudang: 'Gudang Benih Utama Subang', stokKg: 3355, reservedKg: 1000, availableKg: 2355, dayaTumbuh: 89.5, status: 'Waspada Expired', keterangan: 'Stok percobaan lahan gogo.' },
  ];

  for (const item of items) {
    await prisma.stokBenih.upsert({
      where: { batchLot: item.batchLot },
      update: item,
      create: { ...item, dibuatOleh: 'Admin', diubahOleh: 'Admin' },
    });
  }
  console.log('Seeding Stok Benih completed.');
}

async function seedModulProduksi(prisma: any) {
  console.log('--- SEEDING MODUL PRODUKSI (10 DATA PER MODEL) ---');
  await seedJadwalTanam(prisma);
  await seedMonitoringLahan(prisma);
  await seedMonitoringGreenhouse(prisma);
  await seedKesiapanPanen(prisma);
  await seedPanen(prisma);
  await seedBatchProduksi(prisma);
  await seedPengeringan(prisma);
  await seedSortasi(prisma);
  await seedTreatment(prisma);
  await seedStokBenih(prisma);
  console.log('--- SEEDING MODUL PRODUKSI COMPLETE ---');
}

async function seedPenguji(prisma: any) {
  console.log('Seeding Penguji, Laboratorium, and User...');

  // 1. Create Role Penguji
  const pengujiRole = await prisma.role.upsert({
    where: { name: 'penguji' },
    update: {},
    create: {
      name: 'penguji',
    },
  });

  // 3. Create Laboratorium
  const labsData = [
    {
      kodeLaboratorium: 'LAB-01',
      namaLaboratorium: 'Laboratorium Pusat Uji Benih',
      deskripsi: 'Laboratorium utama untuk pengujian benih inti',
      alamat: 'Jl. Ahmad Yani No. 100, Surabaya',
      telepon: '031-1234567',
      nomorAkreditasi: 'KAN-LP-001-IDN',
      lembagaAkreditasi: 'Komite Akreditasi Nasional',
      tanggalAkreditasi: new Date('2024-01-15'),
      tanggalBerlakuAkreditasi: new Date('2029-01-15'),
      ruangLingkupPengujian: 'Pengujian Mutu Fisik dan Fisiologis Benih',
      status: 'Aktif',
    },
    {
      kodeLaboratorium: 'LAB-02',
      namaLaboratorium: 'Laboratorium Tanah & Air',
      deskripsi: 'Laboratorium untuk pengujian sampel tanah dan air irigasi',
      alamat: 'Gedung B Lantai 2, Kompleks Pertanian',
      telepon: '031-7654321',
      nomorAkreditasi: 'KAN-LP-002-IDN',
      lembagaAkreditasi: 'Komite Akreditasi Nasional',
      tanggalAkreditasi: new Date('2023-05-10'),
      tanggalBerlakuAkreditasi: new Date('2028-05-10'),
      ruangLingkupPengujian: 'Pengujian Kesuburan Tanah dan Kualitas Air',
      status: 'Aktif',
    }
  ];

  let lab = null;
  for (const labData of labsData) {
    const createdLab = await prisma.laboratorium.upsert({
      where: { kodeLaboratorium: labData.kodeLaboratorium },
      update: labData,
      create: labData,
    });
    if (labData.kodeLaboratorium === 'LAB-01') lab = createdLab; // Keep reference to first lab for Penguji relation
  }

  const pengujis = [
    {
      username: 'dewi',
      email: 'dewi.lestari@example.com',
      kodePenguji: 'PENG-001',
      nama: 'Dewi Lestari',
      methods: ['ISTA 5.2.1', 'ISTA 2.2'] // Daya Tumbuh, Kadar Air
    },
    {
      username: 'budi',
      email: 'budi.santoso@example.com',
      kodePenguji: 'PENG-002',
      nama: 'Budi Santoso',
      methods: ['ISTA 2.10'] // Kemurnian
    },
    {
      username: 'ratna',
      email: 'ratna.sari@example.com',
      kodePenguji: 'PENG-003',
      nama: 'Ratna Sari',
      methods: ['ISTA 7.3'] // Vigor
    },
    {
      username: 'andi',
      email: 'andi.pratama@example.com',
      kodePenguji: 'PENG-004',
      nama: 'Andi Pratama',
      methods: ['ISTA 7.4'] // Pathogen Test
    },
    {
      username: 'siti',
      email: 'siti.nurhaliza@example.com',
      kodePenguji: 'PENG-005',
      nama: 'Siti Nurhaliza',
      methods: ['ISTA 2.3', 'ISTA 2.7'] // Weight Determination, Other Seed Test
    },
    {
      username: 'rina',
      email: 'rina.wulandari@example.com',
      kodePenguji: 'PENG-006',
      nama: 'Rina Wulandari',
      methods: ['ISTA 2.9'] // Inert Matter Test
    },
    {
      username: 'dedi',
      email: 'dedi.kurniawan@example.com',
      kodePenguji: 'PENG-007',
      nama: 'Dedi Kurniawan',
      methods: ['ISTA 5.1.1'] // Normal & Abnormal Seed
    },
    {
      username: 'maya',
      email: 'maya.lestari@example.com',
      kodePenguji: 'PENG-008',
      nama: 'Maya Lestari',
      methods: ['ISTA 5.2.2'] // Viability Test
    },
    {
      username: 'fajar',
      email: 'fajar.nugroho@example.com',
      kodePenguji: 'PENG-009',
      nama: 'Fajar Nugroho',
      methods: ['ISTA 5.2.1', 'ISTA 2.10'] // Germination Test, Purity Analysis
    }
  ];

  const hashedPassword = await require('bcryptjs').hash('penguji123', 10);

  for (const p of pengujis) {
    const pUser = await prisma.user.upsert({
      where: { username: p.username },
      update: {},
      create: {
        username: p.username,
        email: p.email,
        password: hashedPassword,
        isEmailVerified: true,
        defaultRoleId: pengujiRole.id,
        roles: {
          create: {
            roleId: pengujiRole.id,
          },
        },
      },
    });

    const pengujiRecord = await prisma.penguji.upsert({
      where: { kodePenguji: p.kodePenguji },
      update: { userId: pUser.id, laboratoriumId: lab.id },
      create: {
        kodePenguji: p.kodePenguji,
        nama: p.nama,
        userId: pUser.id,
        laboratoriumId: lab.id,
        status: 'Aktif',
      },
    });

    for (const methodCode of p.methods) {
      const testMethod = await prisma.testMethod.findUnique({
        where: { kode: methodCode },
      });
      if (testMethod) {
        await prisma.pengujiTestMethod.upsert({
          where: {
            pengujiId_testMethodId: {
              pengujiId: pengujiRecord.id,
              testMethodId: testMethod.id,
            },
          },
          update: {},
          create: {
            pengujiId: pengujiRecord.id,
            testMethodId: testMethod.id,
          },
        });
      }
    }
  }

  console.log('Seeding Penguji complete.');
}

