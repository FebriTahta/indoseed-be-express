import { Request, Response } from 'express';
import { panenRepository } from '../repositories/panen.repository';
import prisma from '../utils/prisma';

const validateForeignKey = async (modelName: 'commodity' | 'variety' | 'kesiapanPanen' | 'jadwalTanam', id: any): Promise<string | undefined> => {
  if (!id || typeof id !== 'string' || !id.trim()) return undefined;
  const cleanId = id.trim();
  try {
    const existing = await (prisma as any)[modelName].findUnique({ where: { id: cleanId } });
    return existing ? cleanId : undefined;
  } catch (e) {
    return undefined;
  }
};

export const getPanens = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      komoditas,
      varietas,
      status,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const filters = {
      search: search ? String(search) : undefined,
      komoditas: komoditas ? String(komoditas) : undefined,
      varietas: varietas ? String(varietas) : undefined,
      status: status ? String(status) : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
      skip,
      take,
    };

    // Auto-seed if empty
    const totalCount = await panenRepository.countAll();
    if (totalCount === 0) {
      await seedInitialPanens();
    }

    const { data, total } = await panenRepository.findAll(filters);
    const stats = await panenRepository.getStats();

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
    console.error('Error fetching Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const getPanenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let item = await panenRepository.findById(id);
    if (!item) {
      item = await panenRepository.findByKode(id);
    }

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Data panen tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching Panen by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const createPanen = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const totalCount = await panenRepository.countAll();
    const nextSeq = totalCount + 1;
    const kodePanen = body.kodePanen || `PN-2606-${String(nextSeq).padStart(4, '0')}`;

    const validJadwalTanamId = await validateForeignKey('jadwalTanam', body.jadwalTanamId);
    const validKesiapanPanenId = await validateForeignKey('kesiapanPanen', body.kesiapanPanenId || body.kesiapanLahanId);
    const validCommodityId = await validateForeignKey('commodity', body.commodityId || body.komoditasId);
    const validVarietyId = await validateForeignKey('variety', body.varietyId || body.varietasId);

    const newPanen = await panenRepository.create({
      kodePanen,
      jadwalTanamId: validJadwalTanamId,
      kesiapanPanenId: validKesiapanPanenId,
      commodityId: validCommodityId,
      varietyId: validVarietyId,
      kesiapanLahanId: validKesiapanPanenId,
      komoditas: body.komoditas || 'Padi',
      varietas: body.varietas || 'Inpari 32',
      lahan: body.lahan || 'Lahan A1 - Blok 01',
      tanggalPanen: body.tanggalPanen ? new Date(body.tanggalPanen) : new Date(),
      luasHa: parseFloat(String(body.luasHa || '0').replace(',', '.')) || 0,
      produksiKg: parseFloat(String(body.produksiKg || '0').replace(',', '.')) || 0,
      hasilKgHa: body.hasilKgHa ? parseFloat(String(body.hasilKgHa).replace(',', '.')) : undefined,
      status: body.status || 'Selesai',
      penanggungJawab: body.penanggungJawab || 'Budi Santoso',
      metodePanen: body.metodePanen || 'Combine Harvester',
      produksiKotorKg: body.produksiKotorKg ? parseFloat(String(body.produksiKotorKg).replace(',', '.')) : 0,
      kadarAir: body.kadarAir ? parseFloat(String(body.kadarAir).replace(',', '.')) : 14,
      kebersihan: body.kebersihan ? parseFloat(String(body.kebersihan).replace(',', '.')) : 98,
      catatan: body.catatan || '',
      dokumen: typeof body.dokumen === 'string' ? body.dokumen : JSON.stringify(body.dokumen || []),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Data panen berhasil ditambahkan',
      data: newPanen,
    });
  } catch (error: any) {
    console.error('Error creating Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const updatePanen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await panenRepository.findById(id);
    if (!existing) {
      existing = await panenRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data panen tidak ditemukan',
      });
    }

    const body = req.body;
    const updatePayload: any = {};

    if (body.jadwalTanamId !== undefined) {
      updatePayload.jadwalTanamId = await validateForeignKey('jadwalTanam', body.jadwalTanamId);
    }
    if (body.kesiapanPanenId !== undefined || body.kesiapanLahanId !== undefined) {
      const kId = await validateForeignKey('kesiapanPanen', body.kesiapanPanenId || body.kesiapanLahanId);
      updatePayload.kesiapanPanenId = kId;
      updatePayload.kesiapanLahanId = kId;
    }
    if (body.commodityId !== undefined || body.komoditasId !== undefined) {
      updatePayload.commodityId = await validateForeignKey('commodity', body.commodityId || body.komoditasId);
    }
    if (body.varietyId !== undefined || body.varietasId !== undefined) {
      updatePayload.varietyId = await validateForeignKey('variety', body.varietyId || body.varietasId);
    }
    if (body.komoditas) updatePayload.komoditas = body.komoditas;
    if (body.varietas) updatePayload.varietas = body.varietas;
    if (body.lahan) updatePayload.lahan = body.lahan;
    if (body.tanggalPanen) updatePayload.tanggalPanen = new Date(body.tanggalPanen);
    if (body.luasHa !== undefined) updatePayload.luasHa = parseFloat(String(body.luasHa).replace(',', '.')) || 0;
    if (body.produksiKg !== undefined) updatePayload.produksiKg = parseFloat(String(body.produksiKg).replace(',', '.')) || 0;
    if (body.hasilKgHa !== undefined) updatePayload.hasilKgHa = parseFloat(String(body.hasilKgHa).replace(',', '.')) || 0;
    if (body.status) updatePayload.status = body.status;
    if (body.penanggungJawab) updatePayload.penanggungJawab = body.penanggungJawab;
    if (body.metodePanen) updatePayload.metodePanen = body.metodePanen;
    if (body.produksiKotorKg !== undefined) updatePayload.produksiKotorKg = parseFloat(String(body.produksiKotorKg).replace(',', '.')) || 0;
    if (body.kadarAir !== undefined) updatePayload.kadarAir = parseFloat(String(body.kadarAir).replace(',', '.')) || 14;
    if (body.kebersihan !== undefined) updatePayload.kebersihan = parseFloat(String(body.kebersihan).replace(',', '.')) || 98;
    if (body.catatan !== undefined) updatePayload.catatan = body.catatan;
    if (body.dokumen !== undefined) updatePayload.dokumen = typeof body.dokumen === 'string' ? body.dokumen : JSON.stringify(body.dokumen || []);

    const updated = await panenRepository.update(existing.id, updatePayload);

    return res.status(200).json({
      status: 'success',
      message: 'Data panen berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const deletePanen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await panenRepository.findById(id);
    if (!existing) {
      existing = await panenRepository.findByKode(id);
    }

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Data panen tidak ditemukan',
      });
    }

    await panenRepository.delete(existing.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data panen berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting Panen:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

// Seed 10 reference items matching user's image
const seedInitialPanens = async () => {
  const initialData = [
    {
      kodePanen: 'PN-2606-0001',
      kesiapanPanenId: 'KSP-001',
      kesiapanLahanId: 'KSL-001',
      commodityId: 'CMD-001',
      varietyId: 'VRT-001',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      lahan: 'Lahan A1 - Blok 01',
      tanggalPanen: new Date('2026-06-10'),
      luasHa: 5.00,
      produksiKg: 15250,
      hasilKgHa: 3050,
      status: 'Selesai',
      penanggungJawab: 'Budi Santoso',
      metodePanen: 'Combine Harvester',
      produksiKotorKg: 15800,
      kadarAir: 14,
      kebersihan: 98,
      dokumen: JSON.stringify([
        { nama: 'Berita Acara Panen_PN-2606-0001.pdf', url: '/sample-sop.pdf', fileType: 'application/pdf' },
        { nama: 'Foto Panen_1.jpg', url: '/sample-image.jpg', fileType: 'image/jpeg' },
        { nama: 'Foto Panen_2.jpg', url: '/sample-image2.jpg', fileType: 'image/jpeg' },
      ]),
    },
    {
      kodePanen: 'PN-2606-0002',
      komoditas: 'Jagung',
      varietas: 'Pioneer 21',
      lahan: 'Lahan B2 - Blok 02',
      tanggalPanen: new Date('2026-06-11'),
      luasHa: 4.50,
      produksiKg: 13180,
      hasilKgHa: 2929,
      status: 'Selesai',
      penanggungJawab: 'Rina Agustina',
      metodePanen: 'Manual & Thresher',
      produksiKotorKg: 13600,
      kadarAir: 15,
      kebersihan: 97,
    },
    {
      kodePanen: 'PN-2606-0003',
      komoditas: 'Kedelai',
      varietas: 'Anjasmoro',
      lahan: 'Lahan C1 - Blok 01',
      tanggalPanen: new Date('2026-06-12'),
      luasHa: 3.00,
      produksiKg: 8610,
      hasilKgHa: 2870,
      status: 'Selesai',
      penanggungJawab: 'Dedi Kurniawan',
      metodePanen: 'Manual',
      produksiKotorKg: 8900,
      kadarAir: 13,
      kebersihan: 99,
    },
    {
      kodePanen: 'PN-2606-0004',
      komoditas: 'Padi',
      varietas: 'Inpari 42',
      lahan: 'Lahan A2 - Blok 03',
      tanggalPanen: new Date('2026-06-13'),
      luasHa: 5.20,
      produksiKg: 15600,
      hasilKgHa: 3000,
      status: 'Berlangsung',
      penanggungJawab: 'Budi Santoso',
      metodePanen: 'Combine Harvester',
      produksiKotorKg: 16000,
      kadarAir: 14.5,
      kebersihan: 97.5,
    },
    {
      kodePanen: 'PN-2606-0005',
      komoditas: 'Jagung',
      varietas: 'Bisi 18',
      lahan: 'Lahan B1 - Blok 02',
      tanggalPanen: new Date('2026-06-14'),
      luasHa: 4.00,
      produksiKg: 11200,
      hasilKgHa: 2800,
      status: 'Berlangsung',
      penanggungJawab: 'Rina Agustina',
      metodePanen: 'Thresher',
      produksiKotorKg: 11500,
      kadarAir: 14,
      kebersihan: 98,
    },
    {
      kodePanen: 'PN-2606-0006',
      komoditas: 'Padi',
      varietas: 'Ciherang',
      lahan: 'Lahan A1 - Blok 02',
      tanggalPanen: new Date('2026-06-15'),
      luasHa: 4.80,
      produksiKg: 14400,
      hasilKgHa: 3000,
      status: 'Berlangsung',
      penanggungJawab: 'Budi Santoso',
      metodePanen: 'Combine Harvester',
      produksiKotorKg: 14800,
      kadarAir: 14,
      kebersihan: 98.5,
    },
    {
      kodePanen: 'PN-2606-0007',
      komoditas: 'Kacang Hijau',
      varietas: 'Vima 1',
      lahan: 'Lahan D1 - Blok 01',
      tanggalPanen: new Date('2026-06-16'),
      luasHa: 2.50,
      produksiKg: 3625,
      hasilKgHa: 1450,
      status: 'Belum Mulai',
      penanggungJawab: 'Slamet Riyadi',
      metodePanen: 'Manual',
      produksiKotorKg: 0,
      kadarAir: 0,
      kebersihan: 0,
    },
    {
      kodePanen: 'PN-2606-0008',
      komoditas: 'Kedelai',
      varietas: 'Dega 1',
      lahan: 'Lahan C2 - Blok 02',
      tanggalPanen: new Date('2026-06-18'),
      luasHa: 3.20,
      produksiKg: 0,
      hasilKgHa: 0,
      status: 'Belum Mulai',
      penanggungJawab: 'Dedi Kurniawan',
      metodePanen: 'Manual',
    },
    {
      kodePanen: 'PN-2606-0009',
      komoditas: 'Jagung',
      varietas: 'P21',
      lahan: 'Lahan B3 - Blok 01',
      tanggalPanen: new Date('2026-06-19'),
      luasHa: 4.30,
      produksiKg: 0,
      hasilKgHa: 0,
      status: 'Belum Mulai',
      penanggungJawab: 'Rina Agustina',
      metodePanen: 'Thresher',
    },
    {
      kodePanen: 'PN-2606-0010',
      komoditas: 'Padi',
      varietas: 'Inpari 32',
      lahan: 'Lahan A3 - Blok 01',
      tanggalPanen: new Date('2026-06-20'),
      luasHa: 5.00,
      produksiKg: 0,
      hasilKgHa: 0,
      status: 'Belum Mulai',
      penanggungJawab: 'Budi Santoso',
      metodePanen: 'Combine Harvester',
    },
  ];

  for (const item of initialData) {
    await panenRepository.create(item);
  }
};
