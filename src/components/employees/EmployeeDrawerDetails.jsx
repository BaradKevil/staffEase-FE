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
  CalendarTodayOutlined as CalendarIcon,
  TuneRounded as TuneIcon,
  Block as BlockIcon,
  CheckCircleOutlineRounded as ActiveIcon
} from '@mui/icons-material';
import StatusBadge from '../../common/custom/StatusBadge';
import AdjustBalanceModal from '../leaves/AdjustBalanceModal';
import { useUpdateEmployeeStatus } from '../../Api/Api';
import { toast } from 'react-toastify';

const getAvatarFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (import.meta.env.VITE_BASEURL || 'http://localhost:5000/api/v1')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2, // 1202, higher than Navbar (1201)
          '& .MuiBackdrop-root': {
            zIndex: (theme) => theme.zIndex.drawer + 2,
          },
          '& .MuiDrawer-paper': {
            zIndex: (theme) => theme.zIndex.drawer + 2,
            width: { xs: '100%', sm: 460 },
            boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.15)',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            top: 0,
            bottom: 0,
          }
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.15)',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            top: 0,
            bottom: 0,
          }
        }}
      >
        {/* Header bar */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            minHeight: 52,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            bgcolor: '#FAFCFE',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
            Employee Profile
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#64748B',
              p: 0.5,
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' }
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Compact body - fits completely without scrolling */}
        <Box
          sx={{
            p: 2.5,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            overflowY: 'auto',
          }}
        >
          {/* Profile overview */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Avatar
              src={getAvatarFullUrl(employee.avatar_url || employee.profile_photo)}
              sx={{
                width: 54,
                height: 54,
                bgcolor: '#23A4E8',
                fontSize: '1.4rem',
                fontWeight: 700,
                border: '2.5px solid #E0F2FE'
              }}
            >
              {employee.first_name ? employee.first_name[0] : 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.2, mb: 0.25 }}>
                {employee.first_name} {employee.last_name}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500, mb: 0.5 }}>
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
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Details Section */}
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 1, fontSize: '0.7rem' }}>
            EMPLOYMENT DETAILS
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <EmailIcon sx={{ color: '#94A3B8', fontSize: 18, mt: 0.2 }} />
              <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem', lineHeight: 1 }}>
                  Work Email
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#0F172A',
                    fontSize: '0.78rem',
                    wordBreak: 'break-all',
                    lineHeight: 1.25,
                    mt: 0.25
                  }}
                  title={employee.work_email || employee.email}
                >
                  {employee.work_email || employee.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CalendarIcon sx={{ color: '#94A3B8', fontSize: 18, mt: 0.2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem', lineHeight: 1 }}>
                  Joining Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.78rem', lineHeight: 1.25, mt: 0.25 }}>
                  {employee.joining_date
                    ? new Date(employee.joining_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Leave Entitlement Overview */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.7rem' }}>
              LEAVE ENTITLEMENTS (Current Year)
            </Typography>
            <Button
              size="small"
              startIcon={<TuneIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => setAdjustOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#23A4E8', fontSize: '0.72rem', py: 0.25, px: 1, minHeight: 0 }}
            >
              Adjust Balance
            </Button>
          </Box>

          {/* 2-Column Side-by-Side CL and SL Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
            {/* CL Card */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#F8FAFC',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.75rem', lineHeight: 1.2 }}>
                Casual Leave (CL)
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#23A4E8', fontSize: '0.8rem', my: 0.5 }}>
                {cl.remaining_balance} / {cl.total_entitled} days left
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(clProgress, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': { bgcolor: '#23A4E8', borderRadius: 3 }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                  Used: {cl.used_days}d
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                  Ent: {cl.total_entitled}d
                </Typography>
              </Box>
            </Box>

            {/* SL Card */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#F8FAFC',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.75rem', lineHeight: 1.2 }}>
                Sick Leave (SL)
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#10B981', fontSize: '0.8rem', my: 0.5 }}>
                {sl.remaining_balance} / {sl.total_entitled} days left
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(slProgress, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                  Used: {sl.used_days}d
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                  Ent: {sl.total_entitled}d
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer actions */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #F1F5F9',
            bgcolor: '#FAFCFE',
            display: 'flex',
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color={employee.status === 'active' ? 'error' : 'success'}
            fullWidth
            startIcon={employee.status === 'active' ? <BlockIcon sx={{ fontSize: 18 }} /> : <ActiveIcon sx={{ fontSize: 18 }} />}
            onClick={handleToggleStatus}
            disabled={statusMutation.isPending}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none',
              py: 1,
              fontSize: '0.85rem'
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
