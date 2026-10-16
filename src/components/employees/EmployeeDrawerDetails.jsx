import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Button,
  LinearProgress,
  Stack,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  BadgeOutlined as BadgeIcon,
  CorporateFareOutlined as DeptIcon,
  CalendarTodayOutlined as CalendarIcon,
  TuneRounded as TuneIcon,
  Block as BlockIcon,
  CheckCircleOutlineRounded as ActiveIcon
} from '@mui/icons-material';
import StatusBadge from '../../common/custom/StatusBadge';
import AdjustBalanceModal from '../leaves/AdjustBalanceModal';
import { useUpdateEmployeeStatus } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function EmployeeDrawerDetails({ open, onClose, employee, onRefresh }) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const statusMutation = useUpdateEmployeeStatus();

  if (!employee) return null;

  const handleToggleStatus = async () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    try {
      await statusMutation.mutateAsync({
        id: employee.id,
        status: newStatus
      });
      toast.success(`Employee account marked as ${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update employee status');
    }
  };

  const entitlements = employee.entitlements || [];
  const cl = entitlements.find((e) => e.leave_type === 'casual_leave') || {
    total_entitled: 0,
    used_days: 0,
    remaining_balance: 0
  };
  const sl = entitlements.find((e) => e.leave_type === 'sick_leave') || {
    total_entitled: 0,
    used_days: 0,
    remaining_balance: 0
  };

  const clProgress = cl.total_entitled > 0 ? (cl.used_days / cl.total_entitled) * 100 : 0;
  const slProgress = sl.total_entitled > 0 ? (sl.used_days / sl.total_entitled) * 100 : 0;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.1)',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Header bar */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            bgcolor: '#FAFCFE'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
            Employee Profile
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
          {/* Profile overview */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
            <Avatar
              src={employee.avatar_url || ''}
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#23A4E8',
                fontSize: '1.75rem',
                fontWeight: 700,
                border: '3px solid #E0F2FE'
              }}
            >
              {employee.first_name ? employee.first_name[0] : 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>
                  {employee.first_name} {employee.last_name}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 1, fontWeight: 500 }}>
                {employee.designation || 'Team Member'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusBadge status={employee.status} />
                <Chip
                  size="small"
                  label={employee.role?.name === 'admin' ? 'HR / Admin' : 'Employee'}
                  sx={{
                    bgcolor: employee.role?.name === 'admin' ? '#F3E8FF' : '#F1F5F9',
                    color: employee.role?.name === 'admin' ? '#7E22CE' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Details Section */}
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 2 }}>
            EMPLOYMENT DETAILS
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BadgeIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Employee ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                  {employee.employee_id || 'Not Assigned'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Work Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                  {employee.work_email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DeptIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Department
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                  {employee.department?.name || 'Unassigned'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Joining Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                  {employee.joining_date
                    ? new Date(employee.joining_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Leave Entitlement Overview */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
              LEAVE ENTITLEMENTS (Current Year)
            </Typography>
            <Button
              size="small"
              startIcon={<TuneIcon />}
              onClick={() => setAdjustOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#23A4E8', fontSize: '0.75rem' }}
            >
              Adjust Balance
            </Button>
          </Box>

          {/* CL Card */}
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Casual Leave (CL)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#23A4E8' }}>
                {cl.remaining_balance} / {cl.total_entitled} days left
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(clProgress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#E2E8F0',
                '& .MuiLinearProgress-bar': { bgcolor: '#23A4E8', borderRadius: 4 }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Used: {cl.used_days} days
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Entitled: {cl.total_entitled} days
              </Typography>
            </Box>
          </Box>

          {/* SL Card */}
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Sick Leave (SL)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#10B981' }}>
                {sl.remaining_balance} / {sl.total_entitled} days left
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(slProgress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#E2E8F0',
                '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 4 }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Used: {sl.used_days} days
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Entitled: {sl.total_entitled} days
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer actions */}
        <Box
          sx={{
            p: 2.5,
            borderTop: '1px solid #F1F5F9',
            bgcolor: '#FAFCFE',
            display: 'flex',
            gap: 1.5
          }}
        >
          <Button
            variant="outlined"
            color={employee.status === 'active' ? 'error' : 'success'}
            fullWidth
            startIcon={employee.status === 'active' ? <BlockIcon /> : <ActiveIcon />}
            onClick={handleToggleStatus}
            disabled={statusMutation.isPending}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            {employee.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </Button>
        </Box>
      </Drawer>

      <AdjustBalanceModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        employee={employee}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
