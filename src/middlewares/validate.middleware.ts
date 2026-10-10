import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validasi & normalisasi bagian request menggunakan schema Zod.
 * Hasil parse (sudah ter-coerce & ter-whitelist) disimpan ke `req.validated[part]`
 * sehingga controller tidak pernah membaca input mentah.
 */
export const validate =
  (schema: ZodType, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[part]);
    req.validated = { ...(req.validated || {}), [part]: parsed };
    next();
  };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validated?: Partial<Record<RequestPart, any>>;
    }
  }
}
