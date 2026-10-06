import express from 'express';
import * as PermintaanController from '../controllers/permintaanPengujian.controller';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = express.Router();

router.get('/summary', PermintaanController.getPermintaanSummary);
router.get('/generate-number', PermintaanController.getNextNumber);
router.get('/', PermintaanController.getPermintaanList);
router.get('/:id', PermintaanController.getPermintaanById);
router.post('/', uploadSingle('file'), PermintaanController.createPermintaan);
router.put('/:id', uploadSingle('file'), PermintaanController.updatePermintaan);
router.patch('/:id/status', PermintaanController.updatePermintaanStatus);
router.delete('/:id', PermintaanController.deletePermintaan);

export default router;
