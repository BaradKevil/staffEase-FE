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
  LockOutlined as LockIcon,
  CheckCircleRounded as SuccessIcon,
  Security as SecurityIcon,
  ArrowBackRounded as BackIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useResetPassword } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const resetMutation = useResetPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      await resetMutation.mutateAsync({
        token,
        password
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to reset password. The link may have expired.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F4F7FA',
          p: 2
        }}
      >
        <Card
          sx={{
            maxWidth: 440,
            width: '100%',
            p: 4,
            textAlign: 'center',
            borderRadius: '16px',
            borderTop: '5px solid #23A4E8',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}
        >
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
            Invalid or missing password reset token in the URL.
          </Alert>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            sx={{ bgcolor: '#23A4E8', borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Go to Login
          </Button>
        </Card>
      </Box>
    );
  }

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
              <LockIcon sx={{ fontSize: 28 }} />
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
              Set New Password
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: '#64748B', textAlign: 'center' }}>
              Choose a secure password for your staffEase account
            </Typography>
          </Box>

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  bgcolor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <SuccessIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Password Updated!
              </Typography>
              <Typography sx={{ fontSize: '13.5px', color: '#64748B', mb: 3 }}>
                Your password has been successfully reset. You can now sign in with your new credentials.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#23A4E8',
                  borderRadius: '10px',
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '15px'
                }}
              >
                Sign In Now
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '13px' }}>
                  {errorMessage}
                </Alert>
              )}

              {/* New Password Field - Label ABOVE Input */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  New Password <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
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

              {/* Confirm Password Field - Label ABOVE Input */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={resetMutation.isPending}
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
                {resetMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Update Password'}
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: '#23A4E8' }
                  }}
                >
                  <BackIcon sx={{ fontSize: 16 }} /> Back to Sign In
                </Typography>
              </Box>
            </Box>
          )}
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
