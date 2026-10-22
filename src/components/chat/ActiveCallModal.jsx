/**
 * ====================================================================
 *  staffEase Simple & Elegant Calling Interface
 * ====================================================================
 *
 * Clean, minimalist WebRTC audio & video call modal:
 *  - Distraction-free layout: no nested boxes or heavy animations
 *  - Compact card for voice calls & waiting states (460px)
 *  - Smooth expansion to widescreen for active video calls (780px)
 *  - Simple circular control buttons
 *  - Screen sharing available only in video calls once connected
 */

import React, { useEffect, useRef } from 'react';
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
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VideocamRounded as VideoIcon,
  VideocamOffRounded as VideoOffIcon,
  ScreenShareRounded as ScreenShareIcon,
  StopScreenShareRounded as StopScreenShareIcon,
  CallEndRounded as EndCallIcon,
} from '@mui/icons-material';
import { useCall } from '../../common/CallContext';

/**
 * Clean Video Tile
 */
function VideoTile({
  stream,
  name,
  isLocal = false,
  isCamOff = false,
  isMicMuted = false,
  isScreenSharing = false,
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
        bgcolor: '#0F172A',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{
          width: '100%',
          height: '100%',
          objectFit: isScreenSharing ? 'contain' : 'cover',
          display: hasVideo ? 'block' : 'none',
          transform: isLocal && !isScreenSharing ? 'scaleX(-1)' : 'none',
          backgroundColor: '#000000',
        }}
      />

      {!hasVideo && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 68,
              height: 68,
              bgcolor: '#5B5FC7',
              fontSize: '26px',
              fontWeight: 700,
              mb: 1.2,
            }}
          >
            {name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>
            {isCamOff ? 'Camera off' : name}
          </Typography>
        </Box>
      )}

      {/* Bottom Name Tag */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          bgcolor: 'rgba(0, 0, 0, 0.65)',
          px: 1,
          py: 0.35,
          borderRadius: '6px',
        }}
      >
        <Typography sx={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 500 }}>
          {isScreenSharing
            ? isLocal
              ? 'Your Screen'
              : `${name}'s Screen`
            : isLocal
            ? `${name} (You)`
            : name}
        </Typography>
        {isMicMuted && <MicOffIcon sx={{ fontSize: 13, color: '#EF4444' }} />}
      </Box>
    </Box>
  );
}

export default function ActiveCallModal() {
  const {
    callState,
    localStream,
    remoteStreams,
    peerMediaStates = {},
    isMicMuted,
    isCamOff,
    isScreenSharing,
    callDuration,
    endCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  } = useCall();

  if (callState.status !== 'calling' && callState.status !== 'connected') {
    return null;
  }

  const isVideoCall = callState.callType === 'video';
  const isConnected = callState.status === 'connected';
  const remoteUserIds = Object.keys(remoteStreams);
  const isOneOnOne = !callState.isGroup && remoteUserIds.length <= 1;
  const isRemoteScreenSharing =
    remoteUserIds.length > 0 && Boolean(peerMediaStates?.[remoteUserIds[0]]?.isScreenSharing);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const showVideoStage = isVideoCall && isConnected;

  return (
    <Dialog
      open={true}
      onClose={endCall}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: '#1E293B !important',
            color: '#FFFFFF',
            width: '100%',
            maxWidth: showVideoStage ? 780 : 440,
            height: showVideoStage ? '72vh' : 'auto',
            maxHeight: showVideoStage ? 560 : 420,
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'max-width 0.25s ease, height 0.25s ease',
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
          width: '100%',
          maxWidth: showVideoStage ? 780 : 440,
          height: showVideoStage ? '72vh' : 'auto',
          maxHeight: showVideoStage ? 560 : 420,
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'max-width 0.25s ease, height 0.25s ease',
        },
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* Clean Minimal Header Bar                                      */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: '#1E293B',
        }}
      >
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
          {callState.isGroup ? 'Group Call' : isVideoCall ? 'Video Call' : 'Voice Call'}
        </Typography>

        {isConnected ? (
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
            ● {formatDuration(callDuration)}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#F59E0B' }}>
            Calling...
          </Typography>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Main Calling Stage                                            */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flexGrow: 1,
          p: showVideoStage ? 1.5 : 3.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0F172A',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {showVideoStage ? (
          /* Active Connected Video Presentation */
          isOneOnOne ? (
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              {remoteUserIds.length > 0 ? (
                <VideoTile
                  stream={remoteStreams[remoteUserIds[0]]}
                  name={callState.title}
                  isLocal={false}
                  isScreenSharing={isRemoteScreenSharing}
                />
              ) : (
                <VideoTile
                  stream={localStream}
                  name="You"
                  isLocal={true}
                  isCamOff={isCamOff}
                  isMicMuted={isMicMuted}
                  isScreenSharing={isScreenSharing}
                />
              )}

              {/* Local Video Thumbnail PiP */}
              {remoteUserIds.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    width: 140,
                    height: 95,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                    zIndex: 10,
                  }}
                >
                  <VideoTile
                    stream={localStream}
                    name="You"
                    isLocal={true}
                    isCamOff={isCamOff}
                    isMicMuted={isMicMuted}
                    isScreenSharing={isScreenSharing}
                  />
                </Box>
              )}
            </Box>
          ) : (
            /* Multi-Party Group Video Grid */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: remoteUserIds.length >= 3 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(260px, 1fr))',
                },
                gridAutoRows: '1fr',
              }}
            >
              <VideoTile
                stream={localStream}
                name="You"
                isLocal={true}
                isCamOff={isCamOff}
                isMicMuted={isMicMuted}
                isScreenSharing={isScreenSharing}
              />
              {remoteUserIds.map((uid) => (
                <VideoTile
                  key={uid}
                  stream={remoteStreams[uid]}
                  name={`Participant ${uid}`}
                  isLocal={false}
                  isScreenSharing={Boolean(peerMediaStates?.[uid]?.isScreenSharing)}
                />
              ))}
            </Box>
          )
        ) : (
          /* Simple & Elegant Voice Call / Calling State */
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#5B5FC7',
                fontSize: '30px',
                fontWeight: 700,
                mb: 2,
                border: '3px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {callState.title?.[0]?.toUpperCase() || 'U'}
            </Avatar>

            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>
              {callState.title || 'Staff Call'}
            </Typography>

            <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>
              {isConnected ? 'Call in progress' : 'Ringing...'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* Clean Bottom Controls Bar                                     */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#1E293B',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Microphone Toggle */}
          <Tooltip title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}>
            <IconButton
              onClick={toggleMic}
              sx={{
                bgcolor: isMicMuted ? '#EF4444' : '#334155',
                color: '#FFFFFF',
                width: 44,
                height: 44,
                '&:hover': { bgcolor: isMicMuted ? '#DC2626' : '#475569' },
              }}
            >
              {isMicMuted ? <MicOffIcon sx={{ fontSize: 20 }} /> : <MicIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          {/* Camera Toggle (Video Calls Only) */}
          {isVideoCall && (
            <Tooltip title={isCamOff ? 'Turn Camera On' : 'Turn Camera Off'}>
              <IconButton
                onClick={toggleCam}
                sx={{
                  bgcolor: isCamOff ? '#EF4444' : '#334155',
                  color: '#FFFFFF',
                  width: 44,
                  height: 44,
                  '&:hover': { bgcolor: isCamOff ? '#DC2626' : '#475569' },
                }}
              >
                {isCamOff ? <VideoOffIcon sx={{ fontSize: 20 }} /> : <VideoIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
          )}

          {/* Screen Share (ONLY in Video Calls AND ONLY once connected) */}
          {isVideoCall && isConnected && (
            <Tooltip title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}>
              <IconButton
                onClick={toggleScreenShare}
                sx={{
                  bgcolor: isScreenSharing ? '#5B5FC7' : '#334155',
                  color: '#FFFFFF',
                  width: 44,
                  height: 44,
                  '&:hover': { bgcolor: isScreenSharing ? '#4F46E5' : '#475569' },
                }}
              >
                {isScreenSharing ? (
                  <StopScreenShareIcon sx={{ fontSize: 20 }} />
                ) : (
                  <ScreenShareIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>
          )}

          {/* Red End Call Button */}
          <Tooltip title="End Call">
            <IconButton
              onClick={endCall}
              sx={{
                bgcolor: '#EF4444',
                color: '#FFFFFF',
                width: 48,
                height: 48,
                '&:hover': { bgcolor: '#DC2626' },
              }}
            >
              <EndCallIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Dialog>
  );
}
