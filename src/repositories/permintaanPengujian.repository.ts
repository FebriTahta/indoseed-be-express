import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { PermintaanListQuery } from '../validators/qc.validator';
import { recordAudit } from '../services/audit/audit.service';
import { AUDIT_AKSI } from '../constants/audit.constants';
import { PERMINTAAN_STATUS } from '../constants/qc.constants';

/** Modul audit ditentukan dari tahap alur tempat aksi terjadi (status sebelum aksi). */
const tahapAudit = (statusDari?: string | null) => {
  if (statusDari === PERMINTAAN_STATUS.SAMPLING || statusDari === PERMINTAAN_STATUS.DALAM_PENGUJIAN) {
    return { modul: 'Pemeriksaan Pengujian', entitas: 'Pengujian' };
  }
  if (statusDari === PERMINTAAN_STATUS.MENUNGGU_REVIEW || statusDari === PERMINTAAN_STATUS.SELESAI) {
    return { modul: 'Hasil Pengujian', entitas: 'Hasil Pengujian' };
  }
  return { modul: 'Permintaan Pengujian', entitas: 'Permintaan Pengujian' };
};

type Db = Prisma.TransactionClient | typeof prisma;

const penggunaSelect = { select: { id: true, kodePenguji: true, nama: true, status: true } } as const;

/** Relasi yang dimuat pada tampilan daftar (ringan). */
export const permintaanListInclude = {
  parameters: {
    orderBy: { createdAt: 'asc' },
    select: { id: true, nama: true, kode: true, checked: true, nilaiHasil: true, hasilTeks: true, statusHasil: true },
  },
  pengambilSampelRef: penggunaSelect,
  petugasQc: penggunaSelect,
  laboratorium: { select: { id: true, kodeLaboratorium: true, namaLaboratorium: true } },
  _count: { select: { dokumen: true } },
} satisfies Prisma.PermintaanPengujianInclude;

/** Relasi lengkap untuk halaman detail / pemeriksaan / hasil. */
export const permintaanDetailInclude = {
  parameters: {
    orderBy: { createdAt: 'asc' },
    include: {
      metodeRef: {
        select: {
          id: true,
          kode: true,
          nama: true,
          standar: { select: { id: true, kode: true, nama: true } },
          dokumen: { select: { id: true, namaFile: true, fileUrl: true, tipeFile: true, ukuran: true } },
        },
      },
    },
  },
  dokumen: { orderBy: { createdAt: 'desc' } },
  riwayat: { orderBy: { createdAt: 'asc' } },
  batchProduksi: true,
  pengambilSampelRef: penggunaSelect,
  petugasQc: penggunaSelect,
  laboratorium: { select: { id: true, kodeLaboratorium: true, namaLaboratorium: true } },
} satisfies Prisma.PermintaanPengujianInclude;

const SEARCH_FIELDS = [
  'noPermintaan',
  'noPengujian',
  'noSampel',
  'kodeBatch',
  'komoditas',
  'varietas',
  'petani',
  'pemohon',
  'pengambilSampel',
] as const;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/**
 * Data yang boleh dilihat penguji: tugas miliknya + sampel tahap sampling yang ditugaskan
 * kepadanya sebagai pengambil sampel. Data lama tanpa pengambil sampel tetap menjadi antrean
 * bersama bagi penguji yang menguasai seluruh metode ujinya.
 */
export const pengujiScopeWhere = (pengujiId: string): Prisma.PermintaanPengujianWhereInput => ({
  OR: [
    { petugasQcId: pengujiId },
    { status: PERMINTAAN_STATUS.SAMPLING, petugasQcId: null, pengambilSampelId: pengujiId },
    {
      status: PERMINTAAN_STATUS.SAMPLING,
      petugasQcId: null,
      pengambilSampelId: null,
      parameters: { none: { checked: true, metodeRef: { is: { pengujiTestMethods: { none: { pengujiId } } } } } },
    },
  ],
});

export const buildPermintaanWhere = (
  filters: Partial<PermintaanListQuery>,
  scopeStatuses?: string[],
  pengujiId?: string | null
): Prisma.PermintaanPengujianWhereInput => {
  const and: Prisma.PermintaanPengujianWhereInput[] = [];

  if (scopeStatuses?.length) and.push({ status: { in: scopeStatuses } });
  if (pengujiId) and.push(pengujiScopeWhere(pengujiId));

  const q = filters.search?.trim();
  if (q) and.push({ OR: SEARCH_FIELDS.map((f) => ({ [f]: { contains: q } })) });

  const statuses = filters.status?.split(',').map((s) => s.trim()).filter(Boolean);
  if (statuses?.length) and.push({ status: { in: statuses } });

  if (filters.komoditas?.trim()) and.push({ komoditas: filters.komoditas.trim() });
  if (filters.prioritas?.trim()) and.push({ prioritas: filters.prioritas.trim() });
  if (filters.petugasQcId?.trim()) and.push({ petugasQcId: filters.petugasQcId.trim() });
  if (filters.hasilAkhir) and.push({ hasilAkhir: filters.hasilAkhir });

  const now = new Date();
  if (filters.periode === 'today') {
    and.push({ tanggal: { gte: startOfDay(now), lte: endOfDay(now) } });
  } else if (filters.periode === 'week') {
    and.push({ tanggal: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } });
  } else if (filters.periode === 'month') {
    and.push({ tanggal: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } });
  }

  if (filters.startDate) and.push({ tanggal: { gte: startOfDay(filters.startDate) } });
  if (filters.endDate) and.push({ tanggal: { lte: endOfDay(filters.endDate) } });

  return and.length ? { AND: and } : {};
};

export const permintaanPengujianRepository = {
  findAll: async (filters: Partial<PermintaanListQuery>, scopeStatuses?: string[], pengujiId?: string | null) => {
    const where = buildPermintaanWhere(filters, scopeStatuses, pengujiId);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || filters.limit || 10;
    const sortBy = filters.sortBy || 'updatedAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [total, data] = await prisma.$transaction([
      prisma.permintaanPengujian.count({ where }),
      prisma.permintaanPengujian.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ [sortBy]: sortOrder }, { id: 'asc' }],
        include: permintaanListInclude,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  /** Menerima UUID maupun nomor dokumen (noPermintaan / noPengujian). */
  findByIdOrNumber: (idOrNumber: string, db: Db = prisma) =>
    db.permintaanPengujian.findFirst({
      where: { OR: [{ id: idOrNumber }, { noPermintaan: idOrNumber }, { noPengujian: idOrNumber }] },
      include: permintaanDetailInclude,
    }),

  findDetailById: (id: string, db: Db = prisma) =>
    db.permintaanPengujian.findUnique({ where: { id }, include: permintaanDetailInclude }),

  countByStatus: async (where: Prisma.PermintaanPengujianWhereInput) => {
    const rows = await prisma.permintaanPengujian.groupBy({ by: ['status'], where, _count: { _all: true } });
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = r._count._all;
      return acc;
    }, {});
  },

  countByHasil: async (where: Prisma.PermintaanPengujianWhereInput) => {
    const rows = await prisma.permintaanPengujian.groupBy({
      by: ['status', 'hasilAkhir'],
      where,
      _count: { _all: true },
    });
    return rows.map((r) => ({ status: r.status, hasilAkhir: r.hasilAkhir, total: r._count._all }));
  },

  /** Nomor dokumen berurutan per tahun, contoh `RQ-QC-2026-00001`. */
  generateNumber: async (
    field: 'noPermintaan' | 'noPengujian' | 'noSampel',
    prefixBase: string,
    db: Db = prisma
  ): Promise<string> => {
    const prefix = `${prefixBase}-${new Date().getFullYear()}-`;
    const latest = await db.permintaanPengujian.findFirst({
      where: { [field]: { startsWith: prefix } },
      orderBy: { [field]: 'desc' },
      select: { [field]: true },
    });
    const lastValue = (latest as Record<string, string | null> | null)?.[field];
    const lastSeq = lastValue ? parseInt(lastValue.slice(prefix.length), 10) : 0;
    return `${prefix}${String((Number.isFinite(lastSeq) ? lastSeq : 0) + 1).padStart(5, '0')}`;
  },

  /** Cari permintaan lain yang sudah memakai batch yang sama (1 batch = 1 permintaan). */
  findOtherByBatch: (batch: { id: string; kodeBatch: string }, excludeId?: string, db: Db = prisma) =>
    db.permintaanPengujian.findFirst({
      where: {
        OR: [{ batchProduksiId: batch.id }, { kodeBatch: batch.kodeBatch }],
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true, noPermintaan: true },
    }),

  /** Batch produksi yang belum pernah diajukan pengujian (opsional: kecuali milik permintaan tertentu). */
  findAvailableBatches: async (excludePermintaanId?: string) => {
    const used = await prisma.permintaanPengujian.findMany({
      where: excludePermintaanId ? { NOT: { id: excludePermintaanId } } : {},
      select: { kodeBatch: true, batchProduksiId: true },
    });
    const usedCodes = used.map((u) => u.kodeBatch).filter(Boolean);
    const usedIds = used.map((u) => u.batchProduksiId).filter((v): v is string => Boolean(v));

    return prisma.batchProduksi.findMany({
      where: {
        AND: [
          usedCodes.length ? { kodeBatch: { notIn: usedCodes } } : {},
          usedIds.length ? { id: { notIn: usedIds } } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Catat riwayat alur sekaligus audit trail-nya dalam transaksi yang sama. */
  addRiwayat: async (
    db: Db,
    data: { permintaanId: string; aksi: string; statusDari?: string | null; statusKe?: string | null; keterangan?: string | null; oleh: string }
  ) => {
    const riwayat = await db.permintaanPengujianRiwayat.create({ data });
    const permintaan = await db.permintaanPengujian.findUnique({
      where: { id: data.permintaanId },
      select: { noPermintaan: true, noPengujian: true },
    });
    const tahap = tahapAudit(data.statusDari);
    const statusBerubah = data.statusKe != null && data.statusDari !== data.statusKe;
    await recordAudit(
      {
        ...tahap,
        aksi: data.statusDari == null ? AUDIT_AKSI.CREATE : AUDIT_AKSI.UPDATE,
        entitasId: data.permintaanId,
        entitasKode: permintaan?.noPengujian || permintaan?.noPermintaan,
        keterangan: [data.aksi, data.keterangan].filter(Boolean).join(' — '),
        perubahan: statusBerubah
          ? [{ field: 'status', label: 'Status', sebelum: data.statusDari ?? null, sesudah: data.statusKe ?? null }]
          : undefined,
      },
      db
    );
    return riwayat;
  },
};
