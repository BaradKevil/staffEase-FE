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
  Alert
} from '@mui/material';
import { WarningAmberRounded as WarningIcon } from '@mui/icons-material';
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
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706'
          }}
        >
          <WarningIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
          Cancel Leave Request?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
          Are you sure you want to cancel your{' '}
          <strong>
            {leave.leave_type === 'casual_leave' ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}
          </strong>{' '}
          from <strong>{new Date(leave.start_date).toLocaleDateString()}</strong> to{' '}
          <strong>{new Date(leave.end_date).toLocaleDateString()}</strong> ({leave.total_days} days)?
        </Typography>

        {leave.status === 'approved' && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.8125rem' }}>
            Since this leave was already approved, cancelling it will automatically credit{' '}
            <strong>{leave.total_days} days</strong> back to your leave balance.
          </Alert>
        )}

        <TextField
          label="Reason for cancellation (optional)"
          placeholder="e.g., Plans changed, postponed..."
          fullWidth
          multiline
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px'
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
        <Button onClick={handleClose} sx={{ color: '#64748B', fontWeight: 600 }}>
          Keep Leave
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={cancelMutation.isPending}
          sx={{
            borderRadius: '10px',
            px: 2.5,
            fontWeight: 600,
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
