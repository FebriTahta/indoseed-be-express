import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { getRequestContext } from '../../utils/requestContext';
import { describeDevice } from '../../utils/userAgent';
import { AuditAksi } from '../../constants/audit.constants';
import { AuditChange } from './auditDiff';

/** Tandai request sudah ditangani agar audit otomatis tidak mencatat entri generik (mis. simpan tanpa perubahan). */
export const skipAutoAudit = () => {
  const ctx = getRequestContext();
  if (ctx) ctx.audited = true;
};

export interface AuditEntry {
  modul: string;
  aksi: AuditAksi;
  keterangan: string;
  entitas?: string | null;
  entitasId?: string | null;
  entitasKode?: string | null;
  perubahan?: AuditChange[];
  /** Override pelaku, mis. saat login (belum ada JWT pada request). */
  user?: { userId?: string | null; username: string; role?: string | null };
}

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Catat satu aktivitas audit. Identitas pelaku, IP, dan perangkat diambil dari konteks request.
 * Kegagalan mencatat audit tidak boleh menggagalkan proses bisnis, sehingga error hanya di-log —
 * kecuali bila dipanggil di dalam transaksi (`db`), agar audit ikut commit/rollback bersama datanya.
 */
export const recordAudit = async (entry: AuditEntry, db: Db = prisma) => {
  const ctx = getRequestContext();
  if (ctx) ctx.audited = true;

  const data: Prisma.AuditLogCreateInput = {
    userId: entry.user?.userId ?? ctx?.user?.userId ?? null,
    username: entry.user?.username ?? ctx?.user?.username ?? 'Sistem',
    role: entry.user?.role ?? ctx?.user?.roles?.[0] ?? null,
    modul: entry.modul,
    aksi: entry.aksi,
    entitas: entry.entitas ?? null,
    entitasId: entry.entitasId ?? null,
    entitasKode: entry.entitasKode ?? null,
    keterangan: entry.keterangan,
    perubahan: entry.perubahan?.length ? (entry.perubahan as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
    metode: ctx?.metode ?? null,
    endpoint: ctx?.endpoint?.slice(0, 500) ?? null,
    ipAddress: ctx?.ipAddress ?? null,
    userAgent: ctx?.userAgent ?? null,
    perangkat: describeDevice(ctx?.userAgent),
    impersonatedBy: ctx?.user?.impersonatedBy?.username ?? null,
  };

  if (db !== prisma) {
    await db.auditLog.create({ data });
    return;
  }
  try {
    await prisma.auditLog.create({ data });
  } catch (err) {
    console.error('Gagal mencatat audit trail:', err);
  }
};
