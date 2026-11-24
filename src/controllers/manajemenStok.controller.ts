import { Request, Response } from 'express';
import { manajemenStokRepository } from '../repositories/manajemenStok.repository';

export const getManajemenStok = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tab = 'benih-bersih',
      gudang,
      lokasi,
      statusQc,
      varietas,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      tab: String(tab) as any,
      search: search ? String(search) : undefined,
      gudang: gudang ? String(gudang) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      statusQc: statusQc ? String(statusQc) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      skip,
      take,
    };

    if (tab === 'benih-bersih') {
      const { data, total } = await manajemenStokRepository.getBenihBersihList(filters);
      const stats = await manajemenStokRepository.getStats();

      return res.status(200).json({
        status: 'success',
        tab,
        data,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)) || 1,
        },
        stats,
      });
    } else {
      const { data, total } = manajemenStokRepository.getOtherTabList(String(tab), filters);
      return res.status(200).json({
        status: 'success',
        tab,
        data,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)) || 1,
        },
      });
    }
  } catch (error: any) {
    console.error('Error in getManajemenStok:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getManajemenStokStats = async (_req: Request, res: Response) => {
  try {
    const stats = await manajemenStokRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in getManajemenStokStats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getManajemenStokById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const item = await manajemenStokRepository.findByIdOrLot(id);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lot stok tidak ditemukan',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error in getManajemenStokById:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getKartuStok = async (req: Request, res: Response) => {
  try {
    const lot = String(req.params.lot || '');
    const history = await manajemenStokRepository.getKartuStokByLot(lot);
    return res.status(200).json({
      status: 'success',
      lot,
      data: history,
    });
  } catch (error: any) {
    console.error('Error in getKartuStok:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
