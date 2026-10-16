/**
 * ===========================================
 *  Apply For Leave Modal Component
 * ===========================================
 *
 * Provides date-range selection, real-time working day deduction preview,
 * Saturday 1st-5th & holiday exemption visual breakdown, and balance checks.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  EventAvailableOutlined as EventAvailableOutlinedIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApplyLeave, useLeavePreview, useMyBalances } from '../../Api/Api';
import { toast } from 'react-toastify';

const ApplyLeaveModal = ({ open, onClose }) => {
  const currentYear = new Date().getFullYear();
  const { data: balanceData, refetch: refetchBalances } = useMyBalances(currentYear);
  const balances = balanceData?.balances || balanceData?.data?.balances;

  React.useEffect(() => {
    if (open) {
      refetchBalances();
    }
  }, [open, refetchBalances]);

  const { mutate: applyMutate, isPending } = useApplyLeave(
    () => {
      toast.success('Leave application submitted successfully for review.');
      onClose();
      formik.resetForm();
    },
    (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit leave application.';
      toast.error(msg);
    }
  );

  const formik = useFormik({
    initialValues: {
      leave_type: 'CL',
      start_date: '',
      end_date: '',
      reason: '',
    },
    validationSchema: Yup.object({
      leave_type: Yup.string().oneOf(['CL', 'SL']).required('Leave type is required'),
      start_date: Yup.date().required('Start date is required'),
      end_date: Yup.date()
        .min(Yup.ref('start_date'), 'End date cannot be earlier than start date')
        .required('End date is required'),
      reason: Yup.string().min(5, 'Reason must be at least 5 characters').required('Reason is required'),
    }),
    onSubmit: (values) => {
      applyMutate(values);
    },
  });

  // Real-time backend calculation preview
  const { data: previewData, isLoading: isPreviewLoading } = useLeavePreview(
    formik.values.start_date,
    formik.values.end_date
  );

  const selectedBalance = balances ? balances[formik.values.leave_type] : null;
  const availableDays = selectedBalance?.availableBalanceAfterPending ?? 0;
  const requestedDays = previewData?.totalDays ?? 0;
  const isInsufficient = requestedDays > 0 && requestedDays > availableDays;

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      height: 44,
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
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          borderTop: '5px solid #23A4E8',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          width: { xs: 'calc(100% - 32px)', sm: '100%' },
          m: { xs: 2, sm: 'auto' }
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.8,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              justifyContent: 'center',
            }}
          >
            <EventAvailableOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
              Apply for Leave
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
              Casual Leave (CL) & Sick Leave (SL)
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isPending} sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {/* Leave Type Selector with Live Balance Tag */}
          <Box sx={{ mb: 2.2 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
              Leave Type <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                id="leave_type"
                name="leave_type"
                value={formik.values.leave_type}
                onChange={formik.handleChange}
                sx={{
                  height: 44,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                  '&:hover fieldset': { borderColor: '#23A4E8' },
                  '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                }}
              >
                <MenuItem value="CL">
                  Casual Leave (CL) — Available:{' '}
                  <strong style={{ marginLeft: 4 }}>{balances?.CL?.availableBalanceAfterPending ?? '—'} days</strong>
                </MenuItem>
                <MenuItem value="SL">
                  Sick Leave (SL) — Available:{' '}
                  <strong style={{ marginLeft: 4 }}>{balances?.SL?.availableBalanceAfterPending ?? '—'} days</strong>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Date Range Inputs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.2, mb: 2.2 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Start Date <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                id="start_date"
                name="start_date"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                helperText={formik.touched.start_date && formik.errors.start_date}
                sx={inputStyle}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                End Date <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                id="end_date"
                name="end_date"
                value={formik.values.end_date}
                onChange={formik.handleChange}
                error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                helperText={formik.touched.end_date && formik.errors.end_date}
                sx={inputStyle}
              />
            </Box>
          </Box>

          {/* Real-time Calculation Breakdown Box */}
          {isPreviewLoading && (
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '10px', mb: 2.2, border: '1px solid #E2E8F0' }}>
              <CircularProgress size={20} sx={{ color: '#23A4E8' }} />
              <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
                Calculating working days and exemptions...
              </Typography>
            </Box>
          )}

          {previewData && !isPreviewLoading && (
            <Box
              sx={{
                p: 2,
                mb: 2.2,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Total Working Days to Deduct:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: isInsufficient ? '#DC2626' : '#23A4E8',
                  }}
                >
                  {previewData.totalDays} day(s)
                </Typography>
              </Box>

              {/* Day-by-Day Breakdown Pills */}
              <Box sx={{ maxHeight: 120, overflowY: 'auto', mt: 1, pr: 0.5 }}>
                {previewData.breakdown.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      py: 0.5,
                      borderBottom: '1px dashed #E2E8F0',
                    }}
                  >
                    <Typography sx={{ fontSize: '12.5px', color: '#334155' }}>
                      <strong>{item.date}</strong> ({item.dayName}): {item.reason}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: item.weight === 0 ? '#10B981' : item.weight === 0.5 ? '#F59E0B' : '#0F172A',
                      }}
                    >
                      {item.weight === 0 ? '0.0 days (Exempt)' : `${item.weight} day`}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {previewData.totalDays === 0 && (
                <Alert severity="warning" sx={{ mt: 1.5, py: 0.5, fontSize: '12px', borderRadius: '8px' }}>
                  The selected dates fall on weekends or holidays with 0 working days. No leave is needed.
                </Alert>
              )}

              {isInsufficient && (
                <Alert severity="error" sx={{ mt: 1.5, py: 0.5, fontSize: '12px', borderRadius: '8px' }}>
                  Insufficient balance! You requested {previewData.totalDays} days, but only {availableDays} days are available.
                </Alert>
              )}
            </Box>
          )}

          {/* Reason */}
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
              Reason for Absence <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Provide a brief explanation for your leave..."
              id="reason"
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              error={formik.touched.reason && Boolean(formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  p: 1.5,
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
          <Button
            onClick={onClose}
            disabled={isPending}
            sx={{
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              px: 2.5,
              borderRadius: '10px'
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || isInsufficient || requestedDays === 0}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' }
            }}
          >
            {isPending ? <CircularProgress size={20} color="inherit" /> : 'Submit Application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ApplyLeaveModal;
