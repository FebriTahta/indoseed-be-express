import express from 'express';
import * as QCController from '../controllers/qc.controller';
import * as DocumentController from '../controllers/document.controller';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = express.Router();

// Reference Standards
router.get('/standards', QCController.getStandards);
router.get('/standards/:id', QCController.getStandardById);
router.post('/standards', QCController.createStandard);
router.put('/standards/:id', QCController.updateStandard);
router.delete('/standards/:id', QCController.deleteStandard);

// Test Methods
router.get('/methods', QCController.getMethods);
router.get('/methods/:id', QCController.getMethodById);
router.post('/methods', QCController.createMethod);
router.put('/methods/:id', QCController.updateMethod);
router.delete('/methods/:id', QCController.deleteMethod);

// Test Parameters
router.get('/parameters', QCController.getParameters);
router.get('/parameters/:id', QCController.getParameterById);
router.post('/parameters', QCController.createParameter);
router.put('/parameters/:id', QCController.updateParameter);
router.delete('/parameters/:id', QCController.deleteParameter);

import * as QcDayaTumbuhController from '../controllers/qcDayaTumbuh.controller';

// Documents
router.get('/documents', DocumentController.getDocuments);
router.get('/documents/:id', DocumentController.getDocumentById);
router.post('/documents', uploadSingle('file'), DocumentController.createDocument);
router.put('/documents/:id', uploadSingle('file'), DocumentController.updateDocument);
router.delete('/documents/:id', DocumentController.deleteDocument);

// Daya Tumbuh
router.get('/daya-tumbuh', QcDayaTumbuhController.getDayaTumbuh);
router.get('/daya-tumbuh/:id', QcDayaTumbuhController.getDayaTumbuhById);
router.post('/daya-tumbuh', QcDayaTumbuhController.createDayaTumbuh);
router.put('/daya-tumbuh/:id', QcDayaTumbuhController.updateDayaTumbuh);
router.delete('/daya-tumbuh/:id', QcDayaTumbuhController.deleteDayaTumbuh);

import * as QcKadarAirController from '../controllers/qcKadarAir.controller';

// Kadar Air
router.get('/kadar-air', QcKadarAirController.getKadarAir);
router.get('/kadar-air/:id', QcKadarAirController.getKadarAirById);
router.post('/kadar-air', QcKadarAirController.createKadarAir);
router.put('/kadar-air/:id', QcKadarAirController.updateKadarAir);
router.delete('/kadar-air/:id', QcKadarAirController.deleteKadarAir);

export default router;
