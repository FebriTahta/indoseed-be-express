import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import {
  createGreenhouse,
  getGreenhouses,
  getGreenhouseById,
  updateGreenhouse,
  deleteGreenhouse
} from '../controllers/greenhouse.controller';
import {
  createCommodity,
  getCommodities,
  getCommodityById,
  updateCommodity,
  deleteCommodity
} from '../controllers/commodity.controller';
import {
  createVariety,
  getVarieties,
  getVarietyById,
  updateVariety,
  deleteVariety
} from '../controllers/variety.controller';
import {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner
} from '../controllers/partner.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';

import * as custCont from '../controllers/customer.controller';

const router = Router();

router.get('/user', authenticateJWT, authorizeRoles('superadmin', 'admin'), getUsers);

// Greenhouse routes
router.post('/greenhouse', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createGreenhouse);
router.get('/greenhouse', authenticateJWT, authorizeRoles('superadmin', 'admin'), getGreenhouses);
router.get('/greenhouse/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), getGreenhouseById);
router.put('/greenhouse/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updateGreenhouse);
router.delete('/greenhouse/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deleteGreenhouse);

// Commodity routes
router.post('/commodity', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createCommodity);
router.get('/commodity', authenticateJWT, authorizeRoles('superadmin', 'admin'), getCommodities);
router.get('/commodity/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), getCommodityById);
router.put('/commodity/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updateCommodity);
router.delete('/commodity/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deleteCommodity);

// Variety routes
router.post('/variety', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createVariety);
router.get('/variety', authenticateJWT, authorizeRoles('superadmin', 'admin'), getVarieties);
router.get('/variety/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), getVarietyById);
router.put('/variety/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updateVariety);
router.delete('/variety/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deleteVariety);

// Partner routes
router.post('/partner', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createPartner);
router.get('/partner', authenticateJWT, authorizeRoles('superadmin', 'admin'), getPartners);
router.get('/partner/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), getPartnerById);
router.put('/partner/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updatePartner);
router.delete('/partner/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deletePartner);

// Customer routes
router.post('/customer', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.createCustomer);
router.get('/customer', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomers);
router.get('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomerById);
router.put('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'),  custCont.updateCustomer);
router.delete('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.deleteCustomer);


export default router;
