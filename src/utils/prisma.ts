import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = new URL(process.env.DATABASE_URL!.replace('mysql://', 'http://'));

const adapter = new PrismaMariaDb({
  host: url.hostname || '127.0.0.1', // gunakan hostname dari DATABASE_URL
  port: Number(url.port) || 3306,
  user: url.username || 'root',
  password: url.password || '',
  database: url.pathname.replace('/', '')
});

export const prisma = new PrismaClient({ adapter });

export default prisma;