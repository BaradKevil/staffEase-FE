/**
 * ===========================================
 *  Status & Leave Type Badge Component
 * ===========================================
 */

import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  // Account Statuses
  active: { label: 'Active', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  pending_approval: { label: 'Pending Approval', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  rejected: { label: 'Rejected', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  inactive: { label: 'Inactive', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  suspended: { label: 'Suspended', bg: '#FFF7ED', color: '#EA580C', border: '#FFEDD5' },

  // Leave Statuses
  pending: { label: 'Pending Review', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  approved: { label: 'Approved', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  cancelled: { label: 'Cancelled', bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },

  // Leave Types
  CL: { label: 'Casual Leave (CL)', bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
  SL: { label: 'Sick Leave (SL)', bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },

  // Invitation Statuses
  accepted: { label: 'Accepted', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  revoked: { label: 'Revoked', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  expired: { label: 'Expired', bg: '#F8FAFC', color: '#94A3B8', border: '#E2E8F0' },
};

const StatusBadge = ({ status, size = 'small', customLabel }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: '#F1F5F9',
    color: '#475569',
    border: '#E2E8F0',
  };

  return (
    <Chip
      size={size}
      label={customLabel || config.label}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 600,
        fontSize: '11px',
        height: size === 'small' ? 24 : 28,
        borderRadius: '6px',
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
};

export default StatusBadge;
