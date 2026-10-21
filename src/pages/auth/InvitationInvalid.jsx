import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { ErrorOutlineRounded as ErrorIcon, ArrowBackRounded as BackIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function InvitationInvalid({ message }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
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
            bgcolor: '#FEE2E2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}
        >
          <ErrorIcon sx={{ fontSize: 38 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
          Invalid or Expired Invitation
        </Typography>

        <Typography variant="body1" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
          {message || 'This onboarding invitation link is invalid, expired, or has already been used to register an account.'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748B', mb: 4, bgcolor: '#F8FAFC', p: 2, borderRadius: '10px' }}>
          Please reach out to your HR administrator to request a new invitation link.
        </Typography>

        <Button
          component={Link}
          to="/login"
          variant="contained"
          startIcon={<BackIcon />}
          fullWidth
          sx={{
            bgcolor: '#23A4E8',
            '&:hover': { bgcolor: '#1D8BC4' },
            borderRadius: '12px',
            py: 1.25,
            fontWeight: 600
          }}
        >
          Go to Login
        </Button>
      </Card>
    </Box>
  );
}
