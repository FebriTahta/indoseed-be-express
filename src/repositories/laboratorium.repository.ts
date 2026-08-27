import { prisma } from '../utils/prisma';

export interface LaboratoriumFilter {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const laboratoriumRepository = {
  create: async (data: any) => {
    return prisma.laboratorium.create({
      data,
    });
  },

  findById: async (id: string) => {
    return prisma.laboratorium.findUnique({
      where: { id }
    });
  },

  findByKodeLaboratorium: async (kodeLaboratorium: string) => {
    return prisma.laboratorium.findUnique({
      where: { kodeLaboratorium },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.laboratorium.update({
      where: { kodeLaboratorium: id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.laboratorium.delete({
      where: { kodeLaboratorium: id },
    });
  },

  findAll: async (filters: LaboratoriumFilter) => {
    const {
      search,
      status,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { namaLaboratorium: { contains: search } },
        { kodeLaboratorium: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.laboratorium.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.laboratorium.count({ where }),
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
  findAllUnpaginated: async () => {
    return prisma.laboratorium.findMany({
        orderBy: { createdAt: 'desc' },
    });
  }
};
