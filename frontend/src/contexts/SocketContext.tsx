import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineDoctor {
  userId: string;
  name: string;
  specialty: string;
}

interface Notification {
  _id: string;
  sender: { _id: string; name: string; avatar: string; role: string };
  type: 'mention' | 'like' | 'comment';
  post?: { _id: string; content: string };
  message: string;
  read: boolean;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineDoctors: OnlineDoctor[];
  notifications: Notification[];
  unreadCount: number;
  joinPostRoom: (postId: string) => void;
  leavePostRoom: (postId: string) => void;
  markNotificationsRead: () => Promise<void>;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineDoctors: [],
  notifications: [],
  unreadCount: 0,
  joinPostRoom: () => {},
  leavePostRoom: () => {},
  markNotificationsRead: async () => {},
});

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineDoctors, setOnlineDoctors] = useState<OnlineDoctor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Connect when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineDoctors([]);
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    const token = localStorage.getItem('jeevansh_token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Doctor presence events
    newSocket.on('doctor:online', (doctor: OnlineDoctor) => {
      setOnlineDoctors(prev => {
        if (prev.find(d => d.userId === doctor.userId)) return prev;
        return [...prev, doctor];
      });
    });

    newSocket.on('doctor:offline', ({ userId }: { userId: string }) => {
      setOnlineDoctors(prev => prev.filter(d => d.userId !== userId));
    });

    // Real-time notifications
    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('doctor:online');
      newSocket.off('doctor:offline');
      newSocket.off('notification:new');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const joinPostRoom = useCallback((postId: string) => {
    socketRef.current?.emit('join:post', postId);
  }, []);

  const leavePostRoom = useCallback((postId: string) => {
    socketRef.current?.emit('leave:post', postId);
  }, []);

  const markNotificationsRead = useCallback(async () => {
    try {
      const { apiFetch } = await import('@/lib/api');
      await apiFetch('/community/notifications/read', {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineDoctors,
        notifications,
        unreadCount,
        joinPostRoom,
        leavePostRoom,
        markNotificationsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
