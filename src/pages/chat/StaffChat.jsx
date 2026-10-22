/**
 * ===========================================
 *  Staff Chat - Enterprise Real-Time Workplace Messaging
 * ===========================================
 *
 * Professional workplace communication suite integrated directly into staffEase:
 *  - Left rail with Direct Messages, Groups, HR Support, Favourites & Category filters
 *  - Main chat area with brand blue bubbles, real-time read receipts, reactions, replies, attachments
 *  - Collapsible conversation info panel with employee details and shared media/files
 *  - Real-time Socket.IO synchronization for messages, typing, and presence
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import NewConversationModal from '../../components/chat/NewConversationModal';
import GroupMembersModal from '../../components/chat/GroupMembersModal';
import {
  useConversations,
  useConversation,
  useConversationMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useToggleReaction,
  useMarkConversationRead,
  useToggleFavouriteConversation,
  useToggleMuteConversation,
  useRemoveGroupMember,
} from '../../Api/Api';
import { useSocket } from '../../common/SocketContext';
import { toast } from 'react-toastify';

export default function StaffChat() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const currentUserId = currentUser.id;
  const userRole = localStorage.getItem('role') || 'employee';

  const {
    socket,
    onlineUserIds,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    isOnline,
  } = useSocket();

  // Conversations query
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations();

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Set default active conversation once loaded
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Conversation details & messages
  const { data: activeConversation } = useConversation(activeConversationId);
  const { data: messagesData, isLoading: isLoadingMessages } = useConversationMessages(activeConversationId);
  const messages = messagesData?.messages || [];

  // Mutations
  const { mutate: markRead } = useMarkConversationRead();
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: editMessage } = useEditMessage();
  const { mutate: deleteMessage } = useDeleteMessage();
  const { mutate: toggleReaction } = useToggleReaction();
  const { mutate: toggleFav } = useToggleFavouriteConversation();
  const { mutate: toggleMute } = useToggleMuteConversation();
  const { mutate: removeMember } = useRemoveGroupMember(() => {
    setActiveConversationId(null);
    toast.success('You have left the group.');
  });

  // Socket room join & mark read on conversation select
  useEffect(() => {
    if (!activeConversationId) return;

    joinConversation(activeConversationId);
    markRead({ conversationId: activeConversationId });
    setTypingUsers([]);

    return () => {
      leaveConversation(activeConversationId);
    };
  }, [activeConversationId, joinConversation, leaveConversation, markRead]);

  // Real-time typing indicators listener
  useEffect(() => {
    if (!socket || !activeConversationId) return;

    const handleTypingStart = (payload) => {
      if (Number(payload.conversationId) === Number(activeConversationId) && payload.userId !== currentUserId) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === payload.userId)) return prev;
          return [...prev, { userId: payload.userId, name: payload.name }];
        });
      }
    };

    const handleTypingStop = (payload) => {
      if (Number(payload.conversationId) === Number(activeConversationId)) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
      }
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, activeConversationId, currentUserId]);

  const handleSendMessage = (data) => {
    if (!activeConversationId) return;

    sendMessage({
      conversationId: activeConversationId,
      data: {
        ...data,
        idempotency_key: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      },
    });
  };

  const handleEditMessage = (messageId, content) => {
    editMessage({ messageId, content });
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  const handleToggleReaction = (messageId, emoji) => {
    toggleReaction({ messageId, emoji });
  };

  const handleToggleFavourite = () => {
    if (activeConversationId) toggleFav(activeConversationId);
  };

  const handleToggleMute = () => {
    if (activeConversationId) toggleMute(activeConversationId);
  };

  const handleLeaveGroup = () => {
    if (activeConversationId && window.confirm('Are you sure you want to leave this group?')) {
      removeMember({ conversationId: activeConversationId, userId: currentUserId });
    }
  };

  const isOtherOnline = activeConversation?.other_user
    ? isOnline(activeConversation.other_user.id)
    : false;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Left Chat Rail (Visible on Desktop, or when no active on mobile) */}
      {/* ------------------------------------------------------------- */}
      {(isMdUp || !activeConversationId) && (
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
          onlineUserIds={onlineUserIds}
          currentUserId={currentUserId}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* Main Conversation Area (Visible on Desktop, or when active on mobile) */}
      {/* ------------------------------------------------------------- */}
      {(isMdUp || activeConversationId) && (
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          currentUserId={currentUserId}
          userRole={userRole}
          isOtherOnline={isOtherOnline}
          typingUsers={typingUsers}
          onBack={!isMdUp ? () => setActiveConversationId(null) : undefined}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onToggleReaction={handleToggleReaction}
          onToggleFavourite={handleToggleFavourite}
          onToggleMute={handleToggleMute}
          onOpenMembersModal={() => setIsMembersModalOpen(true)}
          onLeaveGroup={handleLeaveGroup}
        />
      )}

      {/* New Conversation Modal */}
      <NewConversationModal
        open={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onConversationCreated={(id) => {
          setActiveConversationId(id);
          setIsNewChatModalOpen(false);
        }}
        currentUserId={currentUserId}
      />

      {/* Group Members Management Modal */}
      {activeConversation && activeConversation.type === 'group' && (
        <GroupMembersModal
          open={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          conversation={activeConversation}
          currentUserId={currentUserId}
          userRole={userRole}
        />
      )}
    </Box>
  );
}
