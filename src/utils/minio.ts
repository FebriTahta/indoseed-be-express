import * as Minio from 'minio';
import path from 'path';
import sharp from 'sharp';

const minioUrl = process.env.MINIO_PATH || 'http://localhost:9000';
let parsedUrl: URL;

try {
  parsedUrl = new URL(minioUrl);
} catch (e) {
  console.error(`Invalid MINIO_PATH: ${minioUrl}. Falling back to default URL.`);
  parsedUrl = new URL('http://localhost:9000');
}

export const minioClient = new Minio.Client({
  endPoint: parsedUrl.hostname,
  port: parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:' ? 443 : 80),
  useSSL: parsedUrl.protocol === 'https:',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

export const bucketName = process.env.MINIO_BUCKET || 'dev';

// Initialize bucket and set policy to public-read for public file access
export const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket '${bucketName}' created successfully.`);

      // Set public read policy for the bucket
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Public read policy set for bucket '${bucketName}'.`);
    } else {
      console.log(`Bucket '${bucketName}' already exists.`);
    }
  } catch (error) {
    console.error('Error initializing Minio bucket:', error);
  }
};

/**
 * Uploads a file buffer to Minio and returns the public URL.
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string = 'greenhouses'
): Promise<string> => {
  const extension = path.extname(originalFilename);
  const uniqueFilename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}${extension}`;

  let processedBuffer = fileBuffer;

  // Compress image if it is an image type
  if (mimeType.startsWith('image/')) {
    try {
      if (mimeType === 'image/png') {
        processedBuffer = await sharp(fileBuffer).png({ quality: 80, compressionLevel: 8 }).toBuffer();
      } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        processedBuffer = await sharp(fileBuffer).jpeg({ quality: 80 }).toBuffer();
      } else if (mimeType === 'image/webp') {
        processedBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();
      }
    } catch (e) {
      console.error('Image compression failed, using original file:', e);
      processedBuffer = fileBuffer;
    }
  }

  await minioClient.putObject(bucketName, uniqueFilename, processedBuffer, processedBuffer.length, {
    'Content-Type': mimeType,
  });

  // Return the public URL of the uploaded image
  return `${minioUrl}/${bucketName}/${uniqueFilename}`;
};

/**
 * Deletes a file from Minio by its public URL or object name.
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    if (!fileUrl) return;
    
    // Extract object name from public URL
    // e.g. http://145.79.12.74:9000/dev/greenhouses/123-abc.jpg -> greenhouses/123-abc.jpg
    const searchString = `/${bucketName}/`;
    const index = fileUrl.indexOf(searchString);
    if (index === -1) return;

    const objectName = fileUrl.substring(index + searchString.length);
    await minioClient.removeObject(bucketName, objectName);
    console.log(`Deleted object '${objectName}' from bucket '${bucketName}'.`);
  } catch (error) {
    console.error(`Failed to delete object from Minio:`, error);
  }
};
