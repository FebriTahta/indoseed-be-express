import { AsyncResource } from 'async_hooks';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Use memory storage to avoid saving files locally
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Images and Documents (PDF, Word, Excel, PPT) are allowed.') as any, false);
    }
  },
});

export const uploadSingle = (fieldName: string) => {
  const multerUpload = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    // Callback multer dipanggil dari event stream busboy sehingga konteks AsyncLocalStorage
    // (user login, audit) hilang; bind agar handler berikutnya tetap berada di konteks request.
    multerUpload(req, res, AsyncResource.bind((err: unknown) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: (err as Error).message || 'File upload error',
        });
      }
      next();
    }));
  };
};

export const uploadNone = () => {
  const multerUpload = upload.none();

  return (req: Request, res: Response, next: NextFunction) => {
    // Callback multer dipanggil dari event stream busboy sehingga konteks AsyncLocalStorage
    // (user login, audit) hilang; bind agar handler berikutnya tetap berada di konteks request.
    multerUpload(req, res, AsyncResource.bind((err: unknown) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: (err as Error).message || 'Form parse error',
        });
      }
      next();
    }));
  };
};

