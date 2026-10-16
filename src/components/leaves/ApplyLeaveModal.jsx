/**
 * ===========================================
 *  Apply For Leave Modal Component
 * ===========================================
 *
 * Provides date-range selection, real-time working day deduction preview,
 * Saturday 1st-5th & holiday exemption visual breakdown, and balance checks.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  EventAvailableOutlined as EventAvailableOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApplyLeave, useLeavePreview, useMyBalances } from '../../Api/Api';
import { toast } from 'react-toastify';

const ApplyLeaveModal = ({ open, onClose }) => {
  const currentYear = new Date().getFullYear();
  const { data: balanceData } = useMyBalances(currentYear);
  const balances = balanceData?.balances;

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

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EventAvailableOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
              Apply for Leave
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
              Casual Leave (CL) & Sick Leave (SL)
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isPending}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Divider sx={{ my: 1 }} />

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        <form onSubmit={formik.handleSubmit}>
          {/* Leave Type Selector with Live Balance Tag */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', mb: 0.8 }}>
              Leave Type
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                id="leave_type"
                name="leave_type"
                value={formik.values.leave_type}
                onChange={formik.handleChange}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="CL">
                  Casual Leave (CL) — Available:{' '}
                  <strong>{balances?.CL?.availableBalanceAfterPending ?? '—'} days</strong>
                </MenuItem>
                <MenuItem value="SL">
                  Sick Leave (SL) — Available:{' '}
                  <strong>{balances?.SL?.availableBalanceAfterPending ?? '—'} days</strong>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Date Range Inputs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', mb: 0.8 }}>
                Start Date
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
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', mb: 0.8 }}>
                End Date
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
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          {/* Real-time Calculation Breakdown Box */}
          {isPreviewLoading && (
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '10px', mb: 2 }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
                Calculating working days and exemptions...
              </Typography>
            </Box>
          )}

          {previewData && !isPreviewLoading && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Total Leave Days to Deduct:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: isInsufficient ? '#DC2626' : '#0284C7',
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
                      py: 0.4,
                      borderBottom: '1px dashed #E2E8F0',
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#334155' }}>
                      <strong>{item.date}</strong> ({item.dayName}): {item.reason}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: item.weight === 0 ? '#10B981' : item.weight === 0.5 ? '#F59E0B' : '#0F172A',
                      }}
                    >
                      {item.weight === 0 ? '0.0 days (No deduction)' : `${item.weight} day`}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {previewData.totalDays === 0 && (
                <Alert severity="warning" sx={{ mt: 1.5, py: 0.5, fontSize: '12px' }}>
                  The selected dates fall on weekends or holidays with 0 working days. No leave is needed.
                </Alert>
              )}

              {isInsufficient && (
                <Alert severity="error" sx={{ mt: 1.5, py: 0.5, fontSize: '12px' }}>
                  Insufficient balance! You requested {previewData.totalDays} days, but only {availableDays} days are available.
                </Alert>
              )}
            </Box>
          )}

          {/* Reason */}
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', mb: 0.8 }}>
              Reason for Absence
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
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isPending}
              sx={{ borderColor: '#E2E8F0', color: '#475569' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending || isInsufficient || requestedDays === 0}
              sx={{ bgcolor: '#23A4E8', '&:hover': { bgcolor: '#1B8ECB' } }}
            >
              {isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyLeaveModal;
