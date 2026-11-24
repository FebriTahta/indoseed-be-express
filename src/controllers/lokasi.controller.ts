import { Request, Response } from 'express';
import { lokasiRepository } from '../repositories/lokasi.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getLokasis = async (req: Request, res: Response) => {
  try {
    // Seed initial locations if empty
    await lokasiRepository.seedInitialIfEmpty();

    const { page = 1, pageSize = 10, search, tipeLokasi, status } = req.query;

    const result = await lokasiRepository.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search ? String(search) : undefined,
      tipeLokasi: tipeLokasi ? String(tipeLokasi) : undefined,
      status: status ? String(status) : undefined,
    });

    const stats = await lokasiRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
      stats,
    });
  } catch (error: any) {
    console.error('getLokasis error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data master lokasi',
    });
  }
};

export const getLokasiStats = async (_req: Request, res: Response) => {
  try {
    await lokasiRepository.seedInitialIfEmpty();
    const stats = await lokasiRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('getLokasiStats error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil statistik master lokasi',
    });
  }
};

export const getNextKode = async (_req: Request, res: Response) => {
  try {
    const nextKode = await lokasiRepository.getNextKode();
    return res.status(200).json({
      status: 'success',
      data: { kodeLokasi: nextKode },
    });
  } catch (error: any) {
    console.error('getNextKode lokasi error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal membuat kode lokasi',
    });
  }
};

export const getLokasiById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await lokasiRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lokasi tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('getLokasiById error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil detail lokasi',
    });
  }
};

export const createLokasi = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeLokasi,
      namaLokasi,
      tipeLokasi,
      alamat,
      kota,
      provinsi,
      koordinat,
      luasArea,
      penanggungJawabUtama,
      status = 'Aktif',
      keterangan,
    } = req.body;

    if (!namaLokasi || !namaLokasi.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama lokasi wajib diisi',
      });
    }

    // Check duplicate name
    const existingName = await lokasiRepository.findByNama(namaLokasi);
    if (existingName) {
      return res.status(400).json({
        status: 'error',
        message: `Lokasi dengan nama '${namaLokasi}' sudah ada`,
      });
    }

    if (kodeLokasi && kodeLokasi.trim()) {
      const existingKode = await lokasiRepository.findByKode(kodeLokasi.trim());
      if (existingKode) {
        return res.status(400).json({
          status: 'error',
          message: `Kode lokasi '${kodeLokasi}' sudah digunakan`,
        });
      }
    }

    const createdBy = req.user?.username || 'Admin';

    const newItem = await lokasiRepository.create({
      kodeLokasi,
      namaLokasi,
      tipeLokasi,
      alamat,
      kota,
      provinsi,
      koordinat,
      luasArea,
      penanggungJawabUtama,
      status,
      keterangan,
      dibuatOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Lokasi berhasil ditambahkan',
      data: newItem,
    });
  } catch (error: any) {
    console.error('createLokasi error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menambahkan lokasi baru',
    });
  }
};

export const updateLokasi = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      kodeLokasi,
      namaLokasi,
      tipeLokasi,
      alamat,
      kota,
      provinsi,
      koordinat,
      luasArea,
      penanggungJawabUtama,
      status,
      keterangan,
    } = req.body;

    const existing = await lokasiRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lokasi tidak ditemukan',
      });
    }

    if (namaLokasi && namaLokasi.trim() !== existing.namaLokasi) {
      const existingName = await lokasiRepository.findByNama(namaLokasi);
      if (existingName && existingName.id !== id) {
        return res.status(400).json({
          status: 'error',
          message: `Lokasi dengan nama '${namaLokasi}' sudah ada`,
        });
      }
    }

    if (kodeLokasi && kodeLokasi.trim() !== existing.kodeLokasi) {
      const existingKode = await lokasiRepository.findByKode(kodeLokasi.trim());
      if (existingKode && existingKode.id !== id) {
        return res.status(400).json({
          status: 'error',
          message: `Kode lokasi '${kodeLokasi}' sudah digunakan`,
        });
      }
    }

    const updatedBy = req.user?.username || 'Admin';

    const updated = await lokasiRepository.update(id, {
      kodeLokasi,
      namaLokasi,
      tipeLokasi,
      alamat,
      kota,
      provinsi,
      koordinat,
      luasArea,
      penanggungJawabUtama,
      status,
      keterangan,
      diubahOleh: updatedBy,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data lokasi berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('updateLokasi error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui lokasi',
    });
  }
};

export const deleteLokasi = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await lokasiRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Lokasi berhasil dihapus',
    });
  } catch (error: any) {
    console.error('deleteLokasi error:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Gagal menghapus lokasi',
    });
  }
};
