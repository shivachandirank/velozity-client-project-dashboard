import { prisma } from '../repositories/prisma';
import { activityRepository } from '../repositories/activity.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { getActiveOnlineUserCount } from '../sockets/socketServer';
import { TaskStatus, Priority } from '@prisma/client';
import { AuthenticatedUserPayload } from '../types';

export class DashboardService {
  async getAdminDashboard(user: AuthenticatedUserPayload) {
    const [totalProjects, totalTasks, taskStatusCounts, overdueTaskCount, recentActivity, notifications] =
      await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.task.count({ where: { isOverdue: true, status: { not: TaskStatus.DONE } } }),
        activityRepository.getRecentActivity(user, 10),
        notificationRepository.findByRecipient(user.id, 5),
      ]);

    const activeUsersOnline = getActiveOnlineUserCount();

    const tasksByStatus: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    taskStatusCounts.forEach((item: { status: TaskStatus; _count: { _all: number } }) => {
      tasksByStatus[item.status] = item._count._all;
    });

    return {
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTaskCount,
      activeUsersOnline,
      recentActivity,
      notifications,
    };
  }

  async getManagerDashboard(user: AuthenticatedUserPayload) {
    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      include: {
        client: { select: { name: true, company: true } },
        _count: { select: { tasks: true } },
      },
    });

    const projectIds = projects.map((p: { id: string }) => p.id);

    const [taskPriorityCounts, upcomingTasks, projectActivity, notifications] = await Promise.all([
      prisma.task.groupBy({
        by: ['priority'],
        where: { projectId: { in: projectIds } },
        _count: { _all: true },
      }),
      prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          status: { not: TaskStatus.DONE },
        },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: {
          assignedDeveloper: { select: { name: true } },
          project: { select: { name: true } },
        },
      }),
      activityRepository.getRecentActivity(user, 10),
      notificationRepository.findByRecipient(user.id, 5),
    ]);

    const tasksByPriority: Record<Priority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    taskPriorityCounts.forEach((item: { priority: Priority; _count: { _all: number } }) => {
      tasksByPriority[item.priority] = item._count._all;
    });

    return {
      projects,
      projectSummary: {
        totalProjects: projects.length,
        totalTasks: upcomingTasks.length,
      },
      tasksByPriority,
      upcomingTasks,
      projectActivity,
      notifications,
    };
  }

  async getDeveloperDashboard(user: AuthenticatedUserPayload) {
    const assignedTasks = await prisma.task.findMany({
      where: { assignedDeveloperId: user.id },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });

    const overdueTasksCount = assignedTasks.filter((t: { isOverdue: boolean; status: TaskStatus }) => t.isOverdue && t.status !== TaskStatus.DONE).length;

    const tasksByStatus = {
      TODO: assignedTasks.filter((t: { status: TaskStatus }) => t.status === TaskStatus.TODO),
      IN_PROGRESS: assignedTasks.filter((t: { status: TaskStatus }) => t.status === TaskStatus.IN_PROGRESS),
      IN_REVIEW: assignedTasks.filter((t: { status: TaskStatus }) => t.status === TaskStatus.IN_REVIEW),
      DONE: assignedTasks.filter((t: { status: TaskStatus }) => t.status === TaskStatus.DONE),
    };

    const [taskActivity, notifications] = await Promise.all([
      activityRepository.getRecentActivity(user, 10),
      notificationRepository.findByRecipient(user.id, 5),
    ]);

    return {
      totalAssignedTasks: assignedTasks.length,
      overdueTasksCount,
      assignedTasks,
      tasksByStatus,
      taskActivity,
      notifications,
    };
  }
}

export const dashboardService = new DashboardService();
