import { Router } from 'express';
import {
  getStokBenihs,
  getStokBenihById,
  createStokBenih,
  updateStokBenih,
  deleteStokBenih,
} from '../controllers/stokBenih.controller';

const router = Router();

// Stok Benih Sub-routes (/api/gudang/stok-benih)
router.get('/stok-benih', getStokBenihs);
router.get('/stok-benih/:id', getStokBenihById);
router.post('/stok-benih', createStokBenih);
router.put('/stok-benih/:id', updateStokBenih);
router.delete('/stok-benih/:id', deleteStokBenih);

export default router;
