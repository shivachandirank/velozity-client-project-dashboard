import { prisma } from './prisma';

export class NotificationRepository {
  async findByRecipient(recipientId: string, limit: number = 50) {
    return prisma.notification.findMany({
      where: { recipientId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true } },
      },
    });
  }

  async countUnread(recipientId: string) {
    return prisma.notification.count({
      where: { recipientId, isRead: false },
    });
  }

  async markAsRead(id: string, recipientId: string) {
    return prisma.notification.updateMany({
      where: { id, recipientId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async create(data: {
    recipientId: string;
    actorId?: string;
    taskId?: string;
    projectId?: string;
    type: 'TASK_ASSIGNED' | 'TASK_IN_REVIEW';
    message: string;
  }) {
    return prisma.notification.create({
      data,
      include: {
        actor: { select: { id: true, name: true } },
      },
    });
  }
}

export const notificationRepository = new NotificationRepository();
