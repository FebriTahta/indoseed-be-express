import express from 'express';
import * as PermintaanController from '../controllers/permintaanPengujian.controller';
import { uploadSingle } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createPermintaanSchema,
  updatePermintaanSchema,
  permintaanListQuerySchema,
  summaryQuerySchema,
  batchOptionsQuerySchema,
  approvePermintaanSchema,
  rejectPermintaanSchema,
} from '../validators/qc.validator';

const router = express.Router();

router.get('/summary', validate(summaryQuerySchema, 'query'), PermintaanController.getPermintaanSummary);
router.get('/generate-number', PermintaanController.getNextNumber);
router.get('/batch-options', validate(batchOptionsQuerySchema, 'query'), PermintaanController.getBatchOptions);
router.get('/', validate(permintaanListQuerySchema, 'query'), PermintaanController.getPermintaanList);
router.get('/:id', PermintaanController.getPermintaanById);
router.post('/', uploadSingle('file'), validate(createPermintaanSchema), PermintaanController.createPermintaan);
router.put('/:id', uploadSingle('file'), validate(updatePermintaanSchema), PermintaanController.updatePermintaan);
router.post('/:id/approve', validate(approvePermintaanSchema), PermintaanController.approvePermintaan);
router.post('/:id/reject', validate(rejectPermintaanSchema), PermintaanController.rejectPermintaan);
router.delete('/:id', PermintaanController.deletePermintaan);

export default router;
