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
  Alert
} from '@mui/material';
import { CancelOutlined as RejectIcon } from '@mui/icons-material';
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
            bgcolor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444'
          }}
        >
          <RejectIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
            Reject Registration
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Deny employee account activation
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              {employee.work_email}
            </Typography>
          </Box>
        </Box>

        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.8125rem' }}>
          Rejecting will mark the account as rejected and block access to LeaveFlow. The employee will receive an email explanation.
        </Alert>

        <TextField
          label="Reason for Rejection *"
          placeholder="State the reason (e.g. invalid information, redundant invitation)..."
          fullWidth
          required
          multiline
          rows={3}
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
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleReject}
          disabled={rejectMutation.isPending}
          sx={{
            borderRadius: '10px',
            px: 3,
            fontWeight: 600,
            bgcolor: '#EF4444',
            '&:hover': { bgcolor: '#DC2626' }
          }}
        >
          {rejectMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
