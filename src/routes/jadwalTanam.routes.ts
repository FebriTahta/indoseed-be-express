import { Router } from 'express';
import {
  createJadwalTanam,
  getJadwalTanams,
  getJadwalTanamById,
  updateJadwalTanam,
  deleteJadwalTanam,
} from '../controllers/jadwalTanam.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', createJadwalTanam);
router.get('/', getJadwalTanams);
router.get('/:id', getJadwalTanamById);
router.put('/:id', updateJadwalTanam);
router.delete('/:id', deleteJadwalTanam);

export default router;
