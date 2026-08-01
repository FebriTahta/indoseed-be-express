import { Request, Response } from 'express';
import { monitoringGreenhouseRepository } from '../repositories/monitoringGreenhouse.repository';

export const getMonitoringGreenhouses = async (req: Request, res: Response) => {
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
    const totalCount = await monitoringGreenhouseRepository.countAll();
    if (totalCount === 0) {
      await seedInitialMonitoringGreenhouse();
    }

    const { data, total } = await monitoringGreenhouseRepository.findAll(filters);
    const stats = await monitoringGreenhouseRepository.getStats();

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
    console.error('Error fetching Monitoring Greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getMonitoringGreenhouseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let item = await monitoringGreenhouseRepository.findById(id);
    if (!item) {
      item = await monitoringGreenhouseRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data monitoring greenhouse tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Monitoring Greenhouse by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createMonitoringGreenhouse = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await monitoringGreenhouseRepository.countAll();
    const nextNo = totalCount + 1;
    const kodeGreenhouse = body.kodeGreenhouse || `GH-${String(nextNo).padStart(2, '0')}`;

    const newRecord = await monitoringGreenhouseRepository.create({
      no: nextNo,
      kodeGreenhouse,
      lokasi: body.lokasi || 'Blok A - Greenhouse 1',
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      luas: parseFloat(String(body.luas || '500')) || 500,
      status: body.status || 'Aktif',
      kondisi: body.kondisi || 'Baik',
      aktivitasTerakhir: body.aktivitasTerakhir || 'Pemeriksaan Rutin',
      suhuRataRata: body.suhuRataRata ? parseFloat(body.suhuRataRata) : 26.5,
      kelembapanRata: body.kelembapanRata ? parseFloat(body.kelembapanRata) : 70.0,
      intensitasCahaya: body.intensitasCahaya ? parseFloat(body.intensitasCahaya) : 12500,
      phAirIrigasi: body.phAirIrigasi ? parseFloat(body.phAirIrigasi) : 6.2,
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data monitoring greenhouse berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Monitoring Greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateMonitoringGreenhouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await monitoringGreenhouseRepository.findById(id);
    if (!existing) {
      existing = await monitoringGreenhouseRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data monitoring greenhouse tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.luas !== undefined) updatePayload.luas = parseFloat(String(body.luas)) || 0;
    if (body.status) updatePayload.status = body.status;
    if (body.kondisi) updatePayload.kondisi = body.kondisi;
    if (body.aktivitasTerakhir) updatePayload.aktivitasTerakhir = body.aktivitasTerakhir;
    if (body.suhuRataRata !== undefined) updatePayload.suhuRataRata = parseFloat(body.suhuRataRata);
    if (body.kelembapanRata !== undefined) updatePayload.kelembapanRata = parseFloat(body.kelembapanRata);
    if (body.intensitasCahaya !== undefined) updatePayload.intensitasCahaya = parseFloat(body.intensitasCahaya);
    if (body.phAirIrigasi !== undefined) updatePayload.phAirIrigasi = parseFloat(body.phAirIrigasi);
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await monitoringGreenhouseRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data monitoring greenhouse berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Monitoring Greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteMonitoringGreenhouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await monitoringGreenhouseRepository.findById(id);
    if (!existing) {
      existing = await monitoringGreenhouseRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data monitoring greenhouse tidak ditemukan',
      });
    }

    await monitoringGreenhouseRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data monitoring greenhouse berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Monitoring Greenhouse:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialMonitoringGreenhouse = async () => {
  const initialData = [
    { no: 1, kodeGreenhouse: 'GH-01', lokasi: 'Blok A - Greenhouse 1', komoditas: 'Padi', varietas: 'Inpari 32', luas: 500, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Penyiraman Otomatis' },
    { no: 2, kodeGreenhouse: 'GH-02', lokasi: 'Blok A - Greenhouse 2', komoditas: 'Jagung', varietas: 'Pioneer 21', luas: 450, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Pemupukan NPK' },
    { no: 3, kodeGreenhouse: 'GH-03', lokasi: 'Blok B - Greenhouse 1', komoditas: 'Tomat', varietas: 'Servo', luas: 600, status: 'Aktif', kondisi: 'Perlu Perhatian', aktivitasTerakhir: 'Cek Suhu & Kelembapan' },
    { no: 4, kodeGreenhouse: 'GH-04', lokasi: 'Blok B - Greenhouse 2', komoditas: 'Cabai', varietas: 'Laris', luas: 480, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Pemangkasan Daun' },
    { no: 5, kodeGreenhouse: 'GH-05', lokasi: 'Blok C - Greenhouse 1', komoditas: 'Mentimun', varietas: 'Mistar', luas: 520, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Panen Parsial' },
    { no: 6, kodeGreenhouse: 'GH-06', lokasi: 'Blok C - Greenhouse 2', komoditas: 'Padi', varietas: 'Inpari 32', luas: 500, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Penyiraman Nutrisi' },
    { no: 7, kodeGreenhouse: 'GH-07', lokasi: 'Blok D - Greenhouse 1', komoditas: 'Kedelai', varietas: 'Anjasmoro', luas: 550, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Sanitasi Area' },
    { no: 8, kodeGreenhouse: 'GH-08', lokasi: 'Blok D - Greenhouse 2', komoditas: 'Tomat', varietas: 'Servo', luas: 600, status: 'Aktif', kondisi: 'Buruk', aktivitasTerakhir: 'Penanganan Hama' },
    { no: 9, kodeGreenhouse: 'GH-09', lokasi: 'Blok E - Greenhouse 1', komoditas: 'Melon', varietas: 'Golden', luas: 400, status: 'Aktif', kondisi: 'Baik', aktivitasTerakhir: 'Polinasi Buatan' },
    { no: 10, kodeGreenhouse: 'GH-10', lokasi: 'Blok E - Greenhouse 2', komoditas: 'Cabai', varietas: 'Laris', luas: 480, status: 'Tidak Aktif', kondisi: 'Tidak Aktif', aktivitasTerakhir: 'Pembersihan Media' },
  ];

  for (const item of initialData) {
    await monitoringGreenhouseRepository.create(item);
  }
};
