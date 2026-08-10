import { Request, Response } from 'express';
import { sortasiRepository } from '../repositories/sortasi.repository';

export const getSortasis = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      alatSortasi,
      status,
      lokasi,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      alatSortasi: alatSortasi ? String(alatSortasi) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      skip,
      take,
    };

    // Auto seed if empty
    const totalCount = await sortasiRepository.countAll();
    if (totalCount === 0) {
      await seedInitialSortasi();
    }

    const { data, total } = await sortasiRepository.findAll(filters);
    const stats = await sortasiRepository.getStats();

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
    console.error('Error fetching Sortasi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getSortasiById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let item = await sortasiRepository.findById(id);
    if (!item) {
      item = await sortasiRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data sortasi tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Sortasi by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createSortasi = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await sortasiRepository.countAll();
    const nextNo = totalCount + 1;
    const kodeBatch = body.kodeBatch || `SR-2606-${String(nextNo).padStart(4, '0')}`;

    const beratMasuk = parseFloat(String(body.beratMasuk || '10000')) || 10000;
    const hasilLulus = parseFloat(String(body.hasilLulus || '9450')) || 9450;
    const hasilTolak = parseFloat(String(body.hasilTolak || '550')) || (beratMasuk - hasilLulus);
    const recovery = beratMasuk > 0 ? parseFloat(((hasilLulus / beratMasuk) * 100).toFixed(2)) : 0;

    const newRecord = await sortasiRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      alatSortasi: body.alatSortasi || 'Air Screen Cleaner 01',
      beratMasuk,
      hasilLulus,
      hasilTolak,
      recovery,
      tanggalSortasi: body.tanggalSortasi || '11/06/2026',
      status: body.status || 'Selesai',
      lokasi: body.lokasi || 'Gudang Sortasi 1',
      operator: body.operator || 'Admin',
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data sortasi berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Sortasi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateSortasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await sortasiRepository.findById(id);
    if (!existing) {
      existing = await sortasiRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data sortasi tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.alatSortasi) updatePayload.alatSortasi = body.alatSortasi;
    if (body.beratMasuk !== undefined) updatePayload.beratMasuk = parseFloat(String(body.beratMasuk)) || 0;
    if (body.hasilLulus !== undefined) updatePayload.hasilLulus = parseFloat(String(body.hasilLulus)) || 0;
    if (body.hasilTolak !== undefined) updatePayload.hasilTolak = parseFloat(String(body.hasilTolak)) || 0;

    const bMasuk = updatePayload.beratMasuk !== undefined ? updatePayload.beratMasuk : existing.beratMasuk;
    const hLulus = updatePayload.hasilLulus !== undefined ? updatePayload.hasilLulus : existing.hasilLulus;
    if (bMasuk > 0 && hLulus > 0) {
      updatePayload.recovery = parseFloat(((hLulus / bMasuk) * 100).toFixed(2));
    }

    if (body.tanggalSortasi) updatePayload.tanggalSortasi = body.tanggalSortasi;
    if (body.status) updatePayload.status = body.status;
    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.operator) updatePayload.operator = body.operator;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await sortasiRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data sortasi berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Sortasi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteSortasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await sortasiRepository.findById(id);
    if (!existing) {
      existing = await sortasiRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data sortasi tidak ditemukan',
      });
    }

    await sortasiRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data sortasi berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Sortasi:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialSortasi = async () => {
  const initialData = [
    { no: 1, kodeBatch: 'SR-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', alatSortasi: 'Air Screen Cleaner 01', beratMasuk: 9650, hasilLulus: 9120, hasilTolak: 530, recovery: 94.51, tanggalSortasi: '11/06/2026', status: 'Selesai' },
    { no: 2, kodeBatch: 'SR-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', alatSortasi: 'Gravity Separator 02', beratMasuk: 7720, hasilLulus: 7250, hasilTolak: 470, recovery: 93.91, tanggalSortasi: '11/06/2026', status: 'Selesai' },
    { no: 3, kodeBatch: 'SR-2606-0003', komoditas: 'Kedelai', varietas: 'Anjasmoro', alatSortasi: 'Color Sorter 01', beratMasuk: 5050, hasilLulus: 4720, hasilTolak: 330, recovery: 93.47, tanggalSortasi: '10/06/2026', status: 'Selesai' },
    { no: 4, kodeBatch: 'SR-2606-0004', komoditas: 'Padi', varietas: 'Inpari 42', alatSortasi: 'Air Screen Cleaner 02', beratMasuk: 7960, hasilLulus: 7550, hasilTolak: 410, recovery: 94.85, tanggalSortasi: '10/06/2026', status: 'Selesai' },
    { no: 5, kodeBatch: 'SR-2606-0005', komoditas: 'Jagung', varietas: 'Bisi 18', alatSortasi: 'Indent Cylinder 01', beratMasuk: 6180, hasilLulus: 5820, hasilTolak: 360, recovery: 94.17, tanggalSortasi: '09/06/2026', status: 'Selesai' },
  ];

  for (const item of initialData) {
    await sortasiRepository.create(item);
  }
};
