import prisma from '../utils/prisma';

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
  findAllMethods: () => prisma.testMethod.findMany({ include: { standar: true, testParameters: true, document: true } }),
  findMethodById: (id: string) => prisma.testMethod.findUnique({ where: { id }, include: { standar: true, testParameters: true, document: true } }),
  createMethod: (data: any) => {
    if (data.documentId === '') data.documentId = null;
    return prisma.testMethod.create({ data });
  },
  updateMethod: (id: string, data: any) => {
    if (data.documentId === '') data.documentId = null;
    return prisma.testMethod.update({ where: { id }, data });
  },
  deleteMethod: (id: string) => prisma.testMethod.delete({ where: { id } }),

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
