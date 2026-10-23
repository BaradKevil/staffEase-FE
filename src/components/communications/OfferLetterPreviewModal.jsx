/**
 * ===========================================
 *  Offer Letter & Email Preview Modal
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
  Tabs,
  Tab,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  PictureAsPdfRounded as PdfIcon,
  EmailOutlined as EmailIcon,
  DescriptionOutlined as DocumentIcon,
  CloseRounded as CloseIcon,
  CheckCircleRounded as CheckIcon,
  AttachFileRounded as AttachIcon,
} from '@mui/icons-material';

export default function OfferLetterPreviewModal({
  open,
  onClose,
  formData,
  onConfirmSend,
  isSending,
}) {
  const [previewTab, setPreviewTab] = useState(0);

  if (!formData) return null;

  const isInternship = formData.employment_type === 'internship';
  const candidateName = formData.candidate_name || 'Candidate Name';
  const roleTitle = formData.job_title || 'Designated Role';
  const dept = formData.department || 'General';
  const joiningDate = formData.joining_date || 'TBD';
  const refNumber = `SE-OFR-${new Date().getFullYear()}-PREVIEW`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                bgcolor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DocumentIcon fontSize="small" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Preview: {isInternship ? 'Internship Offer Letter' : 'Employment Offer Letter'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                Recipient: {candidateName} ({formData.candidate_email || 'email not set'})
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            label={isInternship ? 'Internship' : 'Full-Time Employee'}
            sx={{
              fontWeight: 700,
              fontSize: '11px',
              bgcolor: isInternship ? '#EDE9FE' : '#E0F2FE',
              color: isInternship ? '#7C3AED' : '#0284C7',
            }}
          />
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', bgcolor: '#F8FAFC', px: 2.5 }}>
        <Tabs
          value={previewTab}
          onChange={(_, val) => setPreviewTab(val)}
          sx={{ minHeight: 44 }}
        >
          <Tab
            icon={<PdfIcon sx={{ fontSize: '16px !important', mr: 0.8 }} />}
            iconPosition="start"
            label="Generated Offer Letter (PDF 1)"
            sx={{ fontSize: '13px', fontWeight: 600, minHeight: 44, textTransform: 'none' }}
          />
          <Tab
            icon={<EmailIcon sx={{ fontSize: '16px !important', mr: 0.8 }} />}
            iconPosition="start"
            label="Email Message & Attachments"
            sx={{ fontSize: '13px', fontWeight: 600, minHeight: 44, textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#F1F5F9' }}>
        {previewTab === 0 ? (
          // Simulated PDF View
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2.5, sm: 4 },
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: 720,
              mx: 'auto',
              border: '1px solid #CBD5E1',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {/* Top letterhead bar */}
            <Box sx={{ height: 4, bgcolor: '#0284C7', mb: 3 }} />

            {/* Letterhead Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                pb: 2,
                borderBottom: '1px solid #E2E8F0',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '20px',
                  }}
                >
                  S
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    staff<span style={{ color: '#0284C7' }}>Ease</span>
                  </Typography>
                  <Typography sx={{ fontSize: '10.5px', color: '#64748B' }}>
                    People & Culture Operations
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                  Enterprise Workspace Center, Floor 8, Cyber Tower
                </Typography>
                <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                  Ref: {refNumber} | {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Box>
            </Box>

            {/* Document Title Badge */}
            <Box
              sx={{
                bgcolor: '#F8FAFC',
                py: 1,
                px: 2,
                borderRadius: '4px',
                textAlign: 'center',
                mb: 3,
                border: '1px solid #E2E8F0',
              }}
            >
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em' }}>
                {isInternship ? 'INTERNSHIP APPOINTMENT & OFFER LETTER' : 'FORMAL OFFER OF EMPLOYMENT'}
              </Typography>
            </Box>

            {/* TO details */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>TO:</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                {candidateName}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#475569' }}>
                {roleTitle} — {dept}
              </Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#64748B' }}>
                {formData.candidate_email}
              </Typography>
            </Box>

            {/* Key Terms Table */}
            <Table
              size="small"
              sx={{
                mb: 3,
                border: '1px solid #BAE6FD',
                bgcolor: '#F0F9FF',
                borderRadius: '6px',
                '& td': { py: 0.8, px: 1.5, borderColor: '#E0F2FE' },
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', width: '38%', fontSize: '12px' }}>
                    Role / Position
                  </TableCell>
                  <TableCell sx={{ color: '#0F172A', fontSize: '12px', fontWeight: 600 }}>
                    {roleTitle}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', fontSize: '12px' }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ color: '#0F172A', fontSize: '12px' }}>{dept}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', fontSize: '12px' }}>
                    Engagement Status
                  </TableCell>
                  <TableCell sx={{ color: '#0284C7', fontWeight: 700, fontSize: '12px' }}>
                    {isInternship ? `Internship (${formData.duration || '3 Months'})` : 'Full-Time Regular Employment'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', fontSize: '12px' }}>
                    Commencement Date
                  </TableCell>
                  <TableCell sx={{ color: '#0F172A', fontSize: '12px' }}>{joiningDate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', fontSize: '12px' }}>
                    {isInternship ? 'Stipend / Compensation' : 'Annual CTC'}
                  </TableCell>
                  <TableCell sx={{ color: '#16A34A', fontWeight: 700, fontSize: '12px' }}>
                    {isInternship
                      ? formData.is_paid
                        ? `${formData.stipend_amount || 'Stipend'} (${formData.stipend_frequency || 'Per Month'})`
                        : 'Unpaid (Academic Training)'
                      : formData.salary || 'As per compensation schedule'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', fontSize: '12px' }}>
                    {isInternship ? 'Reporting Mentor' : 'Probation Period'}
                  </TableCell>
                  <TableCell sx={{ color: '#0F172A', fontSize: '12px' }}>
                    {isInternship ? formData.mentor_name || 'Designated Lead' : formData.probation_period || '3 Months'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#0369A1', fontSize: '12px' }}>
                    Work Location / Mode
                  </TableCell>
                  <TableCell sx={{ color: '#0F172A', fontSize: '12px' }}>
                    {formData.work_location || 'Hybrid'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Paragraphs */}
            <Typography sx={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.6, mb: 2 }}>
              {isInternship
                ? `We are pleased to offer you an internship engagement as ${roleTitle} within our ${dept} department at staffEase Technologies. During your tenure, you will work with our cross-functional engineering and product teams to deliver real-world software capabilities.`
                : `On behalf of staffEase Technologies Inc., we are delighted to formally extend this offer of employment for the position of ${roleTitle}. We were impressed by your background and are confident in your contributions to our mission.`}
            </Typography>

            <Typography sx={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.6, mb: 2 }}>
              Enclosed with this offer is the official <strong>staffEase Company Policies & Code of Conduct</strong>. Acceptance of this offer implies adherence to all confidentiality, information security, and governance standards.
            </Typography>

            {formData.additional_instructions && (
              <Box sx={{ p: 1.5, bgcolor: '#FEF9C3', borderRadius: '6px', mb: 2.5, border: '1px solid #FDE047' }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#854D0E', mb: 0.5 }}>
                  Special Instructions:
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#713F12' }}>
                  {formData.additional_instructions}
                </Typography>
              </Box>
            )}

            {/* Signature Block */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 3, borderTop: '1px solid #E2E8F0' }}>
              <Box>
                <Typography sx={{ fontSize: '11.5px', color: '#64748B' }}>Sincerely,</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                  For staffEase Technologies Inc.
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    border: '1px dashed #CBD5E1',
                    borderRadius: '4px',
                    width: 170,
                    bgcolor: '#F8FAFC',
                  }}
                >
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, color: '#0284C7' }}>
                    ✓ DIGITALLY AUTHORIZED
                  </Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
                    Elena Rostova
                  </Typography>
                  <Typography sx={{ fontSize: '9.5px', color: '#64748B' }}>
                    Director, People Operations
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                  label="Official Record Seal"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: '10.5px', fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Paper>
        ) : (
          // Email Layout
          <Paper
            elevation={1}
            sx={{
              maxWidth: 680,
              mx: 'auto',
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Email Metadata */}
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '13px', color: '#475569', mb: 0.5 }}>
                <strong>To:</strong> {formData.candidate_name} &lt;{formData.candidate_email}&gt;
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#475569', mb: 0.5 }}>
                <strong>From:</strong> staffEase HR &lt;hr@staffease.internal&gt;
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>
                <strong>Subject:</strong>{' '}
                {isInternship
                  ? `Congratulations ${candidateName}! Internship Offer — staffEase Technologies`
                  : `Formal Offer of Employment — Welcome to staffEase, ${candidateName}!`}
              </Typography>
            </Box>

            {/* Email Body */}
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '14px', color: '#0F172A', fontWeight: 700, mb: 1.5 }}>
                Dear {candidateName},
              </Typography>
              <Typography sx={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, mb: 2 }}>
                {isInternship
                  ? `We are delighted to extend this formal offer of internship engagement for the position of ${roleTitle} within our ${dept} department. Congratulations on your selection!`
                  : `On behalf of staffEase Technologies, we are thrilled to formally extend this offer of employment for the position of ${roleTitle}. We were thoroughly impressed with your profile.`}
              </Typography>

              {/* Attachments Highlight */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  mb: 2.5,
                }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachIcon fontSize="small" /> 2 Official PDF Documents Attached to this Email:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600 }}>
                      staffEase_Offer_Letter_{candidateName.replace(/\s+/g, '_')}.pdf
                    </Typography>
                    <Chip size="small" label="Auto-Generated" sx={{ height: 20, fontSize: '10px', bgcolor: '#E0F2FE', color: '#0284C7' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600 }}>
                      staffEase_Company_Policies_and_Code_of_Conduct.pdf
                    </Typography>
                    <Chip size="small" label="Enclosed Standard" sx={{ height: 20, fontSize: '10px', bgcolor: '#EDE9FE', color: '#7C3AED' }} />
                  </Box>
                </Box>
              </Box>

              <Typography sx={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                Warm regards,<br />
                <strong>People & Culture Operations Team</strong><br />
                staffEase Technologies Inc.
              </Typography>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}>
          Close Preview
        </Button>
        {onConfirmSend && (
          <Button
            variant="contained"
            onClick={onConfirmSend}
            disabled={isSending}
            sx={{
              bgcolor: '#0284C7',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#0369A1' },
            }}
          >
            {isSending ? 'Sending Offer Email...' : 'Confirm & Send Email with 2 PDFs'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
