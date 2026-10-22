/**
 * ===========================================
 *  Staff Chat Window Component
 * ===========================================
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Chip,
  TextField,
  InputAdornment,
  Dialog,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PeopleAltOutlined as PeopleIcon,
  MoreHorizRounded as MoreIcon,
  StarBorderRounded as StarIcon,
  StarRounded as StarFilledIcon,
  NotificationsOffOutlined as MuteIcon,
  NotificationsActiveOutlined as UnmuteIcon,
  ExitToApp as LeaveIcon,
  GroupsOutlined as GroupIcon,
  SupportAgentOutlined as SupportIcon,
  InfoOutlined as InfoIcon,
  Search as SearchIcon,
  CloseRounded as CloseIcon,
  ForumOutlined as ChatPlaceholderIcon,
  LinkOutlined as LinkIcon,
  VideocamRounded as VideoCallIcon,
  PhoneRounded as VoiceCallIcon,
  PersonAddAlt1Outlined as AddPersonIcon,
} from '@mui/icons-material';
import { useCall } from '../../common/CallContext';
import ChatMessageItem from './ChatMessageItem';
import ChatInput from './ChatInput';
import ConversationDetailsPanel from './ConversationDetailsPanel';
import { getAvatarFullUrl, formatDateDivider, isSameDay } from './chatUtils';
import { toast } from 'react-toastify';

export default function ChatWindow({
  conversation,
  messages = [],
  isLoadingMessages = false,
  currentUserId,
  userRole,
  isOtherOnline = false,
  typingUsers = [],
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onToggleReaction,
  onToggleFavourite,
  onToggleMute,
  onOpenMembersModal,
  onLeaveGroup,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { startCall } = useCall();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, typingUsers.length]);



  const handleStartCall = (type) => {
    if (!conversation) return;
    startCall({
      conversationId: conversation.id,
      targetUserId: conversation.other_user?.id,
      isGroup: conversation.type === 'group',
      callType: type,
      title: conversation.title,
    });
  };

  const handleAddPeople = () => {
    if (conversation?.type === 'group') {
      if (onOpenMembersModal) onOpenMembersModal();
    } else {
      toast.info('To create a multi-person conversation, click "+ New Chat" in the sidebar and select multiple team members.');
    }
  };

  // Filter messages if search active
  const displayedMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content?.toLowerCase().includes(q) ||
        m.sender?.first_name?.toLowerCase().includes(q) ||
        m.sender?.last_name?.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

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
          color: '#64748B',
          p: 3,
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            mb: 2,
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)',
          }}
        >
          <ChatPlaceholderIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
          Staff Chat
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#64748B', textAlign: 'center', maxWidth: 360 }}>
          Select a colleague or group from the left to start collaborating in real time.
        </Typography>
      </Box>
    );
  }

  const isDirect = conversation.type === 'direct';
  const isGroup = conversation.type === 'group';
  const isSupport = conversation.type === 'admin_support';
  const otherUser = conversation.other_user || {};

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Main Conversation Column */}
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* ------------------------------------------------------------- */}
        {/* Top Header Bar                                                */}
        {/* ------------------------------------------------------------- */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1.5, md: 2.5 },
            py: 1.2,
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            {/* Mobile Back Button */}
            {onBack && (
              <IconButton onClick={onBack} size="small" sx={{ mr: -0.5, color: '#0F172A' }}>
                <BackIcon fontSize="small" />
              </IconButton>
            )}

            {/* Avatar with Presence */}
            <Box sx={{ position: 'relative' }}>
              {isDirect ? (
                <>
                  <Avatar
                    src={getAvatarFullUrl(otherUser.profile_photo)}
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
                    }}
                  >
                    {otherUser.first_name?.[0] || 'U'}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: isOtherOnline ? '#10B981' : '#CBD5E1',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                </>
              ) : isSupport ? (
                <Avatar sx={{ width: 42, height: 42, bgcolor: '#FEF3C7', color: '#D97706' }}>
                  <SupportIcon sx={{ fontSize: 22 }} />
                </Avatar>
              ) : (
                <Avatar sx={{ width: 42, height: 42, bgcolor: '#E0F2FE', color: '#0284C7' }}>
                  <GroupIcon sx={{ fontSize: 22 }} />
                </Avatar>
              )}
            </Box>

            {/* Header Titles */}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                variant="subtitle1"
                sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}
              >
                {conversation.title}
              </Typography>
              <Typography
                noWrap
                variant="caption"
                sx={{
                  color: isDirect && isOtherOnline ? '#10B981' : '#64748B',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {isDirect ? (
                  isOtherOnline ? (
                    '🟢 Active now'
                  ) : (
                    '⚪ Offline'
                  )
                ) : isSupport ? (
                  '🛡️ HR & Admin Support Desk'
                ) : (
                  `${conversation.members?.length || 0} participants`
                )}
                {otherUser.designation && !isGroup && (
                  <span style={{ color: '#94A3B8', fontWeight: 400 }}>
                    • {otherUser.designation}
                  </span>
                )}
              </Typography>
            </Box>
          </Stack>

          {/* ------------------------------------------------------------- */}
          {/* Right Header Action Controls: Matching user toolbar reference */}
          {/* [ Video Call ] [ Voice Call ] [ Add People ] | [ Search ] [ ... ] */}
          {/* ------------------------------------------------------------- */}
          <Stack direction="row" spacing={0.8} alignItems="center">
            {/* 1. Video Call Button */}
            <Tooltip title="Start Video Call">
              <IconButton
                size="small"
                onClick={() => handleStartCall('video')}
                sx={{
                  color: '#5B5FC7',
                  p: 0.8,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F0F0FF', color: '#4F46E5' },
                }}
              >
                <VideoCallIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>

            {/* 2. Audio/Voice Call Button */}
            <Tooltip title="Start Audio Call">
              <IconButton
                size="small"
                onClick={() => handleStartCall('voice')}
                sx={{
                  color: '#5B5FC7',
                  p: 0.8,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F0F0FF', color: '#4F46E5' },
                }}
              >
                <VoiceCallIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* 3. Add People / Participants Button */}
            <Tooltip title={isGroup ? 'Manage Participants' : 'Add People to Chat'}>
              <IconButton
                size="small"
                onClick={handleAddPeople}
                sx={{
                  color: '#475569',
                  p: 0.8,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                }}
              >
                <AddPersonIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>

            {/* 4. Vertical Divider */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ height: 20, my: 'auto', mx: 0.5, borderColor: '#E2E8F0' }}
            />

            {/* 5. Search Button */}
            <Tooltip title={isSearching ? 'Close Search' : 'Search in Conversation'}>
              <IconButton
                size="small"
                onClick={() => {
                  setIsSearching(!isSearching);
                  if (isSearching) setSearchQuery('');
                }}
                sx={{
                  color: isSearching ? '#0284C7' : '#475569',
                  bgcolor: isSearching ? '#F0F9FF' : 'transparent',
                  p: 0.8,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: isSearching ? '#E0F2FE' : '#F1F5F9', color: '#0F172A' },
                }}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* 6. Three-dot More Options Button */}
            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  color: '#475569',
                  p: 0.8,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                }}
              >
                <MoreIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>

            {/* Remaining Options Menu (Opens on 3-dot click) */}
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #E2E8F0',
                  minWidth: 200,
                  py: 0.5,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setDetailsPanelOpen(true);
                }}
                sx={{ fontSize: '13px', py: 0.8 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <InfoIcon fontSize="small" sx={{ color: '#0284C7' }} />
                </ListItemIcon>
                <ListItemText primary={isGroup ? 'Group Information' : 'Staff Profile'} />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  onToggleFavourite();
                }}
                sx={{ fontSize: '13px', py: 0.8 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {conversation.is_favourite ? (
                    <StarFilledIcon fontSize="small" sx={{ color: '#F59E0B' }} />
                  ) : (
                    <StarIcon fontSize="small" sx={{ color: '#64748B' }} />
                  )}
                </ListItemIcon>
                <ListItemText primary={conversation.is_favourite ? 'Unstar Chat' : 'Star as Favourite'} />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  onToggleMute();
                }}
                sx={{ fontSize: '13px', py: 0.8 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {conversation.is_muted ? (
                    <UnmuteIcon fontSize="small" sx={{ color: '#0284C7' }} />
                  ) : (
                    <MuteIcon fontSize="small" sx={{ color: '#64748B' }} />
                  )}
                </ListItemIcon>
                <ListItemText primary={conversation.is_muted ? 'Unmute Notifications' : 'Mute Notifications'} />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Conversation link copied to clipboard!');
                }}
                sx={{ fontSize: '13px', py: 0.8 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <LinkIcon fontSize="small" sx={{ color: '#64748B' }} />
                </ListItemIcon>
                <ListItemText primary="Copy Link" />
              </MenuItem>

              {isGroup && <Divider sx={{ my: 0.5 }} />}

              {isGroup && (
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    onOpenMembersModal();
                  }}
                  sx={{ fontSize: '13px', py: 0.8 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <PeopleIcon fontSize="small" sx={{ color: '#0284C7' }} />
                  </ListItemIcon>
                  <ListItemText primary="Manage Members" />
                </MenuItem>
              )}

              {isGroup && (
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    if (onLeaveGroup) onLeaveGroup();
                  }}
                  sx={{ fontSize: '13px', py: 0.8, color: '#EF4444' }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: '#EF4444' }}>
                    <LeaveIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Leave Group" />
                </MenuItem>
              )}
            </Menu>
          </Stack>
        </Box>

        {/* In-Chat Search Bar (Collapsible) */}
        {isSearching && (
          <Box
            sx={{
              p: 1.2,
              px: 2,
              bgcolor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              autoFocus
              placeholder="Search in this conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '13px',
                },
              }}
            />
            {searchQuery && (
              <Typography sx={{ fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap' }}>
                {displayedMessages.length} results
              </Typography>
            )}
          </Box>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Scrollable Message History Area                               */}
        {/* ------------------------------------------------------------- */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: { xs: 1.5, sm: 2.5 },
            bgcolor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isLoadingMessages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={28} sx={{ color: '#0284C7' }} />
            </Box>
          ) : displayedMessages.length === 0 ? (
            <Box sx={{ m: 'auto', textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: '#F0F9FF',
                  color: '#0284C7',
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <ChatPlaceholderIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                {searchQuery ? 'No matching messages found' : 'No messages yet'}
              </Typography>
              <Typography sx={{ fontSize: '12.5px', color: '#64748B' }}>
                {searchQuery ? 'Try a different keyword' : 'Send a friendly greeting to start the conversation!'}
              </Typography>
            </Box>
          ) : (
            displayedMessages.map((msg, index) => {
              const prevMsg = displayedMessages[index - 1];

              const msgDate = msg.createdAt || msg.created_at;
              const prevMsgDate = prevMsg ? (prevMsg.createdAt || prevMsg.created_at) : null;

              // Check if date divider is needed
              const isFirstOfDay = !prevMsgDate || !isSameDay(prevMsgDate, msgDate);
              const dateLabel = isFirstOfDay && msgDate ? formatDateDivider(msgDate) : null;

              // Check if message is grouped (consecutive messages from same sender within 5 mins on the same day)
              const msgTime = msgDate ? new Date(msgDate).getTime() : 0;
              const prevMsgTime = prevMsgDate ? new Date(prevMsgDate).getTime() : 0;
              const isGrouped =
                !isFirstOfDay &&
                prevMsg &&
                Number(prevMsg.sender_id) === Number(msg.sender_id) &&
                msgTime - prevMsgTime < 5 * 60 * 1000;

              return (
                <React.Fragment key={msg.id}>
                  {/* Date Divider (Only rendered if dateLabel is valid and non-empty) */}
                  {dateLabel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                      <Divider sx={{ flexGrow: 1, borderColor: '#E2E8F0' }} />
                      <Chip
                        label={dateLabel}
                        size="small"
                        sx={{
                          mx: 2,
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#64748B',
                          height: 22,
                        }}
                      />
                      <Divider sx={{ flexGrow: 1, borderColor: '#E2E8F0' }} />
                    </Box>
                  )}

                  <ChatMessageItem
                    message={msg}
                    currentUserId={currentUserId}
                    userRole={userRole}
                    isGrouped={isGrouped}
                    onReply={(item) => setReplyingTo(item)}
                    onEdit={onEditMessage}
                    onDelete={onDeleteMessage}
                    onToggleReaction={onToggleReaction}
                  />
                </React.Fragment>
              );
            })
          )}

          {/* Typing Indicator Bar */}
          {typingUsers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, mt: 'auto' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  px: 1.4,
                  py: 0.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <Box sx={{ width: 6, height: 6, bgcolor: '#0284C7', borderRadius: '50%', animation: 'blink 1.4s infinite' }} />
                <Typography sx={{ fontSize: '11.5px', color: '#64748B', fontStyle: 'italic', ml: 0.5 }}>
                  {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* ------------------------------------------------------------- */}
        {/* Chat Input Dock                                               */}
        {/* ------------------------------------------------------------- */}
        <ChatInput
          onSendMessage={onSendMessage}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Slide-out Details Panel                                       */}
      {/* ------------------------------------------------------------- */}
      <ConversationDetailsPanel
        open={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
        conversation={conversation}
        messages={messages}
        currentUserId={currentUserId}
        userRole={userRole}
        onOpenMembersModal={onOpenMembersModal}
        onLeaveGroup={onLeaveGroup}
      />


    </Box>
  );
}
