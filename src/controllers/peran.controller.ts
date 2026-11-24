import { Request, Response } from 'express';
import { peranRepository } from '../repositories/peran.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPerans = async (req: Request, res: Response) => {
  try {
    // Seed initial roles if empty
    await peranRepository.seedInitialIfEmpty();

    const { page = 1, pageSize = 10, search, kategori, status } = req.query;

    const result = await peranRepository.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search ? String(search) : undefined,
      kategori: kategori ? String(kategori) : undefined,
      status: status ? String(status) : undefined,
    });

    const stats = await peranRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
      stats,
    });
  } catch (error: any) {
    console.error('getPerans error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data master peran',
    });
  }
};

export const getPeranStats = async (_req: Request, res: Response) => {
  try {
    await peranRepository.seedInitialIfEmpty();
    const stats = await peranRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('getPeranStats error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil statistik master peran',
    });
  }
};

export const getNextKode = async (_req: Request, res: Response) => {
  try {
    const nextKode = await peranRepository.getNextKode();
    return res.status(200).json({
      status: 'success',
      data: { kodePeran: nextKode },
    });
  } catch (error: any) {
    console.error('getNextKode peran error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal membuat kode peran',
    });
  }
};

export const getPeranById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await peranRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data peran tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('getPeranById error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil detail peran',
    });
  }
};

export const createPeran = async (req: AuthRequest, res: Response) => {
  try {
    const { kodePeran, namaPeran, kategori, deskripsi, status = 'Aktif' } = req.body;

    if (!namaPeran || !namaPeran.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama peran wajib diisi',
      });
    }

    // Check duplicate name
    const existingName = await peranRepository.findByNama(namaPeran);
    if (existingName) {
      return res.status(400).json({
        status: 'error',
        message: `Peran dengan nama '${namaPeran}' sudah ada`,
      });
    }

    if (kodePeran && kodePeran.trim()) {
      const existingKode = await peranRepository.findByKode(kodePeran.trim());
      if (existingKode) {
        return res.status(400).json({
          status: 'error',
          message: `Kode peran '${kodePeran}' sudah digunakan`,
        });
      }
    }

    const createdBy = req.user?.username || 'Admin';

    const newItem = await peranRepository.create({
      kodePeran,
      namaPeran,
      kategori,
      deskripsi,
      status,
      dibuatOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Peran berhasil ditambahkan',
      data: newItem,
    });
  } catch (error: any) {
    console.error('createPeran error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menambahkan peran baru',
    });
  }
};

export const updatePeran = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { kodePeran, namaPeran, kategori, deskripsi, status } = req.body;

    const existing = await peranRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data peran tidak ditemukan',
      });
    }

    if (namaPeran && namaPeran.trim() !== existing.namaPeran) {
      const existingName = await peranRepository.findByNama(namaPeran);
      if (existingName && existingName.id !== id) {
        return res.status(400).json({
          status: 'error',
          message: `Peran dengan nama '${namaPeran}' sudah ada`,
        });
      }
    }

    if (kodePeran && kodePeran.trim() !== existing.kodePeran) {
      const existingKode = await peranRepository.findByKode(kodePeran.trim());
      if (existingKode && existingKode.id !== id) {
        return res.status(400).json({
          status: 'error',
          message: `Kode peran '${kodePeran}' sudah digunakan`,
        });
      }
    }

    const updatedBy = req.user?.username || 'Admin';

    const updated = await peranRepository.update(id, {
      kodePeran,
      namaPeran,
      kategori,
      deskripsi,
      status,
      diubahOleh: updatedBy,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data peran berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('updatePeran error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui peran',
    });
  }
};

export const deletePeran = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await peranRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Peran berhasil dihapus',
    });
  } catch (error: any) {
    console.error('deletePeran error:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Gagal menghapus peran',
    });
  }
};
