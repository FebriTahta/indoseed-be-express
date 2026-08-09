import { Router } from 'express';
import { getSetting, updateSetting } from '../controllers/setting.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getSetting);
router.put('/', authenticateJWT, updateSetting);

export default router;
