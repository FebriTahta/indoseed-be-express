import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError';

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Global error handler: menerjemahkan HttpError, ZodError, dan error Prisma
 * yang umum menjadi response JSON yang konsisten.
 */
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({
      success: false,
      status: 'error',
      message: errors[0] ? `${errors[0].field}: ${errors[0].message}` : 'Data tidak valid',
      errors,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      status: 'error',
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const map: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: 'Data dengan nilai unik tersebut sudah terdaftar.' },
      P2003: { status: 400, message: 'Referensi data terkait tidak valid.' },
      P2025: { status: 404, message: 'Data tidak ditemukan.' },
    };
    const mapped = map[err.code];
    if (mapped) {
      return res.status(mapped.status).json({ success: false, status: 'error', message: mapped.message, code: err.code });
    }
  }

  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(!isProduction() ? { stack: err.stack } : {}),
  });
};
