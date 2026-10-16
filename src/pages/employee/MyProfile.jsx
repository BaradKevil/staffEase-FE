import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Stack,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  DeleteOutlineRounded as DeleteIcon,
  LockOutlined as LockIcon,
  PersonOutlineOutlined as PersonIcon,
  BadgeOutlined as BadgeIcon,
  CorporateFareOutlined as DeptIcon,
  CalendarTodayOutlined as CalendarIcon,
  EmailOutlined as EmailIcon
} from '@mui/icons-material';
import {
  useMyProfile,
  useUploadProfilePhoto,
  useRemoveProfilePhoto,
  useChangePassword
} from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import { toast } from 'react-toastify';

export default function MyProfile() {
  const fileInputRef = useRef(null);

  const { data: profileData, isLoading, refetch } = useMyProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const removePhotoMutation = useRemoveProfilePhoto();
  const changePasswordMutation = useChangePassword();

  const employee = profileData?.data || {};

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [pwdError, setPwdError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile image must be less than 5MB');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are permitted');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await uploadPhotoMutation.mutateAsync(formData);
      toast.success('Profile photograph updated successfully');

      // Update localStorage user avatar so Navbar updates immediately
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.avatar_url = res?.data?.avatar_url;
      localStorage.setItem('user', JSON.stringify(currentUser));

      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    try {
      await removePhotoMutation.mutateAsync();
      toast.success('Profile photo removed');

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.avatar_url = null;
      localStorage.setItem('user', JSON.stringify(currentUser));

      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove photo');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (passwordData.new_password.length < 8) {
      setPwdError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPwdError('New passwords do not match');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password updated successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password';
      setPwdError(msg);
      toast.error(msg);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          My Account & Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Manage your personal details, secure photo uploads, and password security.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Avatar & Quick Info */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF',
              textAlign: 'center'
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={employee.avatar_url || ''}
                sx={{
                  width: 104,
                  height: 104,
                  bgcolor: '#23A4E8',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  border: '4px solid #E0F2FE',
                  margin: '0 auto'
                }}
              >
                {employee.first_name ? employee.first_name[0] : 'U'}
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPhotoMutation.isPending}
                sx={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  bgcolor: '#23A4E8',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: '#1D8BC4' }
                }}
                size="small"
              >
                {uploadPhotoMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CameraIcon fontSize="small" />
                )}
              </IconButton>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
              {employee.designation || 'Team Member'}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5 }}>
              <StatusBadge status={employee.status} />
            </Box>

            {employee.avatar_url && (
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemovePhoto}
                disabled={removePhotoMutation.isPending}
                sx={{ mt: 2, textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
              >
                Remove Photo
              </Button>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{employee.work_email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BadgeIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Employee ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{employee.employee_id || '—'}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DeptIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Department</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{employee.department?.name || 'Unassigned'}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Joining Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                    {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Security & Password */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #EEF2F6',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              bgcolor: '#FFFFFF'
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
                <LockIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Change Password
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Ensure your account is protected with a secure password
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {pwdError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.8125rem' }}>
                {pwdError}
              </Alert>
            )}

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 440 }}>
                <TextField
                  label="Current Password *"
                  type="password"
                  size="small"
                  fullWidth
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />

                <TextField
                  label="New Password *"
                  type="password"
                  size="small"
                  fullWidth
                  required
                  helperText="Minimum 8 characters"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />

                <TextField
                  label="Confirm New Password *"
                  type="password"
                  size="small"
                  fullWidth
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={changePasswordMutation.isPending}
                  sx={{
                    bgcolor: '#23A4E8',
                    '&:hover': { bgcolor: '#1D8BC4' },
                    borderRadius: '10px',
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: 'none',
                    mt: 1,
                    width: 'fit-content',
                    px: 3
                  }}
                >
                  {changePasswordMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
