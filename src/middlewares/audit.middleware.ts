import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RequestContext, RequestUser, runWithContext } from '../utils/requestContext';
import { recordAudit } from '../services/audit/audit.service';
import { AUDIT_AKSI, AUDIT_ROUTE_MAP, AUDIT_SKIP_PREFIXES, AuditAksi } from '../constants/audit.constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const MUTATION_AKSI: Record<string, AuditAksi> = {
  POST: AUDIT_AKSI.CREATE,
  PUT: AUDIT_AKSI.UPDATE,
  PATCH: AUDIT_AKSI.UPDATE,
  DELETE: AUDIT_AKSI.DELETE,
};
const KATA_KERJA: Record<AuditAksi, string> = {
  CREATE: 'Membuat',
  UPDATE: 'Mengubah',
  DELETE: 'Menghapus',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
};

/** Identitas pengguna dari JWT bila ada — tidak menolak request (otorisasi tetap di authenticateJWT). */
const peekUser = (req: Request): RequestUser | undefined => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return undefined;
  try {
    return jwt.verify(token, JWT_SECRET) as RequestUser;
  } catch {
    return undefined;
  }
};

/** `req.ip` sudah memperhitungkan proxy tepercaya (lihat `trust proxy` di app.ts). */
const clientIp = (req: Request) => {
  const ip = req.ip?.replace(/^::ffff:/, '');
  return ip === '::1' ? '127.0.0.1' : ip || undefined;
};

/** Segmen path terakhir yang menyerupai ID (UUID / nomor dokumen), untuk kolom entitasId. */
const entityIdFrom = (path: string) =>
  path
    .split('/')
    .filter(Boolean)
    .reverse()
    .find((seg) => /^[0-9a-f-]{20,}$/i.test(seg) || /\d/.test(seg));

/**
 * Siapkan konteks request lalu, setelah response sukses, catat audit generik untuk request
 * mutasi yang belum dicatat secara spesifik oleh service.
 */
export const auditContext = (req: Request, res: Response, next: NextFunction) => {
  const ctx: RequestContext = {
    user: peekUser(req),
    ipAddress: clientIp(req),
    userAgent: req.headers['user-agent'],
    metode: req.method,
    endpoint: req.originalUrl.split('?')[0] ?? req.originalUrl,
    audited: false,
  };

  const aksi = MUTATION_AKSI[req.method];
  const skip = !aksi || AUDIT_SKIP_PREFIXES.some((p) => ctx.endpoint.startsWith(p));

  if (!skip) {
    res.on('finish', () => {
      if (ctx.audited || res.statusCode >= 400) return;
      const target = AUDIT_ROUTE_MAP.find((r) => ctx.endpoint.startsWith(r.prefix));
      if (!target) return;
      runWithContext(ctx, () =>
        recordAudit({
          modul: target.modul,
          aksi,
          entitas: target.entitas,
          entitasId: entityIdFrom(ctx.endpoint.slice(target.prefix.length)) ?? null,
          keterangan: `${KATA_KERJA[aksi]} data ${target.entitas.toLowerCase()}`,
        })
      );
    });
  }

  runWithContext(ctx, next);
};
