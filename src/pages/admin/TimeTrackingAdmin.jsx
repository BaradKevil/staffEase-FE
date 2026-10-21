import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  AccessTimeFilled as ClockIcon,
  PeopleAltOutlined as PeopleIcon,
  CheckCircleOutlineRounded as CompleteIcon,
  HourglassEmptyRounded as IncompleteIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  FileDownloadOutlined as ExportIcon,
  SyncRounded as SyncIcon,
  RestartAltRounded as ResetIcon,
  CalendarMonthOutlined as CalendarIcon,
  NotificationsActiveOutlined as AlertIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  useAdminTimeOverview,
  useAdminTimeRecords,
  useDepartments,
  useEmployeeDateSessions,
  useAdminCorrectSession,
  useTriggerAutoClose,
  useTrigger7PmReminder,
} from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import CustomPagination from '../../common/custom/CustomPagination';

const formatMinutesToHours = (totalMinutes = 0) => {
  if (totalMinutes === null || totalMinutes === undefined) return '--';
  const m = Math.max(0, Math.round(totalMinutes));
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

const formatSecondsHuman = (totalSeconds = 0) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s === 0) return '0h 00m';
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
};

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDateReadable = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function TimeTrackingAdmin() {
  // Live Overview query
  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview } = useAdminTimeOverview();

  // Departments for filtering
  const { data: departments } = useDepartments();

  // Filters State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const recordsParams = useMemo(() => {
    const p = { page, limit };
    if (search.trim()) p.search = search.trim();
    if (departmentId) p.department_id = Number(departmentId);
    if (statusFilter) p.status = statusFilter;
    if (startDate) p.start_date = startDate;
    if (endDate) p.end_date = endDate;
    return p;
  }, [page, limit, search, departmentId, statusFilter, startDate, endDate]);

  // Daily records query
  const { data: recordsData, isLoading: isRecordsLoading, refetch: refetchRecords } = useAdminTimeRecords(recordsParams);
  const rawRecords = recordsData?.data || [];
  const records = useMemo(() => {
    return rawRecords.filter((rec) => rec.user?.role !== 'admin');
  }, [rawRecords]);
  const pagination = recordsData?.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 };

  // Manual Trigger Auto-Close
  const { mutate: triggerAutoClose, isPending: isTriggering } = useTriggerAutoClose(
    (res) => {
      toast.success(`Auto-close routine executed. ${res?.closed_count || 0} session(s) closed.`);
      refetchOverview();
      refetchRecords();
    },
    (err) => {
      toast.error(err?.response?.data?.message || 'Failed to trigger auto-close routine.');
    }
  );

  // Manual Dispatch 7 PM Reminder Alert
  const { mutate: trigger7PmAlert, isPending: isDispatching7Pm } = useTrigger7PmReminder(
    (res) => {
      toast.success(res?.message || '7:00 PM daily reminder alert dispatched to employees.');
    },
    (err) => {
      toast.error(err?.response?.data?.message || 'Failed to dispatch 7:00 PM alert.');
    }
  );

  // Drill-down State
  const [selectedUserDate, setSelectedUserDate] = useState(null); // { userId, date }
  const {
    data: drillDownData,
    isLoading: isDrillDownLoading,
    refetch: refetchDrillDown,
  } = useEmployeeDateSessions(
    selectedUserDate?.userId,
    selectedUserDate?.date
  );

  // Correction Modal State
  const [editingSession, setEditingSession] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    started_at: '',
    ended_at: '',
    duration_minutes: '',
    notes: '',
    reason: '',
  });

  const { mutate: submitCorrection, isPending: isSubmittingCorrection } = useAdminCorrectSession(
    () => {
      toast.success('Session updated and re-aggregated with audit trail!');
      setEditingSession(null);
      refetchDrillDown();
      refetchRecords();
      refetchOverview();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to correct session.');
    }
  );

  const handleOpenCorrection = (session) => {
    setEditingSession(session);
    setCorrectionForm({
      started_at: toDateTimeLocal(session.started_at),
      ended_at: toDateTimeLocal(session.ended_at),
      duration_minutes: session.duration_minutes !== null ? String(session.duration_minutes) : '',
      notes: session.notes || '',
      reason: '',
    });
  };

  const handleSaveCorrection = () => {
    if (!correctionForm.reason.trim()) {
      toast.error('Audit reason is required for manual session corrections.');
      return;
    }

    const payload = {
      reason: correctionForm.reason.trim(),
      notes: correctionForm.notes.trim() || undefined,
    };

    if (correctionForm.started_at) {
      payload.started_at = new Date(correctionForm.started_at).toISOString();
    }
    if (correctionForm.ended_at) {
      payload.ended_at = new Date(correctionForm.ended_at).toISOString();
    }
    if (correctionForm.duration_minutes !== '') {
      payload.duration_minutes = Number(correctionForm.duration_minutes);
    }

    submitCorrection({
      sessionId: editingSession.id,
      data: payload,
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentId('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!records.length) {
      toast.info('No time records available to export.');
      return;
    }

    const headers = [
      'Employee Name',
      'Employee ID',
      'Email',
      'Department',
      'Work Date',
      'Target (Minutes)',
      'Actual (Minutes)',
      'Status',
      'Sessions Count',
    ];

    const rows = records.map((r) => [
      `"${r.user?.first_name || ''} ${r.user?.last_name || ''}"`,
      `"${r.user?.employee_id || ''}"`,
      `"${r.user?.email || ''}"`,
      `"${r.user?.department?.name || ''}"`,
      `"${r.work_date}"`,
      r.target_minutes ?? 480,
      r.actual_minutes || 0,
      `"${r.status}"`,
      r.sessions?.length || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `staffEase_Time_Tracking_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Time tracking records exported to CSV!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Time Tracking Administration
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Monitor real-time employee attendance, inspect session logs, and perform authorized audit corrections.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={() => triggerAutoClose()}
            disabled={isTriggering}
            sx={{
              borderColor: '#CBD5E1',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
            }}
          >
            {isTriggering ? 'Running...' : 'Run Auto-Close'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<AlertIcon />}
            onClick={() => trigger7PmAlert()}
            disabled={isDispatching7Pm}
            sx={{
              borderColor: '#BAE6FD',
              color: '#0284C7',
              bgcolor: '#F0F9FF',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              '&:hover': { borderColor: '#7DD3FC', bgcolor: '#E0F2FE' },
            }}
          >
            {isDispatching7Pm ? 'Dispatching...' : 'Dispatch 7:00 PM Alert'}
          </Button>

          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            sx={{
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' },
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(35, 164, 232, 0.25)',
            }}
          >
            Export CSV
          </Button>
        </Stack>
      </Box>

      {/* Metrics Overview Cards */}
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Active Now</Typography>
                <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 38, height: 38 }}>
                  <ClockIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', mt: 1.5, lineHeight: 1.1 }}>
                {overview?.active_now_count ?? 0}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#059669', fontWeight: 600, mt: 1 }}>
              Currently Clocked In
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Completed (8h)</Typography>
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 38, height: 38 }}>
                  <CompleteIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', mt: 1.5, lineHeight: 1.1 }}>
                {overview?.completed_count ?? 0}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#2563EB', fontWeight: 600, mt: 1 }}>
              Target Met Today
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Incomplete</Typography>
                <Avatar sx={{ bgcolor: '#FFFBEB', color: '#D97706', width: 38, height: 38 }}>
                  <IncompleteIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', mt: 1.5, lineHeight: 1.1 }}>
                {overview?.incomplete_count ?? 0}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#D97706', fontWeight: 600, mt: 1 }}>
              Under Target Duration
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Workday End</Typography>
                <Avatar sx={{ bgcolor: '#F8FAFC', color: '#475569', width: 38, height: 38 }}>
                  <CalendarIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: { xs: '18px', sm: '20px', md: '21px' }, fontWeight: 800, color: '#0F172A', mt: 1.5, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                {overview?.workday_end || '12:00 AM (Midnight)'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 500, mt: 1 }}>
              Auto-Close Configured
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Records Table Card */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Filter Controls Bar */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 240px' } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search employee, email, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFFFFF' } }}
            />
          </Box>

          <FormControl size="small" sx={{ minWidth: 175, flex: { xs: '1 1 140px', sm: '0 0 auto' } }}>
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              sx={{ borderRadius: '8px', bgcolor: '#FFFFFF' }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160, flex: { xs: '1 1 140px', sm: '0 0 auto' } }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              sx={{ borderRadius: '8px', bgcolor: '#FFFFFF' }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="complete">Complete (8h)</MenuItem>
              <MenuItem value="incomplete">Incomplete</MenuItem>
              <MenuItem value="non_working">Non-Working</MenuItem>
              <MenuItem value="on_leave">On Leave</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
              From:
            </Typography>
            <TextField
              size="small"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              inputProps={{ 'aria-label': 'From Date' }}
              sx={{
                width: 145,
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
              To:
            </Typography>
            <TextField
              size="small"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              inputProps={{ 'aria-label': 'To Date' }}
              sx={{
                width: 145,
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            />
          </Box>

          {(search || departmentId || statusFilter || startDate || endDate) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ResetIcon />}
              onClick={handleResetFilters}
              sx={{
                height: 40,
                textTransform: 'none',
                color: '#64748B',
                borderColor: '#CBD5E1',
                borderRadius: '8px',
              }}
            >
              Reset
            </Button>
          )}
        </Box>

        {/* Records Table */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>TARGET</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>ACTUAL WORKED</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>SESSIONS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isRecordsLoading ? (
                <CustomTableLoader rows={6} columns={7} />
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
                    No time tracking records found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((rec) => {
                  const target = rec.target_minutes ?? 480;
                  const actualSecs = rec.actual_seconds ?? (rec.actual_minutes ? rec.actual_minutes * 60 : 0);
                  const isTargetMet = target > 0 ? actualSecs >= target * 60 : actualSecs > 0;

                  return (
                    <TableRow key={rec.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#23A4E8', width: 34, height: 34, fontSize: '13px', fontWeight: 700 }}>
                            {rec.user?.first_name?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              {rec.user?.first_name} {rec.user?.last_name}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                              {rec.user?.employee_id} • {rec.user?.department?.name || 'General'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                        {formatDateReadable(rec.work_date)}
                      </TableCell>

                      <TableCell sx={{ color: '#64748B' }}>
                        {formatMinutesToHours(target)}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {rec.has_active_session && (
                            <Tooltip title="Session actively running now">
                              <Box
                                component="span"
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: '#10B981',
                                  display: 'inline-block',
                                }}
                              />
                            </Tooltip>
                          )}
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: isTargetMet ? '#059669' : '#0F172A',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatSecondsHuman(actualSecs)}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={rec.status} />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={`${rec.sessions?.length || 0} session(s)`}
                          sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '11px' }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Inspect Work Sessions">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() =>
                              setSelectedUserDate({
                                userId: rec.user_id,
                                date: rec.work_date,
                              })
                            }
                            sx={{
                              textTransform: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              borderColor: '#E2E8F0',
                              color: '#23A4E8',
                            }}
                          >
                            Inspect
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <CustomPagination
          pagination={pagination}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* Drill-down Sessions Modal */}
      <Dialog
        open={Boolean(selectedUserDate)}
        onClose={() => setSelectedUserDate(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Session Drill-Down — {formatDateReadable(selectedUserDate?.date)}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {isDrillDownLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#64748B' }}>Loading employee sessions...</Typography>
            </Box>
          ) : drillDownData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Employee & Record Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {drillDownData.user?.first_name} {drillDownData.user?.last_name} ({drillDownData.user?.employee_id})
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                    {drillDownData.user?.email} • {drillDownData.user?.department?.name || 'General'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '12px', color: '#64748B' }}>Target / Actual</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {formatMinutesToHours(drillDownData.target_minutes)} / {drillDownData.actual_seconds ? formatSecondsHuman(drillDownData.actual_seconds) : formatMinutesToHours(drillDownData.actual_minutes)}
                    </Typography>
                  </Box>
                  <StatusBadge status={drillDownData.status} />
                </Stack>
              </Box>

              {/* Sessions Table */}
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                Recorded Sessions ({drillDownData.sessions?.length || 0})
              </Typography>

              {drillDownData.sessions && drillDownData.sessions.length > 0 ? (
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>START TIME</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>END TIME</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>DURATION</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>CLOSURE</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>NOTES</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>ACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drillDownData.sessions.map((sess, idx) => (
                        <TableRow key={sess.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                          <TableCell sx={{ color: '#334155' }}>{formatTimeOnly(sess.started_at)}</TableCell>
                          <TableCell sx={{ color: '#334155' }}>
                            {sess.ended_at ? formatTimeOnly(sess.ended_at) : 'Active'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                            {sess.duration_seconds !== null && sess.duration_seconds !== undefined
                              ? formatSecondsHuman(sess.duration_seconds)
                              : formatMinutesToHours(sess.duration_minutes)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sess.status} size="small" />
                          </TableCell>
                          <TableCell sx={{ fontSize: '11px', color: '#64748B' }}>
                            {sess.closure_reason || '--'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '11px', color: '#64748B', maxWidth: 180 }}>
                            {sess.notes ? (
                              <Tooltip title={sess.notes}>
                                <Typography sx={{ fontSize: '11px', color: '#334155', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {sess.notes}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '--'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Correct Session Time">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenCorrection(sess)}
                                sx={{ color: '#23A4E8' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                  No sessions recorded for this day.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography sx={{ color: '#64748B' }}>No session records available.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedUserDate(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Time Correction Modal */}
      <Dialog
        open={Boolean(editingSession)}
        onClose={() => setEditingSession(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Authorized Session Time Correction
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Alert severity="warning" sx={{ borderRadius: '10px', fontSize: '12px' }}>
            All corrections are immutably audited with your Administrator ID, timestamp, IP address, and mandatory audit reason.
          </Alert>

          <TextField
            fullWidth
            type="datetime-local"
            label="Session Start Time"
            InputLabelProps={{ shrink: true }}
            value={correctionForm.started_at}
            onChange={(e) => setCorrectionForm({ ...correctionForm, started_at: e.target.value })}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Session End Time"
            InputLabelProps={{ shrink: true }}
            value={correctionForm.ended_at}
            onChange={(e) => setCorrectionForm({ ...correctionForm, ended_at: e.target.value })}
          />

          <TextField
            fullWidth
            type="number"
            label="Duration (Minutes)"
            helperText="Leave empty to calculate automatically from Start and End time."
            value={correctionForm.duration_minutes}
            onChange={(e) => setCorrectionForm({ ...correctionForm, duration_minutes: e.target.value })}
          />

          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={2}
            value={correctionForm.notes}
            onChange={(e) => setCorrectionForm({ ...correctionForm, notes: e.target.value })}
          />

          <TextField
            fullWidth
            required
            label="Audit Reason for Correction"
            placeholder="e.g. Employee forgot to clock out; verified with manager via Slack"
            multiline
            rows={2}
            value={correctionForm.reason}
            onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
            helperText="Required by regulatory audit compliance (minimum 3 characters)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setEditingSession(null)}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCorrection}
            disabled={isSubmittingCorrection || !correctionForm.reason.trim()}
            sx={{
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              px: 3,
            }}
          >
            {isSubmittingCorrection ? 'Saving...' : 'Save Correction'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
