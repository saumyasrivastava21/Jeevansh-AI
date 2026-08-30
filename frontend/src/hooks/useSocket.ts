import { useContext } from 'react';
import { SocketContext } from '@/contexts/SocketContext';

/**
 * Custom hook to access the Socket.io context.
 * Provides: socket, isConnected, onlineDoctors, notifications,
 * unreadCount, joinPostRoom, leavePostRoom, markNotificationsRead.
 */
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
}
