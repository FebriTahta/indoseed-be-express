import prisma from './src/utils/prisma';

async function main() {
  console.log('Seeding Permintaan Pengujian...');

  // Get available parameters and methods from DB for reference
  const dbParams = await prisma.testParameter.findMany({
    include: { metode: true },
  });
  const dbBatches = await prisma.batchProduksi.findMany();

  const getParam = (nameSnippet: string) =>
    dbParams.find((p) => p.nama.toLowerCase().includes(nameSnippet.toLowerCase()));

  const pDayaTumbuh = getParam('daya tumbuh');
  const pKadarAir = getParam('kadar air');
  const pKemurnian = getParam('kemurnian');
  const pVigor = getParam('vigor');

  const seedRequests = [
    {
      noPermintaan: 'RQ-QC-2026-00125',
      tanggal: new Date('2026-06-16T08:15:00Z'),
      kodeBatch: 'BTH-2026-00125',
      komoditas: 'Melon',
      varietas: 'Tere F1',
      tipe: 'QC / Benih',
      petani: 'Suryadi',
      lahan: 'Lahan 01 / Blok A',
      panen: '16 Jun 2026',
      jumlahSampel: 500,
      satuanSampel: 'gram',
      metodeSampling: 'sop',
      pengambilSampel: 'Andi Pratama (QC Officer)',
      pemohon: 'produksi',
      prioritas: 'normal',
      status: 'Menunggu Persetujuan',
      catatan: 'Prioritas uji daya tumbuh & kadar air segera setelah panen.',
      parameters: [
        {
          parameterId: pKadarAir?.id,
          kode: pKadarAir?.kode || 'PRM-002',
          nama: pKadarAir?.nama || 'Kadar Air',
          kategori: 'Fisik',
          metodeId: pKadarAir?.metodeId,
          metode: pKadarAir?.metode ? `${pKadarAir.metode.kode} - ${pKadarAir.metode.nama}` : 'ISTA 2.2 - Moisture Content',
          metodeKode: pKadarAir?.metode?.kode || 'ISTA 2.2',
          metodeNama: pKadarAir?.metode?.nama || 'Moisture Content',
          standar: '≤ 12 %',
          satuan: '%',
          checked: true,
        },
        {
          parameterId: pDayaTumbuh?.id,
          kode: pDayaTumbuh?.kode || 'PRM-001',
          nama: pDayaTumbuh?.nama || 'Daya Tumbuh',
          kategori: 'Fisiologis',
          metodeId: pDayaTumbuh?.metodeId,
          metode: pDayaTumbuh?.metode ? `${pDayaTumbuh.metode.kode} - ${pDayaTumbuh.metode.nama}` : 'ISTA 5.2.1 - Germination Test',
          metodeKode: pDayaTumbuh?.metode?.kode || 'ISTA 5.2.1',
          metodeNama: pDayaTumbuh?.metode?.nama || 'Germination Test',
          standar: '≥ 80 %',
          satuan: '%',
          checked: true,
        },
      ],
    },
    {
      noPermintaan: 'RQ-QC-2026-00124',
      tanggal: new Date('2026-06-15T14:20:00Z'),
      kodeBatch: 'BTH-2026-00124',
      komoditas: 'Cabai',
      varietas: 'Keriting',
      tipe: 'QC / Benih',
      petani: 'Budi',
      lahan: 'Lahan 02 / Blok B',
      panen: '15 Jun 2026',
      jumlahSampel: 500,
      satuanSampel: 'gram',
      metodeSampling: 'sop',
      pengambilSampel: 'Budi Santoso (Lab Tech)',
      pemohon: 'produksi',
      prioritas: 'normal',
      status: 'Sampling',
      catatan: 'Pengambilan sampel komposit di area pengeringan.',
      parameters: [
        {
          parameterId: pKemurnian?.id,
          kode: pKemurnian?.kode || 'PRM-003',
          nama: pKemurnian?.nama || 'Kemurnian',
          kategori: 'Fisik',
          metodeId: pKemurnian?.metodeId,
          metode: pKemurnian?.metode ? `${pKemurnian.metode.kode} - ${pKemurnian.metode.nama}` : 'ISTA 2.10 - Pure Seed',
          metodeKode: pKemurnian?.metode?.kode || 'ISTA 2.10',
          metodeNama: pKemurnian?.metode?.nama || 'Pure Seed',
          standar: '≥ 98 %',
          satuan: '%',
          checked: true,
        },
      ],
    },
    {
      noPermintaan: 'RQ-QC-2026-00123',
      tanggal: new Date('2026-06-14T09:10:00Z'),
      kodeBatch: 'BTH-2026-00122',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      tipe: 'QC / Benih',
      petani: 'Mulyono',
      lahan: 'Lahan 03 / Blok C',
      panen: '14 Jun 2026',
      jumlahSampel: 1,
      satuanSampel: 'kg',
      metodeSampling: 'random',
      pengambilSampel: 'Citra Dewi (QC Inspector)',
      pemohon: 'produksi',
      prioritas: 'urgent',
      status: 'Dalam Pengujian',
      catatan: 'Segera butuh hasil vigor untuk sertifikasi benih.',
      parameters: [
        {
          parameterId: pDayaTumbuh?.id,
          kode: pDayaTumbuh?.kode || 'PRM-001',
          nama: pDayaTumbuh?.nama || 'Daya Tumbuh',
          kategori: 'Fisiologis',
          metodeId: pDayaTumbuh?.metodeId,
          metode: pDayaTumbuh?.metode ? `${pDayaTumbuh.metode.kode} - ${pDayaTumbuh.metode.nama}` : 'ISTA 5.2.1 - Germination Test',
          metodeKode: pDayaTumbuh?.metode?.kode || 'ISTA 5.2.1',
          metodeNama: pDayaTumbuh?.metode?.nama || 'Germination Test',
          standar: '≥ 80 %',
          satuan: '%',
          checked: true,
        },
        {
          parameterId: pVigor?.id,
          kode: pVigor?.kode || 'PRM-004',
          nama: pVigor?.nama || 'Vigor',
          kategori: 'Fisiologis',
          metodeId: pVigor?.metodeId,
          metode: pVigor?.metode ? `${pVigor.metode.kode} - ${pVigor.metode.nama}` : 'ISTA 7.3 - Vigor Test',
          metodeKode: pVigor?.metode?.kode || 'ISTA 7.3',
          metodeNama: pVigor?.metode?.nama || 'Vigor Test',
          standar: '≥ 70 %',
          satuan: '%',
          checked: true,
        },
      ],
    },
    {
      noPermintaan: 'RQ-QC-2026-00122',
      tanggal: new Date('2026-06-13T11:45:00Z'),
      kodeBatch: 'BTH-2026-00121',
      komoditas: 'Melon',
      varietas: 'Tere F1',
      tipe: 'QC / Benih',
      petani: 'Suryadi',
      lahan: 'Lahan 01 / Blok B',
      panen: '13 Jun 2026',
      jumlahSampel: 500,
      satuanSampel: 'gram',
      metodeSampling: 'sop',
      pengambilSampel: 'Andi Pratama (QC Officer)',
      pemohon: 'produksi',
      prioritas: 'normal',
      status: 'Menunggu Review',
      catatan: 'Hasil uji lab telah masuk, menunggu persetujuan QC manager.',
      parameters: [
        {
          parameterId: pKadarAir?.id,
          kode: pKadarAir?.kode || 'PRM-002',
          nama: pKadarAir?.nama || 'Kadar Air',
          kategori: 'Fisik',
          metodeId: pKadarAir?.metodeId,
          metode: pKadarAir?.metode ? `${pKadarAir.metode.kode} - ${pKadarAir.metode.nama}` : 'ISTA 2.2 - Moisture Content',
          metodeKode: pKadarAir?.metode?.kode || 'ISTA 2.2',
          metodeNama: pKadarAir?.metode?.nama || 'Moisture Content',
          standar: '≤ 12 %',
          satuan: '%',
          checked: true,
        },
      ],
    },
    {
      noPermintaan: 'RQ-QC-2026-00121',
      tanggal: new Date('2026-06-12T10:30:00Z'),
      kodeBatch: 'BTH-2026-00119',
      komoditas: 'Cabai',
      varietas: 'Rawit',
      tipe: 'QC / Benih',
      petani: 'Santoso',
      lahan: 'Lahan 04 / Blok A',
      panen: '12 Jun 2026',
      jumlahSampel: 500,
      satuanSampel: 'gram',
      metodeSampling: 'sop',
      pengambilSampel: 'Budi Santoso (Lab Tech)',
      pemohon: 'produksi',
      prioritas: 'normal',
      status: 'Selesai',
      catatan: 'Pemeriksaan lengkap selesai dan lolos standar mutu.',
      parameters: [
        {
          parameterId: pDayaTumbuh?.id,
          kode: pDayaTumbuh?.kode || 'PRM-001',
          nama: pDayaTumbuh?.nama || 'Daya Tumbuh',
          kategori: 'Fisiologis',
          metodeId: pDayaTumbuh?.metodeId,
          metode: pDayaTumbuh?.metode ? `${pDayaTumbuh.metode.kode} - ${pDayaTumbuh.metode.nama}` : 'ISTA 5.2.1 - Germination Test',
          metodeKode: pDayaTumbuh?.metode?.kode || 'ISTA 5.2.1',
          metodeNama: pDayaTumbuh?.metode?.nama || 'Germination Test',
          standar: '≥ 80 %',
          satuan: '%',
          checked: true,
        },
        {
          parameterId: pKadarAir?.id,
          kode: pKadarAir?.kode || 'PRM-002',
          nama: pKadarAir?.nama || 'Kadar Air',
          kategori: 'Fisik',
          metodeId: pKadarAir?.metodeId,
          metode: pKadarAir?.metode ? `${pKadarAir.metode.kode} - ${pKadarAir.metode.nama}` : 'ISTA 2.2 - Moisture Content',
          metodeKode: pKadarAir?.metode?.kode || 'ISTA 2.2',
          metodeNama: pKadarAir?.metode?.nama || 'Moisture Content',
          standar: '≤ 12 %',
          satuan: '%',
          checked: true,
        },
      ],
    },
  ];

  for (const item of seedRequests) {
    const { parameters, ...headerData } = item;
    
    // Check if batch matches in DB
    const matchingBatch = dbBatches.find((b) => b.kodeBatch === headerData.kodeBatch);
    const batchProduksiId = matchingBatch ? matchingBatch.id : undefined;

    // Upsert Permintaan
    const created = await prisma.permintaanPengujian.upsert({
      where: { noPermintaan: headerData.noPermintaan },
      update: {
        ...headerData,
        batchProduksiId,
      },
      create: {
        ...headerData,
        batchProduksiId,
      },
    });

    // Delete existing parameters and re-add
    await prisma.permintaanPengujianParameter.deleteMany({
      where: { permintaanId: created.id },
    });

    for (const p of parameters) {
      await prisma.permintaanPengujianParameter.create({
        data: {
          permintaanId: created.id,
          parameterId: p.parameterId,
          kode: p.kode,
          nama: p.nama,
          kategori: p.kategori,
          metodeId: p.metodeId,
          metode: p.metode,
          metodeKode: p.metodeKode,
          metodeNama: p.metodeNama,
          standar: p.standar,
          satuan: p.satuan,
          checked: p.checked,
        },
      });
    }
  }

  console.log('Permintaan Pengujian seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding Permintaan Pengujian:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
