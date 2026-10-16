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
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  PersonAddRounded as InviteIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useInviteEmployee } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function InviteEmployeeModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    work_email: '',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0]
  });

  const [invitationResult, setInvitationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const inviteMutation = useInviteEmployee();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = formData.full_name.trim();
    const workEmail = formData.work_email.trim().toLowerCase();

    if (!fullName || !workEmail) {
      toast.error('Full name and work email are required');
      return;
    }

    try {
      const parts = fullName.split(' ');
      const payload = {
        email: workEmail,
        work_email: workEmail,
        full_name: fullName,
        first_name: parts[0],
        last_name: parts.slice(1).join(' ') || '',
        designation: formData.designation.trim() || undefined,
        joining_date: formData.joining_date || undefined
      };

      const res = await inviteMutation.mutateAsync(payload);
      const invitation = res?.data || res || {};

      if (invitation.email_sent) {
        toast.success(`Invitation created and email sent successfully to ${workEmail}!`);
      } else {
        toast.warn(
          invitation.email_error
            ? `Invitation created, but email failed: ${invitation.email_error}`
            : 'Invitation created, but email could not be delivered. Please share the link manually.'
        );
      }
      setInvitationResult(invitation);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send employee invitation');
    }
  };

  const handleCopyLink = () => {
    if (invitationResult?.invitation_link) {
      navigator.clipboard.writeText(invitationResult.invitation_link);
      setCopied(true);
      toast.info('Invitation link copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      work_email: '',
      designation: '',
      joining_date: new Date().toISOString().split('T')[0]
    });
    setInvitationResult(null);
    setCopied(false);
    onClose();
  };

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
              justifyContent: 'center'
            }}
          >
            <InviteIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
              Invite New Employee
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '13px' }}>
              Send an onboarding invitation link to join staffEase
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {invitationResult ? (
        <Box sx={{ p: 3 }}>
          {invitationResult.email_sent ? (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '10px', fontSize: '13.5px' }}>
              Invitation created for <strong>{formData.full_name}</strong> ({formData.work_email})! An email has been sent.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px', fontSize: '13.5px', bgcolor: '#FEF3C7', color: '#92400E' }}>
              <strong>Notice:</strong> Invitation was saved, but <strong>the email could not be sent</strong> {invitationResult.email_error ? `(${invitationResult.email_error})` : '(SMTP not configured)'}. Please copy the direct registration link below and share it with the employee manually.
            </Alert>
          )}

          {invitationResult.invitation_link && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>
                Secure Onboarding Link (Direct Registration URL)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={invitationResult.invitation_link}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyLink} edge="end" color={copied ? 'success' : 'primary'}>
                        {copied ? <CheckIcon /> : <CopyIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: '#F8FAFC',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontSize: '13px'
                  }
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.75, display: 'block' }}>
                Expires in 7 days. Once the employee submits registration, it will be routed to your Approval queue.
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleClose}
            sx={{
              bgcolor: '#23A4E8',
              borderRadius: '10px',
              py: 1.25,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1D8BC4' }
            }}
          >
            Done
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.2 }}>
              {/* Full Name */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  name="full_name"
                  fullWidth
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  sx={inputStyle}
                />
              </Box>

              {/* Work Email */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Work Email <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  name="work_email"
                  type="email"
                  fullWidth
                  required
                  value={formData.work_email}
                  onChange={handleChange}
                  placeholder="e.g. alex@company.com"
                  sx={inputStyle}
                />
              </Box>

              {/* Designation */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Designation / Title
                </Typography>
                <TextField
                  name="designation"
                  fullWidth
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  sx={inputStyle}
                />
              </Box>

              {/* Expected Joining Date */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Expected Joining Date
                </Typography>
                <TextField
                  name="joining_date"
                  type="date"
                  fullWidth
                  value={formData.joining_date}
                  onChange={handleChange}
                  sx={inputStyle}
                />
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2.5, borderRadius: '10px', fontSize: '12.5px', color: '#0369A1', bgcolor: '#F0F9FF' }}>
              The joining date automatically calculates prorated annual leave entitlements (1.0 CL + 0.5 SL per remaining month) when the employee registration is approved.
            </Alert>
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={inviteMutation.isPending}
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
              {inviteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Send Invitation'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
}
