/**
 * ===========================================
 *  Admin Employee Document Management
 * ===========================================
 *
 * Page 2:
 *  - Tab 1: Requested Documents by Employees (Triage, review, approve/reject, generate & send)
 *  - Tab 2: Document Repository & Sending Process (Generate & issue documents, upload PDFs, download, revoke)
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
} from '@mui/material';
import {
  AssignmentOutlined as RequestIcon,
  FolderSharedOutlined as FolderIcon,
  AddRounded as AddIcon,
  PictureAsPdfRounded as PdfIcon,
  DownloadRounded as DownloadIcon,
  CheckCircleOutlineRounded as ApproveIcon,
  CancelOutlined as RejectIcon,
  UploadFileRounded as UploadIcon,
  BlockRounded as RevokeIcon,
  RefreshRounded as RetryIcon,
  CheckCircleRounded as CompleteIcon,
  HourglassEmptyRounded as PendingIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  useAdminDocumentRequests,
  useUpdateDocumentRequestStatus,
  useIssueDocumentFromRequest,
  useEmployeeDocuments,
  downloadDocumentFile,
  useGenerateDocument,
  useUploadDocument,
  useRevokeDocument,
  useEmployees,
} from '../../Api/Api';

import GenerateDocumentModal from '../../components/documents/GenerateDocumentModal';
import UploadDocumentModal from '../../components/documents/UploadDocumentModal';

export default function EmployeeDocumentsAdmin() {
  const [activeTab, setActiveTab] = useState(0);

  // -------------------------------------------------------------
  // Tab 1: Requested Documents State
  // -------------------------------------------------------------
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
  } = useAdminDocumentRequests({
    status: requestStatusFilter,
  });
  const requests = requestsData?.data || [];

  // Reject Dialog State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // -------------------------------------------------------------
  // Tab 2: Document Repository State
  // -------------------------------------------------------------
  const [docCategoryFilter, setDocCategoryFilter] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const {
    data: docsData,
    isLoading: isDocsLoading,
    refetch: refetchDocs,
  } = useEmployeeDocuments({
    category: docCategoryFilter,
  });
  const documents = docsData?.data || [];

  // Revoke Dialog State
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedDocToRevoke, setSelectedDocToRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Modals for Generating / Uploading
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [prefilledEmployeeId, setPrefilledEmployeeId] = useState(null);

  // Mutations
  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } = useUpdateDocumentRequestStatus(
    (res) => {
      toast.success(res?.message || 'Request status updated successfully');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedRequest(null);
      refetchRequests();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update request');
    }
  );

  const { mutate: issueFromReqMutate, isPending: isIssuingFromReq } = useIssueDocumentFromRequest(
    (res) => {
      toast.success(res?.message || 'Document generated and issued to employee successfully!');
      refetchRequests();
      refetchDocs();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Failed to issue document');
    }
  );

  const { mutate: generateDocMutate, isPending: isGeneratingDoc } = useGenerateDocument(
    (res) => {
      toast.success(res?.message || 'Document generated and issued successfully!');
      setGenerateModalOpen(false);
      refetchDocs();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Generation failed');
    }
  );

  const { mutate: uploadDocMutate, isPending: isUploadingDoc } = useUploadDocument(
    (res) => {
      toast.success(res?.message || 'Document uploaded and linked to employee profile successfully!');
      setUploadModalOpen(false);
      refetchDocs();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Upload failed');
    }
  );

  const { mutate: revokeDocMutate, isPending: isRevokingDoc } = useRevokeDocument(
    (res) => {
      toast.success(res?.message || 'Document revoked successfully');
      setRevokeDialogOpen(false);
      setRevokeReason('');
      setSelectedDocToRevoke(null);
      refetchDocs();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Revocation failed');
    }
  );

  // Filtered lists
  const filteredRequests = requests.filter((r) => {
    if (!requestSearch) return true;
    const term = requestSearch.toLowerCase();
    const empName = `${r.employee?.first_name || ''} ${r.employee?.last_name || ''}`.toLowerCase();
    const ref = (r.reference_number || '').toLowerCase();
    const docType = (r.document_type || '').toLowerCase();
    return empName.includes(term) || ref.includes(term) || docType.includes(term);
  });

  const filteredDocs = documents.filter((d) => {
    if (!docSearch) return true;
    const term = docSearch.toLowerCase();
    const title = (d.title || '').toLowerCase();
    const ref = (d.reference_number || '').toLowerCase();
    const empName = `${d.employee?.first_name || ''} ${d.employee?.last_name || ''}`.toLowerCase();
    return title.includes(term) || ref.includes(term) || empName.includes(term);
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Employee Document Management
        </Typography>
        <Typography sx={{ fontSize: '13.5px', color: '#64748B', mt: 0.5 }}>
          Process incoming document requests from staff and generate or upload official corporate certificates and letters.
        </Typography>
      </Box>

      {/* Main Tab Navigation */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', bgcolor: '#F8FAFC', px: 2.5 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '13.5px',
                fontWeight: 600,
                textTransform: 'none',
                color: '#64748B',
                '&.Mui-selected': { color: '#0284C7', fontWeight: 700 },
              },
              '& .MuiTabs-indicator': { bgcolor: '#0284C7', height: 3 },
            }}
          >
            <Tab
              icon={<RequestIcon sx={{ fontSize: '18px !important', mr: 0.8 }} />}
              iconPosition="start"
              label={`Requested Documents (${requests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length} Pending)`}
            />
            <Tab
              icon={<FolderIcon sx={{ fontSize: '18px !important', mr: 0.8 }} />}
              iconPosition="start"
              label="Document Repository & Sending Process"
            />
          </Tabs>
        </Box>

        {/* ============================================================= */}
        {/* TAB 1: REQUESTED DOCUMENTS BY EMPLOYEES                      */}
        {/* ============================================================= */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Action & Filter Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Incoming Employee Document Requests
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: '#64748B' }}>
                  Review requests, approve or reject, and click "Issue Document" to automatically generate and send to the employee.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Search by employee or ref..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  sx={{ width: 240 }}
                />

                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => refetchRequests()}
                  startIcon={<RetryIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Requests Table */}
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Request ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Document Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Purpose / Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Urgency</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isRequestsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        No document requests found matching criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((req) => (
                      <TableRow key={req.id} hover>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>
                          {req.reference_number}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {req.employee?.first_name} {req.employee?.last_name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                            {req.employee?.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>
                          {req.document_type}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: '#475569', maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {req.purpose || 'No purpose stated'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={req.urgency?.toUpperCase() || 'NORMAL'}
                            sx={{
                              height: 20,
                              fontSize: '10px',
                              fontWeight: 700,
                              bgcolor:
                                req.urgency === 'urgent'
                                  ? '#FEE2E2'
                                  : req.urgency === 'high'
                                  ? '#FEF3C7'
                                  : '#F1F5F9',
                              color:
                                req.urgency === 'urgent'
                                  ? '#B91C1C'
                                  : req.urgency === 'high'
                                  ? '#B45309'
                                  : '#475569',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={req.status?.toUpperCase() || 'SUBMITTED'}
                            sx={{
                              height: 22,
                              fontSize: '10.5px',
                              fontWeight: 700,
                              bgcolor:
                                req.status === 'completed'
                                  ? '#DCFCE7'
                                  : req.status === 'approved'
                                  ? '#E0F2FE'
                                  : req.status === 'rejected'
                                  ? '#FEE2E2'
                                  : '#FEF9C3',
                              color:
                                req.status === 'completed'
                                  ? '#15803D'
                                  : req.status === 'approved'
                                  ? '#0369A1'
                                  : req.status === 'rejected'
                                  ? '#B91C1C'
                                  : '#854D0E',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {req.status === 'submitted' && (
                              <Tooltip title="Approve Request">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => updateStatusMutate({ id: req.id, status: 'approved' })}
                                >
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {(req.status === 'submitted' || req.status === 'under_review') && (
                              <Tooltip title="Reject Request">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {req.status !== 'completed' && req.status !== 'rejected' && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => issueFromReqMutate({ id: req.id })}
                                disabled={isIssuingFromReq}
                                sx={{
                                  fontSize: '11px',
                                  textTransform: 'none',
                                  py: 0.3,
                                  px: 1.2,
                                  bgcolor: '#0284C7',
                                  '&:hover': { bgcolor: '#0369A1' },
                                }}
                              >
                                Issue Document
                              </Button>
                            )}

                            {req.status === 'completed' && (
                              <Chip
                                size="small"
                                icon={<CompleteIcon sx={{ fontSize: '13px !important' }} />}
                                label="Issued & Sent"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '10.5px' }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ============================================================= */}
        {/* TAB 2: DOCUMENT REPOSITORY & SENDING PROCESS                 */}
        {/* ============================================================= */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Top Sending Process Toolbar */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#F0F9FF',
                borderRadius: '10px',
                border: '1px solid #BAE6FD',
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0369A1' }}>
                  Document Sending & Issuance Actions
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: '#0284C7' }}>
                  Generate and issue verifiable corporate certificates or upload pre-existing documents directly to an employee profile.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => setUploadModalOpen(true)}
                  startIcon={<UploadIcon />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderColor: '#7DD3FC',
                    color: '#0284C7',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0284C7' },
                  }}
                >
                  Upload Document
                </Button>

                <Button
                  variant="contained"
                  onClick={() => setGenerateModalOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: '#0284C7',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                    '&:hover': { bgcolor: '#0369A1' },
                  }}
                >
                  Generate & Send Document
                </Button>
              </Box>
            </Box>

            {/* Filter and Search Bar for Documents */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Issued Documents Archive
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Search by title or employee..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  sx={{ width: 240 }}
                />

                <FormControl size="small" sx={{ width: 160 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="employment">Employment Letters</MenuItem>
                    <MenuItem value="certificate">Certificates & NOC</MenuItem>
                    <MenuItem value="policy">Corporate Policies</MenuItem>
                    <MenuItem value="submitted">Employee Uploads</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Document Table */}
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Document Ref</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Document Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isDocsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredDocs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        No employee documents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocs.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>
                          {doc.reference_number}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PdfIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                            <Box>
                              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                                {doc.title}
                              </Typography>
                              <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                                Category: {doc.category}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {doc.employee?.first_name} {doc.employee?.last_name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                            {doc.employee?.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                          {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={doc.status?.toUpperCase() || 'ACTIVE'}
                            sx={{
                              height: 22,
                              fontSize: '10.5px',
                              fontWeight: 700,
                              bgcolor: doc.status === 'revoked' ? '#FEE2E2' : '#DCFCE7',
                              color: doc.status === 'revoked' ? '#B91C1C' : '#15803D',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Download PDF">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => downloadDocumentFile(doc.id, `${doc.title.replace(/\s+/g, '_')}.pdf`)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {doc.status !== 'revoked' && (
                              <Tooltip title="Revoke Document">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedDocToRevoke(doc);
                                    setRevokeDialogOpen(true);
                                  }}
                                >
                                  <RevokeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>

      {/* Reject Request Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '16px' }}>Reject Document Request</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13px', color: '#64748B', mb: 2 }}>
            Provide a clear reason for rejecting the request for{' '}
            <strong>{selectedRequest?.document_type}</strong> from{' '}
            <strong>{selectedRequest?.employee?.first_name}</strong>.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Rejection Reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Please provide an authorized NOC request from your manager first."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim() || isUpdatingStatus}
            onClick={() =>
              updateStatusMutate({
                id: selectedRequest.id,
                status: 'rejected',
                rejection_reason: rejectReason.trim(),
              })
            }
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Document Dialog */}
      <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '16px' }}>Revoke Issued Document</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13px', color: '#64748B', mb: 2 }}>
            Are you sure you want to revoke <strong>{selectedDocToRevoke?.title}</strong> (Ref:{' '}
            {selectedDocToRevoke?.reference_number})?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Revocation Reason *"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="e.g. Issued with incorrect compensation figure, replacement will be issued."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRevokeDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!revokeReason.trim() || isRevokingDoc}
            onClick={() =>
              revokeDocMutate({
                id: selectedDocToRevoke.id,
                reason: revokeReason.trim(),
              })
            }
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Confirm Revocation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Document Modal */}
      <GenerateDocumentModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onSubmit={generateDocMutate}
        isLoading={isGeneratingDoc}
        prefilledEmployeeId={prefilledEmployeeId}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={uploadDocMutate}
        isLoading={isUploadingDoc}
      />
    </Box>
  );
}
