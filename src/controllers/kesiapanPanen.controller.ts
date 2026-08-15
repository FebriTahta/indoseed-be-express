import { Request, Response } from 'express';
import { kesiapanPanenRepository } from '../repositories/kesiapanPanen.repository';

export const getKesiapanPanens = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      lokasi,
      status,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      status: status ? String(status) : undefined,
      skip,
      take,
    };

    const { data, total } = await kesiapanPanenRepository.findAll(filters);
    const stats = await kesiapanPanenRepository.getStats();

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
    console.error('Error fetching Kesiapan Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getKesiapanPanenById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let item = await kesiapanPanenRepository.findById(id);
    if (!item) {
      item = await kesiapanPanenRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data kesiapan panen tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Kesiapan Panen by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const calculateStatusKesiapan = (dateVal: any): string => {
  if (!dateVal) return 'Belum Siap';
  let d: Date | null = null;
  if (typeof dateVal === 'string') {
    if (dateVal.includes('/')) {
      const parts = dateVal.split('/');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[2]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[0]!, 10));
      }
    } else if (dateVal.includes('-')) {
      const datePart = dateVal.split('T')[0] || '';
      const parts = datePart.split('-');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10));
      }
    } else {
      d = new Date(dateVal);
    }
  } else if (dateVal instanceof Date) {
    d = dateVal;
  }

  if (!d || isNaN(d.getTime())) return 'Belum Siap';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    return 'Siap Panen';
  } else if (diffDays >= 3 && diffDays <= 7) {
    return 'Akan Siap (3-7 Hari)';
  } else if (diffDays >= 8 && diffDays <= 14) {
    return 'Akan Siap (8-14 Hari)';
  } else {
    return 'Belum Siap';
  }
};

export const createKesiapanPanen = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await kesiapanPanenRepository.countAll();
    const nextNo = totalCount + 1;
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const defaultKode = `KP-${yy}${mm}-${String(nextNo).padStart(4, '0')}`;
    const kodeLahan = body.kodeLahan || defaultKode;

    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const prediksiPanenVal = body.prediksiPanen || todayStr;
    const computedStatus = calculateStatusKesiapan(prediksiPanenVal);

    const newRecord = await kesiapanPanenRepository.create({
      no: nextNo,
      kodeLahan,
      lokasi: body.lokasi || '',
      komoditas: body.komoditas || '',
      varietas: body.varietas || '',
      greenhouseId: body.greenhouseId || undefined,
      commodityId: body.commodityId || undefined,
      varietyId: body.varietyId || undefined,
      jadwalTanamId: body.jadwalTanamId || undefined,
      tanggalTanam: body.tanggalTanam || todayStr,
      umurHst: Number(body.umurHst) || 0,
      prediksiPanen: prediksiPanenVal,
      statusKesiapan: body.statusKesiapan || computedStatus,
      yieldEst: parseFloat(String(body.yieldEst || '0')) || 0,
      kadarAir: body.kadarAir ? parseFloat(body.kadarAir) : 0,
      kuningDaun: body.kuningDaun ? parseFloat(body.kuningDaun) : 0,
      kekerasanBiji: body.kekerasanBiji || '',
      catatan: body.catatan || '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data kesiapan panen berhasil ditambahkan',
      data: newRecord,
    });
  } catch (error: any) {
    console.error('Error creating Kesiapan Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateKesiapanPanen = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let existing = await kesiapanPanenRepository.findById(id);
    if (!existing) {
      existing = await kesiapanPanenRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data kesiapan panen tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.greenhouseId) updatePayload.greenhouseId = body.greenhouseId;
    if (body.commodityId) updatePayload.commodityId = body.commodityId;
    if (body.varietyId) updatePayload.varietyId = body.varietyId;
    if (body.jadwalTanamId) updatePayload.jadwalTanamId = body.jadwalTanamId;
    if (body.tanggalTanam !== undefined) updatePayload.tanggalTanam = body.tanggalTanam;
    if (body.umurHst !== undefined) updatePayload.umurHst = Number(body.umurHst);
    if (body.prediksiPanen !== undefined) {
      updatePayload.prediksiPanen = body.prediksiPanen;
      updatePayload.statusKesiapan = calculateStatusKesiapan(body.prediksiPanen);
    } else if (body.statusKesiapan) {
      updatePayload.statusKesiapan = body.statusKesiapan;
    }
    if (body.yieldEst !== undefined) updatePayload.yieldEst = parseFloat(String(body.yieldEst)) || 0;
    if (body.kadarAir !== undefined) updatePayload.kadarAir = parseFloat(body.kadarAir);
    if (body.kuningDaun !== undefined) updatePayload.kuningDaun = parseFloat(body.kuningDaun);
    if (body.kekerasanBiji) updatePayload.kekerasanBiji = body.kekerasanBiji;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;

    const updated = await kesiapanPanenRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data kesiapan panen berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Kesiapan Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteKesiapanPanen = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let existing = await kesiapanPanenRepository.findById(id);
    if (!existing) {
      existing = await kesiapanPanenRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data kesiapan panen tidak ditemukan',
      });
    }

    await kesiapanPanenRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data kesiapan panen berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Kesiapan Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

const seedInitialKesiapanPanen = async () => {
  const initialData = [
    { no: 1, kodeLahan: 'KP-2605-0001', lokasi: 'Blok A - Petak 1', komoditas: 'Padi', varietas: 'Inpari 32', tanggalTanam: '01/03/2026', umurHst: 105, prediksiPanen: '15/06/2026', statusKesiapan: 'Siap Panen', yieldEst: 6800 },
    { no: 2, kodeLahan: 'KP-2605-0002', lokasi: 'Blok A - Petak 2', komoditas: 'Jagung', varietas: 'Pioneer 21', tanggalTanam: '10/03/2026', umurHst: 96, prediksiPanen: '18/06/2026', statusKesiapan: 'Akan Siap (3-7 Hari)', yieldEst: 7200 },
    { no: 3, kodeLahan: 'KP-2605-0003', lokasi: 'Blok B - Petak 1', komoditas: 'Kedelai', varietas: 'Anjasmoro', tanggalTanam: '15/03/2026', umurHst: 91, prediksiPanen: '22/06/2026', statusKesiapan: 'Akan Siap (8-14 Hari)', yieldEst: 3100 },
    { no: 4, kodeLahan: 'KP-2605-0004', lokasi: 'Blok B - Petak 2', komoditas: 'Padi', varietas: 'Inpari 42', tanggalTanam: '05/03/2026', umurHst: 101, prediksiPanen: '16/06/2026', statusKesiapan: 'Siap Panen', yieldEst: 6500 },
    { no: 5, kodeLahan: 'KP-2605-0005', lokasi: 'Blok C - Petak 1', komoditas: 'Jagung', varietas: 'Bisi 18', tanggalTanam: '20/03/2026', umurHst: 86, prediksiPanen: '28/06/2026', statusKesiapan: 'Belum Siap', yieldEst: 6900 },
    { no: 6, kodeLahan: 'KP-2605-0006', lokasi: 'Blok C - Petak 2', komoditas: 'Padi', varietas: 'Ciherang', tanggalTanam: '02/03/2026', umurHst: 104, prediksiPanen: '14/06/2026', statusKesiapan: 'Siap Panen', yieldEst: 6700 },
    { no: 7, kodeLahan: 'KP-2605-0007', lokasi: 'Blok D - Petak 1', komoditas: 'Kedelai', varietas: 'Dega 1', tanggalTanam: '12/03/2026', umurHst: 94, prediksiPanen: '19/06/2026', statusKesiapan: 'Akan Siap (3-7 Hari)', yieldEst: 3300 },
    { no: 8, kodeLahan: 'KP-2605-0008', lokasi: 'Blok D - Petak 2', komoditas: 'Padi', varietas: 'Mekongga', tanggalTanam: '08/03/2026', umurHst: 98, prediksiPanen: '21/06/2026', statusKesiapan: 'Akan Siap (8-14 Hari)', yieldEst: 6400 },
  ];

  for (const item of initialData) {
    await kesiapanPanenRepository.create(item);
  }
};
