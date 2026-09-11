import { taskRepository } from '../repositories/task.repository';
import { projectRepository } from '../repositories/project.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { CreateTaskInput, UpdateTaskInput, TaskFilterQuery } from '../validators/task.validator';
import { AppError } from '../utils/errors';
import { Role, TaskStatus } from '@prisma/client';
import { AuthenticatedUserPayload } from '../types';
import { emitActivityEvent, emitNotificationEvent } from '../sockets/socketServer';

export class TaskService {
  async getTasksForUser(filter: TaskFilterQuery, user: AuthenticatedUserPayload) {
    if (user.role === Role.ADMIN) {
      return taskRepository.findAll(filter);
    }

    if (user.role === Role.PROJECT_MANAGER) {
      const pmProjects = await projectRepository.findAll(user.id);
      const allowedProjectIds = pmProjects.map(p => p.id);
      return taskRepository.findAll({ ...filter, allowedProjectIds });
    }

    if (user.role === Role.DEVELOPER) {
      return taskRepository.findAll({ ...filter, assignedDeveloperId: user.id });
    }

    return [];
  }

  async getTaskById(id: string, user: AuthenticatedUserPayload) {
    const task = await taskRepository.findById(id);
    if (!task) throw AppError.notFound('Task not found');

    if (user.role === Role.PROJECT_MANAGER && task.project.ownerId !== user.id) {
      throw AppError.forbidden('You do not have permission to access tasks in another PM\'s project');
    }

    if (user.role === Role.DEVELOPER && task.assignedDeveloperId !== user.id) {
      throw AppError.forbidden('You are not authorized to view another developer\'s task');
    }

    return task;
  }

  async createTask(input: CreateTaskInput, user: AuthenticatedUserPayload) {
    // Verify PM owns the project if user is PM
    const project = await projectRepository.findById(input.projectId);
    if (!project) throw AppError.notFound('Project not found');

    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.id) {
      throw AppError.forbidden('You cannot create tasks in a project owned by another PM');
    }

    const task = await taskRepository.create(input);

    // If developer was assigned, create persistent notification & emit real-time event
    if (input.assignedDeveloperId) {
      const notification = await notificationRepository.create({
        recipientId: input.assignedDeveloperId,
        actorId: user.id,
        taskId: task.id,
        projectId: task.projectId,
        type: 'TASK_ASSIGNED',
        message: `You were assigned Task "${task.title}" in ${task.project.name}.`,
      });

      emitNotificationEvent(input.assignedDeveloperId, notification);
    }

    return task;
  }

  async updateTask(id: string, input: UpdateTaskInput, user: AuthenticatedUserPayload) {
    const existingTask = await this.getTaskById(id, user);

    if (user.role === Role.DEVELOPER) {
      throw AppError.forbidden('Developers cannot modify task details. Only status changes are allowed.');
    }

    const updatedTask = await taskRepository.update(id, input);

    // If developer assignment changed
    if (input.assignedDeveloperId && input.assignedDeveloperId !== existingTask.assignedDeveloperId) {
      const notification = await notificationRepository.create({
        recipientId: input.assignedDeveloperId,
        actorId: user.id,
        taskId: updatedTask.id,
        projectId: updatedTask.projectId,
        type: 'TASK_ASSIGNED',
        message: `You were assigned Task "${updatedTask.title}" in ${updatedTask.project.name}.`,
      });

      emitNotificationEvent(input.assignedDeveloperId, notification);
    }

    return updatedTask;
  }

  async updateTaskStatus(id: string, newStatus: TaskStatus, user: AuthenticatedUserPayload) {
    const existingTask = await this.getTaskById(id, user);

    // Perform status update inside Prisma database transaction
    const { updatedTask, activityLog, notification } = await taskRepository.updateStatusWithTransaction(
      id,
      newStatus,
      user.id,
      user.name
    );

    // Emit real-time activity event to project room & interested sockets
    emitActivityEvent(updatedTask.projectId, activityLog, {
      ownerId: existingTask.project.ownerId,
      assignedDeveloperId: existingTask.assignedDeveloperId,
    });

    // If a notification was created for PM (e.g. IN_REVIEW status change)
    if (notification) {
      emitNotificationEvent(existingTask.project.ownerId, notification);
    }

    return updatedTask;
  }

  async deleteTask(id: string, user: AuthenticatedUserPayload) {
    await this.getTaskById(id, user);
    if (user.role === Role.DEVELOPER) {
      throw AppError.forbidden('Developers cannot delete tasks');
    }
    return taskRepository.delete(id);
  }
}

export const taskService = new TaskService();
