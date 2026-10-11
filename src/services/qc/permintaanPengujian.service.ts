import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { recordAudit } from '../audit/audit.service';
import { AUDIT_AKSI } from '../../constants/audit.constants';
import { deleteFile } from '../../utils/minio';
import { badRequest, conflict, notFound } from '../../utils/httpError';
import {
  permintaanPengujianRepository as repo,
  buildPermintaanWhere,
} from '../../repositories/permintaanPengujian.repository';
import { qcLookupService } from './qcLookup.service';
import { metodeBelumDikuasai } from './pengujiScope.service';
import {
  PERMINTAAN_STATUS,
  EDITABLE_STATUSES,
  QC_LOOKUP_KATEGORI,
  QC_NUMBER_PREFIX,
  DOKUMEN_KATEGORI,
  PermintaanStatus,
} from '../../constants/qc.constants';
import { CreatePermintaanInput, PermintaanListQuery } from '../../validators/qc.validator';

type Tx = Prisma.TransactionClient;

export interface UploadedDoc {
  namaFile: string;
  fileUrl: string;
  tipeFile?: string | null;
  ukuran?: string | null;
}

const formatTanggal = (d?: Date | null) =>
  d ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const formatBatas = (batas?: string | null, satuan?: string | null) =>
  batas ? `${batas} ${satuan || ''}`.trim() : null;

/**
 * Data batch beserta asal panen (petani, lahan, tanggal panen) berdasarkan
 * relasi `batch_produksi.sumberBahan` → `panen.kodePanen`.
 */
const enrichBatches = async <T extends { sumberBahan: string }>(batches: T[], db: Tx | typeof prisma = prisma) => {
  const kodePanen = [...new Set(batches.map((b) => b.sumberBahan).filter(Boolean))];
  const panens = kodePanen.length
    ? await db.panen.findMany({
        where: { kodePanen: { in: kodePanen } },
        select: { kodePanen: true, petani: true, lahan: true, blokLahan: true, tanggalPanen: true },
      })
    : [];
  const panenMap = new Map(panens.map((p) => [p.kodePanen, p]));

  return batches.map((b) => {
    const panen = panenMap.get(b.sumberBahan);
    return {
      ...b,
      asalPanen: panen
        ? {
            kodePanen: panen.kodePanen,
            petani: panen.petani,
            lahan: [panen.lahan, panen.blokLahan].filter(Boolean).join(' / ') || null,
            tanggalPanen: panen.tanggalPanen,
          }
        : null,
    };
  });
};

const resolveBatchSnapshot = async (tx: Tx, batchProduksiId: string, excludePermintaanId?: string) => {
  const batch = await tx.batchProduksi.findUnique({ where: { id: batchProduksiId } });
  if (!batch) throw badRequest('Batch produksi tidak ditemukan');

  const used = await repo.findOtherByBatch(batch, excludePermintaanId, tx);
  if (used) {
    throw conflict(
      `Batch ${batch.kodeBatch} sudah diajukan pengujian dengan nomor ${used.noPermintaan}. Satu batch hanya dapat diajukan satu kali.`
    );
  }

  const [enriched] = await enrichBatches([batch], tx);
  return {
    batchProduksiId: batch.id,
    kodeBatch: batch.kodeBatch,
    komoditas: batch.komoditas,
    varietas: batch.varietas,
    petani: enriched?.asalPanen?.petani ?? null,
    lahan: enriched?.asalPanen?.lahan ?? batch.lokasi ?? null,
    panen: formatTanggal(enriched?.asalPanen?.tanggalPanen),
  };
};

/**
 * Snapshot parameter dari master `test_parameters` (bukan dari input client).
 * Parameter yang BARU ditambahkan wajib berstatus Aktif dan metode ujinya Aktif; parameter yang sudah
 * tercatat di permintaan (`existingIds`) tetap boleh dipertahankan walau masternya kini nonaktif.
 */
const buildParameterRows = async (tx: Tx, input: CreatePermintaanInput['parameters'], existingIds: Set<string> = new Set()) => {
  const ids = [...new Set(input.map((p) => p.parameterId))];
  const masters = await tx.testParameter.findMany({
    where: { id: { in: ids } },
    include: { metode: { select: { id: true, kode: true, nama: true, status: true } } },
  });
  if (masters.length !== ids.length) {
    throw badRequest('Sebagian parameter uji tidak ditemukan di master parameter');
  }
  const tidakAktif = masters
    .filter((m) => !existingIds.has(m.id))
    .filter((m) => m.status !== 'Aktif' || (m.metode && m.metode.status !== 'Aktif'))
    .map((m) => (m.status !== 'Aktif' ? `${m.nama} (parameter nonaktif)` : `${m.nama} (metode ${m.metode!.nama} nonaktif)`));
  if (tidakAktif.length) {
    throw badRequest(`Hanya parameter aktif dari metode uji aktif yang dapat ditambahkan: ${tidakAktif.join(', ')}`);
  }
  const masterMap = new Map(masters.map((m) => [m.id, m]));
  const checkedMap = new Map(input.map((p) => [p.parameterId, p.checked ?? true]));

  return ids.map((id) => {
    const m = masterMap.get(id)!;
    return {
      parameterId: m.id,
      kode: m.kode,
      nama: m.nama,
      kategori: m.kategori,
      satuan: m.satuan,
      definisi: m.definisi,
      keterangan: m.keterangan,
      batasAcuan: m.batasAcuan,
      standar: formatBatas(m.batasAcuan, m.satuan),
      metodeId: m.metode?.id ?? null,
      metodeKode: m.metode?.kode ?? null,
      metodeNama: m.metode?.nama ?? null,
      metode: m.metode ? `${m.metode.kode} - ${m.metode.nama}` : null,
      checked: checkedMap.get(id) ?? true,
      isCustom: false,
    };
  });
};

const validateLookups = async (input: CreatePermintaanInput) => {
  await Promise.all([
    qcLookupService.assertValid(QC_LOOKUP_KATEGORI.PEMOHON, input.pemohon, 'Pemohon'),
    qcLookupService.assertValid(QC_LOOKUP_KATEGORI.PRIORITAS, input.prioritas, 'Prioritas'),
    qcLookupService.assertValid(QC_LOOKUP_KATEGORI.SATUAN_SAMPEL, input.satuanSampel, 'Satuan sampel'),
    qcLookupService.assertValid(QC_LOOKUP_KATEGORI.METODE_SAMPLING, input.metodeSampling, 'Metode sampling'),
  ]);
};

const resolvePengambilSampel = async (tx: Tx, pengujiId: string) => {
  const penguji = await tx.penguji.findUnique({ where: { id: pengujiId }, select: { id: true, nama: true, status: true } });
  if (!penguji || penguji.status !== 'Aktif') throw badRequest('Pengambil sampel tidak ditemukan atau tidak aktif');
  return penguji;
};

/** Pengambil sampel adalah penguji yang akan mengerjakan pengujian, jadi wajib menguasai metode ujinya. */
const assertPengambilMenguasaiMetode = async (
  pengambil: { id: string; nama: string },
  parameters: Awaited<ReturnType<typeof buildParameterRows>>
) => {
  const kurang = await metodeBelumDikuasai(pengambil.id, parameters);
  if (kurang.length) {
    throw badRequest(
      `Penguji ${pengambil.nama} belum menguasai metode uji: ${kurang.join(', ')}. ` +
        'Pilih penguji lain atau perbarui kompetensi penguji tersebut.'
    );
  }
};

const isUniqueViolation = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';

/**
 * Menjalankan operasi yang membuat nomor dokumen berurutan; diulang bila dua request
 * bersamaan mendapat nomor yang sama (unique constraint violation).
 */
export const withNumberRetry = async <T>(fn: () => Promise<T>, attempts = 3): Promise<T> => {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts || !isUniqueViolation(err)) throw err;
    }
  }
};

export const getPermintaanOrThrow = async (idOrNumber: string) => {
  const item = await repo.findByIdOrNumber(idOrNumber);
  if (!item) throw notFound('Permintaan pengujian tidak ditemukan');
  return item;
};

export const assertStatus = (current: string, allowed: PermintaanStatus[], action: string) => {
  if (!allowed.includes(current as PermintaanStatus)) {
    throw conflict(`Tidak dapat ${action} karena status permintaan saat ini "${current}".`);
  }
};

export const permintaanPengujianService = {
  list: (query: PermintaanListQuery) => repo.findAll(query),

  summary: async (filters: { startDate?: Date | null; endDate?: Date | null }) => {
    const where = buildPermintaanWhere(filters);
    const counts = await repo.countByStatus(where);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      total,
      menungguPersetujuan: counts[PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN] || 0,
      sampling: counts[PERMINTAAN_STATUS.SAMPLING] || 0,
      dalamPengujian: counts[PERMINTAAN_STATUS.DALAM_PENGUJIAN] || 0,
      menungguReview: counts[PERMINTAAN_STATUS.MENUNGGU_REVIEW] || 0,
      selesai: counts[PERMINTAAN_STATUS.SELESAI] || 0,
      ditolak: counts[PERMINTAAN_STATUS.DITOLAK] || 0,
    };
  },

  nextNumber: () => repo.generateNumber('noPermintaan', QC_NUMBER_PREFIX.PERMINTAAN),

  batchOptions: async (excludePermintaanId?: string) => {
    let excludeId: string | undefined;
    if (excludePermintaanId) excludeId = (await getPermintaanOrThrow(excludePermintaanId)).id;
    const batches = await repo.findAvailableBatches(excludeId);
    return enrichBatches(batches);
  },

  getById: getPermintaanOrThrow,

  create: async (input: CreatePermintaanInput, actor: string, uploaded?: UploadedDoc) => {
    await validateLookups(input);

    const id = await withNumberRetry(() =>
      prisma.$transaction(async (tx) => {
        const batch = await resolveBatchSnapshot(tx, input.batchProduksiId);
        const pengambil = await resolvePengambilSampel(tx, input.pengambilSampelId);
        const parameters = await buildParameterRows(tx, input.parameters);
        await assertPengambilMenguasaiMetode(pengambil, parameters);
        const noPermintaan = await repo.generateNumber('noPermintaan', QC_NUMBER_PREFIX.PERMINTAAN, tx);

        const created = await tx.permintaanPengujian.create({
          data: {
            noPermintaan,
            tanggal: input.tanggal,
            ...batch,
            jumlahSampel: input.jumlahSampel,
            satuanSampel: input.satuanSampel,
            metodeSampling: input.metodeSampling,
            pengambilSampelId: pengambil.id,
            pengambilSampel: pengambil.nama,
            pemohon: input.pemohon,
            prioritas: input.prioritas,
            catatan: input.catatan ?? null,
            status: PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN,
            dibuatOleh: actor,
            diubahOleh: actor,
            ...(uploaded ? { fileLampiranUrl: uploaded.fileUrl, fileLampiranNama: uploaded.namaFile } : {}),
            parameters: { create: parameters },
            ...(uploaded
              ? { dokumen: { create: [{ ...uploaded, kategori: DOKUMEN_KATEGORI.PERMINTAAN, diunggahOleh: actor }] } }
              : {}),
          },
        });

        await repo.addRiwayat(tx, {
          permintaanId: created.id,
          aksi: 'Permintaan dibuat',
          statusKe: created.status,
          oleh: actor,
        });
        return created.id;
      })
    );

    return repo.findDetailById(id);
  },

  update: async (idOrNumber: string, input: CreatePermintaanInput, actor: string, uploaded?: UploadedDoc) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, EDITABLE_STATUSES, 'mengubah permintaan');
    await validateLookups(input);

    const resubmit = existing.status === PERMINTAAN_STATUS.DITOLAK;

    await prisma.$transaction(async (tx) => {
      const batch = await resolveBatchSnapshot(tx, input.batchProduksiId, existing.id);
      const pengambil = await resolvePengambilSampel(tx, input.pengambilSampelId);
      const existingIds = new Set(existing.parameters.map((p) => p.parameterId).filter((v): v is string => Boolean(v)));
      const parameters = await buildParameterRows(tx, input.parameters, existingIds);
      await assertPengambilMenguasaiMetode(pengambil, parameters);

      await tx.permintaanPengujianParameter.deleteMany({ where: { permintaanId: existing.id } });
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: {
          tanggal: input.tanggal,
          ...batch,
          jumlahSampel: input.jumlahSampel,
          satuanSampel: input.satuanSampel,
          metodeSampling: input.metodeSampling,
          pengambilSampelId: pengambil.id,
          pengambilSampel: pengambil.nama,
          pemohon: input.pemohon,
          prioritas: input.prioritas,
          catatan: input.catatan ?? null,
          diubahOleh: actor,
          ...(resubmit ? { status: PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN, alasanPenolakan: null } : {}),
          ...(uploaded ? { fileLampiranUrl: uploaded.fileUrl, fileLampiranNama: uploaded.namaFile } : {}),
          parameters: { create: parameters },
          ...(uploaded
            ? { dokumen: { create: [{ ...uploaded, kategori: DOKUMEN_KATEGORI.PERMINTAAN, diunggahOleh: actor }] } }
            : {}),
        },
      });

      await repo.addRiwayat(tx, {
        permintaanId: existing.id,
        aksi: resubmit ? 'Permintaan diajukan ulang' : 'Permintaan diperbarui',
        statusDari: existing.status,
        statusKe: resubmit ? PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN : existing.status,
        oleh: actor,
      });
    });

    return repo.findDetailById(existing.id);
  },

  approve: async (idOrNumber: string, actor: string, catatan?: string | null) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN], 'menyetujui permintaan');

    await prisma.$transaction(async (tx) => {
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: {
          status: PERMINTAAN_STATUS.SAMPLING,
          disetujuiOleh: actor,
          tanggalDisetujui: new Date(),
          alasanPenolakan: null,
          diubahOleh: actor,
        },
      });
      await repo.addRiwayat(tx, {
        permintaanId: existing.id,
        aksi: 'Permintaan disetujui',
        statusDari: existing.status,
        statusKe: PERMINTAAN_STATUS.SAMPLING,
        keterangan: catatan ?? null,
        oleh: actor,
      });
    });
    return repo.findDetailById(existing.id);
  },

  reject: async (idOrNumber: string, actor: string, alasan: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.MENUNGGU_PERSETUJUAN], 'menolak permintaan');

    await prisma.$transaction(async (tx) => {
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: { status: PERMINTAAN_STATUS.DITOLAK, alasanPenolakan: alasan, diubahOleh: actor },
      });
      await repo.addRiwayat(tx, {
        permintaanId: existing.id,
        aksi: 'Permintaan ditolak',
        statusDari: existing.status,
        statusKe: PERMINTAAN_STATUS.DITOLAK,
        keterangan: alasan,
        oleh: actor,
      });
    });
    return repo.findDetailById(existing.id);
  },

  delete: async (idOrNumber: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, EDITABLE_STATUSES, 'menghapus permintaan');

    await prisma.$transaction(async (tx) => {
      await tx.permintaanPengujian.delete({ where: { id: existing.id } });
      await recordAudit(
        {
          modul: 'Permintaan Pengujian',
          aksi: AUDIT_AKSI.DELETE,
          entitas: 'Permintaan Pengujian',
          entitasId: existing.id,
          entitasKode: existing.noPermintaan,
          keterangan: `Menghapus permintaan pengujian batch ${existing.kodeBatch}`,
        },
        tx
      );
    });
    // Bersihkan file di storage setelah data terhapus (best effort).
    await Promise.allSettled(existing.dokumen.map((d) => deleteFile(d.fileUrl)));
  },
};
