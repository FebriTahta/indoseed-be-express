import express from 'express';
import * as QCController from '../controllers/qc.controller';
import * as DocumentController from '../controllers/document.controller';
import { uploadSingle } from '../middlewares/upload.middleware';
import pengujiRoutes from './penguji.routes';

const router = express.Router();

router.use('/penguji', pengujiRoutes);

// Laboratoriums
router.get('/laboratoriums', QCController.getLaboratoriums);

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
