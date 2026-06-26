import { prisma } from '../utils/prisma';

export interface PartnerFilter {
  search?: string;
  kelompokTani?: string;
  status?: string;
  komoditasUtama?: string;
  page?: number;
  pageSize?: number;
}

export const partnerRepository = {
  create: async (data: any) => {
    return prisma.partner.create({
      data,
    });
  },

  findById: async (id: string) => {
    return prisma.partner.findUnique({
      where: { id },
      include: {
        greenhouses: {
          include: {
            commodity: true
          }
        }
      }
    });
  },

  findByKodePetani: async (kodePetani: string) => {
    return prisma.partner.findUnique({
      where: { kodePetani },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.partner.update({
      where: { id },
      data,
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
      status,
      komoditasUtama,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (kelompokTani) {
      where.kelompokTani = kelompokTani;
    }
    if (status) {
      where.status = status;
    }
    if (komoditasUtama) {
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
        include: {
          greenhouses: {
            include: {
              commodity: true
            }
          }
        }
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
