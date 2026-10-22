/**
 * ===========================================
 *  Staff Chat Input Dock Component
 * ===========================================
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Tooltip,
  Popover,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  SendRounded as SendIcon,
  SentimentSatisfiedAltOutlined as EmojiIcon,
  AttachFileOutlined as AttachIcon,
  ImageOutlined as ImageIcon,
  CloseRounded as CloseIcon,
  InsertDriveFileOutlined as FileIcon,
} from '@mui/icons-material';
import { useUploadChatAttachment } from '../../Api/Api';
import { toast } from 'react-toastify';

const EMOJI_PALETTE = [
  '👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏',
  '🙌', '🚀', '💯', '✨', '🤝', '✅', '🙏', '☕',
  '💡', '💪', '🎯', '⭐', '👀', '😎', '🥳', '👋'
];

export default function ChatInput({
  onSendMessage,
  replyingTo,
  onCancelReply,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { mutate: uploadAttachment, isPending: isUploading } = useUploadChatAttachment(
    (saved) => {
      setAttachments((prev) => [...prev, saved]);
      toast.success(`Attached "${saved.file_name}"`);
    },
    (err) => {
      toast.error(err?.response?.data?.message || 'Failed to upload attachment.');
    }
  );

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (onTypingStart) onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) onTypingStop();
    }, 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || disabled || isUploading) {
      return;
    }

    const hasOnlyImages =
      attachments.length > 0 &&
      attachments.every(
        (a) =>
          (a.file_type && a.file_type.startsWith('image/')) ||
          /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(a.file_name || '')
      );
    const messageType = hasOnlyImages ? 'image' : attachments.length > 0 ? 'file' : 'text';

    onSendMessage({
      content: trimmed || (attachments.length > 0 ? attachments[0].file_name : ''),
      message_type: messageType,
      attachments: attachments.length > 0 ? attachments : undefined,
      reply_to_id: replyingTo?.id || null,
    });

    setText('');
    setAttachments([]);
    if (onCancelReply) onCancelReply();
    if (onTypingStop) onTypingStop();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size cannot exceed 50MB.');
      e.target.value = '';
      return;
    }

    // Pass the File object directly to uploadAttachment
    uploadAttachment(file);
    e.target.value = '';
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setEmojiAnchor(null);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled && !isUploading;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
      {/* Hidden file inputs - Accept ANY file or image */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="*/*"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*"
      />

      {/* Replying Banner */}
      {replyingTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
            px: 2,
            py: 1,
            mb: 0,
          }}
        >
          <Box sx={{ overflow: 'hidden', mr: 2 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#0369A1' }}>
              Replying to {replyingTo.sender?.first_name || 'Staff'}:
            </Typography>
            <Typography noWrap sx={{ fontSize: '12px', color: '#334155' }}>
              {replyingTo.content}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCancelReply} sx={{ color: '#64748B' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Main Input Dock Card */}
      <Box
        sx={{
          borderRadius: replyingTo ? '0 0 14px 14px' : '14px',
          border: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
          transition: 'all 0.15s ease',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          '&:focus-within': {
            borderColor: '#0284C7',
            bgcolor: '#FFFFFF',
            boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.12)',
          },
        }}
      >
        {/* Pending Uploads Bar */}
        {(attachments.length > 0 || isUploading) && (
          <Box sx={{ p: 1, px: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid #E2E8F0' }}>
            {attachments.map((att, idx) => {
              const isImg =
                (att.file_type && att.file_type.startsWith('image/')) ||
                /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(att.file_name || '');
              return (
                <Chip
                  key={idx}
                  icon={isImg ? <ImageIcon sx={{ fontSize: 16 }} /> : <FileIcon sx={{ fontSize: 16 }} />}
                  label={att.file_name}
                  size="small"
                  onDelete={() => handleRemoveAttachment(idx)}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#0F172A',
                  }}
                />
              );
            })}
            {isUploading && (
              <Chip
                icon={<CircularProgress size={14} sx={{ color: '#0284C7' }} />}
                label="Uploading..."
                size="small"
                sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontSize: '11.5px', fontWeight: 600 }}
              />
            )}
          </Box>
        )}

        {/* Text Input Base */}
        <Box sx={{ px: 2, pt: 1.2, pb: 0.5 }}>
          <InputBase
            fullWidth
            multiline
            minRows={1}
            maxRows={5}
            placeholder={disabled ? 'You cannot reply to this conversation' : 'Type a message... (Shift + Enter for new line)'}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            sx={{
              fontSize: '14px',
              color: '#0F172A',
              '& ::placeholder': { color: '#94A3B8', opacity: 1 },
            }}
          />
        </Box>

        {/* Bottom Actions Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.6,
          }}
        >
          {/* Left Media Actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Attach Any File or Document">
              <span>
                <IconButton
                  size="small"
                  disabled={disabled || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: '#64748B', '&:hover': { color: '#0284C7', bgcolor: '#F0F9FF' } }}
                >
                  <AttachIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Attach Photo or Image">
              <span>
                <IconButton
                  size="small"
                  disabled={disabled || isUploading}
                  onClick={() => imageInputRef.current?.click()}
                  sx={{ color: '#64748B', '&:hover': { color: '#0284C7', bgcolor: '#F0F9FF' } }}
                >
                  <ImageIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Add Emoji">
              <span>
                <IconButton
                  size="small"
                  disabled={disabled}
                  onClick={(e) => setEmojiAnchor(e.currentTarget)}
                  sx={{ color: '#64748B', '&:hover': { color: '#0284C7', bgcolor: '#F0F9FF' } }}
                >
                  <EmojiIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Right Send Action */}
          <Tooltip title={canSend ? 'Send message (Enter)' : 'Enter message or attachment to send'}>
            <span>
              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!canSend}
                sx={{
                  bgcolor: canSend ? '#0284C7' : '#E2E8F0',
                  color: canSend ? '#FFFFFF' : '#94A3B8',
                  width: 34,
                  height: 34,
                  boxShadow: canSend ? '0 2px 6px rgba(2, 132, 199, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: canSend ? '#0369A1' : '#E2E8F0',
                  },
                }}
              >
                <SendIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 1.5,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
            border: '1px solid #E2E8F0',
            maxWidth: 280,
          },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
          {EMOJI_PALETTE.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleAddEmoji(emoji)}
              sx={{
                width: 36,
                height: 36,
                fontSize: '18px',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#F1F5F9', transform: 'scale(1.15)' },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}
