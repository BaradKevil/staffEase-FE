/**
 * ===========================================
 *  Generate Document (PDF) Modal
 * ===========================================
 */

import React, { useState, useEffect } from 'react';
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
  Grid,
} from '@mui/material';
import { PictureAsPdfRounded as PdfIcon } from '@mui/icons-material';
import { useDocumentTemplates } from '../../Api/Api';

export default function GenerateDocumentModal({
  open,
  onClose,
  onGenerate,
  employees = [],
  isLoading = false,
  preselectedEmployeeId = null,
}) {
  const [employeeId, setEmployeeId] = useState(preselectedEmployeeId || '');
  const [templateId, setTemplateId] = useState('');
  const [documentType, setDocumentType] = useState('offer_letter');
  const [title, setTitle] = useState('');
  const [authorizedSignatory, setAuthorizedSignatory] = useState('Head of Human Resources');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Director, People & Culture');
  const [notes, setNotes] = useState('');

  const { data: templates = [] } = useDocumentTemplates();

  useEffect(() => {
    if (preselectedEmployeeId) {
      setEmployeeId(preselectedEmployeeId);
    }
  }, [preselectedEmployeeId, open]);

  const handleTemplateChange = (e) => {
    const tId = e.target.value;
    setTemplateId(tId);
    const selected = templates.find((t) => t.id === Number(tId));
    if (selected) {
      setTitle(selected.name);
      if (selected.category === 'employment') setDocumentType('offer_letter');
      else if (selected.category === 'certificate') setDocumentType('employment_certificate');
      else setDocumentType('other');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !title.trim()) return;

    onGenerate({
      employee_id: Number(employeeId),
      template_id: templateId ? Number(templateId) : undefined,
      document_type: documentType,
      title: title.trim(),
      authorized_signatory: authorizedSignatory.trim(),
      signatory_designation: signatoryDesignation.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PdfIcon sx={{ color: '#0284C7' }} /> Generate & Issue Official Document
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Employee Selection */}
          <FormControl size="small" fullWidth required>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={employeeId}
              label="Select Employee"
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id || emp.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Template Selection */}
          <FormControl size="small" fullWidth>
            <InputLabel>Choose HR Document Template</InputLabel>
            <Select
              value={templateId}
              label="Choose HR Document Template"
              onChange={handleTemplateChange}
            >
              <MenuItem value="">-- Custom Letter (Blank) --</MenuItem>
              {templates.map((tpl) => (
                <MenuItem key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.category.toUpperCase()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Document Title *"
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employment Verification Letter"
                required
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentType}
                  label="Document Type"
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <MenuItem value="offer_letter">Offer Letter</MenuItem>
                  <MenuItem value="appointment_letter">Appointment Letter</MenuItem>
                  <MenuItem value="internship_agreement">Internship Letter</MenuItem>
                  <MenuItem value="employment_certificate">Verification Certificate</MenuItem>
                  <MenuItem value="experience_letter">Experience / Relieving</MenuItem>
                  <MenuItem value="salary_certificate">Salary Certificate</MenuItem>
                  <MenuItem value="noc">NOC</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Authorized Signatory"
              fullWidth
              size="small"
              value={authorizedSignatory}
              onChange={(e) => setAuthorizedSignatory(e.target.value)}
            />
            <TextField
              label="Signatory Designation"
              fullWidth
              size="small"
              value={signatoryDesignation}
              onChange={(e) => setSignatoryDesignation(e.target.value)}
            />
          </Box>

          <TextField
            label="Internal Notes / Filing Remarks"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Issued for bank visa processing application"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !employeeId || !title.trim()}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {isLoading ? 'Generating PDF...' : 'Generate & Issue PDF'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
