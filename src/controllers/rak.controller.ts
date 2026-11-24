import { Request, Response } from 'express';
import { rakRepository } from '../repositories/rak.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createRak = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeRak,
      namaRak,
      gudangId,
      kodeGudang,
      namaGudang,
      kategori = 'benih',
      kapasitas = 1000,
      baris = 'A',
      kolom = '1',
      level = '1',
      status = 'Aktif',
      keterangan,
    } = req.body;

    // Validate required fields
    if (!kodeRak || !namaRak) {
      return res.status(400).json({
        status: 'error',
        message: 'Kode Rak dan Nama Rak wajib diisi',
      });
    }

    // Check uniqueness of kodeRak
    const existing = await rakRepository.findByKodeRak(kodeRak);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Rak dengan kode '${kodeRak}' sudah terdaftar`,
      });
    }

    const createdBy = req.user?.username || 'Admin';

    const newRak = await rakRepository.create({
      kodeRak,
      namaRak,
      gudangId: gudangId || null,
      kodeGudang: kodeGudang || null,
      namaGudang: namaGudang || null,
      kategori,
      kapasitas: kapasitas ? Number(kapasitas) : 1000,
      baris: baris || 'A',
      kolom: kolom || '1',
      level: level || '1',
      status,
      keterangan: keterangan || null,
      dibuatOleh: createdBy,
      diubahOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Rak berhasil dibuat',
      data: newRak,
    });
  } catch (error: any) {
    console.error('Error creating rak:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getRak = async (req: Request, res: Response) => {
  try {
    const {
      search,
      kategori,
      status,
      kodeGudang,
      gudangId,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 10;

    const result = await rakRepository.findAll({
      search: search as string,
      kategori: kategori as string,
      status: status as string,
      kodeGudang: kodeGudang as string,
      gudangId: gudangId as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data rak berhasil diambil',
      data: result.items,
      pagination: result.pagination,
      filters: {
        search: search || null,
        kategori: kategori || null,
        status: status || null,
        kodeGudang: kodeGudang || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching rak:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getRakById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const rak = await rakRepository.findById(id);

    if (!rak) {
      return res.status(404).json({
        status: 'error',
        message: 'Data rak tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail rak berhasil diambil',
      data: rak,
    });
  } catch (error: any) {
    console.error('Error fetching rak by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getRakStats = async (req: Request, res: Response) => {
  try {
    const stats = await rakRepository.getStats();
    return res.status(200).json({
      status: 'success',
      message: 'Statistik rak berhasil diambil',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching rak stats:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateRak = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await rakRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data rak tidak ditemukan',
      });
    }

    const {
      kodeRak,
      namaRak,
      gudangId,
      kodeGudang,
      namaGudang,
      kategori,
      kapasitas,
      baris,
      kolom,
      level,
      status,
      keterangan,
    } = req.body;

    const updateData: any = {};

    // Validate uniqueness of new kodeRak if updated
    if (kodeRak !== undefined && kodeRak !== existing.kodeRak) {
      const codeCheck = await rakRepository.findByKodeRak(kodeRak);
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Rak dengan kode '${kodeRak}' sudah digunakan`,
        });
      }
      updateData.kodeRak = kodeRak;
    }

    if (namaRak !== undefined) updateData.namaRak = namaRak;
    if (gudangId !== undefined) updateData.gudangId = gudangId;
    if (kodeGudang !== undefined) updateData.kodeGudang = kodeGudang;
    if (namaGudang !== undefined) updateData.namaGudang = namaGudang;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (kapasitas !== undefined) updateData.kapasitas = Number(kapasitas);
    if (baris !== undefined) updateData.baris = baris;
    if (kolom !== undefined) updateData.kolom = kolom;
    if (level !== undefined) updateData.level = level;
    if (status !== undefined) updateData.status = status;
    if (keterangan !== undefined) updateData.keterangan = keterangan;

    updateData.diubahOleh = req.user?.username || 'Admin';

    const updated = await rakRepository.update(id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Data rak berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating rak:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteRak = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await rakRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data rak tidak ditemukan',
      });
    }

    await rakRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Data rak berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting rak:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
