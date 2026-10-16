/**
 * ===========================================
 *  Route Guards & Role Redirectors
 * ===========================================
 */

import { Navigate } from 'react-router-dom';

export const LogGuard = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role') || 'employee';

  if (!token) {
    return children;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/employee/dashboard" replace />;
};

export const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const RoleGuard = ({ allowedRoles, children }) => {
  const role = localStorage.getItem('role') || 'employee';

  if (!allowedRoles || allowedRoles.includes(role)) {
    return children;
  }

  return <Navigate to="/not-authorized" replace />;
};

export const HomeRedirect = () => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/employee/dashboard" replace />;
};

export const AuthGaurd = AuthGuard;
export const LogGaurd = LogGuard;

