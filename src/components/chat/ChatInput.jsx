/**
 * ===========================================
 *  Teams-Style Chat Input Component
 * ===========================================
 */

import React, { useState, useRef, useEffect } from 'react';
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

    onSendMessage({
      content: trimmed || (attachments.length > 0 ? attachments[0].file_name : ''),
      attachments: attachments.length > 0 ? attachments : undefined,
      reply_to_id: replyingTo?.id || null,
    });

    setText('');
    setAttachments([]);
    if (onCancelReply) onCancelReply();
    if (onTypingStop) onTypingStop();
  };

  const handleFileSelect = (e, type = 'any') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10MB.');
      return;
    }

    uploadAttachment(file);
    e.target.value = '';
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setEmojiAnchor(null);
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #EDEBE9' }}>
      {/* Replying-To Banner */}
      {replyingTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.8,
            mb: 1,
            borderRadius: '6px',
            bgcolor: '#F3F2F1',
            borderLeft: '3px solid #5B5FC7',
          }}
        >
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#5B5FC7' }}>
              Replying to {replyingTo.sender?.first_name || 'Someone'}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#616161', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyingTo.content}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCancelReply}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
          {attachments.map((att, idx) => (
            <Chip
              key={idx}
              icon={<FileIcon sx={{ fontSize: 16 }} />}
              label={`${att.file_name}`}
              onDelete={() => handleRemoveAttachment(idx)}
              size="small"
              sx={{ bgcolor: '#F3F2F1', color: '#242424', fontSize: '11px', fontWeight: 600 }}
            />
          ))}
        </Stack>
      )}

      {/* Main Input Box (Teams Style Container) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #E1DFDD',
          borderRadius: '8px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'border-color 0.15s ease',
          '&:focus-within': {
            borderColor: '#5B5FC7',
            boxShadow: '0 0 0 2px rgba(91, 95, 199, 0.2)',
          },
        }}
      >
        <InputBase
          fullWidth
          multiline
          minRows={1}
          maxRows={6}
          placeholder="Type a message"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isUploading}
          sx={{
            px: 2,
            pt: 1.2,
            pb: 0.8,
            fontSize: '13.5px',
            color: '#242424',
          }}
        />

        {/* Action Bar Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: 1,
            py: 0.6,
            gap: 0.5,
          }}
        >
          {isUploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 1 }}>
              <CircularProgress size={16} sx={{ color: '#5B5FC7' }} />
              <Typography sx={{ fontSize: '11px', color: '#616161' }}>Uploading...</Typography>
            </Box>
          )}

          {/* Emoji Picker Button */}
          <Tooltip title="Add emoji">
            <IconButton
              size="small"
              onClick={(e) => setEmojiAnchor(e.currentTarget)}
              sx={{ color: '#616161', '&:hover': { color: '#5B5FC7' } }}
            >
              <EmojiIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Attachment Button */}
          <Tooltip title="Attach file">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: '#616161', '&:hover': { color: '#5B5FC7' } }}
            >
              <AttachIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Image Upload Button */}
          <Tooltip title="Upload image">
            <IconButton
              size="small"
              onClick={() => imageInputRef.current?.click()}
              sx={{ color: '#616161', '&:hover': { color: '#5B5FC7' } }}
            >
              <ImageIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e, 'any')}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'image')}
            style={{ display: 'none' }}
          />

          {/* Send Button */}
          <IconButton
            size="small"
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || disabled || isUploading}
            sx={{
              ml: 0.5,
              bgcolor: (text.trim() || attachments.length > 0) && !disabled && !isUploading ? '#5B5FC7' : '#EDEBE9',
              color: (text.trim() || attachments.length > 0) && !disabled && !isUploading ? '#FFFFFF' : '#A19F9D',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: (text.trim() || attachments.length > 0) ? '#4F52B2' : '#EDEBE9',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Emoji Palette Popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1.5,
            width: 260,
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#8A8886', mb: 1, textTransform: 'uppercase' }}>
          Quick Reactions & Emojis
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.8 }}>
          {EMOJI_PALETTE.map((emoji) => (
            <IconButton
              key={emoji}
              onClick={() => handleAddEmoji(emoji)}
              size="small"
              sx={{ fontSize: '18px', width: 34, height: 34, '&:hover': { bgcolor: '#F3F2F1' } }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}
