/**
 * ===========================================
 *  Navigation Menu Configuration
 * ===========================================
 */

export const adminMenuList = [
  {
    id: 'admin-dashboard',
    title: 'Dashboard',
    path: '/admin/dashboard',
    iconName: 'Dashboard',
    roles: ['admin'],
  },
  {
    id: 'admin-chat',
    title: 'Staff Chat',
    path: '/admin/chat',
    iconName: 'Chat',
    roles: ['admin'],
  },
  {
    id: 'admin-employees',
    title: 'Employee Directory',
    path: '/admin/employees',
    iconName: 'People',
    roles: ['admin'],
  },
  {
    id: 'admin-approvals',
    title: 'Registration Approvals',
    path: '/admin/approvals',
    iconName: 'HowToReg',
    roles: ['admin'],
  },
  {
    id: 'admin-leaves',
    title: 'Leave Applications',
    path: '/admin/leave-management',
    iconName: 'EventNote',
    roles: ['admin'],
  },
  {
    id: 'admin-policies',
    title: 'Policies & Holidays',
    path: '/admin/policies',
    iconName: 'Settings',
    roles: ['admin'],
  },
  {
    id: 'admin-time-tracking',
    title: 'Time Tracking',
    path: '/admin/time-tracking',
    iconName: 'AccessTime',
    roles: ['admin'],
  },
  {
    id: 'admin-communications',
    title: 'Communications',
    path: '/admin/communications',
    iconName: 'Email',
    roles: ['admin'],
  },
  {
    id: 'admin-employee-documents',
    title: 'Employee Documents',
    path: '/admin/employee-documents',
    iconName: 'FolderShared',
    roles: ['admin'],
  },
  {
    id: 'admin-document-requests',
    title: 'Document Requests',
    path: '/admin/document-requests',
    iconName: 'Assignment',
    roles: ['admin'],
  },
  {
    id: 'admin-reports',
    title: 'Reports & Audit Logs',
    path: '/admin/reports',
    iconName: 'Assessment',
    roles: ['admin'],
  },
];

export const employeeMenuList = [
  {
    id: 'employee-dashboard',
    title: 'Dashboard',
    path: '/employee/dashboard',
    iconName: 'Dashboard',
    roles: ['employee'],
  },
  {
    id: 'employee-chat',
    title: 'Staff Chat',
    path: '/employee/chat',
    iconName: 'Chat',
    roles: ['employee'],
  },
  {
    id: 'employee-time-tracking',
    title: 'Time Tracking',
    path: '/employee/time-tracking',
    iconName: 'AccessTime',
    roles: ['employee'],
  },
  {
    id: 'employee-leaves',
    title: 'My Leaves',
    path: '/employee/my-leaves',
    iconName: 'EventNote',
    roles: ['employee'],
  },
  {
    id: 'employee-leave-tracker',
    title: 'Leave Tracker',
    path: '/employee/leave-tracker',
    iconName: 'DateRange',
    roles: ['employee'],
  },
  {
    id: 'employee-calendar',
    title: 'Team Calendar',
    path: '/employee/calendar',
    iconName: 'CalendarMonth',
    roles: ['employee'],
  },
  {
    id: 'employee-documents',
    title: 'My Documents',
    path: '/employee/documents',
    iconName: 'FolderShared',
    roles: ['employee'],
  },
  {
    id: 'employee-profile',
    title: 'My Profile',
    path: '/employee/profile',
    iconName: 'Person',
    roles: ['employee'],
  },
];
