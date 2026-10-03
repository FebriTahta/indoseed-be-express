import { Request, Response } from 'express';

// In-memory mock data for PerencanaanProduksi since Prisma model doesn't exist yet
const mockPerencanaanProduksi = [
  {
    id: "1",
    noPerencanaan: "PRN-2026-001",
    commodityId: null,
    komoditas: "Padi",
    varietyId: null,
    varietas: "IR64",
    targetProduksi: 15000,
    aktualProduksi: 12000,
    produksiTerpenuhi: 80,
    targetLuasLahan: 2,
    lahanTersedia: 2,
    realisasiTanam: 1.8,
    periode: "Okt - Des 2026",
    periodeMulai: "2026-10-01",
    periodeSelesai: "2026-12-31",
    metodeTanam: "Pindah Tanam",
    kebutuhanBenih: 50,
    estimasiHasilPerHa: 7500,
    status: "Proses",
    catatan: "Berjalan lancar",
    estimasiPanen: "2026-12-15",
    dibuatOleh: "Admin",
    diubahOleh: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const getPerencanaanProduksis = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: mockPerencanaanProduksi,
      meta: {
        total: mockPerencanaanProduksi.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerencanaanProduksiById = async (req: Request, res: Response) => {
  try {
    const data = mockPerencanaanProduksi.find(p => p.id === req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerencanaanStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      totalRencana: 5,
      totalTargetProduksi: 50000,
      totalAktualProduksi: 35000,
      totalKebutuhanBenih: 200,
      totalLuasLahan: 10,
      jumlahPetani: 8,
      persenTerpenuhiRataRata: 70
    };
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ success: true, data: req.body, message: 'Mock created' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, data: req.body, message: 'Mock updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePerencanaanProduksi = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, message: 'Mock deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerencanaanProduksiList = getPerencanaanProduksis;
export const getPerencanaanProduksiStats = getPerencanaanStats;

