import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  Alert
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Leave Policies & Company Holidays
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Configured annual entitlements, weekend deduction rules, and official company holidays.
        </Typography>
      </Box>

      {/* Policy Cards Grid */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PolicyIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Annual Entitlements
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Standard Full-Year Grant
                </Typography>
              </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 800, color: '#23A4E8', mb: 1 }}>
              18 <Typography component="span" variant="h6" sx={{ color: '#64748B', fontWeight: 600 }}>Days Total</Typography>
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>Casual Leave (CL)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284C7' }}>12.0 days / year</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>Sick Leave (SL)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>6.0 days / year</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CalcIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Accrual & Proration
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Monthly Rate & Mid-Year Formula
                </Typography>
              </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 800, color: '#10B981', mb: 1 }}>
              1.5 <Typography component="span" variant="h6" sx={{ color: '#64748B', fontWeight: 600 }}>Days / Month</Typography>
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>Monthly Accrual</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>1.0 CL + 0.5 SL</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>Prorated Formula</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>Remaining Months × 1.5</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: '#F3E8FF',
                  color: '#7E22CE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CalIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Saturday Engine Rules
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Exact Working Day Weights
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>1st, 3rd, 5th Saturday</Typography>
                <Chip size="small" label="0.0 days (OFF)" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>2nd, 4th Saturday</Typography>
                <Chip size="small" label="0.5 days (Half-day)" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>Sundays & Holidays</Typography>
                <Chip size="small" label="0.0 days (Exempt)" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 600 }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Holidays List */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9'
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
              Company Holidays ({new Date().getFullYear()})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Official paid holidays exempt from employee leave deduction
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddHolidayOpen(true)}
            sx={{
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Holiday
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>HOLIDAY NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DAY OF WEEK</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DESCRIPTION</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <CustomTableLoader rows={4} colSpan={5} />
              ) : holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8' }}>
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
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {h.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={dayName} sx={{ bgcolor: '#F1F5F9', color: '#475569', fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                          {h.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete Holiday">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteHoliday(h.id, h.name)}
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
