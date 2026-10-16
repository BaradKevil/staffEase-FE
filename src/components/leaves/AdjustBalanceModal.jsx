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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { TuneRounded as TuneIcon } from '@mui/icons-material';
import { useAdjustLeaveBalance } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function AdjustBalanceModal({ open, onClose, employee, onSuccess }) {
  const [leaveType, setLeaveType] = useState('casual_leave');
  const [adjustmentType, setAdjustmentType] = useState('credit'); // 'credit' | 'debit'
  const [amount, setAmount] = useState('1');
  const [reason, setReason] = useState('');

  const adjustMutation = useAdjustLeaveBalance();

  if (!employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid positive number of days');
      return;
    }

    if (!reason.trim()) {
      toast.error('A mandatory reason is required for balance adjustments');
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        user_id: employee.id,
        leave_type: leaveType,
        adjustment_type: adjustmentType,
        amount: parsedAmount,
        reason: reason.trim()
      });
      toast.success(
        `Successfully ${adjustmentType === 'credit' ? 'credited' : 'debited'} ${parsedAmount} days for ${employee.first_name}`
      );
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to adjust leave balance');
    }
  };

  const handleClose = () => {
    setAmount('1');
    setReason('');
    setAdjustmentType('credit');
    setLeaveType('casual_leave');
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
            bgcolor: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7'
          }}
        >
          <TuneIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
            Adjust Leave Balance
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {employee.first_name} {employee.last_name} ({employee.employee_id || employee.work_email})
          </Typography>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.8125rem' }}>
            Manual adjustments are recorded immutably in the leave ledger and audit log with your administrative signature.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={leaveType}
                label="Leave Type"
                onChange={(e) => setLeaveType(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="casual_leave">Casual Leave (CL)</MenuItem>
                <MenuItem value="sick_leave">Sick Leave (SL)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Adjustment Action</InputLabel>
              <Select
                value={adjustmentType}
                label="Adjustment Action"
                onChange={(e) => setAdjustmentType(e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="credit">Credit / Add Days (+)</MenuItem>
                <MenuItem value="debit">Debit / Deduct Days (-)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Number of Days"
              type="number"
              size="small"
              fullWidth
              required
              inputProps={{ min: 0.5, step: 0.5 }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="E.g. 0.5, 1, 2"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px'
                }
              }}
            />

            <TextField
              label="Mandatory Reason *"
              placeholder="E.g., Approved comp-off, bereavement grant, policy correction..."
              fullWidth
              multiline
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px'
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={handleClose} sx={{ color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={adjustMutation.isPending}
            sx={{
              borderRadius: '10px',
              px: 3,
              fontWeight: 600,
              bgcolor: adjustmentType === 'credit' ? '#10B981' : '#EF4444',
              '&:hover': {
                bgcolor: adjustmentType === 'credit' ? '#059669' : '#DC2626'
              }
            }}
          >
            {adjustMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Save ${adjustmentType === 'credit' ? 'Credit' : 'Debit'}`
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
