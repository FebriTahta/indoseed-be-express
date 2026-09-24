import { prisma } from '../utils/prisma';

export interface PenanggungJawabFilter {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const penanggungJawabRepository = {
  create: async (data: { nama: string; status?: string }) => {
    return prisma.penanggungJawab.create({
      data: {
        nama: data.nama,
        status: data.status || 'Aktif',
      },
    });
  },

  findById: async (id: string) => {
    return prisma.penanggungJawab.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: { nama?: string; status?: string }) => {
    return prisma.penanggungJawab.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.penanggungJawab.delete({
      where: { id },
    });
  },

  findAll: async (filters: PenanggungJawabFilter = {}) => {
    const {
      search,
      status,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [total, data] = await Promise.all([
      prisma.penanggungJawab.count({ where }),
      prisma.penanggungJawab.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: Number(page),
        pageSize: take,
      },
    };
  },
};
