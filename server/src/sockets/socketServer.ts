import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../repositories/prisma';

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

let io: SocketIOServer | null = null;

// Map user ID -> Set of socket IDs to track multi-tab connections
const activeUserSockets = new Map<string, Set<string>>();

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const configuredClient = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
        const cleanOrigin = origin.replace(/\/$/, '');
        if (
          cleanOrigin === configuredClient ||
          cleanOrigin === 'http://localhost:5173' ||
          cleanOrigin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication error: Missing token'));
      }

      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const user = verifyAccessToken(cleanToken);
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: SocketUser = socket.data.user;
    if (!user) return socket.disconnect(true);

    // Track active socket connection for presence
    if (!activeUserSockets.has(user.id)) {
      activeUserSockets.set(user.id, new Set());
    }
    activeUserSockets.get(user.id)!.add(socket.id);

    // Join personal user room
    socket.join(`user:${user.id}`);

    // If Admin, join global admin room
    if (user.role === Role.ADMIN) {
      socket.join('admin:global');
    }

    // Broadcast active online users count
    broadcastPresence();

    // Handle project room join request with strict RBAC validation
    socket.on('join:project', async (projectId: string) => {
      try {
        if (!projectId) return;

        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, ownerId: true },
        });

        if (!project) {
          return socket.emit('error', { message: 'Project not found' });
        }

        let isAuthorized = false;

        if (user.role === Role.ADMIN) {
          isAuthorized = true;
        } else if (user.role === Role.PROJECT_MANAGER) {
          isAuthorized = project.ownerId === user.id;
        } else if (user.role === Role.DEVELOPER) {
          const taskCount = await prisma.task.count({
            where: { projectId, assignedDeveloperId: user.id },
          });
          isAuthorized = taskCount > 0;
        }

        if (isAuthorized) {
          socket.join(`project:${projectId}`);
          socket.emit('joined:project', { projectId });
        } else {
          socket.emit('error', { message: 'Unauthorized to join project room' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join project room' });
      }
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      const userSockets = activeUserSockets.get(user.id);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUserSockets.delete(user.id);
        }
      }
      broadcastPresence();
    });
  });

  return io;
}

export function getActiveOnlineUserCount(): number {
  return activeUserSockets.size;
}

function broadcastPresence() {
  if (!io) return;
  const count = getActiveOnlineUserCount();
  io.emit('presence:update', { activeUsersCount: count });
}

export function emitActivityEvent(
  projectId: string,
  activityLog: any,
  meta?: { ownerId?: string; assignedDeveloperId?: string | null }
) {
  if (!io) return;

  // 1. Emit to project room
  io.to(`project:${projectId}`).emit('activity:created', activityLog);

  // 2. Emit to global admin room
  io.to('admin:global').emit('activity:created', activityLog);

  // 3. Emit to Project Owner room if specified
  if (meta?.ownerId) {
    io.to(`user:${meta.ownerId}`).emit('activity:created', activityLog);
  }

  // 4. Emit to assigned developer room if specified
  if (meta?.assignedDeveloperId) {
    io.to(`user:${meta.assignedDeveloperId}`).emit('activity:created', activityLog);
  }
}

export function emitNotificationEvent(recipientId: string, notification: any) {
  if (!io) return;
  io.to(`user:${recipientId}`).emit('notification:created', notification);
}

export function getIO(): SocketIOServer | null {
  return io;
}
