import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Tabs,
  Tab,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  CheckCircleOutlineRounded as ApproveIcon,
  VisibilityOutlined as ViewIcon,
  TuneRounded as TuneIcon
} from '@mui/icons-material';
import { useLeaveRequests, useDepartments } from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import CustomPagination from '../../common/custom/CustomPagination';
import LeaveApprovalModal from '../../components/leaves/LeaveApprovalModal';

export default function LeaveManagement() {
  const [tab, setTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  const [leaveType, setLeaveType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const { data: deptData } = useDepartments();

  const { data: leavesData, isLoading, refetch } = useLeaveRequests({
    page,
    limit,
    status: tab === 'all' ? undefined : tab,
    leave_type: leaveType || undefined
  });

  const leaves = leavesData?.data || [];
  const total = leavesData?.total || 0;

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header */}
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
            Leave Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Review, approve, or reject employee leave applications across all departments.
          </Typography>
        </Box>
      </Box>

      {/* Tabs and filters */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          width: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            px: 2,
            borderBottom: '1px solid #F1F5F9'
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minWidth: 'auto',
                px: 2.5,
                py: 2
              }
            }}
          >
            <Tab value="all" label="All Applications" />
            <Tab value="pending" label="Pending Decision" />
            <Tab value="approved" label="Approved" />
            <Tab value="rejected" label="Rejected" />
            <Tab value="cancelled" label="Cancelled" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 1 } }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={leaveType}
                displayEmpty
                onChange={(e) => {
                  setLeaveType(e.target.value);
                  setPage(1);
                }}
                sx={{
                  height: 42,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontSize: '13.5px',
                  color: leaveType ? '#0F172A' : '#64748B',
                  '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                  '&:hover fieldset': { borderColor: '#23A4E8' },
                  '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                }}
              >
                <MenuItem value="">All Leave Types</MenuItem>
                <MenuItem value="casual_leave">Casual Leave (CL)</MenuItem>
                <MenuItem value="sick_leave">Sick Leave (SL)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>START DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>END DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DAYS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>SUBMITTED</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CustomTableLoader rows={6} colSpan={8} />
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    No leave requests found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={leave.employee?.avatar_url || ''}
                          sx={{ width: 36, height: 36, bgcolor: '#23A4E8', fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          {leave.employee?.first_name ? leave.employee.first_name[0] : 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                            {leave.employee?.first_name} {leave.employee?.last_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {leave.employee?.department?.name || 'Staff'} • {leave.employee?.employee_id || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={leave.leave_type === 'casual_leave' ? 'Casual Leave' : 'Sick Leave'}
                        sx={{
                          bgcolor: leave.leave_type === 'casual_leave' ? '#E0F2FE' : '#ECFDF5',
                          color: leave.leave_type === 'casual_leave' ? '#0369A1' : '#047857',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {new Date(leave.start_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {new Date(leave.end_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={leave.status} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {new Date(leave.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={leave.status === 'pending' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedLeave(leave)}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: leave.status === 'pending' ? '#23A4E8' : 'transparent',
                          '&:hover': {
                            bgcolor: leave.status === 'pending' ? '#1D8BC4' : '#F0F9FF'
                          }
                        }}
                      >
                        {leave.status === 'pending' ? 'Review' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomPagination
          count={total}
          page={page}
          rowsPerPage={limit}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>

      {/* Review Dialog */}
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
    </Box>
  );
}
