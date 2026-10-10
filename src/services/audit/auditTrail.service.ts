import { auditLogRepository as repo } from '../../repositories/auditLog.repository';
import { AUDIT_AKSI, AUDIT_AKSI_LIST } from '../../constants/audit.constants';
import { AuditFilter, AuditListQuery } from '../../validators/auditTrail.validator';
import { notFound } from '../../utils/httpError';
import { AuditChange } from './auditDiff';

const RENTANG_HARI = 30;
const EXPORT_LIMIT = 10_000;

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Cegah CSV/formula injection saat dibuka di Excel.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

const formatWaktu = (d: Date) =>
  d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }).replace(/\./g, ':');

export const auditTrailService = {
  list: (q: AuditListQuery) => {
    const { page = 1, pageSize = 10, ...filter } = q;
    return repo.findAll(filter, page, pageSize);
  },

  summary: async () => {
    const sejak = new Date(Date.now() - RENTANG_HARI * 24 * 60 * 60 * 1000);
    const recent = { createdAt: { gte: sejak } };
    const [total, penggunaAktif, diubah, dihapus, login] = await Promise.all([
      repo.count({}),
      repo.countDistinctUsers({ ...recent, aksi: { not: AUDIT_AKSI.LOGOUT } }),
      repo.count({ ...recent, aksi: AUDIT_AKSI.UPDATE }),
      repo.count({ ...recent, aksi: AUDIT_AKSI.DELETE }),
      repo.count({ ...recent, aksi: AUDIT_AKSI.LOGIN }),
    ]);
    return { total, penggunaAktif, diubah, dihapus, login, rentangHari: RENTANG_HARI };
  },

  /** Pilihan dropdown filter, diambil dari data audit yang benar-benar ada. */
  options: async () => {
    const [pengguna, modul, entitas] = await Promise.all([
      repo.distinct('username'),
      repo.distinct('modul'),
      repo.distinct('entitas'),
    ]);
    return { pengguna, modul, entitas, aksi: AUDIT_AKSI_LIST };
  },

  getById: async (id: string) => {
    const item = await repo.findById(id);
    if (!item) throw notFound('Aktivitas audit tidak ditemukan');
    return item;
  },

  exportCsv: async (filter: AuditFilter) => {
    const rows = await repo.findForExport(filter, EXPORT_LIMIT);
    const header = ['Waktu', 'Pengguna', 'Dilakukan Oleh', 'Role', 'Modul', 'Aksi', 'Entitas', 'Kode / ID', 'Keterangan', 'Perubahan', 'IP Address', 'Perangkat'];
    const lines = rows.map((r) => {
      const perubahan = ((r.perubahan as AuditChange[] | null) || [])
        .map((c) => `${c.label}: ${c.sebelum ?? '-'} → ${c.sesudah ?? '-'}`)
        .join('; ');
      return [
        formatWaktu(r.createdAt),
        r.username,
        r.impersonatedBy,
        r.role,
        r.modul,
        r.aksi,
        r.entitas,
        r.entitasKode || r.entitasId,
        r.keterangan,
        perubahan,
        r.ipAddress,
        r.perangkat,
      ]
        .map(csvCell)
        .join(',');
    });
    // BOM agar karakter non-ASCII terbaca benar di Excel.
    return '﻿' + [header.map(csvCell).join(','), ...lines].join('\r\n');
  },
};
