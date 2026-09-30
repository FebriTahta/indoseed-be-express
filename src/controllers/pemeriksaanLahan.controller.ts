import { Request, Response } from 'express';
import { pemeriksaanLahanRepository } from '../repositories/pemeriksaanLahan.repository';

export const getPemeriksaanLahanList = async (req: Request, res: Response) => {
  try {
    const {
      search,
      komoditas,
      status,
      tab,
      fase,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = req.query;

    const result = await pemeriksaanLahanRepository.findAll({
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      status: status ? String(status) : undefined,
      tab: tab ? String(tab) : 'semua',
      fase: fase ? String(fase) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    const stats = await pemeriksaanLahanRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(result.total / Number(pageSize)),
      },
      stats,
    });
  } catch (error: any) {
    console.error('Error in getPemeriksaanLahanList:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPemeriksaanLahanStats = async (req: Request, res: Response) => {
  try {
    const stats = await pemeriksaanLahanRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in getPemeriksaanLahanStats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getReferensiJadwalTanam = async (req: Request, res: Response) => {
  try {
    const eligibleJadwals = await pemeriksaanLahanRepository.findEligibleJadwalTanam();
    return res.status(200).json({
      status: 'success',
      data: eligibleJadwals,
      total: eligibleJadwals.length,
    });
  } catch (error: any) {
    console.error('Error in getReferensiJadwalTanam:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPemeriksaanLahanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await pemeriksaanLahanRepository.findById(String(id));

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data pemeriksaan lahan tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error in getPemeriksaanLahanById:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createPemeriksaanLahan = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const nextCount = (await (await pemeriksaanLahanRepository.findAll({ pageSize: 1 })).total) + 1;
    const noPemeriksaan = body.noPemeriksaan || `PL-2026-${String(nextCount).padStart(4, '0')}`;

    const created = await pemeriksaanLahanRepository.create({
      noPemeriksaan,
      pemeriksaanKe: Number(body.pemeriksaanKe) || 1,
      jadwalTanamId: body.jadwalTanamId || null,
      kodeJadwalTanam: body.kodeJadwalTanam || 'JT-2026-0000',
      tanggalPemeriksaan: body.tanggalPemeriksaan ? new Date(body.tanggalPemeriksaan) : new Date(),
      komoditas: body.komoditas || 'Komoditas',
      varietas: body.varietas || 'Varietas',
      petani: body.petani || 'Petani Mitra',
      lahan: body.lahan || 'Lahan 01',
      fase: body.fase || 'Vegetatif',
      petugasQc: body.petugasQc || 'Petugas QC',
      persentaseKemurnian: parseFloat(body.persentaseKemurnian) || 100.0,
      status: body.status || 'Memenuhi',
      jumlahTanamanDiamati: Number(body.jumlahTanamanDiamati) || 1000,
      tanamanSesuai: Number(body.tanamanSesuai) || 1000,
      tanamanOffType: Number(body.tanamanOffType) || 0,
      keterangan: body.keterangan || 'Memenuhi standar',
      catatan: body.catatan || '',
      temuanOffType: body.temuanOffType || [],
      dokumentasi: body.dokumentasi || [],
      roguingData: body.roguingData || null,
      riwayatData: body.riwayatData || [],
      dibuatOleh: (req as any).user?.name || 'Admin',
      diubahOleh: (req as any).user?.name || 'Admin',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data pemeriksaan lapangan berhasil dibuat',
      data: created,
    });
  } catch (error: any) {
    console.error('Error in createPemeriksaanLahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updatePemeriksaanLahan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await pemeriksaanLahanRepository.findById(String(id));
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data pemeriksaan lahan tidak ditemukan',
      });
    }

    const updated = await pemeriksaanLahanRepository.update(existing.id, {
      ...body,
      diubahOleh: (req as any).user?.name || 'Admin',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data pemeriksaan lapangan berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error in updatePemeriksaanLahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deletePemeriksaanLahan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await pemeriksaanLahanRepository.findById(String(id));
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data pemeriksaan lahan tidak ditemukan',
      });
    }

    await pemeriksaanLahanRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data pemeriksaan lapangan berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error in deletePemeriksaanLahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
