import prisma from '../utils/prisma';

export interface CreateMonitoringGreenhouseInput {
  no?: number;
  kodeGreenhouse: string;
  lokasi: string;
  komoditas: string;
  varietas: string;
  luas: number;
  status?: string;
  kondisi?: string;
  aktivitasTerakhir?: string;
  suhuRataRata?: number;
  kelembapanRata?: number;
  intensitasCahaya?: number;
  phAirIrigasi?: number;
  catatan?: string;
}

const getModel = () => (prisma as any).monitoringGreenhouse;

export const monitoringGreenhouseRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    lokasi?: string;
    status?: string;
    kondisi?: string;
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { kodeGreenhouse: { contains: filters.search } },
        { lokasi: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
      ];
    }

    if (filters.komoditas) {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas) {
      where.varietas = filters.varietas;
    }

    if (filters.lokasi) {
      where.lokasi = { contains: filters.lokasi };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.kondisi) {
      where.kondisi = filters.kondisi;
    }

    const [data, total] = await Promise.all([
      getModel().findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        orderBy: { kodeGreenhouse: 'asc' },
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

  findByKode: async (kodeGreenhouse: string) => {
    return getModel().findUnique({
      where: { kodeGreenhouse },
    });
  },

  create: async (input: CreateMonitoringGreenhouseInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateMonitoringGreenhouseInput>) => {
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
    const totalUnit = all.length;

    const aktifCount = all.filter((i: any) => i.status === 'Aktif').length;
    const produksiCount = all.filter((i: any) => i.status === 'Dalam Produksi' || i.status === 'Aktif').length;

    const baikCount = all.filter((i: any) => i.kondisi === 'Baik').length;
    const perhatianCount = all.filter((i: any) => i.kondisi === 'Perlu Perhatian').length;
    const burukCount = all.filter((i: any) => i.kondisi === 'Buruk').length;
    const tidakAktifCount = all.filter((i: any) => i.status === 'Tidak Aktif' || i.kondisi === 'Tidak Aktif').length;

    return {
      totalUnit,
      aktifCount,
      produksiCount,
      baikCount,
      perhatianCount,
      burukCount,
      tidakAktifCount,
    };
  },
};
