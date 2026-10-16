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
  Button,
  Tabs,
  Tab,
  Chip,
  Tooltip
} from '@mui/material';
import { AddCircleOutlineRounded as ApplyIcon, CancelOutlined as CancelIcon } from '@mui/icons-material';
import { useLeaveRequests } from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import CustomPagination from '../../common/custom/CustomPagination';
import ApplyLeaveModal from '../../components/leaves/ApplyLeaveModal';
import CancelLeaveModal from '../../components/leaves/CancelLeaveModal';

export default function MyLeaves() {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cancellingLeave, setCancellingLeave] = useState(null);

  const { data: leavesData, isLoading, refetch } = useLeaveRequests({
    page,
    limit,
    status: tab === 'all' ? undefined : tab
  });

  const leaves = leavesData?.data || [];
  const total = leavesData?.total || 0;

  const handleTabChange = (e, val) => {
    setTab(val);
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
            My Leave Applications
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            View your history of leave requests, status updates, and cancellation options.
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
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(35, 164, 232, 0.25)',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Apply for Leave
        </Button>
      </Box>

      {/* Tabs and Table */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
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
            borderBottom: '1px solid #F1F5F9',
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 2
            }
          }}
        >
          <Tab value="all" label="All Applications" />
          <Tab value="pending" label="Pending" />
          <Tab value="approved" label="Approved" />
          <Tab value="rejected" label="Rejected" />
          <Tab value="cancelled" label="Cancelled" />
        </Tabs>

        <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>LEAVE TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>START DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>END DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DAYS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>REASON / REMARKS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>APPLIED ON</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CustomTableLoader rows={6} colSpan={8} />
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    No leave applications found.
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => {
                  const canCancel = ['pending', 'approved'].includes(leave.status);
                  return (
                    <TableRow key={leave.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={leave.leave_type === 'casual_leave' ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}
                          sx={{
                            bgcolor: leave.leave_type === 'casual_leave' ? '#E0F2FE' : '#ECFDF5',
                            color: leave.leave_type === 'casual_leave' ? '#0369A1' : '#047857',
                            fontWeight: 700
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {new Date(leave.start_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {new Date(leave.end_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={leave.status} />
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" sx={{ color: '#334155', noWrap: true }}>
                          {leave.reason || '—'}
                        </Typography>
                        {leave.rejection_reason && (
                          <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mt: 0.5 }}>
                            Rejected: {leave.rejection_reason}
                          </Typography>
                        )}
                        {leave.admin_comments && (
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                            Admin note: {leave.admin_comments}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {new Date(leave.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {canCancel && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => setCancellingLeave(leave)}
                            startIcon={<CancelIcon fontSize="small" />}
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomPagination
          count={total}
          page={page}
          rowsPerPage={limit}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Card>

      {/* Apply Modal */}
      <ApplyLeaveModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSuccess={() => {
          setApplyOpen(false);
          refetch();
        }}
      />

      {/* Cancel Modal */}
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
