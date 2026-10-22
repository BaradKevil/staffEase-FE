/**
 * ===========================================
 *  staffEase Real-time Socket.IO Context & Provider
 * ===========================================
 *
 * Provides real-time websocket connectivity across staffEase:
 *  - Authenticates with JWT accessToken.
 *  - Automatically invalidates TanStack Query caches for real-time UI synchrony.
 *  - Live Presence tracking (online/offline).
 *  - Real-time chat messages, typing indicators, read receipts, and reactions.
 *  - Dispatches toast notifications on incoming live events.
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

      // Query initial online users
      socket.emit('presence:get', (res) => {
        if (Array.isArray(res?.onlineUserIds)) {
          setOnlineUserIds(res.onlineUserIds);
        }
      });
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
    // 1. Presence Tracking (Online / Offline status)
    // ------------------------------------------------------------------
    socket.on('presence:update', (payload) => {
      if (payload?.userId) {
        setOnlineUserIds((prev) => {
          const uid = Number(payload.userId);
          if (payload.status === 'online') {
            return prev.includes(uid) ? prev : [...prev, uid];
          } else {
            return prev.filter((id) => id !== uid);
          }
        });

        queryClient.invalidateQueries({ queryKey: ['chat-directory'] });
        queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      }
    });

    // ------------------------------------------------------------------
    // 2. Chat & Communication Real-Time Sync
    // ------------------------------------------------------------------
    socket.on('message:new', (payload) => {
      if (payload?.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', payload.conversation_id] });
        queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        queryClient.invalidateQueries({ queryKey: ['chat-conversation', payload.conversation_id] });
      }
    });

    socket.on('message:edited', (payload) => {
      if (payload?.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', payload.conversation_id] });
      }
    });

    socket.on('message:deleted', (payload) => {
      if (payload?.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', payload.conversation_id] });
      }
    });

    socket.on('reaction:change', (payload) => {
      if (payload?.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', payload.conversation_id] });
      }
    });

    socket.on('read:receipt', (payload) => {
      if (payload?.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        queryClient.invalidateQueries({ queryKey: ['chat-conversation', payload.conversation_id] });
      }
    });

    socket.on('conversation:new', () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    });

    socket.on('conversation:activity', () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    });

    socket.on('conversation:updated', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (payload?.id) {
        queryClient.invalidateQueries({ queryKey: ['chat-conversation', payload.id] });
      }
    });

    socket.on('member:removed', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (payload?.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ['chat-conversation', payload.conversation_id] });
      }
    });

    // ------------------------------------------------------------------
    // 3. Employee Registration Approval & Count Events
    // ------------------------------------------------------------------
    socket.on('registration:pending_count', (payload) => {
      if (typeof payload?.count === 'number') {
        queryClient.setQueryData(['pending-registration-count'], payload.count);
      }
      queryClient.invalidateQueries({ queryKey: ['pending-registration-count'] });
    });

    socket.on('registration:new', (payload) => {
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

    socket.on('registration:updated', () => {
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
    // 4. Real-Time Time Tracking Events
    // ------------------------------------------------------------------
    socket.on('time_tracking:change', () => {
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
    // 5. In-App Notifications & Leave Workflow Events
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
  //  Chat Helper API
  // ------------------------------------------------------------------
  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('conversation:join', Number(conversationId));
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('conversation:leave', Number(conversationId));
    }
  }, []);

  const startTyping = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing:start', { conversationId: Number(conversationId) });
    }
  }, []);

  const stopTyping = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing:stop', { conversationId: Number(conversationId) });
    }
  }, []);

  const isOnline = useCallback(
    (userId) => {
      return onlineUserIds.includes(Number(userId));
    },
    [onlineUserIds]
  );

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUserIds,
    isOnline,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
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
