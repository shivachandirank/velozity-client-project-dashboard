export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_IN_REVIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastSeenAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientEntity {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; company: string };
  owner?: { id: string; name: string; email: string; role?: Role };
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedDeveloperId?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; ownerId?: string };
  assignedDeveloper?: { id: string; name: string; email: string } | null;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId?: string | null;
  userId: string;
  action: string;
  previousStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  description: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: Role };
  project?: { id: string; name: string };
  task?: { id: string; title: string };
}

export interface AppNotification {
  id: string;
  recipientId: string;
  actorId?: string | null;
  taskId?: string | null;
  projectId?: string | null;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  actor?: { id: string; name: string };
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: Priority;
  dueDateFrom?: string;
  dueDateTo?: string;
  projectId?: string;
  assignedDeveloperId?: string;
}
