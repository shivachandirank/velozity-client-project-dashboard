import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().min(3, 'Task description must be at least 3 characters'),
  projectId: z.string().uuid('Invalid project ID format'),
  assignedDeveloperId: z.string().uuid('Invalid developer ID format').optional().nullable(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.coerce.date(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(3).optional(),
  projectId: z.string().uuid().optional(),
  assignedDeveloperId: z.string().uuid().optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const taskFilterQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  projectId: z.string().uuid().optional(),
  assignedDeveloperId: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskFilterQuery = z.infer<typeof taskFilterQuerySchema>;
