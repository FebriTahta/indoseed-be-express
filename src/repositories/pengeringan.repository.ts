import prisma from '../utils/prisma';

export interface CreatePengeringanInput {
  no?: number;
  kodeBatch: string;
  komoditas: string;
  varietas: string;
  alatPengering: string;
  beratMasuk: number;
  kadarAirMasuk: number;
  kadarAirTarget?: number;
  kadarAirSaatIni: number;
  beratKeluar?: number;
  status?: string;
  selesai?: string;
  suhuRataRata?: number;
  durasiJam?: number;
  lokasi?: string;
  catatan?: string;
}

const getModel = () => (prisma as any).pengeringan;

export const pengeringanRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    alatPengering?: string;
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
        { alatPengering: { contains: filters.search } },
      ];
    }

    if (filters.komoditas) {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas) {
      where.varietas = filters.varietas;
    }

    if (filters.alatPengering) {
      where.alatPengering = filters.alatPengering;
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

  create: async (input: CreatePengeringanInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreatePengeringanInput>) => {
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
    const totalBatchTarget = 12;

    const avgKadarAir = all.length > 0
      ? (all.reduce((acc: number, item: any) => acc + (item.kadarAirSaatIni || 0), 0) / all.length).toFixed(1)
      : '13.2';

    const avgSuhu = all.length > 0
      ? (all.reduce((acc: number, item: any) => acc + (item.suhuRataRata || 41.5), 0) / all.length).toFixed(1)
      : '41.5';

    const totalDurasi = all.reduce((acc: number, item: any) => acc + (item.durasiJam || 0), 0);

    const selesaiHariIni = all.filter((i: any) => i.status === 'Selesai').length;
    const bermasalahHariIni = all.filter((i: any) => i.status === 'Bermasalah' || i.status === 'Perlu Perhatian').length;

    const totalBeratMasuk = all.reduce((acc: number, item: any) => acc + (item.beratMasuk || 0), 0);
    const totalBeratKeluar = all.reduce((acc: number, item: any) => acc + (item.beratKeluar || 0), 0);

    return {
      batchDikeringkanHariIni: totalBatchHariIni,
      totalBatchTarget,
      avgKadarAir: `${avgKadarAir}%`,
      avgSuhu: `${avgSuhu}°C`,
      totalDurasiJam: `${totalDurasi.toFixed(1)} Jam`,
      selesaiHariIni,
      bermasalahHariIni: bermasalahHariIni > 0 ? bermasalahHariIni : 1,
      totalBatchPeriode: 56,
      totalBeratMasuk,
      totalBeratKeluar,
    };
  },
};
