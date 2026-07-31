import { Router } from 'express';
import {
  createJadwalTanam,
  getJadwalTanams,
  getJadwalTanamById,
  updateJadwalTanam,
  deleteJadwalTanam,
} from '../controllers/jadwalTanam.controller';
import {
  getPanens,
  getPanenById,
  createPanen,
  updatePanen,
  deletePanen,
} from '../controllers/panen.controller';

const router = Router();

// Jadwal Tanam Sub-routes (/api/produksi/jadwal-tanam)
router.post('/jadwal-tanam', createJadwalTanam);
router.get('/jadwal-tanam', getJadwalTanams);
router.get('/jadwal-tanam/:id', getJadwalTanamById);
router.put('/jadwal-tanam/:id', updateJadwalTanam);
router.delete('/jadwal-tanam/:id', deleteJadwalTanam);

// Panen Sub-routes (/api/produksi/panen)
router.get('/panen', getPanens);
router.get('/panen/:id', getPanenById);
router.post('/panen', createPanen);
router.put('/panen/:id', updatePanen);
router.delete('/panen/:id', deletePanen);

export default router;
