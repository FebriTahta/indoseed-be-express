import { Request, Response } from 'express';
import { kelompokTaniRepository } from '../repositories/kelompokTani.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getKelompokTani = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      lokasi,
      komoditasUtama,
      status,
      penanggungJawabId,
    } = req.query;

    const result = await kelompokTaniRepository.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search ? String(search).trim() : undefined,
      lokasi:
        lokasi &&
        lokasi !== 'Semua Lokasi' &&
        lokasi !== 'Semua' &&
        lokasi !== 'ALL'
          ? String(lokasi).trim()
          : undefined,
      komoditasUtama:
        komoditasUtama &&
        komoditasUtama !== 'Semua Komoditas' &&
        komoditasUtama !== 'Semua' &&
        komoditasUtama !== 'ALL'
          ? String(komoditasUtama).trim()
          : undefined,
      status:
        status &&
        status !== 'Semua Status' &&
        status !== 'Semua' &&
        status !== 'ALL'
          ? String(status).trim()
          : undefined,
      penanggungJawabId:
        penanggungJawabId &&
        penanggungJawabId !== 'ALL' &&
        penanggungJawabId !== 'Semua'
          ? String(penanggungJawabId).trim()
          : undefined,
    });

    const stats = await kelompokTaniRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
      stats,
    });
  } catch (error: any) {
    console.error('getKelompokTani error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data kelompok tani',
    });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await kelompokTaniRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('getStats error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil statistik kelompok tani',
    });
  }
};

export const getNextKode = async (_req: Request, res: Response) => {
  try {
    const nextKode = await kelompokTaniRepository.getNextKode();
    return res.status(200).json({
      status: 'success',
      data: { kodeKelompok: nextKode },
    });
  } catch (error: any) {
    console.error('getNextKode error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal membuat kode kelompok tani',
    });
  }
};

export const getKelompokTaniById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await kelompokTaniRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Kelompok tani tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('getKelompokTaniById error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil detail kelompok tani',
    });
  }
};

export const createKelompokTani = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kodeKelompok,
      namaKelompok,
      ketua,
      noHpKetua,
      tahunBerdiri,
      lokasi,
      desa,
      kecamatan,
      kabupaten,
      komoditasUtama,
      commodityId,
      jumlahAnggota,
      deskripsi,
      status = 'Aktif',
      penanggungJawabId,
    } = req.body;

    if (!namaKelompok || typeof namaKelompok !== 'string' || !namaKelompok.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama kelompok tani wajib diisi',
      });
    }

    if (!ketua || typeof ketua !== 'string' || !ketua.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama ketua kelompok wajib diisi',
      });
    }

    if (!lokasi || typeof lokasi !== 'string' || !lokasi.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Lokasi kelompok wajib diisi',
      });
    }

    if (!komoditasUtama || typeof komoditasUtama !== 'string' || !komoditasUtama.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Komoditas utama wajib diisi',
      });
    }

    const createdBy = req.user?.username || 'Admin';

    const newItem = await kelompokTaniRepository.create({
      kodeKelompok: kodeKelompok?.trim(),
      namaKelompok: namaKelompok.trim(),
      ketua: ketua.trim(),
      noHpKetua: noHpKetua?.trim() || null,
      tahunBerdiri: tahunBerdiri ? String(tahunBerdiri).trim() : null,
      lokasi: lokasi.trim(),
      desa: desa?.trim() || null,
      kecamatan: kecamatan?.trim() || null,
      kabupaten: kabupaten?.trim() || null,
      komoditasUtama: komoditasUtama.trim(),
      commodityId: commodityId || null,
      jumlahAnggota: jumlahAnggota !== undefined ? Number(jumlahAnggota) : 0,
      deskripsi: deskripsi?.trim() || null,
      status: status || 'Aktif',
      penanggungJawabId: penanggungJawabId || null,
      dibuatOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Kelompok tani berhasil ditambahkan',
      data: newItem,
    });
  } catch (error: any) {
    console.error('createKelompokTani error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menambahkan kelompok tani',
    });
  }
};

export const updateKelompokTani = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await kelompokTaniRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Kelompok tani tidak ditemukan',
      });
    }

    const {
      kodeKelompok,
      namaKelompok,
      ketua,
      noHpKetua,
      tahunBerdiri,
      lokasi,
      desa,
      kecamatan,
      kabupaten,
      komoditasUtama,
      commodityId,
      jumlahAnggota,
      deskripsi,
      status,
      penanggungJawabId,
    } = req.body;

    const updatedBy = req.user?.username || 'Admin';

    const updated = await kelompokTaniRepository.update(id, {
      kodeKelompok,
      namaKelompok,
      ketua,
      noHpKetua,
      tahunBerdiri: tahunBerdiri !== undefined ? (tahunBerdiri ? String(tahunBerdiri).trim() : null) : undefined,
      lokasi,
      desa,
      kecamatan,
      kabupaten,
      komoditasUtama,
      commodityId,
      jumlahAnggota: jumlahAnggota !== undefined ? Number(jumlahAnggota) : undefined,
      deskripsi,
      status,
      penanggungJawabId,
      diubahOleh: updatedBy,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Kelompok tani berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('updateKelompokTani error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui kelompok tani',
    });
  }
};

export const deleteKelompokTani = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await kelompokTaniRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Kelompok tani tidak ditemukan',
      });
    }

    await kelompokTaniRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Kelompok tani berhasil dihapus',
    });
  } catch (error: any) {
    console.error('deleteKelompokTani error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menghapus kelompok tani',
    });
  }
};
