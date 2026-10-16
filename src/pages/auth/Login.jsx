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
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  CorporateFare as LogoIcon,
  Security as SecurityIcon
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
          maxWidth: 440,
          width: '100%',
          mb: { xs: 2, sm: 2.5 },
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          borderTop: '5px solid #23A4E8',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Brand Logo & Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: { xs: 2.5, sm: 3 }
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
              Sign in to your account
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: '#64748B', textAlign: 'center' }}>
              Employee & Leave Management Portal
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '13px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Address Field - Label ABOVE Input */}
            <Box sx={{ mb: { xs: 1.8, sm: 2.2 } }}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 48,
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px',
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

            {/* Password Field - Label ABOVE Input */}
            <Box sx={{ mb: 1.2 }}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Password <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                    '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px',
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

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: { xs: 2, sm: 2.5 } }}>
              <Typography
                component={Link}
                to="/forgot-password"
                sx={{
                  fontSize: '13px',
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
                borderRadius: '10px',
                py: 1.3,
                color: 'white',
                textTransform: 'none',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(35, 164, 232, 0.25)',
                '&:hover': { bgcolor: '#1E92D1', boxShadow: '0 6px 16px rgba(35, 164, 232, 0.35)' },
              }}
            >
              {loginMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Log In'}
            </Button>
          </Box>
        </Box>

        {/* Inside Card Security Footer */}
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

      {/* Outer Page Footer */}
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
        © {new Date().getFullYear()} LeaveFlow. All rights reserved.
      </Typography>
    </Box>
  );
}
