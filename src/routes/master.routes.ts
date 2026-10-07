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
import { uploadSingle, uploadNone } from '../middlewares/upload.middleware';

import * as custCont from '../controllers/customer.controller';
import * as gudangCont from '../controllers/gudang.controller';
import * as suppCont from '../controllers/supplier.controller';
import * as harvestTypeCont from '../controllers/masterHarvestType.controller';

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
router.post('/customer', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), custCont.createCustomer);
router.get('/customer/list', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomers);
router.get('/customer', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomers);
router.get('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.getCustomerById);
router.put('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), custCont.updateCustomer);
router.delete('/customer/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), custCont.deleteCustomer);

// Gudang routes
router.post('/gudang', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), gudangCont.createGudang);
router.get('/gudang/list', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.getGudang);
router.get('/gudang', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.getGudang);
router.get('/gudang/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.getGudangById);
router.put('/gudang/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), gudangCont.updateGudang);
router.delete('/gudang/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), gudangCont.deleteGudang);

// Supplier routes
router.post('/supplier', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), suppCont.createSupplier);
router.get('/supplier/list', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.getSuppliers);
router.get('/supplier', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.getSuppliers);
router.get('/supplier/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.getSupplierById);
router.put('/supplier/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), suppCont.updateSupplier);
router.delete('/supplier/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), suppCont.deleteSupplier);

import * as labCont from '../controllers/laboratorium.controller';
import * as paramCont from '../controllers/masterParameter.controller';
import * as varietyParamCont from '../controllers/varietyParameter.controller';

// Laboratorium routes
router.post('/laboratorium', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), labCont.createLaboratorium);
router.get('/laboratorium/list', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.getLaboratoriumList);
router.get('/laboratorium', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.getLaboratoriums);
router.get('/laboratorium/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.getLaboratoriumById);
router.put('/laboratorium/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), uploadNone(), labCont.updateLaboratorium);
router.delete('/laboratorium/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), labCont.deleteLaboratorium);

// Master Parameter routes
router.get('/parameter/modul-list', paramCont.getModulList);
router.get('/parameter', paramCont.getMasterParameters);
router.get('/parameter/:id', paramCont.getMasterParameterById);
router.post('/parameter', authenticateJWT, authorizeRoles('superadmin', 'admin'), paramCont.createMasterParameter);
router.put('/parameter/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), paramCont.updateMasterParameter);
router.delete('/parameter/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), paramCont.deleteMasterParameter);

// Harvest Type routes
router.get('/harvest-type', authenticateJWT, authorizeRoles('superadmin', 'admin'), harvestTypeCont.getHarvestTypes);
router.get('/harvest-type/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), harvestTypeCont.getHarvestTypeDetail);
router.post('/harvest-type', authenticateJWT, authorizeRoles('superadmin', 'admin'), harvestTypeCont.createHarvestType);
router.put('/harvest-type/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), harvestTypeCont.updateHarvestType);
router.delete('/harvest-type/:id', authenticateJWT, authorizeRoles('superadmin', 'admin'), harvestTypeCont.deleteHarvestType);
router.post('/harvest-type/:id/price', authenticateJWT, authorizeRoles('superadmin', 'admin'), harvestTypeCont.addHarvestTypePrice);

// Variety Parameter routes
router.get('/variety-parameter/:varietyId', varietyParamCont.getVarietyParameters);
router.post('/variety-parameter/:varietyId/batch', authenticateJWT, authorizeRoles('superadmin', 'admin'), varietyParamCont.upsertVarietyParametersBatch);

import * as pjCont from '../controllers/penanggungJawab.controller';

// Penanggung Jawab routes
router.get('/penanggung-jawab/stats', pjCont.getStats);
router.get('/penanggung-jawab/next-kode', pjCont.getNextKode);
router.get('/penanggung-jawab', pjCont.getPenanggungJawab);
router.get('/penanggung-jawab/:id', pjCont.getPenanggungJawabById);
router.post('/penanggung-jawab', pjCont.createPenanggungJawab);
router.put('/penanggung-jawab/:id', pjCont.updatePenanggungJawab);
router.delete('/penanggung-jawab/:id', pjCont.deletePenanggungJawab);

export default router;
