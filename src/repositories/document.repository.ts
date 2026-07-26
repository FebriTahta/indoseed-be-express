import { prisma } from '../utils/prisma';

export const getDocuments = async () => {
  return await prisma.supportDocument.findMany({
    include: {
      referenceStandards: true,
      testMethods: true,
    }
  });
};

export const getDocumentById = async (id: string) => {
  return await prisma.supportDocument.findUnique({
    where: { id },
    include: {
      referenceStandards: true,
      testMethods: true,
    }
  });
};

export const createDocument = async (data: any) => {
  return await prisma.supportDocument.create({
    data
  });
};

export const updateDocument = async (id: string, data: any) => {
  return await prisma.supportDocument.update({
    where: { id },
    data
  });
};

export const deleteDocument = async (id: string) => {
  return await prisma.supportDocument.delete({
    where: { id }
  });
};
