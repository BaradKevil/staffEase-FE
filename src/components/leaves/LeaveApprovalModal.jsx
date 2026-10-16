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
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
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
          borderTop: '5px solid #23A4E8',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          bgcolor: '#FFFFFF'
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
          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
            Review Leave Application
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
            Reference #{leave.id} • Submitted on {new Date(leave.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StatusBadge status={leave.status} />
          <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
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
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px', lineHeight: 1.2 }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '13px', mt: 0.25 }}>
              {employee.designation || 'Team Member'} • {employee.department?.name || 'Department'}
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '12px' }}>
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
            bgcolor: '#FAFCFE',
            mb: 2.5
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}>
              LEAVE TYPE
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5, fontSize: '14px' }}>
              {leave.leave_type === 'casual_leave' ? 'Casual Leave (CL)' : 'Sick Leave (SL)'}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}>
              TOTAL DEDUCTED DAYS
            </Typography>
            <Typography sx={{ fontWeight: 800, color: '#23A4E8', mt: 0.5, fontSize: '15px' }}>
              {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}>
              START DATE
            </Typography>
            <Typography sx={{ fontWeight: 600, color: '#1E293B', mt: 0.5, fontSize: '13px' }}>
              {new Date(leave.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}>
              END DATE
            </Typography>
            <Typography sx={{ fontWeight: 600, color: '#1E293B', mt: 0.5, fontSize: '13px' }}>
              {new Date(leave.end_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Reason */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px', mb: 0.8, display: 'block' }}>
            EMPLOYEE'S REASON
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '10px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: '13.5px'
            }}
          >
            {leave.reason || 'No reason provided.'}
          </Box>
        </Box>

        {/* Breakdown chips if available */}
        {leave.breakdown && Array.isArray(leave.breakdown) && leave.breakdown.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px', mb: 0.8, display: 'block' }}>
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
                    fontSize: '12px',
                    borderRadius: '6px'
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
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', mb: 1.5 }}>
              Administrative Decision
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.2 }}>
              <Button
                variant={action === 'approved' ? 'contained' : 'outlined'}
                onClick={() => setAction('approved')}
                startIcon={<CheckIcon />}
                fullWidth
                sx={{
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: action === 'approved' ? '#10B981' : 'transparent',
                  color: action === 'approved' ? '#FFFFFF' : '#10B981',
                  borderColor: '#10B981',
                  '&:hover': {
                    bgcolor: action === 'approved' ? '#059669' : '#ECFDF5',
                    borderColor: '#059669'
                  }
                }}
              >
                Approve Request
              </Button>
              <Button
                variant={action === 'rejected' ? 'contained' : 'outlined'}
                onClick={() => setAction('rejected')}
                startIcon={<CancelIcon />}
                fullWidth
                sx={{
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: action === 'rejected' ? '#EF4444' : 'transparent',
                  color: action === 'rejected' ? '#FFFFFF' : '#EF4444',
                  borderColor: '#EF4444',
                  '&:hover': {
                    bgcolor: action === 'rejected' ? '#DC2626' : '#FEF2F2',
                    borderColor: '#DC2626'
                  }
                }}
              >
                Reject Request
              </Button>
            </Stack>

            {action === 'rejected' ? (
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Reason for Rejection <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please state why this leave request is being rejected (sent to employee)..."
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
            ) : (
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Optional Admin Note / Comments
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Optional notes or remarks for the employee..."
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
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
        <Button
          onClick={handleClose}
          sx={{
            color: '#64748B',
            fontWeight: 600,
            textTransform: 'none',
            px: 2.5,
            borderRadius: '10px'
          }}
        >
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
              py: 1,
              fontWeight: 600,
              textTransform: 'none'
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
