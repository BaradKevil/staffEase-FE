import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EventAvailableRounded as HolidayIcon,
  Add as AddIcon,
  DeleteOutlineRounded as DeleteIcon,
  PolicyRounded as PolicyIcon,
  CalculateOutlined as CalcIcon,
  CalendarToday as CalIcon
} from '@mui/icons-material';
import { useHolidays, useDeleteHoliday } from '../../Api/Api';
import AddHolidayModal from '../../components/calendar/AddHolidayModal';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import { toast } from 'react-toastify';

export default function LeavePolicies() {
  const [addHolidayOpen, setAddHolidayOpen] = useState(false);
  const { data: holidaysData, isLoading, refetch } = useHolidays();
  const deleteMutation = useDeleteHoliday();

  const holidays = holidaysData?.data || [];

  const handleDeleteHoliday = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the holiday "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Holiday removed successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to remove holiday');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header */}
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Leave Policies & Company Holidays
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Configured annual entitlements, weekend deduction rules, and official company holidays.
        </Typography>
      </Box>

      {/* Policy Cards CSS Grid - Edge-to-Edge full width */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
          width: '100%'
        }}
      >
        <Card
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
              <PolicyIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>
                Annual Entitlements
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
                Standard Full-Year Grant
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '30px', fontWeight: 800, color: '#23A4E8', mb: 1.5, lineHeight: 1.1 }}>
            18 <Typography component="span" sx={{ color: '#64748B', fontWeight: 600, fontSize: '15px' }}>Days Total</Typography>
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>Casual Leave (CL)</Typography>
              <Typography sx={{ fontWeight: 700, color: '#0284C7', fontSize: '13px' }}>12.0 days / year</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>Sick Leave (SL)</Typography>
              <Typography sx={{ fontWeight: 700, color: '#10B981', fontSize: '13px' }}>6.0 days / year</Typography>
            </Box>
          </Box>
        </Card>

        <Card
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#ECFDF5',
                color: '#10B981',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalcIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>
                Accrual & Proration
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
                Monthly Rate & Mid-Year Formula
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '30px', fontWeight: 800, color: '#10B981', mb: 1.5, lineHeight: 1.1 }}>
            1.5 <Typography component="span" sx={{ color: '#64748B', fontWeight: 600, fontSize: '15px' }}>Days / Month</Typography>
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>Monthly Accrual</Typography>
              <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>1.0 CL + 0.5 SL</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>Prorated Formula</Typography>
              <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>Remaining Months × 1.5</Typography>
            </Box>
          </Box>
        </Card>

        <Card
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
              <CalIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>
                Saturday Engine Rules
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
                Exact Working Day Weights
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '12.5px' }}>1st, 3rd, 5th Saturday</Typography>
              <Chip size="small" label="0.0d (OFF)" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '12.5px' }}>2nd, 4th Saturday</Typography>
              <Chip size="small" label="0.5d (Half)" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '12.5px' }}>Sundays & Holidays</Typography>
              <Chip size="small" label="0.0d (Exempt)" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }} />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Holidays List */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            borderBottom: '1px solid #F1F5F9'
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
              Company Holidays ({new Date().getFullYear()})
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Official paid holidays exempt from employee leave deduction
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>HOLIDAY NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>DAY OF WEEK</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>DESCRIPTION</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', py: 1.5 }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CustomTableLoader rows={4} colSpan={5} />
              ) : holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8', fontSize: '13.5px' }}>
                    No holidays configured for this calendar year.
                  </TableCell>
                </TableRow>
              ) : (
                holidays.map((h) => {
                  const d = new Date(h.holiday_date);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                  return (
                    <TableRow key={h.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                          {h.holiday_name || h.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={dayName} sx={{ bgcolor: '#F1F5F9', color: '#475569', fontSize: '12px', borderRadius: '6px' }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#64748B', fontSize: '13px' }}>
                          {h.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete Holiday">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteHoliday(h.id, h.holiday_name || h.name)}
                          >
                            <DeleteIcon fontSize="small" />
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
      </Card>

      {/* Add Holiday Modal */}
      <AddHolidayModal
        open={addHolidayOpen}
        onClose={() => setAddHolidayOpen(false)}
        onSuccess={() => {
          setAddHolidayOpen(false);
          refetch();
        }}
      />
    </Box>
  );
}
