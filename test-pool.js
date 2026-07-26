const mariadb = require('mariadb');
async function run() {
  const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'erp_indoseed'
  });
  console.log("Pool created. Getting connection...");
  try {
    const conn = await pool.getConnection();
    console.log("Connection retrieved!");
    const rows = await conn.query("SHOW TABLES;");
    console.log("Tables:", rows);
    conn.release();
  } catch (err) {
    console.error("Pool error:", err);
  }
  pool.end();
}
run();
