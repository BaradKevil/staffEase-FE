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
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  TuneRounded as TuneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
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

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      height: 44,
      borderRadius: '10px',
      bgcolor: '#F8FAFC',
      '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
      '&:hover fieldset': { borderColor: '#23A4E8' },
      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '13.5px',
      color: '#0F172A',
      '&::placeholder': { color: '#94A3B8', opacity: 1 }
    }
  };

  const selectStyle = {
    height: 44,
    borderRadius: '10px',
    bgcolor: '#F8FAFC',
    fontSize: '13.5px',
    color: '#0F172A',
    '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
    '&:hover fieldset': { borderColor: '#23A4E8' },
    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
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
          borderTop: '5px solid #23A4E8',
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
              bgcolor: '#EFF6FF',
              color: '#23A4E8',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TuneIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
              Adjust Leave Balance
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              {employee.first_name} {employee.last_name} ({employee.employee_id || employee.work_email})
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '12.5px', color: '#92400E', bgcolor: '#FEF3C7' }}>
            Manual adjustments are recorded immutably in the leave ledger and audit log with your administrative signature.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {/* Leave Type */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Leave Type <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  sx={selectStyle}
                >
                  <MenuItem value="casual_leave">Casual Leave (CL)</MenuItem>
                  <MenuItem value="sick_leave">Sick Leave (SL)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Adjustment Action */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Adjustment Action <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  sx={selectStyle}
                >
                  <MenuItem value="credit">Credit / Add Days (+)</MenuItem>
                  <MenuItem value="debit">Debit / Deduct Days (-)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Number of Days */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Number of Days <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                type="number"
                size="small"
                fullWidth
                required
                inputProps={{ min: 0.5, step: 0.5 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 0.5, 1, 2"
                sx={inputStyle}
              />
            </Box>

            {/* Mandatory Reason */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Mandatory Reason <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                placeholder="E.g., Approved comp-off, bereavement grant, policy correction..."
                fullWidth
                multiline
                rows={3}
                required
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={adjustMutation.isPending}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
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
