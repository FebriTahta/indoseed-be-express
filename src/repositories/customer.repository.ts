import { prisma } from '../utils/prisma';

export interface CustomerFilter {
  search?: string;
  kategori?: string;
  status?: string;
  kota?: string;
  page?: number;
  pageSize?: number;
}

export const customerRepository = {
  create: async (data: any) => {
    return prisma.customer.create({
      data,
    });
  },

  findById: async (id: string) => {
    return prisma.customer.findUnique({
      where: { id }
    });
  },

  findBykodeCust: async (kodeCust: string) => {
    return prisma.customer.findUnique({
      where: { kodeCust },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.customer.update({
      where: { kodeCust: id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.customer.delete({
      where: { kodeCust: id },
    });
  },

  findAll: async (filters: CustomerFilter) => {
    const {
      search,
      kategori,
      status,
      kota,
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
    if (kota) {
      where.kota = kota;
    }

    if (search) {
      where.OR = [
        { namaCust: { contains: search } },
        { kodeCust: { contains: search } },
        { pic: { contains: search } },
        { noTelepon: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    console.log("==show all prisma: ", prisma);

    const [items, totalItems] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
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
