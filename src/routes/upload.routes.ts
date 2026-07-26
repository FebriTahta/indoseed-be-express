import { Router } from 'express';
import { uploadFileHandler } from '../controllers/upload.controller';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', uploadSingle('file'), uploadFileHandler);

export default router;
