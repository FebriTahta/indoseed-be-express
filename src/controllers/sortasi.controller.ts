import { Request, Response } from 'express';
import { sortasiRepository } from '../repositories/sortasi.repository';
import prisma from '../utils/prisma';

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
      periode,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Check if we need to seed or re-seed initial data
    const totalCount = await sortasiRepository.countAll();
    const firstItem = totalCount > 0 ? await (prisma as any).sortasi.findFirst({ orderBy: { createdAt: 'asc' } }) : null;
    const isOldData = firstItem && firstItem.kodeBatch && !firstItem.kodeBatch.startsWith('SO-2026');

    if (totalCount === 0 || isOldData) {
      await seedInitialSortasi(isOldData);
    }

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      alatSortasi: alatSortasi ? String(alatSortasi) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      periode: periode ? String(periode) : undefined,
      skip,
      take,
    };

    const { data, total } = await sortasiRepository.findAll(filters as any);
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
    const { id } = req.params as { id: string };
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

export const getReferensiGudangBahan = async (req: Request, res: Response) => {
  try {
    const items = await (prisma as any).gudangBahanBelumDiproses.findMany({
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

    return res.status(200).json({
      status: 'success',
      data: items,
    });
  } catch (error: any) {
    console.error('Error fetching referensi gudang bahan:', error);
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
    const kodeBatch = body.kodeBatch || `SO-2026-06-${String(nextNo).padStart(3, '0')}`;

    const beratMasuk = parseFloat(String(body.beratMasuk || '500')) || 500;
    const hasilLulus = parseFloat(String(body.hasilLulus || body.beratLolos || '460')) || 460;
    const hasilTolak = parseFloat(String(body.hasilTolak || body.beratReject || (beratMasuk - hasilLulus))) || (beratMasuk - hasilLulus);
    const recovery = beratMasuk > 0 ? parseFloat(((hasilLulus / beratMasuk) * 100).toFixed(1)) : 0;
    const status = body.status || 'Selesai';

    const rincianReject = body.rincianReject || [
      { jenis: 'Benih hampa', berat: parseFloat((hasilTolak * 0.45).toFixed(1)), persentase: parseFloat(((hasilTolak * 0.45 / beratMasuk) * 100).toFixed(1)) },
      { jenis: 'Ukuran < standar', berat: parseFloat((hasilTolak * 0.30).toFixed(1)), persentase: parseFloat(((hasilTolak * 0.30 / beratMasuk) * 100).toFixed(1)) },
      { jenis: 'Kerusakan fisik', berat: parseFloat((hasilTolak * 0.175).toFixed(1)), persentase: parseFloat(((hasilTolak * 0.175 / beratMasuk) * 100).toFixed(1)) },
      { jenis: 'Lainnya', berat: parseFloat((hasilTolak * 0.075).toFixed(1)), persentase: parseFloat(((hasilTolak * 0.075 / beratMasuk) * 100).toFixed(1)) },
    ];

    const dokumentasi = body.dokumentasi || [
      'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=60',
    ];

    const newRecord = await sortasiRepository.create({
      no: nextNo,
      kodeBatch,
      komoditas: body.komoditas || 'Melon',
      varietas: body.varietas || 'Melon Tere F1',
      petani: body.petani || 'Budi Santoso',
      petaniKode: body.petaniKode || 'BTN-001',
      noLot: body.noLot || '',
      gudangBahanId: body.gudangBahanId || '',
      alatSortasi: body.alatSortasi || 'Screen Separator M-01',
      beratMasuk,
      hasilLulus,
      hasilTolak,
      recovery,
      tanggalSortasi: body.tanggalSortasi || '28 Jun 2026',
      status,
      lokasi: body.lokasi || 'Ruang Sortasi Unit 1',
      operator: body.operator || 'Siti Nurhayati',
      catatan: body.catatan || '',
      rincianReject,
      dokumentasi,
      dibuatOleh: body.dibuatOleh || 'Admin',
      diubahOleh: body.diubahOleh || 'Admin',
    });

    // Sinkronisasi status ke Gudang Bahan Mentah:
    // Jika baru ditambahkan (status === 'Proses') -> ubah status gudang jadi 'Proses Sortasi'
    // Jika status sudah selesai (status === 'Selesai') -> ubah status gudang jadi 'Sudah Sortasi'
    await updateGudangBahanMentahStatus(body.noLot, body.gudangBahanId, status, kodeBatch);

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
    const { id } = req.params as { id: string };
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
    if (body.petani !== undefined) updatePayload.petani = body.petani;
    if (body.petaniKode !== undefined) updatePayload.petaniKode = body.petaniKode;
    if (body.noLot !== undefined) updatePayload.noLot = body.noLot;
    if (body.gudangBahanId !== undefined) updatePayload.gudangBahanId = body.gudangBahanId;
    if (body.alatSortasi) updatePayload.alatSortasi = body.alatSortasi;

    if (body.beratMasuk !== undefined) updatePayload.beratMasuk = parseFloat(String(body.beratMasuk)) || 0;
    if (body.hasilLulus !== undefined || body.beratLolos !== undefined) {
      updatePayload.hasilLulus = parseFloat(String(body.hasilLulus !== undefined ? body.hasilLulus : body.beratLolos)) || 0;
    }
    if (body.hasilTolak !== undefined || body.beratReject !== undefined) {
      updatePayload.hasilTolak = parseFloat(String(body.hasilTolak !== undefined ? body.hasilTolak : body.beratReject)) || 0;
    }

    const bMasuk = updatePayload.beratMasuk !== undefined ? updatePayload.beratMasuk : existing.beratMasuk;
    const hLulus = updatePayload.hasilLulus !== undefined ? updatePayload.hasilLulus : existing.hasilLulus;
    if (bMasuk > 0 && hLulus > 0) {
      updatePayload.recovery = parseFloat(((hLulus / bMasuk) * 100).toFixed(1));
    }

    if (body.tanggalSortasi) updatePayload.tanggalSortasi = body.tanggalSortasi;
    if (body.status) updatePayload.status = body.status;
    if (body.lokasi) updatePayload.lokasi = body.lokasi;
    if (body.operator) updatePayload.operator = body.operator;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;
    if (body.rincianReject) updatePayload.rincianReject = body.rincianReject;
    if (body.dokumentasi) updatePayload.dokumentasi = body.dokumentasi;

    const updated = await sortasiRepository.update(existing.id, updatePayload);

    // Jika status sortasi berubah, perbarui status di Gudang Bahan Mentah
    if (body.status || existing.status) {
      const currentStatus = body.status || existing.status;
      const targetLot = updatePayload.noLot || existing.noLot;
      const targetGudangId = updatePayload.gudangBahanId || existing.gudangBahanId;
      await updateGudangBahanMentahStatus(targetLot, targetGudangId, currentStatus, existing.kodeBatch);
    }

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
    const { id } = req.params as { id: string };
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

    // Jika terkait gudang bahan, kembalikan statusnya
    if (existing.noLot || existing.gudangBahanId) {
      await revertGudangBahanMentahStatus(existing.noLot, existing.gudangBahanId);
    }

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

/**
 * Helper untuk memperbarui status Gudang Bahan Mentah
 * - Jika status 'Proses' -> Gudang Bahan Mentah menjadi 'Proses Sortasi'
 * - Jika status 'Selesai' -> Gudang Bahan Mentah menjadi 'Sudah Sortasi'
 */
const updateGudangBahanMentahStatus = async (
  noLot?: string,
  gudangBahanId?: string,
  sortasiStatus?: string,
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

    const isSelesai = sortasiStatus === 'Selesai';
    const targetStatus = isSelesai ? 'Sudah Sortasi' : 'Proses Sortasi';

    // Parse and update riwayatFlow
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

    const sortasiIdx = flow.findIndex((f: any) => f.tahap === 'Sortasi');
    const sortasiStep = {
      tahap: 'Sortasi',
      status: isSelesai ? 'completed' : 'in_progress',
      tanggal: new Date().toISOString(),
      keterangan: isSelesai
        ? `Selesai Sortasi (${kodeBatch || 'SO'})`
        : `Sedang Proses Sortasi (${kodeBatch || 'SO'})`,
    };

    if (sortasiIdx >= 0) {
      flow[sortasiIdx] = sortasiStep;
    } else {
      flow.push(sortasiStep);
    }

    await (prisma as any).gudangBahanBelumDiproses.update({
      where: { id: gudangItem.id },
      data: {
        status: targetStatus,
        riwayatFlow: flow,
      },
    });
  } catch (err) {
    console.error('Error updating Gudang Bahan Mentah status:', err);
  }
};

const revertGudangBahanMentahStatus = async (noLot?: string, gudangBahanId?: string) => {
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

    if (gudangItem) {
      await (prisma as any).gudangBahanBelumDiproses.update({
        where: { id: gudangItem.id },
        data: {
          status: 'Bahan Belum Diproses',
        },
      });
    }
  } catch (err) {
    console.error('Error reverting Gudang Bahan Mentah status:', err);
  }
};

const seedInitialSortasi = async (forceClean: boolean = false) => {
  if (forceClean) {
    await (prisma as any).sortasi.deleteMany({});
  }

  const initialData = [
    {
      no: 1,
      kodeBatch: 'SO-2026-06-001',
      tanggalSortasi: '28 Jun 2026',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      noLot: 'LOT-2026-00021',
      beratMasuk: 500,
      hasilLulus: 460,
      hasilTolak: 40,
      recovery: 92.0,
      status: 'Selesai',
      operator: 'Siti Nurhayati',
      lokasi: 'Ruang Sortasi Unit 1',
      alatSortasi: 'Screen Separator M-01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 18, persentase: 3.6 },
        { jenis: 'Ukuran < standar', berat: 12, persentase: 2.4 },
        { jenis: 'Kerusakan fisik', berat: 7, persentase: 1.4 },
        { jenis: 'Lainnya', berat: 3, persentase: 0.6 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 2,
      kodeBatch: 'SO-2026-06-002',
      tanggalSortasi: '27 Jun 2026',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      petani: 'Siti Rahayu',
      petaniKode: 'SRN-002',
      noLot: 'LOT-2026-00022',
      beratMasuk: 300,
      hasilLulus: 270,
      hasilTolak: 30,
      recovery: 90.0,
      status: 'Selesai',
      operator: 'Ahmad Fauzi',
      lokasi: 'Ruang Sortasi Unit 2',
      alatSortasi: 'Air Screen Cleaner 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 14, persentase: 4.7 },
        { jenis: 'Ukuran < standar', berat: 9, persentase: 3.0 },
        { jenis: 'Kerusakan fisik', berat: 5, persentase: 1.7 },
        { jenis: 'Lainnya', berat: 2, persentase: 0.6 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 3,
      kodeBatch: 'SO-2026-06-003',
      tanggalSortasi: '25 Jun 2026',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      petani: 'Agus Setiawan',
      petaniKode: 'AGS-003',
      noLot: 'LOT-2026-00023',
      beratMasuk: 800,
      hasilLulus: 740,
      hasilTolak: 60,
      recovery: 92.5,
      status: 'Selesai',
      operator: 'Siti Nurhayati',
      lokasi: 'Ruang Sortasi Unit 1',
      alatSortasi: 'Gravity Separator 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 28, persentase: 3.5 },
        { jenis: 'Ukuran < standar', berat: 18, persentase: 2.25 },
        { jenis: 'Kerusakan fisik', berat: 10, persentase: 1.25 },
        { jenis: 'Lainnya', berat: 4, persentase: 0.5 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 4,
      kodeBatch: 'SO-2026-06-004',
      tanggalSortasi: '24 Jun 2026',
      komoditas: 'Tomat',
      varietas: 'Grand Rapids',
      petani: 'Dewi Lestari',
      petaniKode: 'DLR-004',
      noLot: 'LOT-2026-00024',
      beratMasuk: 400,
      hasilLulus: 360,
      hasilTolak: 40,
      recovery: 90.0,
      status: 'Selesai',
      operator: 'Bambang S.',
      lokasi: 'Ruang Sortasi Unit 2',
      alatSortasi: 'Air Screen Cleaner 02',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 18, persentase: 4.5 },
        { jenis: 'Ukuran < standar', berat: 12, persentase: 3.0 },
        { jenis: 'Kerusakan fisik', berat: 7, persentase: 1.75 },
        { jenis: 'Lainnya', berat: 3, persentase: 0.75 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 5,
      kodeBatch: 'SO-2026-06-005',
      tanggalSortasi: '22 Jun 2026',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      noLot: 'LOT-2026-00025',
      beratMasuk: 600,
      hasilLulus: 560,
      hasilTolak: 40,
      recovery: 93.3,
      status: 'Selesai',
      operator: 'Siti Nurhayati',
      lokasi: 'Ruang Sortasi Unit 1',
      alatSortasi: 'Color Sorter 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 16, persentase: 2.7 },
        { jenis: 'Ukuran < standar', berat: 14, persentase: 2.3 },
        { jenis: 'Kerusakan fisik', berat: 7, persentase: 1.2 },
        { jenis: 'Lainnya', berat: 3, persentase: 0.5 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 6,
      kodeBatch: 'SO-2026-06-006',
      tanggalSortasi: '20 Jun 2026',
      komoditas: 'Cabai',
      varietas: 'Cabai Rawit',
      petani: 'Rini Wulandari',
      petaniKode: 'RW-005',
      noLot: 'LOT-2026-00026',
      beratMasuk: 350,
      hasilLulus: 310,
      hasilTolak: 40,
      recovery: 88.6,
      status: 'Proses',
      operator: 'Ahmad Fauzi',
      lokasi: 'Ruang Sortasi Unit 3',
      alatSortasi: 'Screen Separator M-02',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 18, persentase: 5.1 },
        { jenis: 'Ukuran < standar', berat: 12, persentase: 3.4 },
        { jenis: 'Kerusakan fisik', berat: 6, persentase: 1.7 },
        { jenis: 'Lainnya', berat: 4, persentase: 1.2 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 7,
      kodeBatch: 'SO-2026-06-007',
      tanggalSortasi: '18 Jun 2026',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      petani: 'Endang Sulastri',
      petaniKode: 'ENS-007',
      noLot: 'LOT-2026-00027',
      beratMasuk: 700,
      hasilLulus: 650,
      hasilTolak: 50,
      recovery: 92.9,
      status: 'Selesai',
      operator: 'Bambang S.',
      lokasi: 'Ruang Sortasi Unit 1',
      alatSortasi: 'Gravity Separator 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 22, persentase: 3.1 },
        { jenis: 'Ukuran < standar', berat: 15, persentase: 2.1 },
        { jenis: 'Kerusakan fisik', berat: 9, persentase: 1.3 },
        { jenis: 'Lainnya', berat: 4, persentase: 0.6 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 8,
      kodeBatch: 'SO-2026-06-008',
      tanggalSortasi: '15 Jun 2026',
      komoditas: 'Tomat',
      varietas: 'Grand Rapids',
      petani: 'Tono Setiawan',
      petaniKode: 'TSW-009',
      noLot: 'LOT-2026-00028',
      beratMasuk: 450,
      hasilLulus: 410,
      hasilTolak: 40,
      recovery: 91.1,
      status: 'Selesai',
      operator: 'Dewi Lestari',
      lokasi: 'Ruang Sortasi Unit 2',
      alatSortasi: 'Air Screen Cleaner 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 17, persentase: 3.8 },
        { jenis: 'Ukuran < standar', berat: 13, persentase: 2.9 },
        { jenis: 'Kerusakan fisik', berat: 7, persentase: 1.5 },
        { jenis: 'Lainnya', berat: 3, persentase: 0.7 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 9,
      kodeBatch: 'SO-2026-06-009',
      tanggalSortasi: '12 Jun 2026',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      petani: 'Slamet Riyadi',
      petaniKode: 'SRM-006',
      noLot: 'LOT-2026-00029',
      beratMasuk: 550,
      hasilLulus: 500,
      hasilTolak: 50,
      recovery: 90.9,
      status: 'Selesai',
      operator: 'Siti Nurhayati',
      lokasi: 'Ruang Sortasi Unit 1',
      alatSortasi: 'Screen Separator M-01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 21, persentase: 3.8 },
        { jenis: 'Ukuran < standar', berat: 16, persentase: 2.9 },
        { jenis: 'Kerusakan fisik', berat: 9, persentase: 1.6 },
        { jenis: 'Lainnya', berat: 4, persentase: 0.7 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 10,
      kodeBatch: 'SO-2026-06-010',
      tanggalSortasi: '10 Jun 2026',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      petani: 'Tari',
      petaniKode: 'TRI-010',
      noLot: 'LOT-2026-00030',
      beratMasuk: 300,
      hasilLulus: 270,
      hasilTolak: 30,
      recovery: 90.0,
      status: 'Selesai',
      operator: 'Ahmad Fauzi',
      lokasi: 'Ruang Sortasi Unit 3',
      alatSortasi: 'Air Screen Cleaner 02',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 13, persentase: 4.3 },
        { jenis: 'Ukuran < standar', berat: 9, persentase: 3.0 },
        { jenis: 'Kerusakan fisik', berat: 5, persentase: 1.7 },
        { jenis: 'Lainnya', berat: 3, persentase: 1.0 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 11,
      kodeBatch: 'SO-2026-06-011',
      tanggalSortasi: '08 Jun 2026',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      petani: 'Agus Setiawan',
      petaniKode: 'AGS-003',
      noLot: 'LOT-2026-00031',
      beratMasuk: 650,
      hasilLulus: 600,
      hasilTolak: 50,
      recovery: 92.3,
      status: 'Selesai',
      operator: 'Slamet Riyadi',
      lokasi: 'Ruang Sortasi Unit 1',
      alatSortasi: 'Gravity Separator 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 23, persentase: 3.5 },
        { jenis: 'Ukuran < standar', berat: 15, persentase: 2.3 },
        { jenis: 'Kerusakan fisik', berat: 8, persentase: 1.2 },
        { jenis: 'Lainnya', berat: 4, persentase: 0.6 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=500&auto=format&fit=crop&q=60',
      ],
    },
    {
      no: 12,
      kodeBatch: 'SO-2026-06-012',
      tanggalSortasi: '05 Jun 2026',
      komoditas: 'Kangkung',
      varietas: 'Kangkung Super',
      petani: 'Joko Susilo',
      petaniKode: 'JKS-010',
      noLot: 'LOT-2026-00032',
      beratMasuk: 400,
      hasilLulus: 370,
      hasilTolak: 30,
      recovery: 92.5,
      status: 'Selesai',
      operator: 'Dewi Lestari',
      lokasi: 'Ruang Sortasi Unit 2',
      alatSortasi: 'Air Screen Cleaner 01',
      rincianReject: [
        { jenis: 'Benih hampa', berat: 14, persentase: 3.5 },
        { jenis: 'Ukuran < standar', berat: 9, persentase: 2.25 },
        { jenis: 'Kerusakan fisik', berat: 5, persentase: 1.25 },
        { jenis: 'Lainnya', berat: 2, persentase: 0.5 },
      ],
      dokumentasi: [
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
      ],
    },
  ];

  for (const item of initialData) {
    await sortasiRepository.create(item as any);
    // Sinkronisasi status di Gudang Bahan Mentah untuk data awal
    await updateGudangBahanMentahStatus(item.noLot, undefined, item.status, item.kodeBatch);
  }
};
