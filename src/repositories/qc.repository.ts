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

  // Test Methods (logika CRUD ada di services/qc/testMethod.service.ts)
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
