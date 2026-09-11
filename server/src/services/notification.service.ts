import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../utils/errors';

export class NotificationService {
  async getUserNotifications(userId: string) {
    return notificationRepository.findByRecipient(userId);
  }

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.countUnread(userId);
    return { unreadCount: count };
  }

  async markAsRead(id: string, userId: string) {
    await notificationRepository.markAsRead(id, userId);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    return { success: true };
  }
}

export const notificationService = new NotificationService();
