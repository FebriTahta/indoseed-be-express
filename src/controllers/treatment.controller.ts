import { Request, Response } from 'express';
import { treatmentRepository } from '../repositories/treatment.repository';

export const getTreatments = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      jenisTreatment,
      status,
      lokasi,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      jenisTreatment: jenisTreatment ? String(jenisTreatment) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      skip,
      take,
    };

    // Auto seed if empty
    const totalCount = await treatmentRepository.countAll();
    if (totalCount === 0) {
      await seedInitialTreatment();
    }

    const { data, total } = await treatmentRepository.findAll(filters);
    const stats = await treatmentRepository.getStats();

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
    console.error('Error fetching Treatment:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getTreatmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let item = await treatmentRepository.findById(id);
    if (!item) {
      item = await treatmentRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data treatment tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Treatment by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await treatmentRepository.countAll();
    const nextNo = totalCount + 1;
    const kodeBatch = body.kodeBatch || `TR-2606-${String(nextNo).padStart(4, '0')}`;

    const beratAwal = parseFloat(String(body.beratAwal || '9120')) || 9120;
    const beratAkhir = parseFloat(String(body.beratAkhir || '9050')) || 9050;
    const loss = beratAwal > 0 ? parseFloat((((beratAwal - beratAkhir) / beratAwal) * 100).toFixed(2)) : 0;

    const newRecord = await treatmentRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      treatment: body.treatment || 'Fungisida + Insektisida',
      dosis: body.dosis || '2.5 ml/kg',
      operator: body.operator || 'Slamet Riyadi',
      beratAwal,
      beratAkhir,
      loss,
      tanggalSelesai: body.tanggalSelesai || '11/06/2026',
      status: body.status || 'Selesai',
      lokasi: body.lokasi || 'Ruang Treatment 1',
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data treatment berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Treatment:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await treatmentRepository.findById(id);
    if (!existing) {
      existing = await treatmentRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data treatment tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.treatment) updatePayload.treatment = body.treatment;
    if (body.dosis) updatePayload.dosis = body.dosis;
    if (body.operator) updatePayload.operator = body.operator;
    if (body.beratAwal !== undefined) updatePayload.beratAwal = parseFloat(String(body.beratAwal)) || 0;
    if (body.beratAkhir !== undefined) updatePayload.beratAkhir = parseFloat(String(body.beratAkhir)) || 0;

    const bAwal = updatePayload.beratAwal !== undefined ? updatePayload.beratAwal : existing.beratAwal;
    const bAkhir = updatePayload.beratAkhir !== undefined ? updatePayload.beratAkhir : existing.beratAkhir;
    if (bAwal > 0 && bAkhir > 0) {
      updatePayload.loss = parseFloat((((bAwal - bAkhir) / bAwal) * 100).toFixed(2));
    }

    if (body.tanggalSelesai) updatePayload.tanggalSelesai = body.tanggalSelesai;
    if (body.status) updatePayload.status = body.status;
    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await treatmentRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data treatment berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Treatment:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await treatmentRepository.findById(id);
    if (!existing) {
      existing = await treatmentRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data treatment tidak ditemukan',
      });
    }

    await treatmentRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data treatment berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Treatment:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialTreatment = async () => {
  const initialData = [
    { no: 1, kodeBatch: 'TR-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', treatment: 'Fungisida + Insektisida', dosis: '2.5 ml/kg', operator: 'Slamet Riyadi', beratAwal: 9120, beratAkhir: 9050, loss: 0.77, tanggalSelesai: '11/06/2026', status: 'Selesai' },
    { no: 2, kodeBatch: 'TR-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', treatment: 'Fungisida Systemic', dosis: '3.0 ml/kg', operator: 'Rina Agustina', beratAwal: 7250, beratAkhir: 7190, loss: 0.83, tanggalSelesai: '11/06/2026', status: 'Selesai' },
    { no: 3, kodeBatch: 'TR-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', treatment: 'Inokulan Rhizobium', dosis: '5.0 gram/kg', operator: 'Budi Santoso', beratAwal: 4720, beratAkhir: 4680, loss: 0.85, tanggalSelesai: '10/06/2026', status: 'Selesai' },
    { no: 4, kodeBatch: 'TR-2606-0004', komoditas: 'Padi', varietas: 'Inpari 42', treatment: 'Fungisida + ZPT', dosis: '2.0 ml/kg', operator: 'Slamet Riyadi', beratAwal: 7550, beratAkhir: 7490, loss: 0.79, tanggalSelesai: '10/06/2026', status: 'Selesai' },
    { no: 5, kodeBatch: 'TR-2606-0005', komoditas: 'Jagung', varietas: 'Bisi 18', treatment: 'Insektisida Kontak', dosis: '3.5 ml/kg', operator: 'Ahmad Dahlan', beratAwal: 5820, beratAkhir: 5770, loss: 0.86, tanggalSelesai: '09/06/2026', status: 'Selesai' },
  ];

  for (const item of initialData) {
    await treatmentRepository.create(item);
  }
};
