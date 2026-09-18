import { Request, Response } from 'express';
import { kontrakPanenRepository } from '../repositories/kontrakPanen.repository';

export const getKontrakPanenList = async (req: Request, res: Response) => {
  try {
    const {
      search,
      komoditas,
      varietas,
      tipePanenan,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await kontrakPanenRepository.findAll({
      search: search as string,
      komoditas: komoditas as string,
      varietas: varietas as string,
      tipePanenan: tipePanenan as string,
      status: status as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
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
    console.error('Error fetching kontrak panen list:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getKontrakPanenStats = async (req: Request, res: Response) => {
  try {
    const stats = await kontrakPanenRepository.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching kontrak panen stats:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getNextKontrakNumber = async (req: Request, res: Response) => {
  try {
    const nextNo = await kontrakPanenRepository.getNextNoKontrak();
    res.json({
      success: true,
      data: { nextNoKontrak: nextNo },
    });
  } catch (error: any) {
    console.error('Error generating next no kontrak:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getKontrakPanenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await kontrakPanenRepository.findById(id as string);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Data Kontrak Panen tidak ditemukan' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error fetching kontrak panen detail:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createKontrakPanen = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const created = await kontrakPanenRepository.create(data);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Kontrak Panen berhasil ditambahkan',
    });
  } catch (error: any) {
    console.error('Error creating kontrak panen:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal menambahkan kontrak panen' });
  }
};

export const updateKontrakPanen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await kontrakPanenRepository.update(id as string, data);
    res.json({
      success: true,
      data: updated,
      message: 'Kontrak Panen berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Error updating kontrak panen:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui kontrak panen' });
  }
};

export const deleteKontrakPanen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await kontrakPanenRepository.delete(id as string);
    res.json({
      success: true,
      message: 'Kontrak Panen berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting kontrak panen:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal menghapus kontrak panen' });
  }
};

export const getHarvestTypesForKontrak = async (req: Request, res: Response) => {
  try {
    const { varietyId } = req.query;
    const items = await kontrakPanenRepository.getHarvestTypesByVariety(varietyId as string);
    res.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    console.error('Error fetching harvest types for kontrak:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

