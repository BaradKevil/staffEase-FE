/**
 * ===========================================
 *  Employee Document Self-Service Portal
 * ===========================================
 *
 * Dedicated employee portal for:
 *  - Viewing & downloading issued HR documents
 *  - Requesting official certificates and letters
 *  - Tracking document request statuses & timelines
 *  - Required onboarding document checklist & re-uploads
 *  - Reviewing and digitally acknowledging workplace policies
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Button,
  Grid,
  Chip,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  FolderSharedOutlined as FolderIcon,
  PostAddRounded as RequestIcon,
  ChecklistRtlRounded as ChecklistIcon,
  MenuBookOutlined as PolicyIcon,
  HistoryOutlined as HistoryIcon,
  DownloadRounded as DownloadIcon,
  PictureAsPdfRounded as PdfIcon,
  CloudUploadRounded as UploadIcon,
  CheckCircleRounded as CheckIcon,
  WarningAmberRounded as WarningIcon,
  CancelOutlined as CancelIcon,
  HourglassEmptyRounded as PendingIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  useEmployeeDocuments,
  downloadDocumentFile,
  useSubmitDocumentRequest,
  useMyDocumentRequests,
  useCancelDocumentRequest,
  useEmployeeDocumentChecklist,
  useUploadChecklistDocument,
  useCompanyPolicies,
  useAcknowledgePolicy,
} from '../../Api/Api';

import DocumentRequestModal from '../../components/documents/DocumentRequestModal';
import ChecklistUploadModal from '../../components/documents/ChecklistUploadModal';

export default function EmployeeDocuments() {
  const [activeTab, setActiveTab] = useState(0);

  // Queries
  const { data: docsData, refetch: refetchDocs } = useEmployeeDocuments();
  const myDocs = docsData?.data || [];

  const { data: myRequests = [], refetch: refetchRequests } = useMyDocumentRequests();
  const { data: checklistData, refetch: refetchChecklist } = useEmployeeDocumentChecklist();
  const { data: policies = [], refetch: refetchPolicies } = useCompanyPolicies();

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState(null);

  // Filter state for My Documents
  const [categoryFilter, setCategoryFilter] = useState('');
  const [docSearch, setDocSearch] = useState('');

  // Request Submission
  const { mutate: submitReqMutate, isPending: isSubmittingReq } = useSubmitDocumentRequest(
    (res) => {
      toast.success(res?.message || 'Document request submitted!');
      setRequestModalOpen(false);
      refetchRequests();
      setActiveTab(2); // Switch to My Requests
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to submit request.')
  );

  // Cancel Request
  const { mutate: cancelReqMutate } = useCancelDocumentRequest(
    () => {
      toast.success('Document request cancelled.');
      refetchRequests();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to cancel request.')
  );

  // Checklist Upload
  const { mutate: uploadChecklistMutate, isPending: isUploadingChecklist } = useUploadChecklistDocument(
    (res) => {
      toast.success(res?.message || 'Document submitted for review!');
      setChecklistModalOpen(false);
      refetchChecklist();
      refetchDocs();
    },
    (err) => toast.error(err?.response?.data?.message || 'Upload failed.')
  );

  // Policy Acknowledgment
  const { mutate: acknowledgePolicyMutate } = useAcknowledgePolicy(
    () => {
      toast.success('Policy successfully acknowledged!');
      refetchPolicies();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to acknowledge policy.')
  );

  const checklistItems = checklistData?.checklist || [];
  const checklistSummary = checklistData?.summary || { totalRequired: 0, totalApproved: 0 };
  const checklistProgress =
    checklistSummary.totalRequired > 0
      ? Math.round((checklistSummary.totalApproved / checklistSummary.totalRequired) * 100)
      : 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Document Self-Service Portal
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Access official employment letters, request certificates, complete onboarding checklist, and view policies.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<RequestIcon />}
          onClick={() => setRequestModalOpen(true)}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            '&:hover': { bgcolor: '#1E293B' },
          }}
        >
          Request a Document
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ borderRadius: '14px', border: '1px solid #EEF2F6', boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #F1F5F9',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13px',
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<FolderIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="My Documents" />
          <Tab icon={<RequestIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Request a Document" />
          <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`My Requests (${myRequests.length})`} />
          <Tab icon={<ChecklistIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Required Documents" />
          <Tab icon={<PolicyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Policies & Handbooks" />
        </Tabs>
      </Card>

      {/* ========================================================= */}
      {/* TAB 0: MY DOCUMENTS */}
      {/* ========================================================= */}
      {activeTab === 0 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['', 'employment', 'certificate', 'policy'].map((cat) => (
                <Chip
                  key={cat}
                  label={cat ? cat.toUpperCase() : 'ALL DOCUMENTS'}
                  clickable
                  onClick={() => setCategoryFilter(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: categoryFilter === cat ? '#0F172A' : '#F1F5F9',
                    color: categoryFilter === cat ? '#FFFFFF' : '#475569',
                  }}
                />
              ))}
            </Box>

            <TextField
              size="small"
              placeholder="Search documents..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              sx={{ width: 220 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>DOCUMENT TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>REFERENCE NO</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>ISSUE DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B', textAlign: 'right' }}>DOWNLOAD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myDocs
                  .filter((d) => !categoryFilter || d.category === categoryFilter)
                  .filter((d) => !docSearch || d.title.toLowerCase().includes(docSearch.toLowerCase()))
                  .map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                        {doc.title}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>
                        {doc.reference_number}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={doc.category.toUpperCase()} sx={{ fontSize: '10px', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                        {doc.issue_date || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={doc.status.toUpperCase()}
                          sx={{
                            fontWeight: 700,
                            fontSize: '10px',
                            bgcolor: doc.status === 'issued' || doc.status === 'approved' ? '#ECFDF5' : '#FEF2F2',
                            color: doc.status === 'issued' || doc.status === 'approved' ? '#059669' : '#DC2626',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
                          onClick={() => downloadDocumentFile(doc.id, `${doc.reference_number}.pdf`)}
                          sx={{
                            textTransform: 'none',
                            bgcolor: '#0F172A',
                            fontSize: '11px',
                            fontWeight: 700,
                            py: 0.3,
                            '&:hover': { bgcolor: '#1E293B' },
                          }}
                        >
                          Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {myDocs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#94A3B8' }}>
                      No issued documents in your private repository yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 1: REQUEST A DOCUMENT ACTION TILES */}
      {/* ========================================================= */}
      {activeTab === 1 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Select a Document to Request from HR
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
              Choose a standard official letter type below, or specify a custom request:
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {[
              {
                type: 'employment_verification',
                title: 'Employment Verification Letter',
                desc: 'Standard letter confirming current active employment, job designation, and tenure.',
              },
              {
                type: 'salary_certificate',
                title: 'Salary Certificate',
                desc: 'Official certified statement of annual compensation for banking and loans.',
              },
              {
                type: 'noc',
                title: 'No-Objection Certificate (NOC)',
                desc: 'Issued for visa stamping, embassy appointments, or academic examinations.',
              },
              {
                type: 'experience_letter',
                title: 'Experience & Relieving Letter',
                desc: 'Formal service and experience certificate documenting tenure and duties.',
              },
              {
                type: 'offer_letter_copy',
                title: 'Copy of Offer / Appointment Letter',
                desc: 'Duplicate authenticated copy of your original employment appointment letter.',
              },
              {
                type: 'other',
                title: 'Custom HR Document',
                desc: 'Submit a custom request with your specific purpose and detailed instructions.',
              },
            ].map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.type}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#0284C7', bgcolor: '#F0F9FF', transform: 'translateY(-2px)' },
                  }}
                  onClick={() => setRequestModalOpen(true)}
                >
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', mb: 0.8 }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                      {card.desc}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ alignSelf: 'flex-start', mt: 2, textTransform: 'none', fontWeight: 700, color: '#0284C7' }}
                  >
                    Start Request &rarr;
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MY REQUESTS TRACKING */}
      {/* ========================================================= */}
      {activeTab === 2 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            My Submitted Document Requests
          </Typography>

          <Stack spacing={2}>
            {myRequests.map((req) => (
              <Box
                key={req.id}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0284C7' }}>
                      {req.reference_number}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>
                      {req.title || req.document_type.replace(/_/g, ' ')}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={req.status.replace(/_/g, ' ').toUpperCase()}
                    sx={{
                      fontWeight: 700,
                      fontSize: '11px',
                      bgcolor: req.status === 'completed' || req.status === 'ready_for_download' ? '#ECFDF5' : req.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                      color: req.status === 'completed' || req.status === 'ready_for_download' ? '#059669' : req.status === 'rejected' ? '#DC2626' : '#D97706',
                    }}
                  />
                </Box>

                <Typography sx={{ fontSize: '13px', color: '#334155' }}>
                  <strong>Purpose:</strong> {req.purpose}
                </Typography>

                {req.employee_visible_response && (
                  <Alert severity="info" sx={{ borderRadius: '8px', fontSize: '12px', py: 0.5 }}>
                    <strong>HR Response:</strong> {req.employee_visible_response}
                  </Alert>
                )}

                {req.rejection_reason && (
                  <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '12px', py: 0.5 }}>
                    <strong>Rejection Reason:</strong> {req.rejection_reason}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                    Submitted on {new Date(req.created_at).toLocaleDateString()}
                  </Typography>

                  <Stack direction="row" spacing={1.5}>
                    {req.issued_document && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={() => downloadDocumentFile(req.issued_document.id, `${req.issued_document.reference_number}.pdf`)}
                        sx={{ bgcolor: '#059669', textTransform: 'none', fontWeight: 700, fontSize: '11px', '&:hover': { bgcolor: '#047857' } }}
                      >
                        Download Issued Document
                      </Button>
                    )}
                    {['submitted', 'under_review'].includes(req.status) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => cancelReqMutate(req.id)}
                        sx={{ textTransform: 'none', fontSize: '11px', py: 0.2 }}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Box>
            ))}
            {myRequests.length === 0 && (
              <Typography sx={{ fontSize: '13px', color: '#94A3B8', py: 5, textAlign: 'center' }}>
                You have not submitted any document requests yet.
              </Typography>
            )}
          </Stack>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: REQUIRED ONBOARDING CHECKLIST */}
      {/* ========================================================= */}
      {activeTab === 3 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Onboarding & Compliance Document Checklist
              </Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: checklistProgress === 100 ? '#059669' : '#0284C7' }}>
                {checklistSummary.totalApproved} of {checklistSummary.totalRequired} Mandatory Completed ({checklistProgress}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={checklistProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: checklistProgress === 100 ? '#10B981' : '#0284C7',
                },
              }}
            />
          </Box>

          <Stack spacing={2}>
            {checklistItems.map((item) => (
              <Box
                key={item.documentType}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `1.5px solid ${item.status === 'approved' ? '#BBF7D0' : item.status === 'rejected' ? '#FECACA' : '#E2E8F0'}`,
                  bgcolor: item.status === 'approved' ? '#F0FDF4' : item.status === 'rejected' ? '#FEF2F2' : '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {item.title}
                    </Typography>
                    {item.isMandatory && (
                      <Chip size="small" label="MANDATORY" sx={{ fontSize: '9px', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                    {item.description}
                  </Typography>
                  {item.rejectionReason && (
                    <Typography sx={{ fontSize: '11px', color: '#DC2626', fontWeight: 600, mt: 0.5 }}>
                      Reason: {item.rejectionReason}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    size="small"
                    label={item.status.replace(/_/g, ' ').toUpperCase()}
                    sx={{
                      fontWeight: 700,
                      fontSize: '10px',
                      bgcolor:
                        item.status === 'approved'
                          ? '#DCFCE7'
                          : item.status === 'under_review'
                            ? '#EFF6FF'
                            : item.status === 'rejected'
                              ? '#FEE2E2'
                              : '#F1F5F9',
                      color:
                        item.status === 'approved'
                          ? '#15803D'
                          : item.status === 'under_review'
                            ? '#1D4ED8'
                            : item.status === 'rejected'
                              ? '#B91C1C'
                              : '#64748B',
                    }}
                  />

                  {item.status !== 'approved' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<UploadIcon sx={{ fontSize: '16px !important' }} />}
                      onClick={() => {
                        setSelectedChecklistItem(item);
                        setChecklistModalOpen(true);
                      }}
                      sx={{
                        textTransform: 'none',
                        bgcolor: '#0F172A',
                        fontWeight: 700,
                        fontSize: '11px',
                        '&:hover': { bgcolor: '#1E293B' },
                      }}
                    >
                      {item.status === 'rejected' ? 'Re-upload' : 'Upload'}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 4: COMPANY POLICIES & HANDBOOKS */}
      {/* ========================================================= */}
      {activeTab === 4 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Company Policies & Employee Handbooks
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
              Review active corporate policies and confirm your mandatory acknowledgements:
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {policies.map((policy) => (
              <Grid item xs={12} sm={6} key={policy.id}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip size="small" label="POLICY DOCUMENT" sx={{ fontSize: '10px', fontWeight: 700, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                      {policy.is_acknowledged ? (
                        <Chip size="small" icon={<CheckIcon sx={{ fontSize: '14px !important' }} />} label="ACKNOWLEDGED" sx={{ fontSize: '10px', fontWeight: 800, bgcolor: '#DCFCE7', color: '#166534' }} />
                      ) : (
                        <Chip size="small" label="ACKNOWLEDGEMENT PENDING" sx={{ fontSize: '10px', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                      {policy.title}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5 }}>
                      Ref: {policy.reference_number} &middot; v{policy.version}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #E2E8F0' }}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
                      onClick={() => downloadDocumentFile(policy.id, `${policy.reference_number}.pdf`)}
                      sx={{ textTransform: 'none', fontSize: '11px', fontWeight: 700 }}
                    >
                      Download PDF
                    </Button>

                    {!policy.is_acknowledged && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => acknowledgePolicyMutate(policy.id)}
                        sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: '11px', fontWeight: 700, '&:hover': { bgcolor: '#1E293B' } }}
                      >
                        I Acknowledge
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
            {policies.length === 0 && (
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '13px', color: '#94A3B8', py: 5, textAlign: 'center' }}>
                  No published company policies found.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Card>
      )}

      {/* Request Modal */}
      <DocumentRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        isLoading={isSubmittingReq}
        onSubmit={(reqData) => submitReqMutate(reqData)}
      />

      {/* Checklist Upload Modal */}
      <ChecklistUploadModal
        open={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        item={selectedChecklistItem}
        isLoading={isUploadingChecklist}
        onUpload={(formData) => uploadChecklistMutate(formData)}
      />
    </Box>
  );
}
