import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import {
  AddCircleOutlineRounded as ApplyIcon,
  CalendarMonthOutlined as CalendarIcon,
  EventAvailableRounded as HolidayIcon,
  HistoryOutlined as HistoryIcon,
  BeachAccessRounded as BeachIcon,
  LocalHospitalRounded as HospitalIcon,
  ArrowForward as ArrowForwardIcon
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          width: '100%'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Welcome back, {user.first_name || 'Team Member'}!
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Here is your leave entitlement overview, recent activity, and upcoming holidays.
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
            py: 1.1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(35, 164, 232, 0.25)'
          }}
        >
          Apply for Leave
        </Button>
      </Box>

      {/* Leave Balance KPI Cards - Full-Width CSS Grid matching SmartOps-Pay MetricCard */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
          width: '100%'
        }}
      >
        {/* Casual Leave Metric Card */}
        <Card
          sx={{
            p: 2.8,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              borderColor: '#BAE6FD'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Casual Leave (CL) Balance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography sx={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {cl.remaining_balance}
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '14px' }}>
                  days available
                </Typography>
              </Box>
            </Box>

            {/* SmartOps-Pay Icon Badge */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                color: '#23A4E8',
                border: '1px solid #DBEAFE',
                boxShadow: '0 2px 8px rgba(35, 164, 232, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <BeachIcon sx={{ fontSize: 26 }} />
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(clProgress, 100)}
            sx={{
              height: 6,
              borderRadius: 99,
              bgcolor: '#F1F5F9',
              mb: 1.8,
              '& .MuiLinearProgress-bar': { bgcolor: '#23A4E8', borderRadius: 99 }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Used: <strong style={{ color: '#0F172A' }}>{cl.used_days} days</strong>
            </Typography>
            <Chip
              label={`Annual: ${cl.total_entitled} days`}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#0284C7',
                fontWeight: 600,
                fontSize: '12px',
                borderRadius: '8px'
              }}
            />
          </Box>
        </Card>

        {/* Sick Leave Metric Card */}
        <Card
          sx={{
            p: 2.8,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              borderColor: '#A7F3D0'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sick Leave (SL) Balance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography sx={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {sl.remaining_balance}
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '14px' }}>
                  days available
                </Typography>
              </Box>
            </Box>

            {/* SmartOps-Pay Icon Badge */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: '#ECFDF5',
                color: '#10B981',
                border: '1px solid #A7F3D0',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <HospitalIcon sx={{ fontSize: 26 }} />
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(slProgress, 100)}
            sx={{
              height: 6,
              borderRadius: 99,
              bgcolor: '#F1F5F9',
              mb: 1.8,
              '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 99 }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Used: <strong style={{ color: '#0F172A' }}>{sl.used_days} days</strong>
            </Typography>
            <Chip
              label={`Annual: ${sl.total_entitled} days`}
              size="small"
              sx={{
                bgcolor: '#ECFDF5',
                color: '#059669',
                fontWeight: 600,
                fontSize: '12px',
                borderRadius: '8px'
              }}
            />
          </Box>
        </Card>
      </Box>

      {/* Main Grid: Upcoming Holidays & Recent Leaves (Edge-to-Edge CSS Grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
          gap: 3,
          width: '100%',
          alignItems: 'start'
        }}
      >
        {/* Recent Leave Requests */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
                My Recent Applications
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
                Track your submitted leave requests and approval statuses
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/employee/my-leaves"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#23A4E8', fontSize: '13px' }}
            >
              View Full History
            </Button>
          </Box>

          <TableContainer sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', width: '100%' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>PERIOD</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>DAYS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <CustomTableLoader rows={4} colSpan={5} />
                ) : recentLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8', fontSize: '13.5px' }}>
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
                            fontWeight: 700,
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#334155', fontSize: '13px' }}>
                          {new Date(leave.start_date).toLocaleDateString()} &rarr; {new Date(leave.end_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
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
                              fontSize: '12px',
                              px: 1.5,
                              borderColor: '#FCA5A5',
                              color: '#EF4444',
                              '&:hover': {
                                bgcolor: '#FEF2F2',
                                borderColor: '#EF4444'
                              }
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

        {/* Upcoming Holidays Card */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
              Upcoming Holidays
            </Typography>
            <Chip
              size="small"
              label="Paid Off"
              sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '12px', borderRadius: '6px' }}
            />
          </Box>

          {upcomingHolidays.length === 0 ? (
            <Box
              sx={{
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
              <Typography sx={{ color: '#94A3B8', fontSize: '13px' }}>
                No upcoming holidays scheduled in the near future.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', maxHeight: 380 }}>
              {upcomingHolidays.map((h) => {
                const d = new Date(h.holiday_date);
                return (
                  <Box
                    key={h.id}
                    sx={{
                      p: 1.75,
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                        {h.holiday_name || h.name}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '12px', mt: 0.25 }}>
                        {d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      icon={<HolidayIcon sx={{ fontSize: 16 }} />}
                      label="Holiday"
                      sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '12px', borderRadius: '6px' }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>
      </Box>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        open={applyOpen}
        onClose={() => {
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
