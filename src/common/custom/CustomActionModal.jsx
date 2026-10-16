/**
 * ===========================================
 *  Custom Action Modal Component
 * ===========================================
 *
 * Reusable modal dialog with backdrop blur, customizable iconography,
 * responsive buttons, and loading states.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Fade,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CustomActionModal = ({
  open,
  onClose,
  onConfirm,
  isPending = false,
  maxWidth = '440px',
  icon,
  iconBgColor = '#F0F9FF',
  iconColor = '#0284C7',
  title,
  subtitle,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  pendingText,
  confirmBgColor = '#23A4E8',
  confirmHoverBgColor = '#1B8ECB',
  confirmTextColor = '#FFFFFF',
  isDestructive = false,
}) => {
  const finalConfirmBg = isDestructive ? '#EF4444' : confirmBgColor;
  const finalConfirmHoverBg = isDestructive ? '#DC2626' : confirmHoverBgColor;
  const finalIconBg = isDestructive ? '#FEF2F2' : iconBgColor;
  const finalIconColor = isDestructive ? '#EF4444' : iconColor;

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      TransitionComponent={Fade}
      transitionDuration={200}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          borderTop: isDestructive ? '5px solid #EF4444' : '5px solid #23A4E8',
          padding: '6px',
          maxWidth: maxWidth,
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={isPending}
          sx={{ color: '#94A3B8', '&:hover': { bgcolor: '#F1F5F9' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, pb: 3, px: 3, textAlign: 'center' }}>
        {icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: finalIconBg,
              color: finalIconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', mb: 0.8 }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography sx={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, mb: 2.5 }}>
            {subtitle}
          </Typography>
        )}

        {children && <Box sx={{ my: 2, textAlign: 'left' }}>{children}</Box>}

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3 }}>
          <Button
            fullWidth
            onClick={onClose}
            disabled={isPending}
            variant="outlined"
            sx={{
              borderColor: '#E2E8F0',
              color: '#475569',
              fontWeight: 600,
              borderRadius: '10px',
              py: 1,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            {cancelText}
          </Button>

          <Button
            fullWidth
            onClick={onConfirm}
            disabled={isPending}
            variant="contained"
            sx={{
              bgcolor: finalConfirmBg,
              color: confirmTextColor,
              fontWeight: 600,
              borderRadius: '10px',
              py: 1,
              '&:hover': { bgcolor: finalConfirmHoverBg },
            }}
          >
            {isPending ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>{pendingText || `${confirmText}...`}</span>
              </Box>
            ) : (
              confirmText
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CustomActionModal;
