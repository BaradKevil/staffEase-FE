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
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  HowToRegRounded as RegIcon,
  CheckCircleOutlineRounded as ApproveIcon,
  CancelOutlined as RejectIcon
} from '@mui/icons-material';
import { useEmployees } from '../../Api/Api';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import ApproveRegistrationModal from '../../components/approvals/ApproveRegistrationModal';
import RejectRegistrationModal from '../../components/approvals/RejectRegistrationModal';

export default function RegistrationApprovals() {
  const [approvingEmployee, setApprovingEmployee] = useState(null);
  const [rejectingEmployee, setRejectingEmployee] = useState(null);

  const { data: empData, isLoading, refetch } = useEmployees({
    status: 'pending_approval',
    limit: 50
  });

  const pendingEmployees = empData?.data || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Registration Approvals
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Review submitted employee registrations and initialize their annual leave entitlements.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ borderRadius: '12px' }}>
        When an employee is approved, their login is activated immediately and their annual leave entitlement
        (<strong>1.0 CL + 0.5 SL per remaining month</strong>) is calculated and granted in an atomic transaction.
      </Alert>

      {/* Approvals Table */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>APPLICANT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMPLOYEE ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DESIGNATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>JOINING DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>SUBMITTED AT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CustomTableLoader rows={4} colSpan={7} />
              ) : pendingEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <RegIcon sx={{ fontSize: 40, color: '#CBD5E1' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B' }}>
                        No pending employee registrations
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        All invited candidates have either been approved or have not submitted registration yet.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pendingEmployees.map((emp) => (
                  <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={emp.avatar_url || ''}
                          sx={{ width: 38, height: 38, bgcolor: '#23A4E8', fontWeight: 700, fontSize: '0.9rem' }}
                        >
                          {emp.first_name ? emp.first_name[0] : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                            {emp.first_name} {emp.last_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {emp.work_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        {emp.employee_id || 'Not set'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {emp.department?.name || 'Unassigned'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        {emp.designation || 'Staff'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {new Date(emp.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon fontSize="small" />}
                          onClick={() => setApprovingEmployee(emp)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon fontSize="small" />}
                          onClick={() => setRejectingEmployee(emp)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Approval Modal */}
      {approvingEmployee && (
        <ApproveRegistrationModal
          open={Boolean(approvingEmployee)}
          onClose={() => setApprovingEmployee(null)}
          employee={approvingEmployee}
          onSuccess={() => {
            setApprovingEmployee(null);
            refetch();
          }}
        />
      )}

      {/* Rejection Modal */}
      {rejectingEmployee && (
        <RejectRegistrationModal
          open={Boolean(rejectingEmployee)}
          onClose={() => setRejectingEmployee(null)}
          employee={rejectingEmployee}
          onSuccess={() => {
            setRejectingEmployee(null);
            refetch();
          }}
        />
      )}
    </Box>
  );
}
