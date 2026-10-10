import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { deleteFile } from '../../utils/minio';
import { badRequest, conflict, notFound } from '../../utils/httpError';
import { TestMethodInput } from '../../validators/qc.validator';

type Tx = Prisma.TransactionClient;

export const testMethodInclude = {
  standar: true,
  document: true,
  dokumen: { orderBy: { createdAt: 'asc' } },
  testParameters: { orderBy: { kode: 'asc' } },
  riwayat: { orderBy: { createdAt: 'desc' }, take: 20 },
} satisfies Prisma.TestMethodInclude;

/** Label kolom untuk keterangan riwayat perubahan. */
const FIELD_LABELS: Partial<Record<keyof TestMethodInput, string>> = {
  kode: 'Kode',
  nama: 'Nama',
  jenisUji: 'Jenis uji',
  standarId: 'Standar acuan',
  komoditas: 'Komoditas',
  varietas: 'Varietas',
  tipe: 'Tipe',
  deskripsi: 'Prosedur',
  alatDigunakan: 'Alat',
  versiMetode: 'Versi',
  tanggalBerlaku: 'Tanggal berlaku',
  catatan: 'Catatan',
  status: 'Status',
};

const normalize = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);

/** Kode parameter berikutnya dengan pola `P001`, `P002`, ... */
const nextParameterKode = async (tx: Tx) => {
  const rows = await tx.testParameter.findMany({ where: { kode: { startsWith: 'P' } }, select: { kode: true } });
  const max = rows.reduce((acc, r) => {
    const m = r.kode.match(/^P(\d+)$/);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  let seq = max;
  return () => `P${String(++seq).padStart(3, '0')}`;
};

const toMethodData = (input: TestMethodInput) => ({
  kode: input.kode,
  nama: input.nama,
  jenisUji: input.jenisUji,
  deskripsi: input.deskripsi ?? null,
  status: input.status,
  komoditas: input.komoditas ?? null,
  varietas: input.varietas ?? null,
  tipe: input.tipe ?? null,
  standarId: input.standarId ?? null,
  documentId: input.documentId ?? null,
  alatDigunakan: input.alatDigunakan ?? null,
  versiMetode: input.versiMetode ?? null,
  tanggalBerlaku: input.tanggalBerlaku ?? null,
  catatan: input.catatan ?? null,
});

const assertReferences = async (input: TestMethodInput) => {
  if (input.standarId && !(await prisma.referenceStandard.findUnique({ where: { id: input.standarId } }))) {
    throw badRequest('Standar acuan tidak ditemukan');
  }
  if (input.documentId && !(await prisma.supportDocument.findUnique({ where: { id: input.documentId } }))) {
    throw badRequest('Dokumen pendukung tidak ditemukan');
  }
};

/**
 * Sinkronisasi parameter metode: parameter lama di-update berdasarkan id (agar relasi
 * `permintaan_pengujian_parameters.parameterId` tidak putus), yang baru dibuat,
 * dan yang dihapus dari form dihapus dari master.
 */
const syncParameters = async (tx: Tx, methodId: string, input: TestMethodInput) => {
  if (!input.testParameters) return;
  const existing = await tx.testParameter.findMany({ where: { metodeId: methodId }, select: { id: true } });
  const existingIds = new Set(existing.map((p) => p.id));
  const keepIds = input.testParameters.map((p) => p.id).filter((id): id is string => !!id && existingIds.has(id));

  await tx.testParameter.deleteMany({ where: { metodeId: methodId, id: { notIn: keepIds } } });

  const genKode = await nextParameterKode(tx);
  for (const p of input.testParameters) {
    const data = {
      nama: p.nama,
      satuan: p.satuan ?? null,
      batasAcuan: p.batasAcuan ?? null,
      definisi: p.definisi ?? null,
      keterangan: p.keterangan ?? null,
      status: p.status ?? 'Aktif',
    };
    if (p.id && existingIds.has(p.id)) {
      // Kategori lama dipertahankan bila tidak dikirim.
      await tx.testParameter.update({ where: { id: p.id }, data: { ...data, ...(p.kategori ? { kategori: p.kategori } : {}) } });
    } else {
      await tx.testParameter.create({
        data: { ...data, kategori: p.kategori ?? input.jenisUji, kode: p.kode || genKode(), metodeId: methodId },
      });
    }
  }
};

const syncDokumen = async (tx: Tx, methodId: string, input: TestMethodInput) => {
  if (!input.dokumen) return [] as string[];
  const existing = await tx.testMethodDocument.findMany({ where: { testMethodId: methodId } });
  const newUrls = new Set(input.dokumen.map((d) => d.fileUrl));
  const removed = existing.filter((d) => !newUrls.has(d.fileUrl));
  const existingUrls = new Set(existing.map((d) => d.fileUrl));

  await tx.testMethodDocument.deleteMany({ where: { id: { in: removed.map((d) => d.id) } } });
  const baru = input.dokumen.filter((d) => !existingUrls.has(d.fileUrl));
  if (baru.length) {
    await tx.testMethodDocument.createMany({
      data: baru.map((d) => ({
        testMethodId: methodId,
        namaFile: d.namaFile,
        fileUrl: d.fileUrl,
        tipeFile: d.tipeFile ?? d.namaFile.split('.').pop()?.toLowerCase() ?? null,
        ukuran: d.ukuran ?? null,
      })),
    });
  }
  return removed.map((d) => d.fileUrl);
};

export const testMethodService = {
  findAll: (filters: {
    search?: string;
    jenisUji?: string;
    komoditas?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const where: Prisma.TestMethodWhereInput = {};
    if (filters.search) {
      where.OR = (['kode', 'nama', 'jenisUji', 'komoditas', 'varietas'] as const).map((f) => ({
        [f]: { contains: filters.search },
      }));
    }
    if (filters.jenisUji) where.jenisUji = filters.jenisUji;
    // Metode berlaku untuk komoditas tertentu atau untuk semua komoditas.
    if (filters.komoditas) {
      where.AND = [
        { OR: [{ komoditas: { contains: filters.komoditas } }, { komoditas: 'Semua Komoditas' }, { komoditas: null }] },
      ];
    }
    if (filters.status) where.status = filters.status;

    return prisma.testMethod.findMany({
      where,
      include: testMethodInclude,
      orderBy: { [filters.sortBy || 'updatedAt']: filters.sortOrder || 'desc' },
    });
  },

  findById: async (id: string) => {
    const data = await prisma.testMethod.findUnique({ where: { id }, include: testMethodInclude });
    if (!data) throw notFound('Metode uji tidak ditemukan');
    return data;
  },

  recentRiwayat: (limit = 10) =>
    prisma.testMethodRiwayat.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { testMethod: { select: { id: true, kode: true, nama: true } } },
    }),

  create: async (input: TestMethodInput, actor: string) => {
    await assertReferences(input);
    const id = await prisma.$transaction(async (tx) => {
      const created = await tx.testMethod.create({ data: toMethodData(input) });
      await syncParameters(tx, created.id, input);
      await syncDokumen(tx, created.id, input);
      await tx.testMethodRiwayat.create({
        data: { testMethodId: created.id, aksi: 'Tambah Data', keterangan: 'Metode uji baru ditambahkan', oleh: actor },
      });
      return created.id;
    });
    return testMethodService.findById(id);
  },

  update: async (id: string, input: TestMethodInput, actor: string) => {
    const before = await testMethodService.findById(id);
    await assertReferences(input);
    const data = toMethodData(input);

    const changed = (Object.keys(FIELD_LABELS) as (keyof typeof data)[])
      .filter((k) => normalize(data[k]) !== normalize(before[k as keyof typeof before]))
      .map((k) => FIELD_LABELS[k as keyof TestMethodInput]);
    const statusChanged = before.status !== data.status;

    const removedFiles = await prisma.$transaction(async (tx) => {
      await tx.testMethod.update({ where: { id }, data });
      await syncParameters(tx, id, input);
      const removed = await syncDokumen(tx, id, input);

      const keterangan = [
        changed.length ? `Perubahan: ${changed.join(', ')}` : null,
        input.testParameters ? `${input.testParameters.length} parameter` : null,
      ]
        .filter(Boolean)
        .join(' • ');
      await tx.testMethodRiwayat.create({
        data: {
          testMethodId: id,
          aksi: statusChanged ? (data.status === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan') : 'Update Data',
          keterangan: keterangan || 'Data metode uji diperbarui',
          oleh: actor,
        },
      });
      return removed;
    });

    await Promise.allSettled(removedFiles.map((url) => deleteFile(url)));
    return testMethodService.findById(id);
  },

  delete: async (id: string) => {
    const method = await prisma.testMethod.findUnique({
      where: { id },
      include: { dokumen: true, _count: { select: { qcTests: true, permintaanParameters: true } } },
    });
    if (!method) throw notFound('Metode uji tidak ditemukan');
    if (method._count.qcTests || method._count.permintaanParameters) {
      throw conflict('Metode uji sudah digunakan pada data pengujian. Nonaktifkan metode ini alih-alih menghapusnya.');
    }
    await prisma.testMethod.delete({ where: { id } });
    await Promise.allSettled(method.dokumen.map((d) => deleteFile(d.fileUrl)));
  },
};
