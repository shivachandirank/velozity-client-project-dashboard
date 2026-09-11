import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskFilterQuerySchema,
} from '../validators/task.validator';
import { AuthenticatedRequest } from '../types';

export class TaskController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const filter = taskFilterQuerySchema.parse(req.query);
      const tasks = await taskService.getTasksForUser(filter, req.user);
      return res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const task = await taskService.getTaskById(req.params.id, req.user);
      return res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const input = createTaskSchema.parse(req.body);
      const task = await taskService.createTask(input, req.user);
      return res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const input = updateTaskSchema.parse(req.body);
      const task = await taskService.updateTask(req.params.id, input, req.user);
      return res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const { status } = updateTaskStatusSchema.parse(req.body);
      const task = await taskService.updateTaskStatus(req.params.id, status, req.user);
      return res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      await taskService.deleteTask(req.params.id, req.user);
      return res.json({ success: true, data: { message: 'Task deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
