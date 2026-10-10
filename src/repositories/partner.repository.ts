import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface PartnerFilter {
  search?: string;
  kelompokTani?: string;
  kelompokTaniId?: string;
  penanggungJawabId?: string;
  status?: string;
  komoditasUtama?: string;
  commodityId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreatePartnerInput extends Prisma.PartnerUncheckedCreateInput {}
export interface UpdatePartnerInput extends Prisma.PartnerUncheckedUpdateInput {}

const partnerIncludes = {
  commodity: true,
  penanggungJawab: true,
  kelompok: true,
  greenhouses: {
    include: {
      commodity: true,
      variety: true,
    },
  },
};

export const partnerRepository = {
  create: async (data: CreatePartnerInput) => {
    return prisma.partner.create({
      data,
      include: partnerIncludes,
    });
  },

  findById: async (id: string) => {
    return prisma.partner.findUnique({
      where: { id },
      include: partnerIncludes,
    });
  },

  findByKodePetani: async (kodePetani: string) => {
    return prisma.partner.findUnique({
      where: { kodePetani },
    });
  },

  update: async (id: string, data: UpdatePartnerInput) => {
    return prisma.partner.update({
      where: { id },
      data,
      include: partnerIncludes,
    });
  },

  delete: async (id: string) => {
    return prisma.partner.delete({
      where: { id },
    });
  },

  findAll: async (filters: PartnerFilter) => {
    const {
      search,
      kelompokTani,
      kelompokTaniId,
      penanggungJawabId,
      status,
      komoditasUtama,
      commodityId,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (kelompokTaniId) {
      where.kelompokTaniId = kelompokTaniId;
    } else if (kelompokTani) {
      where.kelompokTani = kelompokTani;
    }

    if (penanggungJawabId) {
      where.penanggungJawabId = penanggungJawabId;
    }

    if (status) {
      where.status = status;
    }
    if (commodityId) {
      where.commodityId = commodityId;
    } else if (komoditasUtama) {
      where.komoditasUtama = komoditasUtama;
    }

    if (search) {
      where.OR = [
        { namaPetani: { contains: search } },
        { kodePetani: { contains: search } },
        { kelompokTani: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: partnerIncludes,
      }),
      prisma.partner.count({ where }),
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
