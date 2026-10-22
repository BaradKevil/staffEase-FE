/**
 * ===========================================
 *  Staff Chat Message Item Component
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
  TextField,
  Button,
  Dialog,
  Popover,
} from '@mui/material';
import {
  CheckCircleOutlineRounded as ReadIcon,
  Check as SentIcon,
  Reply as ReplyIcon,
  EditOutlined as EditIcon,
  DeleteOutlineRounded as DeleteIcon,
  InsertDriveFileOutlined as FileIcon,
  DownloadOutlined as DownloadIcon,
  SentimentSatisfiedAltOutlined as AddReactionIcon,
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import { formatMessageTime, getAvatarFullUrl, formatFileSize } from './chatUtils';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '👏'];

export default function ChatMessageItem({
  message,
  currentUserId,
  userRole,
  isGrouped = false,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [previewImage, setPreviewImage] = useState(null);
  const [reactionPickerAnchor, setReactionPickerAnchor] = useState(null);

  const isSelf = Number(message.sender_id) === Number(currentUserId);
  const isSystem = message.message_type === 'system';
  const sender = message.sender || {};
  const senderName = `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || 'Staff';

  if (isSystem) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
        <Chip
          label={message.content}
          size="small"
          sx={{
            bgcolor: '#F1F5F9',
            color: '#64748B',
            fontSize: '11.5px',
            height: 24,
            fontWeight: 500,
            border: '1px solid #E2E8F0',
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
        mt: isGrouped ? 0.4 : 1.5,
        mb: 0.4,
        px: { xs: 1, sm: 2 },
      }}
    >
      {/* Sender Avatar for other users (hidden if consecutive grouped message) */}
      {!isSelf && (
        <Box sx={{ width: 34, height: 34, flexShrink: 0 }}>
          {!isGrouped && (
            <Avatar
              src={getAvatarFullUrl(sender.profile_photo)}
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#0284C7',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
              }}
            >
              {sender.first_name?.[0] || 'U'}
            </Avatar>
          )}
        </Box>
      )}

      {/* Message Bubble Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isSelf ? 'flex-end' : 'flex-start',
          maxWidth: { xs: '85%', sm: '72%', md: '62%' },
        }}
      >
        {/* Sender Name (Other users only, hidden if grouped) */}
        {!isSelf && !isGrouped && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4, ml: 0.5 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
              {senderName}
            </Typography>
            {sender.designation && (
              <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                • {sender.designation}
              </Typography>
            )}
          </Box>
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
              mb: 0.5,
              borderRadius: '8px',
              bgcolor: isSelf ? 'rgba(2, 132, 199, 0.12)' : '#F1F5F9',
              borderLeft: isSelf ? '3px solid #0284C7' : '3px solid #94A3B8',
              fontSize: '11px',
              color: '#334155',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isSelf ? '#0284C7' : '#0F172A' }}>
              {message.reply_to.sender?.first_name || 'Staff'}:
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            borderRadius: isSelf
              ? isGrouped
                ? '16px 6px 6px 16px'
                : '18px 18px 4px 18px'
              : isGrouped
              ? '6px 16px 16px 6px'
              : '18px 18px 18px 4px',
            background: isSelf
              ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'
              : '#FFFFFF',
            color: isSelf ? '#FFFFFF' : '#0F172A',
            border: isSelf ? 'none' : '1px solid #E2E8F0',
            boxShadow: isSelf
              ? '0 3px 10px rgba(2, 132, 199, 0.22)'
              : '0 2px 8px rgba(15, 23, 42, 0.04)',
            wordBreak: 'break-word',
          }}
        >
          {/* Floating Hover Action Toolbar: Strictly anchored directly above THIS message bubble */}
          {(isHovered || Boolean(reactionPickerAnchor)) && !isEditing && !message.is_deleted && (
            <Box
              sx={{
                position: 'absolute',
                top: -18,
                [isSelf ? 'right' : 'left']: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                bgcolor: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 4px 18px rgba(15, 23, 42, 0.18)',
                border: '1px solid #E2E8F0',
                px: 0.8,
                py: 0.3,
                zIndex: 10,
                whiteSpace: 'nowrap',
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <IconButton
                  key={emoji}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReaction(message.id, emoji);
                  }}
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: '13px',
                    borderRadius: '6px',
                    transition: 'transform 0.1s ease',
                    '&:hover': { bgcolor: '#F1F5F9', transform: 'scale(1.2)' },
                  }}
                >
                  {emoji}
                </IconButton>
              ))}

              <Tooltip title="Add reaction">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReactionPickerAnchor(e.currentTarget);
                  }}
                  sx={{
                    width: 26,
                    height: 26,
                    color: '#64748B',
                    borderRadius: '6px',
                    '&:hover': { color: '#0284C7', bgcolor: '#F0F9FF' },
                  }}
                >
                  <AddReactionIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Box sx={{ width: '1px', height: 16, bgcolor: '#E2E8F0', mx: 0.3 }} />

              <Tooltip title="Reply">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                  }}
                  sx={{
                    width: 26,
                    height: 26,
                    color: '#64748B',
                    borderRadius: '6px',
                    '&:hover': { color: '#0284C7', bgcolor: '#F0F9FF' },
                  }}
                >
                  <ReplyIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>

              {isSelf && (
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      color: '#64748B',
                      borderRadius: '6px',
                      '&:hover': { color: '#0284C7', bgcolor: '#F0F9FF' },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}

              {(isSelf || userRole === 'admin') && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(message.id);
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      color: '#EF4444',
                      borderRadius: '6px',
                      '&:hover': { bgcolor: '#FEE2E2' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

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
                  borderRadius: '6px',
                  mb: 1,
                  '& .MuiInputBase-input': { fontSize: '13px', color: '#0F172A' },
                }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  onClick={() => setIsEditing(false)}
                  sx={{ color: isSelf ? '#FFFFFF' : '#64748B', fontSize: '11px', textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSaveEdit}
                  sx={{
                    bgcolor: isSelf ? '#FFFFFF' : '#0284C7',
                    color: isSelf ? '#0284C7' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: isSelf ? '#F0F9FF' : '#0369A1' },
                  }}
                >
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
                    const isImg =
                      (att.file_type && att.file_type.startsWith('image/')) ||
                      /\.(jpg|jpeg|png|webp|gif|svg|bmp|ico)$/i.test(att.file_name || att.file_path || '');
                    const fullUrl = getAvatarFullUrl(att.file_path);

                    if (isImg) {
                      return (
                        <Box
                          key={att.id}
                          onClick={() => setPreviewImage(fullUrl)}
                          sx={{
                            borderRadius: '10px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            maxHeight: 260,
                            maxWidth: 340,
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            transition: 'transform 0.15s ease',
                            '&:hover': { transform: 'scale(1.02)' },
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
                        download={att.file_name}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                          p: 1.2,
                          borderRadius: '10px',
                          bgcolor: isSelf ? 'rgba(255,255,255,0.15)' : '#F8FAFC',
                          color: 'inherit',
                          textDecoration: 'none',
                          border: isSelf ? '1px solid rgba(255,255,255,0.25)' : '1px solid #E2E8F0',
                          '&:hover': { bgcolor: isSelf ? 'rgba(255,255,255,0.22)' : '#F1F5F9' },
                        }}
                      >
                        <FileIcon sx={{ fontSize: 26, color: isSelf ? '#FFFFFF' : '#0284C7' }} />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography
                            sx={{
                              fontSize: '12.5px',
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {att.file_name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', opacity: 0.8 }}>
                            {formatFileSize(att.file_size)}
                          </Typography>
                        </Box>
                        <DownloadIcon sx={{ fontSize: 18, opacity: 0.9 }} />
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
                    lineHeight: 1.5,
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
              gap: 0.5,
              mt: 0.4,
              fontSize: '10.5px',
              opacity: isSelf ? 0.85 : 0.65,
            }}
          >
            <span>{formatMessageTime(message.createdAt || message.created_at)}</span>
            {message.is_edited && <span>(edited)</span>}
            {isSelf && (
              message.is_read ? (
                <ReadIcon sx={{ fontSize: 14, color: '#38BDF8' }} />
              ) : (
                <SentIcon sx={{ fontSize: 14 }} />
              )
            )}
          </Box>
        </Box>

        {/* Reaction Pill Badges */}
        {message.reaction_groups && message.reaction_groups.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 0.5, ml: 0.5 }}>
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
                      bgcolor: hasReacted ? '#E0F2FE' : '#FFFFFF',
                      border: hasReacted ? '1px solid #0284C7' : '1px solid #E2E8F0',
                      color: hasReacted ? '#0284C7' : '#475569',
                      fontWeight: 600,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      '&:hover': { bgcolor: '#F0F9FF' },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Reaction Picker Popover using emoji-picker-react */}
      <Popover
        open={Boolean(reactionPickerAnchor)}
        anchorEl={reactionPickerAnchor}
        onClose={() => setReactionPickerAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: isSelf ? 'right' : 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: isSelf ? 'right' : 'left',
        }}
        PaperProps={{
          sx: {
            p: 0,
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          },
        }}
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            onToggleReaction(message.id, emojiData.emoji);
            setReactionPickerAnchor(null);
          }}
          autoFocusSearch={false}
          theme="light"
          lazyLoadEmojis={true}
          searchPlaceHolder="React with emoji..."
          width={320}
          height={380}
        />
      </Popover>

      {/* Image Lightbox Modal */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
        <Box sx={{ p: 1, bgcolor: '#0F172A', display: 'flex', justifyContent: 'center' }}>
          <img src={previewImage || ''} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
        </Box>
      </Dialog>
    </Box>
  );
}
