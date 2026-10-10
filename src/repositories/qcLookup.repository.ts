import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { LookupInput } from '../validators/qc.validator';

export const qcLookupRepository = {
  findAll: (filters: { kategori?: string[]; status?: string }) => {
    const where: Prisma.QcLookupWhereInput = {};
    if (filters.kategori?.length) where.kategori = { in: filters.kategori };
    if (filters.status) where.status = filters.status;
    return prisma.qcLookup.findMany({
      where,
      orderBy: [{ kategori: 'asc' }, { urutan: 'asc' }, { nama: 'asc' }],
    });
  },

  findByKode: (kategori: string, kode: string) =>
    prisma.qcLookup.findUnique({ where: { kategori_kode: { kategori, kode } } }),

  findById: (id: string) => prisma.qcLookup.findUnique({ where: { id } }),

  create: (data: LookupInput) => prisma.qcLookup.create({ data }),

  update: (id: string, data: LookupInput) => prisma.qcLookup.update({ where: { id }, data }),

  delete: (id: string) => prisma.qcLookup.delete({ where: { id } }),
};
