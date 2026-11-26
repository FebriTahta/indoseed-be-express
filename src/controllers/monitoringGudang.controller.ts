import { Request, Response } from 'express';
import { monitoringGudangRepository } from '../repositories/monitoringGudang.repository';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMonitoringList = async (req: Request, res: Response) => {
  try {
    // Seed initial data if table is empty
    await monitoringGudangRepository.seedInitialDataIfEmpty();

    const {
      search,
      gudangId,
      namaGudang,
      zona,
      status,
      sumberData,
      dateRange,
      page = '1',
      pageSize = '10',
    } = req.query;

    const result = await monitoringGudangRepository.findAll({
      search: search as string,
      gudangId: gudangId as string,
      namaGudang: namaGudang as string,
      zona: zona as string,
      status: status as string,
      sumberData: sumberData as string,
      dateRange: dateRange as string,
      page: parseInt(page as string, 10) || 1,
      pageSize: parseInt(pageSize as string, 10) || 10,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data monitoring kondisi gudang berhasil diambil',
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching monitoring kondisi gudang:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data monitoring gudang',
    });
  }
};

export const getMonitoringStats = async (req: Request, res: Response) => {
  try {
    await monitoringGudangRepository.seedInitialDataIfEmpty();
    const stats = await monitoringGudangRepository.getStats();

    return res.status(200).json({
      status: 'success',
      message: 'Statistik monitoring gudang berhasil diambil',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching monitoring stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil statistik monitoring gudang',
    });
  }
};

export const getMonitoringTren = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    const tren = await monitoringGudangRepository.getTrenChart(days);

    return res.status(200).json({
      status: 'success',
      message: 'Data tren monitoring berhasil diambil',
      data: tren,
    });
  } catch (error: any) {
    console.error('Error fetching monitoring tren:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data tren monitoring',
    });
  }
};

export const getMonitoringAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await monitoringGudangRepository.getAlerts();

    return res.status(200).json({
      status: 'success',
      message: 'Data peringatan kondisi gudang berhasil diambil',
      data: alerts,
    });
  } catch (error: any) {
    console.error('Error fetching monitoring alerts:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil data peringatan monitoring',
    });
  }
};

export const getMonitoringById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await monitoringGudangRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: `Data monitoring dengan ID ${id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail monitoring gudang berhasil diambil',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching monitoring detail:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil detail monitoring gudang',
    });
  }
};

export const createMonitoringPengukuran = async (req: AuthRequest, res: Response) => {
  try {
    const {
      gudangId,
      namaGudang,
      zona,
      sensor,
      suhu,
      rh,
      suhuMin,
      suhuMax,
      rhMin,
      rhMax,
      waktuPengukuran,
      sumberData = 'Manual',
      status,
      catatan,
      petugas,
    } = req.body;

    if (!gudangId && !namaGudang) {
      return res.status(400).json({
        status: 'error',
        message: 'Gudang wajib dipilih dari Master Gudang',
      });
    }

    if (!zona) {
      return res.status(400).json({
        status: 'error',
        message: 'Zona wajib diisi',
      });
    }

    const createdBy = req.user?.username || petugas || 'Admin Gudang';

    const newItem = await monitoringGudangRepository.create({
      gudangId,
      namaGudang,
      zona,
      sensor,
      suhu,
      rh,
      suhuMin,
      suhuMax,
      rhMin,
      rhMax,
      waktuPengukuran,
      sumberData,
      status,
      catatan,
      petugas: petugas || createdBy,
      dibuatOleh: createdBy,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Pengukuran kondisi gudang berhasil disimpan',
      data: newItem,
    });
  } catch (error: any) {
    console.error('Error creating monitoring measurement:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menyimpan pengukuran monitoring gudang',
    });
  }
};

export const updateMonitoringPengukuran = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const updatedBy = req.user?.username || 'Admin Gudang';

    const updated = await monitoringGudangRepository.update(id, {
      ...req.body,
      diubahOleh: updatedBy,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data pengukuran monitoring berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating monitoring measurement:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui pengukuran monitoring',
    });
  }
};

export const deleteMonitoringPengukuran = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await monitoringGudangRepository.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Data pengukuran monitoring berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting monitoring measurement:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menghapus data pengukuran monitoring',
    });
  }
};

export const getMasterGudangOptions = async (req: Request, res: Response) => {
  try {
    const gudangs = await prisma.gudang.findMany({
      orderBy: { namaGudang: 'asc' },
      select: {
        id: true,
        kodeGudang: true,
        namaGudang: true,
        kategori: true,
        status: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Opsi Master Gudang berhasil diambil',
      data: gudangs,
    });
  } catch (error: any) {
    console.error('Error fetching gudang options:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal mengambil opsi gudang',
    });
  }
};
