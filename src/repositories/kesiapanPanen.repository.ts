import prisma from '../utils/prisma';

// Kesiapan Panen Repository with Prisma v7 - Master ID Support
export interface CreateKesiapanPanenInput {
  no?: number;
  kodeLahan: string;
  lokasi?: string;
  komoditas?: string;
  varietas?: string;
  greenhouseId?: string;
  commodityId?: string;
  varietyId?: string;
  jadwalTanamId?: string;
  tanggalTanam?: string;
  umurHst?: number;
  prediksiPanen?: string;
  statusKesiapan?: string;
  yieldEst?: number;
  kadarAir?: number;
  kuningDaun?: number;
  kekerasanBiji?: string;
  catatan?: string;
}

const getModel = () => (prisma as any).kesiapanPanen;

export const kesiapanPanenRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    lokasi?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { kodeLahan: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
        { lokasi: { contains: filters.search } },
      ];
    }

    if (filters.komoditas) {
      where.OR = [
        { komoditas: filters.komoditas },
        { commodityId: filters.komoditas },
      ];
    }

    if (filters.varietas) {
      where.OR = [
        { varietas: filters.varietas },
        { varietyId: filters.varietas },
      ];
    }

    if (filters.lokasi) {
      where.OR = [
        { lokasi: { contains: filters.lokasi } },
        { greenhouseId: filters.lokasi },
      ];
    }

    if (filters.status) {
      where.statusKesiapan = filters.status;
    }

    const [data, total] = await Promise.all([
      getModel().findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        include: {
          greenhouse: true,
          commodity: true,
          variety: true,
        },
        orderBy: { kodeLahan: 'asc' },
      }),
      getModel().count({ where }),
    ]);

    const formattedData = data.map((item: any) => ({
      ...item,
      lokasi: item.greenhouse?.namaLahan || item.lokasi,
      komoditas: item.commodity?.namaKomoditas || item.komoditas,
      varietas: item.variety?.namaVarietas || item.varietas,
      luasHa: item.luasHa || item.greenhouse?.luas || 5.0,
    }));

    return { data: formattedData, total };
  },

  findById: async (id: string) => {
    return getModel().findUnique({
      where: { id },
    });
  },

  findByKode: async (kodeLahan: string) => {
    return getModel().findUnique({
      where: { kodeLahan },
    });
  },

  create: async (input: CreateKesiapanPanenInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateKesiapanPanenInput>) => {
    return getModel().update({
      where: { id },
      data: input,
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
    const totalLahan = all.length;

    const siapPanen = all.filter((i: any) => i.statusKesiapan === 'Siap Panen').length;
    const akanSiap3_7 = all.filter((i: any) => i.statusKesiapan === 'Akan Siap (3-7 Hari)').length;
    const akanSiap8_14 = all.filter((i: any) => i.statusKesiapan === 'Akan Siap (8-14 Hari)').length;
    const belumSiap = all.filter((i: any) => i.statusKesiapan === 'Belum Siap').length;

    const totalYield = all.reduce((acc: number, item: any) => acc + (item.yieldEst || 0), 0);
    const avgYield = totalLahan > 0 ? Math.round(totalYield / totalLahan) : 0;

    return {
      totalLahan,
      siapPanen,
      akanSiap3_7,
      akanSiap8_14,
      belumSiap,
      avgYield,
    };
  },
};
