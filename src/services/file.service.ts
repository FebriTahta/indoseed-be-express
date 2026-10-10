import path from 'path';
import { Readable } from 'stream';
import { bucketName, isObjectNotFound, minioClient, MOCK_UPLOAD_URL_MARKER, objectNameFromUrl } from '../utils/minio';
import { HttpError, notFound } from '../utils/httpError';

const PESAN_TIDAK_DITEMUKAN =
  'File tidak ditemukan di penyimpanan. Kemungkinan file sudah dihapus atau gagal diunggah — silakan unggah ulang dokumen tersebut.';

export interface StoredFile {
  stream: Readable;
  fileName: string;
  contentType: string;
  size: number;
}

/**
 * Ambil file dari MinIO berdasarkan URL publiknya. Hanya URL di bucket aplikasi yang dilayani,
 * dan keberadaan objek diperiksa lebih dulu agar klien mendapat pesan yang jelas.
 */
export const fileService = {
  get: async (fileUrl: string, preferredName?: string | null): Promise<StoredFile> => {
    if (!/^https?:\/\//i.test(fileUrl)) {
      throw notFound('File dokumen ini belum pernah diunggah ke penyimpanan. Silakan unggah file dokumennya terlebih dahulu.');
    }
    if (fileUrl.includes(MOCK_UPLOAD_URL_MARKER)) {
      throw notFound('File tidak pernah tersimpan karena penyimpanan tidak tersedia saat diunggah. Silakan unggah ulang dokumen tersebut.');
    }
    const objectName = objectNameFromUrl(fileUrl);
    if (!objectName) throw notFound('Alamat file tidak valid atau bukan berasal dari penyimpanan aplikasi.');

    try {
      const stat = await minioClient.statObject(bucketName, objectName);
      const stream = await minioClient.getObject(bucketName, objectName);
      return {
        stream,
        fileName: preferredName?.trim() || path.basename(objectName),
        contentType: (stat.metaData?.['content-type'] as string) || 'application/octet-stream',
        size: stat.size,
      };
    } catch (err) {
      if (isObjectNotFound(err)) throw notFound(PESAN_TIDAK_DITEMUKAN);
      console.error('Gagal mengambil file dari MinIO:', err);
      throw new HttpError(503, 'Penyimpanan file sedang tidak dapat diakses. Silakan coba beberapa saat lagi.');
    }
  },
};
