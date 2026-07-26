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
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
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
    multerUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message || 'File upload error',
        });
      }
      next();
    });
  };
};
