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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useInviteEmployee, useDepartments } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function InviteEmployeeModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    work_email: '',
    employee_id: '',
    department_id: '',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0]
  });

  const [invitationResult, setInvitationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const inviteMutation = useInviteEmployee();
  const { data: deptData } = useDepartments();
  const departments = deptData?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.work_email.trim()) {
      toast.error('Full name and work email are required');
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        work_email: formData.work_email.trim().toLowerCase(),
        employee_id: formData.employee_id.trim() || undefined,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        designation: formData.designation.trim() || undefined,
        joining_date: formData.joining_date || undefined
      };

      const res = await inviteMutation.mutateAsync(payload);
      const invitation = res?.data || {};

      toast.success('Invitation generated and email sent successfully!');
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
      employee_id: '',
      department_id: '',
      designation: '',
      joining_date: new Date().toISOString().split('T')[0]
    });
    setInvitationResult(null);
    setCopied(false);
    onClose();
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
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7'
            }}
          >
            <InviteIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
              Invite New Employee
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Send an onboarding invitation link to join LeaveFlow
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {invitationResult ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
            Invitation created for <strong>{formData.full_name}</strong> ({formData.work_email})! An email has been sent.
          </Alert>

          {invitationResult.invitation_link && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 1 }}>
                SECURE ONBOARDING LINK (Direct Registration URL)
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
                  sx: { bgcolor: '#F8FAFC', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.8125rem' }
                }}
              />
              <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
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
              fontWeight: 600
            }}
          >
            Done
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Full Name *"
                name="full_name"
                size="small"
                fullWidth
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <TextField
                label="Work Email *"
                name="work_email"
                type="email"
                size="small"
                fullWidth
                required
                value={formData.work_email}
                onChange={handleChange}
                placeholder="e.g. alex@company.com"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <TextField
                label="Employee ID (Optional)"
                name="employee_id"
                size="small"
                fullWidth
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="e.g. EMP-1042"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department_id"
                  value={formData.department_id}
                  label="Department"
                  onChange={handleChange}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="">None / Unassigned</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Designation / Title"
                name="designation"
                size="small"
                fullWidth
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <TextField
                label="Expected Joining Date"
                name="joining_date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.joining_date}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 2.5, borderRadius: '10px', fontSize: '0.8125rem' }}>
              The joining date determines prorated annual leave entitlements (1.0 CL + 0.5 SL per remaining month) when the employee registration is approved.
            </Alert>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
            <Button onClick={handleClose} sx={{ color: '#64748B', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={inviteMutation.isPending}
              sx={{
                borderRadius: '10px',
                px: 3,
                fontWeight: 600,
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
