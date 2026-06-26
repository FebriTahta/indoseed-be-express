"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const greenhouse_controller_1 = require("../controllers/greenhouse.controller");
const commodity_controller_1 = require("../controllers/commodity.controller");
const variety_controller_1 = require("../controllers/variety.controller");
const partner_controller_1 = require("../controllers/partner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
router.get('/user', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), user_controller_1.getUsers);
// Greenhouse routes
router.post('/greenhouse', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), greenhouse_controller_1.createGreenhouse);
router.get('/greenhouse', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), greenhouse_controller_1.getGreenhouses);
router.get('/greenhouse/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), greenhouse_controller_1.getGreenhouseById);
router.put('/greenhouse/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), greenhouse_controller_1.updateGreenhouse);
router.delete('/greenhouse/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), greenhouse_controller_1.deleteGreenhouse);
// Commodity routes
router.post('/commodity', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), commodity_controller_1.createCommodity);
router.get('/commodity', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), commodity_controller_1.getCommodities);
router.get('/commodity/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), commodity_controller_1.getCommodityById);
router.put('/commodity/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), commodity_controller_1.updateCommodity);
router.delete('/commodity/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), commodity_controller_1.deleteCommodity);
// Variety routes
router.post('/variety', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), variety_controller_1.createVariety);
router.get('/variety', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), variety_controller_1.getVarieties);
router.get('/variety/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), variety_controller_1.getVarietyById);
router.put('/variety/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), variety_controller_1.updateVariety);
router.delete('/variety/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), variety_controller_1.deleteVariety);
// Partner routes
router.post('/partner', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), partner_controller_1.createPartner);
router.get('/partner', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), partner_controller_1.getPartners);
router.get('/partner/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), partner_controller_1.getPartnerById);
router.put('/partner/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), (0, upload_middleware_1.uploadSingle)('image'), partner_controller_1.updatePartner);
router.delete('/partner/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin', 'admin'), partner_controller_1.deletePartner);
exports.default = router;
//# sourceMappingURL=master.routes.js.map