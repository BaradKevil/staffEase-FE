/**
 * ===========================================
 *  403 Not Authorized Fallback Screen
 * ===========================================
 */

import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const NotAuthorized = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage =
    searchParams.get('error') ||
    sessionStorage.getItem('not_authorized_message') ||
    'You do not have permission to access this resource or perform this action.';

  const handleReturn = () => {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          p: 4,
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#FEF2F2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', mb: 1 }}>
          Access Denied
        </Typography>

        <Typography sx={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, mb: 3 }}>
          {errorMessage}
        </Typography>

        <Button
          variant="contained"
          onClick={handleReturn}
          sx={{
            bgcolor: '#23A4E8',
            color: '#FFFFFF',
            fontWeight: 600,
            borderRadius: '10px',
            px: 3,
            py: 1.2,
            '&:hover': { bgcolor: '#1B8ECB' },
          }}
        >
          Return to Dashboard
        </Button>
      </Card>
    </Box>
  );
};

export default NotAuthorized;
