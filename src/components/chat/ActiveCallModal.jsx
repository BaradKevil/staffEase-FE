/**
 * ====================================================================
 *  staffEase Next-Gen Video & Voice Call Stage (Obsidian Luxe Theme)
 * ====================================================================
 *
 * Premium WebRTC calling interface featuring:
 *  - Obsidian Dark Glassmorphism aesthetic (Deep slate / Indigo gradient)
 *  - Smooth multi-layer radar ripple pulses for incoming/outgoing ring states
 *  - Dynamic voice wave frequency bars
 *  - Floating pill control island (Mic, Camera, Screen Share, End Call)
 *  - Picture-in-Picture (PiP) collapsible mode to multitask within chat
 *  - Fullscreen immersive toggle
 *  - Responsive grid layout for 1-on-1 and multi-party group conferences
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VideocamRounded as VideoIcon,
  VideocamOffRounded as VideoOffIcon,
  ScreenShareRounded as ScreenShareIcon,
  StopScreenShareRounded as StopScreenShareIcon,
  CallEndRounded as EndCallIcon,
  FullscreenRounded as FullscreenIcon,
  FullscreenExitRounded as FullscreenExitIcon,
  OpenInFullRounded as MaximizeIcon,
  CloseFullscreenRounded as MinimizeIcon,
  LockOutlined as EncryptedIcon,
} from '@mui/icons-material';
import { useCall } from '../../common/CallContext';

/**
 * Individual Video Tile for participant streams
 */
function VideoTile({
  stream,
  name,
  isLocal = false,
  isCamOff = false,
  isMicMuted = false,
  avatarSrc = null,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0 && !isCamOff;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 180,
        bgcolor: '#0E1320',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        background: 'linear-gradient(145deg, #13192B 0%, #0A0E1A 100%)',
      }}
    >
      {/* Video Stream Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local audio to eliminate feedback echo loops
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: hasVideo ? 'block' : 'none',
          transform: isLocal ? 'scaleX(-1)' : 'none', // Natural mirror preview
        }}
      />

      {/* Fallback Glass Avatar Tile when camera is turned off */}
      {!hasVideo && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar
              src={avatarSrc}
              sx={{
                width: 84,
                height: 84,
                bgcolor: '#5B5FC7',
                fontSize: '32px',
                fontWeight: 700,
                border: '3px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 10px 30px rgba(91, 95, 199, 0.35)',
              }}
            >
              {name?.[0]?.toUpperCase() || 'S'}
            </Avatar>
          </Box>
          <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', mb: 0.5 }}>
            {isLocal ? `${name} (You)` : name}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
            {isCamOff ? 'Camera turned off' : 'Audio Only'}
          </Typography>
        </Box>
      )}

      {/* Floating Name & Status Badge Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          bgcolor: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(12px)',
          px: 1.4,
          py: 0.6,
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9' }}>
          {isLocal ? `${name} (You)` : name}
        </Typography>
        {isMicMuted ? (
          <MicOffIcon sx={{ fontSize: 14, color: '#EF4444' }} />
        ) : (
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
        )}
      </Box>
    </Box>
  );
}

export default function ActiveCallModal() {
  const {
    callState,
    localStream,
    remoteStreams,
    isMicMuted,
    isCamOff,
    isScreenSharing,
    callDuration,
    endCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  } = useCall();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Return nothing if not actively in calling or connected state
  if (callState.status !== 'calling' && callState.status !== 'connected') {
    return null;
  }

  const isVideoCall = callState.callType === 'video';
  const remoteUserIds = Object.keys(remoteStreams);
  const isOneOnOne = !callState.isGroup && remoteUserIds.length <= 1;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // --------------------------------------------------------------------------
  // 1. Minimized Picture-in-Picture Floating Widget
  // --------------------------------------------------------------------------
  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 320,
          height: 190,
          zIndex: 9999,
          bgcolor: '#0B0F19',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.14)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Minimized Content: Remote video feed or pulse avatar */}
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          {remoteUserIds.length > 0 ? (
            <VideoTile
              stream={remoteStreams[remoteUserIds[0]]}
              name={callState.title}
              isLocal={false}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#0F172A',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: '#5B5FC7',
                  fontSize: '20px',
                  fontWeight: 700,
                  mb: 1,
                  boxShadow: '0 4px 16px rgba(91, 95, 199, 0.4)',
                }}
              >
                {callState.title?.[0]?.toUpperCase() || 'S'}
              </Avatar>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }} noWrap>
                {callState.title}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                {callState.status === 'calling' ? 'Calling...' : formatDuration(callDuration)}
              </Typography>
            </Box>
          )}

          {/* Top-Right Expand Button */}
          <IconButton
            size="small"
            onClick={() => setIsMinimized(false)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              p: 0.6,
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            <MaximizeIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Compact Dock */}
        <Box
          sx={{
            py: 1,
            px: 2,
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <IconButton
            size="small"
            onClick={toggleMic}
            sx={{
              bgcolor: isMicMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              width: 34,
              height: 34,
              '&:hover': { bgcolor: isMicMuted ? '#DC2626' : 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            {isMicMuted ? <MicOffIcon sx={{ fontSize: 16 }} /> : <MicIcon sx={{ fontSize: 16 }} />}
          </IconButton>

          <IconButton
            size="small"
            onClick={endCall}
            sx={{
              bgcolor: '#EF4444',
              color: '#FFFFFF',
              width: 36,
              height: 36,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.45)',
              '&:hover': { bgcolor: '#DC2626' },
            }}
          >
            <EndCallIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // --------------------------------------------------------------------------
  // 2. Full Cinematic Calling Modal Stage
  // --------------------------------------------------------------------------
  return (
    <Dialog
      open={true}
      fullScreen={isFullscreen}
      maxWidth={isFullscreen ? false : 'md'}
      slotProps={{
        paper: {
          sx: {
            borderRadius: isFullscreen ? 0 : '28px',
            bgcolor: '#0B0F19 !important',
            color: '#FFFFFF',
            width: isFullscreen ? '100vw' : '100%',
            maxWidth: isFullscreen ? '100vw' : 880,
            height: isFullscreen ? '100vh' : '82vh',
            maxHeight: isFullscreen ? '100vh' : 620,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 35px 90px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
            background: 'radial-gradient(ellipse at top, #1A1E36 0%, #0B0F19 75%)',
          },
        },
        backdrop: {
          sx: {
            bgcolor: 'rgba(5, 8, 15, 0.78)',
            backdropFilter: 'blur(10px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: isFullscreen ? 0 : '28px',
          bgcolor: '#0B0F19 !important',
          color: '#FFFFFF',
          width: isFullscreen ? '100vw' : '100%',
          maxWidth: isFullscreen ? '100vw' : 880,
          height: isFullscreen ? '100vh' : '82vh',
          maxHeight: isFullscreen ? '100vh' : 620,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 35px 90px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
          background: 'radial-gradient(ellipse at top, #1A1E36 0%, #0B0F19 75%)',
        },
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Top Header Bar (Frosted Glass)                                */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 1.6,
          bgcolor: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10,
        }}
      >
        {/* Left: Participant Info & Encryption Badge */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#5B5FC7',
              fontSize: '15px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(91, 95, 199, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {callState.title?.[0]?.toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}
              noWrap
            >
              {callState.title || 'Staff Call'}
            </Typography>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Typography sx={{ fontSize: '11.5px', color: '#94A3B8' }}>
                {callState.isGroup ? 'Group Call' : 'Direct Call'}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B' }}>•</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#10B981', fontSize: '11px', fontWeight: 500 }}>
                <EncryptedIcon sx={{ fontSize: 12 }} />
                <span>P2P Encrypted</span>
              </Box>
            </Stack>
          </Box>
        </Stack>

        {/* Right: Duration Pill, PiP Minimize, Fullscreen Controls */}
        <Stack direction="row" spacing={1.2} alignItems="center">
          {callState.status === 'calling' ? (
            <Chip
              label="Calling..."
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                fontWeight: 700,
                fontSize: '11.5px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                height: 26,
              }}
            />
          ) : (
            <Chip
              label={`● Connected  ${formatDuration(callDuration)}`}
              size="small"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                fontWeight: 700,
                fontSize: '11.5px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                height: 26,
              }}
            />
          )}

          {/* Minimize / Floating PiP Button */}
          <Tooltip title="Minimize to Corner (Keep Talking)">
            <IconButton
              size="small"
              onClick={() => setIsMinimized(true)}
              sx={{
                color: '#94A3B8',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                p: 0.8,
                borderRadius: '10px',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.12)' },
              }}
            >
              <MinimizeIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Fullscreen Toggle Button */}
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{
                color: '#94A3B8',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                p: 0.8,
                borderRadius: '10px',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.12)' },
              }}
            >
              {isFullscreen ? <FullscreenExitIcon sx={{ fontSize: 18 }} /> : <FullscreenIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Main Calling Stage & Media Feed Area                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          bgcolor: 'transparent',
        }}
      >
        {isOneOnOne ? (
          /* 1-on-1 Presentation */
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            {remoteUserIds.length > 0 ? (
              <VideoTile
                stream={remoteStreams[remoteUserIds[0]]}
                name={callState.title}
                isLocal={false}
              />
            ) : (
              /* Outgoing Call Waiting Stage with Ambient Radar Waves */
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '24px',
                  bgcolor: 'rgba(15, 23, 42, 0.55)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Multi-layered Concentric Radar Wave Pulses */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 130,
                    height: 130,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  {/* Outer Radar Wave */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -32,
                      borderRadius: '50%',
                      border: '2px solid rgba(91, 95, 199, 0.35)',
                      animation: 'callRipple 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1)',
                      '@keyframes callRipple': {
                        '0%': { transform: 'scale(0.85)', opacity: 0.8 },
                        '50%': { transform: 'scale(1.35)', opacity: 0.15 },
                        '100%': { transform: 'scale(0.85)', opacity: 0.8 },
                      },
                    }}
                  />

                  {/* Inner Radar Wave */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -16,
                      borderRadius: '50%',
                      border: '2px solid rgba(99, 102, 241, 0.5)',
                      animation: 'callRipple 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s',
                    }}
                  />

                  {/* High-Resolution Center Avatar */}
                  <Avatar
                    sx={{
                      width: 96,
                      height: 96,
                      bgcolor: '#5B5FC7',
                      fontSize: '36px',
                      fontWeight: 700,
                      border: '4px solid #1E293B',
                      boxShadow: '0 12px 35px rgba(91, 95, 199, 0.45)',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {callState.title?.[0]?.toUpperCase() || 'S'}
                  </Avatar>
                </Box>

                {/* Staff Member Title */}
                <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', mb: 0.8 }}>
                  {callState.title}
                </Typography>

                {/* Animated Ringing Status Pill */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    px: 2.2,
                    py: 0.8,
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#F59E0B',
                      boxShadow: '0 0 10px #F59E0B',
                      animation: 'blinkLight 1.4s infinite ease-in-out',
                      '@keyframes blinkLight': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.2 },
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>
                    Ringing... Waiting for response
                  </Typography>
                </Box>

                {/* Frequency soundwave bars */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: 3, height: 24 }}>
                  {[0.4, 0.8, 1.2, 0.7, 1.0, 0.5, 0.9].map((height, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 3.5,
                        height: 18,
                        bgcolor: '#5B5FC7',
                        borderRadius: 2,
                        animation: `audioWave 1.2s infinite ease-in-out ${i * 0.15}s`,
                        '@keyframes audioWave': {
                          '0%, 100%': { transform: 'scaleY(0.35)' },
                          '50%': { transform: 'scaleY(1.2)' },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Local Video Thumbnail Card (Picture-in-Picture inside stage) */}
            {isVideoCall && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  width: { xs: 130, sm: 180 },
                  height: { xs: 90, sm: 125 },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  zIndex: 20,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              >
                <VideoTile
                  stream={localStream}
                  name="You"
                  isLocal={true}
                  isCamOff={isCamOff}
                  isMicMuted={isMicMuted}
                />
              </Box>
            )}
          </Box>
        ) : (
          /* Multi-User Group Calling Responsive Matrix */
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: remoteUserIds.length >= 3 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
                md: remoteUserIds.length >= 5 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(320px, 1fr))',
              },
              gridAutoRows: '1fr',
            }}
          >
            {/* Local Stream Feed */}
            <VideoTile
              stream={localStream}
              name="You"
              isLocal={true}
              isCamOff={isCamOff}
              isMicMuted={isMicMuted}
            />

            {/* Remote Participants Streams */}
            {remoteUserIds.map((uid) => (
              <VideoTile
                key={uid}
                stream={remoteStreams[uid]}
                name={`Participant ${uid}`}
                isLocal={false}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Bottom Floating Glass Island Control Dock                     */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          py: 2.2,
          px: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 15,
        }}
      >
        <Stack
          direction="row"
          spacing={2.2}
          alignItems="center"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            px: 3,
            py: 1.2,
            borderRadius: '40px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Microphone Toggle Button */}
          <Tooltip title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}>
            <IconButton
              onClick={toggleMic}
              sx={{
                bgcolor: isMicMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                width: 48,
                height: 48,
                transition: 'all 0.15s ease',
                boxShadow: isMicMuted ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none',
                '&:hover': {
                  bgcolor: isMicMuted ? '#DC2626' : 'rgba(255, 255, 255, 0.22)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {isMicMuted ? <MicOffIcon sx={{ fontSize: 22 }} /> : <MicIcon sx={{ fontSize: 22 }} />}
            </IconButton>
          </Tooltip>

          {/* Camera Toggle Button (for video calls) */}
          {isVideoCall && (
            <Tooltip title={isCamOff ? 'Turn Camera On' : 'Turn Camera Off'}>
              <IconButton
                onClick={toggleCam}
                sx={{
                  bgcolor: isCamOff ? '#EF4444' : 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  width: 48,
                  height: 48,
                  transition: 'all 0.15s ease',
                  boxShadow: isCamOff ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none',
                  '&:hover': {
                    bgcolor: isCamOff ? '#DC2626' : 'rgba(255, 255, 255, 0.22)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {isCamOff ? <VideoOffIcon sx={{ fontSize: 22 }} /> : <VideoIcon sx={{ fontSize: 22 }} />}
              </IconButton>
            </Tooltip>
          )}

          {/* Screen Share Button */}
          <Tooltip title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}>
            <IconButton
              onClick={toggleScreenShare}
              sx={{
                bgcolor: isScreenSharing ? '#5B5FC7' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                width: 48,
                height: 48,
                transition: 'all 0.15s ease',
                boxShadow: isScreenSharing ? '0 0 18px rgba(91, 95, 199, 0.6)' : 'none',
                '&:hover': {
                  bgcolor: isScreenSharing ? '#4F46E5' : 'rgba(255, 255, 255, 0.22)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {isScreenSharing ? (
                <StopScreenShareIcon sx={{ fontSize: 22 }} />
              ) : (
                <ScreenShareIcon sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Red End Call Capsule Button */}
          <Tooltip title="Leave Call">
            <IconButton
              onClick={endCall}
              sx={{
                bgcolor: '#EF4444',
                color: '#FFFFFF',
                width: 54,
                height: 54,
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.55)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#DC2626',
                  transform: 'scale(1.08)',
                  boxShadow: '0 10px 28px rgba(220, 38, 38, 0.7)',
                },
              }}
            >
              <EndCallIcon sx={{ fontSize: 26 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Dialog>
  );
}
