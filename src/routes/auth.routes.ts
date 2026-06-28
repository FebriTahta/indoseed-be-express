import { Router } from 'express';
import { register, verifyOtp, login, resendOtp, logout } from '../controllers/auth.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimit.middleware';
import { verifyTurnstile } from '../middlewares/turnstile.middleware';

const router = Router();

router.post('/register', registerRateLimiter, verifyTurnstile, register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginRateLimiter, login);
router.post('/logout', authenticateJWT, logout);

// Example protected route for superadmin
router.get('/superadmin-only', authenticateJWT, authorizeRoles('superadmin'), (req: any, res) => {
  res.json({ message: 'Welcome Superadmin', user: req.user });
});

export default router;
