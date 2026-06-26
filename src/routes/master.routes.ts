import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/user', authenticateJWT, authorizeRoles('superadmin', 'admin'), getUsers);

export default router;
