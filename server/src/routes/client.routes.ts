import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => clientController.getAll(req, res, next));
router.get('/:id', authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => clientController.getById(req, res, next));
router.post('/', authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => clientController.create(req, res, next));
router.patch('/:id', authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => clientController.update(req, res, next));
router.delete('/:id', authorizeRoles(Role.ADMIN), (req, res, next) => clientController.delete(req, res, next));

export default router;
