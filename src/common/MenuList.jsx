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
    id: 'admin-calendar',
    title: 'Company Calendar',
    path: '/admin/calendar',
    iconName: 'CalendarMonth',
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
    id: 'employee-leaves',
    title: 'My Leaves',
    path: '/employee/my-leaves',
    iconName: 'EventNote',
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
    id: 'employee-profile',
    title: 'My Profile',
    path: '/employee/profile',
    iconName: 'Person',
    roles: ['employee'],
  },
];
