import { prisma } from './prisma';
import { CreateTaskInput, UpdateTaskInput, TaskFilterQuery } from '../validators/task.validator';
import { TaskStatus, NotificationType, Prisma } from '@prisma/client';

export class TaskRepository {
  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
        activityLogs: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAll(filter: TaskFilterQuery & { allowedProjectIds?: string[] }) {
    const where: Prisma.TaskWhereInput = {};

    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.assignedDeveloperId) where.assignedDeveloperId = filter.assignedDeveloperId;
    if (filter.allowedProjectIds) where.projectId = { in: filter.allowedProjectIds };

    if (filter.dueDateFrom || filter.dueDateTo) {
      where.dueDate = {};
      if (filter.dueDateFrom) where.dueDate.gte = new Date(filter.dueDateFrom);
      if (filter.dueDateTo) where.dueDate.lte = new Date(filter.dueDateTo);
    }

    return prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });
  }

  async create(data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assignedDeveloperId: data.assignedDeveloperId,
        priority: data.priority,
        dueDate: data.dueDate,
        isOverdue: new Date(data.dueDate) < new Date(),
      },
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: UpdateTaskInput) {
    const updateData: Prisma.TaskUpdateInput = { ...data };
    if (data.dueDate) {
      updateData.isOverdue = new Date(data.dueDate) < new Date();
    }
    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Update task status in a database transaction with ActivityLog and Notification
   */
  async updateStatusWithTransaction(
    id: string,
    newStatus: TaskStatus,
    userId: string,
    userName: string
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingTask = await tx.task.findUnique({
        where: { id },
        include: {
          project: { select: { id: true, name: true, ownerId: true } },
          assignedDeveloper: { select: { id: true, name: true, email: true } },
        },
      });

      if (!existingTask) throw new Error('Task not found');

      const previousStatus = existingTask.status;

      // 1. Update Task status
      const updatedTask = await tx.task.update({
        where: { id },
        data: { status: newStatus },
        include: {
          project: { select: { id: true, name: true, ownerId: true } },
          assignedDeveloper: { select: { id: true, name: true, email: true } },
        },
      });

      // Format status string (e.g. IN_PROGRESS -> In Progress)
      const formatStatus = (s: string) => s.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
      const humanReadableMsg = `${userName} moved Task "${existingTask.title}" from ${formatStatus(previousStatus)} → ${formatStatus(newStatus)}`;

      // 2. Create ActivityLog
      const activityLog = await tx.activityLog.create({
        data: {
          projectId: existingTask.projectId,
          taskId: existingTask.id,
          userId,
          action: 'STATUS_UPDATE',
          previousStatus,
          newStatus,
          description: humanReadableMsg,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      });

      // 3. Create Notification if task is moved to IN_REVIEW -> notify Project Owner (PM)
      let notification = null;
      if (newStatus === TaskStatus.IN_REVIEW && existingTask.project.ownerId !== userId) {
        notification = await tx.notification.create({
          data: {
            recipientId: existingTask.project.ownerId,
            actorId: userId,
            taskId: existingTask.id,
            projectId: existingTask.projectId,
            type: NotificationType.TASK_IN_REVIEW,
            message: `${userName} moved Task "${existingTask.title}" to In Review.`,
          },
          include: {
            actor: { select: { id: true, name: true } },
          },
        });
      }

      return { updatedTask, activityLog, notification, previousStatus };
    });
  }

  async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  async markOverdueTasks() {
    const now = new Date();
    return prisma.task.updateMany({
      where: {
        dueDate: { lt: now },
        status: { not: TaskStatus.DONE },
        isOverdue: false,
      },
      data: { isOverdue: true },
    });
  }
}

export const taskRepository = new TaskRepository();
