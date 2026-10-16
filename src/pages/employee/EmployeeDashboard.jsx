import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Avatar
} from '@mui/material';
import {
  AddCircleOutlineRounded as ApplyIcon,
  CalendarMonthOutlined as CalendarIcon,
  EventAvailableRounded as HolidayIcon,
  HistoryOutlined as HistoryIcon,
  Close as CancelIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useEmployeeDashboard } from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import ApplyLeaveModal from '../../components/leaves/ApplyLeaveModal';
import CancelLeaveModal from '../../components/leaves/CancelLeaveModal';

export default function EmployeeDashboard() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [cancellingLeave, setCancellingLeave] = useState(null);

  const { data: dashData, isLoading, refetch } = useEmployeeDashboard();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const entitlements = dashData?.data?.entitlements || [];
  const upcomingHolidays = dashData?.data?.upcoming_holidays || [];
  const recentLeaves = dashData?.data?.recent_leaves || [];

  const cl = entitlements.find((e) => e.leave_type === 'casual_leave') || {
    total_entitled: 12,
    used_days: 0,
    remaining_balance: 12
  };
  const sl = entitlements.find((e) => e.leave_type === 'sick_leave') || {
    total_entitled: 6,
    used_days: 0,
    remaining_balance: 6
  };

  const clProgress = cl.total_entitled > 0 ? (cl.used_days / cl.total_entitled) * 100 : 0;
  const slProgress = sl.total_entitled > 0 ? (sl.used_days / sl.total_entitled) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Welcome back, {user.first_name || 'Team Member'}!
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Here is your leave entitlement overview and upcoming schedule.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<ApplyIcon />}
          onClick={() => setApplyOpen(true)}
          sx={{
            bgcolor: '#23A4E8',
            '&:hover': { bgcolor: '#1D8BC4' },
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(35, 164, 232, 0.25)'
          }}
        >
          Apply for Leave
        </Button>
      </Box>

      {/* Leave Balance KPI Cards */}
      <Grid container spacing={2.5}>
        {/* Casual Leave */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Casual Leave (CL)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                  {cl.remaining_balance}{' '}
                  <Typography component="span" variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                    days left
                  </Typography>
                </Typography>
              </Box>
              <Chip
                label="1.0 day/mo accrual"
                size="small"
                sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 600 }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(clProgress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#F1F5F9',
                mb: 2,
                '& .MuiLinearProgress-bar': { bgcolor: '#23A4E8', borderRadius: 4 }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Used: <strong>{cl.used_days} days</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Annual Entitlement: <strong>{cl.total_entitled} days</strong>
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Sick Leave */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Sick Leave (SL)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                  {sl.remaining_balance}{' '}
                  <Typography component="span" variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                    days left
                  </Typography>
                </Typography>
              </Box>
              <Chip
                label="0.5 day/mo accrual"
                size="small"
                sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 600 }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(slProgress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#F1F5F9',
                mb: 2,
                '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 4 }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Used: <strong>{sl.used_days} days</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Annual Entitlement: <strong>{sl.total_entitled} days</strong>
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid: Upcoming Holidays & Recent Leaves */}
      <Grid container spacing={3}>
        {/* Recent Leave Requests */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  My Recent Applications
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Track your submitted leave requests and approval statuses
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/employee/my-leaves"
                sx={{ textTransform: 'none', fontWeight: 600, color: '#23A4E8', fontSize: '0.8125rem' }}
              >
                View Full History &rarr;
              </Button>
            </Box>

            <TableContainer sx={{ border: '1px solid #F1F5F9', borderRadius: '12px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>PERIOD</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DAYS</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <CustomTableLoader rows={4} colSpan={5} />
                  ) : recentLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        You haven't submitted any leave applications yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentLeaves.map((leave) => (
                      <TableRow key={leave.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Chip
                            size="small"
                            label={leave.leave_type === 'casual_leave' ? 'CL' : 'SL'}
                            sx={{
                              bgcolor: leave.leave_type === 'casual_leave' ? '#E0F2FE' : '#ECFDF5',
                              color: leave.leave_type === 'casual_leave' ? '#0369A1' : '#047857',
                              fontWeight: 700
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#334155' }}>
                            {new Date(leave.start_date).toLocaleDateString()} &rarr; {new Date(leave.end_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {leave.total_days}d
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={leave.status} />
                        </TableCell>
                        <TableCell align="right">
                          {['pending', 'approved'].includes(leave.status) && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => setCancellingLeave(leave)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Upcoming Holidays */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Upcoming Holidays
              </Typography>
              <Chip
                size="small"
                label="Paid Company Off"
                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>

            {upcomingHolidays.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px dashed #E2E8F0',
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  No upcoming holidays scheduled in the near future.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto', maxHeight: 380 }}>
                {upcomingHolidays.map((h) => {
                  const d = new Date(h.holiday_date);
                  return (
                    <Box
                      key={h.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {h.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        icon={<HolidayIcon sx={{ fontSize: 16 }} />}
                        label="Holiday"
                        sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSuccess={() => {
          setApplyOpen(false);
          refetch();
        }}
      />

      {/* Cancel Leave Modal */}
      {cancellingLeave && (
        <CancelLeaveModal
          open={Boolean(cancellingLeave)}
          onClose={() => setCancellingLeave(null)}
          leave={cancellingLeave}
          onSuccess={() => {
            setCancellingLeave(null);
            refetch();
          }}
        />
      )}
    </Box>
  );
}
