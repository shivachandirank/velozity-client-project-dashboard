import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { authorizeRoles, authorizeTaskAccess } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => taskController.getAll(req, res, next));
router.get('/:id', authorizeTaskAccess, (req, res, next) => taskController.getById(req, res, next));
router.post('/', authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => taskController.create(req, res, next));
router.patch('/:id', authorizeTaskAccess, authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => taskController.update(req, res, next));
router.patch('/:id/status', authorizeTaskAccess, (req, res, next) => taskController.updateStatus(req, res, next));
router.delete('/:id', authorizeTaskAccess, authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => taskController.delete(req, res, next));

export default router;
