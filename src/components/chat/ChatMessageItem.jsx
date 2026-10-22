/**
 * ===========================================
 *  Teams-Style Chat Message Item Component
 * ===========================================
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  CheckCircleOutlineRounded as ReadIcon,
  Check as SentIcon,
  Reply as ReplyIcon,
  EditOutlined as EditIcon,
  DeleteOutlineRounded as DeleteIcon,
  InsertDriveFileOutlined as FileIcon,
  DownloadOutlined as DownloadIcon,
} from '@mui/icons-material';
import { formatMessageTime, getAvatarFullUrl, formatFileSize } from './chatUtils';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function ChatMessageItem({
  message,
  currentUserId,
  userRole,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [previewImage, setPreviewImage] = useState(null);

  const isSelf = Number(message.sender_id) === Number(currentUserId);
  const isSystem = message.message_type === 'system';
  const sender = message.sender || {};
  const senderName = `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || 'Employee';

  if (isSystem) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
        <Chip
          label={message.content}
          size="small"
          sx={{
            bgcolor: '#F3F2F1',
            color: '#616161',
            fontSize: '11px',
            height: 22,
            fontWeight: 500,
          }}
        />
      </Box>
    );
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: isSelf ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1.2,
        my: 1.2,
        position: 'relative',
        px: { xs: 1, md: 2 },
      }}
    >
      {/* Sender Avatar for other users */}
      {!isSelf && (
        <Avatar
          src={getAvatarFullUrl(sender.profile_photo)}
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#EDEBE9',
            color: '#5B5FC7',
            fontSize: '12px',
            fontWeight: 700,
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          {sender.first_name?.[0] || 'U'}
        </Avatar>
      )}

      {/* Message Bubble Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isSelf ? 'flex-end' : 'flex-start',
          maxWidth: { xs: '85%', sm: '75%', md: '65%' },
        }}
      >
        {/* Sender Name (Other users only) */}
        {!isSelf && (
          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', mb: 0.3, ml: 0.5 }}>
            {senderName}
          </Typography>
        )}

        {/* Replied-To Quote Preview */}
        {message.reply_to && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.6,
              mb: 0.3,
              borderRadius: '6px',
              bgcolor: isSelf ? 'rgba(91, 95, 199, 0.15)' : '#EAE8E6',
              borderLeft: isSelf ? '3px solid #5B5FC7' : '3px solid #8A8886',
              fontSize: '11px',
              color: '#424242',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>
              {message.reply_to.sender?.first_name || 'Someone'}:
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#616161', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {message.reply_to.content}
            </Typography>
          </Box>
        )}

        {/* Main Bubble */}
        <Box
          sx={{
            position: 'relative',
            px: 2,
            py: 1.2,
            borderRadius: isSelf ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            bgcolor: isSelf ? '#5B5FC7' : '#F1F2F4',
            color: isSelf ? '#FFFFFF' : '#242424',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            wordBreak: 'break-word',
          }}
        >
          {isEditing ? (
            <Box sx={{ minWidth: 220 }}>
              <TextField
                fullWidth
                multiline
                size="small"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '4px',
                  mb: 1,
                  '& .MuiInputBase-input': { fontSize: '13px', color: '#242424' },
                }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" onClick={() => setIsEditing(false)} sx={{ color: isSelf ? '#FFFFFF' : '#616161', fontSize: '11px' }}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" onClick={handleSaveEdit} sx={{ bgcolor: isSelf ? '#FFFFFF' : '#5B5FC7', color: isSelf ? '#5B5FC7' : '#FFFFFF', fontSize: '11px' }}>
                  Save
                </Button>
              </Stack>
            </Box>
          ) : (
            <>
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <Stack spacing={1} sx={{ mb: message.content ? 1 : 0 }}>
                  {message.attachments.map((att) => {
                    const isImg = att.file_type.startsWith('image/');
                    const fullUrl = getAvatarFullUrl(att.file_path);

                    if (isImg) {
                      return (
                        <Box
                          key={att.id}
                          onClick={() => setPreviewImage(fullUrl)}
                          sx={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            maxHeight: 240,
                            maxWidth: 320,
                            bgcolor: '#EDEBE9',
                          }}
                        >
                          <img
                            src={fullUrl}
                            alt={att.file_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </Box>
                      );
                    }

                    return (
                      <Box
                        key={att.id}
                        component="a"
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                          p: 1,
                          borderRadius: '8px',
                          bgcolor: isSelf ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
                          color: 'inherit',
                          textDecoration: 'none',
                          border: isSelf ? '1px solid rgba(255,255,255,0.25)' : '1px solid #E1DFDD',
                          '&:hover': { opacity: 0.9 },
                        }}
                      >
                        <FileIcon sx={{ fontSize: 24, color: isSelf ? '#FFFFFF' : '#5B5FC7' }} />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {att.file_name}
                          </Typography>
                          <Typography sx={{ fontSize: '10.5px', opacity: 0.75 }}>
                            {formatFileSize(att.file_size)}
                          </Typography>
                        </Box>
                        <DownloadIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {/* Message Text */}
              {message.content && (
                <Typography
                  sx={{
                    fontSize: '13.5px',
                    lineHeight: 1.45,
                    fontStyle: message.is_deleted ? 'italic' : 'normal',
                    opacity: message.is_deleted ? 0.75 : 1,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </Typography>
              )}
            </>
          )}

          {/* Footer Time & Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSelf ? 'flex-end' : 'flex-start',
              gap: 0.6,
              mt: 0.4,
              fontSize: '10.5px',
              opacity: 0.75,
            }}
          >
            <span>{formatMessageTime(message.created_at)}</span>
            {message.is_edited && <span>(edited)</span>}
            {isSelf && (
              <Tooltip title="Sent">
                <ReadIcon sx={{ fontSize: 13, color: '#FFFFFF' }} />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Reaction Pill Badges */}
        {message.reaction_groups && message.reaction_groups.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {message.reaction_groups.map((rg) => {
              const hasReacted = rg.users?.some((u) => u.id === currentUserId);
              return (
                <Tooltip
                  key={rg.emoji}
                  title={rg.users?.map((u) => u.name).join(', ') || 'Reactions'}
                >
                  <Chip
                    onClick={() => onToggleReaction(message.id, rg.emoji)}
                    size="small"
                    label={`${rg.emoji} ${rg.count}`}
                    sx={{
                      height: 22,
                      fontSize: '11px',
                      cursor: 'pointer',
                      bgcolor: hasReacted ? '#EEF2FF' : '#F3F2F1',
                      border: hasReacted ? '1px solid #5B5FC7' : '1px solid transparent',
                      color: hasReacted ? '#5B5FC7' : '#424242',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#E0E7FF' },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Floating Hover Action Bar */}
      {isHovered && !isEditing && !message.is_deleted && (
        <Box
          sx={{
            position: 'absolute',
            top: -14,
            [isSelf ? 'left' : 'right']: { xs: 8, md: 24 },
            display: 'flex',
            alignItems: 'center',
            gap: 0.3,
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid #EDEBE9',
            px: 0.8,
            py: 0.3,
            zIndex: 10,
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => onToggleReaction(message.id, emoji)}
              sx={{ width: 26, height: 26, fontSize: '13px', '&:hover': { bgcolor: '#F3F2F1' } }}
            >
              {emoji}
            </IconButton>
          ))}

          <Tooltip title="Reply">
            <IconButton
              size="small"
              onClick={() => onReply(message)}
              sx={{ width: 26, height: 26, color: '#424242' }}
            >
              <ReplyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {isSelf && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ width: 26, height: 26, color: '#424242' }}
              >
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}

          {(isSelf || userRole === 'admin') && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(message.id)}
                sx={{ width: 26, height: 26, color: '#DC2626' }}
              >
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Image Zoom Preview Modal */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
        <Box sx={{ p: 1, bgcolor: '#000000', display: 'flex', justifyContent: 'center' }}>
          <img src={previewImage || ''} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
        </Box>
      </Dialog>
    </Box>
  );
}
