import { Request, Response } from 'express';
import * as DocumentRepo from '../repositories/document.repository';
import { uploadFile } from '../utils/minio';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await DocumentRepo.getDocuments();
    res.json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await DocumentRepo.getDocumentById(req.params.id as string);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({ success: true, data: document });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const documentData = { ...req.body };
    if (req.file) {
      documentData.fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'qc');
    }
    const document = await DocumentRepo.createDocument(documentData);
    res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const documentData = { ...req.body };
    if (req.file) {
      documentData.fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'qc');
    }
    const document = await DocumentRepo.updateDocument(req.params.id as string, documentData);
    res.json({ success: true, data: document });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    await DocumentRepo.deleteDocument(req.params.id as string);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
