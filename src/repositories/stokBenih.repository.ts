import prisma from '../utils/prisma';

export interface CreateStokBenihInput {
  no?: number;
  produkBenih: string;
  kategoriBenih?: string;
  batchLot: string;
  tanggalProduksi: string;
  expired: string;
  gudang: string;
  stokKg: number;
  reservedKg: number;
  availableKg: number;
  dayaTumbuh: number;
  status?: string;
  keterangan?: string;
}

const getModel = () => (prisma as any).stokBenih;

export const stokBenihRepository = {
  findAll: async (filters: {
    search?: string;
    gudang?: string;
    kategoriBenih?: string;
    produkBenih?: string;
    status?: string;
    tab?: string; // 'active', 'expired', 'exp30', 'all'
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { produkBenih: { contains: filters.search } },
        { batchLot: { contains: filters.search } },
        { gudang: { contains: filters.search } },
      ];
    }

    if (filters.gudang) {
      where.gudang = filters.gudang;
    }

    if (filters.kategoriBenih) {
      where.kategoriBenih = filters.kategoriBenih;
    }

    if (filters.produkBenih) {
      where.produkBenih = filters.produkBenih;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.tab === 'active') {
      where.status = { in: ['Aman', 'Exp < 30 Hari'] };
    } else if (filters.tab === 'expired') {
      where.status = 'Expired';
    } else if (filters.tab === 'exp30') {
      where.status = 'Exp < 30 Hari';
    }

    const [data, total] = await Promise.all([
      getModel().findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        orderBy: { batchLot: 'asc' },
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

  findByBatchLot: async (batchLot: string) => {
    return getModel().findUnique({
      where: { batchLot },
    });
  },

  create: async (input: CreateStokBenihInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateStokBenihInput>) => {
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

  deleteAll: async () => {
    return getModel().deleteMany({});
  },

  countAll: async () => {
    return getModel().count();
  },

  getStats: async () => {
    const all = await getModel().findMany();
    const totalBatch = all.length;

    if (totalBatch === 0) {
      return {
        totalBatch: 0,
        totalStokKg: 0,
        totalReservedKg: 0,
        totalAvailableKg: 0,
        totalExpiredKg: 0,
        exp30Count: 0,
        avgDayaTumbuh: '0%',
        gudangBreakdown: {
          gudangA: 0,
          gudangB: 0,
          gudangC: 0,
        },
      };
    }

    const totalStokKg = all.reduce((sum: number, item: any) => sum + (item.stokKg || 0), 0);
    const totalReservedKg = all.reduce((sum: number, item: any) => sum + (item.reservedKg || 0), 0);
    const totalAvailableKg = all.reduce((sum: number, item: any) => sum + (item.availableKg || 0), 0);

    const expiredItems = all.filter((i: any) => i.status === 'Expired');
    const totalExpiredKg = expiredItems.reduce((sum: number, item: any) => sum + (item.stokKg || 0), 0);

    const exp30Count = all.filter((i: any) => i.status === 'Exp < 30 Hari').length;

    const activeItems = all.filter((i: any) => i.status !== 'Expired');
    const avgDayaTumbuh = activeItems.length > 0
      ? (activeItems.reduce((sum: number, item: any) => sum + (item.dayaTumbuh || 0), 0) / activeItems.length).toFixed(1)
      : '91.2';

    // Breakdown Gudang
    const gudangA = all.filter((i: any) => i.gudang === 'Gudang A').reduce((sum: number, i: any) => sum + (i.stokKg || 0), 0);
    const gudangB = all.filter((i: any) => i.gudang === 'Gudang B').reduce((sum: number, i: any) => sum + (i.stokKg || 0), 0);
    const gudangC = all.filter((i: any) => i.gudang === 'Gudang C').reduce((sum: number, i: any) => sum + (i.stokKg || 0), 0);

    return {
      totalBatch,
      totalStokKg,
      totalReservedKg,
      totalAvailableKg,
      totalExpiredKg,
      exp30Count,
      avgDayaTumbuh: `${avgDayaTumbuh}%`,
      gudangBreakdown: {
        gudangA,
        gudangB,
        gudangC,
      },
    };
  },
};
