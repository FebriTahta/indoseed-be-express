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
      limit = 10
    } = req.query;

    const result = await perencanaanProduksiRepository.findAll({
      search: search as string,
      periode: periode as string,
      status: status as string,
      komoditas: komoditas as string,
      varietas: varietas as string,
      namaPetani: namaPetani as string,
      page: Number(page),
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    console.error('Error fetching perencanaan produksi:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getPerencanaanProduksiStats = async (req: Request, res: Response) => {
  try {
    const stats = await perencanaanProduksiRepository.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getPerencanaanProduksiById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await perencanaanProduksiRepository.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Data rencana produksi tidak ditemukan' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error fetching perencanaan detail:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createPerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.noPerencanaan) {
      // Auto-generate number if not provided
      const count = await perencanaanProduksiRepository.findAll({ limit: 1 });
      const nextNum = (count.total + 1).toString().padStart(3, '0');
      data.noPerencanaan = `PP-2026-${nextNum}`;
    }

    const created = await perencanaanProduksiRepository.create(data);
    res.status(201).json({ success: true, data: created, message: 'Rencana produksi berhasil dibuat' });
  } catch (error: any) {
    console.error('Error creating perencanaan produksi:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal membuat rencana produksi' });
  }
};

export const updatePerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await perencanaanProduksiRepository.update(id, data);
    res.json({ success: true, data: updated, message: 'Rencana produksi berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating perencanaan produksi:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui rencana produksi' });
  }
};

export const deletePerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await perencanaanProduksiRepository.delete(id);
    res.json({ success: true, message: 'Rencana produksi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting perencanaan produksi:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal menghapus rencana produksi' });
  }
};
