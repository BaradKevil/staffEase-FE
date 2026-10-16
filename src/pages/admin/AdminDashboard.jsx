import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  PeopleAltOutlined as PeopleIcon,
  HowToRegOutlined as RegIcon,
  EventBusyOutlined as AbsentIcon,
  PendingActionsOutlined as PendingIcon,
  PersonAddRounded as InviteIcon,
  CalendarMonthRounded as CalendarIcon,
  VisibilityOutlined as ViewIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../Api/Api';
import StatCardsGrid from '../../components/dashboard/StatCards';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import LeaveApprovalModal from '../../components/leaves/LeaveApprovalModal';
import InviteEmployeeModal from '../../components/employees/InviteEmployeeModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: dashData, isLoading, refetch } = useAdminDashboard();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const stats = dashData?.data?.stats || {
    total_employees: 0,
    pending_registrations: 0,
    on_leave_today: 0,
    pending_leave_requests: 0
  };

  const onLeaveTodayList = dashData?.data?.on_leave_today_list || [];
  const recentLeaves = dashData?.data?.recent_leave_requests || [];

  const statCardsData = [
    {
      title: 'Total Active Employees',
      value: stats.total_employees,
      subtitle: 'Enrolled staff members',
      icon: PeopleIcon,
      color: '#23A4E8',
      bgLight: '#E0F2FE'
    },
    {
      title: 'Pending Registrations',
      value: stats.pending_registrations,
      subtitle: 'Awaiting admin approval',
      icon: RegIcon,
      color: stats.pending_registrations > 0 ? '#F59E0B' : '#64748B',
      bgLight: '#FEF3C7'
    },
    {
      title: 'On Leave Today',
      value: stats.on_leave_today,
      subtitle: 'Approved absences',
      icon: AbsentIcon,
      color: '#8B5CF6',
      bgLight: '#F3E8FF'
    },
    {
      title: 'Pending Leave Requests',
      value: stats.pending_leave_requests,
      subtitle: 'Needs decision',
      icon: PendingIcon,
      color: stats.pending_leave_requests > 0 ? '#EF4444' : '#10B981',
      bgLight: stats.pending_leave_requests > 0 ? '#FEE2E2' : '#ECFDF5'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Welcome & Actions Header */}
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
            HR Administrator Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Overview of employee statuses, pending applications, and workforce availability.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<InviteIcon />}
            onClick={() => setInviteOpen(true)}
            sx={{
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' },
              borderRadius: '10px',
              px: 2.25,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Invite Employee
          </Button>
          <Button
            component={Link}
            to="/admin/calendar"
            variant="outlined"
            startIcon={<CalendarIcon />}
            sx={{
              borderRadius: '10px',
              px: 2,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#334155',
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' }
            }}
          >
            Company Calendar
          </Button>
        </Stack>
      </Box>

      {/* Metric Cards */}
      <StatCardsGrid items={statCardsData} />

      {/* Quick Action Alerts if pending items exist */}
      {stats.pending_registrations > 0 && (
        <Alert
          severity="warning"
          sx={{ borderRadius: '12px', display: 'flex', alignItems: 'center' }}
          action={
            <Button
              component={Link}
              to="/admin/approvals"
              color="inherit"
              size="small"
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Review Now &rarr;
            </Button>
          }
        >
          You have <strong>{stats.pending_registrations}</strong> employee registration(s) waiting for your review and entitlement initialization.
        </Alert>
      )}

      {/* Main Grid: Absences Today & Recent Leave Applications */}
      <Grid container spacing={3}>
        {/* On Leave Today */}
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
                On Leave Today
              </Typography>
              <Chip
                size="small"
                label={`${onLeaveTodayList.length} Absent`}
                sx={{ bgcolor: '#F3E8FF', color: '#7E22CE', fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>

            {onLeaveTodayList.length === 0 ? (
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
                  No team members are scheduled on leave today.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto', maxHeight: 380 }}>
                {onLeaveTodayList.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <Avatar
                      src={item.employee?.avatar_url || ''}
                      sx={{ width: 40, height: 40, bgcolor: '#8B5CF6', fontWeight: 700, fontSize: '0.9rem' }}
                    >
                      {item.employee?.first_name ? item.employee.first_name[0] : 'E'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', noWrap: true }}>
                        {item.employee?.first_name} {item.employee?.last_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        {item.employee?.department?.name || 'Department'}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={item.leave_type === 'casual_leave' ? 'CL' : 'SL'}
                      sx={{
                        bgcolor: item.leave_type === 'casual_leave' ? '#E0F2FE' : '#ECFDF5',
                        color: item.leave_type === 'casual_leave' ? '#0369A1' : '#047857',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

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
                  Recent Leave Requests
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Latest applications submitted by team members
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/admin/leaves"
                endIcon={<ArrowIcon fontSize="small" />}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#23A4E8', fontSize: '0.8125rem' }}
              >
                View All
              </Button>
            </Box>

            <TableContainer sx={{ border: '1px solid #F1F5F9', borderRadius: '12px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DATES</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DAYS</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <CustomTableLoader rows={4} colSpan={6} />
                  ) : recentLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#94A3B8' }}>
                        No recent leave requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentLeaves.map((leave) => (
                      <TableRow key={leave.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                              src={leave.employee?.avatar_url || ''}
                              sx={{ width: 32, height: 32, bgcolor: '#23A4E8', fontSize: '0.8rem', fontWeight: 700 }}
                            >
                              {leave.employee?.first_name ? leave.employee.first_name[0] : 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                                {leave.employee?.first_name} {leave.employee?.last_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                {leave.employee?.department?.name || 'Staff'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                            {leave.leave_type === 'casual_leave' ? 'CL' : 'SL'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8125rem' }}>
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
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSelectedLeave(leave)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              borderColor: '#E2E8F0',
                              color: '#23A4E8',
                              '&:hover': { borderColor: '#23A4E8', bgcolor: '#F0F9FF' }
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Approval Modal */}
      {selectedLeave && (
        <LeaveApprovalModal
          open={Boolean(selectedLeave)}
          onClose={() => setSelectedLeave(null)}
          leave={selectedLeave}
          onSuccess={() => {
            setSelectedLeave(null);
            refetch();
          }}
        />
      )}

      {/* Invite Employee Modal */}
      <InviteEmployeeModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => {
          setInviteOpen(false);
          refetch();
        }}
      />
    </Box>
  );
}
