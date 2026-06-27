import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface CommodityFilter {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateCommodityInput extends Prisma.CommodityUncheckedCreateInput {}
export interface UpdateCommodityInput extends Prisma.CommodityUncheckedUpdateInput {}

export const commodityRepository = {
  create: async (data: CreateCommodityInput) => {
    return prisma.commodity.create({
      data,
    });
  },

  findById: async (id: string) => {
    return prisma.commodity.findUnique({
      where: { id },
    });
  },

  findByKodeKomoditas: async (kodeKomoditas: string) => {
    return prisma.commodity.findUnique({
      where: { kodeKomoditas },
    });
  },

  update: async (id: string, data: UpdateCommodityInput) => {
    return prisma.commodity.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.commodity.delete({
      where: { id },
    });
  },

  findAll: async (filters: CommodityFilter) => {
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
        { namaKomoditas: { contains: search } },
        { kodeKomoditas: { contains: search } },
        { deskripsi: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.commodity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.commodity.count({ where }),
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
