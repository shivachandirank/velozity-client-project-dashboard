import { Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import { AuthenticatedRequest } from '../types';

export class ProjectController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const projects = await projectService.getProjectsForUser(req.user);
      return res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const project = await projectService.getProjectById(req.params.id, req.user);
      return res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const input = createProjectSchema.parse(req.body);
      const project = await projectService.createProject(input, req.user);
      return res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      const input = updateProjectSchema.parse(req.body);
      const project = await projectService.updateProject(req.params.id, input, req.user);
      return res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      await projectService.deleteProject(req.params.id, req.user);
      return res.json({ success: true, data: { message: 'Project deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
