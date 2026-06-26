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
