import { activityRepository } from '../repositories/activity.repository';
import { AuthenticatedUserPayload } from '../types';

export class ActivityService {
  async getRecentActivity(user: AuthenticatedUserPayload, limit: number = 20) {
    return activityRepository.getRecentActivity(user, limit);
  }

  async getProjectActivity(projectId: string) {
    return activityRepository.findByProject(projectId);
  }
}

export const activityService = new ActivityService();
