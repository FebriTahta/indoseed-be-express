import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface VarietyFilter {
  search?: string;
  commodityId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateVarietyInput extends Prisma.VarietyUncheckedCreateInput {}
export interface UpdateVarietyInput extends Prisma.VarietyUncheckedUpdateInput {}

export const varietyRepository = {
  create: async (data: CreateVarietyInput) => {
    return prisma.variety.create({
      data,
      include: {
        commodity: true,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.variety.findUnique({
      where: { id },
      include: {
        commodity: true,
      },
    });
  },

  findByKodeVarietas: async (kodeVarietas: string) => {
    return prisma.variety.findUnique({
      where: { kodeVarietas },
      include: {
        commodity: true,
      },
    });
  },

  update: async (id: string, data: UpdateVarietyInput) => {
    return prisma.variety.update({
      where: { id },
      data,
      include: {
        commodity: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.variety.delete({
      where: { id },
    });
  },

  findAll: async (filters: VarietyFilter) => {
    const {
      search,
      commodityId,
      status,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (commodityId) {
      where.commodityId = commodityId;
    }
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { namaVarietas: { contains: search } },
        { kodeVarietas: { contains: search } },
        { asalPemulia: { contains: search } },
        {
          commodity: {
            namaKomoditas: { contains: search },
          },
        },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.variety.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          commodity: true,
        },
      }),
      prisma.variety.count({ where }),
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
