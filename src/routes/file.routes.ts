import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { downloadFile } from '../controllers/file.controller';

const router = Router();

const downloadQuerySchema = z.object({
  url: z.string({ error: 'URL file wajib diisi' }).trim().min(1, 'URL file wajib diisi'),
  name: z.string().trim().max(255).optional(),
  inline: z.preprocess((v) => v === '1' || v === 'true', z.boolean()).optional(),
});

/** Unduh / pratinjau file dari penyimpanan dengan pengecekan keberadaan file. */
router.get('/download', authenticateJWT, validate(downloadQuerySchema, 'query'), downloadFile);

export default router;
