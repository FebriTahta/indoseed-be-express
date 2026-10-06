import prisma from '../utils/prisma';
import { deleteFile } from '../utils/minio';

export const qcRepository = {
  // Reference Standards
  findAllStandards: (hasDocuments?: boolean) => {
    return prisma.referenceStandard.findMany({
      ...(hasDocuments ? { where: { documentId: { not: null } } } : {}),
      include: { document: true }
    });
  },
  findStandardById: (id: string) => prisma.referenceStandard.findUnique({ where: { id }, include: { document: true } }),
  createStandard: (data: any) => {
    if (data.documentId === '') data.documentId = null;
    return prisma.referenceStandard.create({ data });
  },
  updateStandard: (id: string, data: any) => {
    if (data.documentId === '') data.documentId = null;
    return prisma.referenceStandard.update({ where: { id }, data });
  },
  deleteStandard: (id: string) => prisma.referenceStandard.delete({ where: { id } }),

  // Test Methods
  findAllMethods: (filters?: {
    search?: string;
    jenisUji?: string;
    komoditas?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { kode: { contains: filters.search } },
        { nama: { contains: filters.search } },
        { jenisUji: { contains: filters.search } },
        { komoditas: { contains: filters.search } },
        { varietas: { contains: filters.search } },
      ];
    }

    if (filters?.jenisUji) {
      where.jenisUji = filters.jenisUji;
    }

    if (filters?.komoditas) {
      where.komoditas = filters.komoditas;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const validSortFields = ['kode', 'nama', 'status', 'jenisUji', 'komoditas', 'createdAt', 'updatedAt'];
    const sortField = filters?.sortBy && validSortFields.includes(filters.sortBy) ? filters.sortBy : 'updatedAt';
    const sortDirection = filters?.sortOrder === 'asc' ? 'asc' : 'desc';

    return prisma.testMethod.findMany({
      where,
      include: { standar: true, testParameters: true, document: true, dokumen: true },
      orderBy: { [sortField]: sortDirection }
    });
  },
  findMethodById: (id: string) => prisma.testMethod.findUnique({
    where: { id },
    include: { standar: true, testParameters: true, document: true, dokumen: true }
  }),
  createMethod: async (data: any) => {
    if (!data.documentId || data.documentId === '' || data.documentId === 'null') data.documentId = null;
    if (!data.standarId || data.standarId === '' || data.standarId === 'null') data.standarId = null;

    if (data.standarId) {
      const std = await prisma.referenceStandard.findUnique({ where: { id: data.standarId } });
      if (!std) data.standarId = null;
    }

    if (data.tanggalBerlaku === '' || data.tanggalBerlaku === null) {
      data.tanggalBerlaku = null;
    } else if (typeof data.tanggalBerlaku === 'string') {
      const d = new Date(data.tanggalBerlaku);
      data.tanggalBerlaku = isNaN(d.getTime()) ? null : d;
    }

    const { testParameters, dokumen, ...methodData } = data;
    return prisma.testMethod.create({ 
      data: {
        ...methodData,
        testParameters: testParameters && testParameters.length > 0 ? {
          create: testParameters.map((p: any, idx: number) => ({
            kode: p.kode || `PRM-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
            nama: p.parameter || p.nama || 'Untitled',
            satuan: p.satuan || null,
            batasAcuan: p.batasAcuan || (p.batasMin && p.batasMax ? `${p.batasMin} - ${p.batasMax}` : (p.batasMin || p.batasMax || null)),
            status: p.status || 'Aktif'
          }))
        } : undefined,
        dokumen: dokumen && dokumen.length > 0 ? {
          create: dokumen.map((d: any) => ({
            namaFile: d.namaFile || d.fileName || 'Dokumen',
            fileUrl: d.fileUrl || d.url,
            tipeFile: d.tipeFile || d.type || (d.namaFile ? d.namaFile.split('.').pop()?.toLowerCase() : null),
            ukuran: d.ukuran || d.fileSize || null,
          }))
        } : undefined
      },
      include: { standar: true, testParameters: true, dokumen: true }
    });
  },
  updateMethod: async (id: string, data: any) => {
    if (!data.documentId || data.documentId === '' || data.documentId === 'null') data.documentId = null;
    if (!data.standarId || data.standarId === '' || data.standarId === 'null') data.standarId = null;

    if (data.standarId) {
      const std = await prisma.referenceStandard.findUnique({ where: { id: data.standarId } });
      if (!std) data.standarId = null;
    }

    if (data.tanggalBerlaku === '' || data.tanggalBerlaku === null) {
      data.tanggalBerlaku = null;
    } else if (typeof data.tanggalBerlaku === 'string') {
      const d = new Date(data.tanggalBerlaku);
      data.tanggalBerlaku = isNaN(d.getTime()) ? null : d;
    }

    const { testParameters, dokumen, ...methodData } = data;

    // Clean up MinIO files for deleted documents if dokumen is explicitly provided
    if (dokumen !== undefined && Array.isArray(dokumen)) {
      try {
        const existingDocs = await prisma.testMethodDocument.findMany({ where: { testMethodId: id } });
        const newUrls = new Set(dokumen.map((d: any) => d.fileUrl || d.url));
        for (const doc of existingDocs) {
          if (!newUrls.has(doc.fileUrl)) {
            await deleteFile(doc.fileUrl);
          }
        }
      } catch (err) {
        console.error('Error cleaning up removed documents from MinIO:', err);
      }
    }

    return prisma.testMethod.update({ 
      where: { id }, 
      data: {
        ...methodData,
        ...(testParameters ? {
          testParameters: {
            deleteMany: {},
            create: testParameters.map((p: any, idx: number) => ({
              kode: p.kode || `PRM-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
              nama: p.parameter || p.nama || 'Untitled',
              satuan: p.satuan || null,
              batasAcuan: p.batasAcuan || (p.batasMin && p.batasMax ? `${p.batasMin} - ${p.batasMax}` : (p.batasMin || p.batasMax || null)),
              status: p.status || 'Aktif'
            }))
          }
        } : {}),
        ...(dokumen !== undefined && Array.isArray(dokumen) ? {
          dokumen: {
            deleteMany: {},
            create: dokumen.map((d: any) => ({
              namaFile: d.namaFile || d.fileName || 'Dokumen',
              fileUrl: d.fileUrl || d.url,
              tipeFile: d.tipeFile || d.type || (d.namaFile ? d.namaFile.split('.').pop()?.toLowerCase() : null),
              ukuran: d.ukuran || d.fileSize || null,
            }))
          }
        } : {})
      },
      include: { standar: true, testParameters: true, dokumen: true }
    });
  },
  deleteMethod: async (id: string) => {
    try {
      const existingDocs = await prisma.testMethodDocument.findMany({ where: { testMethodId: id } });
      for (const doc of existingDocs) {
        await deleteFile(doc.fileUrl);
      }
    } catch (err) {
      console.error('Error deleting method files from MinIO:', err);
    }
    return prisma.testMethod.delete({ where: { id } });
  },
  deleteMethodDocument: async (documentId: string) => {
    const doc = await prisma.testMethodDocument.findUnique({ where: { id: documentId } });
    if (doc) {
      await deleteFile(doc.fileUrl);
      return prisma.testMethodDocument.delete({ where: { id: documentId } });
    }
    return null;
  },

  // Test Parameters
  findAllParameters: () => prisma.testParameter.findMany({ include: { metode: true } }),
  findParameterById: (id: string) => prisma.testParameter.findUnique({ where: { id }, include: { metode: true } }),
  createParameter: (data: any) => prisma.testParameter.create({ data }),
  updateParameter: (id: string, data: any) => prisma.testParameter.update({ where: { id }, data }),
  deleteParameter: (id: string) => prisma.testParameter.delete({ where: { id } }),

  // Laboratorium
  findAllLaboratoriums: () => prisma.laboratorium.findMany({
    where: { status: 'Aktif' },
    orderBy: { namaLaboratorium: 'asc' }
  })
};
