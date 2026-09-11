import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => userController.getAll(req, res, next));
router.get('/:id', (req, res, next) => userController.getById(req, res, next));
router.post('/', authorizeRoles(Role.ADMIN), (req, res, next) => userController.create(req, res, next));
router.patch('/:id', authorizeRoles(Role.ADMIN), (req, res, next) => userController.update(req, res, next));
router.delete('/:id', authorizeRoles(Role.ADMIN), (req, res, next) => userController.delete(req, res, next));

export default router;
