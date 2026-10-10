import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuditFilter } from '../validators/auditTrail.validator';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const buildAuditWhere = (f: AuditFilter): Prisma.AuditLogWhereInput => {
  const and: Prisma.AuditLogWhereInput[] = [];
  if (f.username) and.push({ username: f.username });
  if (f.modul) and.push({ modul: f.modul });
  if (f.aksi) and.push({ aksi: f.aksi });
  if (f.entitas) and.push({ entitas: f.entitas });
  if (f.startDate) and.push({ createdAt: { gte: startOfDay(f.startDate) } });
  if (f.endDate) and.push({ createdAt: { lte: endOfDay(f.endDate) } });
  if (f.search) {
    and.push({
      OR: [
        { keterangan: { contains: f.search } },
        { entitasKode: { contains: f.search } },
        { entitasId: { contains: f.search } },
        { username: { contains: f.search } },
        { ipAddress: { contains: f.search } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
};

/** Kolom ringan untuk tabel (tanpa userAgent mentah). */
const listSelect = {
  id: true,
  createdAt: true,
  userId: true,
  username: true,
  role: true,
  modul: true,
  aksi: true,
  entitas: true,
  entitasId: true,
  entitasKode: true,
  keterangan: true,
  perubahan: true,
  ipAddress: true,
  perangkat: true,
  impersonatedBy: true,
} satisfies Prisma.AuditLogSelect;

export const auditLogRepository = {
  findAll: async (f: AuditFilter, page: number, pageSize: number) => {
    const where = buildAuditWhere(f);
    const [total, data] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: listSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  /** Seluruh baris sesuai filter untuk ekspor (dibatasi agar tidak membebani server). */
  findForExport: (f: AuditFilter, limit: number) =>
    prisma.auditLog.findMany({ where: buildAuditWhere(f), select: listSelect, orderBy: { createdAt: 'desc' }, take: limit }),

  findById: (id: string) => prisma.auditLog.findUnique({ where: { id } }),

  count: (where: Prisma.AuditLogWhereInput) => prisma.auditLog.count({ where }),

  countDistinctUsers: async (where: Prisma.AuditLogWhereInput) =>
    (await prisma.auditLog.groupBy({ by: ['username'], where })).length,

  distinct: async (field: 'username' | 'modul' | 'entitas') => {
    const rows = await prisma.auditLog.findMany({
      distinct: [field],
      select: { [field]: true } as Record<typeof field, true>,
      orderBy: { [field]: 'asc' } as Prisma.AuditLogOrderByWithRelationInput,
    });
    return rows.map((r) => (r as Record<string, string | null>)[field]).filter((v): v is string => Boolean(v));
  },
};
