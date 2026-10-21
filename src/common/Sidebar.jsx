/**
 * ===========================================
 *  Application Sidebar Component
 * ===========================================
 */

import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
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
  LogoutOutlined as LogoutOutlinedIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminMenuList, employeeMenuList } from './MenuList';

const iconMap = {
  Dashboard: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />,
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

const drawerWidth = 260;

const Sidebar = ({ isMobileOpen, onMobileClose, onLogoutClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const role = localStorage.getItem('role') || 'employee';
  const menuItems = role === 'admin' ? adminMenuList : employeeMenuList;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Spacer for 64px fixed Navbar */}
      <Box sx={{ height: 64, flexShrink: 0 }} />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {role === 'admin' ? 'Administration' : 'Self Service'}
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 0, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (!isMdUp && onMobileClose) onMobileClose();
              }}
              sx={{
                borderRadius: '10px',
                mb: 0.6,
                py: 1.2,
                px: 1.5,
                bgcolor: isActive ? '#F0F9FF' : 'transparent',
                color: isActive ? '#23A4E8' : '#475569',
                borderLeft: isActive ? '3px solid #23A4E8' : '3px solid transparent',
                '&:hover': {
                  bgcolor: isActive ? '#F0F9FF' : '#F8FAFC',
                  color: isActive ? '#23A4E8' : '#0F172A',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 34,
                  color: isActive ? '#23A4E8' : '#64748B',
                }}
              >
                {iconMap[item.iconName] || <DashboardOutlinedIcon sx={{ fontSize: 20 }} />}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, borderColor: '#F1F5F9' }} />

      {/* Bottom Sign Out */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={onLogoutClick}
          sx={{
            borderRadius: '10px',
            py: 1,
            color: '#64748B',
            '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
            <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          />
        </ListItemButton>
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
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
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
            width: drawerWidth,
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
