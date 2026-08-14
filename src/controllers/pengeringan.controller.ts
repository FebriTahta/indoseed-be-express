import { Request, Response } from 'express';
import { pengeringanRepository } from '../repositories/pengeringan.repository';

export const getPengeringans = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      alatPengering,
      status,
      lokasi,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      alatPengering: alatPengering ? String(alatPengering) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      skip,
      take,
    };

    // Auto seed if empty
    const totalCount = await pengeringanRepository.countAll();
    if (totalCount === 0) {
      await seedInitialPengeringan();
    }

    const { data, total } = await pengeringanRepository.findAll(filters as any);
    const stats = await pengeringanRepository.getStats();

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
    console.error('Error fetching Pengeringan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPengeringanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let item = await pengeringanRepository.findById(id);
    if (!item) {
      item = await pengeringanRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data pengeringan tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Pengeringan by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createPengeringan = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await pengeringanRepository.countAll();
    const nextNo = totalCount + 1;
    const kodeBatch = body.kodeBatch || `PN-2606-${String(nextNo).padStart(4, '0')}`;

    const newRecord = await pengeringanRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      alatPengering: body.alatPengering || 'DR-01',
      beratMasuk: parseFloat(String(body.beratMasuk || '10000')) || 10000,
      kadarAirMasuk: parseFloat(String(body.kadarAirMasuk || '19.8')) || 19.8,
      kadarAirTarget: parseFloat(String(body.kadarAirTarget || '12.0')) || 12.0,
      kadarAirSaatIni: parseFloat(String(body.kadarAirSaatIni || '12.3')) || 12.3,
      beratKeluar: body.beratKeluar ? parseFloat(String(body.beratKeluar)) : 9650,
      status: body.status || 'Proses',
      selesai: body.selesai || '-',
      suhuRataRata: body.suhuRataRata ? parseFloat(body.suhuRataRata) : 41.5,
      durasiJam: body.durasiJam ? parseFloat(body.durasiJam) : 6.5,
      lokasi: body.lokasi || 'Gudang Pengeringan 1',
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data pengeringan berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Pengeringan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updatePengeringan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let existing = await pengeringanRepository.findById(id);
    if (!existing) {
      existing = await pengeringanRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data pengeringan tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.alatPengering) updatePayload.alatPengering = body.alatPengering;
    if (body.beratMasuk !== undefined) updatePayload.beratMasuk = parseFloat(String(body.beratMasuk)) || 0;
    if (body.kadarAirMasuk !== undefined) updatePayload.kadarAirMasuk = parseFloat(String(body.kadarAirMasuk)) || 0;
    if (body.kadarAirTarget !== undefined) updatePayload.kadarAirTarget = parseFloat(String(body.kadarAirTarget)) || 12;
    if (body.kadarAirSaatIni !== undefined) updatePayload.kadarAirSaatIni = parseFloat(String(body.kadarAirSaatIni)) || 0;
    if (body.beratKeluar !== undefined) updatePayload.beratKeluar = parseFloat(String(body.beratKeluar));
    if (body.status) updatePayload.status = body.status;
    if (body.selesai !== undefined) updatePayload.selesai = body.selesai;
    if (body.suhuRataRata !== undefined) updatePayload.suhuRataRata = parseFloat(body.suhuRataRata);
    if (body.durasiJam !== undefined) updatePayload.durasiJam = parseFloat(body.durasiJam);
    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await pengeringanRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data pengeringan berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Pengeringan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deletePengeringan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let existing = await pengeringanRepository.findById(id);
    if (!existing) {
      existing = await pengeringanRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data pengeringan tidak ditemukan',
      });
    }

    await pengeringanRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data pengeringan berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Pengeringan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialPengeringan = async () => {
  const initialData = [
    { no: 1, kodeBatch: 'PN-2606-0001', komoditas: 'Padi', varietas: 'Inpari 32', alatPengering: 'DR-01', beratMasuk: 10000, kadarAirMasuk: 19.8, kadarAirTarget: 12.0, kadarAirSaatIni: 12.3, beratKeluar: 9650, status: 'Selesai', selesai: '09/06/2026 15:30', suhuRataRata: 42.3, durasiJam: 6.5, lokasi: 'Gudang Pengeringan 1' },
    { no: 2, kodeBatch: 'PN-2606-0002', komoditas: 'Jagung', varietas: 'Pioneer 21', alatPengering: 'DR-02', beratMasuk: 8000, kadarAirMasuk: 18.5, kadarAirTarget: 13.0, kadarAirSaatIni: 13.1, beratKeluar: 7720, status: 'Selesai', selesai: '09/06/2026 17:45', suhuRataRata: 41.0, durasiJam: 8.0, lokasi: 'Gudang Pengeringan 1' },
    { no: 3, kodeBatch: 'PN-2606-0003', komoditas: 'Padi', varietas: 'Ciliwung', alatPengering: 'DR-01', beratMasuk: 10500, kadarAirMasuk: 21.2, kadarAirTarget: 12.0, kadarAirSaatIni: 13.8, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 42.3, durasiJam: 6.5, lokasi: 'Gudang Pengeringan 1' },
    { no: 4, kodeBatch: 'PN-2606-0004', komoditas: 'Kedelai', varietas: 'Anjasmoro', alatPengering: 'DR-02', beratMasuk: 6000, kadarAirMasuk: 17.6, kadarAirTarget: 11.0, kadarAirSaatIni: 11.5, beratKeluar: 0, status: 'Proses', selesai: '-', suhuRataRata: 41.0, durasiJam: 4.5, lokasi: 'Gudang Pengeringan 1' },
    { no: 5, kodeBatch: 'PN-2606-0005', komoditas: 'Padi', varietas: 'Inpari 42', alatPengering: 'DR-03', beratMasuk: 9000, kadarAirMasuk: 20.1, kadarAirTarget: 12.0, kadarAirSaatIni: 15.6, beratKeluar: 0, status: 'Jeda', selesai: '-', suhuRataRata: 38.5, durasiJam: 2.0, lokasi: 'Gudang Pengeringan 2' },
  ];

  for (const item of initialData) {
    await pengeringanRepository.create(item);
  }
};
