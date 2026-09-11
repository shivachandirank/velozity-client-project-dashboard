import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';
import { prisma } from '../repositories/prisma';

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access restricted to roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

export async function authorizeProjectAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(AppError.unauthorized());
    const projectId = req.params.id || req.body.projectId;

    if (!projectId) return next();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, ownerId: true },
    });

    if (!project) {
      return next(AppError.notFound('Project not found'));
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    if (req.user.role === Role.PROJECT_MANAGER) {
      if (project.ownerId !== req.user.id) {
        return next(AppError.forbidden('You do not have access to projects owned by another Project Manager'));
      }
      return next();
    }

    if (req.user.role === Role.DEVELOPER) {
      // Developer can only view a project if they are assigned to a task inside that project
      const assignedTaskCount = await prisma.task.count({
        where: {
          projectId,
          assignedDeveloperId: req.user.id,
        },
      });

      if (assignedTaskCount === 0) {
        return next(AppError.forbidden('You do not have access to this project'));
      }
      return next();
    }

    return next(AppError.forbidden());
  } catch (error) {
    next(error);
  }
}

export async function authorizeTaskAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(AppError.unauthorized());
    const taskId = req.params.id;

    if (!taskId) return next();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } },
    });

    if (!task) {
      return next(AppError.notFound('Task not found'));
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    if (req.user.role === Role.PROJECT_MANAGER) {
      if (task.project.ownerId !== req.user.id) {
        return next(AppError.forbidden('You do not have permission to access tasks in another PM\'s project'));
      }
      return next();
    }

    if (req.user.role === Role.DEVELOPER) {
      if (task.assignedDeveloperId !== req.user.id) {
        return next(AppError.forbidden('You are not authorized to view or modify another developer\'s task'));
      }
      return next();
    }

    return next(AppError.forbidden());
  } catch (error) {
    next(error);
  }
}
