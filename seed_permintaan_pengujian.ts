/// <reference types="node" />
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

  const dbPartners = await prisma.partner.findMany();
  const dbPenguji = await prisma.penguji.findMany();

  if (dbBatches.length === 0) {
    console.log('No BatchProduksi found! Please seed BatchProduksi first.');
    return;
  }

  const seedRequests = dbBatches.slice(0, 5).map((batch, index) => {
    // Pilih partner secara acak (atau berdasarkan index)
    const partner = dbPartners.length > 0 ? dbPartners[index % dbPartners.length] : null;
    const penguji = dbPenguji.length > 0 ? dbPenguji[index % dbPenguji.length] : null;

    const parameters = [];
    
    // Add Daya Tumbuh
    parameters.push({
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
    });

    // Add Kadar Air if index is even
    if (index % 2 === 0) {
      parameters.push({
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
      });
    }

    return {
      noPermintaan: `RQ-QC-2026-${(100 + index).toString().padStart(5, '0')}`,
      tanggal: new Date(),
      kodeBatch: batch.kodeBatch,
      komoditas: batch.komoditas,
      varietas: batch.varietas,
      tipe: 'QC / Benih',
      petani: partner ? partner.namaPetani : 'Petani Internal',
      lahan: batch.lokasi || 'Lahan Utama',
      panen: batch.tanggalSelesai || new Date().toISOString().split('T')[0],
      jumlahSampel: 500,
      satuanSampel: 'gram',
      metodeSampling: 'SOP',
      pengambilSampel: penguji ? penguji.nama : 'Petugas QC',
      pemohon: batch.dibuatOleh || 'Produksi',
      prioritas: index === 0 ? 'urgent' : 'normal',
      status: index === 0 ? 'Dalam Pengujian' : 'Menunggu Persetujuan',
      catatan: `Pengujian untuk batch ${batch.kodeBatch} komoditas ${batch.komoditas} ${batch.varietas}`,
      parameters,
    };
  });

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
