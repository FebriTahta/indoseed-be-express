import { Request, Response } from 'express';
import { commodityRepository } from '../repositories/commodity.repository';
import { uploadFile, deleteFile } from '../utils/minio';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createCommodity = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeKomoditas,
      namaKomoditas,
      kategori,
      deskripsi,
      status = 'Aktif',
    } = req.body;

    // Validate required fields
    if (!kodeKomoditas || !namaKomoditas || !kategori) {
      return res.status(400).json({
        status: 'error',
        message: 'kodeKomoditas, namaKomoditas, and kategori are required fields',
      });
    }

    // Check uniqueness of kodeKomoditas
    const existing = await commodityRepository.findByKodeKomoditas(kodeKomoditas);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Komoditas dengan kode '${kodeKomoditas}' sudah terdaftar`,
      });
    }

    // Upload image to MinIO if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const createdBy = req.user?.username || 'Admin';

    const newCommodity = await commodityRepository.create({
      kodeKomoditas,
      namaKomoditas,
      kategori,
      deskripsi,
      status,
      dibuatOleh: createdBy,
      diubahOleh: createdBy,
      image: imageUrl,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Komoditas berhasil dibuat',
      data: newCommodity,
    });
  } catch (error: any) {
    console.error('Error creating commodity:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getCommodities = async (req: Request, res: Response) => {
  try {
    const {
      search,
      kategori,
      status,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await commodityRepository.findAll({
      search: search as string,
      kategori: kategori as string,
      status: status as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data komoditas berhasil diambil',
      data: result.items,
      pagination: result.pagination,
      filters: {
        search: search || null,
        kategori: kategori || null,
        status: status || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching commodities:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getCommodityById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const commodity = await commodityRepository.findById(id);

    if (!commodity) {
      return res.status(404).json({
        status: 'error',
        message: 'Data komoditas tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail komoditas berhasil diambil',
      data: commodity,
    });
  } catch (error: any) {
    console.error('Error fetching commodity by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateCommodity = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await commodityRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data komoditas tidak ditemukan',
      });
    }

    const {
      kodeKomoditas,
      namaKomoditas,
      kategori,
      deskripsi,
      status,
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeKomoditas if updated
    if (kodeKomoditas !== undefined && kodeKomoditas !== existing.kodeKomoditas) {
      const codeCheck = await commodityRepository.findByKodeKomoditas(kodeKomoditas);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Komoditas dengan kode '${kodeKomoditas}' sudah terdaftar`,
        });
      }
      updateData.kodeKomoditas = kodeKomoditas;
    }

    if (namaKomoditas !== undefined) updateData.namaKomoditas = namaKomoditas;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (status !== undefined) updateData.status = status;

    const updatedBy = req.user?.username || 'Admin';
    updateData.diubahOleh = updatedBy;

    // Handle Image Upload logic
    if (req.file) {
      // Delete old file if it existed
      if (existing.image) {
        await deleteFile(existing.image);
      }
      // Upload new file
      updateData.image = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const updated = await commodityRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Komoditas berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating commodity:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteCommodity = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await commodityRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data komoditas tidak ditemukan',
      });
    }

    // Delete image from MinIO if it existed
    if (existing.image) {
      await deleteFile(existing.image);
    }

    await commodityRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Komoditas berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting commodity:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
