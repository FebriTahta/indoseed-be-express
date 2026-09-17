import 'dotenv/config';
import app from './app';
import { initMinio } from './utils/minio';
import prisma from './utils/prisma';

const PORT = process.env.PORT || 8080;

async function checkDatabaseConnection(): Promise<void> {
  console.log('🔌 Checking database connection...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err);
    throw err;
  }
}

async function bootstrap() {
  try {
    await checkDatabaseConnection();
    await initMinio();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('💥 Server failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
// Trigger restart
