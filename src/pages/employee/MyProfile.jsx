import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  DeleteOutlineRounded as DeleteIcon,
  LockOutlined as LockIcon,
  CalendarTodayOutlined as CalendarIcon,
  EmailOutlined as EmailIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  useMyProfile,
  useUploadProfilePhoto,
  useRemoveProfilePhoto,
  useChangePassword
} from '../../Api/Api';
import StatusBadge from '../../common/custom/StatusBadge';
import { toast } from 'react-toastify';

const getAvatarFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (import.meta.env.VITE_BASEURL || 'http://localhost:5000/api/v1')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function MyProfile() {
  const fileInputRef = useRef(null);

  const { data: profileData, isLoading, refetch } = useMyProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const removePhotoMutation = useRemoveProfilePhoto();
  const changePasswordMutation = useChangePassword();

  // Safely extract employee whether returned directly or nested under data
  const rawEmployee = (profileData && (profileData.id || profileData.first_name || profileData.email))
    ? profileData
    : (profileData?.data && (profileData.data.id || profileData.data.first_name)
      ? profileData.data
      : (profileData || {}));

  const employee = {
    ...rawEmployee,
    avatar_url: rawEmployee.profile_photo || rawEmployee.avatar_url,
    email: rawEmployee.email || rawEmployee.work_email,
  };

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      const photoUrl = res?.profile_photo || res?.avatar_url || res?.data?.profile_photo || res?.data?.avatar_url;

      // Update localStorage user avatar so Navbar and rest of app updates immediately
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (photoUrl) {
        currentUser.profile_photo = photoUrl;
        currentUser.avatar_url = photoUrl;
        localStorage.setItem('user', JSON.stringify(currentUser));
        window.dispatchEvent(new Event('storage'));
      }

      await refetch();
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
      currentUser.profile_photo = null;
      currentUser.avatar_url = null;
      localStorage.setItem('user', JSON.stringify(currentUser));
      window.dispatchEvent(new Event('storage'));

      await refetch();
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
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password';
      setPwdError(msg);
      toast.error(msg);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      height: 44,
      borderRadius: '8px',
      bgcolor: '#F8FAFC',
      paddingRight: '44px',
      '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
      '&:hover fieldset': { borderColor: '#23A4E8' },
      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '13.5px',
      color: '#0F172A',
      padding: '11px 14px',
      '&::placeholder': { color: '#94A3B8', opacity: 1 }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          My Account & Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Manage your personal details, secure photo uploads, and password security.
        </Typography>
      </Box>

      {/* Edge-to-Edge Responsive Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
          gap: 3,
          width: '100%',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Avatar & Quick Info */}
        <Card
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              src={getAvatarFullUrl(employee.avatar_url)}
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

          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
            {employee.first_name} {employee.last_name}
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '13px', mt: 0.5 }}>
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
              sx={{ mt: 2, textTransform: 'none', fontSize: '12px', fontWeight: 600 }}
            >
              Remove Photo
            </Button>
          )}

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box>
                <Typography sx={{ color: '#64748B', fontSize: '12px' }}>Email</Typography>
                <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                  {employee.email || employee.work_email || '—'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box>
                <Typography sx={{ color: '#64748B', fontSize: '12px' }}>Joining Date</Typography>
                <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                  {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Right Column: Security & Password */}
        <Card
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            bgcolor: '#FFFFFF',
            width: '100%'
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
              <LockIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
                Change Password
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
                Ensure your account is protected with a secure password
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {pwdError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '13px' }}>
              {pwdError}
            </Alert>
          )}

          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, maxWidth: 440 }}>
              {/* Current Password with Eye Toggle */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Current Password <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    type={showCurrentPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    placeholder="Enter your current password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    sx={inputStyle}
                  />
                  <IconButton
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    sx={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      p: '6px',
                      '&:hover': { color: '#23A4E8' }
                    }}
                  >
                    {showCurrentPassword ? <VisibilityOff sx={{ fontSize: '20px' }} /> : <Visibility sx={{ fontSize: '20px' }} />}
                  </IconButton>
                </Box>
              </Box>

              {/* New Password with Eye Toggle */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  New Password <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    placeholder="Minimum 8 characters"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    sx={inputStyle}
                  />
                  <IconButton
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    sx={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      p: '6px',
                      '&:hover': { color: '#23A4E8' }
                    }}
                  >
                    {showNewPassword ? <VisibilityOff sx={{ fontSize: '20px' }} /> : <Visibility sx={{ fontSize: '20px' }} />}
                  </IconButton>
                </Box>
              </Box>

              {/* Confirm New Password with Eye Toggle */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    placeholder="Re-enter your new password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    sx={inputStyle}
                  />
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    sx={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      p: '6px',
                      '&:hover': { color: '#23A4E8' }
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOff sx={{ fontSize: '20px' }} /> : <Visibility sx={{ fontSize: '20px' }} />}
                  </IconButton>
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={changePasswordMutation.isPending}
                sx={{
                  bgcolor: '#23A4E8',
                  '&:hover': { bgcolor: '#1D8BC4' },
                  borderRadius: '10px',
                  py: 1.1,
                  fontWeight: 600,
                  textTransform: 'none',
                  mt: 1,
                  width: 'fit-content',
                  px: 3.5
                }}
              >
                {changePasswordMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
