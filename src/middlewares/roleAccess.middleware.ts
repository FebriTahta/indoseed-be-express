import { NextFunction, Request, Response } from 'express';
import { getRequestContext } from '../utils/requestContext';
import { isAllowedForRoles, isRestrictedUser } from '../constants/roles.constants';

/**
 * Batasi user dengan role terbatas (mis. penguji) hanya ke endpoint yang diizinkan.
 * Identitas diambil dari konteks request (JWT sudah dibaca oleh `auditContext`);
 * autentikasi wajib tetap ditangani `authenticateJWT` per router.
 */
export const enforceRoleScope = (req: Request, res: Response, next: NextFunction) => {
  const user = getRequestContext()?.user;
  if (!user || req.method === 'OPTIONS' || !isRestrictedUser(user.roles)) return next();

  const path = req.originalUrl.split('?')[0] ?? req.originalUrl;
  if (isAllowedForRoles(user.roles, req.method, path)) return next();

  return res.status(403).json({ success: false, message: 'Akses ditolak: role Anda tidak memiliki izin untuk fitur ini.' });
};
