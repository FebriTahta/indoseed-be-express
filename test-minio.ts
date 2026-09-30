import { minioClient, bucketName } from './src/utils/minio';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    console.log('Bucket exists:', exists);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
