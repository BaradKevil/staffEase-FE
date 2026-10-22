/**
 * ===========================================
 *  staffEase Real-time Socket.IO Context & Provider
 * ===========================================
 *
 * Provides real-time websocket connectivity across staffEase:
 *  - Authenticates with JWT accessToken.
 *  - Automatically invalidates TanStack Query caches for real-time UI synchrony.
 *  - Dispatches toast notifications on incoming live events.
 *  - Fully prepared for direct and channel messaging (chat system).
 */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiBase = import.meta.env.VITE_BASEURL || 'http://localhost:5000/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role') || 'employee';

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`⚡ [Socket.io] Connected to ${socketUrl} (ID: ${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log(`🔌 [Socket.io] Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
      console.warn('⚠️ [Socket.io] Connection error:', error.message);
    });

    // ------------------------------------------------------------------
    // 1. Employee Registration Approval & Count Events
    // ------------------------------------------------------------------
    socket.on('registration:pending_count', (payload) => {
      if (typeof payload?.count === 'number') {
        queryClient.setQueryData(['pending-registration-count'], payload.count);
      }
      queryClient.invalidateQueries({ queryKey: ['pending-registration-count'] });
    });

    socket.on('registration:new', (payload) => {
      // Invalidate queries so admin sees the badge count and employee list instantly
      queryClient.invalidateQueries({ queryKey: ['pending-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });

      const currentRole = localStorage.getItem('role');
      if (currentRole === 'admin') {
        const name = payload?.name || `${payload?.first_name || ''} ${payload?.last_name || ''}`.trim() || 'A new employee';
        toast.info(`📋 ${name} just registered and is awaiting your approval.`, {
          toastId: `reg_new_${payload?.id || Date.now()}`,
          autoClose: 6000,
        });
      }
    });

    socket.on('registration:updated', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['pending-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    });

    socket.on('registration:status', (payload) => {
      if (payload?.status === 'active') {
        toast.success('🎉 Your staffEase registration has been approved! Your account is active.', {
          autoClose: 8000,
        });
      } else if (payload?.status === 'rejected') {
        toast.error(`Your registration request was not approved: ${payload.reason || 'Contact HR'}`, {
          autoClose: 8000,
        });
      }
    });

    // ------------------------------------------------------------------
    // 2. Real-Time Time Tracking Events
    // ------------------------------------------------------------------
    socket.on('time_tracking:change', (payload) => {
      // Instantly invalidate TanStack queries so admin and employee views reflect state
      queryClient.invalidateQueries({ queryKey: ['admin-time-records'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['employee-date-sessions'] });
    });

    socket.on('time_tracking:summary_update', () => {
      queryClient.invalidateQueries({ queryKey: ['today-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-time-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-records'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-overview'] });
    });

    // ------------------------------------------------------------------
    // 3. Notifications & Leave Workflow Events
    // ------------------------------------------------------------------
    socket.on('notification:new', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (notification?.title) {
        toast.info(`🔔 ${notification.title}: ${notification.message || ''}`, {
          autoClose: 5000,
        });
      }
    });

    socket.on('leave:change', () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  // ------------------------------------------------------------------
  //  Future-Proof Chat & Messaging Architecture API
  // ------------------------------------------------------------------
  const sendMessage = useCallback(({ recipientId, channelId, content, metadata }) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        return reject(new Error('Socket is not connected.'));
      }
      socketRef.current.emit(
        'message:send',
        { recipientId, channelId, content, metadata },
        (res) => {
          if (res?.success) resolve(res.message);
          else reject(new Error(res?.error || 'Failed to send message.'));
        }
      );
    });
  }, []);

  const joinChannel = useCallback((channelId) => {
    if (socketRef.current) {
      socketRef.current.emit('channel:join', channelId);
    }
  }, []);

  const leaveChannel = useCallback((channelId) => {
    if (socketRef.current) {
      socketRef.current.emit('channel:leave', channelId);
    }
  }, []);

  const sendTyping = useCallback(({ recipientId, channelId }) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:typing', { recipientId, channelId });
    }
  }, []);

  const sendStopTyping = useCallback(({ recipientId, channelId }) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:stop_typing', { recipientId, channelId });
    }
  }, []);

  const onMessage = useCallback((listener) => {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('message:receive', listener);
    return () => s.off('message:receive', listener);
  }, []);

  const onTyping = useCallback((listener) => {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('chat:typing', listener);
    return () => s.off('chat:typing', listener);
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUserIds,
    sendMessage,
    joinChannel,
    leaveChannel,
    sendTyping,
    sendStopTyping,
    onMessage,
    onTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
