/**
 * ===========================================
 *  Email Template Editor Modal
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
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { AddRounded as AddIcon, CodeRounded as CodeIcon } from '@mui/icons-material';

const AVAILABLE_PLACEHOLDERS = [
  { key: '{{employeeName}}', label: 'Full Name' },
  { key: '{{firstName}}', label: 'First Name' },
  { key: '{{lastName}}', label: 'Last Name' },
  { key: '{{employeeEmail}}', label: 'Work Email' },
  { key: '{{jobTitle}}', label: 'Job Title' },
  { key: '{{department}}', label: 'Department' },
  { key: '{{employmentType}}', label: 'Employment Type' },
  { key: '{{joiningDate}}', label: 'Joining Date' },
  { key: '{{companyName}}', label: 'Company Name' },
  { key: '{{managerName}}', label: 'Manager Name' },
  { key: '{{workLocation}}', label: 'Work Location' },
  { key: '{{probationPeriod}}', label: 'Probation Period' },
  { key: '{{adminName}}', label: 'Admin / Sender Name' },
  { key: '{{onboardingPortalUrl}}', label: 'Onboarding Portal URL' },
  { key: '{{documentReferenceNumber}}', label: 'Document Ref No' },
  { key: '{{additionalInstructions}}', label: 'Additional Instructions' },
];

export default function TemplateEditorModal({
  open,
  onClose,
  onSave,
  template = null,
  isLoading = false,
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [status, setStatus] = useState('active');
  const [cursorTarget, setCursorTarget] = useState('body'); // 'subject' | 'body'

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setCategory(template.category || 'general');
      setSubject(template.subject || '');
      setHtmlBody(template.html_body || '');
      setStatus(template.status || 'active');
    } else {
      setName('');
      setCategory('general');
      setSubject('');
      setHtmlBody('');
      setStatus('active');
    }
  }, [template, open]);

  const insertPlaceholder = (phKey) => {
    if (cursorTarget === 'subject') {
      setSubject((prev) => `${prev} ${phKey}`);
    } else {
      setHtmlBody((prev) => `${prev}\n${phKey}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !htmlBody.trim()) {
      return;
    }
    onSave({
      name: name.trim(),
      category,
      subject: subject.trim(),
      html_body: htmlBody,
      status,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
        {template ? 'Edit Email Template' : 'Create New Email Template'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Template Name *"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Formal Offer Letter Notification"
              required
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="offer">Offer & Selection</MenuItem>
                <MenuItem value="onboarding">Onboarding</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="document">Document Service</MenuItem>
                <MenuItem value="general">General / Custom</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Placeholder insertion toolbar */}
          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CodeIcon sx={{ fontSize: 16, color: '#0284C7' }} /> Insert Dynamic Placeholder:
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                Inserting into: <strong>{cursorTarget === 'subject' ? 'Subject' : 'Email Body'}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, maxHeight: 90, overflowY: 'auto' }}>
              {AVAILABLE_PLACEHOLDERS.map((ph) => (
                <Chip
                  key={ph.key}
                  label={`${ph.label} (${ph.key})`}
                  size="small"
                  onClick={() => insertPlaceholder(ph.key)}
                  icon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' },
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            label="Email Subject Line *"
            fullWidth
            size="small"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onFocus={() => setCursorTarget('subject')}
            placeholder="e.g. Congratulations {{firstName}}! Offer of Employment"
            required
          />

          <TextField
            label="Email Body (HTML / Plain text) *"
            fullWidth
            multiline
            rows={10}
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            onFocus={() => setCursorTarget('body')}
            placeholder="Write your email body with {{placeholders}} or paste standard HTML..."
            required
            helperText="Supports dynamic placeholders. Script tags and unsafe links are sanitized automatically."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !name.trim() || !subject.trim() || !htmlBody.trim()}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {isLoading ? 'Saving...' : template ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
