import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const qcTestRepository = {
  findAll: async (filters: { 
    search?: string, 
    jenisUji?: string,
    startDate?: string, 
    endDate?: string, 
    commodityId?: string, 
    varietyId?: string,
    testMethodId?: string,
    status?: string,
    lokasiLab?: string,
    page?: number,
    pageSize?: number
  }) => {
    const where: Prisma.QcTestWhereInput = {};
    
    if (filters.search) {
      where.OR = [
        { kodeBatch: { contains: filters.search } },
        { sertifikat: { contains: filters.search } }
      ];
    }
    
    if (filters.jenisUji) where.jenisUji = filters.jenisUji;
    
    if (filters.startDate || filters.endDate) {
      where.tanggalUji = {};
      if (filters.startDate) where.tanggalUji.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggalUji.lte = new Date(filters.endDate);
    }

    if (filters.commodityId) where.commodityId = filters.commodityId;
    if (filters.varietyId) where.varietyId = filters.varietyId;
    if (filters.testMethodId) where.testMethodId = filters.testMethodId;
    if (filters.status) where.status = filters.status;
    if (filters.lokasiLab) where.lokasiLab = filters.lokasiLab;

    const page = Number(filters.page) || 1;
    const pageSize = Number(filters.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const total = await prisma.qcTest.count({ where });

    const items = await prisma.qcTest.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        commodity: true,
        variety: true,
        testMethod: true,
      }
    });

    return {
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  },

  getDashboardSummary: async (filters: { 
    startDate?: string, 
    endDate?: string, 
    commodityId?: string, 
    varietyId?: string,
    jenisUji?: string,
    lokasiLab?: string,
    status?: string
  }) => {
    const where: Prisma.QcTestWhereInput = {};
    if (filters.startDate || filters.endDate) {
      where.tanggalUji = {};
      if (filters.startDate) where.tanggalUji.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggalUji.lte = new Date(filters.endDate);
    }
    if (filters.commodityId) where.commodityId = filters.commodityId;
    if (filters.varietyId) where.varietyId = filters.varietyId;
    if (filters.jenisUji) where.jenisUji = filters.jenisUji;
    if (filters.lokasiLab) where.lokasiLab = filters.lokasiLab;
    if (filters.status) where.status = filters.status;

    const totalTests = await prisma.qcTest.count({ where });
    
    const groupByStatus = await prisma.qcTest.groupBy({
      by: ['status'],
      where,
      _count: true
    });
    
    let lulus = 0, reject = 0, pending = 0;
    groupByStatus.forEach(g => {
      const s = g.status.toLowerCase();
      if (s.includes('reject') || s.includes('tolak') || s.includes('tidak lulus')) reject += g._count;
      else if (s.includes('lulus')) lulus += g._count;
      else pending += g._count;
    });

    const groupByCommodity = await prisma.qcTest.groupBy({
      by: ['commodityId'],
      where: { ...where, commodityId: { not: null } },
      _count: true
    });
    const totalCommodities = groupByCommodity.length;

    const tests = await prisma.qcTest.findMany({
      where,
      include: { commodity: true },
      orderBy: { tanggalUji: 'asc' }
    });

    const statusPerKomoditasMap: any = {};
    const trenStatusMap: any = {};
    const penyebabRejectMap: any = {};

    // Pre-populate last 30 days for trenStatus
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      d.setHours(0, 0, 0, 0);
      trenStatusMap[dateStr] = { date: dateStr, Lulus: 0, Reject: 0, Pending: 0, fullDate: d.getTime() };
    }
    
    const startOf30Days = new Date(today);
    startOf30Days.setDate(startOf30Days.getDate() - 29);
    startOf30Days.setHours(0, 0, 0, 0);

    tests.forEach(t => {
      const komoditasName = t.commodity?.namaKomoditas || 'Lainnya';
      if (!statusPerKomoditasMap[komoditasName]) {
        statusPerKomoditasMap[komoditasName] = { name: komoditasName, Lulus: 0, Reject: 0, Pending: 0 };
      }
      
      const s = t.status.toLowerCase();
      if (s.includes('reject') || s.includes('tolak') || s.includes('tidak lulus')) {
         statusPerKomoditasMap[komoditasName].Reject++;
         const reason = t.catatan || 'Kondisi tidak memenuhi standar';
         penyebabRejectMap[reason] = (penyebabRejectMap[reason] || 0) + 1;
      }
      else if (s.includes('lulus')) statusPerKomoditasMap[komoditasName].Lulus++;
      else statusPerKomoditasMap[komoditasName].Pending++;

      if (t.tanggalUji) {
        const d = t.tanggalUji;
        if (d >= startOf30Days && d <= today) {
          const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          
          if (trenStatusMap[dateStr]) {
            if (s.includes('reject') || s.includes('tolak') || s.includes('tidak lulus')) trenStatusMap[dateStr].Reject++;
            else if (s.includes('lulus')) trenStatusMap[dateStr].Lulus++;
            else trenStatusMap[dateStr].Pending++;
          }
        }
      }
    });

    const statusPerKomoditas = Object.values(statusPerKomoditasMap);
    const trenStatus = Object.values(trenStatusMap)
      .sort((a: any, b: any) => a.fullDate - b.fullDate)
      .map((item: any) => {
        delete item.fullDate;
        return item;
      });
      
    const topPenyebabReject = Object.entries(penyebabRejectMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);

    return {
      summary: {
        lulus,
        reject,
        pending,
        totalTests,
        totalCommodities
      },
      statusPerKomoditas,
      trenStatus,
      topPenyebabReject
    };
  },

  findById: async (id: string) => {
    return prisma.qcTest.findUnique({
      where: { id },
      include: {
        commodity: true,
        variety: true,
        testMethod: true
      }
    });
  },

  create: async (data: Prisma.QcTestUncheckedCreateInput) => {
    return prisma.qcTest.create({ data });
  },

  update: async (id: string, data: Prisma.QcTestUncheckedUpdateInput) => {
    return prisma.qcTest.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.qcTest.delete({ where: { id } });
  }
};
