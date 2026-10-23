import './App.css';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './common/SocketContext';
import { CallProvider } from './common/CallContext';
import IncomingCallModal from './components/chat/IncomingCallModal';
import ActiveCallModal from './components/chat/ActiveCallModal';

// Guards & Layout
import { AuthGaurd, LogGaurd, RoleGuard, HomeRedirect } from './common/Gaurd';
import Layout from './common/Layout';
import NotAuthorized from './common/custom/NotAuthorized';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterEmployee from './pages/auth/RegisterEmployee';
import RegistrationPending from './pages/auth/RegistrationPending';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import RegistrationApprovals from './pages/admin/RegistrationApprovals';
import LeaveManagement from './pages/admin/LeaveManagement';
import LeavePolicies from './pages/admin/LeavePolicies';
import LeaveCalendarAdmin from './pages/admin/LeaveCalendarAdmin';
import ReportsAndAudit from './pages/admin/ReportsAndAudit';
import TimeTrackingAdmin from './pages/admin/TimeTrackingAdmin';
import CommunicationsCenter from './pages/admin/CommunicationsCenter';
import StaffChat from './pages/chat/StaffChat';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyLeaves from './pages/employee/MyLeaves';
import LeaveTracker from './pages/employee/LeaveTracker';
import LeaveCalendar from './pages/employee/LeaveCalendar';
import MyProfile from './pages/employee/MyProfile';
import TimeTracking from './pages/employee/TimeTracking';
import EmployeeDocuments from './pages/employee/EmployeeDocuments';

// Error Page
import NotFound from './pages/NotFound';

function App() {
  const router = createBrowserRouter([
    // Public / Guest Auth Routes
    {
      path: '/',
      element: (
        <LogGaurd>
          <Login />
        </LogGaurd>
      )
    },
    {
      path: '/login',
      element: (
        <LogGaurd>
          <Login />
        </LogGaurd>
      )
    },
    {
      path: '/register',
      element: <RegisterEmployee />
    },
    {
      path: '/pending-approval',
      element: <RegistrationPending />
    },
    {
      path: '/forgot-password',
      element: (
        <LogGaurd>
          <ForgotPassword />
        </LogGaurd>
      )
    },
    {
      path: '/reset-password',
      element: (
        <LogGaurd>
          <ResetPassword />
        </LogGaurd>
      )
    },
    {
      path: '/not-authorized',
      element: <NotAuthorized />
    },

    // Protected Routes (Wrapped in Layout)
    {
      element: (
        <AuthGaurd>
          <Layout />
        </AuthGaurd>
      ),
      children: [
        {
          path: '/home',
          element: <HomeRedirect />
        },

        // Admin Routes
        {
          path: '/admin/dashboard',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          )
        },
        {
          path: '/admin/chat',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <StaffChat />
            </RoleGuard>
          )
        },
        {
          path: '/admin/employees',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <EmployeeList />
            </RoleGuard>
          )
        },
        {
          path: '/admin/approvals',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <RegistrationApprovals />
            </RoleGuard>
          )
        },
        {
          path: '/admin/leaves',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <LeaveManagement />
            </RoleGuard>
          )
        },
        {
          path: '/admin/leave-management',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <LeaveManagement />
            </RoleGuard>
          )
        },
        {
          path: '/admin/policies',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <LeavePolicies />
            </RoleGuard>
          )
        },
        {
          path: '/admin/calendar',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <LeaveCalendarAdmin />
            </RoleGuard>
          )
        },
        {
          path: '/dashboard/calendar',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <LeaveCalendarAdmin />
            </RoleGuard>
          )
        },
        {
          path: '/dashboard/calender',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <LeaveCalendarAdmin />
            </RoleGuard>
          )
        },
        {
          path: '/admin/reports',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <ReportsAndAudit />
            </RoleGuard>
          )
        },
        {
          path: '/admin/time-tracking',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <TimeTrackingAdmin />
            </RoleGuard>
          )
        },
        {
          path: '/admin/communications',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <CommunicationsCenter />
            </RoleGuard>
          )
        },
        {
          path: '/admin/employee-documents',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <CommunicationsCenter />
            </RoleGuard>
          )
        },
        {
          path: '/admin/document-requests',
          element: (
            <RoleGuard allowedRoles={['admin']}>
              <CommunicationsCenter />
            </RoleGuard>
          )
        },

        // Employee Routes (Admins can also view employee profile and leaves)
        {
          path: '/employee/dashboard',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <EmployeeDashboard />
            </RoleGuard>
          )
        },
        {
          path: '/employee/chat',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <StaffChat />
            </RoleGuard>
          )
        },
        {
          path: '/employee/time-tracking',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <TimeTracking />
            </RoleGuard>
          )
        },
        {
          path: '/employee/my-leaves',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <MyLeaves />
            </RoleGuard>
          )
        },
        {
          path: '/employee/leave-tracker',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <LeaveTracker />
            </RoleGuard>
          )
        },
        {
          path: '/employee/calendar',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <LeaveCalendar />
            </RoleGuard>
          )
        },
        {
          path: '/employee/profile',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <MyProfile />
            </RoleGuard>
          )
        },
        {
          path: '/employee/documents',
          element: (
            <RoleGuard allowedRoles={['employee', 'admin']}>
              <EmployeeDocuments />
            </RoleGuard>
          )
        }
      ]
    },

    // Catch-All
    {
      path: '*',
      element: <NotFound />
    }
  ]);

  return (
    <SocketProvider>
      <CallProvider>
        <RouterProvider router={router} />
        <IncomingCallModal />
        <ActiveCallModal />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      </CallProvider>
    </SocketProvider>
  );
}

export default App;
