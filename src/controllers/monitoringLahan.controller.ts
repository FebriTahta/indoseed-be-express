import { Request, Response } from 'express';
import { monitoringLahanRepository } from '../repositories/monitoringLahan.repository';

export const getMonitoringLahans = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      lokasi,
      status,
      kondisi,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      status: status ? String(status) : undefined,
      kondisi: kondisi ? String(kondisi) : undefined,
      skip,
      take,
    };

    // Auto seed if empty
    const totalCount = await monitoringLahanRepository.countAll();
    if (totalCount === 0) {
      await seedInitialMonitoringLahan();
    }

    const { data, total } = await monitoringLahanRepository.findAll(filters);
    const stats = await monitoringLahanRepository.getStats();

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
    console.error('Error fetching Monitoring Lahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getMonitoringLahanById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let item = await monitoringLahanRepository.findById(id);
    if (!item) {
      item = await monitoringLahanRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data monitoring lahan tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Monitoring Lahan by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createMonitoringLahan = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await monitoringLahanRepository.countAll();
    const nextSeq = totalCount + 1;
    const kodeLahan = body.kodeLahan || `LA-2605-${String(nextSeq).padStart(4, '0')}`;

    const newRecord = await monitoringLahanRepository.create({
      kodeLahan,
      lokasi: body.lokasi || 'Blok A - Petak 1',
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      luas: parseFloat(String(body.luas || '0').replace(',', '.')) || 0,
      tanggalTanam: body.tanggalTanam || '01/05/2026',
      umurHst: body.umurHst || '40 HST',
      kondisi: body.kondisi || 'Baik',
      status: body.status || 'Aktif',
      latitude: body.latitude ? parseFloat(body.latitude) : undefined,
      longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      phTanah: body.phTanah ? parseFloat(body.phTanah) : 6.5,
      kelembapan: body.kelembapan ? parseFloat(body.kelembapan) : 78,
      suhuTanah: body.suhuTanah ? parseFloat(body.suhuTanah) : 28,
      nutrisiNpk: body.nutrisiNpk || 'Optimal',
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data monitoring lahan berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Monitoring Lahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateMonitoringLahan = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let existing = await monitoringLahanRepository.findById(id);
    if (!existing) {
      existing = await monitoringLahanRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data monitoring lahan tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.luas !== undefined) updatePayload.luas = parseFloat(String(body.luas).replace(',', '.')) || 0;
    if (body.tanggalTanam !== undefined) updatePayload.tanggalTanam = body.tanggalTanam;
    if (body.umurHst !== undefined) updatePayload.umurHst = body.umurHst;
    if (body.kondisi) updatePayload.kondisi = body.kondisi;
    if (body.status) updatePayload.status = body.status;
    if (body.latitude !== undefined) updatePayload.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updatePayload.longitude = parseFloat(body.longitude);
    if (body.phTanah !== undefined) updatePayload.phTanah = parseFloat(body.phTanah);
    if (body.kelembapan !== undefined) updatePayload.kelembapan = parseFloat(body.kelembapan);
    if (body.suhuTanah !== undefined) updatePayload.suhuTanah = parseFloat(body.suhuTanah);
    if (body.nutrisiNpk) updatePayload.nutrisiNpk = body.nutrisiNpk;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await monitoringLahanRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data monitoring lahan berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Monitoring Lahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteMonitoringLahan = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let existing = await monitoringLahanRepository.findById(id);
    if (!existing) {
      existing = await monitoringLahanRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data monitoring lahan tidak ditemukan',
      });
    }

    await monitoringLahanRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data monitoring lahan berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Monitoring Lahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

// Seed 8 initial monitoring lahan records matching frontend mock
const seedInitialMonitoringLahan = async () => {
  const initialData = [
    {
      kodeLahan: 'LA-2605-0001',
      lokasi: 'Blok A - Petak 1',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      luas: 12.50,
      tanggalTanam: '01/05/2026',
      umurHst: '41 HST',
      kondisi: 'Baik',
      status: 'Aktif',
    },
    {
      kodeLahan: 'LA-2605-0002',
      lokasi: 'Blok A - Petak 2',
      komoditas: 'Jagung',
      varietas: 'Pioneer 21',
      luas: 8.20,
      tanggalTanam: '05/05/2026',
      umurHst: '37 HST',
      kondisi: 'Baik',
      status: 'Aktif',
    },
    {
      kodeLahan: 'LA-2605-0003',
      lokasi: 'Blok B - Petak 1',
      komoditas: 'Kedelai',
      varietas: 'Anjasmoro',
      luas: 10.00,
      tanggalTanam: '10/05/2026',
      umurHst: '32 HST',
      kondisi: 'Perlu Perhatian',
      status: 'Aktif',
    },
    {
      kodeLahan: 'LA-2605-0004',
      lokasi: 'Blok B - Petak 2',
      komoditas: 'Padi',
      varietas: 'Inpari 42',
      luas: 9.75,
      tanggalTanam: '02/05/2026',
      umurHst: '40 HST',
      kondisi: 'Baik',
      status: 'Aktif',
    },
    {
      kodeLahan: 'LA-2605-0005',
      lokasi: 'Blok C - Petak 1',
      komoditas: 'Jagung',
      varietas: 'Bisi 18',
      luas: 6.30,
      tanggalTanam: '08/05/2026',
      umurHst: '34 HST',
      kondisi: 'Buruk',
      status: 'Aktif',
    },
    {
      kodeLahan: 'LA-2605-0006',
      lokasi: 'Blok C - Petak 2',
      komoditas: 'Padi',
      varietas: 'Ciherang',
      luas: 11.20,
      tanggalTanam: '03/05/2026',
      umurHst: '39 HST',
      kondisi: 'Baik',
      status: 'Aktif',
    },
    {
      kodeLahan: 'LA-2605-0007',
      lokasi: 'Blok D - Petak 1',
      komoditas: 'Kedelai',
      varietas: 'Dega 1',
      luas: 7.50,
      tanggalTanam: '—',
      umurHst: '—',
      kondisi: 'Belum Tanam',
      status: 'Rencana',
    },
    {
      kodeLahan: 'LA-2605-0008',
      lokasi: 'Blok D - Petak 2',
      komoditas: 'Padi',
      varietas: 'Mekongga',
      luas: 8.50,
      tanggalTanam: '—',
      umurHst: '—',
      kondisi: 'Belum Tanam',
      status: 'Rencana',
    },
  ];

  for (const item of initialData) {
    await monitoringLahanRepository.create(item);
  }
};
