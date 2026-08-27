import re

with open('prisma/seed.ts', 'r') as f:
    content = f.read()

rich_seed = """
async function seedQcTests(prisma: any) {
  console.log('Seeding QC Tests...');

  const tests = [
    // --- Daya Tumbuh ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-12'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 75.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 300, jumlahTidakBerkecambah: 100, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-16'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 82.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 328, jumlahTidakBerkecambah: 72, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Padi', varietas: 'IR 64', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-20'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 70.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 280, jumlahTidakBerkecambah: 120, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0004', komoditas: 'Jagung', varietas: 'Bisi 2', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-24'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 78.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 312, jumlahTidakBerkecambah: 88, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0005', komoditas: 'Jagung', varietas: 'Pioneer 21', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-05-28'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 65.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 260, jumlahTidakBerkecambah: 140, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0006', komoditas: 'Kedelai', varietas: 'Anjasmoro', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-01'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 85.0, batasAcuan: 85, status: 'Lulus', sertifikat: 'CT-DT-001',
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 340, jumlahTidakBerkecambah: 60, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0007', komoditas: 'Kedelai', varietas: 'Grobogan', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-05'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 75.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 300, jumlahTidakBerkecambah: 100, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0008', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-09'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 70.0, batasAcuan: 85, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 280, jumlahTidakBerkecambah: 120, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    { 
      kodeBatch: 'BP-2606-0009', komoditas: 'Padi', varietas: 'Ciherang', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-11'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 96.5, batasAcuan: 85, status: 'Lulus', sertifikat: 'CT-DT-002',
      detailUji: { jumlahBenihDitanam: 400, jumlahBerkecambah: 386, jumlahTidakBerkecambah: 14, waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang' }
    },
    
    // --- Kadar Air ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-05-15'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 11.2, batasAcuan: 13.0, status: 'Lulus', sertifikat: 'CT-KA-001',
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.4 }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-05-18'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 12.5, batasAcuan: 13.0, status: 'Lulus', sertifikat: null,
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.37 }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Jagung', varietas: 'Bisi 2', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-05-22'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 14.1, batasAcuan: 12.0, status: 'Tidak Lulus', sertifikat: null,
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.29 }
    },
    { 
      kodeBatch: 'BP-2606-0004', komoditas: 'Kedelai', varietas: 'Anjasmoro', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-06-02'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', 
      jumlahSampel: 100, nilaiHasil: 10.5, batasAcuan: 11.0, status: 'Lulus', sertifikat: 'CT-KA-002',
      detailUji: { alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', beratAwal: 5.0, beratAkhir: 4.47 }
    },

    // --- Kemurnian ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kemurnian', 
      tanggalUji: new Date('2026-05-13'), petugasUji: 'Budi Santoso', testMethodName: 'Purity Analysis', 
      jumlahSampel: 500, nilaiHasil: 99.2, batasAcuan: 98.0, status: 'Memenuhi', sertifikat: 'CT-KM-001',
      detailUji: { beratBenihMurni: 496, beratTanamanLain: 1, beratGulma: 1, beratBahanAsing: 2, alatInstrumen: 'Timbangan Digital' }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Jagung', varietas: 'Bisi 2', jenisUji: 'Kemurnian', 
      tanggalUji: new Date('2026-05-25'), petugasUji: 'Budi Santoso', testMethodName: 'Purity Analysis', 
      jumlahSampel: 900, nilaiHasil: 97.5, batasAcuan: 98.0, status: 'Mendekati', sertifikat: null,
      detailUji: { beratBenihMurni: 877.5, beratTanamanLain: 10, beratGulma: 2.5, beratBahanAsing: 10, alatInstrumen: 'Timbangan Digital' }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Kedelai', varietas: 'Grobogan', jenisUji: 'Kemurnian', 
      tanggalUji: new Date('2026-06-06'), petugasUji: 'Budi Santoso', testMethodName: 'Purity Analysis', 
      jumlahSampel: 1000, nilaiHasil: 94.8, batasAcuan: 98.0, status: 'Tidak Memenuhi', sertifikat: null,
      detailUji: { beratBenihMurni: 948, beratTanamanLain: 20, beratGulma: 10, beratBahanAsing: 22, alatInstrumen: 'Timbangan Digital' }
    },

    // --- Vigor ---
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Vigor', 
      tanggalUji: new Date('2026-05-14'), petugasUji: 'Ratna Sari', testMethodName: 'Vigor Test', 
      jumlahSampel: 400, nilaiHasil: 880, batasAcuan: 800, status: 'Memenuhi', sertifikat: 'CT-VG-001',
      detailUji: { kategori: 'Tinggi', alatInstrumen: 'Germinator', suhuRuangan: '26°C' }
    },
    { 
      kodeBatch: 'BP-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', jenisUji: 'Vigor', 
      tanggalUji: new Date('2026-05-29'), petugasUji: 'Ratna Sari', testMethodName: 'Vigor Test', 
      jumlahSampel: 400, nilaiHasil: 750, batasAcuan: 800, status: 'Mendekati', sertifikat: null,
      detailUji: { kategori: 'Sedang', alatInstrumen: 'Germinator', suhuRuangan: '27°C' }
    },
    { 
      kodeBatch: 'BP-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', jenisUji: 'Vigor', 
      tanggalUji: new Date('2026-06-03'), petugasUji: 'Ratna Sari', testMethodName: 'Vigor Test', 
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
"""

content = re.sub(r'async function seedQcTests\(prisma: any\) \{.*?(?=\nasync function seedJadwalTanam)', rich_seed, content, flags=re.DOTALL)

with open('prisma/seed.ts', 'w') as f:
    f.write(content)
