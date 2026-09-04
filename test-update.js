async function run() {
  try {
    const getRes = await fetch('http://localhost:8080/api/qc/tests?jenisUji=Kadar Air');
    const getData = await getRes.json();
    const tests = getData.data;
    if (!tests || tests.length === 0) {
      console.log('No tests found');
      return;
    }
    const test = tests[0];
    console.log('Testing with ID:', test.id);
    
    const payload = {
      kodeBatch: test.kodeBatch,
      testMethodId: test.testMethodId,
      jenisUji: test.jenisUji,
      lampiranUrls: []
    };
    
    const updateRes = await fetch(`http://localhost:8080/api/qc/tests/${test.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const updateData = await updateRes.json();
    console.log('Status:', updateRes.status);
    console.log('Data:', updateData);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
