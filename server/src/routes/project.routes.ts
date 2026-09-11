import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { authorizeRoles, authorizeProjectAccess } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => projectController.getAll(req, res, next));
router.get('/:id', authorizeProjectAccess, (req, res, next) => projectController.getById(req, res, next));
router.post('/', authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => projectController.create(req, res, next));
router.patch('/:id', authorizeProjectAccess, authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => projectController.update(req, res, next));
router.delete('/:id', authorizeProjectAccess, authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER), (req, res, next) => projectController.delete(req, res, next));

export default router;
