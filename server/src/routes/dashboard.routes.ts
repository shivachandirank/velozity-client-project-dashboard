import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/admin', authorizeRoles(Role.ADMIN), (req, res, next) => dashboardController.getAdminDashboard(req, res, next));
router.get('/manager', authorizeRoles(Role.PROJECT_MANAGER, Role.ADMIN), (req, res, next) => dashboardController.getManagerDashboard(req, res, next));
router.get('/developer', authorizeRoles(Role.DEVELOPER, Role.ADMIN), (req, res, next) => dashboardController.getDeveloperDashboard(req, res, next));

export default router;
