import prisma from '../utils/prisma';

export interface CreatePanenInput {
  kodePanen?: string;
  jadwalTanamId?: string;
  kesiapanPanenId?: string;
  commodityId?: string;
  varietyId?: string;
  kesiapanLahanId?: string;
  komoditas: string;
  varietas: string;
  lahan: string;
  tanggalPanen: Date;
  luasHa: number;
  produksiKg: number;
  hasilKgHa?: number;
  status?: string;
  penanggungJawab?: string;
  metodePanen?: string;
  produksiKotorKg?: number;
  kadarAir?: number;
  kebersihan?: number;
  catatan?: string;
  dokumen?: string;
}

const getModel = () => (prisma as any).panen;

export const panenRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { kodePanen: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
        { lahan: { contains: filters.search } },
        { penanggungJawab: { contains: filters.search } },
      ];
    }

    if (filters.komoditas && filters.komoditas !== 'Semua Komoditas') {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas && filters.varietas !== 'Semua Varietas') {
      where.varietas = filters.varietas;
    }

    if (filters.status && filters.status !== 'Semua Status') {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.tanggalPanen = {};
      if (filters.startDate) where.tanggalPanen.gte = filters.startDate;
      if (filters.endDate) where.tanggalPanen.lte = filters.endDate;
    }

    const [data, total] = await Promise.all([
      getModel().findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        orderBy: { tanggalPanen: 'desc' },
      }),
      getModel().count({ where }),
    ]);

    return { data, total };
  },

  findById: async (id: string) => {
    return getModel().findUnique({
      where: { id },
    });
  },

  findByKode: async (kodePanen: string) => {
    return getModel().findUnique({
      where: { kodePanen },
    });
  },

  create: async (input: CreatePanenInput) => {
    const luas = input.luasHa || 0;
    const prod = input.produksiKg || 0;
    const hasil = input.hasilKgHa !== undefined ? input.hasilKgHa : (luas > 0 ? parseFloat((prod / luas).toFixed(2)) : 0);

    return getModel().create({
      data: {
        ...input,
        hasilKgHa: hasil,
      },
    });
  },

  update: async (id: string, input: Partial<CreatePanenInput>) => {
    const existing = await getModel().findUnique({ where: { id } });
    if (!existing) return null;

    const luas = input.luasHa !== undefined ? input.luasHa : existing.luasHa;
    const prod = input.produksiKg !== undefined ? input.produksiKg : existing.produksiKg;
    const hasil = input.hasilKgHa !== undefined ? input.hasilKgHa : (luas > 0 ? parseFloat((prod / luas).toFixed(2)) : 0);

    return getModel().update({
      where: { id },
      data: {
        ...input,
        hasilKgHa: hasil,
      },
    });
  },

  delete: async (id: string) => {
    return getModel().delete({
      where: { id },
    });
  },

  countAll: async () => {
    return getModel().count();
  },

  getStats: async () => {
    const all = await getModel().findMany();
    const totalLuas = all.reduce((sum: number, item: any) => sum + (item.luasHa || 0), 0);
    const totalProduksi = all.reduce((sum: number, item: any) => sum + (item.produksiKg || 0), 0);
    const rataHasil = totalLuas > 0 ? Math.round(totalProduksi / totalLuas) : 0;

    const selesaiCount = all.filter((item: any) => item.status === 'Selesai').length;
    const berlangsungCount = all.filter((item: any) => item.status === 'Berlangsung' || item.status === 'Sedang Berlangsung').length;
    const belumMulaiCount = all.filter((item: any) => item.status === 'Belum Mulai').length;

    return {
      totalPanen: all.length,
      totalLuas,
      totalProduksi,
      rataHasil,
      selesaiCount,
      berlangsungCount,
      belumMulaiCount,
    };
  },
};
