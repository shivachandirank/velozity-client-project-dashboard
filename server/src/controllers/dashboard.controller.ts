import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types';

export class DashboardController {
  async getAdminDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const data = await dashboardService.getAdminDashboard(req.user);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const data = await dashboardService.getManagerDashboard(req.user);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDeveloperDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const data = await dashboardService.getDeveloperDashboard(req.user);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
