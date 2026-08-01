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
import {
  getMonitoringLahans,
  getMonitoringLahanById,
  createMonitoringLahan,
  updateMonitoringLahan,
  deleteMonitoringLahan,
} from '../controllers/monitoringLahan.controller';
import {
  getMonitoringGreenhouses,
  getMonitoringGreenhouseById,
  createMonitoringGreenhouse,
  updateMonitoringGreenhouse,
  deleteMonitoringGreenhouse,
} from '../controllers/monitoringGreenhouse.controller';
import {
  getKesiapanPanens,
  getKesiapanPanenById,
  createKesiapanPanen,
  updateKesiapanPanen,
  deleteKesiapanPanen,
} from '../controllers/kesiapanPanen.controller';
import {
  getPengeringans,
  getPengeringanById,
  createPengeringan,
  updatePengeringan,
  deletePengeringan,
} from '../controllers/pengeringan.controller';
import {
  getBatchProduksis,
  getBatchProduksiById,
  createBatchProduksi,
  updateBatchProduksi,
  deleteBatchProduksi,
} from '../controllers/batchProduksi.controller';
import {
  getSortasis,
  getSortasiById,
  createSortasi,
  updateSortasi,
  deleteSortasi,
} from '../controllers/sortasi.controller';
import {
  getTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} from '../controllers/treatment.controller';

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

// Monitoring Lahan Sub-routes (/api/produksi/monitoring-lahan)
router.get('/monitoring-lahan', getMonitoringLahans);
router.get('/monitoring-lahan/:id', getMonitoringLahanById);
router.post('/monitoring-lahan', createMonitoringLahan);
router.put('/monitoring-lahan/:id', updateMonitoringLahan);
router.delete('/monitoring-lahan/:id', deleteMonitoringLahan);

// Monitoring Greenhouse Sub-routes (/api/produksi/monitoring-greenhouse)
router.get('/monitoring-greenhouse', getMonitoringGreenhouses);
router.get('/monitoring-greenhouse/:id', getMonitoringGreenhouseById);
router.post('/monitoring-greenhouse', createMonitoringGreenhouse);
router.put('/monitoring-greenhouse/:id', updateMonitoringGreenhouse);
router.delete('/monitoring-greenhouse/:id', deleteMonitoringGreenhouse);

// Kesiapan Panen Sub-routes (/api/produksi/kesiapan-panen)
router.get('/kesiapan-panen', getKesiapanPanens);
router.get('/kesiapan-panen/:id', getKesiapanPanenById);
router.post('/kesiapan-panen', createKesiapanPanen);
router.put('/kesiapan-panen/:id', updateKesiapanPanen);
router.delete('/kesiapan-panen/:id', deleteKesiapanPanen);

// Pengeringan Sub-routes (/api/produksi/pengeringan)
router.get('/pengeringan', getPengeringans);
router.get('/pengeringan/:id', getPengeringanById);
router.post('/pengeringan', createPengeringan);
router.put('/pengeringan/:id', updatePengeringan);
router.delete('/pengeringan/:id', deletePengeringan);

// Batch Produksi Sub-routes (/api/produksi/batch-produksi)
router.get('/batch-produksi', getBatchProduksis);
router.get('/batch-produksi/:id', getBatchProduksiById);
router.post('/batch-produksi', createBatchProduksi);
router.put('/batch-produksi/:id', updateBatchProduksi);
router.delete('/batch-produksi/:id', deleteBatchProduksi);

// Sortasi Sub-routes (/api/produksi/sortasi)
router.get('/sortasi', getSortasis);
router.get('/sortasi/:id', getSortasiById);
router.post('/sortasi', createSortasi);
router.put('/sortasi/:id', updateSortasi);
router.delete('/sortasi/:id', deleteSortasi);

// Treatment Sub-routes (/api/produksi/treatment)
router.get('/treatment', getTreatments);
router.get('/treatment/:id', getTreatmentById);
router.post('/treatment', createTreatment);
router.put('/treatment/:id', updateTreatment);
router.delete('/treatment/:id', deleteTreatment);

export default router;
