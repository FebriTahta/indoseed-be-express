import prisma from '../../utils/prisma';
import { deleteFile } from '../../utils/minio';
import { badRequest, notFound, unprocessable } from '../../utils/httpError';
import { evaluateHasil } from '../../utils/batasAcuan';
import {
  permintaanPengujianRepository as repo,
  buildPermintaanWhere,
} from '../../repositories/permintaanPengujian.repository';
import { getPermintaanOrThrow, assertStatus, withNumberRetry, UploadedDoc } from './permintaanPengujian.service';
import { qcLookupService } from './qcLookup.service';
import {
  PERMINTAAN_STATUS,
  PEMERIKSAAN_STATUSES,
  HASIL_STATUSES,
  HASIL_AKHIR,
  QC_LOOKUP_KATEGORI,
  QC_NUMBER_PREFIX,
  DOKUMEN_KATEGORI,
  rekomendasiDari,
} from '../../constants/qc.constants';
import {
  PermintaanListQuery,
  TerimaSampelInput,
  SimpanHasilInput,
  ReviewHasilInput,
} from '../../validators/qc.validator';

type ParamResult = { checked: boolean; statusHasil: string | null };

/** Kesimpulan otomatis: null bila masih ada parameter aktif yang belum memiliki hasil. */
export const hitungHasilAkhir = (params: ParamResult[]) => {
  const aktif = params.filter((p) => p.checked);
  if (!aktif.length || aktif.some((p) => !p.statusHasil)) return null;
  return aktif.some((p) => p.statusHasil === HASIL_AKHIR.TIDAK_LULUS) ? HASIL_AKHIR.TIDAK_LULUS : HASIL_AKHIR.LULUS;
};

/** "-6.2900, 107.6700" → { lat, lng } */
const parseKoordinat = (raw?: string | null) => {
  const [lat, lng] = (raw || '').split(',').map((v) => Number(v.trim()));
  return Number.isFinite(lat) && Number.isFinite(lng) && raw ? { lat: lat as number, lng: lng as number } : null;
};

/**
 * Lokasi asal sampel: batch_produksi.sumberBahan → panen → jadwal_tanam → greenhouse (lahan + koordinat).
 */
const resolveLokasiAsal = async (kodePanen?: string | null) => {
  if (!kodePanen) return null;
  const panen = await prisma.panen.findUnique({
    where: { kodePanen },
    select: {
      lahan: true,
      blokLahan: true,
      jadwalTanam: {
        select: { greenhouse: { select: { kodeLahan: true, namaLahan: true, lokasi: true, koordinat: true } } },
      },
    },
  });
  if (!panen) return null;
  const gh = panen.jadwalTanam?.greenhouse;
  return {
    kodeLahan: gh?.kodeLahan ?? null,
    namaLahan: gh?.namaLahan ?? ([panen.lahan, panen.blokLahan].filter(Boolean).join(' / ') || null),
    lokasi: gh?.lokasi ?? null,
    koordinat: gh?.koordinat ?? null,
    posisi: parseKoordinat(gh?.koordinat),
  };
};

const pemeriksaanScope = PEMERIKSAAN_STATUSES as string[];
const hasilScope = HASIL_STATUSES as string[];

export const pemeriksaanPengujianService = {
  /** Detail lengkap + lokasi asal sampel untuk halaman pemeriksaan. */
  getDetail: async (idOrNumber: string) => {
    const item = await getPermintaanOrThrow(idOrNumber);
    return { ...item, lokasiAsal: await resolveLokasiAsal(item.batchProduksi?.sumberBahan) };
  },

  list: (query: PermintaanListQuery) => repo.findAll({ sortBy: 'updatedAt', ...query }, pemeriksaanScope),

  summary: async (filters: { startDate?: Date | null; endDate?: Date | null }) => {
    const counts = await repo.countByStatus(buildPermintaanWhere(filters, pemeriksaanScope));
    return {
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      sampling: counts[PERMINTAAN_STATUS.SAMPLING] || 0,
      dalamPengujian: counts[PERMINTAAN_STATUS.DALAM_PENGUJIAN] || 0,
      menungguReview: counts[PERMINTAAN_STATUS.MENUNGGU_REVIEW] || 0,
      selesai: counts[PERMINTAAN_STATUS.SELESAI] || 0,
    };
  },

  listHasil: (query: PermintaanListQuery) =>
    repo.findAll({ sortBy: 'tanggalSelesaiUji', ...query }, hasilScope),

  summaryHasil: async (filters: { startDate?: Date | null; endDate?: Date | null }) => {
    const rows = await repo.countByHasil(buildPermintaanWhere(filters, hasilScope));
    const sum = (pred: (r: (typeof rows)[number]) => boolean) =>
      rows.filter(pred).reduce((a, r) => a + r.total, 0);
    return {
      total: sum(() => true),
      menungguReview: sum((r) => r.status === PERMINTAAN_STATUS.MENUNGGU_REVIEW),
      lulus: sum((r) => r.status === PERMINTAAN_STATUS.SELESAI && r.hasilAkhir === HASIL_AKHIR.LULUS),
      tidakLulus: sum((r) => r.status === PERMINTAAN_STATUS.SELESAI && r.hasilAkhir === HASIL_AKHIR.TIDAK_LULUS),
    };
  },

  /** Sampel diterima lab → mulai pengujian (status Sampling → Dalam Pengujian). */
  terimaSampel: async (idOrNumber: string, input: TerimaSampelInput, actor: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.SAMPLING], 'memulai pengujian');
    await qcLookupService.assertValid(QC_LOOKUP_KATEGORI.KONDISI_SAMPEL, input.kondisiSampel, 'Kondisi sampel');

    const petugas = await prisma.penguji.findUnique({ where: { id: input.petugasQcId } });
    if (!petugas || petugas.status !== 'Aktif') throw badRequest('Petugas QC tidak ditemukan atau tidak aktif');
    const laboratoriumId = input.laboratoriumId || petugas.laboratoriumId;
    if (laboratoriumId && !(await prisma.laboratorium.findUnique({ where: { id: laboratoriumId } }))) {
      throw badRequest('Laboratorium tidak ditemukan');
    }

    await withNumberRetry(() =>
      prisma.$transaction(async (tx) => {
        const noPengujian =
          existing.noPengujian || (await repo.generateNumber('noPengujian', QC_NUMBER_PREFIX.PENGUJIAN, tx));
        const noSampel = existing.noSampel || (await repo.generateNumber('noSampel', QC_NUMBER_PREFIX.SAMPEL, tx));

        await tx.permintaanPengujian.update({
          where: { id: existing.id },
          data: {
            status: PERMINTAAN_STATUS.DALAM_PENGUJIAN,
            noPengujian,
            noSampel,
            petugasQcId: petugas.id,
            laboratoriumId: laboratoriumId ?? null,
            tanggalSampling: input.tanggalSampling,
            kondisiSampel: input.kondisiSampel,
            tanggalMulaiUji: new Date(),
            diubahOleh: actor,
          },
        });
        await repo.addRiwayat(tx, {
          permintaanId: existing.id,
          aksi: 'Sampel diterima & pengujian dimulai',
          statusDari: existing.status,
          statusKe: PERMINTAAN_STATUS.DALAM_PENGUJIAN,
          keterangan: [`Petugas: ${petugas.nama}`, `Kondisi: ${input.kondisiSampel}`, input.catatan]
            .filter(Boolean)
            .join(' • '),
          oleh: actor,
        });
      })
    );
    return repo.findDetailById(existing.id);
  },

  /** Simpan (draft) hasil per parameter; status lulus dievaluasi otomatis dari batas acuan. */
  simpanHasil: async (idOrNumber: string, input: SimpanHasilInput, actor: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.DALAM_PENGUJIAN], 'menyimpan hasil pengujian');

    const paramMap = new Map(existing.parameters.map((p) => [p.id, p]));
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      for (const row of input.parameters) {
        const param = paramMap.get(row.id);
        if (!param) throw badRequest('Parameter tidak termasuk dalam permintaan ini');
        if (!param.checked) continue;

        const nilaiHasil = row.nilaiHasil ?? null;
        const otomatis = evaluateHasil(nilaiHasil, param.batasAcuan ?? param.standar);
        const statusHasil = otomatis ?? row.statusHasil ?? null;
        const changed =
          nilaiHasil !== param.nilaiHasil ||
          (row.hasilTeks ?? null) !== param.hasilTeks ||
          statusHasil !== param.statusHasil ||
          (row.catatanHasil ?? null) !== param.catatanHasil;

        if (!changed) continue;
        const terisi = nilaiHasil !== null || Boolean(row.hasilTeks) || Boolean(statusHasil);
        await tx.permintaanPengujianParameter.update({
          where: { id: param.id },
          data: {
            nilaiHasil,
            hasilTeks: row.hasilTeks ?? null,
            statusHasil,
            catatanHasil: row.catatanHasil ?? null,
            diujiOleh: terisi ? actor : null,
            tanggalUji: terisi ? now : null,
          },
        });
      }

      const params = await tx.permintaanPengujianParameter.findMany({
        where: { permintaanId: existing.id },
        select: { checked: true, statusHasil: true },
      });

      const hasilAkhir = hitungHasilAkhir(params);
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: {
          hasilAkhir,
          rekomendasi: rekomendasiDari(hasilAkhir),
          catatanPengujian: input.catatanPengujian ?? null,
          diubahOleh: actor,
        },
      });
    });
    return repo.findDetailById(existing.id);
  },

  submitReview: async (idOrNumber: string, actor: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.DALAM_PENGUJIAN], 'mengirim hasil untuk review');

    const belum = existing.parameters.filter((p) => p.checked && !p.statusHasil);
    if (belum.length) {
      throw unprocessable(
        `Hasil belum lengkap untuk parameter: ${belum.map((p) => p.nama).join(', ')}`,
        belum.map((p) => p.id)
      );
    }
    const hasilAkhir = hitungHasilAkhir(existing.parameters);

    await prisma.$transaction(async (tx) => {
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: {
          status: PERMINTAAN_STATUS.MENUNGGU_REVIEW,
          hasilAkhir,
          rekomendasi: rekomendasiDari(hasilAkhir),
          tanggalSelesaiUji: new Date(),
          diubahOleh: actor,
        },
      });
      await repo.addRiwayat(tx, {
        permintaanId: existing.id,
        aksi: 'Hasil pengujian dikirim untuk review',
        statusDari: existing.status,
        statusKe: PERMINTAAN_STATUS.MENUNGGU_REVIEW,
        keterangan: `Kesimpulan sementara: ${hasilAkhir}`,
        oleh: actor,
      });
    });
    return repo.findDetailById(existing.id);
  },

  review: async (idOrNumber: string, input: ReviewHasilInput, actor: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.MENUNGGU_REVIEW], 'mereview hasil pengujian');
    const setujui = input.keputusan === 'setujui';
    const statusKe = setujui ? PERMINTAAN_STATUS.SELESAI : PERMINTAAN_STATUS.DALAM_PENGUJIAN;

    await prisma.$transaction(async (tx) => {
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: {
          status: statusKe,
          direviewOleh: actor,
          tanggalReview: new Date(),
          catatanReview: input.catatan ?? null,
          ...(setujui ? {} : { tanggalSelesaiUji: null }),
          diubahOleh: actor,
        },
      });
      await repo.addRiwayat(tx, {
        permintaanId: existing.id,
        aksi: setujui ? `Hasil disetujui (${existing.hasilAkhir})` : 'Hasil dikembalikan untuk revisi',
        statusDari: existing.status,
        statusKe,
        keterangan: input.catatan ?? null,
        oleh: actor,
      });
    });
    return repo.findDetailById(existing.id);
  },

  addDokumentasi: async (idOrNumber: string, doc: UploadedDoc, keterangan: string | null | undefined, actor: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(
      existing.status,
      [PERMINTAAN_STATUS.SAMPLING, PERMINTAAN_STATUS.DALAM_PENGUJIAN],
      'menambah dokumentasi'
    );
    return prisma.permintaanPengujianDokumen.create({
      data: {
        permintaanId: existing.id,
        ...doc,
        kategori: DOKUMEN_KATEGORI.DOKUMENTASI,
        keterangan: keterangan ?? null,
        diunggahOleh: actor,
      },
    });
  },

  deleteDokumentasi: async (idOrNumber: string, dokumenId: string) => {
    const existing = await getPermintaanOrThrow(idOrNumber);
    assertStatus(
      existing.status,
      [PERMINTAAN_STATUS.SAMPLING, PERMINTAAN_STATUS.DALAM_PENGUJIAN],
      'menghapus dokumentasi'
    );
    const doc = existing.dokumen.find((d) => d.id === dokumenId && d.kategori === DOKUMEN_KATEGORI.DOKUMENTASI);
    if (!doc) throw notFound('Dokumentasi tidak ditemukan');
    await prisma.permintaanPengujianDokumen.delete({ where: { id: doc.id } });
    await deleteFile(doc.fileUrl).catch((e) => console.error('Gagal menghapus file dokumentasi:', e));
  },
};
