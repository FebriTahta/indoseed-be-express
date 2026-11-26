import { Request, Response } from 'express';
import { treatmentRepository } from '../repositories/treatment.repository';
import prisma from '../utils/prisma';

export const getTreatments = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      metodeTreatment,
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
      metodeTreatment: (metodeTreatment || jenisTreatment) ? String(metodeTreatment || jenisTreatment) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      skip,
      take,
    };

    // Check if we need to seed or refresh data to match modern format
    const totalCount = await treatmentRepository.countAll();
    const firstItem = totalCount > 0 ? await (prisma as any).treatment.findFirst({ orderBy: { createdAt: 'asc' } }) : null;
    const isOldData = !firstItem || !firstItem.metodeTreatment || firstItem.kodeBatch?.startsWith('TRT-') || firstItem.kodeBatch?.startsWith('TR-2606-');

    if (totalCount === 0 || isOldData) {
      await seedInitialTreatment(isOldData);
    }

    const { data, total } = await treatmentRepository.findAll(filters as any);
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
    const { id } = req.params as { id: string };
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

/**
 * Referensi Gudang Bahan Belum Diproses untuk Treatment:
 * Mengambil data bahan mentah yang statusnya sudah di sortasi ("Sudah Sortasi")
 */
export const getReferensiGudangBahanTreatment = async (req: Request, res: Response) => {
  try {
    // Prioritize items that have passed sorting: status 'Sudah Sortasi'
    let items = await (prisma as any).gudangBahanBelumDiproses.findMany({
      where: {
        status: 'Sudah Sortasi',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        noLot: true,
        sumberPanen: true,
        komoditas: true,
        varietas: true,
        petani: true,
        petaniKode: true,
        lahan: true,
        tanggalMasuk: true,
        beratMasuk: true,
        kadarAir: true,
        lokasi: true,
        lokasiDetail: true,
        status: true,
        kondisiFisik: true,
      },
    });

    // If no items have 'Sudah Sortasi', fallback to all items to prevent blocking the UI
    if (!items || items.length === 0) {
      items = await (prisma as any).gudangBahanBelumDiproses.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          noLot: true,
          sumberPanen: true,
          komoditas: true,
          varietas: true,
          petani: true,
          petaniKode: true,
          lahan: true,
          tanggalMasuk: true,
          beratMasuk: true,
          kadarAir: true,
          lokasi: true,
          lokasiDetail: true,
          status: true,
          kondisiFisik: true,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: items,
    });
  } catch (error: any) {
    console.error('Error fetching referensi gudang bahan untuk treatment:', error);
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
    const kodeBatch = body.kodeBatch || `TR-2026-06-${String(nextNo).padStart(3, '0')}`;

    const jumlahBenih = parseFloat(String(body.jumlahBenih || body.beratAwal || '200')) || 200;
    const beratAwal = jumlahBenih;
    const beratAkhir = parseFloat(String(body.beratAkhir || (beratAwal * 0.992).toFixed(1))) || beratAwal;
    const loss = beratAwal > 0 ? parseFloat((((beratAwal - beratAkhir) / beratAwal) * 100).toFixed(2)) : 0.8;

    const status = body.status || 'Selesai';
    const tanggalProses = body.tanggalProses || '02 Jun 2026';

    const defaultTahapan = [
      { nama: 'Persiapan', tanggal: tanggalProses.substring(0, 6), status: 'completed' },
      { nama: 'Perendaman', tanggal: tanggalProses.substring(0, 6), status: status === 'Menunggu' ? 'pending' : 'completed' },
      { nama: 'Pengeringan', tanggal: tanggalProses.substring(0, 6), status: status === 'Selesai' ? 'completed' : status === 'Dalam Proses' ? 'in_progress' : 'pending' },
      { nama: 'Selesai', tanggal: tanggalProses.substring(0, 6), status: status === 'Selesai' ? 'completed' : 'pending' },
    ];

    const defaultRiwayat = [
      { tanggal: `${tanggalProses} 08:00`, aktivitas: 'Persiapan', operator: body.operator || 'Admin Produksi' },
      ...(status !== 'Menunggu' ? [{ tanggal: `${tanggalProses} 09:30`, aktivitas: 'Perendaman', operator: body.operator || 'Admin Produksi' }] : []),
      ...(status === 'Dalam Proses' ? [{ tanggal: `${tanggalProses} 11:45`, aktivitas: 'Pengeringan', operator: body.operator || 'Admin Produksi' }] : []),
      ...(status === 'Selesai' ? [
        { tanggal: `${tanggalProses} 11:45`, aktivitas: 'Pengeringan', operator: body.operator || 'Admin Produksi' },
        { tanggal: `${tanggalProses} 14:30`, aktivitas: 'Proses selesai', operator: body.operator || 'Admin Produksi' }
      ] : []),
    ];

    const defaultFoto = [
      '/images/treatment/treatment-1.jpg',
      '/images/treatment/treatment-2.jpg',
      '/images/treatment/treatment-3.jpg',
      '/images/treatment/treatment-4.jpg',
    ];

    const newRecord = await treatmentRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Melon',
      varietas: body.varietas || 'Melon Tere F1',
      petani: body.petani || 'Budi Santoso',
      petaniKode: body.petaniKode || 'BTN-001',
      lahan: body.lahan || 'LHN-001 / Blok 01',
      metodeTreatment: body.metodeTreatment || 'Fungisida',
      bahan: body.bahan || 'Carbendazim',
      jumlahBenih,
      noLot: body.noLot || '',
      gudangBahanId: body.gudangBahanId || '',
      treatment: `${body.metodeTreatment || 'Fungisida'} (${body.bahan || 'Carbendazim'})`,
      dosis: body.dosis || '2.5 ml/kg',
      operator: body.operator || 'Admin Produksi',
      beratAwal,
      beratAkhir,
      loss,
      tanggalProses,
      tanggalSelesai: tanggalProses,
      status,
      lokasi: body.lokasi || 'Ruang Treatment 1',
      catatan: body.catatan || 'Benih telah melalui proses perlakuan dengan baik.',
      fotoDokumentasi: body.fotoDokumentasi || defaultFoto,
      tahapanProses: body.tahapanProses || defaultTahapan,
      riwayatTreatment: body.riwayatTreatment || defaultRiwayat,
      dibuatOleh: body.dibuatOleh || 'Admin Produksi',
      diubahOleh: body.diubahOleh || 'Admin Produksi',
    });

    // Sinkronisasi status ke Gudang Bahan Belum Diproses
    await updateGudangBahanStatusTreatment(body.noLot, body.gudangBahanId, status, kodeBatch);

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
    const { id } = req.params as { id: string };
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
    if (body.petani !== undefined) updatePayload.petani = body.petani;
    if (body.petaniKode !== undefined) updatePayload.petaniKode = body.petaniKode;
    if (body.lahan !== undefined) updatePayload.lahan = body.lahan;
    if (body.metodeTreatment !== undefined) {
      updatePayload.metodeTreatment = body.metodeTreatment;
      updatePayload.treatment = `${body.metodeTreatment} (${body.bahan || existing.bahan || ''})`;
    }
    if (body.bahan !== undefined) {
      updatePayload.bahan = body.bahan;
      updatePayload.treatment = `${updatePayload.metodeTreatment || existing.metodeTreatment || ''} (${body.bahan})`;
    }
    if (body.dosis) updatePayload.dosis = body.dosis;
    if (body.operator) updatePayload.operator = body.operator;
    if (body.jumlahBenih !== undefined) {
      updatePayload.jumlahBenih = parseFloat(String(body.jumlahBenih)) || 0;
      updatePayload.beratAwal = updatePayload.jumlahBenih;
    }
    if (body.beratAwal !== undefined) updatePayload.beratAwal = parseFloat(String(body.beratAwal)) || 0;
    if (body.beratAkhir !== undefined) updatePayload.beratAkhir = parseFloat(String(body.beratAkhir)) || 0;

    const bAwal = updatePayload.beratAwal !== undefined ? updatePayload.beratAwal : existing.beratAwal;
    const bAkhir = updatePayload.beratAkhir !== undefined ? updatePayload.beratAkhir : existing.beratAkhir;
    if (bAwal > 0 && bAkhir > 0) {
      updatePayload.loss = parseFloat((((bAwal - bAkhir) / bAwal) * 100).toFixed(2));
    }

    if (body.tanggalProses) {
      updatePayload.tanggalProses = body.tanggalProses;
      updatePayload.tanggalSelesai = body.tanggalProses;
    }
    if (body.status) updatePayload.status = body.status;
    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;
    if (body.fotoDokumentasi) updatePayload.fotoDokumentasi = body.fotoDokumentasi;
    if (body.tahapanProses) updatePayload.tahapanProses = body.tahapanProses;
    if (body.riwayatTreatment) updatePayload.riwayatTreatment = body.riwayatTreatment;
    if (body.noLot !== undefined) updatePayload.noLot = body.noLot;
    if (body.gudangBahanId !== undefined) updatePayload.gudangBahanId = body.gudangBahanId;

    const updated = await treatmentRepository.update(existing.id, updatePayload);

    // Sync status if changed
    if (body.status || body.noLot) {
      await updateGudangBahanStatusTreatment(
        body.noLot || existing.noLot,
        body.gudangBahanId || existing.gudangBahanId,
        body.status || existing.status,
        existing.kodeBatch
      );
    }

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
    const { id } = req.params as { id: string };
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

/**
 * Sinkronisasi status ke Gudang Bahan Belum Diproses
 */
const updateGudangBahanStatusTreatment = async (
  noLot?: string,
  gudangBahanId?: string,
  treatmentStatus?: string,
  kodeBatch?: string
) => {
  if (!noLot && !gudangBahanId) return;

  try {
    const whereClause: any = {};
    if (gudangBahanId) {
      whereClause.id = gudangBahanId;
    } else if (noLot) {
      whereClause.noLot = noLot;
    }

    const gudangItem = await (prisma as any).gudangBahanBelumDiproses.findFirst({
      where: whereClause,
    });

    if (!gudangItem) return;

    const isSelesai = treatmentStatus === 'Selesai';
    const targetStatus = isSelesai ? 'Sudah Treatment' : 'Proses Treatment';

    let flow: any[] = [];
    try {
      if (typeof gudangItem.riwayatFlow === 'string') {
        flow = JSON.parse(gudangItem.riwayatFlow);
      } else if (Array.isArray(gudangItem.riwayatFlow)) {
        flow = [...gudangItem.riwayatFlow];
      }
    } catch {
      flow = [];
    }

    const treatmentIdx = flow.findIndex((f: any) => f.tahap === 'Treatment');
    const treatmentStep = {
      tahap: 'Treatment',
      status: isSelesai ? 'completed' : 'in_progress',
      tanggal: new Date().toISOString(),
      keterangan: isSelesai
        ? `Selesai Treatment (${kodeBatch || 'TR'})`
        : `Sedang Proses Treatment (${kodeBatch || 'TR'})`,
    };

    if (treatmentIdx >= 0) {
      flow[treatmentIdx] = treatmentStep;
    } else {
      flow.push(treatmentStep);
    }

    await (prisma as any).gudangBahanBelumDiproses.update({
      where: { id: gudangItem.id },
      data: {
        status: targetStatus,
        riwayatFlow: flow,
      },
    });
  } catch (e) {
    console.error('Error updating gudang bahan status from treatment:', e);
  }
};

/**
 * Seed 12 treatment items matching screenshot
 */
const seedInitialTreatment = async (forceClean: boolean = false) => {
  try {
    if (forceClean) {
      await (prisma as any).treatment.deleteMany({});
    }

    const initialData = [
      {
        no: 1,
        kodeBatch: 'TR-2026-06-001',
        tanggalProses: '02 Jun 2026',
        tanggalSelesai: '02 Jun 2026',
        petani: 'Budi Santoso',
        petaniKode: 'BTN-001',
        lahan: 'LHN-001 / Blok 01',
        komoditas: 'Melon',
        varietas: 'Melon Tere F1',
        metodeTreatment: 'Fungisida',
        bahan: 'Carbendazim',
        jumlahBenih: 200,
        beratAwal: 200,
        beratAkhir: 198.5,
        loss: 0.75,
        dosis: '2.5 ml/kg',
        treatment: 'Fungisida (Carbendazim)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Benih terlihat sehat dan tidak ada kontaminasi. Siap untuk proses pengemasan.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00021',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '02 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '02 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '02 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '02 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '02 Jun 2026 14:35', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '02 Jun 2026 10:20', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '02 Jun 2026 08:10', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '02 Jun 2026 07:45', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-4.jpg',
        ],
      },
      {
        no: 2,
        kodeBatch: 'TR-2026-06-002',
        tanggalProses: '03 Jun 2026',
        tanggalSelesai: '03 Jun 2026',
        petani: 'Siti Rahayu',
        petaniKode: 'SRN-002',
        lahan: 'LHN-002 / Blok 02',
        komoditas: 'Cabai',
        varietas: 'Cabai Keriting',
        metodeTreatment: 'Insektisida',
        bahan: 'Imidakloprid',
        jumlahBenih: 150,
        beratAwal: 150,
        beratAkhir: 148.8,
        loss: 0.8,
        dosis: '2.0 ml/kg',
        treatment: 'Insektisida (Imidakloprid)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Perendaman benih cabai berjalan optimal dengan daya rekat baik.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00030',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '03 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '03 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '03 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '03 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '03 Jun 2026 15:00', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '03 Jun 2026 11:15', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '03 Jun 2026 09:00', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '03 Jun 2026 08:00', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-4.jpg',
        ],
      },
      {
        no: 3,
        kodeBatch: 'TR-2026-06-003',
        tanggalProses: '04 Jun 2026',
        tanggalSelesai: '04 Jun 2026',
        petani: 'Agus Setiawan',
        petaniKode: 'AGS-003',
        lahan: 'LHN-003 / Blok Utara',
        komoditas: 'Padi',
        varietas: 'Inpari 32',
        metodeTreatment: 'Fungisida',
        bahan: 'Mancozeb',
        jumlahBenih: 300,
        beratAwal: 300,
        beratAkhir: 297.6,
        loss: 0.8,
        dosis: '3.0 g/kg',
        treatment: 'Fungisida (Mancozeb)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 2',
        catatan: 'Benih padi telah dilapisi mancozeb merata untuk proteksi blas.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00024',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '04 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '04 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '04 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '04 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '04 Jun 2026 16:20', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '04 Jun 2026 12:45', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '04 Jun 2026 09:30', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '04 Jun 2026 08:15', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-4.jpg',
        ],
      },
      {
        no: 4,
        kodeBatch: 'TR-2026-06-004',
        tanggalProses: '06 Jun 2026',
        tanggalSelesai: '06 Jun 2026',
        petani: 'Dewi Lestari',
        petaniKode: 'DLR-004',
        lahan: 'LHN-004 / Blok 02',
        komoditas: 'Tomat',
        varietas: 'Grand Rapids',
        metodeTreatment: 'ZPT',
        bahan: 'Asam Humat',
        jumlahBenih: 100,
        beratAwal: 100,
        beratAkhir: 99.2,
        loss: 0.8,
        dosis: '1.5 ml/kg',
        treatment: 'ZPT (Asam Humat)',
        operator: 'Admin Produksi',
        status: 'Dalam Proses',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Proses perendaman dengan asam humat sedang berjalan di bak 2.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00032',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '06 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '06 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '06 Jun', status: 'in_progress' },
          { nama: 'Selesai', tanggal: '06 Jun', status: 'pending' },
        ],
        riwayatTreatment: [
          { tanggal: '06 Jun 2026 11:30', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '06 Jun 2026 09:10', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '06 Jun 2026 08:30', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-4.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
        ],
      },
      {
        no: 5,
        kodeBatch: 'TR-2026-06-005',
        tanggalProses: '08 Jun 2026',
        tanggalSelesai: '08 Jun 2026',
        petani: 'Budi Santoso',
        petaniKode: 'BTN-001',
        lahan: 'LHN-005 / Blok 03',
        komoditas: 'Melon',
        varietas: 'Melon Tere F1',
        metodeTreatment: 'Insektisida',
        bahan: 'Thiamethoxam',
        jumlahBenih: 250,
        beratAwal: 250,
        beratAkhir: 247.9,
        loss: 0.84,
        dosis: '2.5 g/kg',
        treatment: 'Insektisida (Thiamethoxam)',
        operator: 'Admin Produksi',
        status: 'Dalam Proses',
        lokasi: 'Ruang Treatment 2',
        catatan: 'Pengeringan benih setelah perlakuan thiamethoxam sedang dilakukan.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00025',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '08 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '08 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '08 Jun', status: 'in_progress' },
          { nama: 'Selesai', tanggal: '08 Jun', status: 'pending' },
        ],
        riwayatTreatment: [
          { tanggal: '08 Jun 2026 13:00', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '08 Jun 2026 10:15', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '08 Jun 2026 08:45', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-4.jpg',
        ],
      },
      {
        no: 6,
        kodeBatch: 'TR-2026-06-006',
        tanggalProses: '10 Jun 2026',
        tanggalSelesai: '10 Jun 2026',
        petani: 'Rini Wulandari',
        petaniKode: 'RW-005',
        lahan: 'LHN-006 / Blok 06',
        komoditas: 'Cabai',
        varietas: 'Rawit',
        metodeTreatment: 'Fungisida',
        bahan: 'Propikonazol',
        jumlahBenih: 120,
        beratAwal: 120,
        beratAkhir: 119.0,
        loss: 0.83,
        dosis: '2.0 ml/kg',
        treatment: 'Fungisida (Propikonazol)',
        operator: 'Admin Produksi',
        status: 'Menunggu',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Menunggu antrean perendaman batch cabai rawit.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00026',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '10 Jun', status: 'in_progress' },
          { nama: 'Perendaman', tanggal: '10 Jun', status: 'pending' },
          { nama: 'Pengeringan', tanggal: '10 Jun', status: 'pending' },
          { nama: 'Selesai', tanggal: '10 Jun', status: 'pending' },
        ],
        riwayatTreatment: [
          { tanggal: '10 Jun 2026 09:00', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-4.jpg',
          '/images/treatment/treatment-1.jpg',
        ],
      },
      {
        no: 7,
        kodeBatch: 'TR-2026-06-007',
        tanggalProses: '12 Jun 2026',
        tanggalSelesai: '12 Jun 2026',
        petani: 'Endang Sulastri',
        petaniKode: 'ENS-007',
        lahan: 'LHN-007 / Blok 07',
        komoditas: 'Padi',
        varietas: 'Inpari 32',
        metodeTreatment: 'Insektisida',
        bahan: 'Emamektin',
        jumlahBenih: 400,
        beratAwal: 400,
        beratAkhir: 396.8,
        loss: 0.8,
        dosis: '2.0 g/kg',
        treatment: 'Insektisida (Emamektin)',
        operator: 'Admin Produksi',
        status: 'Menunggu',
        lokasi: 'Ruang Treatment 2',
        catatan: 'Menunggu bahan perlakuan emamektin disiapkan.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00024',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '12 Jun', status: 'in_progress' },
          { nama: 'Perendaman', tanggal: '12 Jun', status: 'pending' },
          { nama: 'Pengeringan', tanggal: '12 Jun', status: 'pending' },
          { nama: 'Selesai', tanggal: '12 Jun', status: 'pending' },
        ],
        riwayatTreatment: [
          { tanggal: '12 Jun 2026 08:30', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-4.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
        ],
      },
      {
        no: 8,
        kodeBatch: 'TR-2026-06-008',
        tanggalProses: '15 Jun 2026',
        tanggalSelesai: '15 Jun 2026',
        petani: 'Slamet Riyadi',
        petaniKode: 'SRM-008',
        lahan: 'LHN-008 / Blok 08',
        komoditas: 'Kangkung',
        varietas: 'Bima',
        metodeTreatment: 'Biofungisida',
        bahan: 'Trichoderma',
        jumlahBenih: 100,
        beratAwal: 100,
        beratAkhir: 99.1,
        loss: 0.9,
        dosis: '5.0 g/kg',
        treatment: 'Biofungisida (Trichoderma)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Aplikasi agen hayati Trichoderma berjalan baik dan merata.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00028',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '15 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '15 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '15 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '15 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '15 Jun 2026 15:30', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '15 Jun 2026 11:45', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '15 Jun 2026 09:15', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '15 Jun 2026 08:00', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-4.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
        ],
      },
      {
        no: 9,
        kodeBatch: 'TR-2026-06-009',
        tanggalProses: '18 Jun 2026',
        tanggalSelesai: '18 Jun 2026',
        petani: 'Tono Setiawan',
        petaniKode: 'TSW-009',
        lahan: 'LHN-009 / Blok 09',
        komoditas: 'Selada',
        varietas: 'Grand Rapids',
        metodeTreatment: 'ZPT',
        bahan: 'Rootone-F',
        jumlahBenih: 80,
        beratAwal: 80,
        beratAkhir: 79.4,
        loss: 0.75,
        dosis: '1.0 g/kg',
        treatment: 'ZPT (Rootone-F)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Perangsang akar Rootone-F teraplikasikan secara optimal.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00029',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '18 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '18 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '18 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '18 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '18 Jun 2026 14:00', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '18 Jun 2026 11:00', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '18 Jun 2026 09:00', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '18 Jun 2026 08:00', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-4.jpg',
        ],
      },
      {
        no: 10,
        kodeBatch: 'TR-2026-06-010',
        tanggalProses: '20 Jun 2026',
        tanggalSelesai: '20 Jun 2026',
        petani: 'Sari Dewi',
        petaniKode: 'SDW-010',
        lahan: 'LHN-010 / Blok 10',
        komoditas: 'Cabai',
        varietas: 'Cabai Keriting',
        metodeTreatment: 'Insektisida',
        bahan: 'Abamektin',
        jumlahBenih: 150,
        beratAwal: 150,
        beratAkhir: 148.7,
        loss: 0.86,
        dosis: '1.5 ml/kg',
        treatment: 'Insektisida (Abamektin)',
        operator: 'Admin Produksi',
        status: 'Dalam Proses',
        lokasi: 'Ruang Treatment 2',
        catatan: 'Proses pelapisan benih cabai dengan abamektin sedang berputar di drum mixer.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00030',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '20 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '20 Jun', status: 'in_progress' },
          { nama: 'Pengeringan', tanggal: '20 Jun', status: 'pending' },
          { nama: 'Selesai', tanggal: '20 Jun', status: 'pending' },
        ],
        riwayatTreatment: [
          { tanggal: '20 Jun 2026 10:45', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '20 Jun 2026 08:30', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-4.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-3.jpg',
        ],
      },
      {
        no: 11,
        kodeBatch: 'TR-2026-06-011',
        tanggalProses: '22 Jun 2026',
        tanggalSelesai: '22 Jun 2026',
        petani: 'Budi Santoso',
        petaniKode: 'BTN-001',
        lahan: 'LHN-001 / Blok 01',
        komoditas: 'Melon',
        varietas: 'Melon Action 434',
        metodeTreatment: 'Fungisida',
        bahan: 'Carbendazim',
        jumlahBenih: 180,
        beratAwal: 180,
        beratAkhir: 178.6,
        loss: 0.77,
        dosis: '2.5 ml/kg',
        treatment: 'Fungisida (Carbendazim)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Benih melon action terlindungi dengan baik.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00031',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '22 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '22 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '22 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '22 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '22 Jun 2026 15:00', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '22 Jun 2026 11:00', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '22 Jun 2026 09:00', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '22 Jun 2026 08:00', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-4.jpg',
        ],
      },
      {
        no: 12,
        kodeBatch: 'TR-2026-06-012',
        tanggalProses: '24 Jun 2026',
        tanggalSelesai: '24 Jun 2026',
        petani: 'Agus Setiawan',
        petaniKode: 'AGS-003',
        lahan: 'LHN-003 / Blok Utara',
        komoditas: 'Tomat',
        varietas: 'TSW-009',
        metodeTreatment: 'Fungisida',
        bahan: 'Carbendazim',
        jumlahBenih: 120,
        beratAwal: 120,
        beratAkhir: 119.1,
        loss: 0.75,
        dosis: '2.5 ml/kg',
        treatment: 'Fungisida (Carbendazim)',
        operator: 'Admin Produksi',
        status: 'Selesai',
        lokasi: 'Ruang Treatment 1',
        catatan: 'Benih tomat selesai dilapisi dan siap uji QC.',
        dibuatOleh: 'Admin Produksi',
        noLot: 'LOT-2026-00027',
        tahapanProses: [
          { nama: 'Persiapan', tanggal: '24 Jun', status: 'completed' },
          { nama: 'Perendaman', tanggal: '24 Jun', status: 'completed' },
          { nama: 'Pengeringan', tanggal: '24 Jun', status: 'completed' },
          { nama: 'Selesai', tanggal: '24 Jun', status: 'completed' },
        ],
        riwayatTreatment: [
          { tanggal: '24 Jun 2026 16:00', aktivitas: 'Proses selesai', operator: 'Admin Produksi' },
          { tanggal: '24 Jun 2026 12:00', aktivitas: 'Pengeringan', operator: 'Admin Produksi' },
          { tanggal: '24 Jun 2026 09:30', aktivitas: 'Perendaman', operator: 'Admin Produksi' },
          { tanggal: '24 Jun 2026 08:00', aktivitas: 'Persiapan', operator: 'Admin Produksi' },
        ],
        fotoDokumentasi: [
          '/images/treatment/treatment-3.jpg',
          '/images/treatment/treatment-4.jpg',
          '/images/treatment/treatment-1.jpg',
          '/images/treatment/treatment-2.jpg',
        ],
      },
    ];

    for (const item of initialData) {
      await treatmentRepository.create(item);
    }
    console.log('Seeded 12 modern treatment records matching UI successfully');
  } catch (e) {
    console.error('Error seeding initial treatment:', e);
  }
};

