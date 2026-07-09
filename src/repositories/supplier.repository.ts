import { prisma } from '../utils/prisma';

export interface SupplierFilter {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const supplierRepository = {
  create: async (data: any) => {
    return prisma.supplier.create({
      data,
    });
  },

  findById: async (id: string) => {
    return prisma.supplier.findUnique({
      where: { id }
    });
  },

  findByKodeSupplier: async (kodeSupplier: string) => {
    return prisma.supplier.findUnique({
      where: { kodeSupplier },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.supplier.update({
      where: { kodeSupplier: id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.supplier.delete({
      where: { kodeSupplier: id },
    });
  },

  findAll: async (filters: SupplierFilter) => {
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
        { namaSupplier: { contains: search } },
        { kodeSupplier: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    console.log("==show all prisma: ", prisma);

    const [items, totalItems] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { tglDibuat: 'desc' },
      }),
      prisma.supplier.count({ where }),
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
