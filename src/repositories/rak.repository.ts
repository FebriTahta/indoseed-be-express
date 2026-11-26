import { prisma } from '../utils/prisma';

export interface RakFilter {
  search?: string;
  kategori?: string;
  status?: string;
  kodeGudang?: string;
  gudangId?: string;
  page?: number;
  pageSize?: number;
}

export const rakRepository = {
  create: async (data: any) => {
    // If gudangId provided, optionally resolve namaGudang & kodeGudang
    if (data.gudangId && (!data.namaGudang || !data.kodeGudang)) {
      const g = await prisma.gudang.findUnique({ where: { id: data.gudangId } });
      if (g) {
        data.kodeGudang = data.kodeGudang || g.kodeGudang;
        data.namaGudang = data.namaGudang || g.namaGudang;
      }
    } else if (data.kodeGudang && !data.gudangId) {
      const g = await prisma.gudang.findUnique({ where: { kodeGudang: data.kodeGudang } });
      if (g) {
        data.gudangId = g.id;
        data.namaGudang = data.namaGudang || g.namaGudang;
      }
    }

    return prisma.rak.create({
      data,
      include: {
        gudang: true,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.rak.findFirst({
      where: {
        OR: [
          { id },
          { kodeRak: id },
        ],
      },
      include: {
        gudang: true,
      },
    });
  },

  findByKodeRak: async (kodeRak: string) => {
    return prisma.rak.findUnique({
      where: { kodeRak },
      include: {
        gudang: true,
      },
    });
  },

  update: async (id: string, data: any) => {
    const existing = await rakRepository.findById(id);
    if (!existing) {
      throw new Error('Data rak tidak ditemukan');
    }

    // If gudang is being updated
    if (data.gudangId && data.gudangId !== existing.gudangId) {
      const g = await prisma.gudang.findUnique({ where: { id: data.gudangId } });
      if (g) {
        data.kodeGudang = g.kodeGudang;
        data.namaGudang = g.namaGudang;
      }
    } else if (data.kodeGudang && data.kodeGudang !== existing.kodeGudang) {
      const g = await prisma.gudang.findUnique({ where: { kodeGudang: data.kodeGudang } });
      if (g) {
        data.gudangId = g.id;
        data.namaGudang = g.namaGudang;
      }
    }

    return prisma.rak.update({
      where: { id: existing.id },
      data,
      include: {
        gudang: true,
      },
    });
  },

  delete: async (id: string) => {
    const existing = await rakRepository.findById(id);
    if (!existing) {
      throw new Error('Data rak tidak ditemukan');
    }

    return prisma.rak.delete({
      where: { id: existing.id },
    });
  },

  findAll: async (filters: RakFilter) => {
    const {
      search,
      kategori,
      status,
      kodeGudang,
      gudangId,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (kategori) {
      where.kategori = kategori;
    }
    if (status) {
      where.status = status;
    }
    if (kodeGudang) {
      where.kodeGudang = kodeGudang;
    }
    if (gudangId) {
      where.gudangId = gudangId;
    }

    if (search) {
      where.OR = [
        { namaRak: { contains: search } },
        { kodeRak: { contains: search } },
        { namaGudang: { contains: search } },
        { kodeGudang: { contains: search } },
        { baris: { contains: search } },
        { keterangan: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.rak.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { tglDibuat: 'desc' },
        include: {
          gudang: true,
        },
      }),
      prisma.rak.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  },

  getStats: async () => {
    const total = await prisma.rak.count();
    const active = await prisma.rak.count({ where: { status: 'Aktif' } });
    const maintenance = await prisma.rak.count({ where: { status: 'Maintenance' } });
    const inactive = await prisma.rak.count({ where: { status: 'Tidak Aktif' } });

    // Distinct gudang
    const gudangCount = await prisma.rak.groupBy({
      by: ['kodeGudang'],
      _count: { kodeRak: true },
    });

    return {
      total,
      active,
      maintenance,
      inactive,
      totalGudang: gudangCount.length,
    };
  },
};
