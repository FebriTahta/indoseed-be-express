async function run() {
  try {
    const getRes = await fetch('http://localhost:8080/api/qc/tests?jenisUji=Kadar Air');
    const tests = (await getRes.json()).data;
    if (tests.length < 2) return console.log('Not enough tests');
    
    const test1 = tests[0];
    const test2 = tests[1];
    
    const payload = {
      kodeBatch: test2.kodeBatch, // use test2's batch
      testMethodId: test2.testMethodId, // use test2's method
    };
    
    // try to update test1 to have test2's unique combination
    const updateRes = await fetch(`http://localhost:8080/api/qc/tests/${test1.id}`, {
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
