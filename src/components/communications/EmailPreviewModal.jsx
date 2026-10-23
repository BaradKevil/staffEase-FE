/**
 * ===========================================
 *  Email Preview Modal
 * ===========================================
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import { VisibilityRounded as ViewIcon, WarningAmberRounded as WarningIcon } from '@mui/icons-material';

export default function EmailPreviewModal({
  open,
  onClose,
  subject = '',
  html = '',
  missingFields = [],
  sampleContext = {},
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ViewIcon sx={{ color: '#0284C7' }} /> Email Preview
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {missingFields && missingFields.length > 0 && (
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{ borderRadius: '10px', fontSize: '13px' }}
          >
            <strong>Warning — Missing Placeholders:</strong> The following fields do not have values for this recipient:{' '}
            <strong>{missingFields.join(', ')}</strong>. Please update the employee profile or provide values before sending.
          </Alert>
        )}

        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>SUBJECT:</Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
            {subject || '(No Subject)'}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 600, mt: 1 }}>
          RENDERED EMAIL BODY:
        </Typography>

        <Box
          sx={{
            p: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            minHeight: 250,
            overflowY: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: html || '<p style="color: #94A3B8;">Empty body</p>' }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}>
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
}
