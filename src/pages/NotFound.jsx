import React from 'react';
import { Box, Typography, Button, Card } from '@mui/material';
import { HomeRounded as HomeIcon, SentimentDissatisfiedRounded as SadIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card
        sx={{
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
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}
        >
          <SadIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          404
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 1.5 }}>
          Page Not Found
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>

        <Button
          component={Link}
          to="/"
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            bgcolor: '#23A4E8',
            '&:hover': { bgcolor: '#1D8BC4' },
            borderRadius: '12px',
            py: 1.25,
            px: 3,
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          Back to Home
        </Button>
      </Card>
    </Box>
  );
}
