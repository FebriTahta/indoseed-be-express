import re

with open('src/utils/prisma.ts', 'r') as f:
    pass # just checking if we are in right dir, wait we are in /indoseed-be-express

with open('prisma/seed.ts', 'r') as f:
    content = f.read()

# 1. Replace the calls
calls = """  await seedQcDayaTumbuh(prisma);
  await seedQcKadarAir(prisma);
  await seedQcKemurnian(prisma);
  await seedQcVigor(prisma);"""

content = content.replace(calls, "  await seedQcTests(prisma);")

# 2. Add seedQcTests implementation
seed_tests = """
async function seedQcTests(prisma: any) {
  console.log('Seeding QC Tests...');

  // Hapus data lama yang memiliki awalan QC
  await prisma.qcTest.deleteMany({
    where: { kodeBatch: { startsWith: 'QC' } }
  });

  const tests = [
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Daya Tumbuh', 
      tanggalUji: new Date('2026-06-11'), petugasUji: 'Dewi Lestari', testMethodName: 'Germination Test', 
      jumlahSampel: 400, nilaiHasil: 96.50, batasAcuan: 85, status: 'Lulus', sertifikat: 'CT-2606-0001',
      detailUji: {
        jumlahBenihDitanam: 400, jumlahBerkecambah: 386, jumlahTidakBerkecambah: 14, 
        waktuUjiHari: 7, suhuUji: '25 ± 2°C', mediaUji: 'Kertas Merang', kelembabanMedia: '70 - 80 %'
      }
    },
    { 
      kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', jenisUji: 'Kadar Air', 
      tanggalUji: new Date('2026-06-11'), petugasUji: 'Dewi Lestari', testMethodName: 'Moisture Content', 
      jumlahSampel: 116, nilaiHasil: 11.2, batasAcuan: 13.0, status: 'Lulus', sertifikat: 'CT-2606-0001',
      detailUji: {
        alat: 'Oven Memmert UN55', suhuUji: '105 ± 3', waktuPengeringan: '17 jam', ulangan: '2 kali', 
        beratAwal: 5.0, beratAkhir: 4.4
      }
    }
  ];

  for (const test of tests) {
    const commodity = await prisma.commodity.findFirst({ where: { namaKomoditas: test.komoditas } });
    const variety = await prisma.variety.findFirst({ where: { namaVarietas: test.varietas } });
    const testMethod = await prisma.testMethod.findFirst({ where: { nama: test.testMethodName } });

    const { komoditas, varietas, testMethodName, ...testData } = test;

    if (testMethod) {
      await prisma.qcTest.upsert({ 
        where: { kodeBatch_testMethodId: { kodeBatch: test.kodeBatch, testMethodId: testMethod.id } }, 
        update: { ...testData, commodityId: commodity?.id, varietyId: variety?.id, testMethodId: testMethod.id }, 
        create: { ...testData, commodityId: commodity?.id, varietyId: variety?.id, testMethodId: testMethod.id } 
      });
    }
  }
}
"""

content = re.sub(r'async function seedQcDayaTumbuh\(prisma: any\) \{.*?(?=async function seedQcKadarAir)', seed_tests, content, flags=re.DOTALL)

# Delete seedQcKadarAir
content = re.sub(r'async function seedQcKadarAir\(prisma: any\) \{.*?(?=async function seedJadwalTanam)', '', content, flags=re.DOTALL)

# Delete seedQcKemurnian
content = re.sub(r'async function seedQcKemurnian\(prisma: any\) \{.*?(?=async function seedQcVigor)', '', content, flags=re.DOTALL)

# Delete seedQcVigor
content = re.sub(r'async function seedQcVigor\(prisma: any\) \{.*?(?=\n$|\Z)', '', content, flags=re.DOTALL)

with open('prisma/seed.ts', 'w') as f:
    f.write(content)

