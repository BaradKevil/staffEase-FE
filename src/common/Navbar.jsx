/**
 * ===========================================
 *  Application Navbar Component
 * ===========================================
 */

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  NotificationsNoneOutlined as NotificationsNoneOutlinedIcon,
  LogoutOutlined as LogoutOutlinedIcon,
  PersonOutlineOutlined as PersonOutlineOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
  CheckCircleOutlineRounded as CheckCircleOutlineIcon,
  FiberManualRecord as FiberManualRecordIcon,
  PlayArrowRounded as PlayArrowRoundedIcon,
  StopRounded as StopRoundedIcon,
  DownloadForOfflineOutlined as DownloadIcon,
  NotificationsActiveOutlined as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useTodayTimeSummary,
  useStartWorkSession,
  useStopWorkSession,
} from '../Api/Api';
import SelfieCaptureModal from '../components/timeTracking/SelfieCaptureModal';
import { usePushNotifications } from './usePushNotifications';

const Navbar = ({ toggleSidebar, onToggleCollapse, isCollapsed = false, onLogoutClick }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'employee';
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushSubscribed,
    isInstallable,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    installApp,
  } = usePushNotifications();

  // Current user info cached in localStorage with live updates
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      } catch {
        setUser({});
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || (role === 'admin' ? 'Administrator' : 'Employee');
  const photo = user.profile_photo || user.avatar_url;
  const avatarUrl = photo
    ? (photo.startsWith('http://') || photo.startsWith('https://')
        ? photo
        : `${(import.meta.env.VITE_BASEURL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '')}${photo.startsWith('/') ? '' : '/'}${photo}`)
    : null;

  // Profile Menu
  const [profileAnchor, setProfileAnchor] = useState(null);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  // Notifications Popover
  const [notifAnchor, setNotifAnchor] = useState(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  // Work Tracking Live State & Selfie Verification Modal
  const { data: timeSummary, refetch: refetchTimeSummary } = useTodayTimeSummary(10000);
  const isTrackingActive = Boolean(timeSummary?.is_tracking_active);

  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [selfieModalMode, setSelfieModalMode] = useState('start'); // 'start' | 'stop'

  const { mutate: startWorkMutate, isPending: isStarting } = useStartWorkSession(
    () => {
      toast.success('Selfie verified! Status changed to Active & timer started.');
      setSelfieModalOpen(false);
      refetchTimeSummary();
    },
    (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to start session.';
      toast.error(msg);
    }
  );

  const { mutate: stopWorkMutate, isPending: isStopping } = useStopWorkSession(
    () => {
      toast.success('Selfie & reason verified! Status changed to Inactive & session stopped.');
      setSelfieModalOpen(false);
      refetchTimeSummary();
    },
    (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to stop session.';
      toast.error(msg);
    }
  );

  const handleInitiateActive = () => {
    setSelfieModalMode('start');
    setSelfieModalOpen(true);
  };

  const handleInitiateInactive = () => {
    setSelfieModalMode('stop');
    setSelfieModalOpen(true);
  };

  const handleSelfieSubmit = ({ selfie, reason }) => {
    if (selfieModalMode === 'start') {
      startWorkMutate({ selfie });
    } else {
      stopWorkMutate({ reason, selfie });
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: 64,
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between' }}>
        {/* Left: Mobile Toggle & Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={toggleSidebar}
            sx={{ display: { md: 'none' }, color: '#475569' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Permanent Collapse/Expand Toggle Button (All Pages) */}
          <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="bottom">
            <IconButton
              onClick={onToggleCollapse}
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: '#475569',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                width: 36,
                height: 36,
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F1F5F9',
                  color: '#0284C7',
                  borderColor: '#CBD5E1',
                },
              }}
            >
              {isCollapsed ? <MenuIcon sx={{ fontSize: 20 }} /> : <MenuOpenIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Box
            onClick={() => navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: '#23A4E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 2px 6px rgba(35, 164, 232, 0.35)',
              }}
            >
              S
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '18px',
                color: '#0F172A',
                letterSpacing: '-0.02em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              staff<span style={{ color: '#23A4E8' }}>Ease</span>
            </Typography>
          </Box>
        </Box>

        {/* Right: Role, Work Tracking Status, Notifications, Avatar Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Chip
            size="small"
            label={role === 'admin' ? 'HR Admin' : 'Employee'}
            sx={{
              bgcolor: role === 'admin' ? '#E0F2FE' : '#F1F5F9',
              color: role === 'admin' ? '#0284C7' : '#475569',
              fontWeight: 700,
              fontSize: '11px',
              borderRadius: '6px',
              height: 24,
            }}
          />

          {/* Live Work Tracking Status Chip */}
          <Tooltip title={isTrackingActive ? 'Work session is running (Active). Click to change status to Inactive.' : 'No active work session (Inactive). Click to change status to Active.'}>
            <Chip
              size="small"
              icon={
                <FiberManualRecordIcon
                  sx={{
                    fontSize: '10px !important',
                    color: isTrackingActive ? '#10B981 !important' : '#94A3B8 !important',
                  }}
                />
              }
              label={isStarting ? 'Starting...' : isStopping ? 'Stopping...' : isTrackingActive ? 'Active' : 'Inactive'}
              onClick={isTrackingActive ? handleInitiateInactive : handleInitiateActive}
              clickable
              sx={{
                fontWeight: 700,
                fontSize: '11px',
                borderRadius: '6px',
                height: 24,
                cursor: 'pointer',
                bgcolor: isTrackingActive ? '#ECFDF5' : '#F8FAFC',
                color: isTrackingActive ? '#065F46' : '#64748B',
                border: `1px solid ${isTrackingActive ? '#A7F3D0' : '#E2E8F0'}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isTrackingActive ? '#D1FAE5' : '#F1F5F9',
                },
              }}
            />
          </Tooltip>

          {/* Notifications Bell */}
          <IconButton
            size="small"
            onClick={handleNotifOpen}
            sx={{
              color: '#475569',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={9}>
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 440,
                borderRadius: '14px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                p: 0,
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={() => markAllRead()} sx={{ fontSize: '11px', textTransform: 'none' }}>
                  Mark all as read
                </Button>
              )}
            </Box>
            {/* Native Web Push Notification Banner */}
            {isPushSupported && (
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  bgcolor: isPushSubscribed ? '#ECFDF5' : '#F0F9FF',
                  borderBottom: `1px solid ${isPushSubscribed ? '#A7F3D0' : '#BAE6FD'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActiveIcon
                    sx={{
                      fontSize: 18,
                      color: isPushSubscribed ? '#059669' : '#0284C7',
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isPushSubscribed ? '#065F46' : '#0369A1',
                      }}
                    >
                      {isPushSubscribed ? 'Push Alerts Active' : 'Offline Push Alerts'}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: '#64748B', lineHeight: 1.2 }}>
                      {isPushSubscribed
                        ? 'Alerts active even when tab is closed'
                        : 'Get notified for chat & leave updates'}
                    </Typography>
                  </Box>
                </Box>
                {isPushSubscribed ? (
                  <Button
                    size="small"
                    onClick={unsubscribePush}
                    sx={{
                      fontSize: '10px',
                      height: 22,
                      minWidth: 50,
                      textTransform: 'none',
                      color: '#64748B',
                    }}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={subscribePush}
                    sx={{
                      fontSize: '10px',
                      height: 24,
                      minWidth: 60,
                      textTransform: 'none',
                      bgcolor: '#0284C7',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0369A1' },
                    }}
                  >
                    Enable
                  </Button>
                )}
              </Box>
            )}

            <List sx={{ p: 0, maxHeight: 340, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>No notifications</Typography>
                </Box>
              ) : (
                notifications.map((n) => (
                  <ListItem
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markRead(n.id);
                      if (n.link) navigate(n.link);
                      handleNotifClose();
                    }}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: n.is_read ? '#FFFFFF' : '#F0F9FF',
                      borderBottom: '1px solid #F1F5F9',
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {n.type === 'success' ? (
                        <CheckCircleOutlineIcon sx={{ color: '#10B981', fontSize: 18 }} />
                      ) : (
                        <InfoOutlinedIcon sx={{ color: '#23A4E8', fontSize: 18 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: '13px', fontWeight: n.is_read ? 500 : 700, color: '#0F172A' }}>
                          {n.title}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.2 }}>
                          {n.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Popover>

          <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

          {/* User Profile Menu */}
          <Box
            onClick={handleProfileOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <Avatar
              src={avatarUrl || undefined}
              alt={fullName}
              sx={{ width: 34, height: 34, bgcolor: '#23A4E8', fontSize: '13px', fontWeight: 700 }}
            >
              {fullName.charAt(0)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                {fullName}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                {user.email || 'user@staffEase.internal'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                width: 200,
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleProfileClose();
                navigate('/employee/profile');
              }}
              sx={{ fontSize: '13px', py: 1 }}
            >
              <PersonOutlineOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: '#64748B' }} />
              My Profile
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                handleProfileClose();
                if (isTrackingActive) {
                  handleInitiateInactive();
                } else {
                  handleInitiateActive();
                }
              }}
              sx={{
                fontSize: '13px',
                py: 1,
                color: isTrackingActive ? '#DC2626' : '#059669',
                fontWeight: 600,
              }}
            >
              {isTrackingActive ? (
                <>
                  <StopRoundedIcon sx={{ fontSize: 18, mr: 1.5, color: '#DC2626' }} />
                  Change Status: Inactive
                </>
              ) : (
                <>
                  <PlayArrowRoundedIcon sx={{ fontSize: 18, mr: 1.5, color: '#059669' }} />
                  Change Status: Active
                </>
              )}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                handleProfileClose();
                onLogoutClick();
              }}
              sx={{ fontSize: '13px', color: '#EF4444', py: 1 }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: '#EF4444' }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Selfie Verification & Mandatory Reason Modal for Status Changes */}
      <SelfieCaptureModal
        open={selfieModalOpen}
        mode={selfieModalMode}
        isLoading={isStarting || isStopping}
        onClose={() => {
          if (!isStarting && !isStopping) {
            setSelfieModalOpen(false);
          }
        }}
        onSubmit={handleSelfieSubmit}
      />
    </AppBar>
  );
};

export default Navbar;
