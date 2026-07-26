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
import * as gudangCont from '../controllers/gudang.controller';
import * as suppCont from '../controllers/supplier.controller';


const router = Router();

router.get('/user', authenticateJWT, authorizeRoles('superadmin', 'admin'), getUsers);

// Greenhouse routes
router.post('/greenhouse', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createGreenhouse);
router.get('/greenhouse', getGreenhouses);
router.get('/greenhouse/:id', getGreenhouseById);
router.put('/greenhouse/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updateGreenhouse);
router.delete('/greenhouse/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deleteGreenhouse);

// Commodity routes
router.post('/commodity', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createCommodity);
router.get('/commodity', getCommodities);
router.get('/commodity/:id', getCommodityById);
router.put('/commodity/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updateCommodity);
router.delete('/commodity/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deleteCommodity);

// Variety routes
router.post('/variety', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createVariety);
router.get('/variety', getVarieties);
router.get('/variety/:id', getVarietyById);
router.put('/variety/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updateVariety);
router.delete('/variety/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deleteVariety);

// Partner routes
router.post('/partner', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), createPartner);
router.get('/partner', getPartners);
router.get('/partner/:id', getPartnerById);
router.put('/partner/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadSingle('image'), updatePartner);
router.delete('/partner/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), deletePartner);

// Customer routes
router.post('/customer', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.createCustomer);
router.get('/customer', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomers);
router.get('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomerById);
router.put('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'),  custCont.updateCustomer);
router.delete('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.deleteCustomer);

// Gudang routes
router.post('/gudang', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.createGudang);
router.get('/gudang', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.getGudang);
router.get('/gudang/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.getGudangById);
router.put('/gudang/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.updateGudang);
router.delete('/gudang/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.deleteGudang);

// Supplier routes
router.post('/supplier', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.createSupplier);
router.get('/supplier', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.getSuppliers);
router.get('/supplier/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.getSupplierById);
router.put('/supplier/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.updateSupplier);
router.delete('/supplier/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.deleteSupplier);

export default router;
