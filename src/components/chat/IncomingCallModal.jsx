/**
 * ====================================================================
 *  staffEase Simple & Elegant Incoming Call Modal
 * ====================================================================
 */

import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Call as AcceptCallIcon,
  CallEnd as DeclineCallIcon,
} from '@mui/icons-material';
import { useCall } from '../../common/CallContext';
import { getAvatarFullUrl } from './chatUtils';

export default function IncomingCallModal() {
  const { callState, acceptCall, rejectCall } = useCall();

  if (callState.status !== 'incoming') {
    return null;
  }

  const isVideo = callState.callType === 'video';
  const caller = callState.caller || {};

  return (
    <Dialog
      open={true}
      onClose={rejectCall}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: '#1E293B !important',
            color: '#FFFFFF',
            p: 3.5,
            width: '100%',
            maxWidth: 360,
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: '#1E293B !important',
          color: '#FFFFFF',
          p: 3.5,
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          src={getAvatarFullUrl(caller.avatar)}
          sx={{
            width: 80,
            height: 80,
            bgcolor: '#5B5FC7',
            fontSize: '30px',
            fontWeight: 700,
            mb: 2,
            border: '3px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {caller.name?.[0]?.toUpperCase() || 'S'}
        </Avatar>

        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>
          {caller.name || 'Staff Member'}
        </Typography>

        <Typography sx={{ fontSize: '13px', color: '#94A3B8', mb: 3.5 }}>
          {isVideo ? 'Incoming Video Call...' : 'Incoming Voice Call...'}
        </Typography>

        {/* Accept and Decline Action Buttons */}
        <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
          {/* Decline Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
            <Tooltip title="Decline">
              <IconButton
                onClick={rejectCall}
                sx={{
                  bgcolor: '#EF4444',
                  color: '#FFFFFF',
                  width: 52,
                  height: 52,
                  '&:hover': { bgcolor: '#DC2626' },
                }}
              >
                <DeclineCallIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
            <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>Decline</Typography>
          </Box>

          {/* Accept Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
            <Tooltip title="Accept">
              <IconButton
                onClick={acceptCall}
                sx={{
                  bgcolor: '#10B981',
                  color: '#FFFFFF',
                  width: 52,
                  height: 52,
                  '&:hover': { bgcolor: '#059669' },
                }}
              >
                <AcceptCallIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
            <Typography sx={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>Accept</Typography>
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
}
