import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  ArrowBackRounded as BackIcon,
  LockResetRounded as ResetIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const forgotMutation = useForgotPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your work email address');
      return;
    }

    try {
      await forgotMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        work_email: email.trim().toLowerCase()
      });
      setSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send password reset link';
      setErrorMsg(msg);
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
          {/* Header */}
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
              <ResetIcon sx={{ fontSize: 28 }} />
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
              Reset your password
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: '#64748B', textAlign: 'center', lineHeight: 1.4 }}>
              Enter your work email and we will send you a secure password reset link.
            </Typography>
          </Box>

          {submitted ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px', textAlign: 'left', fontSize: '13px' }}>
                If an active account exists for <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
              </Alert>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                startIcon={<BackIcon />}
                fullWidth
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  fontWeight: 600,
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#23A4E8', bgcolor: '#F0F9FF', color: '#23A4E8' }
                }}
              >
                Back to Sign In
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '13px' }}>
                  {errorMsg}
                </Alert>
              )}

              {/* Email Address Field - Label ABOVE Input */}
              <Box sx={{ mb: 2.5 }}>
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

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={forgotMutation.isPending}
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
                {forgotMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
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
