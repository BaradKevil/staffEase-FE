import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Chip,
  Divider,
  Avatar,
  CircularProgress,
  Stack,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
  Timelapse as TimeIcon
} from '@mui/icons-material';
import { useReviewLeaveRequest } from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import { toast } from 'react-toastify';

export default function LeaveApprovalModal({ open, onClose, leave, onSuccess }) {
  const [action, setAction] = useState('approved'); // 'approved' | 'rejected'
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const reviewMutation = useReviewLeaveRequest();

  if (!leave) return null;

  const handleSubmit = async () => {
    if (action === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        id: leave.id,
        data: {
          action,
          rejection_reason: action === 'rejected' ? rejectionReason.trim() : undefined,
          admin_comments: comments.trim() || undefined
        }
      });
      toast.success(`Leave request ${action} successfully`);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} leave request`);
    }
  };

  const handleClose = () => {
    setComments('');
    setRejectionReason('');
    setAction('approved');
    onClose();
  };

  const employee = leave.employee || {};
  const isPending = leave.status === 'pending';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#FAFCFE'
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
            Review Leave Application
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Reference #{leave.id} • Submitted on {new Date(leave.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <StatusBadge status={leave.status} />
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Employee Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            mb: 2.5
          }}
        >
          <Avatar
            src={employee.avatar_url || ''}
            sx={{
              width: 48,
              height: 48,
              bgcolor: '#23A4E8',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
          >
            {employee.first_name ? employee.first_name[0] : 'E'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
              {employee.designation || 'Team Member'} • {employee.department?.name || 'Department'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {employee.work_email} • ID: {employee.employee_id || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Leave Details Card */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            p: 2,
            borderRadius: '12px',
            border: '1px solid #EEF2F6',
            bgcolor: '#FFFFFF',
            mb: 2.5
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              LEAVE TYPE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5 }}>
              {leave.leave_type === 'casual_leave' ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              TOTAL DEDUCTED DAYS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#23A4E8', mt: 0.5, fontSize: '1rem' }}>
              {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              START DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', mt: 0.5 }}>
              {new Date(leave.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              END DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', mt: 0.5 }}>
              {new Date(leave.end_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Reason */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mb: 0.5, display: 'block' }}>
            EMPLOYEE'S REASON
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: '0.875rem'
            }}
          >
            {leave.reason || 'No reason provided.'}
          </Box>
        </Box>

        {/* Breakdown chips if available */}
        {leave.breakdown && Array.isArray(leave.breakdown) && leave.breakdown.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mb: 0.75, display: 'block' }}>
              DAILY DEDUCTION BREAKDOWN
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 120, overflowY: 'auto' }}>
              {leave.breakdown.map((item, idx) => (
                <Chip
                  key={idx}
                  size="small"
                  label={`${item.date}: ${item.weight}d (${item.dayOfWeek}${item.note ? ` - ${item.note}` : ''})`}
                  sx={{
                    bgcolor: item.weight > 0 ? '#E0F2FE' : '#F1F5F9',
                    color: item.weight > 0 ? '#0369A1' : '#64748B',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {isPending && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Decision selector */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
              Administrative Decision
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              <Button
                variant={action === 'approved' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setAction('approved')}
                startIcon={<CheckIcon />}
                fullWidth
                sx={{
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 600,
                  bgcolor: action === 'approved' ? '#10B981' : 'transparent',
                  borderColor: '#10B981',
                  '&:hover': {
                    bgcolor: action === 'approved' ? '#059669' : '#ECFDF5'
                  }
                }}
              >
                Approve Request
              </Button>
              <Button
                variant={action === 'rejected' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setAction('rejected')}
                startIcon={<CancelIcon />}
                fullWidth
                sx={{
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 600,
                  bgcolor: action === 'rejected' ? '#EF4444' : 'transparent',
                  borderColor: '#EF4444',
                  '&:hover': {
                    bgcolor: action === 'rejected' ? '#DC2626' : '#FEF2F2'
                  }
                }}
              >
                Reject Request
              </Button>
            </Stack>

            {action === 'rejected' ? (
              <TextField
                label="Reason for Rejection *"
                fullWidth
                multiline
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please state why this leave request is being rejected (sent to employee)..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px'
                  }
                }}
              />
            ) : (
              <TextField
                label="Optional Admin Note / Comments"
                fullWidth
                multiline
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Optional notes or remarks for the employee..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px'
                  }
                }}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
        <Button onClick={handleClose} sx={{ color: '#64748B', fontWeight: 600 }}>
          {isPending ? 'Cancel' : 'Close'}
        </Button>
        {isPending && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={reviewMutation.isPending}
            sx={{
              bgcolor: action === 'approved' ? '#10B981' : '#EF4444',
              '&:hover': {
                bgcolor: action === 'approved' ? '#059669' : '#DC2626'
              },
              borderRadius: '10px',
              px: 3,
              fontWeight: 600
            }}
          >
            {reviewMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Confirm ${action === 'approved' ? 'Approval' : 'Rejection'}`
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
