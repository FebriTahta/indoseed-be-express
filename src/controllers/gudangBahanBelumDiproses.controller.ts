import { Request, Response } from 'express';
import { gudangBahanBelumDiprosesRepository } from '../repositories/gudangBahanBelumDiproses.repository';
import { panenRepository } from '../repositories/panen.repository';
import prisma from '../utils/prisma';

export const getGudangBahanList = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      status,
      lokasi,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Auto-seed if empty
    const totalCount = await gudangBahanBelumDiprosesRepository.countAll();
    if (totalCount === 0) {
      await seedInitialGudangBahan();
    }

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      status: status ? String(status) : undefined,
      lokasi: lokasi ? String(lokasi) : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
      skip,
      take,
    };

    const { data, total } = await gudangBahanBelumDiprosesRepository.findAll(filters);
    const stats = await gudangBahanBelumDiprosesRepository.getStats();

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
    console.error('Error fetching Gudang Bahan Belum Diproses:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getGudangBahanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let item = await gudangBahanBelumDiprosesRepository.findById(id);
    if (!item) {
      item = await gudangBahanBelumDiprosesRepository.findByLot(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lot gudang bahan tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Gudang Bahan by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getGudangBahanStats = async (req: Request, res: Response) => {
  try {
    const totalCount = await gudangBahanBelumDiprosesRepository.countAll();
    if (totalCount === 0) {
      await seedInitialGudangBahan();
    }
    const stats = await gudangBahanBelumDiprosesRepository.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching Gudang Bahan stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getNextLotCode = async (req: Request, res: Response) => {
  try {
    const nextCode = await gudangBahanBelumDiprosesRepository.getNextLotCode();
    return res.status(200).json({
      status: 'success',
      data: { nextLotCode: nextCode },
    });
  } catch (error: any) {
    console.error('Error getting next lot code:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getReferensiPanen = async (req: Request, res: Response) => {
  try {
    // Get list of Panen items that can be referenced for warehouse intake
    const panenList = await (prisma as any).panen.findMany({
      orderBy: { tanggalPanen: 'desc' },
      take: 50,
      select: {
        id: true,
        kodePanen: true,
        komoditas: true,
        varietas: true,
        petani: true,
        petaniKode: true,
        lahan: true,
        blokLahan: true,
        tanggalPanen: true,
        produksiKg: true,
        beratNetto: true,
        kadarAir: true,
        kondisiHasil: true,
        status: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: panenList,
    });
  } catch (error: any) {
    console.error('Error fetching referensi panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createGudangBahan = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body.sumberPanen || !body.komoditas || !body.varietas) {
      return res.status(400).json({
        status: 'error',
        message: 'Sumber panen, komoditas, dan varietas wajib diisi',
      });
    }

    const noLot = body.noLot || (await gudangBahanBelumDiprosesRepository.getNextLotCode());
    const count = await gudangBahanBelumDiprosesRepository.countAll();

    const created = await gudangBahanBelumDiprosesRepository.create({
      no: count + 1,
      noLot,
      panenId: body.panenId,
      sumberPanen: body.sumberPanen,
      komoditas: body.komoditas,
      varietas: body.varietas,
      petani: body.petani || 'Budi Santoso',
      petaniKode: body.petaniKode || 'BTN-001',
      lahan: body.lahan || 'LHN-001 / Blok 01',
      tanggalPanen: body.tanggalPanen || new Date(),
      tanggalMasuk: body.tanggalMasuk || new Date(),
      beratMasuk: parseFloat(body.beratMasuk) || 0,
      kadarAir: parseFloat(body.kadarAir) || 0,
      lokasi: body.lokasi || 'Zona A',
      lokasiDetail: body.lokasiDetail || `Gudang Produksi / ${body.lokasi || 'Zona A'}`,
      status: body.status || 'Bahan Belum Diproses',
      kondisiFisik: body.kondisiFisik || 'Baik',
      petugasPenerima: body.petugasPenerima || 'Admin Gudang',
      catatan: body.catatan,
      foto: body.foto || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    });

    // Optionally update status of related Panen
    if (body.panenId) {
      await (prisma as any).panen.update({
        where: { id: body.panenId },
        data: { statusPengolahan: 'Gudang Bahan Belum Diproses' },
      }).catch(() => {});
    }

    return res.status(201).json({
      status: 'success',
      message: 'Penerimaan bahan belum diproses berhasil disimpan',
      data: created,
    });
  } catch (error: any) {
    console.error('Error creating Gudang Bahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateGudangBahan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let existing = await gudangBahanBelumDiprosesRepository.findById(id);
    if (!existing) {
      existing = await gudangBahanBelumDiprosesRepository.findByLot(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lot tidak ditemukan',
      });
    }

    const body = req.body;
    const updateData: any = {};
    if (body.sumberPanen !== undefined) updateData.sumberPanen = body.sumberPanen;
    if (body.komoditas !== undefined) updateData.komoditas = body.komoditas;
    if (body.varietas !== undefined) updateData.varietas = body.varietas;
    if (body.petani !== undefined) updateData.petani = body.petani;
    if (body.lahan !== undefined) updateData.lahan = body.lahan;
    if (body.tanggalPanen !== undefined) updateData.tanggalPanen = body.tanggalPanen;
    if (body.tanggalMasuk !== undefined) updateData.tanggalMasuk = body.tanggalMasuk;
    if (body.beratMasuk !== undefined) updateData.beratMasuk = parseFloat(body.beratMasuk);
    if (body.kadarAir !== undefined) updateData.kadarAir = parseFloat(body.kadarAir);
    if (body.lokasi !== undefined) {
      updateData.lokasi = body.lokasi;
      updateData.lokasiDetail = `Gudang Produksi / ${body.lokasi}`;
    }
    if (body.status !== undefined) updateData.status = body.status;
    if (body.kondisiFisik !== undefined) updateData.kondisiFisik = body.kondisiFisik;
    if (body.petugasPenerima !== undefined) updateData.petugasPenerima = body.petugasPenerima;
    if (body.catatan !== undefined) updateData.catatan = body.catatan;
    if (body.foto !== undefined) updateData.foto = body.foto;

    const updated = await gudangBahanBelumDiprosesRepository.update(existing.id, updateData);

    return res.status(200).json({
      status: 'success',
      message: 'Data lot berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Gudang Bahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deleteGudangBahan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    let existing = await gudangBahanBelumDiprosesRepository.findById(id);
    if (!existing) {
      existing = await gudangBahanBelumDiprosesRepository.findByLot(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lot tidak ditemukan',
      });
    }

    await gudangBahanBelumDiprosesRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data lot berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Gudang Bahan:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updateStatusGudangBahan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status baru wajib diisi',
      });
    }

    let existing = await gudangBahanBelumDiprosesRepository.findById(id);
    if (!existing) {
      existing = await gudangBahanBelumDiprosesRepository.findByLot(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data lot tidak ditemukan',
      });
    }

    const updated = await gudangBahanBelumDiprosesRepository.update(existing.id, { status });

    return res.status(200).json({
      status: 'success',
      message: `Status berhasil diubah menjadi ${status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const seedInitialGudangBahan = async () => {
  const initialData = [
    {
      no: 1,
      noLot: 'LOT-2026-00021',
      sumberPanen: 'PN-2026-0007',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      lahan: 'LHN-001 / Blok 01',
      tanggalPanen: new Date('2026-06-02'),
      tanggalMasuk: new Date('2026-06-03'),
      beratMasuk: 850,
      kadarAir: 28.5,
      lokasi: 'Zona A',
      lokasiDetail: 'Gudang Produksi / Zona A',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
      foto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    },
    {
      no: 2,
      noLot: 'LOT-2026-00022',
      sumberPanen: 'PN-2026-0008',
      komoditas: 'Cabai',
      varietas: 'Cabai Keriting',
      petani: 'Siti Rahayu',
      petaniKode: 'SRN-002',
      lahan: 'LHN-002 / Blok 02',
      tanggalPanen: new Date('2026-06-04'),
      tanggalMasuk: new Date('2026-06-05'),
      beratMasuk: 620,
      kadarAir: 26.7,
      lokasi: 'Zona A',
      lokasiDetail: 'Gudang Produksi / Zona A',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 3,
      noLot: 'LOT-2026-00023',
      sumberPanen: 'PN-2026-0009',
      komoditas: 'Tomat',
      varietas: 'Grand Rapids',
      petani: 'Ahmad Dahlan',
      petaniKode: 'AD-003',
      lahan: 'LHN-003 / Blok Barat',
      tanggalPanen: new Date('2026-06-05'),
      tanggalMasuk: new Date('2026-06-06'),
      beratMasuk: 1200,
      kadarAir: 30.1,
      lokasi: 'Zona B',
      lokasiDetail: 'Gudang Produksi / Zona B',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Sangat Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 4,
      noLot: 'LOT-2026-00024',
      sumberPanen: 'PN-2026-0010',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      petani: 'Agus Setiawan',
      petaniKode: 'AGS-004',
      lahan: 'LHN-004 / Blok Sawah 2',
      tanggalPanen: new Date('2026-06-07'),
      tanggalMasuk: new Date('2026-06-08'),
      beratMasuk: 980,
      kadarAir: 25.6,
      lokasi: 'Zona C',
      lokasiDetail: 'Gudang Produksi / Zona C',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 5,
      noLot: 'LOT-2026-00025',
      sumberPanen: 'PN-2026-0011',
      komoditas: 'Melon',
      varietas: 'Melon Tere F1',
      petani: 'Dewi Lestari',
      petaniKode: 'DWL-005',
      lahan: 'LHN-005 / Blok 03',
      tanggalPanen: new Date('2026-06-09'),
      tanggalMasuk: new Date('2026-06-10'),
      beratMasuk: 750,
      kadarAir: 29.8,
      lokasi: 'Zona A',
      lokasiDetail: 'Gudang Produksi / Zona A',
      status: 'Dalam Pengeringan',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 6,
      noLot: 'LOT-2026-00026',
      sumberPanen: 'PN-2026-0012',
      komoditas: 'Cabai',
      varietas: 'Rawit',
      petani: 'Rini Wulandari',
      petaniKode: 'RW-006',
      lahan: 'LHN-006 / Blok 04',
      tanggalPanen: new Date('2026-06-11'),
      tanggalMasuk: new Date('2026-06-12'),
      beratMasuk: 540,
      kadarAir: 27.2,
      lokasi: 'Zona B',
      lokasiDetail: 'Gudang Produksi / Zona B',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 7,
      noLot: 'LOT-2026-00027',
      sumberPanen: 'PN-2026-0013',
      komoditas: 'Tomat',
      varietas: 'TSW-009',
      petani: 'Hendra Wijaya',
      petaniKode: 'HW-007',
      lahan: 'LHN-007 / Blok 05',
      tanggalPanen: new Date('2026-06-13'),
      tanggalMasuk: new Date('2026-06-14'),
      beratMasuk: 1100,
      kadarAir: 28.9,
      lokasi: 'Zona C',
      lokasiDetail: 'Gudang Produksi / Zona C',
      status: 'Dalam Pengeringan',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 8,
      noLot: 'LOT-2026-00028',
      sumberPanen: 'PN-2026-0014',
      komoditas: 'Kangkung',
      varietas: 'Bima',
      petani: 'Supriyanto',
      petaniKode: 'SUP-008',
      lahan: 'LHN-008 / Blok Timur',
      tanggalPanen: new Date('2026-06-15'),
      tanggalMasuk: new Date('2026-06-16'),
      beratMasuk: 670,
      kadarAir: 25.4,
      lokasi: 'Zona A',
      lokasiDetail: 'Gudang Produksi / Zona A',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Sangat Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 9,
      noLot: 'LOT-2026-00029',
      sumberPanen: 'PN-2026-0015',
      komoditas: 'Selada',
      varietas: 'Grand Rapids',
      petani: 'Fajar Ramadhan',
      petaniKode: 'FJR-009',
      lahan: 'LHN-009 / GreenHouse 01',
      tanggalPanen: new Date('2026-06-17'),
      tanggalMasuk: new Date('2026-06-18'),
      beratMasuk: 420,
      kadarAir: 24.7,
      lokasi: 'Zona B',
      lokasiDetail: 'Gudang Produksi / Zona B',
      status: 'Dalam Pengeringan',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 10,
      noLot: 'LOT-2026-00030',
      sumberPanen: 'PN-2026-0016',
      komoditas: 'Cabai',
      varietas: 'Keriting',
      petani: 'Joko Susilo',
      petaniKode: 'JKS-010',
      lahan: 'LHN-010 / Blok Selatan',
      tanggalPanen: new Date('2026-06-19'),
      tanggalMasuk: new Date('2026-06-20'),
      beratMasuk: 780,
      kadarAir: 26.3,
      lokasi: 'Zona C',
      lokasiDetail: 'Gudang Produksi / Zona C',
      status: 'Bahan Belum Diproses',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 11,
      noLot: 'LOT-2026-00031',
      sumberPanen: 'PN-2026-0017',
      komoditas: 'Melon',
      varietas: 'Melon Action 434',
      petani: 'Budi Santoso',
      petaniKode: 'BTN-001',
      lahan: 'LHN-001 / Blok 02',
      tanggalPanen: new Date('2026-06-21'),
      tanggalMasuk: new Date('2026-06-22'),
      beratMasuk: 700,
      kadarAir: 28.0,
      lokasi: 'Zona A',
      lokasiDetail: 'Gudang Produksi / Zona A',
      status: 'Dalam Pengeringan',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
    {
      no: 12,
      noLot: 'LOT-2026-00032',
      sumberPanen: 'PN-2026-0018',
      komoditas: 'Tomat',
      varietas: 'Servo F1',
      petani: 'Ahmad Dahlan',
      petaniKode: 'AD-003',
      lahan: 'LHN-003 / Blok Timur',
      tanggalPanen: new Date('2026-06-23'),
      tanggalMasuk: new Date('2026-06-24'),
      beratMasuk: 640,
      kadarAir: 29.0,
      lokasi: 'Zona B',
      lokasiDetail: 'Gudang Produksi / Zona B',
      status: 'Menunggu Sortasi',
      kondisiFisik: 'Baik',
      petugasPenerima: 'Admin Gudang',
    },
  ];

  for (const item of initialData) {
    await gudangBahanBelumDiprosesRepository.create(item as any);
  }
};
