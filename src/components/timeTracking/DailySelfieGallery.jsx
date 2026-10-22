/**
 * ===========================================
 *  Daily Verification Selfies Gallery & Lightbox
 * ===========================================
 *
 * Displays daily verification selfies captured by an employee
 * (Clock-In start photo and Clock-Out stop photo with reasons).
 * Provides click-to-zoom Lightbox inspection for administrators & employees.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Divider,
} from '@mui/material';
import {
  CameraAltRounded as CameraIcon,
  ZoomInRounded as ZoomInIcon,
  CloseRounded as CloseIcon,
  AccessTimeRounded as ClockIcon,
  NotesRounded as ReasonIcon,
  CheckCircleRounded as CheckIcon,
  PlayArrowRounded as StartIcon,
  StopRounded as StopIcon,
  HourglassEmptyRounded as PendingIcon,
} from '@mui/icons-material';

// Helper to resolve backend upload URLs
const resolveServerBaseUrl = () => {
  const rawBase = import.meta.env.VITE_BASEURL || 'http://localhost:5000/api/v1';
  const cleanBase = String(rawBase)
    .trim()
    .replace(/\s+/g, '')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');

  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    cleanBase.includes('localhost')
  ) {
    return 'https://staffease-be.onrender.com';
  }

  return cleanBase;
};

export const getSelfieUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const serverBase = resolveServerBaseUrl();
  const cleanUrl = String(url).trim().replace(/\s+/g, '');
  return `${serverBase}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export default function DailySelfieGallery({
  sessions = [],
  employeeName = '',
  employeeId = '',
  workDate = '',
}) {
  const [lightboxData, setLightboxData] = useState(null); // { url, title, timestamp, type, reason }

  // Check if any session has at least one selfie
  const totalSelfies = sessions.reduce((count, s) => {
    let c = count;
    if (s.start_selfie_url) c++;
    if (s.end_selfie_url) c++;
    return c;
  }, 0);

  if (!sessions || sessions.length === 0) {
    return (
      <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
        <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>
          No work sessions recorded for this date.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon sx={{ color: '#23A4E8', fontSize: 20 }} />
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
            Daily Verification Selfies & Audit Log
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={<CameraIcon sx={{ fontSize: '14px !important' }} />}
          label={`${totalSelfies} Selfie(s) Captured`}
          sx={{
            bgcolor: totalSelfies > 0 ? '#EFF6FF' : '#F1F5F9',
            color: totalSelfies > 0 ? '#1D4ED8' : '#64748B',
            fontWeight: 700,
            fontSize: '11px',
          }}
        />
      </Box>

      {totalSelfies === 0 ? (
        <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
          <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>
            No verification selfies recorded for these sessions.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {sessions.map((sess, idx) => {
            const hasStart = Boolean(sess.start_selfie_url);
            const hasEnd = Boolean(sess.end_selfie_url);
            const isActive = sess.status === 'active';

            return (
              <Card
                key={sess.id || idx}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  p: 2,
                  bgcolor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                }}
              >
                {/* Session Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Session #{idx + 1}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                    {formatTimeOnly(sess.started_at)} → {sess.ended_at ? formatTimeOnly(sess.ended_at) : 'Active'}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {/* Clock-In Selfie Card */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        display: 'flex',
                        gap: 1.5,
                      }}
                    >
                      {hasStart ? (
                        <Box
                          onClick={() =>
                            setLightboxData({
                              url: getSelfieUrl(sess.start_selfie_url),
                              title: `Clock-In Selfie — Session #${idx + 1}`,
                              timestamp: sess.started_at,
                              type: 'start',
                              reason: null,
                            })
                          }
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            '&:hover .zoom-overlay': { opacity: 1 },
                          }}
                        >
                          <img
                            src={getSelfieUrl(sess.start_selfie_url)}
                            alt="Clock In Selfie"
                            crossOrigin="anonymous"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              const currentSrc = e.currentTarget.src;
                              if (!currentSrc.includes('staffease-be.onrender.com') && sess.start_selfie_url) {
                                const cleanPath = sess.start_selfie_url.replace(/^\/?/, '/');
                                e.currentTarget.src = `https://staffease-be.onrender.com${cleanPath}`;
                              }
                            }}
                          />
                          <Box
                            className="zoom-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              bgcolor: 'rgba(15, 23, 42, 0.45)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              color: '#FFFFFF',
                            }}
                          >
                            <ZoomInIcon sx={{ fontSize: 22 }} />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '8px',
                            bgcolor: '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8',
                            flexShrink: 0,
                          }}
                        >
                          <CameraIcon />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5, flexGrow: 1 }}>
                        <Chip
                          size="small"
                          icon={<StartIcon sx={{ fontSize: '13px !important' }} />}
                          label="Clock In (Start Work)"
                          sx={{
                            bgcolor: '#DCFCE7',
                            color: '#15803D',
                            fontWeight: 700,
                            fontSize: '10px',
                            width: 'fit-content',
                            height: 22,
                          }}
                        />
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ClockIcon sx={{ fontSize: 13, color: '#64748B' }} />
                          {formatTimeOnly(sess.started_at)}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: hasStart ? '#059669' : '#64748B' }}>
                          {hasStart ? '✓ Selfie verified' : 'No photo captured'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Clock-Out Selfie Card */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: isActive ? '#FFFBEB' : '#FEF2F2',
                        border: `1px solid ${isActive ? '#FDE68A' : '#FECACA'}`,
                        display: 'flex',
                        gap: 1.5,
                      }}
                    >
                      {hasEnd ? (
                        <Box
                          onClick={() =>
                            setLightboxData({
                              url: getSelfieUrl(sess.end_selfie_url),
                              title: `Clock-Out Selfie — Session #${idx + 1}`,
                              timestamp: sess.ended_at,
                              type: 'stop',
                              reason: sess.notes,
                            })
                          }
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            '&:hover .zoom-overlay': { opacity: 1 },
                          }}
                        >
                          <img
                            src={getSelfieUrl(sess.end_selfie_url)}
                            alt="Clock Out Selfie"
                            crossOrigin="anonymous"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              const currentSrc = e.currentTarget.src;
                              if (!currentSrc.includes('staffease-be.onrender.com') && sess.end_selfie_url) {
                                const cleanPath = sess.end_selfie_url.replace(/^\/?/, '/');
                                e.currentTarget.src = `https://staffease-be.onrender.com${cleanPath}`;
                              }
                            }}
                          />
                          <Box
                            className="zoom-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              bgcolor: 'rgba(15, 23, 42, 0.45)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              color: '#FFFFFF',
                            }}
                          >
                            <ZoomInIcon sx={{ fontSize: 22 }} />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '8px',
                            bgcolor: isActive ? '#FEF3C7' : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? '#D97706' : '#94A3B8',
                            flexShrink: 0,
                          }}
                        >
                          {isActive ? <PendingIcon /> : <CameraIcon />}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5, flexGrow: 1 }}>
                        <Chip
                          size="small"
                          icon={isActive ? <PendingIcon sx={{ fontSize: '13px !important' }} /> : <StopIcon sx={{ fontSize: '13px !important' }} />}
                          label={isActive ? 'Session Active' : 'Clock Out (Paused)'}
                          sx={{
                            bgcolor: isActive ? '#FEF3C7' : '#FEE2E2',
                            color: isActive ? '#B45309' : '#B91C1C',
                            fontWeight: 700,
                            fontSize: '10px',
                            width: 'fit-content',
                            height: 22,
                          }}
                        />
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ClockIcon sx={{ fontSize: 13, color: '#64748B' }} />
                          {sess.ended_at ? formatTimeOnly(sess.ended_at) : 'In progress...'}
                        </Typography>
                        {sess.notes ? (
                          <Tooltip title={sess.notes}>
                            <Typography
                              sx={{
                                fontSize: '11px',
                                color: '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.4,
                                maxWidth: 170,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <ReasonIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                              {sess.notes}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                            {isActive ? 'Pending clock-out' : 'No notes'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Lightbox Modal for High-Resolution Selfie Inspection */}
      <Dialog
        open={Boolean(lightboxData)}
        onClose={() => setLightboxData(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: '#0F172A',
            color: '#FFFFFF',
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 2,
            px: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>
              {lightboxData?.title}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
              {employeeName} {employeeId ? `(${employeeId})` : ''} • {workDate}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setLightboxData(null)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {lightboxData?.url && (
            <Box
              sx={{
                width: '100%',
                maxHeight: 460,
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={lightboxData.url}
                alt="Verification Selfie"
                crossOrigin="anonymous"
                onError={(e) => {
                  const currentSrc = e.currentTarget.src;
                  if (!currentSrc.includes('staffease-be.onrender.com')) {
                    try {
                      const parsed = new URL(currentSrc);
                      e.currentTarget.src = `https://staffease-be.onrender.com${parsed.pathname}`;
                    } catch (_) {}
                  }
                }}
                style={{
                  width: '100%',
                  maxHeight: 460,
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          <Box
            sx={{
              width: '100%',
              p: 2,
              borderRadius: '10px',
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>Captured Timestamp</Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                  {formatTimeOnly(lightboxData?.timestamp)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>Verification Type</Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: lightboxData?.type === 'start' ? '#4ADE80' : '#F87171' }}>
                  {lightboxData?.type === 'start' ? 'Clock In / Active' : 'Clock Out / Inactive'}
                </Typography>
              </Grid>
              {lightboxData?.reason && (
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>Employee Reason Note</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#F1F5F9', mt: 0.3, fontStyle: 'italic' }}>
                    "{lightboxData.reason}"
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
