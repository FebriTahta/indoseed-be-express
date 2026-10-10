import { Router } from 'express';
import { PengujiController } from '../controllers/penguji.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { PENGUJI_MANAGER_ROLES } from '../constants/roles.constants';
import { pengujiBodySchema, pengujiListQuerySchema } from '../validators/penguji.validator';

const router = Router();
const managerOnly = authorizeRoles(...PENGUJI_MANAGER_ROLES);

router.get('/stats', PengujiController.getStats);
router.get('/', validate(pengujiListQuerySchema, 'query'), PengujiController.getAll);
router.get('/:id', PengujiController.getById);
router.post('/', managerOnly, validate(pengujiBodySchema), PengujiController.create);
router.put('/:id', managerOnly, validate(pengujiBodySchema), PengujiController.update);
router.delete('/:id', managerOnly, PengujiController.delete);
router.post('/:id/reset-password', managerOnly, PengujiController.resetPassword);

export default router;
