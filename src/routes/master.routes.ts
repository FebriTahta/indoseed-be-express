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
router.post('/greenhouse', uploadSingle('image'), createGreenhouse);
router.get('/greenhouse', getGreenhouses);
router.get('/greenhouse/:id', getGreenhouseById);
router.put('/greenhouse/:id', uploadSingle('image'), updateGreenhouse);
router.delete('/greenhouse/:id', deleteGreenhouse);

// Commodity routes
router.post('/commodity', uploadSingle('image'), createCommodity);
router.get('/commodity', getCommodities);
router.get('/commodity/:id', getCommodityById);
router.put('/commodity/:id', uploadSingle('image'), updateCommodity);
router.delete('/commodity/:id', deleteCommodity);

// Variety routes
router.post('/variety', uploadSingle('image'), createVariety);
router.get('/variety', getVarieties);
router.get('/variety/:id', getVarietyById);
router.put('/variety/:id', uploadSingle('image'), updateVariety);
router.delete('/variety/:id', deleteVariety);

// Partner routes
router.post('/partner', uploadSingle('image'), createPartner);
router.get('/partner', getPartners);
router.get('/partner/:id', getPartnerById);
router.put('/partner/:id', uploadSingle('image'), updatePartner);
router.delete('/partner/:id', deletePartner);

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

import * as labCont from '../controllers/laboratorium.controller';
import * as paramCont from '../controllers/masterParameter.controller';
import * as varietyParamCont from '../controllers/varietyParameter.controller';

// Laboratorium routes
router.post('/laboratorium', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.createLaboratorium);
router.get('/laboratorium/list', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.getLaboratoriumList);
router.get('/laboratorium', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.getLaboratoriums);
router.get('/laboratorium/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.getLaboratoriumById);
router.put('/laboratorium/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.updateLaboratorium);
router.delete('/laboratorium/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.deleteLaboratorium);

// Master Parameter routes
router.get('/parameter/modul-list', paramCont.getModulList);
router.get('/parameter', paramCont.getMasterParameters);
router.get('/parameter/:id', paramCont.getMasterParameterById);
router.post('/parameter', authenticateJWT, authorizeRoles('superadmin', 'admin'), paramCont.createMasterParameter);
router.put('/parameter/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), paramCont.updateMasterParameter);
router.delete('/parameter/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), paramCont.deleteMasterParameter);

// Variety Parameter routes
router.get('/variety-parameter/:varietyId', varietyParamCont.getVarietyParameters);
router.post('/variety-parameter/:varietyId/batch', authenticateJWT, authorizeRoles('superadmin', 'admin'), varietyParamCont.upsertVarietyParametersBatch);

export default router;

