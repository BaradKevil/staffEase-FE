import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  PersonOutlineOutlined as PersonIcon,
  PhoneOutlined as PhoneIcon,
  CorporateFare as LogoIcon,
  CheckCircleOutlineRounded as ValidIcon,
  Security as SecurityIcon
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
          bgcolor: '#F4F7FA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={40} sx={{ color: '#23A4E8' }} />
        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
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
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F4F7FA',
        py: { xs: 3, sm: 4 },
        px: 2,
      }}
    >
      <Card
        sx={{
          borderRadius: '16px',
          maxWidth: 480,
          width: '100%',
          mb: { xs: 2, sm: 2.5 },
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          borderTop: '5px solid #23A4E8',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2.5
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                color: '#23A4E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                border: '1px solid #DBEAFE',
                boxShadow: '0 2px 8px rgba(35, 164, 232, 0.12)'
              }}
            >
              <LogoIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '20px', sm: '22px' },
                fontWeight: 700,
                color: '#1E293B',
                mb: 0.5,
                textAlign: 'center',
                letterSpacing: '-0.01em'
              }}
            >
              Complete Employee Registration
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: '#64748B', textAlign: 'center' }}>
              Set up your credentials to join your workspace
            </Typography>
          </Box>

          {/* Invitation verification summary banner */}
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              mb: 2.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ValidIcon sx={{ color: '#0284C7', fontSize: 18 }} />
              <Typography sx={{ color: '#0369A1', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Official Invitation
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
              {invitation.work_email || invitation.email}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {invitation.designation && (
                <Chip size="small" label={invitation.designation} sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 600, fontSize: '11px', height: 22 }} />
              )}
              {invitation.department?.name && (
                <Chip size="small" label={invitation.department.name} sx={{ bgcolor: '#E2E8F0', color: '#334155', fontWeight: 600, fontSize: '11px', height: 22 }} />
              )}
            </Stack>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '13px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* First & Last Name Grid - Labels ABOVE fields */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
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
                      height: 48,
                      borderRadius: '10px',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#23A4E8' },
                      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '12px 14px',
                      fontSize: '14px',
                      color: '#0F172A'
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
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
                      height: 48,
                      borderRadius: '10px',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#23A4E8' },
                      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '12px 14px',
                      fontSize: '14px',
                      color: '#0F172A'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Phone Number - Label ABOVE field */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Phone Number
              </Typography>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 48,
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#0F172A'
                  }
                }}
              />
            </Box>

            {/* Password - Label ABOVE field */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Password <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#94A3B8', '&:hover': { color: '#23A4E8' } }}
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: '20px' }} /> : <Visibility sx={{ fontSize: '20px' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 48,
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    paddingRight: '12px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#0F172A'
                  }
                }}
              />
            </Box>

            {/* Confirm Password - Label ABOVE field */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Confirm Password <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                id="confirm_password"
                name="confirm_password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={formData.confirm_password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 48,
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#0F172A'
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={registerMutation.isPending}
              sx={{
                bgcolor: '#23A4E8',
                fontWeight: 600,
                borderRadius: '10px',
                py: 1.3,
                color: 'white',
                textTransform: 'none',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(35, 164, 232, 0.25)',
                '&:hover': { bgcolor: '#1E92D1', boxShadow: '0 6px 16px rgba(35, 164, 232, 0.35)' },
                mb: 2
              }}
            >
              {registerMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Complete Registration'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                component={Link}
                to="/login"
                sx={{
                  fontSize: '13px',
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

        {/* Security Footer */}
        <Box
          sx={{
            bgcolor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            py: 1.8,
            px: 2.5,
            borderTop: '1px solid #F1F5F9'
          }}
        >
          <SecurityIcon sx={{ color: '#10B981', fontSize: 18 }} />
          <Typography sx={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            Protected by 256-bit SSL Security
          </Typography>
        </Box>
      </Card>

      {/* Outer Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', justifyContent: 'center', mb: 1 }}>
        {['Employee Self-Service', 'Leave Policies', 'Support'].map((text, index, array) => (
          <React.Fragment key={text}>
            <Typography
              sx={{
                fontSize: '13px',
                color: '#64748B',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              {text}
            </Typography>
            {index < array.length - 1 && (
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
            )}
          </React.Fragment>
        ))}
      </Box>
      <Typography sx={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
        © {new Date().getFullYear()} staffEase. All rights reserved.
      </Typography>
    </Box>
  );
}
