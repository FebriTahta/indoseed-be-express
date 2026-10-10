import express from 'express';
import * as PemeriksaanController from '../controllers/pemeriksaanPengujian.controller';
import { uploadSingle } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authorizeRoles } from '../middlewares/auth.middleware';
import { REVIEWER_ROLES, ROLES } from '../constants/roles.constants';
import {
  permintaanListQuerySchema,
  summaryQuerySchema,
  terimaSampelSchema,
  simpanHasilSchema,
  reviewHasilSchema,
  ujiUlangSchema,
  dokumentasiBodySchema,
} from '../validators/qc.validator';

export const pemeriksaanRouter = express.Router();

pemeriksaanRouter.get('/summary', validate(summaryQuerySchema, 'query'), PemeriksaanController.getPemeriksaanSummary);
pemeriksaanRouter.get('/', validate(permintaanListQuerySchema, 'query'), PemeriksaanController.getPemeriksaanList);
pemeriksaanRouter.get('/:id', PemeriksaanController.getPemeriksaanById);
// Pelaksanaan pengujian hanya oleh penguji (superadmin melalui "login sebagai" ikut ber-role penguji).
const pengujiOnly = authorizeRoles(ROLES.PENGUJI);
pemeriksaanRouter.post('/:id/terima-sampel', pengujiOnly, validate(terimaSampelSchema), PemeriksaanController.terimaSampel);
pemeriksaanRouter.put('/:id/hasil', pengujiOnly, validate(simpanHasilSchema), PemeriksaanController.simpanHasil);
pemeriksaanRouter.post('/:id/submit-review', pengujiOnly, PemeriksaanController.submitReview);
// Review & uji ulang adalah keputusan supervisor, bukan penguji yang mengerjakan.
const reviewerOnly = authorizeRoles(...REVIEWER_ROLES);
pemeriksaanRouter.post('/:id/review', reviewerOnly, validate(reviewHasilSchema), PemeriksaanController.reviewHasil);
pemeriksaanRouter.post('/:id/uji-ulang', reviewerOnly, validate(ujiUlangSchema), PemeriksaanController.ujiUlang);
pemeriksaanRouter.post(
  '/:id/dokumentasi',
  pengujiOnly,
  uploadSingle('file'),
  validate(dokumentasiBodySchema),
  PemeriksaanController.uploadDokumentasi
);
pemeriksaanRouter.delete('/:id/dokumentasi/:dokumenId', pengujiOnly, PemeriksaanController.deleteDokumentasi);

export const hasilRouter = express.Router();

hasilRouter.get('/summary', validate(summaryQuerySchema, 'query'), PemeriksaanController.getHasilSummary);
hasilRouter.get('/', validate(permintaanListQuerySchema, 'query'), PemeriksaanController.getHasilList);
hasilRouter.get('/:id', PemeriksaanController.getPemeriksaanById);
