import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  CalendarMonthRounded as CalendarIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  BeachAccessRounded as BeachIcon,
  LocalHospitalRounded as HospitalIcon,
  EventAvailableRounded as EventIcon,
  SearchRounded as SearchIcon,
  FilterListRounded as FilterIcon,
  CheckCircleRounded as ApprovedIcon,
  ViewAgendaOutlined as GroupIcon,
  FormatListBulletedRounded as ListIcon,
  TodayRounded as TodayIcon
} from '@mui/icons-material';
import { useMyLeaves, useMyBalances } from '../../Api/Api';
import CustomTableLoader from '../../common/custom/CustomTableLoader';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function LeaveTracker() {
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 0-11
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'CL', 'SL'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'flat'

  // Fetch all my leaves for the selected year
  const { data: leavesData, isLoading: isLeavesLoading } = useMyLeaves({
    year: selectedYear,
    limit: 100
  });

  // Fetch current balances
  const { data: balanceData, isLoading: isBalanceLoading } = useMyBalances(selectedYear);
  const balances = balanceData?.balances || balanceData?.data?.balances;

  const rawLeaves = leavesData?.data || leavesData?.items || [];

  // Extract individual leave days from approved requests
  const individualLeaveDays = useMemo(() => {
    const days = [];

    rawLeaves.forEach((leave) => {
      // We track approved leaves that count as days taken
      if (leave.status !== 'approved') return;

      if (Array.isArray(leave.breakdown) && leave.breakdown.length > 0) {
        leave.breakdown.forEach((item) => {
          if (Number(item.weight) > 0) {
            const d = new Date(item.date);
            days.push({
              id: `${leave.id}-${item.date}`,
              leaveId: leave.id,
              date: item.date,
              dateObj: d,
              monthIndex: d.getMonth(),
              monthName: MONTH_NAMES[d.getMonth()],
              dayName: item.dayName || d.toLocaleString('default', { weekday: 'long' }),
              leaveType: leave.leave_type === 'casual_leave' || leave.leave_type === 'CL' ? 'CL' : 'SL',
              weight: Number(item.weight),
              reason: leave.reason,
              reviewerName: leave.reviewer ? `${leave.reviewer.first_name} ${leave.reviewer.last_name || ''}`.trim() : 'HR Administrator',
              reviewedAt: leave.reviewed_at ? new Date(leave.reviewed_at).toLocaleDateString() : null,
              reviewComment: leave.review_comment,
              fullPeriod: `${new Date(leave.start_date).toLocaleDateString()} → ${new Date(leave.end_date).toLocaleDateString()}`
            });
          }
        });
      } else {
        // Fallback for requests without individual breakdown stored
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const cur = new Date(start);

        while (cur <= end) {
          const dayOfWeek = cur.getDay();
          // Exclude Sundays (0)
          if (dayOfWeek !== 0) {
            const dateStr = cur.toISOString().split('T')[0];
            const d = new Date(cur);
            days.push({
              id: `${leave.id}-${dateStr}`,
              leaveId: leave.id,
              date: dateStr,
              dateObj: d,
              monthIndex: d.getMonth(),
              monthName: MONTH_NAMES[d.getMonth()],
              dayName: d.toLocaleString('default', { weekday: 'long' }),
              leaveType: leave.leave_type === 'casual_leave' || leave.leave_type === 'CL' ? 'CL' : 'SL',
              weight: Number(leave.total_days) <= 1 ? Number(leave.total_days) : 1.0,
              reason: leave.reason,
              reviewerName: leave.reviewer ? `${leave.reviewer.first_name} ${leave.reviewer.last_name || ''}`.trim() : 'HR Administrator',
              reviewedAt: leave.reviewed_at ? new Date(leave.reviewed_at).toLocaleDateString() : null,
              reviewComment: leave.review_comment,
              fullPeriod: `${new Date(leave.start_date).toLocaleDateString()} → ${new Date(leave.end_date).toLocaleDateString()}`
            });
          }
          cur.setDate(cur.getDate() + 1);
        }
      }
    });

    // Sort descending by date
    days.sort((a, b) => b.dateObj - a.dateObj);
    return days;
  }, [rawLeaves]);

  // Calculate monthly metrics for each month of the year (0-11)
  const monthlyStats = useMemo(() => {
    const stats = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MONTH_NAMES[i],
      monthShort: MONTH_SHORT[i],
      totalDays: 0,
      clDays: 0,
      slDays: 0,
      count: 0
    }));

    individualLeaveDays.forEach((day) => {
      const idx = day.monthIndex;
      if (idx >= 0 && idx < 12) {
        stats[idx].totalDays += day.weight;
        if (day.leaveType === 'CL') {
          stats[idx].clDays += day.weight;
        } else {
          stats[idx].slDays += day.weight;
        }
        stats[idx].count += 1;
      }
    });

    return stats;
  }, [individualLeaveDays]);

  // Overall totals for the selected year
  const totalDaysTaken = useMemo(() => {
    return individualLeaveDays.reduce((acc, curr) => acc + curr.weight, 0);
  }, [individualLeaveDays]);

  const totalClTaken = useMemo(() => {
    return individualLeaveDays.filter((d) => d.leaveType === 'CL').reduce((acc, curr) => acc + curr.weight, 0);
  }, [individualLeaveDays]);

  const totalSlTaken = useMemo(() => {
    return individualLeaveDays.filter((d) => d.leaveType === 'SL').reduce((acc, curr) => acc + curr.weight, 0);
  }, [individualLeaveDays]);

  // Filtered leave days based on month, type, and search
  const filteredDays = useMemo(() => {
    return individualLeaveDays.filter((item) => {
      if (selectedMonth !== 'all' && item.monthIndex !== Number(selectedMonth)) {
        return false;
      }
      if (selectedType !== 'all' && item.leaveType !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchReason = item.reason?.toLowerCase().includes(query);
        const matchDate = item.date.includes(query) || item.dayName.toLowerCase().includes(query);
        const matchReviewer = item.reviewerName?.toLowerCase().includes(query);
        if (!matchReason && !matchDate && !matchReviewer) return false;
      }
      return true;
    });
  }, [individualLeaveDays, selectedMonth, selectedType, searchQuery]);

  // Group filtered days by month
  const groupedByMonth = useMemo(() => {
    const map = new Map();

    filteredDays.forEach((day) => {
      const key = day.monthIndex;
      if (!map.has(key)) {
        map.set(key, {
          monthIndex: key,
          monthName: day.monthName,
          days: [],
          totalDays: 0,
          clDays: 0,
          slDays: 0
        });
      }
      const group = map.get(key);
      group.days.push(day);
      group.totalDays += day.weight;
      if (day.leaveType === 'CL') group.clDays += day.weight;
      else group.slDays += day.weight;
    });

    // Sort descending by month index
    return Array.from(map.values()).sort((a, b) => b.monthIndex - a.monthIndex);
  }, [filteredDays]);

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
          width: '100%'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Annual Leave Tracker
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Comprehensive day-by-day record of approved leaves taken across all months in {selectedYear}.
          </Typography>
        </Box>

        {/* Year Switcher */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<TodayIcon sx={{ fontSize: 16 }} />}
            onClick={() => setSelectedYear(currentYear)}
            disabled={selectedYear === currentYear}
            sx={{
              height: 38,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              borderColor: '#E2E8F0',
              bgcolor: '#FFFFFF',
              color: '#334155',
              '&:hover': { borderColor: '#23A4E8', bgcolor: '#F0F9FF', color: '#23A4E8' }
            }}
          >
            Current Year
          </Button>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              p: 0.35,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
            }}
          >
            <IconButton
              size="small"
              onClick={() => setSelectedYear((y) => y - 1)}
              sx={{ width: 32, height: 32, borderRadius: '8px', color: '#475569', '&:hover': { bgcolor: '#F1F5F9' } }}
            >
              <PrevIcon fontSize="small" />
            </IconButton>

            <Typography sx={{ fontWeight: 700, color: '#0F172A', minWidth: 70, textAlign: 'center', fontSize: '14px', px: 1 }}>
              {selectedYear}
            </Typography>

            <IconButton
              size="small"
              onClick={() => setSelectedYear((y) => y + 1)}
              sx={{ width: 32, height: 32, borderRadius: '8px', color: '#475569', '&:hover': { bgcolor: '#F1F5F9' } }}
            >
              <NextIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </Box>

      {/* Top Annual KPI Metric Cards (SmartOps-Pay Card Style) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2.2,
          width: '100%'
        }}
      >
        {/* Total Taken */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Taken ({selectedYear})
              </Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', mt: 0.5, lineHeight: 1.1 }}>
                {totalDaysTaken} <Typography component="span" sx={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>days</Typography>
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                color: '#23A4E8',
                border: '1px solid #DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarIcon sx={{ fontSize: 22 }} />
            </Box>
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
            Approved leave days utilized this year
          </Typography>
        </Card>

        {/* Casual Leaves Taken */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Casual Leave (CL) Taken
              </Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#0284C7', mt: 0.5, lineHeight: 1.1 }}>
                {totalClTaken} <Typography component="span" sx={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>days</Typography>
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#E0F2FE',
                color: '#0284C7',
                border: '1px solid #BAE6FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BeachIcon sx={{ fontSize: 22 }} />
            </Box>
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
            Available balance: <strong>{balances?.CL?.availableBalanceAfterPending ?? '—'} days</strong>
          </Typography>
        </Card>

        {/* Sick Leaves Taken */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sick Leave (SL) Taken
              </Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#059669', mt: 0.5, lineHeight: 1.1 }}>
                {totalSlTaken} <Typography component="span" sx={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>days</Typography>
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HospitalIcon sx={{ fontSize: 22 }} />
            </Box>
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
            Available balance: <strong>{balances?.SL?.availableBalanceAfterPending ?? '—'} days</strong>
          </Typography>
        </Card>

        {/* Current Month Active Indicator */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {MONTH_NAMES[currentMonthIndex]} (Current)
              </Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#7E22CE', mt: 0.5, lineHeight: 1.1 }}>
                {monthlyStats[currentMonthIndex]?.totalDays || 0} <Typography component="span" sx={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>days</Typography>
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#F3E8FF',
                color: '#7E22CE',
                border: '1px solid #E9D5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EventIcon sx={{ fontSize: 22 }} />
            </Box>
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
            {monthlyStats[currentMonthIndex]?.clDays || 0} CL &bull; {monthlyStats[currentMonthIndex]?.slDays || 0} SL
          </Typography>
        </Card>
      </Box>

      {/* Month Navigator Pills Bar (Jan - Dec) */}
      <Card
        sx={{
          borderRadius: '14px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          p: 1.25,
          overflowX: 'auto',
          width: '100%'
        }}
      >
        <Stack direction="row" spacing={1} sx={{ minWidth: 800 }}>
          <Button
            size="small"
            onClick={() => setSelectedMonth('all')}
            variant={selectedMonth === 'all' ? 'contained' : 'text'}
            sx={{
              borderRadius: '10px',
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13px',
              bgcolor: selectedMonth === 'all' ? '#23A4E8' : 'transparent',
              color: selectedMonth === 'all' ? '#FFFFFF' : '#475569',
              '&:hover': { bgcolor: selectedMonth === 'all' ? '#1D8BC4' : '#F1F5F9' },
              whiteSpace: 'nowrap'
            }}
          >
            All Months ({totalDaysTaken}d)
          </Button>

          {monthlyStats.map((m) => {
            const isSelected = selectedMonth === String(m.monthIndex);
            const isCurrentMonth = selectedYear === currentYear && m.monthIndex === currentMonthIndex;
            const hasLeaves = m.totalDays > 0;

            return (
              <Button
                key={m.monthIndex}
                size="small"
                onClick={() => setSelectedMonth(String(m.monthIndex))}
                variant={isSelected ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '10px',
                  px: 1.6,
                  py: 0.75,
                  textTransform: 'none',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 700 : isCurrentMonth ? 700 : 500,
                  bgcolor: isSelected ? '#0F172A' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : isCurrentMonth ? '#0284C7' : '#475569',
                  borderColor: isSelected ? '#0F172A' : isCurrentMonth ? '#BAE6FD' : '#E2E8F0',
                  boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                  '&:hover': {
                    bgcolor: isSelected ? '#1E293B' : '#F8FAFC',
                    borderColor: '#23A4E8'
                  },
                  whiteSpace: 'nowrap',
                  position: 'relative'
                }}
              >
                {m.monthShort}
                {isCurrentMonth && (
                  <span style={{ fontSize: '9px', fontWeight: 800, marginLeft: 3, color: isSelected ? '#38BDF8' : '#0284C7' }}>
                    *
                  </span>
                )}
                {hasLeaves && (
                  <Chip
                    size="small"
                    label={`${m.totalDays}d`}
                    sx={{
                      ml: 0.8,
                      height: 18,
                      fontSize: '10.5px',
                      fontWeight: 700,
                      borderRadius: '5px',
                      bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : '#EFF6FF',
                      color: isSelected ? '#FFFFFF' : '#0284C7'
                    }}
                  />
                )}
              </Button>
            );
          })}
        </Stack>
      </Card>

      {/* Filter and View Controls Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          width: '100%'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search by reason or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: 260 },
              '& .MuiOutlinedInput-root': {
                height: 40,
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                fontSize: '13px',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#23A4E8' },
                '&.Mui-focused fieldset': { borderColor: '#23A4E8' }
              }
            }}
          />

          {/* Leave Type Filter */}
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              sx={{
                height: 40,
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                fontSize: '13px',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#23A4E8' },
                '&.Mui-focused fieldset': { borderColor: '#23A4E8' }
              }}
            >
              <MenuItem value="all">All Leave Types</MenuItem>
              <MenuItem value="CL">Casual Leave (CL)</MenuItem>
              <MenuItem value="SL">Sick Leave (SL)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* View Mode Toggle: Grouped by Month vs Flat List */}
        <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#FFFFFF', p: 0.4, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <Button
            size="small"
            startIcon={<GroupIcon sx={{ fontSize: 16 }} />}
            onClick={() => setViewMode('grouped')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12.5px',
              px: 1.5,
              py: 0.5,
              bgcolor: viewMode === 'grouped' ? '#EFF6FF' : 'transparent',
              color: viewMode === 'grouped' ? '#23A4E8' : '#64748B',
              '&:hover': { bgcolor: viewMode === 'grouped' ? '#DBEAFE' : '#F8FAFC' }
            }}
          >
            Group by Month
          </Button>

          <Button
            size="small"
            startIcon={<ListIcon sx={{ fontSize: 16 }} />}
            onClick={() => setViewMode('flat')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12.5px',
              px: 1.5,
              py: 0.5,
              bgcolor: viewMode === 'flat' ? '#EFF6FF' : 'transparent',
              color: viewMode === 'flat' ? '#23A4E8' : '#64748B',
              '&:hover': { bgcolor: viewMode === 'flat' ? '#DBEAFE' : '#F8FAFC' }
            }}
          >
            All Days Log
          </Button>
        </Stack>
      </Box>

      {/* Main Content Area */}
      {isLeavesLoading ? (
        <Card sx={{ p: 2, borderRadius: '16px', border: '1px solid #EEF2F6' }}>
          <TableContainer>
            <Table>
              <TableBody>
                <CustomTableLoader rows={6} columns={6} />
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : filteredDays.length === 0 ? (
        <Card
          sx={{
            p: 6,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            bgcolor: '#FFFFFF',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#F1F5F9',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <EventIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
            No Leave Days Recorded
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 450 }}>
            {selectedMonth !== 'all'
              ? `You did not take any approved leave days during ${MONTH_NAMES[Number(selectedMonth)]} ${selectedYear}.`
              : `No approved leave records found for the year ${selectedYear}.`}
          </Typography>
          {selectedMonth !== 'all' && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedMonth('all')}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, mt: 1 }}
            >
              View All Months
            </Button>
          )}
        </Card>
      ) : viewMode === 'grouped' ? (
        /* Grouped by Month Cards */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {groupedByMonth.map((group) => (
            <Card
              key={group.monthIndex}
              sx={{
                borderRadius: '16px',
                border: '1px solid #EEF2F6',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                bgcolor: '#FFFFFF',
                overflow: 'hidden'
              }}
            >
              {/* Month Card Header */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.8,
                  bgcolor: '#F8FAFC',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {group.monthName} {selectedYear}
                  </Typography>
                  {selectedYear === currentYear && group.monthIndex === currentMonthIndex && (
                    <Chip label="Current Month" size="small" sx={{ height: 22, fontSize: '11px', fontWeight: 700, bgcolor: '#E0F2FE', color: '#0369A1' }} />
                  )}
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={`${group.totalDays} Total Day${group.totalDays === 1 ? '' : 's'}`}
                    sx={{ height: 24, fontWeight: 700, fontSize: '11.5px', bgcolor: '#0F172A', color: '#FFFFFF' }}
                  />
                  {group.clDays > 0 && (
                    <Chip
                      size="small"
                      label={`${group.clDays} CL`}
                      sx={{ height: 24, fontWeight: 700, fontSize: '11.5px', bgcolor: '#E0F2FE', color: '#0369A1' }}
                    />
                  )}
                  {group.slDays > 0 && (
                    <Chip
                      size="small"
                      label={`${group.slDays} SL`}
                      sx={{ height: 24, fontWeight: 700, fontSize: '11.5px', bgcolor: '#ECFDF5', color: '#047857' }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Table of Individual Days for this month */}
              <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#FFFFFF' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>DATE & DAY</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>LEAVE TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>DEDUCTION</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>REASON</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>APPLICATION PERIOD</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.days.map((day) => (
                      <TableRow key={day.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                            {new Date(day.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
                            {day.dayName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={day.leaveType === 'CL' ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}
                            sx={{
                              height: 24,
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              bgcolor: day.leaveType === 'CL' ? '#E0F2FE' : '#ECFDF5',
                              color: day.leaveType === 'CL' ? '#0369A1' : '#047857'
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                            {day.weight} {day.weight === 1 ? 'day' : 'days'}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 320 }}>
                          <Typography sx={{ color: '#334155', fontSize: '13px' }} noWrap>
                            {day.reason}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
                            {day.fullPeriod}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Chip
                            size="small"
                            icon={<ApprovedIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
                            label="Approved"
                            sx={{
                              height: 24,
                              bgcolor: '#ECFDF5',
                              color: '#059669',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              borderRadius: '6px'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </Box>
      ) : (
        /* Flat List Table View */
        <Card
          sx={{
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
            bgcolor: '#FFFFFF',
            overflow: 'hidden'
          }}
        >
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>MONTH</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>DEDUCTION</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>REASON</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>APPLICATION PERIOD</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.8 }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDays.map((day) => (
                  <TableRow key={day.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                        {new Date(day.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
                        {day.dayName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={day.monthName}
                        sx={{ height: 22, fontSize: '11.5px', fontWeight: 600, bgcolor: '#F1F5F9', color: '#334155' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={day.leaveType === 'CL' ? 'Casual (CL)' : 'Sick (SL)'}
                        sx={{
                          height: 24,
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          bgcolor: day.leaveType === 'CL' ? '#E0F2FE' : '#ECFDF5',
                          color: day.leaveType === 'CL' ? '#0369A1' : '#047857'
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                        {day.weight}d
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography sx={{ color: '#334155', fontSize: '13px' }} noWrap>
                        {day.reason}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
                        {day.fullPeriod}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        size="small"
                        icon={<ApprovedIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
                        label="Approved"
                        sx={{
                          height: 24,
                          bgcolor: '#ECFDF5',
                          color: '#059669',
                          fontWeight: 700,
                          fontSize: '11.5px',
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
