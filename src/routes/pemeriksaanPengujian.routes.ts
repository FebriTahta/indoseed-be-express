import express from 'express';
import * as PemeriksaanController from '../controllers/pemeriksaanPengujian.controller';
import { uploadSingle } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  permintaanListQuerySchema,
  summaryQuerySchema,
  terimaSampelSchema,
  simpanHasilSchema,
  reviewHasilSchema,
  dokumentasiBodySchema,
} from '../validators/qc.validator';

export const pemeriksaanRouter = express.Router();

pemeriksaanRouter.get('/summary', validate(summaryQuerySchema, 'query'), PemeriksaanController.getPemeriksaanSummary);
pemeriksaanRouter.get('/', validate(permintaanListQuerySchema, 'query'), PemeriksaanController.getPemeriksaanList);
pemeriksaanRouter.get('/:id', PemeriksaanController.getPemeriksaanById);
pemeriksaanRouter.post('/:id/terima-sampel', validate(terimaSampelSchema), PemeriksaanController.terimaSampel);
pemeriksaanRouter.put('/:id/hasil', validate(simpanHasilSchema), PemeriksaanController.simpanHasil);
pemeriksaanRouter.post('/:id/submit-review', PemeriksaanController.submitReview);
pemeriksaanRouter.post('/:id/review', validate(reviewHasilSchema), PemeriksaanController.reviewHasil);
pemeriksaanRouter.post(
  '/:id/dokumentasi',
  uploadSingle('file'),
  validate(dokumentasiBodySchema),
  PemeriksaanController.uploadDokumentasi
);
pemeriksaanRouter.delete('/:id/dokumentasi/:dokumenId', PemeriksaanController.deleteDokumentasi);

export const hasilRouter = express.Router();

hasilRouter.get('/summary', validate(summaryQuerySchema, 'query'), PemeriksaanController.getHasilSummary);
hasilRouter.get('/', validate(permintaanListQuerySchema, 'query'), PemeriksaanController.getHasilList);
hasilRouter.get('/:id', PemeriksaanController.getPemeriksaanById);
