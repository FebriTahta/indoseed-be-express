import { Request, Response } from 'express';
import { stokBenihRepository } from '../repositories/stokBenih.repository';

export const getStokBenihs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      gudang,
      kategoriBenih,
      produkBenih,
      status,
      tab,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      gudang: gudang ? String(gudang) : undefined,
      kategoriBenih: kategoriBenih ? String(kategoriBenih) : undefined,
      produkBenih: produkBenih ? String(produkBenih) : undefined,
      status: status ? String(status) : undefined,
      tab: tab ? String(tab) : undefined,
      skip,
      take,
    };

    // Auto-clear dummy data if present
    const hasDummy = await stokBenihRepository.findByBatchLot('LOT-2602-001');
    if (hasDummy) {
      await stokBenihRepository.deleteAll();
    }

    const { data, total } = await stokBenihRepository.findAll(filters);
    const stats = await stokBenihRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching Stok Benih:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getStokBenihById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let item = await stokBenihRepository.findById(id);
    if (!item) {
      item = await stokBenihRepository.findByBatchLot(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data stok benih tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Stok Benih by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createStokBenih = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await stokBenihRepository.countAll();
    const nextNo = totalCount + 1;
    const batchLot = body.batchLot || `LOT-2606-${String(nextNo).padStart(3, '0')}`;

    const stokKg = parseFloat(String(body.stokKg || '500')) || 500;
    const reservedKg = parseFloat(String(body.reservedKg || '0')) || 0;
    const availableKg = Math.max(0, stokKg - reservedKg);
    const dayaTumbuh = parseFloat(String(body.dayaTumbuh || '92')) || 92;

    const newRecord = await stokBenihRepository.create({
      no: nextNo,
      produkBenih: body.produkBenih || 'Padi Inpari 32',
      kategoriBenih: body.kategoriBenih || 'Benih Utama',
      batchLot,
      tanggalProduksi: body.tanggalProduksi || '25/05/2026',
      expired: body.expired || '25/05/2027',
      gudang: body.gudang || 'Gudang A',
      stokKg,
      reservedKg,
      availableKg,
      dayaTumbuh,
      status: body.status || 'Aman',
      keterangan: body.keterangan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data stok benih berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Stok Benih:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateStokBenih = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await stokBenihRepository.findById(id);
    if (!existing) {
      existing = await stokBenihRepository.findByBatchLot(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data stok benih tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.produkBenih) updatePayload.produkBenih = body.produkBenih;
    if (body.kategoriBenih) updatePayload.kategoriBenih = body.kategoriBenih;
    if (body.batchLot) updatePayload.batchLot = body.batchLot;
    if (body.tanggalProduksi) updatePayload.tanggalProduksi = body.tanggalProduksi;
    if (body.expired) updatePayload.expired = body.expired;
    if (body.gudang) updatePayload.gudang = body.gudang;
    if (body.stokKg !== undefined) updatePayload.stokKg = parseFloat(String(body.stokKg)) || 0;
    if (body.reservedKg !== undefined) updatePayload.reservedKg = parseFloat(String(body.reservedKg)) || 0;

    const sKg = updatePayload.stokKg !== undefined ? updatePayload.stokKg : existing.stokKg;
    const rKg = updatePayload.reservedKg !== undefined ? updatePayload.reservedKg : existing.reservedKg;
    updatePayload.availableKg = Math.max(0, sKg - rKg);

    if (body.dayaTumbuh !== undefined) updatePayload.dayaTumbuh = parseFloat(String(body.dayaTumbuh)) || 0;
    if (body.status) updatePayload.status = body.status;
    if (body.keterangan !== undefined) updatePayload.keterangan = body.keterangan;

    const updated = await stokBenihRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data stok benih berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Stok Benih:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteStokBenih = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await stokBenihRepository.findById(id);
    if (!existing) {
      existing = await stokBenihRepository.findByBatchLot(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data stok benih tidak ditemukan',
      });
    }

    await stokBenihRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data stok benih berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Stok Benih:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const clearAllStokBenih = async (req: Request, res: Response) => {
  try {
    await stokBenihRepository.deleteAll();
    return res.status(200).json({
      status: 'success',
      message: 'Semua data stok benih berhasil dikosongkan',
    });
  } catch (error: any) {
    console.error('Error clearing Stok Benih:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialStokBenih = async () => {
  const initialData = [
    { no: 1, produkBenih: 'Padi Inpari 32', batchLot: 'LOT-2602-001', tanggalProduksi: '25/05/2026', expired: '25/05/2027', gudang: 'Gudang A', stokKg: 500, reservedKg: 150, availableKg: 350, dayaTumbuh: 92, status: 'Aman' },
    { no: 2, produkBenih: 'Jagung Pioneer 21', batchLot: 'LOT-2604-010', tanggalProduksi: '20/07/2026', expired: '20/07/2027', gudang: 'Gudang A', stokKg: 300, reservedKg: 100, availableKg: 200, dayaTumbuh: 90, status: 'Aman' },
    { no: 3, produkBenih: 'Kedelai Anjasmoro', batchLot: 'LOT-2603-020', tanggalProduksi: '28/08/2026', expired: '28/08/2027', gudang: 'Gudang B', stokKg: 200, reservedKg: 50, availableKg: 150, dayaTumbuh: 93, status: 'Aman' },
    { no: 4, produkBenih: 'Padi Inpari 32', batchLot: 'LOT-2602-002', tanggalProduksi: '10/06/2026', expired: '10/06/2026', gudang: 'Gudang B', stokKg: 250, reservedKg: 80, availableKg: 170, dayaTumbuh: 89, status: 'Exp < 30 Hari' },
    { no: 5, produkBenih: 'Padi Inpari 32', batchLot: 'LOT-2601-015', tanggalProduksi: '15/05/2026', expired: '15/05/2026', gudang: 'Gudang C', stokKg: 100, reservedKg: 20, availableKg: 80, dayaTumbuh: 88, status: 'Exp < 30 Hari' },
    { no: 6, produkBenih: 'Jagung Pioneer 21', batchLot: 'LOT-2504-008', tanggalProduksi: '10/12/2025', expired: '10/12/2026', gudang: 'Gudang A', stokKg: 150, reservedKg: 60, availableKg: 90, dayaTumbuh: 91, status: 'Aman' },
    { no: 7, produkBenih: 'Kedelai Anjasmoro', batchLot: 'LOT-2505-012', tanggalProduksi: '05/01/2026', expired: '05/01/2026', gudang: 'Gudang B', stokKg: 80, reservedKg: 0, availableKg: 80, dayaTumbuh: 87, status: 'Expired' },
    { no: 8, produkBenih: 'Padi Inpari 32', batchLot: 'LOT-2503-005', tanggalProduksi: '18/11/2025', expired: '18/11/2026', gudang: 'Gudang C', stokKg: 120, reservedKg: 30, availableKg: 90, dayaTumbuh: 92, status: 'Aman' },
    { no: 9, produkBenih: 'Jagung Pioneer 21', batchLot: 'LOT-2502-009', tanggalProduksi: '22/10/2025', expired: '22/10/2026', gudang: 'Gudang A', stokKg: 70, reservedKg: 0, availableKg: 70, dayaTumbuh: 90, status: 'Aman' },
    { no: 10, produkBenih: 'Kedelai Anjasmoro', batchLot: 'LOT-2501-011', tanggalProduksi: '25/09/2025', expired: '25/09/2026', gudang: 'Gudang B', stokKg: 76, reservedKg: 12, availableKg: 64, dayaTumbuh: 91, status: 'Aman' },
    { no: 11, produkBenih: 'Padi Ciherang', batchLot: 'LOT-2601-018', tanggalProduksi: '05/04/2026', expired: '05/04/2027', gudang: 'Gudang C', stokKg: 280, reservedKg: 30, availableKg: 250, dayaTumbuh: 94, status: 'Aman' },
    { no: 12, produkBenih: 'Jagung Bisi 18', batchLot: 'LOT-2602-019', tanggalProduksi: '12/04/2026', expired: '12/04/2027', gudang: 'Gudang A', stokKg: 150, reservedKg: 20, availableKg: 130, dayaTumbuh: 92, status: 'Aman' },
    { no: 13, produkBenih: 'Kedelai Dega 1', batchLot: 'LOT-2603-021', tanggalProduksi: '18/04/2026', expired: '18/04/2027', gudang: 'Gudang B', stokKg: 80, reservedKg: 10, availableKg: 70, dayaTumbuh: 89, status: 'Aman' },
    { no: 14, produkBenih: 'Padi Inpari 42', batchLot: 'LOT-2604-022', tanggalProduksi: '22/04/2026', expired: '22/04/2027', gudang: 'Gudang A', stokKg: 50, reservedKg: 0, availableKg: 50, dayaTumbuh: 91, status: 'Aman' },
    { no: 15, produkBenih: 'Padi Inpari 32', batchLot: 'LOT-2501-002', tanggalProduksi: '01/01/2026', expired: '01/06/2026', gudang: 'Gudang C', stokKg: 48, reservedKg: 0, availableKg: 48, dayaTumbuh: 85, status: 'Exp < 30 Hari' },
    { no: 16, produkBenih: 'Jagung Pioneer 21', batchLot: 'LOT-2501-003', tanggalProduksi: '15/01/2026', expired: '15/05/2026', gudang: 'Gudang A', stokKg: 30, reservedKg: 0, availableKg: 30, dayaTumbuh: 86, status: 'Expired' },
    { no: 17, produkBenih: 'Kedelai Anjasmoro', batchLot: 'LOT-2501-004', tanggalProduksi: '20/01/2026', expired: '20/05/2026', gudang: 'Gudang B', stokKg: 22, reservedKg: 0, availableKg: 22, dayaTumbuh: 84, status: 'Expired' },
    { no: 18, produkBenih: 'Padi Ciherang', batchLot: 'LOT-2501-005', tanggalProduksi: '25/01/2026', expired: '25/05/2026', gudang: 'Gudang C', stokKg: 20, reservedKg: 0, availableKg: 20, dayaTumbuh: 83, status: 'Expired' },
  ];

  for (const item of initialData) {
    await stokBenihRepository.create(item);
  }
};
