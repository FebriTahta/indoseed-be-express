import { Router } from 'express';
import {
  getPerencanaanProduksiList,
  getPerencanaanProduksiStats,
  getPerencanaanProduksiById,
  createPerencanaanProduksi,
  updatePerencanaanProduksi,
  deletePerencanaanProduksi,
} from '../controllers/perencanaanProduksi.controller';
import {
  getPersetujuanProduksiList,
  getPersetujuanProduksiStats,
  getPersetujuanProduksiById,
  approvePersetujuanProduksi,
  rejectPersetujuanProduksi,
} from '../controllers/persetujuanProduksi.controller';
import {
  getKontrakPanenList,
  getKontrakPanenStats,
  getNextKontrakNumber,
  getKontrakPanenById,
  createKontrakPanen,
  updateKontrakPanen,
  deleteKontrakPanen,
  getHarvestTypesForKontrak,
} from '../controllers/kontrakPanen.controller';
import {
  createJadwalTanam,
  getJadwalTanams,
  getJadwalTanamStats,
  getNextKodeJadwalTanam,
  getJadwalTanamById,
  updateJadwalTanam,
  updateJadwalTanamStatus,
  deleteJadwalTanam,
} from '../controllers/jadwalTanam.controller';
import {
  getPanens,
  getPanenById,
  getPanenStats,
  getRingkasanKomoditas,
  getChartHasilPanen,
  getEligibleJadwalTanam,
  getNextPanenCode,
  createPanen,
  updatePanen,
  deletePanen,
} from '../controllers/panen.controller';
import {
  getPemeriksaanLahanList,
  getPemeriksaanLahanStats,
  getPemeriksaanLahanById,
  getReferensiJadwalTanam,
  createPemeriksaanLahan,
  updatePemeriksaanLahan,
  deletePemeriksaanLahan,
} from '../controllers/pemeriksaanLahan.controller';
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
import { getDashboardProduksiData } from '../controllers/dashboardProduksi.controller';

const router = Router();

// Dashboard Produksi (/api/produksi/dashboard)
router.get('/dashboard', getDashboardProduksiData);

// Perencanaan Produksi Sub-routes (/api/produksi/perencanaan-produksi)
router.get('/perencanaan-produksi', getPerencanaanProduksiList);
router.get('/perencanaan-produksi/stats', getPerencanaanProduksiStats);
router.get('/perencanaan-produksi/:id', getPerencanaanProduksiById);
router.post('/perencanaan-produksi', createPerencanaanProduksi);
router.put('/perencanaan-produksi/:id', updatePerencanaanProduksi);
router.delete('/perencanaan-produksi/:id', deletePerencanaanProduksi);

// Kontrak Panen Sub-routes (/api/produksi/kontrak-panen)
router.get('/kontrak-panen', getKontrakPanenList);
router.get('/kontrak-panen/stats', getKontrakPanenStats);
router.get('/kontrak-panen/next-number', getNextKontrakNumber);
router.get('/kontrak-panen/harvest-types', getHarvestTypesForKontrak);
router.get('/kontrak-panen/:id', getKontrakPanenById);
router.post('/kontrak-panen', createKontrakPanen);
router.put('/kontrak-panen/:id', updateKontrakPanen);
router.delete('/kontrak-panen/:id', deleteKontrakPanen);

// Jadwal Tanam Sub-routes (/api/produksi/jadwal-tanam)
router.get('/jadwal-tanam/stats', getJadwalTanamStats);
router.get('/jadwal-tanam/next-code', getNextKodeJadwalTanam);
router.post('/jadwal-tanam', createJadwalTanam);
router.get('/jadwal-tanam', getJadwalTanams);
router.get('/jadwal-tanam/:id', getJadwalTanamById);
router.put('/jadwal-tanam/:id', updateJadwalTanam);
router.patch('/jadwal-tanam/:id/status', updateJadwalTanamStatus);
router.delete('/jadwal-tanam/:id', deleteJadwalTanam);

// Panen Sub-routes (/api/produksi/panen)
router.get('/panen/stats', getPanenStats);
router.get('/panen/ringkasan-komoditas', getRingkasanKomoditas);
router.get('/panen/chart-data', getChartHasilPanen);
router.get('/panen/referensi-jadwal-tanam', getEligibleJadwalTanam);
router.get('/panen/next-code', getNextPanenCode);
router.get('/panen', getPanens);
router.get('/panen/:id', getPanenById);
router.post('/panen', createPanen);
router.put('/panen/:id', updatePanen);
router.delete('/panen/:id', deletePanen);

// Pemeriksaan Lahan Sub-routes (/api/produksi/pemeriksaan-lahan)
router.get('/pemeriksaan-lahan/stats', getPemeriksaanLahanStats);
router.get('/pemeriksaan-lahan/referensi-jadwal-tanam', getReferensiJadwalTanam);
router.get('/pemeriksaan-lahan', getPemeriksaanLahanList);
router.get('/pemeriksaan-lahan/:id', getPemeriksaanLahanById);
router.post('/pemeriksaan-lahan', createPemeriksaanLahan);
router.put('/pemeriksaan-lahan/:id', updatePemeriksaanLahan);
router.delete('/pemeriksaan-lahan/:id', deletePemeriksaanLahan);

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

// Persetujuan Produksi Sub-routes (/api/produksi/persetujuan-produksi)
router.get('/persetujuan-produksi/stats', getPersetujuanProduksiStats);
router.get('/persetujuan-produksi', getPersetujuanProduksiList);
router.get('/persetujuan-produksi/:id', getPersetujuanProduksiById);
router.patch('/persetujuan-produksi/:id/approve', approvePersetujuanProduksi);
router.patch('/persetujuan-produksi/:id/reject', rejectPersetujuanProduksi);

export default router;
