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
import { CheckCircleOutlineRounded as ApproveIcon } from '@mui/icons-material';
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
            bgcolor: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981'
          }}
        >
          <ApproveIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
            Approve Registration
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Activate account & grant system access
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
            sx={{ width: 44, height: 44, bgcolor: '#23A4E8', fontWeight: 700 }}
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
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {employee.designation || 'Team Member'} • {employee.department?.name || 'Department'}
            </Typography>
          </Box>
        </Box>

        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.8125rem' }}>
          Approving will activate this employee's credentials and automatically initialize their{' '}
          <strong>prorated annual leave entitlement</strong> (1.0 CL + 0.5 SL per remaining month) in an atomic transaction.
        </Alert>

        <TextField
          label="Confirm or Update Employee ID"
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
          color="success"
          onClick={handleApprove}
          disabled={approveMutation.isPending}
          sx={{
            borderRadius: '10px',
            px: 3,
            fontWeight: 600,
            bgcolor: '#10B981',
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          {approveMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Approve & Activate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
