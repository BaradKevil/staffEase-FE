/**
 * ===========================================
 *  Application Sidebar Component
 * ===========================================
 */

import React, { useMemo } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DashboardOutlined as DashboardOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  HowToRegOutlined as HowToRegOutlinedIcon,
  EventNoteOutlined as EventNoteOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  AssessmentOutlined as AssessmentOutlinedIcon,
  PersonOutlineOutlined as PersonOutlineOutlinedIcon,
  DateRangeOutlined as DateRangeOutlinedIcon,
  AccessTimeOutlined as AccessTimeOutlinedIcon,
  ForumOutlined as ChatOutlinedIcon,
  LogoutOutlined as LogoutOutlinedIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminMenuList, employeeMenuList } from './MenuList';
import { usePendingRegistrationCount, useConversations } from '../Api/Api';

const iconMap = {
  Dashboard: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />,
  Chat: <ChatOutlinedIcon sx={{ fontSize: 20 }} />,
  People: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />,
  HowToReg: <HowToRegOutlinedIcon sx={{ fontSize: 20 }} />,
  EventNote: <EventNoteOutlinedIcon sx={{ fontSize: 20 }} />,
  CalendarMonth: <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />,
  Settings: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />,
  Assessment: <AssessmentOutlinedIcon sx={{ fontSize: 20 }} />,
  Person: <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />,
  DateRange: <DateRangeOutlinedIcon sx={{ fontSize: 20 }} />,
  AccessTime: <AccessTimeOutlinedIcon sx={{ fontSize: 20 }} />,
};

const Sidebar = ({
  isMobileOpen,
  onMobileClose,
  onLogoutClick,
  isCollapsed = false,
  drawerWidth = 260,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const role = localStorage.getItem('role') || 'employee';
  const menuItems = role === 'admin' ? adminMenuList : employeeMenuList;
  const { data: pendingCount = 0 } = usePendingRegistrationCount(role === 'admin');
  const { data: conversations = [] } = useConversations();

  const unreadChatCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  }, [conversations]);

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      {/* Spacer for 64px fixed Navbar */}
      <Box sx={{ height: 64, flexShrink: 0 }} />

      {/* Section Header */}
      {!isCollapsed ? (
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            {role === 'admin' ? 'Administration' : 'Self Service'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ py: 1 }} />
      )}

      {/* Navigation List */}
      <List sx={{ px: isCollapsed ? 1 : 1.5, py: 0, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const isChatItem = item.id === 'admin-chat' || item.id === 'employee-chat';

          return (
            <Tooltip
              title={isCollapsed ? item.title : ''}
              placement="right"
              arrow
              key={item.id}
            >
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (!isMdUp && onMobileClose) onMobileClose();
                }}
                sx={{
                  borderRadius: '10px',
                  mb: 0.6,
                  py: 1.2,
                  px: isCollapsed ? 1 : 1.5,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  bgcolor: isActive ? '#F0F9FF' : 'transparent',
                  color: isActive ? '#23A4E8' : '#475569',
                  borderLeft: !isCollapsed && isActive ? '3px solid #23A4E8' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? '#F0F9FF' : '#F8FAFC',
                    color: isActive ? '#23A4E8' : '#0F172A',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? 0 : 34,
                    justifyContent: 'center',
                    color: isActive ? '#23A4E8' : '#64748B',
                    position: 'relative',
                  }}
                >
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={
                      !(
                        isCollapsed &&
                        ((item.id === 'admin-approvals' && pendingCount > 0) ||
                          (isChatItem && unreadChatCount > 0))
                      )
                    }
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: isChatItem ? '#0284C7' : '#EF4444',
                      },
                    }}
                  >
                    {iconMap[item.iconName] || <DashboardOutlinedIcon sx={{ fontSize: 20 }} />}
                  </Badge>
                </ListItemIcon>

                {!isCollapsed && (
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '13.5px',
                      fontWeight: isActive ? 700 : 500,
                      noWrap: true,
                    }}
                  />
                )}

                {/* Expanded Badges */}
                {!isCollapsed && item.id === 'admin-approvals' && pendingCount > 0 && (
                  <Chip
                    label={pendingCount}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      minWidth: 20,
                      fontSize: '11px',
                      fontWeight: 700,
                      bgcolor: '#EF4444',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.35)',
                      '& .MuiChip-label': { px: 0.8 },
                    }}
                  />
                )}

                {!isCollapsed && isChatItem && unreadChatCount > 0 && (
                  <Chip
                    label={unreadChatCount}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      minWidth: 20,
                      fontSize: '11px',
                      fontWeight: 700,
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 4px rgba(2, 132, 199, 0.35)',
                      '& .MuiChip-label': { px: 0.8 },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ mx: isCollapsed ? 1 : 2, borderColor: '#F1F5F9' }} />

      {/* Bottom Sign Out */}
      <Box sx={{ p: isCollapsed ? 1 : 2 }}>
        <Tooltip title={isCollapsed ? 'Sign Out' : ''} placement="right" arrow>
          <ListItemButton
            onClick={onLogoutClick}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: isCollapsed ? 1 : 1.5,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: '#64748B',
              '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' },
            }}
          >
            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 34, justifyContent: 'center', color: 'inherit' }}>
              <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary="Sign Out"
                primaryTypographyProps={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  noWrap: true,
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {content}
      </Drawer>

      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
};

export default Sidebar;
