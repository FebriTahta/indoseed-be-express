import { prisma } from '../src/utils/prisma';

export const dataGudang = [
  {
    kodeGudang: 'GDN-001',
    namaGudang: 'Gudang Benih Utama & Cold Storage',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-002',
    namaGudang: 'Gudang Stok Benih Hortikultura Siap Salur',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-003',
    namaGudang: 'Gudang Raw Seed & Pengeringan',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-004',
    namaGudang: 'Gudang Kemasan Sachet & Alumunium Foil',
    kategori: 'packing',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-005',
    namaGudang: 'Gudang Kardus & Sekunder Packaging',
    kategori: 'packing',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-006',
    namaGudang: 'Gudang Fungisida & Desinfektan Benih',
    kategori: 'treatment',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-007',
    namaGudang: 'Gudang Bahan Pewarna & Polimer Coating',
    kategori: 'treatment',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-008',
    namaGudang: 'Gudang Logistik & Sparepart Mesin Pengolah',
    kategori: 'umum',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-009',
    namaGudang: 'Gudang Sarana Kerja & Peralatan Kebun',
    kategori: 'umum',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeGudang: 'GDN-010',
    namaGudang: 'Gudang Retur & Afkir Sementara',
    kategori: 'umum',
    status: 'Tidak Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
];

export const dataCustomer = [
  {
    kodeCust: 'CUS-001',
    namaCust: 'Toko Tani Makmur Sejahtera',
    kategori: 'toko_pertanian',
    NPWP: '01.234.567.8-601.000',
    pic: 'H. Sukirman',
    email: 'tanimakmur.kediri@gmail.com',
    isTop: true,
    noTelepon: '081234567890',
    alamat: 'Jl. Raya Pare - Wates No. 45, Pare',
    kota: 'Kediri',
    kodePos: '64211',
    tglBergabung: new Date('2023-01-15'),
    status: 'Aktif',
    limitKredit: 100000000,
    remainKredit: 65000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-002',
    namaCust: 'Koperasi Produsen Pertanian Mitra Tani Mandiri',
    kategori: 'koperasi',
    NPWP: '02.345.678.9-623.000',
    pic: 'Drs. Supriyanto',
    email: 'koperasi.mitratani@gmail.com',
    isTop: true,
    noTelepon: '081398765432',
    alamat: 'Jl. Diponegoro No. 88, Kepanjen',
    kota: 'Malang',
    kodePos: '65163',
    tglBergabung: new Date('2023-03-20'),
    status: 'Aktif',
    limitKredit: 250000000,
    remainKredit: 180000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-003',
    namaCust: 'PT Agro Distribusi Nusantara',
    kategori: 'distributor',
    NPWP: '03.456.789.0-604.000',
    pic: 'Budi Hartono, S.T.',
    email: 'sales@agrodistribusi.co.id',
    isTop: true,
    noTelepon: '0318492011',
    alamat: 'Kompleks Pergudangan Margomulyo Permai Blok C-12',
    kota: 'Surabaya',
    kodePos: '60186',
    tglBergabung: new Date('2022-08-10'),
    status: 'Aktif',
    limitKredit: 500000000,
    remainKredit: 320000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-004',
    namaCust: 'CV Berkah Tani Abadi',
    kategori: 'distributor',
    NPWP: '04.567.890.1-505.000',
    pic: 'H. Ahmad Fauzi',
    email: 'berkahtani.solo@yahoo.com',
    isTop: false,
    noTelepon: '085223344556',
    alamat: 'Jl. Gatot Subroto No. 102, Banjarsari',
    kota: 'Surakarta',
    kodePos: '57152',
    tglBergabung: new Date('2024-02-01'),
    status: 'Aktif',
    limitKredit: 150000000,
    remainKredit: 90000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-005',
    namaCust: 'Kelompok Tani Harapan Jaya',
    kategori: 'kelompok_tani',
    NPWP: null,
    pic: 'Suryono (Ketua Poktan)',
    email: 'poktan.harapanjaya@gmail.com',
    isTop: false,
    noTelepon: '087811223344',
    alamat: 'Desa Sumbersekar RT 03/RW 02, Kec. Dau',
    kota: 'Malang',
    kodePos: '65151',
    tglBergabung: new Date('2024-05-12'),
    status: 'Aktif',
    limitKredit: 30000000,
    remainKredit: 25000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-006',
    namaCust: 'PT Sumber Agro Lestari',
    kategori: 'perusahaan',
    NPWP: '05.678.901.2-402.000',
    pic: 'Ir. Hendra Gunawan',
    email: 'procurement@sumberagrolestari.com',
    isTop: true,
    noTelepon: '0227301982',
    alamat: 'Jl. Soekarno-Hatta No. 450',
    kota: 'Bandung',
    kodePos: '40266',
    tglBergabung: new Date('2023-11-05'),
    status: 'Aktif',
    limitKredit: 400000000,
    remainKredit: 275000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-007',
    namaCust: 'UD Sumber Tani Barokah',
    kategori: 'toko_pertanian',
    NPWP: '06.789.012.3-611.000',
    pic: 'Hj. Siti Aminah',
    email: 'sumbertani.barokah@gmail.com',
    isTop: false,
    noTelepon: '081333444555',
    alamat: 'Jl. Raya Rogojampi No. 17',
    kota: 'Banyuwangi',
    kodePos: '68462',
    tglBergabung: new Date('2024-01-18'),
    status: 'Aktif',
    limitKredit: 75000000,
    remainKredit: 45000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-008',
    namaCust: 'Koperasi Tani Subur Makmur',
    kategori: 'koperasi',
    NPWP: '07.890.123.4-521.000',
    pic: 'Agus Riyadi',
    email: 'koptan.suburmakmur@gmail.com',
    isTop: false,
    noTelepon: '082155667788',
    alamat: 'Jl. Raya Klampok No. 25, Kec. Wanasari',
    kota: 'Brebes',
    kodePos: '52261',
    tglBergabung: new Date('2023-09-01'),
    status: 'Aktif',
    limitKredit: 120000000,
    remainKredit: 95000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-009',
    namaCust: 'Toko Pertanian Tani Unggul',
    kategori: 'toko_pertanian',
    NPWP: null,
    pic: 'Danang Prasetya',
    email: 'taniunggul.jember@gmail.com',
    isTop: false,
    noTelepon: '085733221100',
    alamat: 'Jl. Trunojoyo No. 64',
    kota: 'Jember',
    kodePos: '68137',
    tglBergabung: new Date('2024-06-10'),
    status: 'Tidak Aktif',
    limitKredit: 50000000,
    remainKredit: 50000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeCust: 'CUS-010',
    namaCust: 'PT Agrindo Sentosa Gemilang',
    kategori: 'perusahaan',
    NPWP: '08.901.234.5-015.000',
    pic: 'Dewi Sartika, M.M.',
    email: 'commercial@agrindosentosa.co.id',
    isTop: true,
    noTelepon: '02158309123',
    alamat: 'Kawasan Industri Gandasari Blok B-5',
    kota: 'Tangerang',
    kodePos: '15137',
    tglBergabung: new Date('2022-04-14'),
    status: 'Aktif',
    limitKredit: 750000000,
    remainKredit: 600000000,
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
];

export const dataSupplier = [
  {
    kodeSupplier: 'SUP-001',
    namaSupplier: 'Balai Besar Pengujian Standar Instrumen Padi (BBPSI Padi)',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-002',
    namaSupplier: 'Balai Penelitian Tanaman Aneka Kacang dan Umbi (Balitkabi)',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-003',
    namaSupplier: 'PT East West Seed Indonesia (Cap Panah Merah)',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-004',
    namaSupplier: 'PT Bisi International Tbk (Cap Kapal Terbang)',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-005',
    namaSupplier: 'CV Agronusa Sejahtera Mandiri',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-006',
    namaSupplier: 'Kelompok Penangkar Benih Padi Citra Tani',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-007',
    namaSupplier: 'PT Syngenta Seed Indonesia',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-008',
    namaSupplier: 'PT Corteva Agriscience Seeds Indonesia (Pioneer)',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-009',
    namaSupplier: 'Penangkar Benih Horti Makmur Lestari',
    kategori: 'benih',
    status: 'Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
  {
    kodeSupplier: 'SUP-010',
    namaSupplier: 'UD Sumber Benih Unggul Nusantara',
    kategori: 'benih',
    status: 'Tidak Aktif',
    dibuatOleh: 'superadmin',
    diubahOleh: 'superadmin',
  },
];

export async function seedGudang() {
  console.log('📦 Seeding Master Gudang...');
  for (const item of dataGudang) {
    const res = await prisma.gudang.upsert({
      where: { kodeGudang: item.kodeGudang },
      update: {
        namaGudang: item.namaGudang,
        kategori: item.kategori,
        status: item.status,
        diubahOleh: item.diubahOleh,
      },
      create: {
        ...item,
      },
    });
    console.log(`  ✅ Gudang: [${res.kodeGudang}] ${res.namaGudang} (${res.kategori})`);
  }
}

export async function seedCustomer() {
  console.log('👥 Seeding Master Customer...');
  for (const item of dataCustomer) {
    const res = await prisma.customer.upsert({
      where: { kodeCust: item.kodeCust },
      update: {
        namaCust: item.namaCust,
        kategori: item.kategori,
        NPWP: item.NPWP,
        pic: item.pic,
        email: item.email,
        isTop: item.isTop,
        noTelepon: item.noTelepon,
        alamat: item.alamat,
        kota: item.kota,
        kodePos: item.kodePos,
        tglBergabung: item.tglBergabung,
        status: item.status,
        limitKredit: item.limitKredit,
        remainKredit: item.remainKredit,
        diubahOleh: item.diubahOleh,
      },
      create: {
        ...item,
      },
    });
    console.log(`  ✅ Customer: [${res.kodeCust}] ${res.namaCust} (${res.kategori} - ${res.kota})`);
  }
}

export async function seedSupplier() {
  console.log('🏭 Seeding Master Supplier...');
  for (const item of dataSupplier) {
    const res = await prisma.supplier.upsert({
      where: { kodeSupplier: item.kodeSupplier },
      update: {
        namaSupplier: item.namaSupplier,
        kategori: item.kategori,
        status: item.status,
        diubahOleh: item.diubahOleh,
      },
      create: {
        ...item,
      },
    });
    console.log(`  ✅ Supplier: [${res.kodeSupplier}] ${res.namaSupplier} (${res.kategori})`);
  }
}

export async function main() {
  console.log('🌱 Start seeding Master Data (Gudang, Customer, Supplier)...');
  await seedGudang();
  await seedCustomer();
  await seedSupplier();
  console.log('🎉 Seeding Master Data finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding master data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
