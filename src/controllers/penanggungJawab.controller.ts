import { Request, Response } from 'express';
import { penanggungJawabRepository } from '../repositories/penanggungJawab.repository';

export const getPenanggungJawab = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search, status, peran, areaModul, lokasi } = req.query;

    const result = await penanggungJawabRepository.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      peran: peran ? String(peran) : undefined,
      areaModul: areaModul ? String(areaModul) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
    });

    const stats = await penanggungJawabRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
      stats,
    });
  } catch (error: any) {
    console.error('getPenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data penanggung jawab',
    });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await penanggungJawabRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('getStats error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil statistik penanggung jawab',
    });
  }
};

export const getNextKode = async (_req: Request, res: Response) => {
  try {
    const nextKode = await penanggungJawabRepository.getNextKode();
    return res.status(200).json({
      status: 'success',
      data: { kodePersonel: nextKode },
    });
  } catch (error: any) {
    console.error('getNextKode error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal membuat kode personel',
    });
  }
};

export const getPenanggungJawabById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await penanggungJawabRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Penanggung jawab tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('getPenanggungJawabById error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil detail penanggung jawab',
    });
  }
};

export const createPenanggungJawab = async (req: Request, res: Response) => {
  try {
    const {
      kodePersonel,
      nama,
      peran = 'Penanggung Jawab',
      areaModul = 'Produksi',
      lokasi = 'Semua Lokasi',
      noHp,
      email,
      status = 'Aktif',
      tanggalMulai,
      tanggalSelesai,
      catatan,
    } = req.body;

    if (!nama || typeof nama !== 'string' || !nama.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama lengkap personel wajib diisi',
      });
    }

    const newItem = await penanggungJawabRepository.create({
      kodePersonel: kodePersonel?.trim(),
      nama: nama.trim(),
      peran: peran || 'Penanggung Jawab',
      areaModul: areaModul || 'Produksi',
      lokasi: lokasi || 'Semua Lokasi',
      noHp: noHp?.trim() || null,
      email: email?.trim() || null,
      status: status || 'Aktif',
      tanggalMulai: tanggalMulai || null,
      tanggalSelesai: tanggalSelesai || null,
      catatan: catatan?.trim() || null,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Personel & Tanggung Jawab berhasil ditambahkan',
      data: newItem,
    });
  } catch (error: any) {
    console.error('createPenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menambahkan penanggung jawab',
    });
  }
};

export const updatePenanggungJawab = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      kodePersonel,
      nama,
      peran,
      areaModul,
      lokasi,
      noHp,
      email,
      status,
      tanggalMulai,
      tanggalSelesai,
      catatan,
    } = req.body;

    const existing = await penanggungJawabRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Penanggung jawab tidak ditemukan',
      });
    }

    if (nama !== undefined && (!nama || typeof nama !== 'string' || !nama.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama lengkap personel tidak boleh kosong',
      });
    }

    const updated = await penanggungJawabRepository.update(id, {
      kodePersonel,
      nama,
      peran,
      areaModul,
      lokasi,
      noHp,
      email,
      status,
      tanggalMulai,
      tanggalSelesai,
      catatan,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data Personel & Tanggung Jawab berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('updatePenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui data penanggung jawab',
    });
  }
};

export const deletePenanggungJawab = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await penanggungJawabRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Penanggung jawab tidak ditemukan',
      });
    }

    await penanggungJawabRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Personel & Tanggung Jawab berhasil dihapus',
    });
  } catch (error: any) {
    console.error('deletePenanggungJawab error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menghapus penanggung jawab',
    });
  }
};
