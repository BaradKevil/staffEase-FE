/**
 * ===========================================
 *  Admin Employee Communication Center
 * ===========================================
 *
 * Enterprise hub for automated onboarding communications,
 * email template management, bulk messaging, document requests triage,
 * and HR document generation.
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Divider,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  DescriptionOutlined as DocumentIcon,
  SendRounded as SendIcon,
  LibraryBooksOutlined as TemplateIcon,
  AssignmentOutlined as RequestIcon,
  HistoryOutlined as HistoryIcon,
  SettingsOutlined as SettingsIcon,
  DashboardOutlined as DashboardIcon,
  AddRounded as AddIcon,
  PictureAsPdfRounded as PdfIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  ContentCopyRounded as CopyIcon,
  RefreshRounded as RetryIcon,
  CheckCircleOutlineRounded as CompleteIcon,
  CancelOutlined as RejectIcon,
  HourglassEmptyRounded as PendingIcon,
  PersonOutlineOutlined as PersonIcon,
  UploadFileRounded as UploadIcon,
  BlockRounded as RevokeIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  useCommunicationOverview,
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDuplicateEmailTemplate,
  usePreviewEmail,
  useSendCommunication,
  useEmailHistory,
  useRetryEmail,
  useCommunicationSettings,
  useEmployeeDocuments,
  downloadDocumentFile,
  useGenerateDocument,
  useUploadDocument,
  useRevokeDocument,
  useAdminDocumentRequests,
  useAssignDocumentRequest,
  useUpdateDocumentRequestStatus,
  useIssueDocumentFromRequest,
  useEmployees,
  useDepartments,
} from '../../Api/Api';

import TemplateEditorModal from '../../components/communications/TemplateEditorModal';
import EmailPreviewModal from '../../components/communications/EmailPreviewModal';
import GenerateDocumentModal from '../../components/documents/GenerateDocumentModal';
import UploadDocumentModal from '../../components/documents/UploadDocumentModal';

const TAB_INDEX_MAP = {
  overview: 0,
  templates: 1,
  compose: 2,
  documents: 3,
  requests: 4,
  history: 5,
  settings: 6,
};

export default function CommunicationsCenter() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial tab from query param or pathname
  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && TAB_INDEX_MAP[tabParam] !== undefined) {
      return TAB_INDEX_MAP[tabParam];
    }
    if (location.pathname.includes('employee-documents')) return 3;
    if (location.pathname.includes('document-requests')) return 4;
    return 0;
  }, [location]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Queries
  const { data: overviewData, isLoading: isOverviewLoading, refetch: refetchOverview } = useCommunicationOverview();
  const { data: templates = [], isLoading: isTemplatesLoading, refetch: refetchTemplates } = useEmailTemplates();
  const { data: settingsData } = useCommunicationSettings();
  const { data: empData } = useEmployees({ limit: 200 });
  const employees = empData?.data || [];
  const { data: depts = [] } = useDepartments();

  // -------------------------------------------------------------
  // Tab 1: Template Management State
  // -------------------------------------------------------------
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { mutate: createTemplateMutate, isPending: isCreatingTpl } = useCreateEmailTemplate(
    () => {
      toast.success('Email template created successfully!');
      setEditorModalOpen(false);
      refetchTemplates();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to create template.')
  );

  const { mutate: updateTemplateMutate, isPending: isUpdatingTpl } = useUpdateEmailTemplate(
    () => {
      toast.success('Email template updated successfully!');
      setEditorModalOpen(false);
      refetchTemplates();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to update template.')
  );

  const { mutate: duplicateTemplateMutate } = useDuplicateEmailTemplate(
    () => {
      toast.success('Template duplicated.');
      refetchTemplates();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to duplicate template.')
  );

  // -------------------------------------------------------------
  // Tab 2: Compose & Send State
  // -------------------------------------------------------------
  const [recipientType, setRecipientType] = useState('single');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('full_time');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeHtml, setComposeHtml] = useState('');

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ subject: '', html: '', missingFields: [] });
  const { mutate: previewMutate, isPending: isPreviewLoading } = usePreviewEmail();

  // Send Communication Mutation
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const { mutate: sendMutate, isPending: isSending } = useSendCommunication(
    (res) => {
      toast.success(res?.message || 'Emails dispatched successfully!');
      setConfirmSendOpen(false);
      refetchOverview();
      setActiveTab(5); // Switch to Email History
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to send emails.')
  );

  const handleTemplateSelect = (tId) => {
    setSelectedTemplateId(tId);
    if (!tId) {
      setComposeSubject('');
      setComposeHtml('');
      return;
    }
    const tpl = templates.find((t) => t.id === Number(tId));
    if (tpl) {
      setComposeSubject(tpl.subject);
      setComposeHtml(tpl.html_body);
    }
  };

  const handleOpenPreview = () => {
    previewMutate(
      {
        template_id: selectedTemplateId ? Number(selectedTemplateId) : undefined,
        subject: composeSubject,
        html_body: composeHtml,
        employee_id: selectedEmployeeId ? Number(selectedEmployeeId) : undefined,
      },
      {
        onSuccess: (data) => {
          setPreviewData(data);
          setPreviewModalOpen(true);
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Preview failed.'),
      }
    );
  };

  const handleExecuteSend = () => {
    sendMutate({
      template_id: selectedTemplateId ? Number(selectedTemplateId) : undefined,
      recipient_type: recipientType,
      recipient_ids:
        recipientType === 'single' && selectedEmployeeId
          ? [Number(selectedEmployeeId)]
          : recipientType === 'multiple'
            ? selectedEmployeeIds.map(Number)
            : undefined,
      recipient_email: recipientType === 'single' ? candidateEmail : undefined,
      recipient_name: recipientType === 'single' ? candidateName : undefined,
      department_id: recipientType === 'department' ? Number(selectedDeptId) : undefined,
      employment_type: recipientType === 'employment_type' ? selectedEmploymentType : undefined,
      subject: composeSubject,
      html_body: composeHtml,
      idempotency_key: `compose-${Date.now()}`,
    });
  };

  // -------------------------------------------------------------
  // Tab 3: Employee Documents State
  // -------------------------------------------------------------
  const [docCategoryFilter, setDocCategoryFilter] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [generateDocModalOpen, setGenerateDocModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokingDocId, setRevokingDocId] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');

  const { data: docsData, refetch: refetchDocs } = useEmployeeDocuments({
    category: docCategoryFilter,
    search: docSearch,
  });
  const employeeDocs = docsData?.data || [];

  const { mutate: generateDocMutate, isPending: isGeneratingDoc } = useGenerateDocument(
    () => {
      toast.success('Document generated and issued successfully!');
      setGenerateDocModalOpen(false);
      refetchDocs();
      refetchOverview();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to generate document.')
  );

  const { mutate: uploadDocMutate, isPending: isUploadingDoc } = useUploadDocument(
    () => {
      toast.success('Document uploaded and saved successfully!');
      setUploadDocModalOpen(false);
      refetchDocs();
    },
    (err) => toast.error(err?.response?.data?.message || 'Upload failed.')
  );

  const { mutate: revokeDocMutate } = useRevokeDocument(
    () => {
      toast.success('Document revoked.');
      setRevokeModalOpen(false);
      refetchDocs();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to revoke document.')
  );

  // -------------------------------------------------------------
  // Tab 4: Document Requests Triage State
  // -------------------------------------------------------------
  const [reqStatusFilter, setReqStatusFilter] = useState('');
  const [reqSearch, setReqSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetailOpen, setRequestDetailOpen] = useState(false);
  const [assignHandlerId, setAssignHandlerId] = useState('');
  const [statusUpdateVal, setStatusUpdateVal] = useState('approved');
  const [employeeResponseText, setEmployeeResponseText] = useState('');
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  const { data: requestsData, refetch: refetchRequests } = useAdminDocumentRequests({
    status: reqStatusFilter,
    search: reqSearch,
  });
  const adminRequests = requestsData?.data || [];

  const { mutate: assignRequestMutate } = useAssignDocumentRequest(
    () => {
      toast.success('Request assigned to HR handler.');
      refetchRequests();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to assign handler.')
  );

  const { mutate: updateReqStatusMutate } = useUpdateDocumentRequestStatus(
    () => {
      toast.success('Request status updated!');
      setRequestDetailOpen(false);
      refetchRequests();
      refetchOverview();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to update status.')
  );

  const { mutate: issueFromRequestMutate, isPending: isIssuingDoc } = useIssueDocumentFromRequest(
    () => {
      toast.success('Document issued and request completed!');
      setRequestDetailOpen(false);
      refetchRequests();
      refetchDocs();
      refetchOverview();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to issue document.')
  );

  // -------------------------------------------------------------
  // Tab 5: Email History State
  // -------------------------------------------------------------
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');
  const { data: historyData, refetch: refetchHistory } = useEmailHistory({
    search: historySearch,
    status: historyStatusFilter,
  });
  const emailHistoryLogs = historyData?.data || [];

  const { mutate: retryEmailMutate } = useRetryEmail(
    () => {
      toast.success('Retry dispatched.');
      refetchHistory();
    },
    (err) => toast.error(err?.response?.data?.message || 'Retry failed.')
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Employee Communication Center
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Automated onboarding emails, reusable template library, document generation & self-service triage.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => {
              setEditingTemplate(null);
              setEditorModalOpen(true);
            }}
            sx={{
              borderColor: '#CBD5E1',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            New Template
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setActiveTab(2)}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            Compose Email
          </Button>
        </Stack>
      </Box>

      {/* Tabs Navigation */}
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
          <Tab icon={<DashboardIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" />
          <Tab icon={<TemplateIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Email Templates" />
          <Tab icon={<SendIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Compose & Send" />
          <Tab icon={<DocumentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Employee Documents" />
          <Tab icon={<RequestIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Document Requests" />
          <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Email History" />
          <Tab icon={<SettingsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Settings" />
        </Tabs>
      </Card>

      {/* ========================================================= */}
      {/* TAB 0: OVERVIEW DASHBOARD */}
      {/* ========================================================= */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Metrics Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ p: 2, borderRadius: '12px', border: '1px solid #EEF2F6', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Total Emails Sent</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                  {overviewData?.metrics?.totalEmailsSent ?? 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ p: 2, borderRadius: '12px', border: '1px solid #EEF2F6', bgcolor: '#F0FDF4', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Delivered</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#15803D', mt: 0.5 }}>
                  {overviewData?.metrics?.emailsDelivered ?? 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ p: 2, borderRadius: '12px', border: '1px solid #EEF2F6', bgcolor: '#FEF2F2', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#991B1B', fontWeight: 600 }}>Delivery Failed</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', mt: 0.5 }}>
                  {overviewData?.metrics?.emailsFailed ?? 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ p: 2, borderRadius: '12px', border: '1px solid #EEF2F6', bgcolor: '#FFFBEB', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Pending Requests</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                  {overviewData?.metrics?.pendingDocRequests ?? 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ p: 2, borderRadius: '12px', border: '1px solid #EEF2F6', bgcolor: '#EFF6FF', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Approved Requests</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', mt: 0.5 }}>
                  {overviewData?.metrics?.approvedDocRequests ?? 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ p: 2, borderRadius: '12px', border: '1px solid #EEF2F6', bgcolor: '#FAF5FF', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#6B21A8', fontWeight: 600 }}>Documents Issued</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', mt: 0.5 }}>
                  {overviewData?.metrics?.documentsGenerated ?? 0}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Side by side: Recent Emails & Recent Requests */}
          <Grid container spacing={3}>
            {/* Recent Email Activity */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: '14px', border: '1px solid #EEF2F6', p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Recent Email Dispatches
                  </Typography>
                  <Button size="small" onClick={() => setActiveTab(5)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    View All &rarr;
                  </Button>
                </Box>
                {overviewData?.recentEmails && overviewData.recentEmails.length > 0 ? (
                  <Stack spacing={1.5}>
                    {overviewData.recentEmails.map((mail) => (
                      <Box
                        key={mail.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {mail.subject}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                            To: {mail.recipient_email} &middot; Sent by {mail.sender?.first_name || 'HR'}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={mail.status}
                          sx={{
                            fontWeight: 700,
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            bgcolor: mail.status === 'sent' || mail.status === 'delivered' ? '#ECFDF5' : '#FEF2F2',
                            color: mail.status === 'sent' || mail.status === 'delivered' ? '#059669' : '#DC2626',
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: '13px', color: '#94A3B8', py: 3, textAlign: 'center' }}>
                    No recent email dispatches logged yet.
                  </Typography>
                )}
              </Card>
            </Grid>

            {/* Recent Document Requests */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: '14px', border: '1px solid #EEF2F6', p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Recent Document Requests
                  </Typography>
                  <Button size="small" onClick={() => setActiveTab(4)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    View Queue &rarr;
                  </Button>
                </Box>
                {overviewData?.recentDocRequests && overviewData.recentDocRequests.length > 0 ? (
                  <Stack spacing={1.5}>
                    {overviewData.recentDocRequests.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {req.reference_number}: {req.title || req.document_type}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                            Requested by {req.employee?.first_name} {req.employee?.last_name}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={req.status.replace(/_/g, ' ')}
                          sx={{
                            fontWeight: 700,
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            bgcolor: req.status === 'completed' || req.status === 'ready_for_download' ? '#ECFDF5' : '#FFFBEB',
                            color: req.status === 'completed' || req.status === 'ready_for_download' ? '#059669' : '#D97706',
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: '13px', color: '#94A3B8', py: 3, textAlign: 'center' }}>
                    No pending document requests in queue.
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================= */}
      {/* TAB 1: EMAIL TEMPLATES */}
      {/* ========================================================= */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['all', 'offer', 'onboarding', 'internship', 'announcement', 'document', 'general'].map((cat) => (
                <Chip
                  key={cat}
                  label={cat.toUpperCase()}
                  clickable
                  onClick={() => setTemplateCategoryFilter(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: templateCategoryFilter === cat ? '#0F172A' : '#F1F5F9',
                    color: templateCategoryFilter === cat ? '#FFFFFF' : '#475569',
                  }}
                />
              ))}
            </Box>

            <TextField
              size="small"
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              sx={{ width: 240 }}
            />
          </Box>

          <Grid container spacing={2}>
            {templates
              .filter((tpl) => templateCategoryFilter === 'all' || tpl.category === templateCategoryFilter)
              .filter((tpl) => !templateSearch || tpl.name.toLowerCase().includes(templateSearch.toLowerCase()))
              .map((tpl) => (
                <Grid item xs={12} sm={6} md={4} key={tpl.id}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      border: '1px solid #EEF2F6',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip
                          size="small"
                          label={tpl.category.toUpperCase()}
                          sx={{ fontSize: '10px', fontWeight: 700, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                        />
                        {tpl.is_system && (
                          <Chip size="small" label="SYSTEM DEFAULT" sx={{ fontSize: '9px', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', mt: 1 }}>
                        {tpl.name}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.5, fontStyle: 'italic' }}>
                        Subject: {tpl.subject}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                        v{tpl.version} &middot; {tpl.supported_placeholders?.length || 0} fields
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Preview with sample data">
                          <IconButton
                            size="small"
                            onClick={() => {
                              previewMutate(
                                { template_id: tpl.id },
                                {
                                  onSuccess: (data) => {
                                    setPreviewData(data);
                                    setPreviewModalOpen(true);
                                  },
                                }
                              );
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate Template">
                          <IconButton size="small" onClick={() => duplicateTemplateMutate(tpl.id)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Template">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingTemplate(tpl);
                              setEditorModalOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COMPOSE & SEND */}
      {/* ========================================================= */}
      {activeTab === 2 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            Compose & Dispatch Communication
          </Typography>

          {/* Recipient Mode Selection */}
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569', mb: 1.5, textTransform: 'uppercase' }}>
              1. Choose Recipient Audience
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Recipient Mode</InputLabel>
                  <Select
                    value={recipientType}
                    label="Recipient Mode"
                    onChange={(e) => setRecipientType(e.target.value)}
                  >
                    <MenuItem value="single">Single Employee / External Candidate</MenuItem>
                    <MenuItem value="multiple">Multiple Selected Employees</MenuItem>
                    <MenuItem value="all_active">All Active Employees (Company-Wide)</MenuItem>
                    <MenuItem value="department">Filtered by Department</MenuItem>
                    <MenuItem value="employment_type">Filtered by Employment Type</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Dynamic Recipient Controls */}
              {recipientType === 'single' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Existing Employee (or leave blank for candidate)</InputLabel>
                      <Select
                        value={selectedEmployeeId}
                        label="Existing Employee (or leave blank for candidate)"
                        onChange={(e) => {
                          setSelectedEmployeeId(e.target.value);
                          const emp = employees.find((x) => x.id === Number(e.target.value));
                          if (emp) {
                            setCandidateEmail(emp.email);
                            setCandidateName(`${emp.first_name} ${emp.last_name}`);
                          }
                        }}
                      >
                        <MenuItem value="">-- External Candidate / Custom Email --</MenuItem>
                        {employees.map((emp) => (
                          <MenuItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} ({emp.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {!selectedEmployeeId && (
                    <Grid item xs={12} sm={4}>
                      <TextField
                        size="small"
                        label="Candidate Email Address *"
                        fullWidth
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="candidate@example.com"
                      />
                    </Grid>
                  )}
                </>
              )}

              {recipientType === 'multiple' && (
                <Grid item xs={12} sm={8}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Select Specific Employees</InputLabel>
                    <Select
                      multiple
                      value={selectedEmployeeIds}
                      label="Select Specific Employees"
                      onChange={(e) => setSelectedEmployeeIds(e.target.value)}
                      renderValue={(selected) => `${selected.length} employees selected`}
                    >
                      {employees.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {recipientType === 'department' && (
                <Grid item xs={12} sm={6}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Select Department</InputLabel>
                    <Select
                      value={selectedDeptId}
                      label="Select Department"
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                    >
                      {depts.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {recipientType === 'employment_type' && (
                <Grid item xs={12} sm={6}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Employment Classification</InputLabel>
                    <Select
                      value={selectedEmploymentType}
                      label="Employment Classification"
                      onChange={(e) => setSelectedEmploymentType(e.target.value)}
                    >
                      <MenuItem value="full_time">Full-Time Employees</MenuItem>
                      <MenuItem value="intern">Interns</MenuItem>
                      <MenuItem value="contract">Contractors</MenuItem>
                      <MenuItem value="part_time">Part-Time</MenuItem>
                      <MenuItem value="temporary">Temporary</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Template Selection */}
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569', mb: 1.5, textTransform: 'uppercase' }}>
              2. Load Template (Optional)
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Choose from Email Template Library</InputLabel>
              <Select
                value={selectedTemplateId}
                label="Choose from Email Template Library"
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <MenuItem value="">-- Start Blank / Custom Email --</MenuItem>
                {templates.map((tpl) => (
                  <MenuItem key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.category.toUpperCase()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Subject & Body */}
          <TextField
            label="Email Subject Line *"
            fullWidth
            size="small"
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
            placeholder="e.g. Formal Offer of Employment — {{jobTitle}}"
          />

          <TextField
            label="Email Body (HTML / Plain text) *"
            fullWidth
            multiline
            rows={12}
            value={composeHtml}
            onChange={(e) => setComposeHtml(e.target.value)}
            placeholder="Write your email body here with dynamic {{placeholders}}..."
          />

          {/* Action Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={handleOpenPreview}
              disabled={isPreviewLoading || !composeSubject || !composeHtml}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {isPreviewLoading ? 'Rendering Preview...' : 'Preview with Sample Data'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setConfirmSendOpen(true)}
              disabled={isSending || !composeSubject || !composeHtml}
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              Review & Send
            </Button>
          </Box>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: EMPLOYEE DOCUMENTS REPOSITORY */}
      {/* ========================================================= */}
      {activeTab === 3 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['', 'employment', 'certificate', 'policy', 'submitted'].map((cat) => (
                <Chip
                  key={cat}
                  label={cat ? cat.toUpperCase() : 'ALL CATEGORIES'}
                  clickable
                  onClick={() => setDocCategoryFilter(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: docCategoryFilter === cat ? '#0F172A' : '#F1F5F9',
                    color: docCategoryFilter === cat ? '#FFFFFF' : '#475569',
                  }}
                />
              ))}
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDocModalOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Upload Document
              </Button>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={() => setGenerateDocModalOpen(true)}
                sx={{ bgcolor: '#0284C7', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0369A1' } }}
              >
                Generate HR PDF
              </Button>
            </Stack>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>REF NO</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>EMPLOYEE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>ISSUE DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B', textAlign: 'right' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeDocs.length > 0 ? (
                  employeeDocs.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0284C7' }}>
                        {doc.reference_number}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                        {doc.employee?.first_name} {doc.employee?.last_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                        {doc.title}
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
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => downloadDocumentFile(doc.id, `${doc.reference_number}.pdf`)}
                            sx={{ textTransform: 'none', fontSize: '11px', py: 0.2 }}
                          >
                            Download
                          </Button>
                          {doc.status !== 'revoked' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setRevokingDocId(doc.id);
                                setRevokeModalOpen(true);
                              }}
                            >
                              <RevokeIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                      No documents found in repository.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 4: DOCUMENT REQUESTS TRIAGE */}
      {/* ========================================================= */}
      {activeTab === 4 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['', 'submitted', 'under_review', 'approved', 'ready_for_download', 'completed', 'rejected'].map((st) => (
                <Chip
                  key={st}
                  label={st ? st.replace(/_/g, ' ').toUpperCase() : 'ALL REQUESTS'}
                  clickable
                  onClick={() => setReqStatusFilter(st)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: reqStatusFilter === st ? '#0F172A' : '#F1F5F9',
                    color: reqStatusFilter === st ? '#FFFFFF' : '#475569',
                  }}
                />
              ))}
            </Box>

            <TextField
              size="small"
              placeholder="Search requests..."
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              sx={{ width: 240 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>REF NO</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>EMPLOYEE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>DOCUMENT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>PURPOSE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>SUBMITTED</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B', textAlign: 'right' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminRequests.length > 0 ? (
                  adminRequests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0284C7' }}>
                        {req.reference_number}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                        {req.employee?.first_name} {req.employee?.last_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', color: '#334155' }}>
                        {req.title || req.document_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#64748B', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.purpose}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                        {new Date(req.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={req.status.replace(/_/g, ' ').toUpperCase()}
                          sx={{
                            fontWeight: 700,
                            fontSize: '10px',
                            bgcolor: req.status === 'completed' || req.status === 'ready_for_download' ? '#ECFDF5' : '#FFFBEB',
                            color: req.status === 'completed' || req.status === 'ready_for_download' ? '#059669' : '#D97706',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedRequest(req);
                            setRequestDetailOpen(true);
                          }}
                          sx={{ textTransform: 'none', bgcolor: '#0F172A', fontSize: '11px', py: 0.3 }}
                        >
                          Review & Triage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                      No document requests found in queue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 5: EMAIL HISTORY */}
      {/* ========================================================= */}
      {activeTab === 5 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['', 'sent', 'delivered', 'failed'].map((st) => (
                <Chip
                  key={st}
                  label={st ? st.toUpperCase() : 'ALL STATUSES'}
                  clickable
                  onClick={() => setHistoryStatusFilter(st)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11px',
                    bgcolor: historyStatusFilter === st ? '#0F172A' : '#F1F5F9',
                    color: historyStatusFilter === st ? '#FFFFFF' : '#475569',
                  }}
                />
              ))}
            </Box>

            <TextField
              size="small"
              placeholder="Search by recipient or subject..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              sx={{ width: 280 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>RECIPIENT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>SUBJECT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>SENDER</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>DISPATCHED</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', color: '#64748B', textAlign: 'right' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailHistoryLogs.length > 0 ? (
                  emailHistoryLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {log.recipient_name ? `${log.recipient_name} (${log.recipient_email})` : log.recipient_email}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                        {log.subject}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                        {log.sender?.first_name} {log.sender?.last_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={log.status.toUpperCase()}
                          sx={{
                            fontWeight: 700,
                            fontSize: '10px',
                            bgcolor: log.status === 'sent' || log.status === 'delivered' ? '#ECFDF5' : '#FEF2F2',
                            color: log.status === 'sent' || log.status === 'delivered' ? '#059669' : '#DC2626',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {log.status === 'failed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<RetryIcon />}
                            onClick={() => retryEmailMutate(log.id)}
                            sx={{ textTransform: 'none', fontSize: '11px', py: 0.2 }}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                      No email history records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SETTINGS & PLACEHOLDERS GUIDE */}
      {/* ========================================================= */}
      {activeTab === 6 && (
        <Card sx={{ p: 3, borderRadius: '14px', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            Email Provider & Template Settings
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
              ✓ Email Delivery Service Status: Active
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#15803D', mt: 0.5 }}>
              Provider: {settingsData?.data?.provider || 'Nodemailer Gmail SMTP (SmartOps-Pay)'} &middot; Sender: {settingsData?.data?.senderEmail}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', mb: 1 }}>
              Supported Dynamic Placeholders Reference
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 2 }}>
              Insert any of the following tags in email subjects, HTML bodies, or document templates. Values are resolved dynamically from real employee records:
            </Typography>
            <Grid container spacing={1.5}>
              {(settingsData?.data?.supportedPlaceholders || []).map((ph) => (
                <Grid item xs={12} sm={6} md={4} key={ph}>
                  <Box sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0284C7' }}>
                      {ph}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {/* ========================================================= */}
      {/* MODALS & DRAWERS */}
      {/* ========================================================= */}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        open={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        template={editingTemplate}
        isLoading={isCreatingTpl || isUpdatingTpl}
        onSave={(tplData) => {
          if (editingTemplate) {
            updateTemplateMutate({ id: editingTemplate.id, data: tplData });
          } else {
            createTemplateMutate(tplData);
          }
        }}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        subject={previewData.subject}
        html={previewData.html}
        missingFields={previewData.missingFields}
      />

      {/* Generate Document Modal */}
      <GenerateDocumentModal
        open={generateDocModalOpen}
        onClose={() => setGenerateDocModalOpen(false)}
        employees={employees}
        isLoading={isGeneratingDoc}
        onGenerate={(genData) => generateDocMutate(genData)}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        open={uploadDocModalOpen}
        onClose={() => setUploadDocModalOpen(false)}
        employees={employees}
        isLoading={isUploadingDoc}
        onUpload={(formData) => uploadDocMutate(formData)}
      />

      {/* Revoke Document Dialog */}
      <Dialog open={revokeModalOpen} onClose={() => setRevokeModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>Revoke Issued Document</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: '13px', color: '#475569' }}>
            Are you sure you want to revoke this official document? Please record an audit reason:
          </Typography>
          <TextField
            size="small"
            label="Revocation Audit Reason *"
            fullWidth
            multiline
            rows={2}
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRevokeModalOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => revokeDocMutate({ id: revokingDocId, reason: revocationReason })}
            disabled={!revocationReason.trim()}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Revoke Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Send Email Dialog */}
      <Dialog open={confirmSendOpen} onClose={() => setConfirmSendOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>Confirm Communication Dispatch</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: '14px', color: '#334155' }}>
            You are about to dispatch this message to <strong>{recipientType.toUpperCase()}</strong> audience.
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>Subject Snapshot:</Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', mt: 0.5 }}>
              {composeSubject}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
            Recipient privacy is strictly preserved. Bulk emails are delivered individually.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmSendOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteSend}
            disabled={isSending}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {isSending ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Request Triage Detail Dialog */}
      {selectedRequest && (
        <Dialog open={requestDetailOpen} onClose={() => setRequestDetailOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
            Triage Document Request: {selectedRequest.reference_number}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>EMPLOYEE</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  {selectedRequest.employee?.first_name} {selectedRequest.employee?.last_name} ({selectedRequest.employee?.email})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>REQUESTED DOCUMENT</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0284C7' }}>
                  {selectedRequest.title || selectedRequest.document_type.replace(/_/g, ' ')}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>PURPOSE OF REQUEST:</Typography>
              <Typography sx={{ fontSize: '13px', color: '#334155', mt: 0.5 }}>{selectedRequest.purpose}</Typography>
              {selectedRequest.additional_notes && (
                <>
                  <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 600, mt: 1 }}>ADDITIONAL NOTES:</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', mt: 0.5 }}>{selectedRequest.additional_notes}</Typography>
                </>
              )}
            </Box>

            <Divider />

            {/* Actions: Assign, Change Status, Issue Document */}
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              HR Actions & Status Transition
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Assign HR Handler</InputLabel>
                <Select
                  value={assignHandlerId || selectedRequest.assigned_to || ''}
                  label="Assign HR Handler"
                  onChange={(e) => {
                    setAssignHandlerId(e.target.value);
                    assignRequestMutate({ requestId: selectedRequest.id, assigned_to: e.target.value });
                  }}
                >
                  {employees.filter((x) => x.role_id === 1).map((admin) => (
                    <MenuItem key={admin.id} value={admin.id}>
                      {admin.first_name} {admin.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Update Status</InputLabel>
                <Select
                  value={statusUpdateVal}
                  label="Update Status"
                  onChange={(e) => setStatusUpdateVal(e.target.value)}
                >
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="more_info_required">More Information Required</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              size="small"
              label="Feedback / Employee Visible Response"
              fullWidth
              multiline
              rows={2}
              value={employeeResponseText}
              onChange={(e) => setEmployeeResponseText(e.target.value)}
              placeholder="e.g. Approved. Document is being signed and issued."
            />

            {statusUpdateVal === 'rejected' && (
              <TextField
                size="small"
                label="Rejection Reason *"
                fullWidth
                multiline
                rows={2}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                required
                placeholder="State why this document cannot be issued at this time."
              />
            )}

            {/* Direct Issue Button */}
            <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>
                  Generate & Issue Document to Employee Portal
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#1D4ED8' }}>
                  Automatically renders letterhead PDF, uploads to repository, and marks request ready.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                disabled={isIssuingDoc}
                onClick={() => {
                  issueFromRequestMutate({
                    requestId: selectedRequest.id,
                    notes: employeeResponseText,
                  });
                }}
                sx={{ bgcolor: '#0284C7', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0369A1' } }}
              >
                {isIssuingDoc ? 'Issuing...' : 'Issue Document'}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRequestDetailOpen(false)} sx={{ textTransform: 'none' }}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                updateReqStatusMutate({
                  requestId: selectedRequest.id,
                  payload: {
                    status: statusUpdateVal,
                    employee_response: employeeResponseText,
                    rejection_reason: rejectionReasonText,
                  },
                });
              }}
              sx={{ bgcolor: '#0F172A', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#1E293B' } }}
            >
              Save Status Update
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
