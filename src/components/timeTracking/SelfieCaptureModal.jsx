/**
 * ===========================================
 *  Selfie Verification & Reason Capture Modal
 * ===========================================
 *
 * Captures real-time selfie verification via webcam
 * when employee toggles status (Active -> Inactive or Inactive -> Active).
 * Enforces mandatory reason when stopping work.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  CameraAltRounded as CameraIcon,
  CameraswitchRounded as SwitchCameraIcon,
  RefreshRounded as RetakeIcon,
  CheckCircleRounded as CheckIcon,
  CloseRounded as CloseIcon,
  WarningAmberRounded as WarningIcon,
  UploadFileRounded as UploadIcon,
} from '@mui/icons-material';

export default function SelfieCaptureModal({
  open,
  onClose,
  onSubmit,
  mode = 'start', // 'start' | 'stop'
  isLoading = false,
}) {
  const isStart = mode === 'start';
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Stop camera tracks cleanly
  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start webcam
  const startCamera = async () => {
    setCameraError('');
    setIsCameraInitializing(true);
    stopMediaStream();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Webcam not supported by your browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in your browser or upload a selfie below.'
          : 'Unable to access your camera. You can capture or upload a selfie image below.'
      );
    } finally {
      setIsCameraInitializing(false);
    }
  };

  // Initialize camera when modal opens
  useEffect(() => {
    if (open) {
      setCapturedImage(null);
      setReason('');
      setReasonError('');
      startCamera();
    } else {
      stopMediaStream();
    }

    return () => {
      stopMediaStream();
    };
  }, [open]);

  // Handle stream attachment to video element when stream is ready
  useEffect(() => {
    if (stream && videoRef.current && !capturedImage) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedImage]);

  // Capture frame from video onto hidden canvas
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Mirror horizontally so it matches the mirrored preview
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    // High quality compressed JPEG (~60-90KB)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedImage(dataUrl);
    stopMediaStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Fallback file upload for desktops without webcam or restricted permissions
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (JPEG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setCapturedImage(dataUrl);
      setCameraError('');
      stopMediaStream();
    };  
    reader.readAsDataURL(file);
  };

  // Final submit
  const handleSubmit = () => {
    if (!capturedImage) {
      setCameraError('Please capture your verification selfie before submitting.');
      return;
    }

    if (!isStart) {
      const trimmed = reason.trim();
      if (trimmed.length < 3) {
        setReasonError('Please provide a valid reason (minimum 3 characters required).');
        return;
      }
      onSubmit({ selfie: capturedImage, reason: trimmed });
    } else {
      onSubmit({ selfie: capturedImage });
    }
  };

  const handleModalClose = () => {
    if (isLoading) return;
    stopMediaStream();
    onClose();
  };

  const isSubmitDisabled =
    isLoading ||
    !capturedImage ||
    (!isStart && reason.trim().length < 3);

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          p: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: '17px',
          color: '#0F172A',
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: isStart ? '#ECFDF5' : '#FEF2F2',
              color: isStart ? '#10B981' : '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CameraIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>
            {isStart ? 'Start Work: Take Selfie' : 'Stop Work: Reason & Selfie'}
          </Typography>
        </Box>

        <IconButton size="small" onClick={handleModalClose} disabled={isLoading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ fontSize: '12.5px', color: '#64748B' }}>
          {isStart
            ? 'A quick verification selfie is required to confirm your attendance and start your live workday timer.'
            : 'Please enter your reason for stopping work and capture a verification selfie to update your status to Inactive.'}
        </Typography>

        {/* Reason Field for Stopping Work */}
        {!isStart && (
          <Box>
            <TextField
              fullWidth
              autoFocus
              multiline
              rows={2}
              required
              label="Reason for stopping work *"
              placeholder="e.g. Lunch break, finished daily tasks, doctor appointment..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim().length >= 3) {
                  setReasonError('');
                }
              }}
              error={Boolean(reasonError)}
              helperText={reasonError || `${reason.trim().length} characters (min 3)`}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '10px' },
              }}
            />
          </Box>
        )}

        {/* Camera / Photo Preview Container */}
        <Box
          sx={{
            width: '100%',
            height: 260,
            bgcolor: '#0F172A',
            borderRadius: '14px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: capturedImage
              ? '2px solid #10B981'
              : '2px solid #E2E8F0',
          }}
        >
          {/* Live Video Feed */}
          {!capturedImage && !cameraError && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror webcam view for natural look
                }}
              />

              {/* Face Guide Oval Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 150,
                  height: 190,
                  borderRadius: '50%',
                  border: '2px dashed rgba(255, 255, 255, 0.7)',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25)',
                }}
              />

              {isCameraInitializing ? (
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    color: '#FFFFFF',
                  }}
                >
                  <CircularProgress size={32} sx={{ color: '#23A4E8' }} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>Opening camera...</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<CameraIcon />}
                    onClick={handleCapture}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'none',
                      borderRadius: '20px',
                      px: 2.5,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    Capture Photo
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              <img
                src={capturedImage}
                alt="Captured selfie"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Verified Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  bgcolor: 'rgba(16, 185, 129, 0.95)',
                  color: '#FFFFFF',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '11px',
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <CheckIcon sx={{ fontSize: 14 }} />
                Photo Captured
              </Box>

              {/* Retake Action Button */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RetakeIcon />}
                  onClick={handleRetake}
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'none',
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)',
                    '&:hover': { bgcolor: '#0F172A' },
                  }}
                >
                  Retake
                </Button>
              </Box>
            </Box>
          )}

          {/* Error / Fallback State */}
          {cameraError && !capturedImage && (
            <Box
              sx={{
                p: 2.5,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                color: '#FFFFFF',
              }}
            >
              <WarningIcon sx={{ fontSize: 36, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: '12px', color: '#CBD5E1', maxWidth: 260 }}>
                {cameraError}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={startCamera}
                  sx={{ color: '#FFFFFF', borderColor: '#64748B', textTransform: 'none', fontSize: '11px' }}
                >
                  Retry Camera
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ bgcolor: '#23A4E8', textTransform: 'none', fontSize: '11px', fontWeight: 600 }}
                >
                  Upload Photo
                </Button>
              </Stack>
            </Box>
          )}

          {/* Hidden Canvas & File Input */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </Box>

        {capturedImage && (
          <Alert severity="success" sx={{ py: 0.5, borderRadius: '8px', fontSize: '12px' }}>
            Selfie verified! Click <strong>{isStart ? 'Start Work' : 'Confirm & Set Inactive'}</strong> to proceed.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1 }}>
        <Button
          onClick={handleModalClose}
          disabled={isLoading}
          sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            bgcolor: isStart ? '#10B981' : '#EF4444',
            '&:hover': {
              bgcolor: isStart ? '#059669' : '#DC2626',
            },
            px: 2.5,
          }}
        >
          {isLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              <span>{isStart ? 'Starting...' : 'Stopping...'}</span>
            </Stack>
          ) : isStart ? (
            'Submit & Start Work'
          ) : (
            'Submit & Set Inactive'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
