import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/recent', (req, res, next) => activityController.getRecent(req, res, next));
router.get('/', (req, res, next) => activityController.getProjectActivity(req, res, next));

export default router;
