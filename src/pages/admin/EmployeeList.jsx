import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAddRounded as InviteIcon,
  VisibilityOutlined as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useEmployees, useDepartments } from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import CustomPagination from '../../common/custom/CustomPagination';
import EmployeeDrawerDetails from '../../components/employees/EmployeeDrawerDetails';
import InviteEmployeeModal from '../../components/employees/InviteEmployeeModal';

export default function EmployeeList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: deptData } = useDepartments();
  const departments = deptData?.data || [];

  const { data: empData, isLoading, refetch } = useEmployees({
    page,
    limit,
    search: search.trim() || undefined,
    status: status || undefined,
    department_id: departmentId || undefined
  });

  const employees = empData?.data || [];
  const total = empData?.total || 0;
  const totalPages = empData?.total_pages || Math.ceil(total / limit) || 1;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

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
            Employee Directory
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Manage staff profiles, leave entitlements, and onboarding status.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<InviteIcon />}
          onClick={() => setInviteOpen(true)}
          sx={{
            bgcolor: '#23A4E8',
            '&:hover': { bgcolor: '#1D8BC4' },
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(35, 164, 232, 0.25)',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Invite Employee
        </Button>
      </Box>

      {/* Filter and Search Card */}
      <Card
        sx={{
          p: 2,
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          width: '100%'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by name, email, employee ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 42,
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
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <Select
              value={departmentId}
              displayEmpty
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              sx={{
                height: 42,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                fontSize: '13.5px',
                color: departmentId ? '#0F172A' : '#64748B',
                '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                '&:hover fieldset': { borderColor: '#23A4E8' },
                '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
              }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            <Select
              value={status}
              displayEmpty
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              sx={{
                height: 42,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                fontSize: '13.5px',
                color: status ? '#0F172A' : '#64748B',
                '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                '&:hover fieldset': { borderColor: '#23A4E8' },
                '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending_approval">Pending Approval</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Employee Table */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMPLOYEE ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DESIGNATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>JOINED DATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CustomTableLoader rows={6} colSpan={7} />
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    No employees found matching the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                    onClick={() => setSelectedEmployee(emp)}
                  >
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
                        {emp.employee_id || '—'}
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
                      <StatusBadge status={emp.status} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                        {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedEmployee(emp)}
                        startIcon={<ViewIcon fontSize="small" />}
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
                        Profile
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

      {/* Slide-out Employee Details Drawer */}
      {selectedEmployee && (
        <EmployeeDrawerDetails
          open={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          employee={selectedEmployee}
          onRefresh={() => {
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
