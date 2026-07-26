import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const qcDayaTumbuhRepository = {
  findAll: async (filters: { 
    search?: string, 
    startDate?: string, 
    endDate?: string, 
    commodityId?: string, 
    varietyId?: string 
  }) => {
    const where: Prisma.QcDayaTumbuhWhereInput = {};
    
    if (filters.search) {
      where.OR = [
        { kodeBatch: { contains: filters.search } },
        { sertifikat: { contains: filters.search } }
      ];
    }
    
    if (filters.startDate || filters.endDate) {
      where.tanggalUji = {};
      if (filters.startDate) where.tanggalUji.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggalUji.lte = new Date(filters.endDate);
    }

    if (filters.commodityId) where.commodityId = filters.commodityId;
    if (filters.varietyId) where.varietyId = filters.varietyId;

    return prisma.qcDayaTumbuh.findMany({
      where,
      include: {
        commodity: true,
        variety: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.qcDayaTumbuh.findUnique({
      where: { id },
      include: {
        commodity: true,
        variety: true
      }
    });
  },

  create: async (data: Prisma.QcDayaTumbuhUncheckedCreateInput) => {
    return prisma.qcDayaTumbuh.create({ data });
  },

  update: async (id: string, data: Prisma.QcDayaTumbuhUncheckedUpdateInput) => {
    return prisma.qcDayaTumbuh.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.qcDayaTumbuh.delete({ where: { id } });
  }
};
