import { Request, Response } from 'express';
import { persetujuanProduksiRepository } from '../repositories/persetujuanProduksi.repository';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPersetujuanProduksiList = async (req: Request, res: Response) => {
  try {
    const {
      search,
      jenis,
      pengaju,
      status,
      startDate,
      endDate,
      page,
      pageSize,
    } = req.query;

    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string, 10) : 10;

    const result = await persetujuanProduksiRepository.findAll({
      search: search as string,
      jenis: jenis as string,
      pengaju: pengaju as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: isNaN(parsedPage) ? 1 : parsedPage,
      pageSize: isNaN(parsedPageSize) ? 10 : parsedPageSize,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data Persetujuan Produksi berhasil diambil',
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching Persetujuan Produksi list:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPersetujuanProduksiStats = async (req: Request, res: Response) => {
  try {
    const stats = await persetujuanProduksiRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching Persetujuan Produksi stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPersetujuanProduksiById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const item = await persetujuanProduksiRepository.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengajuan Persetujuan Produksi tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Persetujuan Produksi detail:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const approvePersetujuanProduksi = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const { catatan } = req.body || {};
    const reviewerName = req.user?.username || 'Manager Produksi';

    const updated = await persetujuanProduksiRepository.approve(id, reviewerName, catatan);

    return res.status(200).json({
      status: 'success',
      message: `Pengajuan ${updated.noPengajuan} berhasil disetujui`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error approving Persetujuan Produksi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const rejectPersetujuanProduksi = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const { alasan } = req.body || {};

    if (!alasan || !alasan.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Alasan penolakan wajib diisi',
      });
    }

    const reviewerName = req.user?.username || 'Manager Produksi';
    const updated = await persetujuanProduksiRepository.reject(id, reviewerName, alasan.trim());

    return res.status(200).json({
      status: 'success',
      message: `Pengajuan ${updated.noPengajuan} telah ditolak`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error rejecting Persetujuan Produksi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
