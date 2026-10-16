import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Today as TodayIcon,
  EventAvailable as HolidayIcon
} from '@mui/icons-material';
import { useCalendarEvents } from '../../Api/Api';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LeaveCalendarAdmin() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: eventsData, isLoading } = useCalendarEvents(startDate, endDate);
  const calendarData = eventsData?.data || { holidays: [], leaves: [] };

  const holidays = calendarData.holidays || [];
  const leaves = calendarData.leaves || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar cell generation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Blank days before first day
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ blank: true, key: `blank-${i}` });
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay();

    const isHoliday = holidays.find((h) => h.holiday_date === dateStr);
    const dayLeaves = leaves.filter((l) => {
      const s = l.start_date.split('T')[0];
      const e = l.end_date.split('T')[0];
      return dateStr >= s && dateStr <= e;
    });

    const isSaturday = dayOfWeek === 6;
    const ordinalSat = isSaturday ? Math.ceil(d / 7) : 0;
    const isOffSaturday = isSaturday && [1, 3, 5].includes(ordinalSat);
    const isHalfSaturday = isSaturday && [2, 4].includes(ordinalSat);

    calendarDays.push({
      day: d,
      dateStr,
      dateObj,
      dayOfWeek,
      isHoliday,
      dayLeaves,
      isOffSaturday,
      isHalfSaturday,
      isSunday: dayOfWeek === 0,
      isToday: new Date().toDateString() === dateObj.toDateString()
    });
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

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
            Company Leave & Holiday Calendar
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Master schedule of employee absences, half-day Saturdays, and official holidays.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={handleToday}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#E2E8F0',
              color: '#334155'
            }}
          >
            Today
          </Button>
          <IconButton onClick={handlePrevMonth} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <PrevIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', minWidth: 160, textAlign: 'center' }}>
            {monthName}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <NextIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Legend */}
      <Card
        sx={{
          p: 1.75,
          borderRadius: '12px',
          border: '1px solid #EEF2F6',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center'
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>LEGEND:</Typography>
        <Chip size="small" label="Company Holiday" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600 }} />
        <Chip size="small" label="Casual Leave (CL)" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }} />
        <Chip size="small" label="Sick Leave (SL)" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 600 }} />
        <Chip size="small" label="2nd & 4th Sat (Half-day 0.5d)" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
        <Chip size="small" label="1st, 3rd, 5th Sat & Sun (OFF)" sx={{ bgcolor: '#F8FAFC', color: '#94A3B8', fontWeight: 600 }} />
      </Card>

      {/* Calendar Grid */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Days of week header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            textAlign: 'center',
            py: 1.5
          }}
        >
          {DAYS_OF_WEEK.map((d) => (
            <Typography key={d} variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
              {d}
            </Typography>
          ))}
        </Box>

        {/* Calendar Day Cells */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            minHeight: 520
          }}
        >
          {calendarDays.map((cell, idx) => {
            if (cell.blank) {
              return (
                <Box
                  key={cell.key}
                  sx={{
                    bgcolor: '#FAFCFE',
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid #F1F5F9' : 'none',
                    borderBottom: '1px solid #F1F5F9'
                  }}
                />
              );
            }

            return (
              <Box
                key={cell.dateStr}
                sx={{
                  p: 1,
                  minHeight: 90,
                  bgcolor: cell.isToday
                    ? '#F0F9FF'
                    : cell.isSunday || cell.isOffSaturday
                    ? '#FAFCFE'
                    : '#FFFFFF',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid #F1F5F9' : 'none',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                {/* Day Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: cell.isToday ? 800 : 700,
                      color: cell.isToday ? '#23A4E8' : cell.isSunday ? '#EF4444' : '#1E293B',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: cell.isToday ? '#E0F2FE' : 'transparent'
                    }}
                  >
                    {cell.day}
                  </Typography>

                  {cell.isOffSaturday && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', fontWeight: 600 }}>
                      Sat OFF
                    </Typography>
                  )}
                  {cell.isHalfSaturday && (
                    <Typography variant="caption" sx={{ color: '#0284C7', fontSize: '0.65rem', fontWeight: 600 }}>
                      Half Sat
                    </Typography>
                  )}
                </Box>

                {/* Holiday Badge */}
                {cell.isHoliday && (
                  <Tooltip title={cell.isHoliday.description || cell.isHoliday.name}>
                    <Box
                      sx={{
                        p: 0.5,
                        borderRadius: '6px',
                        bgcolor: '#FEF3C7',
                        color: '#B45309',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      ★ {cell.isHoliday.name}
                    </Box>
                  </Tooltip>
                )}

                {/* Leaves list for this date */}
                {cell.dayLeaves.map((l) => (
                  <Tooltip
                    key={l.id}
                    title={`${l.employee?.first_name} ${l.employee?.last_name} (${l.leave_type === 'casual_leave' ? 'CL' : 'SL'})`}
                  >
                    <Box
                      sx={{
                        p: 0.5,
                        borderRadius: '6px',
                        bgcolor: l.leave_type === 'casual_leave' ? '#E0F2FE' : '#ECFDF5',
                        color: l.leave_type === 'casual_leave' ? '#0369A1' : '#047857',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {l.employee?.first_name} ({l.leave_type === 'casual_leave' ? 'CL' : 'SL'})
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            );
          })}
        </Box>
      </Card>
    </Box>
  );
}
