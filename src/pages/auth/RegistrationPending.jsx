import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { HourglassTopRounded as PendingIcon, ArrowBackRounded as BackIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function RegistrationPending() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        py: { xs: 3, sm: 5, md: 6 },
        px: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      <Card
        sx={{
          my: 'auto',
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          border: '1px solid #EEF2F6',
          textAlign: 'center',
          bgcolor: '#FFFFFF'
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            bgcolor: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}
        >
          <PendingIcon sx={{ fontSize: 38 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, letterSpacing: '-0.02em' }}>
          Registration Submitted!
        </Typography>

        <Typography variant="body1" sx={{ color: '#475569', mb: 2, lineHeight: 1.6 }}>
          Thank you for completing your registration details. Your account is currently awaiting administrative approval from HR.
        </Typography>

        <Box
          sx={{
            p: 2.5,
            bgcolor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'left',
            mb: 4
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
            What happens next?
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.5 }}>
            1. An administrator will review and verify your onboarding application.
            <br />
            2. Upon approval, your annual leave entitlements (CL & SL) will be initialized automatically.
            <br />
            3. You will receive an email confirmation when your account is ready for login.
          </Typography>
        </Box>

        <Button
          component={Link}
          to="/login"
          variant="outlined"
          startIcon={<BackIcon />}
          fullWidth
          sx={{
            borderRadius: '12px',
            py: 1.25,
            fontWeight: 600,
            color: '#23A4E8',
            borderColor: '#BAE6FD',
            '&:hover': {
              borderColor: '#23A4E8',
              bgcolor: '#F0F9FF'
            }
          }}
        >
          Back to Login
        </Button>
      </Card>
    </Box>
  );
}
