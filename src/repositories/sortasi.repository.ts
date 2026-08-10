import prisma from '../utils/prisma';

export interface CreateSortasiInput {
  no?: number;
  kodeBatch: string;
  komoditas: string;
  varietas: string;
  alatSortasi: string;
  beratMasuk: number;
  hasilLulus: number;
  hasilTolak: number;
  recovery: number;
  tanggalSortasi: string;
  status?: string;
  lokasi?: string;
  operator?: string;
  catatan?: string;
}

const getModel = () => (prisma as any).sortasi;

export const sortasiRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    alatSortasi?: string;
    status?: string;
    lokasi?: string;
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { kodeBatch: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
        { alatSortasi: { contains: filters.search } },
      ];
    }

    if (filters.komoditas) {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas) {
      where.varietas = filters.varietas;
    }

    if (filters.alatSortasi) {
      where.alatSortasi = filters.alatSortasi;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.lokasi) {
      where.lokasi = { contains: filters.lokasi };
    }

    const [data, total] = await Promise.all([
      getModel().findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        orderBy: { kodeBatch: 'asc' },
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

  findByKode: async (kodeBatch: string) => {
    return getModel().findUnique({
      where: { kodeBatch },
    });
  },

  create: async (input: CreateSortasiInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateSortasiInput>) => {
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
    const totalBatchHariIni = all.length;

    const totalMasuk = all.reduce((acc: number, item: any) => acc + (item.beratMasuk || 0), 0);
    const totalLulus = all.reduce((acc: number, item: any) => acc + (item.hasilLulus || 0), 0);
    const totalTolak = all.reduce((acc: number, item: any) => acc + (item.hasilTolak || 0), 0);

    const avgRecovery = totalMasuk > 0 ? ((totalLulus / totalMasuk) * 100).toFixed(2) : '94.20';

    const prosesAktifCount = all.filter((i: any) => i.status === 'Proses').length;
    const selesaiCount = all.filter((i: any) => i.status === 'Selesai').length;

    return {
      totalBatchHariIni,
      totalMasukKg: totalMasuk.toLocaleString('id-ID'),
      totalLulusKg: totalLulus.toLocaleString('id-ID'),
      totalTolakKg: totalTolak.toLocaleString('id-ID'),
      avgRecovery: `${avgRecovery}%`,
      prosesAktifCount,
      selesaiCount,
    };
  },
};
