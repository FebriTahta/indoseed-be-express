import { prisma } from '../src/utils/prisma';

async function main() {
  console.log('🌱 Seeding Kelompok Tani data...');

  const pjs = await prisma.penanggungJawab.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const pj1 = pjs[0]?.id || null;
  const pj2 = pjs[1]?.id || pj1;
  const pj3 = pjs[2]?.id || pj1;
  const pj4 = pjs[3]?.id || pj1;

  const data = [
    {
      kodeKelompok: 'KT-001',
      namaKelompok: 'Kelompok Tani Maju',
      ketua: 'Suryadi',
      noHpKetua: '0812 3456 7890',
      tahunBerdiri: '2018',
      lokasi: 'Sumberrejo',
      desa: 'Sumberrejo',
      kecamatan: 'Wagir',
      kabupaten: 'Malang',
      komoditasUtama: 'Melon',
      jumlahAnggota: 18,
      deskripsi: 'Kelompok tani fokus pada budidaya melon dan telah bekerja sama dengan perusahaan sejak 2018.',
      status: 'Aktif',
      penanggungJawabId: pj1,
    },
    {
      kodeKelompok: 'KT-002',
      namaKelompok: 'Kelompok Tani Makmur',
      ketua: 'Budi Santoso',
      noHpKetua: '0813 4567 8901',
      tahunBerdiri: '2019',
      lokasi: 'Karangrejo',
      desa: 'Karangrejo',
      kecamatan: 'Kromengan',
      kabupaten: 'Malang',
      komoditasUtama: 'Cabai',
      jumlahAnggota: 24,
      deskripsi: 'Kelompok tani berdedikasi tinggi pada produksi benih cabai unggul.',
      status: 'Aktif',
      penanggungJawabId: pj2,
    },
    {
      kodeKelompok: 'KT-003',
      namaKelompok: 'Kelompok Tani Sejahtera',
      ketua: 'Agus Salim',
      noHpKetua: '0812 9876 5432',
      tahunBerdiri: '2017',
      lokasi: 'Ngantang',
      desa: 'Kaumrejo',
      kecamatan: 'Ngantang',
      kabupaten: 'Malang',
      komoditasUtama: 'Melon',
      jumlahAnggota: 22,
      deskripsi: 'Sentra petani melon dataran tinggi dengan hasil panen grade A.',
      status: 'Aktif',
      penanggungJawabId: pj1,
    },
    {
      kodeKelompok: 'KT-004',
      namaKelompok: 'Kelompok Tani Lestari',
      ketua: 'Wahyu',
      noHpKetua: '0857 1234 5678',
      tahunBerdiri: '2020',
      lokasi: 'Wajak',
      desa: 'Blayu',
      kecamatan: 'Wajak',
      kabupaten: 'Malang',
      komoditasUtama: 'Semangka',
      jumlahAnggota: 16,
      deskripsi: 'Kelompok tani spesialis semangka hibrida dan non-biji.',
      status: 'Aktif',
      penanggungJawabId: pj3,
    },
    {
      kodeKelompok: 'KT-005',
      namaKelompok: 'Kelompok Tani Harapan',
      ketua: 'Sutrisno',
      noHpKetua: '0821 2345 6789',
      tahunBerdiri: '2016',
      lokasi: 'Poncokusumo',
      desa: 'Gubugklakah',
      kecamatan: 'Poncokusumo',
      kabupaten: 'Malang',
      komoditasUtama: 'Cabai',
      jumlahAnggota: 20,
      deskripsi: 'Kelompok tani cabai rawit dan merah besar produktif.',
      status: 'Aktif',
      penanggungJawabId: pj2,
    },
    {
      kodeKelompok: 'KT-006',
      namaKelompok: 'Kelompok Tani Berkah Tani',
      ketua: 'Supriyanto',
      noHpKetua: '0813 5555 4444',
      tahunBerdiri: '2021',
      lokasi: 'Tumpang',
      desa: 'Jeru',
      kecamatan: 'Tumpang',
      kabupaten: 'Malang',
      komoditasUtama: 'Semangka',
      jumlahAnggota: 15,
      deskripsi: 'Kemitraan penanaman semangka seluas 12 hektar.',
      status: 'Aktif',
      penanggungJawabId: pj3,
    },
    {
      kodeKelompok: 'KT-007',
      namaKelompok: 'Kelompok Tani Sumber Subur',
      ketua: 'Handoko',
      noHpKetua: '0819 8888 7777',
      tahunBerdiri: '2015',
      lokasi: 'Pakis',
      desa: 'Sukoanyar',
      kecamatan: 'Pakis',
      kabupaten: 'Malang',
      komoditasUtama: 'Melon',
      jumlahAnggota: 30,
      deskripsi: 'Kelompok tani percontohan inovasi irigasi tetes.',
      status: 'Aktif',
      penanggungJawabId: pj1,
    },
    {
      kodeKelompok: 'KT-008',
      namaKelompok: 'Kelompok Tani Rukun Santoso',
      ketua: 'Bambang Irawan',
      noHpKetua: '0852 3333 2222',
      tahunBerdiri: '2018',
      lokasi: 'Dau',
      desa: 'Landungsari',
      kecamatan: 'Dau',
      kabupaten: 'Malang',
      komoditasUtama: 'Cabai',
      jumlahAnggota: 28,
      deskripsi: 'Petani mitra cabai binaan sejak 2018.',
      status: 'Aktif',
      penanggungJawabId: pj2,
    },
    {
      kodeKelompok: 'KT-009',
      namaKelompok: 'Kelompok Tani Bina Mandiri',
      ketua: 'Rudi Hartono',
      noHpKetua: '0878 1111 9999',
      tahunBerdiri: '2022',
      lokasi: 'Singosari',
      desa: 'Klampok',
      kecamatan: 'Singosari',
      kabupaten: 'Malang',
      komoditasUtama: 'Melon',
      jumlahAnggota: 19,
      deskripsi: 'Kelompok tani melon greenhouse dan terbuka.',
      status: 'Aktif',
      penanggungJawabId: pj1,
    },
    {
      kodeKelompok: 'KT-010',
      namaKelompok: 'Kelompok Tani Sinar Harapan',
      ketua: 'Kuswanto',
      noHpKetua: '0812 6666 5555',
      tahunBerdiri: '2019',
      lokasi: 'Kepanjeng',
      desa: 'Curungrejo',
      kecamatan: 'Kepanjen',
      kabupaten: 'Malang',
      komoditasUtama: 'Semangka',
      jumlahAnggota: 32,
      deskripsi: 'Kelompok tani semangka kuning dan merah.',
      status: 'Aktif',
      penanggungJawabId: pj3,
    },
    {
      kodeKelompok: 'KT-011',
      namaKelompok: 'Kelompok Tani Tani Unggul',
      ketua: 'Darmawan',
      noHpKetua: '0813 7777 6666',
      tahunBerdiri: '2020',
      lokasi: 'Bululawang',
      desa: 'Krebet',
      kecamatan: 'Bululawang',
      kabupaten: 'Malang',
      komoditasUtama: 'Cabai',
      jumlahAnggota: 35,
      deskripsi: 'Kelompok tani penghasil benih cabai keriting berkualitas.',
      status: 'Aktif',
      penanggungJawabId: pj4,
    },
    {
      kodeKelompok: 'KT-012',
      namaKelompok: 'Kelompok Tani Tani Mukti',
      ketua: 'Sumardi',
      noHpKetua: '0822 4444 3333',
      tahunBerdiri: '2014',
      lokasi: 'Gondanglegi',
      desa: 'Ketawang',
      kecamatan: 'Gondanglegi',
      kabupaten: 'Malang',
      komoditasUtama: 'Melon',
      jumlahAnggota: 27,
      deskripsi: 'Kelompok tani yang sedang masa transisi revitalisasi lahan.',
      status: 'Nonaktif',
      penanggungJawabId: pj4,
    },
  ];

  for (const item of data) {
    const existing = await prisma.kelompokTani.findUnique({
      where: { kodeKelompok: item.kodeKelompok },
    });

    if (!existing) {
      const created = await prisma.kelompokTani.create({
        data: item,
      });
      console.log(`Created: ${created.kodeKelompok} - ${created.namaKelompok}`);
    } else {
      await prisma.kelompokTani.update({
        where: { id: existing.id },
        data: item,
      });
      console.log(`Updated: ${existing.kodeKelompok} - ${existing.namaKelompok}`);
    }
  }

  // Update existing Partners to connect to Kelompok Tani if their kelompokTani matches
  const allKT = await prisma.kelompokTani.findMany();
  for (const kt of allKT) {
    await prisma.partner.updateMany({
      where: {
        kelompokTani: kt.namaKelompok,
        kelompokTaniId: null,
      },
      data: {
        kelompokTaniId: kt.id,
        penanggungJawabId: kt.penanggungJawabId,
      },
    });
  }

  console.log('✅ Kelompok Tani seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
