/**
 * ===========================================
 *  Checklist Upload Modal
 * ===========================================
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { CloudUploadRounded as UploadIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';

export default function ChecklistUploadModal({
  open,
  onClose,
  onUpload,
  item = null,
  isLoading = false,
}) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item || !file) return;

    const formData = new FormData();
    formData.append('document_type', item.documentType);
    formData.append('file', file);

    onUpload(formData);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
        <UploadIcon sx={{ color: '#0284C7' }} /> Upload {item.title}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {item.rejectionReason && (
            <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '13px' }}>
              <strong>Previous Rejection Reason:</strong> {item.rejectionReason}
            </Alert>
          )}

          <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: '10px', fontSize: '13px' }}>
            {item.description || 'Please provide a clear scanned copy or PDF.'}
          </Alert>

          <Box
            sx={{
              p: 3,
              border: '2px dashed #CBD5E1',
              borderRadius: '12px',
              textAlign: 'center',
              bgcolor: '#F8FAFC',
              cursor: 'pointer',
              '&:hover': { borderColor: '#0284C7', bgcolor: '#F0F9FF' },
            }}
            onClick={() => document.getElementById('checklist-file-input').click()}
          >
            <input
              id="checklist-file-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <UploadIcon sx={{ fontSize: 36, color: '#0284C7', mb: 1 }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              {file ? file.name : 'Click to select document file'}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5 }}>
              Accepted: PDF, JPG, PNG (Max {item.maxFileSizeMb || 5} MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !file}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {isLoading ? 'Uploading...' : 'Submit for Review'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
