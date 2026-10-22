/**
 * ===========================================
 *  Application Layout Shell Component
 * ===========================================
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CustomActionModal from './custom/CustomActionModal';
import { LogoutOutlined as LogoutOutlinedIcon } from '@mui/icons-material';
import { useLogout } from '../Api/Api';
import { toast } from 'react-toastify';

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const isChatRoute = location.pathname.includes('/chat');

  // Sidebar collapsed (mini icon-only) state
  const [isCollapsed, setIsCollapsed] = useState(isChatRoute);

  // Automatically collapse sidebar into icon-only mode when navigating to Staff Chat,
  // and expand to normal full sidebar on all other pages.
  useEffect(() => {
    if (isChatRoute) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [location.pathname, isChatRoute]);

  // Permanent toggle button in top bar toggles collapse state on ANY page
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const currentDrawerWidth = isCollapsed ? 72 : 260;

  const handleClearSession = () => {
    localStorage.clear();
    setLogoutModalOpen(false);
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout(
    handleClearSession,
    handleClearSession
  );

  const handleLogoutConfirm = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    logoutMutate({ refresh_token: refreshToken });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Top Fixed Navbar */}
      <Navbar
        toggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        onToggleCollapse={handleToggleCollapse}
        isCollapsed={isCollapsed}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      {/* Left Navigation Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        onLogoutClick={() => setLogoutModalOpen(true)}
        isCollapsed={isCollapsed}
        drawerWidth={currentDrawerWidth}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMdUp ? `calc(100% - ${currentDrawerWidth}px)` : '100%',
          bgcolor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ height: 64, flexShrink: 0 }} />

        <Box
          id="main-scroll"
          sx={{
            flexGrow: 1,
            overflowY: isChatRoute ? 'hidden' : 'auto',
            overflowX: 'hidden',
            p: isChatRoute ? 0 : { xs: 2, sm: 2.5, md: 3 },
            height: isChatRoute ? 'calc(100vh - 64px)' : 'auto',
            display: isChatRoute ? 'flex' : 'block',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Reusable Logout Confirmation Dialog */}
      <CustomActionModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        isPending={isLoggingOut}
        isDestructive={true}
        icon={<LogoutOutlinedIcon sx={{ fontSize: 28 }} />}
        title="Sign Out of staffEase"
        subtitle="Are you sure you want to log out? You will need to sign back in with your credentials to access your leave and employee details."
        confirmText="Sign Out"
        pendingText="Signing out..."
      />
    </Box>
  );
};

export default Layout;
