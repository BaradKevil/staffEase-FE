/**
 * ====================================================================
 *  staffEase Incoming Call Notification Modal (Obsidian Luxe Theme)
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
  VideocamRounded as VideoIcon,
  PhoneRounded as VoiceIcon,
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
            borderRadius: '28px',
            bgcolor: '#0B0F19 !important',
            color: '#FFFFFF',
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'radial-gradient(ellipse at top, #1A1E36 0%, #0B0F19 80%)',
          },
        },
        backdrop: {
          sx: {
            bgcolor: 'rgba(5, 8, 15, 0.8)',
            backdropFilter: 'blur(10px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '28px',
          bgcolor: '#0B0F19 !important',
          color: '#FFFFFF',
          p: 4,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'radial-gradient(ellipse at top, #1A1E36 0%, #0B0F19 80%)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Pulsing ring animation around caller avatar */}
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          {/* Outer Pulsing Wave */}
          <Box
            sx={{
              position: 'absolute',
              inset: -24,
              borderRadius: '50%',
              bgcolor: isVideo ? 'rgba(91, 95, 199, 0.25)' : 'rgba(16, 185, 129, 0.25)',
              animation: 'ringPulse 2s infinite cubic-bezier(0.2, 0.8, 0.2, 1)',
              '@keyframes ringPulse': {
                '0%': { transform: 'scale(0.85)', opacity: 0.9 },
                '50%': { transform: 'scale(1.35)', opacity: 0.15 },
                '100%': { transform: 'scale(0.85)', opacity: 0.9 },
              },
            }}
          />

          {/* Inner Pulsing Wave */}
          <Box
            sx={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              bgcolor: isVideo ? 'rgba(99, 102, 241, 0.35)' : 'rgba(16, 185, 129, 0.35)',
              animation: 'ringPulse 2s infinite cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s',
            }}
          />

          <Avatar
            src={getAvatarFullUrl(caller.avatar)}
            sx={{
              width: 90,
              height: 90,
              bgcolor: isVideo ? '#5B5FC7' : '#10B981',
              fontSize: '32px',
              fontWeight: 700,
              border: '4px solid #1E293B',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {caller.name?.[0]?.toUpperCase() || 'S'}
          </Avatar>
        </Box>

        <Typography sx={{ fontSize: '21px', fontWeight: 700, color: '#FFFFFF', mb: 0.6 }}>
          {caller.name || 'Staff Member'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#94A3B8',
            fontSize: '13px',
            mb: 4,
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            px: 2,
            py: 0.6,
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {isVideo ? (
            <VideoIcon sx={{ fontSize: 18, color: '#818CF8' }} />
          ) : (
            <VoiceIcon sx={{ fontSize: 18, color: '#34D399' }} />
          )}
          <span>Incoming {isVideo ? 'HD Video' : 'Voice'} Call...</span>
        </Box>

        {/* Accept and Decline Action Buttons */}
        <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
          {/* Decline Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Decline Call">
              <IconButton
                onClick={rejectCall}
                sx={{
                  bgcolor: '#EF4444',
                  color: '#FFFFFF',
                  width: 58,
                  height: 58,
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#DC2626',
                    transform: 'scale(1.08)',
                    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.7)',
                  },
                }}
              >
                <DeclineCallIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Decline</Typography>
          </Box>

          {/* Accept Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`Accept ${isVideo ? 'Video' : 'Voice'} Call`}>
              <IconButton
                onClick={acceptCall}
                sx={{
                  bgcolor: '#10B981',
                  color: '#FFFFFF',
                  width: 58,
                  height: 58,
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#059669',
                    transform: 'scale(1.08)',
                    boxShadow: '0 8px 24px rgba(5, 150, 105, 0.7)',
                  },
                }}
              >
                <AcceptCallIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Typography sx={{ fontSize: '12px', color: '#34D399', fontWeight: 700 }}>Accept</Typography>
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
}
