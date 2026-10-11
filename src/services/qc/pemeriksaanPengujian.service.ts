import { Prisma } from '@prisma/client';
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
  UjiUlangInput,
  RincianHasilInput,
} from '../../validators/qc.validator';
import {
  hasilLengkap,
  hasilTidakLengkapWhere,
  hitungHasilAkhir,
  parameterBelumDiuji,
  pesanBelumLengkap,
  withValiditas,
} from './validitasHasil';
import { assertMenguasaiMetode, assertPengujiAccess, getPengujiScope, requirePengujiScope } from './pengujiScope.service';
import { recordAudit, skipAutoAudit } from '../audit/audit.service';
import { describeChange, diffFields } from '../audit/auditDiff';
import { AUDIT_AKSI } from '../../constants/audit.constants';
import { ROLES } from '../../constants/roles.constants';
import { getRequestContext } from '../../utils/requestContext';

const MODUL_PEMERIKSAAN = 'Pemeriksaan Pengujian';

/** Rincian perkecambahan yang terisi (tanpa field kosong), atau null bila seluruhnya kosong. */
const normalisasiRincian = (r?: RincianHasilInput | null) => {
  if (!r) return null;
  const entries = Object.entries(r).filter(([, v]) => v !== null && v !== undefined);
  return entries.length ? (Object.fromEntries(entries) as RincianHasilInput) : null;
};

/** Daya berkecambah (%) = benih normal ÷ jumlah benih diuji × 100. */
const dayaBerkecambah = (r: RincianHasilInput | null) =>
  r?.jumlahBenih && r.benihNormal != null ? Math.round((r.benihNormal / r.jumlahBenih) * 10000) / 100 : null;

/** Ringkasan rincian untuk audit trail (urutan tetap, tidak bergantung urutan key JSON dari DB). */
const ringkasRincian = (r: unknown) => {
  const v = (r || {}) as RincianHasilInput;
  const parts = [
    v.jumlahBenih != null && `${v.jumlahBenih} butir`,
    v.hariPengamatan != null && `hari ke-${v.hariPengamatan}`,
    v.benihNormal != null && `normal ${v.benihNormal}`,
    v.benihAbnormal != null && `abnormal ${v.benihAbnormal}`,
    v.benihMati != null && `mati ${v.benihMati}`,
    v.benihKeras != null && `keras ${v.benihKeras}`,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
};

/** Detail terbaru beserta penanda validitas hasil. */
const findDetail = async (id: string) => {
  const item = await repo.findDetailById(id);
  return item && withValiditas(item);
};

/** Daftar dengan penanda validitas per baris. */
const findAllWithValiditas = async (query: PermintaanListQuery, scope: string[]) => {
  const result = await repo.findAll(query, scope, await getPengujiScope());
  return { ...result, data: result.data.map(withValiditas) };
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

/** Ambil permintaan + pastikan user (bila penguji) berhak mengaksesnya. */
const getAccessible = async (idOrNumber: string) => {
  const [existing, pengujiId] = await Promise.all([getPermintaanOrThrow(idOrNumber), getPengujiScope()]);
  assertPengujiAccess(pengujiId, existing);
  return { existing, pengujiId };
};

/** Pengujian yang dikembalikan ke tahap uji harus punya penguji aktif yang akan mengerjakannya. */
const assertPetugasAktif = (existing: { petugasQc?: { nama: string; status: string } | null }) => {
  if (!existing.petugasQc) throw badRequest('Pengujian ini belum memiliki penguji yang ditugaskan.');
  if (existing.petugasQc.status !== 'Aktif') {
    throw badRequest(`Penguji ${existing.petugasQc.nama} sedang nonaktif. Aktifkan kembali penguji tersebut sebelum mengembalikan pengujian.`);
  }
};

/** Untuk aksi pelaksanaan pengujian: wajib penguji dan berhak atas data tersebut. */
const getAccessibleAsPenguji = async (idOrNumber: string) => {
  const [existing, pengujiId] = await Promise.all([getPermintaanOrThrow(idOrNumber), requirePengujiScope()]);
  assertPengujiAccess(pengujiId, existing);
  return { existing, pengujiId };
};

const pemeriksaanScope = PEMERIKSAAN_STATUSES as string[];
const hasilScope = HASIL_STATUSES as string[];

export const pemeriksaanPengujianService = {
  /** Detail lengkap + lokasi asal sampel untuk halaman pemeriksaan. */
  getDetail: async (idOrNumber: string) => {
    const { existing: item } = await getAccessible(idOrNumber);
    return { ...withValiditas(item), lokasiAsal: await resolveLokasiAsal(item.batchProduksi?.sumberBahan) };
  },

  list: (query: PermintaanListQuery) => findAllWithValiditas({ sortBy: 'updatedAt', ...query }, pemeriksaanScope),

  summary: async (filters: { startDate?: Date | null; endDate?: Date | null }) => {
    const counts = await repo.countByStatus(buildPermintaanWhere(filters, pemeriksaanScope, await getPengujiScope()));
    return {
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      sampling: counts[PERMINTAAN_STATUS.SAMPLING] || 0,
      dalamPengujian: counts[PERMINTAAN_STATUS.DALAM_PENGUJIAN] || 0,
      menungguReview: counts[PERMINTAAN_STATUS.MENUNGGU_REVIEW] || 0,
      selesai: counts[PERMINTAAN_STATUS.SELESAI] || 0,
    };
  },

  listHasil: (query: PermintaanListQuery) =>
    findAllWithValiditas({ sortBy: 'updatedAt', ...query }, hasilScope),

  summaryHasil: async (filters: { startDate?: Date | null; endDate?: Date | null }) => {
    const where = buildPermintaanWhere(filters, hasilScope, await getPengujiScope());
    const [rows, tidakValid] = await Promise.all([
      repo.countByHasil(where),
      prisma.permintaanPengujian.count({ where: { AND: [where, hasilTidakLengkapWhere] } }),
    ]);
    const sum = (pred: (r: (typeof rows)[number]) => boolean) =>
      rows.filter(pred).reduce((a, r) => a + r.total, 0);
    return {
      total: sum(() => true),
      menungguReview: sum((r) => r.status === PERMINTAAN_STATUS.MENUNGGU_REVIEW),
      lulus: sum((r) => r.status === PERMINTAAN_STATUS.SELESAI && r.hasilAkhir === HASIL_AKHIR.LULUS),
      tidakLulus: sum((r) => r.status === PERMINTAAN_STATUS.SELESAI && r.hasilAkhir === HASIL_AKHIR.TIDAK_LULUS),
      tidakValid,
    };
  },

  /** Sampel diterima lab → mulai pengujian (status Sampling → Dalam Pengujian). */
  terimaSampel: async (idOrNumber: string, input: TerimaSampelInput, actor: string) => {
    const { existing, pengujiId } = await getAccessibleAsPenguji(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.SAMPLING], 'memulai pengujian');
    await qcLookupService.assertValid(QC_LOOKUP_KATEGORI.KONDISI_SAMPEL, input.kondisiSampel, 'Kondisi sampel');

    // Penguji selalu menerima sampel atas namanya sendiri, dan harus menguasai metode ujinya.
    const petugas = await prisma.penguji.findUnique({ where: { id: pengujiId } });
    if (!petugas || petugas.status !== 'Aktif') throw badRequest('Petugas QC tidak ditemukan atau tidak aktif');
    await assertMenguasaiMetode(petugas.id, existing.parameters);
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
    return findDetail(existing.id);
  },

  /** Simpan (draft) hasil per parameter; status lulus dievaluasi otomatis dari batas acuan. */
  simpanHasil: async (idOrNumber: string, input: SimpanHasilInput, actor: string) => {
    const { existing } = await getAccessibleAsPenguji(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.DALAM_PENGUJIAN], 'menyimpan hasil pengujian');

    const paramMap = new Map(existing.parameters.map((p) => [p.id, p]));
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      for (const row of input.parameters) {
        const param = paramMap.get(row.id);
        if (!param) throw badRequest('Parameter tidak termasuk dalam permintaan ini');
        if (!param.checked) continue;

        // Rincian perkecambahan (bila dikirim) menjadi sumber nilai hasil.
        const rincianHasil = row.rincianHasil === undefined ? undefined : normalisasiRincian(row.rincianHasil);
        const nilaiHasil = (rincianHasil && dayaBerkecambah(rincianHasil)) ?? row.nilaiHasil ?? null;
        const hasilTeks = row.hasilTeks?.trim() || null;
        const catatanHasil = row.catatanHasil ?? null;
        const otomatis = evaluateHasil(nilaiHasil, param.batasAcuan ?? param.standar);
        const statusHasil = otomatis ?? row.statusHasil ?? null;

        const satuan = param.satuan && param.satuan !== '-' ? ` (${param.satuan})` : '';
        const perubahan = diffFields(
          { ...param, rincianHasil: ringkasRincian(param.rincianHasil) },
          {
            nilaiHasil,
            hasilTeks,
            statusHasil,
            catatanHasil,
            rincianHasil: rincianHasil === undefined ? ringkasRincian(param.rincianHasil) : ringkasRincian(rincianHasil),
          },
          {
            nilaiHasil: `${param.nama}${satuan}`,
            hasilTeks: `Hasil ${param.nama}`,
            statusHasil: `Status ${param.nama}`,
            catatanHasil: `Catatan ${param.nama}`,
            rincianHasil: `Rincian ${param.nama}`,
          }
        );
        if (!perubahan.length) continue;

        const terisi = nilaiHasil !== null || Boolean(hasilTeks) || Boolean(statusHasil);
        await tx.permintaanPengujianParameter.update({
          where: { id: param.id },
          data: {
            nilaiHasil,
            hasilTeks,
            statusHasil,
            catatanHasil,
            ...(rincianHasil !== undefined && { rincianHasil: rincianHasil ?? Prisma.DbNull }),
            diujiOleh: terisi ? actor : null,
            tanggalUji: terisi ? now : null,
          },
        });
        await recordAudit(
          {
            modul: MODUL_PEMERIKSAAN,
            aksi: AUDIT_AKSI.UPDATE,
            entitas: `Uji ${param.nama}`,
            entitasId: existing.id,
            entitasKode: existing.noPengujian,
            keterangan:
              perubahan.length === 1 && perubahan[0] ? describeChange(perubahan[0]) : `Memperbarui hasil uji ${param.nama}`,
            perubahan,
          },
          tx
        );
      }

      const params = await tx.permintaanPengujianParameter.findMany({
        where: { permintaanId: existing.id },
        select: { id: true, nama: true, checked: true, nilaiHasil: true, hasilTeks: true, statusHasil: true },
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
    skipAutoAudit();
    return findDetail(existing.id);
  },

  submitReview: async (idOrNumber: string, actor: string) => {
    const { existing } = await getAccessibleAsPenguji(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.DALAM_PENGUJIAN], 'mengirim hasil untuk review');

    if (!hasilLengkap(existing.parameters)) {
      throw unprocessable(
        `Hasil belum dapat disubmit. ${pesanBelumLengkap(existing.parameters)}`,
        parameterBelumDiuji(existing.parameters).map((p) => p.id)
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
    return findDetail(existing.id);
  },

  review: async (idOrNumber: string, input: ReviewHasilInput, actor: string) => {
    const { existing } = await getAccessible(idOrNumber);
    assertStatus(existing.status, [PERMINTAAN_STATUS.MENUNGGU_REVIEW], 'mereview hasil pengujian');
    const setujui = input.keputusan === 'setujui';
    if (setujui && !hasilLengkap(existing.parameters)) {
      throw unprocessable(
        `Hasil tidak valid dan tidak dapat disetujui. ${pesanBelumLengkap(existing.parameters)}. ` +
          'Kembalikan untuk revisi atau lakukan pengujian ulang.',
        parameterBelumDiuji(existing.parameters).map((p) => p.id)
      );
    }
    if (!setujui) assertPetugasAktif(existing);
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
    return findDetail(existing.id);
  },

  /**
   * Hasil yang terlanjur dikirim / disetujui padahal masih ada parameter yang belum diuji
   * dinyatakan tidak valid dan dikembalikan ke tahap pengujian. Nilai yang sudah terisi
   * dipertahankan agar analis cukup melengkapi / memperbaiki parameter yang kurang.
   * Superadmin juga boleh membuka kembali hasil yang tampak lengkap (mis. nilai terisi
   * padahal pengujian sebenarnya belum tuntas) agar penguji dapat mengujinya ulang.
   */
  ujiUlang: async (idOrNumber: string, input: UjiUlangInput, actor: string) => {
    const { existing } = await getAccessible(idOrNumber);
    assertStatus(existing.status, HASIL_STATUSES, 'melakukan pengujian ulang');
    const lengkap = hasilLengkap(existing.parameters);
    if (lengkap && !getRequestContext()?.user?.roles.includes(ROLES.SUPERADMIN)) {
      throw badRequest('Hasil pengujian sudah lengkap dan valid, pengujian ulang tidak diperlukan');
    }
    assertPetugasAktif(existing);

    await prisma.$transaction(async (tx) => {
      await tx.permintaanPengujian.update({
        where: { id: existing.id },
        data: {
          status: PERMINTAAN_STATUS.DALAM_PENGUJIAN,
          hasilAkhir: null,
          rekomendasi: null,
          tanggalSelesaiUji: null,
          direviewOleh: null,
          tanggalReview: null,
          catatanReview: null,
          diubahOleh: actor,
        },
      });
      await repo.addRiwayat(tx, {
        permintaanId: existing.id,
        aksi: lengkap ? 'Pengujian dibuka kembali untuk diuji ulang' : 'Hasil dinyatakan tidak valid — pengujian ulang',
        statusDari: existing.status,
        statusKe: PERMINTAAN_STATUS.DALAM_PENGUJIAN,
        keterangan: lengkap ? `Alasan: ${input.alasan}` : `${pesanBelumLengkap(existing.parameters)}. Alasan: ${input.alasan}`,
        oleh: actor,
      });
    });
    return findDetail(existing.id);
  },

  addDokumentasi: async (idOrNumber: string, doc: UploadedDoc, keterangan: string | null | undefined, actor: string) => {
    const { existing } = await getAccessibleAsPenguji(idOrNumber);
    assertStatus(
      existing.status,
      [PERMINTAAN_STATUS.SAMPLING, PERMINTAAN_STATUS.DALAM_PENGUJIAN],
      'menambah dokumentasi'
    );
    const created = await prisma.permintaanPengujianDokumen.create({
      data: {
        permintaanId: existing.id,
        ...doc,
        kategori: DOKUMEN_KATEGORI.DOKUMENTASI,
        keterangan: keterangan ?? null,
        diunggahOleh: actor,
      },
    });
    await recordAudit({
      modul: MODUL_PEMERIKSAAN,
      aksi: AUDIT_AKSI.CREATE,
      entitas: 'Dokumentasi Pengujian',
      entitasId: existing.id,
      entitasKode: existing.noPengujian,
      keterangan: `Mengunggah dokumentasi ${doc.namaFile}`,
    });
    return created;
  },

  deleteDokumentasi: async (idOrNumber: string, dokumenId: string) => {
    const { existing } = await getAccessibleAsPenguji(idOrNumber);
    assertStatus(
      existing.status,
      [PERMINTAAN_STATUS.SAMPLING, PERMINTAAN_STATUS.DALAM_PENGUJIAN],
      'menghapus dokumentasi'
    );
    const doc = existing.dokumen.find((d) => d.id === dokumenId && d.kategori === DOKUMEN_KATEGORI.DOKUMENTASI);
    if (!doc) throw notFound('Dokumentasi tidak ditemukan');
    await prisma.permintaanPengujianDokumen.delete({ where: { id: doc.id } });
    await recordAudit({
      modul: MODUL_PEMERIKSAAN,
      aksi: AUDIT_AKSI.DELETE,
      entitas: 'Dokumentasi Pengujian',
      entitasId: existing.id,
      entitasKode: existing.noPengujian,
      keterangan: `Menghapus dokumentasi ${doc.namaFile}`,
    });
    await deleteFile(doc.fileUrl).catch((e) => console.error('Gagal menghapus file dokumentasi:', e));
  },
};
