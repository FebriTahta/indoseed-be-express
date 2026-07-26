require('dotenv/config');
const url = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://'));
console.log({
  host: '127.0.0.1',
  port: Number(url.port) || 3306,
  user: url.username || 'root',
  password: url.password || '',
  database: url.pathname.replace('/', '')
});
