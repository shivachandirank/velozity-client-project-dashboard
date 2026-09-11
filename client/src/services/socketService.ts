import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { QueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;
let activeOnlineUsersCount = 1;
const listeners = new Set<(count: number) => void>();

export function connectSocket(queryClient: QueryClient) {
  const token = useAuthStore.getState().accessToken;
  if (!token) return;

  if (socket && socket.connected) return socket;

  const targetUrl = import.meta.env.VITE_API_URL || window.location.origin;

  socket = io(targetUrl, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('⚡ Socket.IO connected:', socket?.id);
  });

  socket.on('presence:update', (data: { activeUsersCount: number }) => {
    activeOnlineUsersCount = data.activeUsersCount;
    listeners.forEach((fn) => fn(activeOnlineUsersCount));
  });

  socket.on('activity:created', (newActivity) => {
    console.log('🔔 Real-time activity received:', newActivity);
    queryClient.invalidateQueries({ queryKey: ['activity'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  });

  socket.on('notification:created', (newNotification) => {
    console.log('🔔 Real-time notification received:', newNotification);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket.IO disconnected');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinProjectRoom(projectId: string) {
  if (socket && socket.connected) {
    socket.emit('join:project', projectId);
  }
}

export function leaveProjectRoom(projectId: string) {
  if (socket && socket.connected) {
    socket.emit('leave:project', projectId);
  }
}

export function subscribePresence(callback: (count: number) => void) {
  listeners.add(callback);
  callback(activeOnlineUsersCount);
  return () => {
    listeners.delete(callback);
  };
}

export function getSocket() {
  return socket;
}
