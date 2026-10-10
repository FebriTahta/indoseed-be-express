import express from 'express';
import * as QCController from '../controllers/qc.controller';
import * as DocumentController from '../controllers/document.controller';
import * as QcLookupController from '../controllers/qcLookup.controller';
import { uploadSingle } from '../middlewares/upload.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { lookupQuerySchema, lookupBodySchema, testMethodSchema, testMethodListQuerySchema } from '../validators/qc.validator';
import pengujiRoutes from './penguji.routes';
import permintaanRoutes from './permintaanPengujian.routes';
import { pemeriksaanRouter, hasilRouter } from './pemeriksaanPengujian.routes';

const router = express.Router();

// Seluruh endpoint QC membutuhkan login (dipakai juga untuk mencatat pelaku di riwayat).
router.use(authenticateJWT);

router.use('/penguji', pengujiRoutes);
router.use('/permintaan', permintaanRoutes);
router.use('/pemeriksaan', pemeriksaanRouter);
router.use('/hasil', hasilRouter);

// Master pilihan (dropdown) & metadata alur status
router.get('/meta', QcLookupController.getMeta);
router.get('/lookups', validate(lookupQuerySchema, 'query'), QcLookupController.getLookups);
router.post('/lookups', validate(lookupBodySchema), QcLookupController.createLookup);
router.put('/lookups/:id', validate(lookupBodySchema), QcLookupController.updateLookup);
router.delete('/lookups/:id', QcLookupController.deleteLookup);

// Laboratoriums
router.get('/laboratoriums', QCController.getLaboratoriums);

// Reference Standards
router.get('/standards', QCController.getStandards);
router.get('/standards/:id', QCController.getStandardById);
router.post('/standards', QCController.createStandard);
router.put('/standards/:id', QCController.updateStandard);
router.delete('/standards/:id', QCController.deleteStandard);

// Test Methods
router.get('/methods', validate(testMethodListQuerySchema, 'query'), QCController.getMethods);
router.get('/methods/riwayat', QCController.getMethodRiwayat);
router.get('/methods/:id', QCController.getMethodById);
router.post('/methods', validate(testMethodSchema), QCController.createMethod);
router.put('/methods/:id', validate(testMethodSchema), QCController.updateMethod);
router.delete('/methods/:id', QCController.deleteMethod);
router.delete('/methods/documents/:documentId', QCController.deleteMethodDocument);

// Test Parameters
router.get('/parameters', QCController.getParameters);
router.get('/parameters/:id', QCController.getParameterById);
router.post('/parameters', QCController.createParameter);
router.put('/parameters/:id', QCController.updateParameter);
router.delete('/parameters/:id', QCController.deleteParameter);


// Documents
router.get('/documents', DocumentController.getDocuments);
router.get('/documents/:id', DocumentController.getDocumentById);
router.post('/documents', uploadSingle('file'), DocumentController.createDocument);
router.put('/documents/:id', uploadSingle('file'), DocumentController.updateDocument);
router.delete('/documents/:id', DocumentController.deleteDocument);

import * as QcTestController from '../controllers/qcTest.controller';

// Unified QC Tests
router.get('/tests/summary', QcTestController.getQcTestSummary);
router.get('/tests', QcTestController.getQcTests);
router.get('/tests/:id', QcTestController.getQcTestById);
router.post('/tests', QcTestController.createQcTest);
router.put('/tests/:id', QcTestController.updateQcTest);
router.delete('/tests/:id', QcTestController.deleteQcTest);

export default router;
