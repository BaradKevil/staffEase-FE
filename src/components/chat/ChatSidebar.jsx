/**
 * ===========================================
 *  Staff Chat Navigation & Conversations Rail
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
  Stack,
  Tooltip,
  Collapse,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  AddRounded as AddIcon,
  CloseRounded as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NotificationsOffOutlined as MutedIcon,
  GroupsOutlined as GroupIcon,
  SupportAgentOutlined as SupportIcon,
  StarRounded as StarIcon,
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
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'direct' | 'groups' | 'support'
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
        const memberMatch = c.members?.some(
          (m) =>
            m.user &&
            `${m.user.first_name} ${m.user.last_name}`.toLowerCase().includes(q)
        );
        if (!titleMatch && !snippetMatch && !memberMatch) return false;
      }

      // Filter pills
      if (filter === 'unread' && (c.unread_count || 0) === 0) return false;
      if (filter === 'direct' && c.type !== 'direct') return false;
      if (filter === 'groups' && c.type !== 'group') return false;
      if (filter === 'support' && c.type !== 'admin_support') return false;

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
          bottom: -1,
          right: -1,
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: online ? '#10B981' : '#CBD5E1',
          border: '2px solid #FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      />
    );
  };

  const renderConversationItem = (conv) => {
    const isSelected = activeConversationId === conv.id;
    const isDirect = conv.type === 'direct';
    const isSupport = conv.type === 'admin_support';
    const otherUser = conv.other_user;

    const hasUnread = (conv.unread_count || 0) > 0;

    return (
      <Box
        key={conv.id}
        onClick={() => onSelectConversation(conv.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.4,
          px: 1.5,
          py: 1.2,
          mx: 1,
          mb: 0.5,
          borderRadius: '12px',
          cursor: 'pointer',
          bgcolor: isSelected ? '#F0F9FF' : 'transparent',
          border: isSelected ? '1px solid #BAE6FD' : '1px solid transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isSelected ? '#F0F9FF' : '#F8FAFC',
          },
        }}
      >
        {/* Avatar with Presence */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          {isDirect && otherUser ? (
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
              {renderPresenceBadge(otherUser)}
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

        {/* Content Details */}
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '13.5px',
                fontWeight: hasUnread || isSelected ? 700 : 600,
                color: isSelected ? '#0369A1' : '#0F172A',
              }}
            >
              {conv.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '11px',
                color: hasUnread ? '#0284C7' : '#94A3B8',
                fontWeight: hasUnread ? 700 : 500,
                flexShrink: 0,
                ml: 1,
              }}
            >
              {formatChatTimestamp(conv.last_message_at || conv.lastMessageAt || conv.updatedAt || conv.updated_at)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              noWrap
              sx={{
                fontSize: '12px',
                color: hasUnread ? '#1E293B' : '#64748B',
                fontWeight: hasUnread ? 600 : 400,
                pr: 1,
              }}
            >
              {conv.last_message_snippet || (
                <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Start a conversation</span>
              )}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
              {conv.is_muted && <MutedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />}
              {hasUnread && (
                <Box
                  sx={{
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    px: 0.8,
                    py: 0.1,
                    fontSize: '10.5px',
                    fontWeight: 700,
                    minWidth: 18,
                    textAlign: 'center',
                    boxShadow: '0 2px 5px rgba(2, 132, 199, 0.35)',
                  }}
                >
                  {conv.unread_count}
                </Box>
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
        width: { xs: '100%', md: 320, lg: 350 },
        height: '100%',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Top Header Rail */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ p: 2, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px' }}>
              Staff Chat
            </Typography>
            <Chip
              label={conversations.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '11px',
                fontWeight: 700,
                bgcolor: '#F1F5F9',
                color: '#475569',
              }}
            />
          </Stack>

          {/* New Message Action Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={onOpenNewChatModal}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '12px',
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              px: 1.4,
              py: 0.6,
              '&:hover': { bgcolor: '#0369A1' },
            }}
          >
            New Chat
          </Button>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations or staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#F8FAFC',
              borderRadius: '10px',
              fontSize: '13px',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#0284C7' },
            },
          }}
        />

        {/* Filter Chips */}
        <Stack
          direction="row"
          spacing={0.8}
          sx={{
            mt: 1.5,
            overflowX: 'auto',
            pb: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'direct', label: 'Direct' },
            { key: 'groups', label: 'Groups' },
            { key: 'support', label: 'HR Support' },
            { key: 'unread', label: 'Unread' },
          ].map((item) => {
            const isSelected = filter === item.key;
            return (
              <Chip
                key={item.key}
                label={item.label}
                size="small"
                clickable
                onClick={() => setFilter(item.key)}
                sx={{
                  fontSize: '11.5px',
                  fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected ? '#0284C7' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? '1px solid #0284C7' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: isSelected ? '#0369A1' : '#E2E8F0',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Scrollable Conversation List */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
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
                py: 0.6,
                cursor: 'pointer',
                '&:hover': { color: '#0284C7' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.6}>
                <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                  FAVOURITES ({favourites.length})
                </Typography>
              </Stack>
              {favouritesExpanded ? (
                <ExpandLessIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
              )}
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
              py: 0.6,
              cursor: 'pointer',
              '&:hover': { color: '#0284C7' },
            }}
          >
            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
              RECENT CONVERSATIONS ({regularChats.length})
            </Typography>
            {chatsExpanded ? (
              <ExpandLessIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
            )}
          </Box>
          <Collapse in={chatsExpanded}>
            {regularChats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                  {search ? 'No matching conversations' : 'No chats yet. Start one!'}
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
