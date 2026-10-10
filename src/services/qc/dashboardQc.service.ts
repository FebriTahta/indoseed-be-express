import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { buildPermintaanWhere, permintaanListInclude } from '../../repositories/permintaanPengujian.repository';
import { HASIL_AKHIR, PERMINTAAN_STATUS, PERMINTAAN_STATUS_LIST } from '../../constants/qc.constants';
import { withValiditas } from './validitasHasil';

const DAY_MS = 24 * 60 * 60 * 1000;
const JENIS_TOP = 6;
const TERBARU_LIMIT = 8;
const DEFAULT_RANGE_DAYS = 30;

type Periode = { startDate: Date; endDate: Date };

/** Periode default 30 hari terakhir; periode pembanding = rentang yang sama tepat sebelumnya. */
const resolvePeriode = (startDate?: Date | null, endDate?: Date | null) => {
  const end = endDate ?? new Date();
  const start = startDate ?? new Date(end.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
  const lengthMs = end.getTime() - start.getTime() + DAY_MS;
  const sebelumnya: Periode = { startDate: new Date(start.getTime() - lengthMs), endDate: new Date(start.getTime() - DAY_MS) };
  return { saatIni: { startDate: start, endDate: end } as Periode, sebelumnya };
};

/** Perubahan persen terhadap periode sebelumnya; null bila tidak ada pembanding. */
const trend = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);

const countBy = async (where: Prisma.PermintaanPengujianWhereInput) => {
  const rows = await prisma.permintaanPengujian.groupBy({ by: ['status', 'hasilAkhir'], where, _count: { _all: true } });
  const sum = (pred: (r: (typeof rows)[number]) => boolean) => rows.filter(pred).reduce((a, r) => a + r._count._all, 0);
  return {
    total: sum(() => true),
    perStatus: Object.fromEntries(PERMINTAAN_STATUS_LIST.map((s) => [s, sum((r) => r.status === s)])) as Record<string, number>,
    lulus: sum((r) => r.status === PERMINTAAN_STATUS.SELESAI && r.hasilAkhir === HASIL_AKHIR.LULUS),
    tidakLulus: sum((r) => r.status === PERMINTAAN_STATUS.SELESAI && r.hasilAkhir === HASIL_AKHIR.TIDAK_LULUS),
  };
};

/** KPI utama untuk satu periode. "Sampel masuk" = permintaan yang sampelnya sudah diterima lab. */
const kpiFor = async (periode: Periode) => {
  const where = buildPermintaanWhere(periode);
  const [counts, sampelMasuk] = await Promise.all([
    countBy(where),
    prisma.permintaanPengujian.count({ where: { AND: [where, { tanggalSampling: { not: null } }] } }),
  ]);
  return {
    counts,
    kpi: {
      sampelMasuk,
      pengujianBerjalan: counts.perStatus[PERMINTAAN_STATUS.DALAM_PENGUJIAN] ?? 0,
      menungguReview: counts.perStatus[PERMINTAAN_STATUS.MENUNGGU_REVIEW] ?? 0,
      tidakLulus: counts.tidakLulus,
      lulus: counts.lulus,
    },
  };
};

export const dashboardQcService = {
  get: async (filters: { startDate?: Date | null; endDate?: Date | null }) => {
    const { saatIni, sebelumnya } = resolvePeriode(filters.startDate, filters.endDate);
    const where = buildPermintaanWhere(saatIni);

    const [now, before, jenisRows, komoditasRows, terbaru] = await Promise.all([
      kpiFor(saatIni),
      kpiFor(sebelumnya),
      prisma.permintaanPengujianParameter.groupBy({
        by: ['nama'],
        where: { checked: true, permintaan: where },
        _count: { _all: true },
        orderBy: { _count: { nama: 'desc' } },
      }),
      prisma.permintaanPengujian.groupBy({
        by: ['komoditas', 'hasilAkhir'],
        where: { AND: [where, { status: PERMINTAAN_STATUS.SELESAI }] },
        _count: { _all: true },
      }),
      prisma.permintaanPengujian.findMany({
        where,
        include: permintaanListInclude,
        orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
        take: TERBARU_LIMIT,
      }),
    ]);

    // Jenis pengujian: 6 parameter terbanyak + "Lainnya".
    const top = jenisRows.slice(0, JENIS_TOP).map((r) => ({ nama: r.nama, total: r._count._all }));
    const lainnya = jenisRows.slice(JENIS_TOP).reduce((a, r) => a + r._count._all, 0);
    const jenisPengujian = lainnya ? [...top, { nama: 'Lainnya', total: lainnya }] : top;

    // Komoditas: jumlah lulus / tidak lulus untuk pengujian yang sudah selesai.
    const komoditasMap = new Map<string, { komoditas: string; lulus: number; tidakLulus: number }>();
    komoditasRows.forEach((r) => {
      const key = r.komoditas || 'Tanpa komoditas';
      const row = komoditasMap.get(key) ?? { komoditas: key, lulus: 0, tidakLulus: 0 };
      if (r.hasilAkhir === HASIL_AKHIR.LULUS) row.lulus += r._count._all;
      if (r.hasilAkhir === HASIL_AKHIR.TIDAK_LULUS) row.tidakLulus += r._count._all;
      komoditasMap.set(key, row);
    });
    const komoditas = [...komoditasMap.values()].sort((a, b) => b.lulus + b.tidakLulus - (a.lulus + a.tidakLulus));

    const s = now.counts.perStatus;
    return {
      periode: saatIni,
      kpi: now.kpi,
      trend: Object.fromEntries(
        Object.entries(now.kpi).map(([k, v]) => [k, trend(v, before.kpi[k as keyof typeof before.kpi])])
      ) as Record<keyof typeof now.kpi, number | null>,
      statusPengujian: PERMINTAAN_STATUS_LIST.map((status) => ({ status, total: s[status] ?? 0 })),
      totalPermintaan: now.counts.total,
      alur: {
        permintaan: now.counts.total,
        pengujian: (s[PERMINTAAN_STATUS.SAMPLING] ?? 0) + (s[PERMINTAAN_STATUS.DALAM_PENGUJIAN] ?? 0),
        review: s[PERMINTAAN_STATUS.MENUNGGU_REVIEW] ?? 0,
        lulus: now.counts.lulus,
        tidakLulus: now.counts.tidakLulus,
      },
      jenisPengujian,
      komoditas,
      terbaru: terbaru.map(withValiditas),
    };
  },
};
