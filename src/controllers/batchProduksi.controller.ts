import { Request, Response } from 'express';
import { batchProduksiRepository } from '../repositories/batchProduksi.repository';

export const getBatchProduksis = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      sumberBahan,
      status,
      lokasi,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      sumberBahan: sumberBahan ? String(sumberBahan) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      skip,
      take,
    };

    // Auto seed if empty
    const totalCount = await batchProduksiRepository.countAll();
    if (totalCount === 0) {
      await seedInitialBatchProduksi();
    }

    const { data, total } = await batchProduksiRepository.findAll(filters);
    const stats = await batchProduksiRepository.getStats();

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
    console.error('Error fetching Batch Produksi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getBatchProduksiById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let item = await batchProduksiRepository.findById(id);
    if (!item) {
      item = await batchProduksiRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data batch produksi tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Batch Produksi by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createBatchProduksi = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await batchProduksiRepository.countAll();
    const nextNo = totalCount + 1;
    const kodeBatch = body.kodeBatch || `BP-2606-${String(nextNo).padStart(4, '0')}`;

    const targetKg = parseFloat(String(body.targetKg || '10000')) || 10000;
    const hasilKg = body.hasilKg ? parseFloat(String(body.hasilKg)) : 0;
    const yieldPercent = targetKg > 0 && hasilKg > 0 ? parseFloat(((hasilKg / targetKg) * 100).toFixed(2)) : 0;

    const newRecord = await batchProduksiRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      sumberBahan: body.sumberBahan || `PN-2605-01${String(nextNo + 40).padStart(2, '0')}`,
      tanggalMulai: body.tanggalMulai || '01/06/2026',
      tanggalSelesai: body.tanggalSelesai || '07/06/2026',
      targetKg,
      hasilKg,
      yieldPercent,
      status: body.status || 'Proses',
      lokasi: body.lokasi || 'Blok A',
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data batch produksi berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Batch Produksi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateBatchProduksi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await batchProduksiRepository.findById(id);
    if (!existing) {
      existing = await batchProduksiRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data batch produksi tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.sumberBahan) updatePayload.sumberBahan = body.sumberBahan;
    if (body.tanggalMulai) updatePayload.tanggalMulai = body.tanggalMulai;
    if (body.tanggalSelesai) updatePayload.tanggalSelesai = body.tanggalSelesai;
    if (body.targetKg !== undefined) updatePayload.targetKg = parseFloat(String(body.targetKg)) || 0;
    if (body.hasilKg !== undefined) updatePayload.hasilKg = parseFloat(String(body.hasilKg)) || 0;

    const tKg = updatePayload.targetKg !== undefined ? updatePayload.targetKg : existing.targetKg;
    const hKg = updatePayload.hasilKg !== undefined ? updatePayload.hasilKg : existing.hasilKg;
    if (tKg > 0 && hKg > 0) {
      updatePayload.yieldPercent = parseFloat(((hKg / tKg) * 100).toFixed(2));
    }

    if (body.status) updatePayload.status = body.status;
    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await batchProduksiRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data batch produksi berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Batch Produksi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteBatchProduksi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await batchProduksiRepository.findById(id);
    if (!existing) {
      existing = await batchProduksiRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data batch produksi tidak ditemukan',
      });
    }

    await batchProduksiRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data batch produksi berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Batch Produksi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialBatchProduksi = async () => {
  const initialData = [
    { no: 1, kodeBatch: 'BP-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', sumberBahan: 'PN-2605-0150', tanggalMulai: '01/06/2026', tanggalSelesai: '07/06/2026', targetKg: 10000, hasilKg: 8750, yieldPercent: 87.50, status: 'Selesai' },
    { no: 2, kodeBatch: 'BP-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', sumberBahan: 'PN-2605-0145', tanggalMulai: '02/06/2026', tanggalSelesai: '08/06/2026', targetKg: 8000, hasilKg: 6920, yieldPercent: 86.50, status: 'Selesai' },
    { no: 3, kodeBatch: 'BP-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', sumberBahan: 'PN-2605-0148', tanggalMulai: '03/06/2026', tanggalSelesai: '09/06/2026', targetKg: 6000, hasilKg: 5050, yieldPercent: 84.17, status: 'Selesai' },
    { no: 4, kodeBatch: 'BP-2606-0004', komoditas: 'Padi', varietas: 'Inpari 42', sumberBahan: 'PN-2605-0151', tanggalMulai: '04/06/2026', tanggalSelesai: '10/06/2026', targetKg: 9200, hasilKg: 7960, yieldPercent: 86.52, status: 'Selesai' },
    { no: 5, kodeBatch: 'BP-2606-0005', komoditas: 'Jagung', varietas: 'Bisi 18', sumberBahan: 'PN-2605-0146', tanggalMulai: '05/06/2026', tanggalSelesai: '11/06/2026', targetKg: 7500, hasilKg: 6180, yieldPercent: 82.40, status: 'Selesai' },
    { no: 6, kodeBatch: 'BP-2606-0006', komoditas: 'Kedelai', varietas: 'Dega 1', sumberBahan: 'PN-2605-0149', tanggalMulai: '06/06/2026', tanggalSelesai: '12/06/2026', targetKg: 5000, hasilKg: 4150, yieldPercent: 83.00, status: 'Selesai' },
    { no: 7, kodeBatch: 'BP-2606-0007', komoditas: 'Padi', varietas: 'Ciherang', sumberBahan: 'PN-2605-0152', tanggalMulai: '07/06/2026', tanggalSelesai: '13/06/2026', targetKg: 11000, hasilKg: 9100, yieldPercent: 82.73, status: 'Proses' },
    { no: 8, kodeBatch: 'BP-2606-0008', komoditas: 'Jagung', varietas: 'Pioneer 21', sumberBahan: 'PN-2605-0153', tanggalMulai: '08/06/2026', tanggalSelesai: '14/06/2026', targetKg: 7800, hasilKg: 0, yieldPercent: 0, status: 'Proses' },
    { no: 9, kodeBatch: 'BP-2606-0009', komoditas: 'Padi', varietas: 'Inpari 32', sumberBahan: 'PN-2605-0154', tanggalMulai: '09/06/2026', tanggalSelesai: '15/06/2026', targetKg: 10000, hasilKg: 0, yieldPercent: 0, status: 'Proses' },
    { no: 10, kodeBatch: 'BP-2606-0010', komoditas: 'Kedelai', varietas: 'Anjasmoro', sumberBahan: 'PN-2605-0155', tanggalMulai: '10/06/2026', tanggalSelesai: '16/06/2026', targetKg: 6500, hasilKg: 0, yieldPercent: 0, status: 'Proses' },
    { no: 11, kodeBatch: 'BP-2606-0011', komoditas: 'Padi', varietas: 'Inpari 42', sumberBahan: 'PN-2605-0156', tanggalMulai: '02/06/2026', tanggalSelesai: '06/06/2026', targetKg: 8000, hasilKg: 6200, yieldPercent: 77.50, status: 'Reject' },
    { no: 12, kodeBatch: 'BP-2606-0012', komoditas: 'Jagung', varietas: 'Bisi 18', sumberBahan: 'PN-2605-0157', tanggalMulai: '03/06/2026', tanggalSelesai: '07/06/2026', targetKg: 6000, hasilKg: 4500, yieldPercent: 75.00, status: 'Reject' },
  ];

  for (const item of initialData) {
    await batchProduksiRepository.create(item);
  }
};
