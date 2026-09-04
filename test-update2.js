async function run() {
  try {
    const getRes = await fetch('http://localhost:8080/api/qc/tests?jenisUji=Kadar Air');
    const tests = (await getRes.json()).data;
    const test = tests[0];
    
    const payload = {
      kodeBatch: test.kodeBatch,
      testMethodId: test.testMethodId,
      lampiranUrl: "test", // This is what mapToBackendPayload does
      lampiranUrls: []
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
