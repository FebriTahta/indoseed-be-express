import { Router } from 'express';
import { register, verifyOtp, login, resendOtp } from '../controllers/auth.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);

// Example protected route for superadmin
router.get('/superadmin-only', authenticateJWT, authorizeRoles('superadmin'), (req: any, res) => {
  res.json({ message: 'Welcome Superadmin', user: req.user });
});

export default router;
