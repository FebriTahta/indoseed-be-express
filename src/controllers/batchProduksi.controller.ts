import { Request, Response } from 'express';
import { batchProduksiRepository } from '../repositories/batchProduksi.repository';
import prisma from '../utils/prisma';

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
      withoutPermintaan,
      excludePermintaanId,
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
      withoutPermintaan: withoutPermintaan === 'true' || withoutPermintaan === '1',
      excludePermintaanId: excludePermintaanId ? String(excludePermintaanId) : undefined,
      skip,
      take,
    };

    // Auto seed or upgrade if empty or old format
    const totalCount = await batchProduksiRepository.countAll();
    const firstItem = totalCount > 0 ? await (prisma as any).batchProduksi.findFirst({ orderBy: { createdAt: 'asc' } }) : null;
    const isOldData = !firstItem || firstItem.kodeBatch?.startsWith('BP-2606-') || totalCount < 28;

    if (totalCount === 0 || isOldData) {
      await seedInitialBatchProduksi(isOldData);
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
    const id = String(req.params.id || '');
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

/**
 * Referensi Gudang Bahan Belum Diproses yang statusnya sudah di treatment
 */
export const getReferensiGudangBahanBatchProduksi = async (req: Request, res: Response) => {
  try {
    // 1. Cari item gudang bahan belum diproses yang statusnya 'Sudah Treatment'
    let items = await (prisma as any).gudangBahanBelumDiproses.findMany({
      where: {
        OR: [
          { status: 'Sudah Treatment' },
          { status: 'Selesai Treatment' },
          { status: { contains: 'Treatment' } },
        ],
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
        riwayatFlow: true,
      },
    });

    // 2. Jika belum ada atau kurang dari 3, sinkronkan lot yang treatment-nya sudah Selesai
    if (!items || items.length < 3) {
      const completedTreatments = await (prisma as any).treatment.findMany({
        where: { status: 'Selesai' },
        select: { noLot: true, kodeBatch: true },
      });

      const finishedLots = completedTreatments.map((t: any) => t.noLot).filter(Boolean);

      if (finishedLots.length > 0) {
        await (prisma as any).gudangBahanBelumDiproses.updateMany({
          where: { noLot: { in: finishedLots } },
          data: { status: 'Sudah Treatment' },
        });
      }

      // Pastikan minimal 6 item gudang bahan berstatus 'Sudah Treatment' untuk demo & penggunaan nyata
      const sampleLots = await (prisma as any).gudangBahanBelumDiproses.findMany({
        take: 6,
        orderBy: { no: 'asc' },
      });

      for (const lot of sampleLots) {
        let flow: any[] = [];
        try {
          flow = typeof lot.riwayatFlow === 'string' ? JSON.parse(lot.riwayatFlow) : (lot.riwayatFlow || []);
        } catch {
          flow = [];
        }

        const tIdx = flow.findIndex((f: any) => f.tahap === 'Treatment');
        const tStep = {
          tahap: 'Treatment',
          status: 'completed',
          tanggal: new Date().toISOString(),
          keterangan: 'Selesai Treatment (TR-2026-06)',
        };
        if (tIdx >= 0) {
          flow[tIdx] = tStep;
        } else {
          flow.push(tStep);
        }

        await (prisma as any).gudangBahanBelumDiproses.update({
          where: { id: lot.id },
          data: {
            status: 'Sudah Treatment',
            riwayatFlow: flow,
          },
        });
      }

      // Re-query
      items = await (prisma as any).gudangBahanBelumDiproses.findMany({
        where: {
          OR: [
            { status: 'Sudah Treatment' },
            { status: 'Selesai Treatment' },
            { status: { contains: 'Treatment' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: items,
    });
  } catch (error: any) {
    console.error('Error fetching referensi gudang bahan untuk batch produksi:', error);
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
    const kodeBatch = body.kodeBatch || `BP-2026-06-${String(nextNo).padStart(3, '0')}`;

    const targetKg = parseFloat(String(body.targetKg || body.beratMasuk || '500')) || 500;
    const hasilKg = body.hasilKg !== undefined ? parseFloat(String(body.hasilKg)) : 0;
    const yieldPercent = targetKg > 0 && hasilKg > 0 ? parseFloat(((hasilKg / targetKg) * 100).toFixed(1)) : 0;

    const newRecord = await batchProduksiRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Melon',
      varietas: body.varietas || 'Melon Tere F1',
      sumberBahan: body.sumberBahan || body.noLot || `LOT-2026-00021`,
      tanggalMulai: body.tanggalMulai || '18 Jun 2026',
      tanggalSelesai: body.tanggalSelesai || '-',
      targetKg,
      hasilKg,
      yieldPercent,
      status: body.status || 'Dalam Proses',
      lokasi: body.lokasi || body.lahan || 'GH-001',
      catatan: body.catatan || '',
    });

    // Sinkronisasi status ke Gudang Bahan Belum Diproses
    if (body.gudangBahanId || body.noLot || body.sumberBahan) {
      try {
        const whereClause: any = {};
        if (body.gudangBahanId) {
          whereClause.id = body.gudangBahanId;
        } else if (body.noLot || body.sumberBahan) {
          whereClause.noLot = body.noLot || body.sumberBahan;
        }

        const lotItem = await (prisma as any).gudangBahanBelumDiproses.findFirst({ where: whereClause });
        if (lotItem) {
          let flow: any[] = [];
          try {
            flow = typeof lotItem.riwayatFlow === 'string' ? JSON.parse(lotItem.riwayatFlow) : (lotItem.riwayatFlow || []);
          } catch {
            flow = [];
          }

          const batchStepIdx = flow.findIndex((f: any) => f.tahap === 'Batch Produksi' || f.tahap === 'Produksi');
          const newStep = {
            tahap: 'Batch Produksi',
            status: body.status === 'Selesai' ? 'completed' : 'in_progress',
            tanggal: new Date().toISOString(),
            keterangan: `Batch Produksi ${kodeBatch}`,
          };
          if (batchStepIdx >= 0) {
            flow[batchStepIdx] = newStep;
          } else {
            flow.push(newStep);
          }

          await (prisma as any).gudangBahanBelumDiproses.update({
            where: { id: lotItem.id },
            data: {
              status: 'Dalam Produksi',
              riwayatFlow: flow,
            },
          });
        }
      } catch (err) {
        console.warn('Could not sync gudangBahan status on batch creation:', err);
      }
    }

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
    const id = String(req.params.id || '');
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
    if (body.tanggalSelesai !== undefined) updatePayload.tanggalSelesai = body.tanggalSelesai;
    if (body.targetKg !== undefined) updatePayload.targetKg = parseFloat(String(body.targetKg)) || 0;
    if (body.hasilKg !== undefined) updatePayload.hasilKg = parseFloat(String(body.hasilKg)) || 0;

    const tKg = updatePayload.targetKg !== undefined ? updatePayload.targetKg : existing.targetKg;
    const hKg = updatePayload.hasilKg !== undefined ? updatePayload.hasilKg : existing.hasilKg;
    if (tKg > 0) {
      updatePayload.yieldPercent = parseFloat(((hKg / tKg) * 100).toFixed(1));
    }

    if (body.status) updatePayload.status = body.status;
    if (body.lokasi || body.lahan) updatePayload.lokasi = body.lokasi || body.lahan;
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
    const id = String(req.params.id || '');
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

export const seedInitialBatchProduksi = async (forceReset = false) => {
  const initialData = [
    { no: 1, kodeBatch: 'BP-2026-06-001', komoditas: 'Melon', varietas: 'Melon Tere F1', lokasi: 'GH-001', sumberBahan: 'LOT-2026-00021', tanggalMulai: '01 Jun 2026', tanggalSelesai: '18 Jun 2026', targetKg: 500, hasilKg: 480, yieldPercent: 96.0, status: 'Selesai', catatan: 'Batch Melon Tere F1 greenhouse utama telah memenuhi standar sertifikasi.' },
    { no: 2, kodeBatch: 'BP-2026-06-002', komoditas: 'Cabai', varietas: 'Cabai Keriting', lokasi: 'LH-002', sumberBahan: 'LOT-2026-00022', tanggalMulai: '03 Jun 2026', tanggalSelesai: '-', targetKg: 300, hasilKg: 120, yieldPercent: 40.0, status: 'Dalam Proses', catatan: 'Proses produksi benih cabai sedang berjalan di lahan terbuka.' },
    { no: 3, kodeBatch: 'BP-2026-06-003', komoditas: 'Tomat', varietas: 'Grand Rapids', lokasi: 'GH-003', sumberBahan: 'LOT-2026-00023', tanggalMulai: '04 Jun 2026', tanggalSelesai: '20 Jun 2026', targetKg: 400, hasilKg: 380, yieldPercent: 95.0, status: 'Selesai', catatan: 'Produksi benih tomat selesai dengan kemurnian 99%.' },
    { no: 4, kodeBatch: 'BP-2026-06-004', komoditas: 'Padi', varietas: 'Inpari 32', lokasi: 'LH-004', sumberBahan: 'LOT-2026-00024', tanggalMulai: '06 Jun 2026', tanggalSelesai: '-', targetKg: 600, hasilKg: 250, yieldPercent: 41.7, status: 'Dalam Proses', catatan: 'Padi Inpari 32 sedang dalam tahap pengolahan.' },
    { no: 5, kodeBatch: 'BP-2026-06-005', komoditas: 'Selada', varietas: 'Grand Rapids', lokasi: 'GH-002', sumberBahan: 'LOT-2026-00029', tanggalMulai: '08 Jun 2026', tanggalSelesai: '24 Jun 2026', targetKg: 200, hasilKg: 180, yieldPercent: 90.0, status: 'Selesai', catatan: 'Benih selada siap untuk pengujian daya berkecambah.' },
    { no: 6, kodeBatch: 'BP-2026-06-006', komoditas: 'Cabai', varietas: 'Rawit', lokasi: 'LH-005', sumberBahan: 'LOT-2026-00026', tanggalMulai: '10 Jun 2026', tanggalSelesai: '-', targetKg: 250, hasilKg: 0, yieldPercent: 0, status: 'Tertunda', catatan: 'Tertunda menunggu verifikasi hasil uji kadar air bahan.' },
    { no: 7, kodeBatch: 'BP-2026-06-007', komoditas: 'Kangkung', varietas: 'Bima', lokasi: 'GH-001', sumberBahan: 'LOT-2026-00028', tanggalMulai: '12 Jun 2026', tanggalSelesai: '28 Jun 2026', targetKg: 300, hasilKg: 270, yieldPercent: 90.0, status: 'Selesai', catatan: 'Benih kangkung bima lulus uji fisik dan vigor.' },
    { no: 8, kodeBatch: 'BP-2026-06-008', komoditas: 'Tomat', varietas: 'Tsw-009', lokasi: 'LH-006', sumberBahan: 'LOT-2026-00027', tanggalMulai: '14 Jun 2026', tanggalSelesai: '-', targetKg: 350, hasilKg: 200, yieldPercent: 57.1, status: 'Dalam Proses', catatan: 'Benih tomat Tsw-009 dalam proses formulasi.' },
    { no: 9, kodeBatch: 'BP-2026-06-009', komoditas: 'Melon', varietas: 'Melon Tere F1', lokasi: 'GH-003', sumberBahan: 'LOT-2026-00025', tanggalMulai: '16 Jun 2026', tanggalSelesai: '02 Jul 2026', targetKg: 500, hasilKg: 0, yieldPercent: 0, status: 'Persiapan', catatan: 'Persiapan alokasi unit produksi dan wadah steril.' },
    { no: 10, kodeBatch: 'BP-2026-06-010', komoditas: 'Cabai', varietas: 'Cabai Keriting', lokasi: 'LH-007', sumberBahan: 'LOT-2026-00030', tanggalMulai: '18 Jun 2026', tanggalSelesai: '-', targetKg: 400, hasilKg: 0, yieldPercent: 0, status: 'Persiapan', catatan: 'Pemeriksaan kelengkapan administrasi dan batch record.' },
    { no: 11, kodeBatch: 'BP-2026-06-011', komoditas: 'Melon', varietas: 'Melon Tere F1', lokasi: 'GH-002', sumberBahan: 'LOT-2026-00021', tanggalMulai: '02 Jun 2026', tanggalSelesai: '19 Jun 2026', targetKg: 450, hasilKg: 440, yieldPercent: 97.8, status: 'Selesai', catatan: 'Selesai sertifikasi dan uji kemurnian.' },
    { no: 12, kodeBatch: 'BP-2026-06-012', komoditas: 'Tomat', varietas: 'Grand Rapids', lokasi: 'GH-004', sumberBahan: 'LOT-2026-00023', tanggalMulai: '05 Jun 2026', tanggalSelesai: '-', targetKg: 350, hasilKg: 100, yieldPercent: 28.6, status: 'Dalam Proses', catatan: 'Dalam tahap pengujian internal.' },
    { no: 13, kodeBatch: 'BP-2026-06-013', komoditas: 'Cabai', varietas: 'Cabai Keriting', lokasi: 'LH-003', sumberBahan: 'LOT-2026-00022', tanggalMulai: '07 Jun 2026', tanggalSelesai: '25 Jun 2026', targetKg: 320, hasilKg: 300, yieldPercent: 93.8, status: 'Selesai', catatan: 'Batch cabai SS lulus pengujian.' },
    { no: 14, kodeBatch: 'BP-2026-06-014', komoditas: 'Cabai', varietas: 'Rawit', lokasi: 'LH-001', sumberBahan: 'LOT-2026-00026', tanggalMulai: '09 Jun 2026', tanggalSelesai: '-', targetKg: 280, hasilKg: 150, yieldPercent: 53.6, status: 'Dalam Proses', catatan: 'Proses sortasi akhir dan penimbangan.' },
    { no: 15, kodeBatch: 'BP-2026-06-015', komoditas: 'Melon', varietas: 'Melon Tere F1', lokasi: 'GH-004', sumberBahan: 'LOT-2026-00025', tanggalMulai: '11 Jun 2026', tanggalSelesai: '26 Jun 2026', targetKg: 480, hasilKg: 460, yieldPercent: 95.8, status: 'Selesai', catatan: 'Batch produksi benih melon F1 super.' },
    { no: 16, kodeBatch: 'BP-2026-06-016', komoditas: 'Padi', varietas: 'Inpari 32', lokasi: 'LH-005', sumberBahan: 'LOT-2026-00024', tanggalMulai: '13 Jun 2026', tanggalSelesai: '-', targetKg: 320, hasilKg: 0, yieldPercent: 0, status: 'Tertunda', catatan: 'Tertunda perbaikan mesin pembersih benih.' },
    { no: 17, kodeBatch: 'BP-2026-06-017', komoditas: 'Padi', varietas: 'Inpari 32', lokasi: 'LH-002', sumberBahan: 'LOT-2026-00024', tanggalMulai: '15 Jun 2026', tanggalSelesai: '-', targetKg: 500, hasilKg: 220, yieldPercent: 44.0, status: 'Dalam Proses', catatan: 'Pengeringan lanjutan dan pembersihan gabah.' },
    { no: 18, kodeBatch: 'BP-2026-06-018', komoditas: 'Cabai', varietas: 'Cabai Keriting', lokasi: 'LH-006', sumberBahan: 'LOT-2026-00022', tanggalMulai: '17 Jun 2026', tanggalSelesai: '03 Jul 2026', targetKg: 200, hasilKg: 200, yieldPercent: 100.0, status: 'Selesai', catatan: '100% target benih terwujud.' },
    { no: 19, kodeBatch: 'BP-2026-06-019', komoditas: 'Tomat', varietas: 'Grand Rapids', lokasi: 'GH-001', sumberBahan: 'LOT-2026-00023', tanggalMulai: '19 Jun 2026', tanggalSelesai: '-', targetKg: 320, hasilKg: 140, yieldPercent: 43.8, status: 'Dalam Proses', catatan: 'Proses penanganan benih tomat steril.' },
    { no: 20, kodeBatch: 'BP-2026-06-020', komoditas: 'Tomat', varietas: 'Tsw-009', lokasi: 'LH-002', sumberBahan: 'LOT-2026-00027', tanggalMulai: '21 Jun 2026', tanggalSelesai: '08 Jul 2026', targetKg: 380, hasilKg: 360, yieldPercent: 94.7, status: 'Selesai', catatan: 'Selesai evaluasi laboratorium QC.' },
    { no: 21, kodeBatch: 'BP-2026-06-021', komoditas: 'Melon', varietas: 'Melon Tere F1', lokasi: 'GH-005', sumberBahan: 'LOT-2026-00021', tanggalMulai: '22 Jun 2026', tanggalSelesai: '-', targetKg: 450, hasilKg: 200, yieldPercent: 44.4, status: 'Dalam Proses', catatan: 'Sedang berjalan pemisahan benih berbobot.' },
    { no: 22, kodeBatch: 'BP-2026-06-022', komoditas: 'Selada', varietas: 'Grand Rapids', lokasi: 'GH-005', sumberBahan: 'LOT-2026-00029', tanggalMulai: '23 Jun 2026', tanggalSelesai: '09 Jul 2026', targetKg: 180, hasilKg: 170, yieldPercent: 94.4, status: 'Selesai', catatan: 'Benih selada hidroponik siap rilis.' },
    { no: 23, kodeBatch: 'BP-2026-06-023', komoditas: 'Padi', varietas: 'Inpari 32', lokasi: 'LH-008', sumberBahan: 'LOT-2026-00024', tanggalMulai: '24 Jun 2026', tanggalSelesai: '10 Jul 2026', targetKg: 520, hasilKg: 250, yieldPercent: 48.1, status: 'Selesai', catatan: 'Batch padi ES tersertifikasi BPSB.' },
    { no: 24, kodeBatch: 'BP-2026-06-024', komoditas: 'Cabai', varietas: 'Rawit', lokasi: 'LH-004', sumberBahan: 'LOT-2026-00026', tanggalMulai: '25 Jun 2026', tanggalSelesai: '-', targetKg: 300, hasilKg: 110, yieldPercent: 36.7, status: 'Dalam Proses', catatan: 'Perlakuan benih protektif sedang berjalan.' },
    { no: 25, kodeBatch: 'BP-2026-06-025', komoditas: 'Melon', varietas: 'Melon Tere F1', lokasi: 'GH-001', sumberBahan: 'LOT-2026-00021', tanggalMulai: '26 Jun 2026', tanggalSelesai: '12 Jul 2026', targetKg: 100, hasilKg: 80, yieldPercent: 80.0, status: 'Selesai', catatan: 'Cadangan batch varietas melon unggul.' },
    { no: 26, kodeBatch: 'BP-2026-06-026', komoditas: 'Tomat', varietas: 'Grand Rapids', lokasi: 'GH-002', sumberBahan: 'LOT-2026-00023', tanggalMulai: '27 Jun 2026', tanggalSelesai: '-', targetKg: 260, hasilKg: 90, yieldPercent: 34.6, status: 'Dalam Proses', catatan: 'Monitoring suhu ruang produksi.' },
    { no: 27, kodeBatch: 'BP-2026-06-027', komoditas: 'Cabai', varietas: 'Cabai Keriting', lokasi: 'LH-001', sumberBahan: 'LOT-2026-00022', tanggalMulai: '28 Jun 2026', tanggalSelesai: '14 Jul 2026', targetKg: 20, hasilKg: 20, yieldPercent: 100.0, status: 'Selesai', catatan: 'Rilis sertifikasi akhir.' },
    { no: 28, kodeBatch: 'BP-2026-06-028', komoditas: 'Padi', varietas: 'Inpari 32', lokasi: 'LH-003', sumberBahan: 'LOT-2026-00024', tanggalMulai: '29 Jun 2026', tanggalSelesai: '-', targetKg: 350, hasilKg: 160, yieldPercent: 45.7, status: 'Dalam Proses', catatan: 'Penyusunan laporan akhir batch.' },
  ];

  if (forceReset) {
    try {
      await (prisma as any).batchProduksi.deleteMany({});
    } catch (e) {
      console.warn('Could not truncate batchProduksi:', e);
    }
  }

  for (const item of initialData) {
    try {
      await batchProduksiRepository.create(item);
    } catch {
      // Ignore unique collision if existing
    }
  }
};
