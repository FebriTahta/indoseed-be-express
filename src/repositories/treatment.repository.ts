import prisma from '../utils/prisma';

export interface CreateTreatmentInput {
  no?: number;
  kodeBatch: string;
  komoditas: string;
  varietas: string;
  treatment: string;
  dosis: string;
  operator: string;
  beratAwal: number;
  beratAkhir: number;
  loss: number;
  tanggalSelesai: string;
  status?: string;
  lokasi?: string;
  catatan?: string;
}

const getModel = () => (prisma as any).treatment;

export const treatmentRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    jenisTreatment?: string;
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
        { treatment: { contains: filters.search } },
      ];
    }

    if (filters.komoditas) {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas) {
      where.varietas = filters.varietas;
    }

    if (filters.jenisTreatment) {
      where.treatment = { contains: filters.jenisTreatment };
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

  create: async (input: CreateTreatmentInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateTreatmentInput>) => {
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

    const totalAwal = all.reduce((acc: number, item: any) => acc + (item.beratAwal || 0), 0);
    const totalAkhir = all.reduce((acc: number, item: any) => acc + (item.beratAkhir || 0), 0);

    const avgLoss = totalAwal > 0 ? (((totalAwal - totalAkhir) / totalAwal) * 100).toFixed(2) : '0.85';

    const prosesAktifCount = all.filter((i: any) => i.status === 'Proses').length;
    const selesaiCount = all.filter((i: any) => i.status === 'Selesai').length;

    return {
      totalBatchHariIni,
      totalBeratAwalKg: totalAwal.toLocaleString('id-ID'),
      totalBeratAkhirKg: totalAkhir.toLocaleString('id-ID'),
      avgLoss: `${avgLoss}%`,
      prosesAktifCount,
      selesaiCount,
    };
  },
};
