import prisma from '../utils/prisma';

export interface CreateMonitoringLahanInput {
  kodeLahan?: string;
  lokasi: string;
  komoditas: string;
  varietas: string;
  luas: number;
  tanggalTanam?: string;
  umurHst?: string;
  kondisi?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  phTanah?: number;
  kelembapan?: number;
  suhuTanah?: number;
  nutrisiNpk?: string;
  catatan?: string;
}

const getModel = () => (prisma as any).monitoringLahan;

export const monitoringLahanRepository = {
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
        { kodeLahan: { contains: filters.search } },
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
        orderBy: { kodeLahan: 'asc' },
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

  findByKode: async (kodeLahan: string) => {
    return getModel().findUnique({
      where: { kodeLahan },
    });
  },

  create: async (input: CreateMonitoringLahanInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateMonitoringLahanInput>) => {
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
    const totalLuas = all.reduce((acc: number, item: any) => acc + (item.luas || 0), 0);

    const kondisiBaik = all.filter((i: any) => i.kondisi === 'Baik').length;
    const kondisiPerhatian = all.filter((i: any) => i.kondisi === 'Perlu Perhatian').length;
    const kondisiBuruk = all.filter((i: any) => i.kondisi === 'Buruk').length;
    const kondisiBelumTanam = all.filter((i: any) => i.kondisi === 'Belum Tanam').length;

    const statusAktif = all.filter((i: any) => i.status === 'Aktif').length;
    const statusRencana = all.filter((i: any) => i.status === 'Rencana').length;

    return {
      totalLahan: all.length,
      totalLuas,
      kondisiBaik,
      kondisiPerhatian,
      kondisiBuruk,
      kondisiBelumTanam,
      statusAktif,
      statusRencana,
    };
  },
};
