import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const qcKadarAirRepository = {
  findAll: async (filters: { 
    search?: string, 
    startDate?: string, 
    endDate?: string, 
    commodityId?: string, 
    varietyId?: string,
    testMethodId?: string,
  }) => {
    const where: Prisma.QcKadarAirWhereInput = {};
    
    if (filters.search) {
      where.OR = [
        { kodeBatch: { contains: filters.search } },
        { sertifikat: { contains: filters.search } },
        { lotNumber: { contains: filters.search } }
      ];
    }
    
    if (filters.startDate || filters.endDate) {
      where.tanggalUji = {};
      if (filters.startDate) where.tanggalUji.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggalUji.lte = new Date(filters.endDate);
    }

    if (filters.commodityId) where.commodityId = filters.commodityId;
    if (filters.varietyId) where.varietyId = filters.varietyId;
    if (filters.testMethodId) where.testMethodId = filters.testMethodId;

    return prisma.qcKadarAir.findMany({
      where,
      include: {
        commodity: true,
        variety: true,
        testMethod: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.qcKadarAir.findUnique({
      where: { id },
      include: {
        commodity: true,
        variety: true,
        testMethod: true
      }
    });
  },

  create: async (data: Prisma.QcKadarAirUncheckedCreateInput) => {
    return prisma.qcKadarAir.create({ data });
  },

  update: async (id: string, data: Prisma.QcKadarAirUncheckedUpdateInput) => {
    return prisma.qcKadarAir.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.qcKadarAir.delete({ where: { id } });
  }
};
