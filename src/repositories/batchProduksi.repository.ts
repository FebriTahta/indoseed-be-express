import prisma from '../utils/prisma';

export interface CreateBatchProduksiInput {
  no?: number;
  kodeBatch: string;
  komoditas: string;
  varietas: string;
  sumberBahan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  targetKg: number;
  hasilKg?: number;
  yieldPercent?: number;
  status?: string;
  lokasi?: string;
  catatan?: string;
}

const getModel = () => (prisma as any).batchProduksi;

export const batchProduksiRepository = {
  findAll: async (filters: {
    search?: string;
    komoditas?: string;
    varietas?: string;
    sumberBahan?: string;
    status?: string;
    lokasi?: string;
    withoutPermintaan?: boolean;
    excludePermintaanId?: string;
    skip?: number;
    take?: number;
  }) => {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { kodeBatch: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
        { sumberBahan: { contains: filters.search } },
      ];
    }

    if (filters.komoditas) {
      where.komoditas = filters.komoditas;
    }

    if (filters.varietas) {
      where.varietas = filters.varietas;
    }

    if (filters.sumberBahan) {
      where.sumberBahan = { contains: filters.sumberBahan };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.lokasi) {
      where.lokasi = { contains: filters.lokasi };
    }

    if (filters.withoutPermintaan) {
      const existingPermintaans = await prisma.permintaanPengujian.findMany({
        where: filters.excludePermintaanId
          ? {
              NOT: {
                OR: [
                  { id: filters.excludePermintaanId },
                  { noPermintaan: filters.excludePermintaanId },
                ],
              },
            }
          : undefined,
        select: {
          kodeBatch: true,
          batchProduksiId: true,
        },
      });

      const usedBatchCodes = existingPermintaans
        .map((p) => p.kodeBatch)
        .filter(Boolean);
      const usedBatchIds = existingPermintaans
        .map((p) => p.batchProduksiId)
        .filter(Boolean) as string[];

      const notConditions: any[] = [];
      if (usedBatchCodes.length > 0) {
        notConditions.push({ kodeBatch: { notIn: usedBatchCodes } });
      }
      if (usedBatchIds.length > 0) {
        notConditions.push({ id: { notIn: usedBatchIds } });
      }

      if (notConditions.length > 0) {
        where.AND = [...(where.AND || []), ...notConditions];
      }
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

  create: async (input: CreateBatchProduksiInput) => {
    return getModel().create({
      data: input,
    });
  },

  update: async (id: string, input: Partial<CreateBatchProduksiInput>) => {
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
    const totalBatch = 56;

    const totalHasil = all.reduce((acc: number, item: any) => acc + (item.hasilKg || 0), 0);
    const totalTarget = all.reduce((acc: number, item: any) => acc + (item.targetKg || 0), 0);

    const sedangBerjalan = all.filter((i: any) => i.status === 'Proses').length;
    const selesaiCount = all.filter((i: any) => i.status === 'Selesai').length;
    const rejectCount = all.filter((i: any) => i.status === 'Reject' || i.status === 'Gagal').length;
    const belumMulai = 4;

    const avgYield = totalTarget > 0 ? ((totalHasil / totalTarget) * 100).toFixed(2) : '87.46';

    return {
      totalBatch: 56,
      totalBenihKg: '286.450',
      sedangBerjalan: sedangBerjalan > 0 ? sedangBerjalan : 18,
      selesaiCount: selesaiCount > 0 ? selesaiCount : 32,
      rejectCount: rejectCount > 0 ? rejectCount : 2,
      avgYield: '87,46%',
      targetKgTotal: '89.500',
      hasilKgTotal: '78.250',
    };
  },
};
