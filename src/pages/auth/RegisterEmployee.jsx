import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CorporateFare as LogoIcon,
  CheckCircleOutlineRounded as ValidIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVerifyInvitation, useRegisterEmployee } from '../../Api/Api';
import InvitationInvalid from './InvitationInvalid';
import { toast } from 'react-toastify';

export default function RegisterEmployee() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: invitationData, isLoading, isError, error } = useVerifyInvitation(token);
  const registerMutation = useRegisterEmployee();

  const invitation = invitationData?.data || invitationData;

  // Pre-fill full name if available once invitation loads
  React.useEffect(() => {
    if (invitation && !formData.first_name) {
      if (invitation.first_name || invitation.last_name) {
        setFormData((prev) => ({
          ...prev,
          first_name: invitation.first_name || '',
          last_name: invitation.last_name || ''
        }));
      } else if (invitation.full_name) {
        const parts = (invitation.full_name || '').trim().split(' ');
        setFormData((prev) => ({
          ...prev,
          first_name: parts[0] || '',
          last_name: parts.slice(1).join(' ') || ''
        }));
      }
    }
  }, [invitation]);

  if (!token) {
    return <InvitationInvalid message="No invitation token was provided in the URL." />;
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          width: '100%',
          bgcolor: '#F4F7FA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 2,
          boxSizing: 'border-box'
        }}
      >
        <CircularProgress size={40} sx={{ color: '#23A4E8' }} />
        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500, textAlign: 'center' }}>
          Verifying your invitation securely...
        </Typography>
      </Box>
    );
  }

  if (isError || !invitation) {
    return (
      <InvitationInvalid
        message={error?.response?.data?.message || 'This invitation link is invalid, expired, or has already been used.'}
      />
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMessage('First and last name are required');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        token,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password
      });

      toast.success('Registration submitted successfully!');
      navigate('/pending-approval', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to complete registration';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F8FAFC',
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Card
        sx={{
          borderRadius: '16px',
          maxWidth: 480,
          width: '100%',
          maxHeight: 'calc(100dvh - 24px)',
          overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          borderTop: '4px solid #23A4E8',
          bgcolor: '#FFFFFF',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.75 } }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 1.5
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                color: '#23A4E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                border: '1px solid #DBEAFE',
                boxShadow: '0 2px 6px rgba(35, 164, 232, 0.1)'
              }}
            >
              <LogoIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '18px', sm: '20px' },
                fontWeight: 700,
                color: '#1E293B',
                mb: 0.25,
                textAlign: 'center',
                letterSpacing: '-0.01em'
              }}
            >
              Complete Employee Registration
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#64748B', textAlign: 'center' }}>
              Set up your credentials to join your workspace
            </Typography>
          </Box>

          {/* Invitation verification summary banner */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: '10px',
              bgcolor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <ValidIcon sx={{ color: '#0284C7', fontSize: 16 }} />
              <Typography sx={{ color: '#0369A1', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Official Invitation
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', lineHeight: 1.3 }}>
              {invitation.work_email || invitation.email}
            </Typography>
            {invitation.designation && (
              <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                <Chip size="small" label={invitation.designation} sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 600, fontSize: '11px', height: 20 }} />
              </Stack>
            )}
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 1.5, py: 0.5, borderRadius: '8px', fontSize: '12.5px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* First & Last Name Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mb: 1.25 }}>
              <Box>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', mb: 0.4 }}>
                  First Name <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  id="first_name"
                  name="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#23A4E8' },
                      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 12px',
                      fontSize: '13.5px',
                      color: '#0F172A'
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', mb: 0.4 }}>
                  Last Name <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  id="last_name"
                  name="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#23A4E8' },
                      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 12px',
                      fontSize: '13.5px',
                      color: '#0F172A'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Phone Number */}
            <Box sx={{ mb: 1.25 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', mb: 0.4 }}>
                Phone Number
              </Typography>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 42,
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    color: '#0F172A'
                  }
                }}
              />
            </Box>

            {/* Password with View Password Eye Button at end */}
            <Box sx={{ mb: 1.25 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', mb: 0.4 }}>
                Password <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      paddingRight: '42px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#23A4E8' },
                      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 12px',
                      fontSize: '13.5px',
                      color: '#0F172A'
                    }
                  }}
                />
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  {showPassword ? <VisibilityOff sx={{ fontSize: '20px' }} /> : <Visibility sx={{ fontSize: '20px' }} />}
                </IconButton>
              </Box>
            </Box>

            {/* Confirm Password with View Password Eye Button at end */}
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', mb: 0.4 }}>
                Confirm Password <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      paddingRight: '42px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#23A4E8' },
                      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 12px',
                      fontSize: '13.5px',
                      color: '#0F172A'
                    }
                  }}
                />
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
              fullWidth
              type="submit"
              variant="contained"
              disabled={registerMutation.isPending}
              sx={{
                bgcolor: '#23A4E8',
                fontWeight: 600,
                borderRadius: '8px',
                py: 1.1,
                color: 'white',
                textTransform: 'none',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(35, 164, 232, 0.25)',
                '&:hover': { bgcolor: '#1E92D1', boxShadow: '0 6px 16px rgba(35, 164, 232, 0.35)' },
                mb: 1.25
              }}
            >
              {registerMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Complete Registration'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                component={Link}
                to="/login"
                sx={{
                  fontSize: '12.5px',
                  color: '#64748B',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { color: '#23A4E8' }
                }}
              >
                Already registered? Sign in here
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
