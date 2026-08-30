import { Router } from 'express';
import { PengujiController } from '../controllers/penguji.controller';

const router = Router();

router.get('/stats', PengujiController.getStats);
router.get('/', PengujiController.getAll);
router.get('/:id', PengujiController.getById);
router.post('/', PengujiController.create);
router.put('/:id', PengujiController.update);
router.delete('/:id', PengujiController.delete);

export default router;
