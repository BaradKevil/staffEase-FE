/**
 * ===========================================
 *  Teams-Style Chat Window Component
 * ===========================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  VideocamOutlined as MeetIcon,
  PeopleAltOutlined as PeopleIcon,
  MoreHoriz as MoreIcon,
  EditOutlined as EditIcon,
  StarBorderRounded as StarIcon,
  StarRounded as StarFilledIcon,
  NotificationsOffOutlined as MuteIcon,
  NotificationsActiveOutlined as UnmuteIcon,
  ExitToApp as LeaveIcon,
  Close as CloseIcon,
  LinkOutlined as LinkIcon,
  GroupsOutlined as GroupIcon,
  SupportAgentOutlined as SupportIcon,
} from '@mui/icons-material';
import ChatMessageItem from './ChatMessageItem';
import ChatInput from './ChatInput';
import { getAvatarFullUrl } from './chatUtils';
import { toast } from 'react-toastify';

export default function ChatWindow({
  conversation,
  messages = [],
  isLoadingMessages,
  currentUserId,
  userRole,
  isOtherOnline,
  typingUsers = [],
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onToggleReaction,
  onToggleFavourite,
  onToggleMute,
  onOpenMembersModal,
  onOpenAddMemberModal,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showInviteBanner, setShowInviteBanner] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, typingUsers.length]);

  if (!conversation) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
          color: '#8A8886',
          p: 3,
        }}
      >
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#F3F2F1', color: '#5B5FC7', mb: 2 }}>
          <GroupIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#242424', mb: 0.5 }}>
          Microsoft Teams Chat
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#616161', textAlign: 'center', maxWidth: 360 }}>
          Select an employee or group from the left to start messaging in real time.
        </Typography>
      </Box>
    );
  }

  const isDirect = conversation.type === 'direct';
  const isGroup = conversation.type === 'group';
  const isSupport = conversation.type === 'admin_support';
  const otherUser = conversation.other_user;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Conversation link copied to clipboard!');
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Top Chat Header (Matching Teams Screenshot)                    */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1.5, md: 2.5 },
          py: 1.2,
          borderBottom: '1px solid #EDEBE9',
          bgcolor: '#FFFFFF',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          {/* Mobile Back Button */}
          {onBack && (
            <IconButton onClick={onBack} size="small" sx={{ display: { xs: 'flex', md: 'none' } }}>
              <BackIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          {/* Conversation Avatar */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            {isDirect && otherUser ? (
              <Avatar
                src={getAvatarFullUrl(otherUser.profile_photo)}
                sx={{ width: 36, height: 36, bgcolor: '#EDEBE9', color: '#5B5FC7', fontWeight: 700 }}
              >
                {otherUser.first_name?.[0] || 'U'}
              </Avatar>
            ) : isSupport ? (
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#F0F9FF', color: '#0284C7' }}>
                <SupportIcon sx={{ fontSize: 20 }} />
              </Avatar>
            ) : (
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#F5F5F5', color: '#5B5FC7' }}>
                <GroupIcon sx={{ fontSize: 20 }} />
              </Avatar>
            )}
          </Box>

          {/* Title & Subtitle */}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#242424',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {conversation.title}
              </Typography>
              {isGroup && conversation.my_role === 'admin' && (
                <Tooltip title="Edit group">
                  <IconButton size="small" onClick={onOpenMembersModal} sx={{ p: 0.2 }}>
                    <EditIcon sx={{ fontSize: 14, color: '#707070' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Typography sx={{ fontSize: '11.5px', color: '#707070' }}>
              {isDirect
                ? isOtherOnline
                  ? 'Active now'
                  : 'Offline'
                : `${conversation.participant_count || conversation.members?.length || 0} members`}
            </Typography>
          </Box>
        </Stack>

        {/* Action Controls on Right */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Meet Now Button */}
          <Button
            size="small"
            startIcon={<MeetIcon sx={{ fontSize: 17 }} />}
            sx={{
              color: '#242424',
              borderColor: '#E1DFDD',
              borderWidth: '1px',
              borderStyle: 'solid',
              textTransform: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '6px',
              py: 0.5,
              px: 1.2,
              '&:hover': { bgcolor: '#F3F2F1' },
            }}
            onClick={() => toast.info('Video calling integration is ready for deployment.')}
          >
            Meet now
          </Button>

          {/* Group Member Count Icon */}
          {isGroup && (
            <Tooltip title="View members">
              <Button
                size="small"
                onClick={onOpenMembersModal}
                startIcon={<PeopleIcon sx={{ fontSize: 17 }} />}
                sx={{
                  color: '#424242',
                  fontSize: '12px',
                  fontWeight: 600,
                  minWidth: 'auto',
                  py: 0.5,
                  px: 1,
                  '&:hover': { bgcolor: '#F3F2F1' },
                }}
              >
                {conversation.participant_count || conversation.members?.length || 0}
              </Button>
            </Tooltip>
          )}

          {/* More Menu */}
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#424242' }}>
            <MoreIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* More Options Dropdown */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            onToggleFavourite();
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>{conversation.is_favourite ? <StarFilledIcon sx={{ color: '#F59E0B' }} /> : <StarIcon />}</ListItemIcon>
          <ListItemText>{conversation.is_favourite ? 'Remove from Favourites' : 'Add to Favourites'}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onToggleMute();
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>{conversation.is_muted ? <UnmuteIcon /> : <MuteIcon />}</ListItemIcon>
          <ListItemText>{conversation.is_muted ? 'Unmute Chat' : 'Mute Notifications'}</ListItemText>
        </MenuItem>

        {isGroup && (
          <MenuItem
            onClick={() => {
              onOpenMembersModal();
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText>Manage Group Members</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* ------------------------------------------------------------- */}
      {/* Sub-Banner: "Invite others to chat" (From User Screenshot)    */}
      {/* ------------------------------------------------------------- */}
      {showInviteBanner && isGroup && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 0.8,
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #EDEBE9',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LinkIcon sx={{ fontSize: 16, color: '#64748B' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              Invite others to chat
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              onClick={handleCopyLink}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                textTransform: 'none',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.3,
                px: 1,
                borderRadius: '4px',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              Share link
            </Button>
            <IconButton size="small" onClick={() => setShowInviteBanner(false)} sx={{ p: 0.4 }}>
              <CloseIcon sx={{ fontSize: 14, color: '#64748B' }} />
            </IconButton>
          </Stack>
        </Box>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Message History Feed                                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
        }}
      >
        {isLoadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress size={28} sx={{ color: '#5B5FC7' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: '#8A8886' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
              No messages yet in this conversation.
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#A19F9D' }}>
              Say hello to start communicating!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              userRole={userRole}
              onReply={(m) => setReplyingTo(m)}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onToggleReaction={onToggleReaction}
            />
          ))
        )}

        {/* Live Typing Indicator */}
        {typingUsers.length > 0 && (
          <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '12px', color: '#616161', fontStyle: 'italic' }}>
              {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Bottom Input Area                                             */}
      {/* ------------------------------------------------------------- */}
      <ChatInput
        onSendMessage={onSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </Box>
  );
}
