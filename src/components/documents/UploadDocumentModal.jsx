/**
 * ===========================================
 *  Upload Document Modal
 * ===========================================
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { UploadFileRounded as UploadIcon } from '@mui/icons-material';

export default function UploadDocumentModal({
  open,
  onClose,
  onUpload,
  employees = [],
  isLoading = false,
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('employment');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !file) return;

    const formData = new FormData();
    formData.append('employee_id', employeeId);
    formData.append('document_type', documentType);
    formData.append('title', title || file.name);
    formData.append('category', category);
    formData.append('file', file);

    onUpload(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
        <UploadIcon sx={{ color: '#0284C7' }} /> Upload & Assign Employee Document
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl size="small" fullWidth required>
            <InputLabel>Select Employee *</InputLabel>
            <Select
              value={employeeId}
              label="Select Employee *"
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id || emp.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="employment">Employment Document</MenuItem>
                <MenuItem value="certificate">Employee Certificate</MenuItem>
                <MenuItem value="policy">Policy / Agreement</MenuItem>
                <MenuItem value="submitted">Employee Submitted</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                label="Document Type"
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <MenuItem value="offer_letter">Offer Letter</MenuItem>
                <MenuItem value="appointment_letter">Appointment Letter</MenuItem>
                <MenuItem value="signed_agreement">Signed Agreement</MenuItem>
                <MenuItem value="id_proof">ID Proof</MenuItem>
                <MenuItem value="tax_document">Tax Document</MenuItem>
                <MenuItem value="other">Other Document</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Document Title *"
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Signed Offer Letter Copy"
            required
          />

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
            onClick={() => document.getElementById('admin-doc-file-input').click()}
          >
            <input
              id="admin-doc-file-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <UploadIcon sx={{ fontSize: 32, color: '#0284C7', mb: 1 }} />
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              {file ? file.name : 'Click to select document file'}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5 }}>
              Accepted formats: PDF, JPG, PNG, DOCX (Max 10 MB)
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
            disabled={isLoading || !employeeId || !file}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {isLoading ? 'Uploading...' : 'Upload & Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
