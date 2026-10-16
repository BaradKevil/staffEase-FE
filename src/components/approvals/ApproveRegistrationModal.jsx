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
  CheckCircleOutlineRounded as ApproveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useApproveRegistration } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function ApproveRegistrationModal({ open, onClose, employee, onSuccess }) {
  const [employeeId, setEmployeeId] = useState('');
  const approveMutation = useApproveRegistration();

  if (!employee) return null;

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        id: employee.id,
        employee_id: employeeId.trim() || undefined
      });
      toast.success(
        `Registration for ${employee.first_name} ${employee.last_name} approved! Entitlements initialized.`
      );
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve employee registration');
    }
  };

  const handleClose = () => {
    setEmployeeId('');
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          borderTop: '5px solid #10B981',
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
              bgcolor: '#ECFDF5',
              color: '#10B981',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ApproveIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
              Approve Registration
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Activate account & grant system access
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
            sx={{ width: 44, height: 44, bgcolor: '#23A4E8', fontWeight: 700 }}
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
            <Typography sx={{ color: '#94A3B8', fontSize: '12px' }}>
              {employee.designation || 'Team Member'} • {employee.department?.name || 'Department'}
            </Typography>
          </Box>
        </Box>

        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '12.5px', bgcolor: '#ECFDF5', color: '#065F46' }}>
          Approving will activate this employee's credentials and automatically initialize their{' '}
          <strong>prorated annual leave entitlement</strong> (1.0 CL + 0.5 SL per remaining month) in an atomic transaction.
        </Alert>

        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
            Confirm or Assign Employee ID <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
          </Typography>
          <TextField
            placeholder={employee.employee_id || 'e.g. EMP-1042'}
            fullWidth
            size="small"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            helperText={
              employee.employee_id
                ? `Current ID: ${employee.employee_id} (Leave blank to keep)`
                : 'Assign a company employee ID'
            }
            sx={inputStyle}
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
          onClick={handleApprove}
          disabled={approveMutation.isPending}
          sx={{
            borderRadius: '10px',
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: '#10B981',
            '&:hover': { bgcolor: '#059669' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          {approveMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Approve & Activate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
