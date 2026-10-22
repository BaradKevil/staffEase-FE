import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CorporateFare as LogoIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      const payload = await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        work_email: email.trim().toLowerCase(),
        password
      });

      const user = payload?.user;
      const tokens = payload?.tokens;
      const roleName = user?.role?.name || (typeof user?.role === 'string' ? user.role : 'employee');

      if (tokens?.access_token) {
        localStorage.setItem('accessToken', tokens.access_token);
      }
      if (tokens?.refresh_token) {
        localStorage.setItem('refreshToken', tokens.refresh_token);
      }
      if (roleName) {
        localStorage.setItem('role', roleName);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      toast.success(`Welcome back, ${user?.first_name || 'User'}!`);

      if (roleName === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid email or password';
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
          maxWidth: 440,
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
        <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
          {/* Brand Logo & Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                color: '#23A4E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.2,
                border: '1px solid #DBEAFE',
                boxShadow: '0 2px 6px rgba(35, 164, 232, 0.1)'
              }}
            >
              <LogoIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '19px', sm: '21px' },
                fontWeight: 700,
                color: '#1E293B',
                mb: 0.3,
                textAlign: 'center',
                letterSpacing: '-0.01em'
              }}
            >
              Sign in to your account
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
              Employee & Leave Management Portal
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, py: 0.5, borderRadius: '8px', fontSize: '12.5px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Address Field */}
            <Box sx={{ mb: 1.8 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                Work Email <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 44,
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '11px 14px',
                    fontSize: '14px',
                    color: '#0F172A',
                    '&::placeholder': {
                      color: '#94A3B8',
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>

            {/* Password Field with View Eye Button */}
            <Box sx={{ mb: 1.2 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
                Password <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
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
                      padding: '11px 14px',
                      fontSize: '14px',
                      color: '#0F172A',
                      '&::placeholder': {
                        color: '#94A3B8',
                        opacity: 1
                      }
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

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Typography
                component={Link}
                to="/forgot-password"
                sx={{
                  fontSize: '12.5px',
                  color: '#23A4E8',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot Password?
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loginMutation.isPending}
              sx={{
                bgcolor: '#23A4E8',
                fontWeight: 600,
                borderRadius: '8px',
                py: 1.15,
                color: 'white',
                textTransform: 'none',
                fontSize: '14.5px',
                boxShadow: '0 4px 12px rgba(35, 164, 232, 0.25)',
                '&:hover': { bgcolor: '#1E92D1', boxShadow: '0 6px 16px rgba(35, 164, 232, 0.35)' },
              }}
            >
              {loginMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Log In'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
