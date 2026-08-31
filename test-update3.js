async function run() {
  try {
    const getRes = await fetch('http://localhost:8080/api/qc/tests?jenisUji=Kadar Air');
    const tests = (await getRes.json()).data;
    const test = tests[0];
    
    // Simulate what the frontend payload EXACTLY is when edit doesn't change anything
    const payload = {
      kodeBatch: test.kodeBatch,
      commodityId: test.commodityId,
      varietyId: test.varietyId,
      tanggalUji: test.tanggalUji,
      petugasUjiId: test.petugasUjiId,
      jumlahSampel: test.jumlahSampel,
      lampiranUrl: undefined,
      lampiranUrls: [],
      catatan: test.catatan,
      lokasiLab: test.lokasiLab,
      testMethodId: test.testMethodId,
      jenisUji: test.jenisUji,
      nilaiHasil: test.nilaiHasil,
      batasAcuan: test.batasAcuan,
      status: test.status,
      detailUji: test.detailUji
    };
    
    const updateRes = await fetch(`http://localhost:8080/api/qc/tests/${test.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status:', updateRes.status);
    console.log('Data:', await updateRes.json());
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
