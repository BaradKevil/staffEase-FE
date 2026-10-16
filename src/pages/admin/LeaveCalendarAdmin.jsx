import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  CalendarToday as TodayIcon,
  AddRounded as AddIcon,
  EventAvailable as HolidayIcon
} from '@mui/icons-material';
import { useCalendarEvents } from '../../Api/Api';
import AddHolidayModal from '../../components/calendar/AddHolidayModal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LeaveCalendarAdmin() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addHolidayOpen, setAddHolidayOpen] = useState(false);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: eventsData, isLoading, refetch } = useCalendarEvents(startDate, endDate);
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

  const rowCount = Math.ceil(calendarDays.length / 7) || 5;
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: 'calc(100vh - 116px)' },
        maxHeight: { xs: 'none', md: 'calc(100vh - 116px)' },
        width: '100%',
        overflow: { xs: 'auto', md: 'hidden' },
        gap: 1.5
      }}
    >
      {/* Top Header & Integrated Action Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          width: '100%',
          flexShrink: 0
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', fontSize: { xs: '18px', sm: '21px' } }}>
            Company Leave & Holiday Calendar
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: { xs: '12px', sm: '13px' } }}>
            Master schedule of employee absences, half-day Saturdays, and official holidays.
          </Typography>
        </Box>

        {/* Polished Controls: Today + Month Selector Pill + Add Holiday Button */}
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {/* Today Button */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<TodayIcon sx={{ fontSize: 16 }} />}
            onClick={handleToday}
            sx={{
              height: 38,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              borderColor: '#E2E8F0',
              bgcolor: '#FFFFFF',
              color: '#334155',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              '&:hover': { borderColor: '#23A4E8', color: '#23A4E8', bgcolor: '#F0F9FF' }
            }}
          >
            Today
          </Button>

          {/* Integrated Month Selector Pill */}
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
              onClick={handlePrevMonth}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                color: '#475569',
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
              }}
            >
              <PrevIcon fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 700,
                color: '#0F172A',
                minWidth: 140,
                textAlign: 'center',
                fontSize: '14px',
                userSelect: 'none',
                px: 1
              }}
            >
              {monthName}
            </Typography>

            <IconButton
              onClick={handleNextMonth}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                color: '#475569',
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
              }}
            >
              <NextIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* + Add Holiday Action Button (Admin only) */}
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddHolidayOpen(true)}
              sx={{
                height: 38,
                bgcolor: '#23A4E8',
                '&:hover': { bgcolor: '#1D8BC4' },
                borderRadius: '10px',
                px: 2,
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(35, 164, 232, 0.22)',
                whiteSpace: 'nowrap'
              }}
            >
              Add Holiday
            </Button>
          )}
        </Stack>
      </Box>

      {/* Legend Bar */}
      <Box
        sx={{
          py: 0.8,
          px: 1.8,
          borderRadius: '10px',
          border: '1px solid #EEF2F6',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 0.8, sm: 1.5 },
          alignItems: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '11px', letterSpacing: '0.04em' }}>
          LEGEND:
        </Typography>
        <Chip size="small" label="Company Holiday" sx={{ height: 22, bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '11px', borderRadius: '6px' }} />
        <Chip size="small" label="Casual Leave (CL)" sx={{ height: 22, bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600, fontSize: '11px', borderRadius: '6px' }} />
        <Chip size="small" label="Sick Leave (SL)" sx={{ height: 22, bgcolor: '#ECFDF5', color: '#047857', fontWeight: 600, fontSize: '11px', borderRadius: '6px' }} />
        <Chip size="small" label="2nd & 4th Sat (Half-day 0.5d)" sx={{ height: 22, bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '11px', borderRadius: '6px' }} />
        <Chip size="small" label="1st, 3rd, 5th Sat & Sun (OFF)" sx={{ height: 22, bgcolor: '#F8FAFC', color: '#94A3B8', fontWeight: 600, fontSize: '11px', borderRadius: '6px' }} />
      </Box>

      {/* Calendar Grid Card - Fits perfectly in remaining viewport height */}
      <Card
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: '14px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          overflow: { xs: 'auto', md: 'hidden' },
          width: '100%'
        }}
      >
        <Box
          sx={{
            minWidth: { xs: 700, md: '100%' },
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
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
              py: 0.8,
              flexShrink: 0
            }}
          >
            {DAYS_OF_WEEK.map((d) => (
              <Typography
                key={d}
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: d === 'Sun' ? '#EF4444' : '#475569',
                  fontSize: '11.5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {d}
              </Typography>
            ))}
          </Box>

          {/* Calendar Day Cells */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: `repeat(${rowCount}, 1fr)`,
              flex: 1,
              minHeight: 0,
              height: '100%',
              overflow: 'hidden'
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
                      borderBottom: idx < (rowCount - 1) * 7 ? '1px solid #F1F5F9' : 'none'
                    }}
                  />
                );
              }

              return (
                <Box
                  key={cell.dateStr}
                  sx={{
                    p: 0.7,
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    boxSizing: 'border-box',
                    bgcolor: cell.isToday
                      ? '#F0F9FF'
                      : cell.isSunday || cell.isOffSaturday
                      ? '#FAFCFE'
                      : '#FFFFFF',
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid #F1F5F9' : 'none',
                    borderBottom: idx < (rowCount - 1) * 7 ? '1px solid #F1F5F9' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.35,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: '3px' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '3px' }
                  }}
                >
                  {/* Day Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                    <Typography
                      sx={{
                        fontWeight: cell.isToday ? 800 : 700,
                        color: cell.isToday ? '#0284C7' : cell.isSunday ? '#EF4444' : '#1E293B',
                        fontSize: '12px',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: cell.isToday ? '#BAE6FD' : 'transparent',
                        lineHeight: 1
                      }}
                    >
                      {cell.day}
                    </Typography>

                    {cell.isOffSaturday && (
                      <Typography sx={{ color: '#94A3B8', fontSize: '10px', fontWeight: 600 }}>
                        Sat OFF
                      </Typography>
                    )}
                    {cell.isHalfSaturday && (
                      <Typography sx={{ color: '#0284C7', fontSize: '10px', fontWeight: 600 }}>
                        Half Sat
                      </Typography>
                    )}
                  </Box>

                  {/* Holiday Badge */}
                  {cell.isHoliday && (
                    <Tooltip title={cell.isHoliday.holiday_name || cell.isHoliday.name || 'Company Holiday'}>
                      <Box
                        sx={{
                          px: 0.6,
                          py: 0.2,
                          borderRadius: '5px',
                          bgcolor: '#FEF3C7',
                          color: '#B45309',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.4
                        }}
                      >
                        ★ {cell.isHoliday.holiday_name || cell.isHoliday.name}
                      </Box>
                    </Tooltip>
                  )}

                  {/* Leaves list for this date (up to 2 direct + "+N more" overflow) */}
                  {cell.dayLeaves.slice(0, 2).map((l) => {
                    const empName = l.employee ? `${l.employee.first_name} ${l.employee.last_name || ''}`.trim() : 'Employee';
                    const typeLabel = l.leave_type === 'casual_leave' || l.leave_type === 'CL' ? 'CL' : 'SL';
                    const isCL = typeLabel === 'CL';

                    return (
                      <Tooltip key={l.id} title={`${empName} — ${isCL ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}`}>
                        <Box
                          sx={{
                            px: 0.6,
                            py: 0.2,
                            borderRadius: '5px',
                            bgcolor: isCL ? '#E0F2FE' : '#ECFDF5',
                            color: isCL ? '#0369A1' : '#047857',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {l.employee?.first_name || 'Emp'} ({typeLabel})
                        </Box>
                      </Tooltip>
                    );
                  })}

                  {cell.dayLeaves.length > 2 && (
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, mb: 0.5 }}>
                            All Absences ({cell.dayLeaves.length}):
                          </Typography>
                          {cell.dayLeaves.map((l) => (
                            <Typography key={l.id} sx={{ fontSize: '10.5px' }}>
                              • {l.employee?.first_name} {l.employee?.last_name} ({l.leave_type === 'casual_leave' || l.leave_type === 'CL' ? 'CL' : 'SL'})
                            </Typography>
                          ))}
                        </Box>
                      }
                    >
                      <Box
                        sx={{
                          px: 0.6,
                          py: 0.15,
                          borderRadius: '4px',
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '10px',
                          fontWeight: 700,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#E2E8F0' }
                        }}
                      >
                        +{cell.dayLeaves.length - 2} more
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* Add Holiday Modal Dialog (Admin only) */}
      {isAdmin && (
        <AddHolidayModal
          open={addHolidayOpen}
          onClose={() => setAddHolidayOpen(false)}
          onSuccess={() => {
            setAddHolidayOpen(false);
            refetch();
          }}
        />
      )}
    </Box>
  );
}
