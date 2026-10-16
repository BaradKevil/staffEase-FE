import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  CancelOutlined as RejectIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useRejectRegistration } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function RejectRegistrationModal({ open, onClose, employee, onSuccess }) {
  const [reason, setReason] = useState('');
  const rejectMutation = useRejectRegistration();

  if (!employee) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: employee.id,
        rejection_reason: reason.trim()
      });
      toast.info(`Registration for ${employee.first_name} ${employee.last_name} was rejected.`);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject employee registration');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          borderTop: '5px solid #EF4444',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          width: { xs: 'calc(100% - 32px)', sm: '100%' },
          m: { xs: 2, sm: 'auto' }
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.8,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#FEF2F2',
              color: '#EF4444',
              border: '1px solid #FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RejectIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
              Reject Registration
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Deny employee account activation
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.75,
            bgcolor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            mb: 2.5
          }}
        >
          <Avatar
            src={employee.avatar_url || ''}
            sx={{ width: 44, height: 44, bgcolor: '#94A3B8', fontWeight: 700 }}
          >
            {employee.first_name ? employee.first_name[0] : 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14.5px' }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              {employee.work_email}
            </Typography>
          </Box>
        </Box>

        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '12.5px', bgcolor: '#FEF2F2', color: '#991B1B' }}>
          Rejecting will mark the account as rejected and block access to staffEase. The employee will receive an email explanation.
        </Alert>

        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
            Reason for Rejection <span style={{ color: '#EF4444' }}>*</span>
          </Typography>
          <TextField
            placeholder="State the reason (e.g. invalid information, redundant invitation)..."
            fullWidth
            required
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                p: 1.5,
                '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                '&:hover fieldset': { borderColor: '#23A4E8' },
                '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '13.5px',
                color: '#0F172A',
                '&::placeholder': { color: '#94A3B8', opacity: 1 }
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: '#64748B',
            fontWeight: 600,
            textTransform: 'none',
            px: 2.5,
            borderRadius: '10px',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleReject}
          disabled={rejectMutation.isPending}
          sx={{
            borderRadius: '10px',
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: '#EF4444',
            '&:hover': { bgcolor: '#DC2626' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          {rejectMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
