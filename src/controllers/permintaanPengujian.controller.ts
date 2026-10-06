import { Request, Response } from 'express';
import { permintaanPengujianRepository } from '../repositories/permintaanPengujian.repository';
import { uploadFile } from '../utils/minio';

export const getPermintaanList = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      periode: req.query.periode as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      komoditas: req.query.komoditas as string,
      prioritas: req.query.prioritas as string,
      sortBy: (req.query.sortBy as string) || 'updatedAt',
      sortOrder: ((req.query.sortOrder as string) || 'desc') as 'asc' | 'desc',
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      pageSize: req.query.pageSize
        ? parseInt(req.query.pageSize as string, 10)
        : req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
    };

    const result = await permintaanPengujianRepository.findAll(filters);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error fetching permintaan list:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPermintaanSummary = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const summary = await permintaanPengujianRepository.getSummary(filters);
    res.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('Error fetching permintaan summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNextNumber = async (req: Request, res: Response) => {
  try {
    const nextNumber = await permintaanPengujianRepository.generateNextNumber();
    res.json({ success: true, data: { noPermintaan: nextNumber } });
  } catch (error: any) {
    console.error('Error generating next permintaan number:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPermintaanById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await permintaanPengujianRepository.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Permintaan pengujian tidak ditemukan' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error fetching permintaan by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPermintaan = async (req: Request, res: Response) => {
  try {
    let payload = { ...req.body };

    // If parameters is sent as JSON string in form-data
    if (typeof payload.parameters === 'string') {
      try {
        payload.parameters = JSON.parse(payload.parameters);
      } catch (e) {
        console.warn('Failed parsing parameters JSON string');
      }
    }

    // Handle file upload if present
    if (req.file) {
      const fileUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'qc-permintaan'
      );
      payload.fileLampiranUrl = fileUrl;
      payload.fileLampiranNama = req.file.originalname;

      payload.dokumen = payload.dokumen || [];
      payload.dokumen.push({
        namaFile: req.file.originalname,
        fileUrl,
        tipeFile: req.file.mimetype,
        ukuran: `${(req.file.size / 1024).toFixed(1)} KB`,
      });
    }

    const created = await permintaanPengujianRepository.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('Error creating permintaan:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Nomor permintaan tersebut sudah digunakan. Silakan gunakan nomor lain.',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePermintaan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    let payload = { ...req.body };

    if (typeof payload.parameters === 'string') {
      try {
        payload.parameters = JSON.parse(payload.parameters);
      } catch (e) {
        console.warn('Failed parsing parameters JSON string');
      }
    }

    // Handle file upload if present
    if (req.file) {
      const fileUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'qc-permintaan'
      );
      payload.fileLampiranUrl = fileUrl;
      payload.fileLampiranNama = req.file.originalname;

      payload.dokumen = payload.dokumen || [];
      payload.dokumen.push({
        namaFile: req.file.originalname,
        fileUrl,
        tipeFile: req.file.mimetype,
        ukuran: `${(req.file.size / 1024).toFixed(1)} KB`,
      });
    }

    const updated = await permintaanPengujianRepository.update(id, payload);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating permintaan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePermintaanStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, diubahOleh } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status wajib diisi' });
    }

    const updated = await permintaanPengujianRepository.updateStatus(id, status, diubahOleh);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating permintaan status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePermintaan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await permintaanPengujianRepository.delete(id);
    res.json({ success: true, message: 'Permintaan pengujian berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting permintaan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
