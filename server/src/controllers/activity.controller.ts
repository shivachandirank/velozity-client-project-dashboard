import { Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { AuthenticatedRequest } from '../types';

export class ActivityController {
  async getRecent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const activity = await activityService.getRecentActivity(req.user, limit);
      return res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }

  async getProjectActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return this.getRecent(req, res, next);
      }
      const activity = await activityService.getProjectActivity(projectId);
      return res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();
