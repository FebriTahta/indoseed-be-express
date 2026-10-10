import express from 'express';
import * as AuditTrailController from '../controllers/auditTrail.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { auditFilterSchema, auditListQuerySchema } from '../validators/auditTrail.validator';

const router = express.Router();

router.use(authenticateJWT);

router.get('/summary', AuditTrailController.getAuditSummary);
router.get('/options', AuditTrailController.getAuditOptions);
router.get('/export', validate(auditFilterSchema, 'query'), AuditTrailController.exportAuditCsv);
router.get('/', validate(auditListQuerySchema, 'query'), AuditTrailController.getAuditList);
router.get('/:id', AuditTrailController.getAuditById);

export default router;
