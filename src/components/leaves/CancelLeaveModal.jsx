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
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  WarningAmberRounded as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useCancelLeaveRequest } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function CancelLeaveModal({ open, onClose, leave, onSuccess }) {
  const [reason, setReason] = useState('');
  const cancelMutation = useCancelLeaveRequest();

  if (!leave) return null;

  const handleSubmit = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: leave.id,
        reason: reason.trim() || undefined
      });
      toast.success('Leave request cancelled successfully. Any deducted balance has been restored.');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel leave request');
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
          bgcolor: '#FFFFFF'
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
            <WarningIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
              Cancel Leave Request?
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Confirm leave cancellation & balance restoration
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ color: '#475569', fontSize: '13.5px', mb: 2, lineHeight: 1.5 }}>
          Are you sure you want to cancel your{' '}
          <strong>
            {leave.leave_type === 'casual_leave' ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}
          </strong>{' '}
          from <strong>{new Date(leave.start_date).toLocaleDateString()}</strong> to{' '}
          <strong>{new Date(leave.end_date).toLocaleDateString()}</strong> ({leave.total_days} days)?
        </Typography>

        {leave.status === 'approved' && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '12.5px', bgcolor: '#F0F9FF', color: '#0369A1' }}>
            Since this leave was already approved, cancelling it will automatically credit{' '}
            <strong>{leave.total_days} days</strong> back to your leave balance.
          </Alert>
        )}

        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
            Reason for cancellation <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
          </Typography>
          <TextField
            placeholder="e.g., Plans changed, postponed..."
            fullWidth
            multiline
            rows={2}
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

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
        <Button
          onClick={handleClose}
          sx={{
            color: '#64748B',
            fontWeight: 600,
            textTransform: 'none',
            px: 2.5,
            borderRadius: '10px'
          }}
        >
          Keep Leave
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={cancelMutation.isPending}
          sx={{
            borderRadius: '10px',
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: '#EF4444',
            '&:hover': { bgcolor: '#DC2626' }
          }}
        >
          {cancelMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Yes, Cancel Leave'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
