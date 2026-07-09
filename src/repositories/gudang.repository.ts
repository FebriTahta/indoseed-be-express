import { prisma } from '../utils/prisma';

export interface GudangFilter {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const gudangRepository = {
  create: async (data: any) => {
    return prisma.gudang.create({
      data,
    });
  },

  findById: async (id: string) => {
    return prisma.gudang.findUnique({
      where: { id }
    });
  },

  findByKodeGudang: async (kodeGudang: string) => {
    return prisma.gudang.findUnique({
      where: { kodeGudang },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.gudang.update({
      where: { kodeGudang: id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.gudang.delete({
      where: { kodeGudang: id },
    });
  },

  findAll: async (filters: GudangFilter) => {
    const {
      search,
      kategori,
      status,
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

    if (search) {
      where.OR = [
        { namaGudang: { contains: search } },
        { kodeGudang: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    console.log("==show all prisma: ", prisma);

    const [items, totalItems] = await Promise.all([
      prisma.gudang.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { tglDibuat: 'desc' },
      }),
      prisma.gudang.count({ where }),
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
};
