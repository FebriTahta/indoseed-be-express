import { prisma } from '../utils/prisma';

export interface GreenhouseFilter {
  search?: string;
  jenisLahan?: string;
  status?: string;
  komoditasUtama?: string;
  commodityId?: string;
  partnerId?: string;
  lokasi?: string;
  page?: number;
  pageSize?: number;
}

export const greenhouseRepository = {
  create: async (data: any) => {
    return prisma.greenhouse.create({
      data,
      include: {
        commodity: true,
        partner: true,
      },
    });
  },

  findById: async (id: string) => {
    return prisma.greenhouse.findUnique({
      where: { id },
      include: {
        commodity: true,
        partner: true,
      },
    });
  },

  findByKodeLahan: async (kodeLahan: string) => {
    return prisma.greenhouse.findUnique({
      where: { kodeLahan },
      include: {
        commodity: true,
        partner: true,
      },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.greenhouse.update({
      where: { id },
      data,
      include: {
        commodity: true,
        partner: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.greenhouse.delete({
      where: { id },
    });
  },

  findAll: async (filters: GreenhouseFilter) => {
    const {
      search,
      jenisLahan,
      status,
      komoditasUtama,
      commodityId,
      partnerId,
      lokasi,
      page = 1,
      pageSize = 10,
    } = filters;

    const where: any = {};

    if (jenisLahan) {
      where.jenisLahan = jenisLahan;
    }
    if (status) {
      where.status = status;
    }
    if (commodityId) {
      where.commodityId = commodityId;
    } else if (komoditasUtama) {
      where.komoditasUtama = komoditasUtama;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }
    if (lokasi) {
      where.lokasi = lokasi;
    }

    if (search) {
      where.OR = [
        { namaLahan: { contains: search } },
        { kodeLahan: { contains: search } },
        { petaniMitra: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.greenhouse.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          commodity: true,
          partner: true,
        },
      }),
      prisma.greenhouse.count({ where }),
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
