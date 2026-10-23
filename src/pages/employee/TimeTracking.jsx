import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Button,
  Avatar,
} from '@mui/material';
import {
  AccessTimeFilled as ClockIcon,
  TimerOutlined as TimerIcon,
  CalendarMonthOutlined as CalendarIcon,
  FilterAltOutlined as FilterIcon,
  VisibilityOutlined as ViewIcon,
  CheckCircleOutlineRounded as CompleteIcon,
  HourglassEmptyRounded as IncompleteIcon,
  RestartAltRounded as ResetIcon,
  InfoOutlined as InfoIcon,
  FiberManualRecord as StatusDotIcon,
  PauseCircleOutlineRounded as PausedIcon,
  PlayCircleFilledRounded as RunningIcon,
  CameraAltRounded as CameraIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  useTodayTimeSummary,
  useMyTimeHistory,
  useEmployeeDateSessions,
  useStartWorkSession,
  useStopWorkSession,
} from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import CustomPagination from '../../common/custom/CustomPagination';
import DailySelfieGallery, { getSelfieUrl } from '../../components/timeTracking/DailySelfieGallery';
import SelfieCaptureModal from '../../components/timeTracking/SelfieCaptureModal';

// Formats total seconds to digital clock display (HH:MM:SS)
const formatSecondsToHMS = (totalSeconds = 0) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Formats total seconds to human-readable string (e.g. 2h 15m 30s)
const formatSecondsHuman = (totalSeconds = 0) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

// Formats minutes to hours (e.g. 8h 00m)
const formatMinutesToHours = (totalMinutes = 0) => {
  const m = Math.max(0, Math.round(totalMinutes));
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

// Formats timestamp to time-only string with seconds (e.g. 09:30:15 AM)
const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Formats date string to friendly readable format
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

export default function TimeTracking() {
  // Query today's live summary with polling
  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useTodayTimeSummary(5000);

  // Workday end timestamp calculation (IST: defaults to 24:00 / 12:00 AM Midnight)
  const workdayEndMs = useMemo(() => {
    if (summary?.workday_end_time) {
      return new Date(summary.workday_end_time).getTime();
    }
    if (summary?.today_date) {
      const [y, m, d] = summary.today_date.split('-').map(Number);
      // Midnight IST is 24:00 (1440 min - 330 = 1110 min = 18:30 UTC)
      return Date.UTC(y, m - 1, d, 0, 0, 0, 0) + (24 * 60 - 330) * 60000;
    }
    return Infinity;
  }, [summary?.today_date, summary?.workday_end_time]);

  // Exact completed seconds from all completed/closed sessions today
  const completedSecondsToday = useMemo(() => {
    if (!summary?.sessions) return summary?.recorded_seconds || 0;
    return summary.sessions
      .filter((s) => s.status !== 'active')
      .reduce((acc, s) => {
        if (s.duration_seconds !== null && s.duration_seconds !== undefined) {
          return acc + s.duration_seconds;
        }
        if (s.ended_at && s.started_at) {
          return acc + Math.max(0, Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000));
        }
        return acc + ((s.duration_minutes || 0) * 60);
      }, 0);
  }, [summary?.sessions, summary?.recorded_seconds]);

  // Live timer for current active session
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (summary?.active_session?.started_at) {
      const startTime = new Date(summary.active_session.started_at).getTime();
      const updateTimer = () => {
        const now = Date.now();
        const effectiveNow = Math.min(now, workdayEndMs);
        const diffSecs = Math.max(0, Math.floor((effectiveNow - startTime) / 1000));
        setCurrentSessionSeconds(diffSecs);

        if (now >= workdayEndMs && summary?.is_tracking_active) {
          refetchSummary();
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setCurrentSessionSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [summary?.active_session?.started_at, workdayEndMs, summary?.is_tracking_active, refetchSummary]);

  // Target seconds (default 8 hours = 28,800 seconds)
  const targetSeconds = (summary?.target_minutes ?? 480) * 60;

  // Exact live cumulative total worked seconds today (completed sessions + active session)
  const totalWorkedSeconds = completedSecondsToday + currentSessionSeconds;

  // Exact remaining seconds left to reach 8-hour target (never below 0)
  const remainingTargetSeconds = Math.max(0, targetSeconds - totalWorkedSeconds);

  // Overtime seconds beyond the target
  const overtimeSeconds = Math.max(0, totalWorkedSeconds - targetSeconds);

  // Target progress percentage (capped visually at 100%)
  const progressPercent =
    targetSeconds > 0
      ? Math.min(100, Math.round((totalWorkedSeconds / targetSeconds) * 100))
      : (totalWorkedSeconds > 0 ? 100 : 0);

  const isCompleted = targetSeconds > 0 ? totalWorkedSeconds >= targetSeconds : totalWorkedSeconds > 0;
  const isTrackingActive = Boolean(summary?.is_tracking_active);

  // Live Work Tracking Selfie Verification Modal & Mutations
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [selfieModalMode, setSelfieModalMode] = useState('start'); // 'start' | 'stop'

  const { mutate: startWorkMutate, isPending: isStarting } = useStartWorkSession(
    () => {
      toast.success('Selfie verified! Status changed to Active & timer started.');
      setSelfieModalOpen(false);
      refetchSummary();
    },
    (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to start session.';
      toast.error(msg);
    }
  );

  const { mutate: stopWorkMutate, isPending: isStopping } = useStopWorkSession(
    () => {
      toast.success('Selfie & reason verified! Status changed to Inactive & session stopped.');
      setSelfieModalOpen(false);
      refetchSummary();
    },
    (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to stop session.';
      toast.error(msg);
    }
  );

  const handleInitiateActive = () => {
    setSelfieModalMode('start');
    setSelfieModalOpen(true);
  };

  const handleInitiateInactive = () => {
    setSelfieModalMode('stop');
    setSelfieModalOpen(true);
  };

  const handleSelfieSubmit = ({ selfie, reason }) => {
    if (selfieModalMode === 'start') {
      startWorkMutate({ selfie });
    } else {
      stopWorkMutate({ reason, selfie });
    }
  };

  // Personal History State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const historyParams = useMemo(() => {
    const p = { page, limit };
    if (startDateFilter) p.start_date = startDateFilter;
    if (endDateFilter) p.end_date = endDateFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [page, limit, startDateFilter, endDateFilter, statusFilter]);

  const { data: historyData, isLoading: isHistoryLoading } = useMyTimeHistory(historyParams);
  const historyRecords = historyData?.data || [];
  const historyPagination = historyData?.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 };

  // Drilldown dialog state
  const [drillDownDate, setDrillDownDate] = useState(null);
  const userId = summary?.daily_record?.user_id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const { data: drillDownData, isLoading: isDrillDownLoading } = useEmployeeDateSessions(
    userId,
    drillDownDate
  );

  const handleResetFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    setStatusFilter('');
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
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Employee Time Tracking
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Live daily working progress, session records, and historical time monitoring.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<ClockIcon sx={{ fontSize: '16px !important' }} />}
            label="Workday End: 12:00 AM (Midnight)"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 600,
              fontSize: '12px',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
            }}
          />
          <StatusBadge
            status={isTrackingActive ? 'tracking_active' : 'tracking_inactive'}
            customLabel={isTrackingActive ? 'Session Running (Active)' : 'Tracking Paused (Inactive)'}
          />
        </Stack>
      </Box>

      {/* 8-Hour Goal, 7 PM Notification, and Status Change Guideline Alert Banner */}
      <Alert
        severity="info"
        icon={<InfoIcon sx={{ color: '#0284C7' }} />}
        sx={{
          borderRadius: '12px',
          bgcolor: '#F0F9FF',
          color: '#0369A1',
          border: '1px solid #BAE6FD',
          fontSize: '13px',
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: '13px', color: '#0369A1' }}>
            <strong>Workday Policy:</strong> Daily 8-hour target must be completed by <strong>12:00 AM (Midnight)</strong>. Daily progress alert notification is sent at <strong>7:00 PM</strong>.
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#0284C7' }}>
            💡 <strong>Status-Linked Tracking:</strong> Work sessions start automatically when your status is changed to <strong>Active</strong>, and stop when changed to <strong>Inactive</strong> via the <strong>Profile Menu</strong> (top-right avatar) or using the action button below.
          </Typography>
        </Box>
      </Alert>

      {/* Hero Overview: Live Working Timers & Today's Sessions Cards */}
      <Grid container spacing={3}>
        {/* Left Card: Circular Progress, Hero Digital Clock & Action Button */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'center' },
                gap: { xs: 3, sm: 3.5 },
                my: 'auto',
              }}
            >
              {/* Circular Progress Gauge */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {/* Background Ring Track */}
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={4.5}
                  sx={{ color: '#EEF2F6' }}
                />
                {/* Active Progress Stroke */}
                <CircularProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, progressPercent))}
                  size={120}
                  thickness={4.5}
                  sx={{
                    color: isCompleted ? '#10B981' : '#2563EB',
                    position: 'absolute',
                    left: 0,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                {/* Centered Percentage Label */}
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#0F172A',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {progressPercent}%
                  </Typography>
                </Box>
              </Box>

              {/* Hero Clock, Status Pill, Target, and Action Button */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  textAlign: { xs: 'center', sm: 'left' },
                  flex: 1,
                }}
              >
                {/* Header: WORKED TODAY + Status Pill */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748B',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Worked Today
                  </Typography>
                  <Chip
                    size="small"
                    icon={
                      <StatusDotIcon
                        sx={{
                          fontSize: '8px !important',
                          color: isTrackingActive ? '#10B981 !important' : '#D97706 !important',
                        }}
                      />
                    }
                    label={isTrackingActive ? 'Active' : 'Paused'}
                    sx={{
                      bgcolor: isTrackingActive ? '#ECFDF5' : '#FEF3C7',
                      color: isTrackingActive ? '#059669' : '#B45309',
                      fontWeight: 700,
                      fontSize: '11px',
                      height: 22,
                      borderRadius: '12px',
                      border: `1px solid ${isTrackingActive ? '#A7F3D0' : '#FDE68A'}`,
                      '& .MuiChip-label': { px: 0.8 },
                    }}
                  />
                </Box>

                {/* Digital Clock Display */}
                <Typography
                  sx={{
                    fontFamily: 'monospace, sans-serif',
                    fontSize: { xs: '32px', sm: '38px', md: '42px' },
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    my: 0.5,
                  }}
                >
                  {formatSecondsToHMS(totalWorkedSeconds)}
                </Typography>

                {/* Target Subtext */}
                <Typography sx={{ fontSize: '13px', color: '#64748B', fontWeight: 500, mb: 2 }}>
                  Target {formatMinutesToHours(summary?.target_minutes ?? 480)}
                </Typography>

                {/* Dark Pill Action Button */}
                <Button
                  variant="contained"
                  onClick={isTrackingActive ? handleInitiateInactive : handleInitiateActive}
                  startIcon={isTrackingActive ? <PausedIcon sx={{ fontSize: 18 }} /> : <RunningIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '10px',
                    px: 2.2,
                    py: 0.9,
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                    '&:hover': {
                      bgcolor: '#1E293B',
                    },
                  }}
                >
                  {isTrackingActive ? 'Go Inactive and pause' : 'Go Active and resume'}
                </Button>
              </Box>
            </Box>

            {/* Subtle Workday Closing Note */}
            <Typography
              sx={{
                fontSize: '11px',
                color: '#94A3B8',
                textAlign: { xs: 'center', sm: 'left' },
                mt: 2.5,
                pt: 1.5,
                borderTop: '1px solid #F8FAFC',
              }}
            >
              Open work sessions close automatically at 12:00 AM (Midnight) IST
            </Typography>
          </Card>
        </Grid>

        {/* Right Card: Metrics Breakdown & Today's Sessions Record */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
            }}
          >
            <Box>
              {/* Top 3 Stat Metric Tiles */}
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {/* Tile 1: Target */}
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      Target
                    </Typography>
                    <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                      {formatMinutesToHours(summary?.target_minutes ?? 480)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Tile 2: Recorded */}
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>
                      Recorded
                    </Typography>
                    <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0284C7', mt: 0.5 }}>
                      {formatSecondsHuman(totalWorkedSeconds)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Tile 3: Remaining / Overtime */}
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: isCompleted ? '#ECFDF5' : '#FFFBEB',
                      border: `1px solid ${isCompleted ? '#A7F3D0' : '#FEF3C7'}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: isCompleted ? '#059669' : '#B45309',
                        fontWeight: 600,
                      }}
                    >
                      {isCompleted ? 'Overtime' : 'Remaining'}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: isCompleted ? '#047857' : '#B45309',
                        mt: 0.5,
                      }}
                    >
                      {isCompleted ? `+${formatSecondsHuman(overtimeSeconds)}` : formatSecondsHuman(remainingTargetSeconds)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Today's Recorded Sessions List */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
                  Today's sessions ({summary?.sessions?.length || 0})
                </Typography>

                {summary?.sessions && summary.sessions.length > 0 ? (
                  <Stack spacing={1} sx={{ maxHeight: 180, overflowY: 'auto', pr: 0.5 }}>
                    {summary.sessions.map((sess, idx) => {
                      const durSecs =
                        sess.duration_seconds !== null && sess.duration_seconds !== undefined
                          ? sess.duration_seconds
                          : (sess.status === 'active'
                              ? currentSessionSeconds
                              : sess.ended_at && sess.started_at
                                ? Math.max(0, Math.round((new Date(sess.ended_at) - new Date(sess.started_at)) / 1000))
                                : (sess.duration_minutes || 0) * 60);

                      return (
                        <Box
                          key={sess.id || idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            py: 1,
                            borderRadius: '10px',
                            bgcolor: sess.status === 'active' ? '#F0FDF4' : '#F8FAFC',
                            border: `1px solid ${sess.status === 'active' ? '#BBF7D0' : '#F1F5F9'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                              #{idx + 1}
                            </Typography>
                            {sess.start_selfie_url && (
                              <Tooltip title="Clock-In selfie verified">
                                <Avatar
                                  src={getSelfieUrl(sess.start_selfie_url)}
                                  imgProps={{
                                    crossOrigin: 'anonymous',
                                    onError: (e) => {
                                      const currentSrc = e.currentTarget.src;
                                      if (!currentSrc.includes('staffease-be.onrender.com') && sess.start_selfie_url) {
                                        const cleanPath = sess.start_selfie_url.replace(/^\/?/, '/');
                                        e.currentTarget.src = `https://staffease-be.onrender.com${cleanPath}`;
                                      }
                                    },
                                  }}
                                  sx={{ width: 22, height: 22, border: '1.5px solid #10B981' }}
                                />
                              </Tooltip>
                            )}
                            {sess.end_selfie_url && (
                              <Tooltip title={`Clock-Out selfie verified: ${sess.notes || 'Paused'}`}>
                                <Avatar
                                  src={getSelfieUrl(sess.end_selfie_url)}
                                  imgProps={{
                                    crossOrigin: 'anonymous',
                                    onError: (e) => {
                                      const currentSrc = e.currentTarget.src;
                                      if (!currentSrc.includes('staffease-be.onrender.com') && sess.end_selfie_url) {
                                        const cleanPath = sess.end_selfie_url.replace(/^\/?/, '/');
                                        e.currentTarget.src = `https://staffease-be.onrender.com${cleanPath}`;
                                      }
                                    },
                                  }}
                                  sx={{ width: 22, height: 22, border: '1.5px solid #EF4444' }}
                                />
                              </Tooltip>
                            )}
                            <Typography sx={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                              {formatTimeOnly(sess.started_at)} → {sess.ended_at ? formatTimeOnly(sess.ended_at) : 'Active'}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                              {formatSecondsHuman(durSecs)}
                            </Typography>
                            <Chip
                              size="small"
                              label={sess.status === 'active' ? 'Active' : 'Completed'}
                              sx={{
                                height: 22,
                                fontSize: '11px',
                                fontWeight: 600,
                                borderRadius: '12px',
                                bgcolor: sess.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                                color: sess.status === 'active' ? '#059669' : '#475569',
                                border: `1px solid ${sess.status === 'active' ? '#A7F3D0' : '#E2E8F0'}`,
                              }}
                            />
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                      No work sessions recorded yet today.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Historical Time Records Table Card */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Table Filters with Non-Overlapping Date Inputs */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
              My Time History
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
              Filter by date and status to inspect past daily performance.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {/* From Date Filter with dedicated external label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                From:
              </Typography>
              <TextField
                size="small"
                type="date"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDateFilter(e.target.value);
                  setPage(1);
                }}
                inputProps={{ 'aria-label': 'From date' }}
                sx={{
                  width: { xs: '100%', sm: 150 },
                  bgcolor: '#FFFFFF',
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
            </Box>

            {/* To Date Filter with dedicated external label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                To:
              </Typography>
              <TextField
                size="small"
                type="date"
                value={endDateFilter}
                onChange={(e) => {
                  setEndDateFilter(e.target.value);
                  setPage(1);
                }}
                inputProps={{ 'aria-label': 'To date' }}
                sx={{
                  width: { xs: '100%', sm: 150 },
                  bgcolor: '#FFFFFF',
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
            </Box>

            {/* Status Select */}
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="complete">Complete (8h)</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
                <MenuItem value="non_working">Non-Working</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </Select>
            </FormControl>

            {(startDateFilter || endDateFilter || statusFilter) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ResetIcon />}
                onClick={handleResetFilters}
                sx={{ textTransform: 'none', color: '#64748B', borderColor: '#CBD5E1', height: 40 }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </Box>

        {/* Table Content */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>TARGET</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>ACTUAL WORKED</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>PROGRESS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>SESSIONS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isHistoryLoading ? (
                <CustomTableLoader rows={5} columns={7} />
              ) : historyRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
                    No time records found for the selected range.
                  </TableCell>
                </TableRow>
              ) : (
                historyRecords.map((record) => {
                  const target = record.target_minutes ?? 480;
                  const actual = record.actual_minutes || 0;
                  const actualSecs = record.actual_seconds ?? (record.actual_minutes ? record.actual_minutes * 60 : 0);
                  const targetSecs = target * 60;
                  const pct =
                    targetSecs > 0
                      ? Math.min(100, Math.round((actualSecs / targetSecs) * 100))
                      : (actualSecs > 0 ? 100 : 0);
                  return (
                    <TableRow key={record.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {formatDateReadable(record.work_date)}
                      </TableCell>
                      <TableCell sx={{ color: '#475569' }}>
                        {formatMinutesToHours(target)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: actualSecs >= targetSecs ? '#059669' : '#0F172A', fontFamily: 'monospace' }}>
                        {formatSecondsHuman(actualSecs)}
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              flexGrow: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#F1F5F9',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: actualSecs >= targetSecs ? '#10B981' : '#23A4E8',
                              },
                            }}
                          />
                          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#64748B', width: 32 }}>
                            {pct}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${record.sessions?.length || 0} session(s)`}
                          sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '11px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Session Drill-Down">
                          <IconButton
                            size="small"
                            onClick={() => setDrillDownDate(record.work_date)}
                            sx={{ color: '#23A4E8' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
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
          pagination={historyPagination}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* Drill-down Dialog */}
      <Dialog
        open={Boolean(drillDownDate)}
        onClose={() => setDrillDownDate(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Session Details — {formatDateReadable(drillDownDate)}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          {isDrillDownLoading ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#64748B' }}>Loading sessions...</Typography>
            </Box>
          ) : drillDownData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                  Target: <strong>{formatMinutesToHours(drillDownData.target_minutes)}</strong>
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                  Total Worked: <strong style={{ color: '#059669' }}>{formatMinutesToHours(drillDownData.actual_minutes)}</strong>
                </Typography>
                <StatusBadge status={drillDownData.status} />
              </Box>

              <Divider />

              {/* Daily Verification Selfies Gallery */}
              <DailySelfieGallery
                sessions={drillDownData.sessions || []}
                employeeName={`${drillDownData.user?.first_name || ''} ${drillDownData.user?.last_name || ''}`}
                employeeId={drillDownData.user?.employee_id || ''}
                workDate={formatDateReadable(drillDownDate)}
              />

              <Divider sx={{ my: 0.5 }} />

              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Work Sessions ({drillDownData.sessions?.length || 0})
              </Typography>

              {drillDownData.sessions && drillDownData.sessions.length > 0 ? (
                <Stack spacing={1.5}>
                  {drillDownData.sessions.map((session, idx) => {
                    const durSecs = session.duration_seconds !== null && session.duration_seconds !== undefined
                      ? session.duration_seconds
                      : (session.ended_at && session.started_at
                          ? Math.max(0, Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 1000))
                          : (session.duration_minutes || 0) * 60);

                    return (
                      <Box
                        key={session.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          bgcolor: '#F8FAFC',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                            Session #{idx + 1}
                          </Typography>
                          <StatusBadge status={session.status} size="small" />
                        </Box>
                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                          Time: {formatTimeOnly(session.started_at)} → {session.ended_at ? formatTimeOnly(session.ended_at) : 'Active'}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                          Duration: <strong>{formatSecondsHuman(durSecs)}</strong> ({formatMinutesToHours(session.duration_minutes)})
                        </Typography>
                        {session.closure_reason && (
                          <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.5 }}>
                            Closure: {session.closure_reason === 'auto' ? 'Auto-closed at workday end' : session.closure_reason}
                          </Typography>
                        )}
                        {session.notes && (
                          <Typography sx={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', mt: 0.5 }}>
                            Reason / Note: {session.notes}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>
                  No sessions recorded for this day.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography sx={{ color: '#64748B' }}>No session data found.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDrillDownDate(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Selfie Verification Modal for Clock-In & Clock-Out */}
      <SelfieCaptureModal
        open={selfieModalOpen}
        onClose={() => setSelfieModalOpen(false)}
        onSubmit={handleSelfieSubmit}
        mode={selfieModalMode}
        isLoading={isStarting || isStopping}
      />
    </Box>
  );
}
