import { Router } from 'express';
import {
  getStokBenihs,
  getStokBenihById,
  createStokBenih,
  updateStokBenih,
  deleteStokBenih,
} from '../controllers/stokBenih.controller';
import {
  getManajemenStok,
  getManajemenStokStats,
  getManajemenStokById,
  getKartuStok,
} from '../controllers/manajemenStok.controller';
import {
  getMonitoringList,
  getMonitoringStats,
  getMonitoringTren,
  getMonitoringAlerts,
  getMonitoringById,
  createMonitoringPengukuran,
  updateMonitoringPengukuran,
  deleteMonitoringPengukuran,
  getMasterGudangOptions,
} from '../controllers/monitoringGudang.controller';

const router = Router();

// Monitoring Kondisi Gudang Sub-routes (/api/gudang/monitoring-kondisi & /api/gudang/monitoring-suhu)
router.get('/monitoring-kondisi', getMonitoringList);
router.get('/monitoring-kondisi/stats', getMonitoringStats);
router.get('/monitoring-kondisi/tren', getMonitoringTren);
router.get('/monitoring-kondisi/alerts', getMonitoringAlerts);
router.get('/monitoring-kondisi/gudang-options', getMasterGudangOptions);
router.get('/monitoring-kondisi/:id', getMonitoringById);
router.post('/monitoring-kondisi', createMonitoringPengukuran);
router.put('/monitoring-kondisi/:id', updateMonitoringPengukuran);
router.delete('/monitoring-kondisi/:id', deleteMonitoringPengukuran);

// Aliases for /monitoring-suhu
router.get('/monitoring-suhu', getMonitoringList);
router.get('/monitoring-suhu/stats', getMonitoringStats);
router.get('/monitoring-suhu/tren', getMonitoringTren);
router.get('/monitoring-suhu/alerts', getMonitoringAlerts);
router.get('/monitoring-suhu/gudang-options', getMasterGudangOptions);
router.get('/monitoring-suhu/:id', getMonitoringById);
router.post('/monitoring-suhu', createMonitoringPengukuran);
router.put('/monitoring-suhu/:id', updateMonitoringPengukuran);
router.delete('/monitoring-suhu/:id', deleteMonitoringPengukuran);

// Manajemen Stok Sub-routes (/api/gudang/manajemen-stok)
router.get('/manajemen-stok', getManajemenStok);
router.get('/manajemen-stok/stats', getManajemenStokStats);
router.get('/manajemen-stok/kartu-stok/:lot', getKartuStok);
router.get('/manajemen-stok/:id', getManajemenStokById);

// Stok Benih Sub-routes (/api/gudang/stok-benih)
router.get('/stok-benih', getStokBenihs);
router.get('/stok-benih/:id', getStokBenihById);
router.post('/stok-benih', createStokBenih);
router.put('/stok-benih/:id', updateStokBenih);
router.delete('/stok-benih/:id', deleteStokBenih);

export default router;
