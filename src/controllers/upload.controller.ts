import { Request, Response } from 'express';
import { uploadFile } from '../utils/minio';

export const uploadFileHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'uploads';
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, folder);

    res.status(201).json({ success: true, data: { fileUrl } });
  } catch (error: any) {
    console.error('Error in uploadFileHandler:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};
