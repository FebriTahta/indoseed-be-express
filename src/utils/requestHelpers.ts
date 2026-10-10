import { Request } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { uploadFile, MOCK_UPLOAD_URL_MARKER } from './minio';
import { HttpError } from './httpError';

/** Nama pengguna yang sedang login (dari JWT) untuk kolom audit dibuatOleh/diubahOleh. */
export const getActor = (req: Request): string => (req as AuthRequest).user?.username || 'Sistem';

const formatUkuran = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

/** Upload file multer (jika ada) ke object storage dan kembalikan metadata dokumen. */
export const uploadRequestFile = async (req: Request, folder: string) => {
  if (!req.file) return undefined;
  const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, folder);
  // Jangan simpan URL placeholder ke database bila storage sedang tidak tersedia.
  if (fileUrl.includes(MOCK_UPLOAD_URL_MARKER)) {
    throw new HttpError(503, 'Penyimpanan file (MinIO) sedang tidak dapat diakses. Silakan coba unggah kembali nanti.');
  }
  return {
    namaFile: req.file.originalname,
    fileUrl,
    tipeFile: req.file.mimetype,
    ukuran: formatUkuran(req.file.size),
  };
};
