"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/verify-otp', auth_controller_1.verifyOtp);
router.post('/resend-otp', auth_controller_1.resendOtp);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_middleware_1.authenticateJWT, auth_controller_1.logout);
// Example protected route for superadmin
router.get('/superadmin-only', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.authorizeRoles)('superadmin'), (req, res) => {
    res.json({ message: 'Welcome Superadmin', user: req.user });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map