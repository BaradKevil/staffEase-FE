/**
 * ===========================================
 *  Teams-Style Chat Sidebar Component
 * ===========================================
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Badge,
  Stack,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  DriveFileRenameOutlineOutlined as NewChatIcon,
  VideocamOutlined as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as OnlineIcon,
  Schedule as AwayIcon,
  FiberManualRecord as OfflineIcon,
  NotificationsOffOutlined as MutedIcon,
  GroupsOutlined as GroupIcon,
  SupportAgentOutlined as SupportIcon,
} from '@mui/icons-material';
import { formatChatTimestamp, getAvatarFullUrl } from './chatUtils';

export default function ChatSidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onOpenNewChatModal,
  onlineUserIds = [],
  currentUserId,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'groups' | 'direct'
  const [favouritesExpanded, setFavouritesExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(q);
        const snippetMatch = c.last_message_snippet?.toLowerCase().includes(q);
        if (!titleMatch && !snippetMatch) return false;
      }

      // Filter pills
      if (filter === 'unread' && c.unread_count === 0) return false;
      if (filter === 'groups' && c.type !== 'group') return false;
      if (filter === 'direct' && c.type !== 'direct') return false;

      return true;
    });
  }, [conversations, search, filter]);

  const favourites = useMemo(
    () => filteredConversations.filter((c) => c.is_favourite),
    [filteredConversations]
  );

  const regularChats = useMemo(
    () => filteredConversations.filter((c) => !c.is_favourite),
    [filteredConversations]
  );

  const isUserOnline = (user) => {
    if (!user) return false;
    return onlineUserIds.includes(Number(user.id));
  };

  const renderPresenceBadge = (user) => {
    const online = isUserOnline(user);
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: online ? '#10B981' : '#94A3B8',
          border: '2px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {online && <Box sx={{ width: 4, height: 4, bgcolor: '#FFFFFF', borderRadius: '50%' }} />}
      </Box>
    );
  };

  const renderConversationItem = (conv) => {
    const isSelected = activeConversationId === conv.id;
    const isDirect = conv.type === 'direct';
    const isSupport = conv.type === 'admin_support';
    const otherUser = conv.other_user;

    return (
      <Box
        key={conv.id}
        onClick={() => onSelectConversation(conv.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1.1,
          mx: 1,
          mb: 0.4,
          borderRadius: '8px',
          cursor: 'pointer',
          bgcolor: isSelected ? '#FFFFFF' : 'transparent',
          boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
          borderLeft: isSelected ? '3px solid #5B5FC7' : '3px solid transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isSelected ? '#FFFFFF' : '#F3F2F1',
          },
        }}
      >
        {/* Avatar with Presence */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          {isDirect && otherUser ? (
            <>
              <Avatar
                src={getAvatarFullUrl(otherUser.profile_photo)}
                sx={{ width: 38, height: 38, bgcolor: '#EDEBE9', color: '#5B5FC7', fontSize: '13px', fontWeight: 700 }}
              >
                {otherUser.first_name?.[0] || 'U'}
              </Avatar>
              {renderPresenceBadge(otherUser)}
            </>
          ) : isSupport ? (
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#F0F9FF', color: '#0284C7' }}>
              <SupportIcon sx={{ fontSize: 20 }} />
            </Avatar>
          ) : (
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#F5F5F5', color: '#5B5FC7' }}>
              <GroupIcon sx={{ fontSize: 20 }} />
            </Avatar>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
            <Typography
              sx={{
                fontSize: '13.5px',
                fontWeight: conv.unread_count > 0 ? 700 : isSelected ? 600 : 500,
                color: '#242424',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {conv.title}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: conv.unread_count > 0 ? '#5B5FC7' : '#707070', fontWeight: conv.unread_count > 0 ? 700 : 400, flexShrink: 0, ml: 1 }}>
              {formatChatTimestamp(conv.last_message_at)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: conv.unread_count > 0 ? '#242424' : '#616161',
                fontWeight: conv.unread_count > 0 ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '180px',
              }}
            >
              {conv.last_message_snippet || 'No messages yet'}
            </Typography>

            <Stack direction="row" spacing={0.6} alignItems="center">
              {conv.is_muted && <MutedIcon sx={{ fontSize: 14, color: '#8A8886' }} />}
              {conv.unread_count > 0 && (
                <Chip
                  label={conv.unread_count}
                  size="small"
                  sx={{
                    height: 18,
                    minWidth: 18,
                    fontSize: '10.5px',
                    fontWeight: 700,
                    bgcolor: '#5B5FC7',
                    color: '#FFFFFF',
                    '& .MuiChip-label': { px: 0.6 },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 340 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F9F9F9',
        borderRight: '1px solid #EDEBE9',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#242424', letterSpacing: '-0.01em' }}>
          Chat
        </Typography>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Filter & Search">
            <IconButton size="small" sx={{ color: '#424242' }}>
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Start video call / meet">
            <IconButton size="small" sx={{ color: '#424242' }}>
              <VideoIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="New chat">
            <IconButton
              size="small"
              onClick={onOpenNewChatModal}
              sx={{
                bgcolor: '#5B5FC7',
                color: '#FFFFFF',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: '#4F52B2' },
              }}
            >
              <NewChatIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Filter Tabs / Pills */}
      <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: 0.8, overflowX: 'auto' }}>
        <Chip
          label="Unread"
          size="small"
          onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
          sx={{
            fontSize: '11.5px',
            fontWeight: filter === 'unread' ? 700 : 500,
            bgcolor: filter === 'unread' ? '#5B5FC7' : '#EDEBE9',
            color: filter === 'unread' ? '#FFFFFF' : '#424242',
            cursor: 'pointer',
            '&:hover': { bgcolor: filter === 'unread' ? '#4F52B2' : '#E1DFDD' },
          }}
        />
        <Chip
          label="Meeting chats"
          size="small"
          onClick={() => setFilter(filter === 'groups' ? 'all' : 'groups')}
          sx={{
            fontSize: '11.5px',
            fontWeight: filter === 'groups' ? 700 : 500,
            bgcolor: filter === 'groups' ? '#5B5FC7' : '#EDEBE9',
            color: filter === 'groups' ? '#FFFFFF' : '#424242',
            cursor: 'pointer',
            '&:hover': { bgcolor: filter === 'groups' ? '#4F52B2' : '#E1DFDD' },
          }}
        />
        <Chip
          label="Direct"
          size="small"
          onClick={() => setFilter(filter === 'direct' ? 'all' : 'direct')}
          sx={{
            fontSize: '11.5px',
            fontWeight: filter === 'direct' ? 700 : 500,
            bgcolor: filter === 'direct' ? '#5B5FC7' : '#EDEBE9',
            color: filter === 'direct' ? '#FFFFFF' : '#424242',
            cursor: 'pointer',
            '&:hover': { bgcolor: filter === 'direct' ? '#4F52B2' : '#E1DFDD' },
          }}
        />
      </Box>

      {/* Search Input Box */}
      <Box sx={{ px: 2, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, group, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#707070' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              bgcolor: '#FFFFFF',
              fontSize: '12.5px',
              height: 34,
              '& fieldset': { borderColor: '#E1DFDD' },
              '&:hover fieldset': { borderColor: '#C8C6C4' },
              '&.Mui-focused fieldset': { borderColor: '#5B5FC7' },
            },
          }}
        />
      </Box>

      {/* Conversation List Container */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
        {/* Favourites Section */}
        {favourites.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Box
              onClick={() => setFavouritesExpanded(!favouritesExpanded)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 0.5,
                cursor: 'pointer',
                color: '#616161',
                '&:hover': { color: '#242424' },
              }}
            >
              <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Favourites ({favourites.length})
              </Typography>
              {favouritesExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
            </Box>
            <Collapse in={favouritesExpanded}>
              {favourites.map(renderConversationItem)}
            </Collapse>
          </Box>
        )}

        {/* Regular Chats Section */}
        <Box>
          <Box
            onClick={() => setChatsExpanded(!chatsExpanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 0.5,
              cursor: 'pointer',
              color: '#616161',
              '&:hover': { color: '#242424' },
            }}
          >
            <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Chats ({regularChats.length})
            </Typography>
            {chatsExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </Box>
          <Collapse in={chatsExpanded}>
            {regularChats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: '#8A8886' }}>
                <Typography sx={{ fontSize: '12px' }}>
                  {search ? 'No matching conversations.' : 'No conversations yet. Start a new chat!'}
                </Typography>
              </Box>
            ) : (
              regularChats.map(renderConversationItem)
            )}
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
}
