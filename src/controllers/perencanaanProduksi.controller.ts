import { Request, Response } from 'express';
import { perencanaanProduksiRepository } from '../repositories/perencanaanProduksi.repository';

export const getPerencanaanProduksiList = async (req: Request, res: Response) => {
  try {
    const {
      search,
      periode,
      status,
      komoditas,
      varietas,
      namaPetani,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await perencanaanProduksiRepository.findAll({
      search: search as string,
      periode: periode as string,
      status: status as string,
      komoditas: komoditas as string,
      varietas: varietas as string,
      namaPetani: namaPetani as string,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Perencanaan Produksi list:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getPerencanaanProduksis = getPerencanaanProduksiList;

export const getPerencanaanProduksiById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await perencanaanProduksiRepository.findById(id as string);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Data Perencanaan Produksi tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching Perencanaan Produksi detail:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getPerencanaanProduksiStats = async (req: Request, res: Response) => {
  try {
    const stats = await perencanaanProduksiRepository.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching Perencanaan Produksi stats:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getPerencanaanStats = getPerencanaanProduksiStats;

export const createPerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    const created = await perencanaanProduksiRepository.create(req.body);
    return res.status(201).json({
      success: true,
      data: created,
      message: 'Perencanaan Produksi berhasil dibuat',
    });
  } catch (error: any) {
    console.error('Error creating Perencanaan Produksi:', error);
    return res.status(400).json({ success: false, message: error.message || 'Gagal membuat Perencanaan Produksi' });
  }
};

export const updatePerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await perencanaanProduksiRepository.update(id as string, req.body);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Perencanaan Produksi berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Error updating Perencanaan Produksi:', error);
    return res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui Perencanaan Produksi' });
  }
};

export const deletePerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await perencanaanProduksiRepository.delete(id as string);
    return res.status(200).json({
      success: true,
      message: 'Perencanaan Produksi berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Perencanaan Produksi:', error);
    return res.status(400).json({ success: false, message: error.message || 'Gagal menghapus Perencanaan Produksi' });
  }
};
