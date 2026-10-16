/**
 * ===========================================
 *  TanStack React Query Hooks & API Endpoints
 * ===========================================
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './ApiClient';
import { unwrap, unwrapPaginated, unwrapList } from './apiUtils';

// -------------------------------------------------
//  Auth API Hooks
// -------------------------------------------------

export const useLogin = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (credentials) => {
      const res = await apiClient.post('/auth/login', credentials);
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};

export const useRegisterInvited = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/auth/register', data);
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};

export const useRegisterEmployee = useRegisterInvited;

export const useVerifyInvitation = (token) => {
  return useQuery({
    queryKey: ['invitation-verify', token],
    queryFn: async () => {
      const res = await apiClient.get(`/invitations/verify?token=${encodeURIComponent(token)}`);
      return unwrap(res);
    },
    enabled: !!token,
    retry: false,
  });
};

export const useForgotPassword = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/auth/forgot-password', data);
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};

export const useResetPassword = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/auth/reset-password', data);
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};

export const useLogout = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data = {}) => {
      const res = await apiClient.post('/auth/logout', data);
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await apiClient.get('/auth/me');
      return unwrap(res);
    },
  });
};

// -------------------------------------------------
//  Employee & Department API Hooks
// -------------------------------------------------

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/employees/departments');
      return unwrapList(res);
    },
  });
};

export const useEmployees = (params = {}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const res = await apiClient.get('/employees', { params });
      return unwrapPaginated(res);
    },
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await apiClient.get(`/employees/${id}`);
      return unwrap(res);
    },
    enabled: !!id,
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/employees/profile/me');
      return unwrap(res);
    },
  });
};

export const useUpdateMyProfile = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.put('/employees/profile/me', data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useUpdateEmployee = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.put(`/employees/${id}`, data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useApproveRegistration = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data = {}, employee_id, ...rest }) => {
      const payload = {
        ...data,
        ...rest,
        ...(employee_id ? { employee_id } : {}),
      };
      const res = await apiClient.post(`/employees/${id}/approve`, payload);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useRejectRegistration = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, rejection_reason }) => {
      const res = await apiClient.post(`/employees/${id}/reject`, {
        reason: reason || rejection_reason || 'Registration rejected',
      });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useUploadAvatar = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await apiClient.post('/employees/profile/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useRemoveAvatar = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete('/employees/profile/me/avatar');
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useUploadProfilePhoto = useUploadAvatar;
export const useRemoveProfilePhoto = useRemoveAvatar;

export const useUpdateEmployeeStatus = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiClient.put(`/employees/${id}`, { status });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useChangePassword = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/auth/change-password', data);
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};

// -------------------------------------------------
//  Invitations API Hooks
// -------------------------------------------------

export const useInvitations = (params = {}) => {
  return useQuery({
    queryKey: ['invitations', params],
    queryFn: async () => {
      const res = await apiClient.get('/invitations', { params });
      return unwrapPaginated(res);
    },
  });
};

export const useCreateInvitation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const email = data.email || data.work_email;
      const payload = {
        ...data,
        email,
        work_email: email,
      };
      const res = await apiClient.post('/invitations', payload);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useInviteEmployee = useCreateInvitation;

export const useRevokeInvitation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.post(`/invitations/${id}/revoke`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useResendInvitation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.post(`/invitations/${id}/resend`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

// -------------------------------------------------
//  Leave API Hooks
// -------------------------------------------------

export const useLeavePreview = (startDate, endDate) => {
  return useQuery({
    queryKey: ['leave-preview', startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.get('/leaves/calculate-preview', {
        params: { start_date: startDate, end_date: endDate },
      });
      return unwrap(res);
    },
    enabled: !!startDate && !!endDate && new Date(startDate) <= new Date(endDate),
  });
};

export const useMyBalances = (year) => {
  return useQuery({
    queryKey: ['my-balances', year],
    queryFn: async () => {
      const res = await apiClient.get('/leaves/balances/me', { params: { year } });
      return unwrap(res);
    },
  });
};

export const useEmployeeBalances = (userId, year) => {
  return useQuery({
    queryKey: ['employee-balances', userId, year],
    queryFn: async () => {
      const res = await apiClient.get(`/leaves/balances/${userId}`, { params: { year } });
      return unwrap(res);
    },
    enabled: !!userId,
  });
};

export const useApplyLeave = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/leaves/apply', data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useMyLeaves = (params = {}) => {
  return useQuery({
    queryKey: ['my-leaves', params],
    queryFn: async () => {
      const res = await apiClient.get('/leaves/my-leaves', { params });
      return unwrapPaginated(res);
    },
  });
};

export const useAllLeaves = (params = {}) => {
  return useQuery({
    queryKey: ['all-leaves', params],
    queryFn: async () => {
      const res = await apiClient.get('/leaves/all', { params });
      return unwrapPaginated(res);
    },
  });
};

export const useReviewLeaveRequest = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data = {}, action, decision, comments, admin_comments, rejection_reason }) => {
      const payload = {
        decision: data.action || action || decision || 'approved',
        comment: data.rejection_reason || data.admin_comments || comments || admin_comments || rejection_reason || '',
      };
      const res = await apiClient.post(`/leaves/${id}/review`, payload);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['all-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};
export const useReviewLeave = useReviewLeaveRequest;

export const useCancelLeaveRequest = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, cancellation_reason }) => {
      const res = await apiClient.post(`/leaves/${id}/cancel`, {
        cancellation_reason: cancellation_reason || reason || 'Cancelled by employee',
      });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['all-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};
export const useCancelLeave = useCancelLeaveRequest;

export const useAdjustLeaveBalance = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const payload = {
        user_id: data.user_id,
        leave_type: data.leave_type === 'casual_leave' || data.leave_type === 'CL' ? 'CL' : 'SL',
        year: data.year || new Date().getFullYear(),
        adjustment_days: data.adjustment_type === 'debit' ? -Math.abs(data.amount) : Math.abs(data.amount || data.adjustment_days || 1),
        reason: data.reason || 'Manual balance adjustment',
      };
      const res = await apiClient.post('/leaves/adjust-balance', payload);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['employee-balances'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['leave-summary-report'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};
export const useAdjustBalance = useAdjustLeaveBalance;

export const useLeaveRequests = (params = {}) => {
  const role = localStorage.getItem('role') || 'employee';
  return useQuery({
    queryKey: ['leave-requests', params],
    queryFn: async () => {
      const endpoint = role === 'admin' ? '/leaves/all' : '/leaves/my-leaves';
      const res = await apiClient.get(endpoint, { params });
      return unwrapPaginated(res);
    },
  });
};

// -------------------------------------------------
//  Calendar & Holiday API Hooks
// -------------------------------------------------

export const useHolidays = (year) => {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      const res = await apiClient.get('/calendar/holidays', { params: { year } });
      return unwrapList(res);
    },
  });
};

export const useCreateHoliday = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const holidayName = data.holiday_name || data.name;
      const payload = {
        ...data,
        holiday_name: holidayName,
        name: holidayName,
        holiday_date: data.holiday_date,
        description: data.description,
        leave_year: data.leave_year || (data.holiday_date ? new Date(data.holiday_date).getFullYear() : new Date().getFullYear()),
      };
      const res = await apiClient.post('/calendar/holidays', payload);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useDeleteHoliday = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/calendar/holidays/${id}`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useCalendarEvents = (arg1, arg2) => {
  let params = {};
  if (typeof arg1 === 'string' && typeof arg2 === 'string') {
    params = { start_date: arg1, end_date: arg2 };
  } else if (typeof arg1 === 'object') {
    params = arg1;
  } else {
    params = { year: arg1, month: arg2 };
  }
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: async () => {
      const res = await apiClient.get('/calendar/events', { params });
      return unwrap(res);
    },
  });
};

// -------------------------------------------------
//  Dashboard API Hooks
// -------------------------------------------------

export const useAdminDashboard = (year) => {
  return useQuery({
    queryKey: ['admin-dashboard', year],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/admin', { params: { year } });
      return unwrap(res);
    },
  });
};

export const useEmployeeDashboard = (year) => {
  return useQuery({
    queryKey: ['employee-dashboard', year],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/employee', { params: { year } });
      return unwrap(res);
    },
  });
};

// -------------------------------------------------
//  Notifications & Reports API Hooks
// -------------------------------------------------

export const useNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const res = await apiClient.get('/notifications', { params: { unread: unreadOnly } });
      return unwrapList(res);
    },
    refetchInterval: 60000,
  });
};

export const useMarkNotificationRead = (onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.put(`/notifications/${id}/read`);
      return unwrap(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (onSuccess) onSuccess();
    },
  });
};

export const useMarkAllNotificationsRead = (onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.put('/notifications/read-all');
      return unwrap(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (onSuccess) onSuccess();
    },
  });
};

export const useLeaveSummaryReport = (year, departmentId) => {
  return useQuery({
    queryKey: ['leave-summary-report', year, departmentId],
    queryFn: async () => {
      const res = await apiClient.get('/reports/leave-summary', {
        params: { year, department_id: departmentId },
      });
      return unwrapList(res);
    },
  });
};

export const useLeaveReport = useLeaveSummaryReport;

export const useAuditLogs = (params = {}) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const res = await apiClient.get('/reports/audit-logs', { params });
      return unwrapPaginated(res);
    },
  });
};
