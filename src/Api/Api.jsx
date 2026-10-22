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

// -------------------------------------------------
//  Time Tracking API Hooks
// -------------------------------------------------

export const useStartWorkSession = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data = {}) => {
      const res = await apiClient.post('/time-tracking/start', data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['today-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-time-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-records'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-overview'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useStopWorkSession = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data = {}) => {
      const res = await apiClient.post('/time-tracking/stop', data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['today-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-time-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-records'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-overview'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useTrigger7PmReminder = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/time-tracking/admin/send-7pm-reminder');
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};


export const usePendingRegistrationCount = (enabled = true) => {
  return useQuery({
    queryKey: ['pending-registration-count'],
    queryFn: async () => {
      const res = await apiClient.get('/employees/pending-count');
      const data = unwrap(res);
      return typeof data?.count === 'number' ? data.count : 0;
    },
    staleTime: 0,
    enabled,
  });
};

export const useTodayTimeSummary = (refetchInterval = 10000) => {
  return useQuery({
    queryKey: ['today-time-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/time-tracking/today-summary');
      return unwrap(res);
    },
    staleTime: 0,
    refetchInterval,
  });
};

export const useMyTimeHistory = (params = {}) => {
  return useQuery({
    queryKey: ['my-time-history', params],
    queryFn: async () => {
      const res = await apiClient.get('/time-tracking/my-history', { params });
      return unwrapPaginated(res);
    },
  });
};

export const useAdminTimeRecords = (params = {}) => {
  return useQuery({
    queryKey: ['admin-time-records', params],
    queryFn: async () => {
      const res = await apiClient.get('/time-tracking/admin/records', { params });
      return unwrapPaginated(res);
    },
    staleTime: 0,
  });
};

export const useAdminTimeOverview = () => {
  return useQuery({
    queryKey: ['admin-time-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/time-tracking/admin/overview');
      return unwrap(res);
    },
    staleTime: 0,
    refetchInterval: 15000,
  });
};

export const useEmployeeDateSessions = (userId, date) => {
  return useQuery({
    queryKey: ['employee-date-sessions', userId, date],
    queryFn: async () => {
      const res = await apiClient.get('/time-tracking/sessions', {
        params: { user_id: userId, date },
      });
      return unwrap(res);
    },
    enabled: !!userId && !!date,
  });
};

export const useAdminCorrectSession = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }) => {
      const res = await apiClient.put(`/time-tracking/admin/sessions/${sessionId}`, data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['admin-time-records'] });
      queryClient.invalidateQueries({ queryKey: ['employee-date-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['today-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-time-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-overview'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useTriggerAutoClose = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/time-tracking/admin/auto-close');
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['admin-time-records'] });
      queryClient.invalidateQueries({ queryKey: ['admin-time-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-time-summary'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};


// -------------------------------------------------------------
//  Chat & Real-Time Communication Hooks
// -------------------------------------------------------------

export const useChatDirectory = (search = '') => {
  return useQuery({
    queryKey: ['chat-directory', search],
    queryFn: async () => {
      const res = await apiClient.get('/chat/directory', { params: { search } });
      return unwrap(res) || [];
    },
    staleTime: 10000,
  });
};

export const useConversations = (filter = 'all') => {
  return useQuery({
    queryKey: ['chat-conversations', filter],
    queryFn: async () => {
      const res = await apiClient.get('/chat/conversations', { params: { filter } });
      return unwrap(res) || [];
    },
    staleTime: 0,
  });
};

export const useConversation = (id) => {
  return useQuery({
    queryKey: ['chat-conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/chat/conversations/${id}`);
      return unwrap(res);
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useConversationMessages = (conversationId, params = {}) => {
  return useQuery({
    queryKey: ['chat-messages', conversationId, params],
    queryFn: async () => {
      if (!conversationId) return { messages: [], has_more: false };
      const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`, { params });
      return unwrap(res);
    },
    enabled: !!conversationId,
    staleTime: 0,
  });
};

export const useStartDirectConversation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipientId) => {
      const res = await apiClient.post('/chat/conversations/direct', { recipient_id: recipientId });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useCreateGroupConversation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/chat/conversations/group', payload);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useStartAdminSupport = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/chat/conversations/admin-support', payload || {});
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useSendMessage = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, data }) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, data);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useEditMessage = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, content }) => {
      const res = await apiClient.put(`/chat/messages/${messageId}`, { content });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useDeleteMessage = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId) => {
      const res = await apiClient.delete(`/chat/messages/${messageId}`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useToggleReaction = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      const res = await apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useMarkConversationRead = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, lastMessageId }) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/read`, {
        last_message_id: lastMessageId,
      });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useAddGroupMember = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/members`, {
        user_id: userId,
      });
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversation', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useRemoveGroupMember = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }) => {
      const res = await apiClient.delete(`/chat/conversations/${conversationId}/members/${userId}`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversation', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useToggleFavouriteConversation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/favourite`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useToggleMuteConversation = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId) => {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/mute`);
      return unwrap(res);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError,
  });
};

export const useUploadChatAttachment = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrap(res);
    },
    onSuccess,
    onError,
  });
};
