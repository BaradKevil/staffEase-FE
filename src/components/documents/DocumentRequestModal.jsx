/**
 * ===========================================
 *  Employee Document Request Modal
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
  Alert,
} from '@mui/material';
import { PostAddRounded as RequestIcon } from '@mui/icons-material';

const DOCUMENT_TYPES = [
  { value: 'employment_verification', label: 'Employment Verification Letter' },
  { value: 'experience_letter', label: 'Experience & Relieving Certificate' },
  { value: 'salary_certificate', label: 'Salary Certificate' },
  { value: 'employment_certificate', label: 'Employment Certificate' },
  { value: 'noc', label: 'No-Objection Certificate (NOC)' },
  { value: 'offer_letter_copy', label: 'Copy of Offer / Appointment Letter' },
  { value: 'other', label: 'Other Special Document' },
];

export default function DocumentRequestModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [documentType, setDocumentType] = useState('employment_verification');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documentType || !purpose.trim()) return;

    onSubmit({
      document_type: documentType,
      title: documentType === 'other' ? title.trim() : DOCUMENT_TYPES.find((d) => d.value === documentType)?.label,
      purpose: purpose.trim(),
      additional_notes: additionalNotes.trim(),
      preferred_date: preferredDate || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
        <RequestIcon sx={{ color: '#0284C7' }} /> Request an Official HR Document
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Alert severity="info" sx={{ borderRadius: '10px', fontSize: '13px' }}>
            Official documents are reviewed and digitally issued by HR within <strong>1–2 business days</strong>. You will receive an in-app and email notification when ready.
          </Alert>

          <FormControl size="small" fullWidth required>
            <InputLabel>Document Type *</InputLabel>
            <Select
              value={documentType}
              label="Document Type *"
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {DOCUMENT_TYPES.map((dt) => (
                <MenuItem key={dt.value} value={dt.value}>
                  {dt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {documentType === 'other' && (
            <TextField
              label="Specify Document Title *"
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visa Support Letter to Embassy"
              required
            />
          )}

          <TextField
            label="Purpose of Request *"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Applying for personal housing loan at State Bank / Visa stamping"
            required
            helperText="State clearly why you require this document."
          />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Needed By Date (Optional)"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </Box>

          <TextField
            label="Additional Notes / Specific Details"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g. Please address to Embassy of Germany, or include passport number."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !documentType || !purpose.trim()}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
