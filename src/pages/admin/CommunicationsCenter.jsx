/**
 * ===========================================
 *  Admin Employee Communications & Offer Dispatch
 * ===========================================
 *
 * Page 1: Dedicated to sending official Employee & Internship Offer Letters
 * with dynamic field generation, real-time preview, and automated dual-PDF
 * attachment (Offer Letter + Company Policies).
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  SendRounded as SendIcon,
  VisibilityOutlined as ViewIcon,
  HistoryOutlined as HistoryIcon,
  BusinessCenterRounded as EmployeeIcon,
  SchoolRounded as InternIcon,
  AttachFileRounded as AttachIcon,
  PictureAsPdfRounded as PdfIcon,
  CheckCircleRounded as CheckIcon,
  RefreshRounded as RetryIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  useCommunicationOverview,
  useSendOfferLetter,
  useEmailHistory,
  useRetryEmail,
  useEmployees,
  useDepartments,
} from '../../Api/Api';

import OfferLetterPreviewModal from '../../components/communications/OfferLetterPreviewModal';

const DEFAULT_FORM_DATA = {
  candidate_source: 'manual', // 'manual' | 'existing'
  candidate_id: null,
  employment_type: 'employee', // 'employee' | 'internship'
  candidate_name: '',
  candidate_email: '',
  job_title: 'Software Engineer',
  department: 'Engineering',
  joining_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  work_location: 'Hybrid',
  
  // Specific to employee
  salary: '₹8,50,000 per annum',
  probation_period: '3 Months',
  reporting_manager: 'Elena Rostova (Director of Engineering)',
  
  // Specific to internship
  duration: '3 Months',
  is_paid: true,
  stipend_amount: '₹20,000',
  stipend_frequency: 'Per Month',
  mentor_name: 'Lead Software Architect',
  
  additional_instructions: 'Please review and return the signed duplicate copy along with your ID proof and educational credentials within 5 business days.',
};

export default function CommunicationsCenter() {
  const [activeTab, setActiveTab] = useState(0);

  // Queries
  const { data: overviewData, refetch: refetchOverview } = useCommunicationOverview();
  const { data: empData } = useEmployees({ limit: 150 });
  const employees = empData?.data || [];
  const { data: depts = [] } = useDepartments();

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // History State
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('');
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useEmailHistory({
    page: historyPage,
    limit: 10,
    search: historySearch,
    status: historyStatus,
  });

  const emailLogs = historyData?.data || [];
  const historyPagination = historyData?.pagination || {};

  // Mutations
  const { mutate: sendOfferMutate, isPending: isSendingOffer } = useSendOfferLetter(
    (res) => {
      toast.success(res?.message || 'Offer letter and company policies email dispatched successfully!');
      setPreviewModalOpen(false);
      refetchOverview();
      refetchHistory();
      // Switch to history tab to see the live dispatch record
      setActiveTab(1);
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Failed to send offer email');
    }
  );

  const { mutate: retryMutate, isPending: isRetrying } = useRetryEmail(
    (res) => {
      toast.success(res?.message || 'Email retry scheduled successfully');
      refetchHistory();
      refetchOverview();
    },
    (err) => {
      toast.error(err?.response?.data?.message || err.message || 'Retry failed');
    }
  );

  // Handle employee dropdown autofill
  const handleSelectExistingEmployee = (empId) => {
    const selected = employees.find((e) => e.id === Number(empId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        candidate_source: 'existing',
        candidate_id: selected.id,
        candidate_name: `${selected.first_name || ''} ${selected.last_name || ''}`.trim(),
        candidate_email: selected.email || '',
        job_title: selected.job_title || prev.job_title || 'Software Engineer',
        department: selected.department?.name || prev.department || 'Engineering',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.candidate_name.trim()) errors.candidate_name = 'Candidate name is required';
    if (!formData.candidate_email.trim()) {
      errors.candidate_email = 'Candidate email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.candidate_email)) {
      errors.candidate_email = 'Invalid email address format';
    }
    if (!formData.job_title.trim()) errors.job_title = 'Role / Job title is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.joining_date) errors.joining_date = 'Joining date is required';

    if (formData.employment_type === 'internship') {
      if (!formData.duration.trim()) errors.duration = 'Internship duration is required';
      if (formData.is_paid && !formData.stipend_amount.trim()) {
        errors.stipend_amount = 'Stipend amount is required for paid internships';
      }
    } else {
      if (!formData.salary.trim()) errors.salary = 'Annual CTC / Salary is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenPreview = () => {
    if (validateForm()) {
      setPreviewModalOpen(true);
    } else {
      toast.warning('Please complete all required fields before previewing.');
    }
  };

  const handleSendOfferEmail = () => {
    if (!validateForm()) {
      toast.warning('Please complete all required fields.');
      return;
    }

    sendOfferMutate({
      candidate_id: formData.candidate_id,
      candidate_name: formData.candidate_name.trim(),
      candidate_email: formData.candidate_email.trim(),
      employment_type: formData.employment_type,
      job_title: formData.job_title.trim(),
      department: formData.department.trim(),
      joining_date: formData.joining_date,
      work_location: formData.work_location,
      salary: formData.salary,
      probation_period: formData.probation_period,
      reporting_manager: formData.reporting_manager,
      duration: formData.duration,
      is_paid: formData.is_paid,
      stipend_amount: formData.stipend_amount,
      stipend_frequency: formData.stipend_frequency,
      mentor_name: formData.mentor_name,
      additional_instructions: formData.additional_instructions,
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Employee Communication Center
        </Typography>
        <Typography sx={{ fontSize: '13.5px', color: '#64748B', mt: 0.5 }}>
          Dispatch formal employee offer letters and internship appointments with automated dual-PDF attachments (Offer Letter + Company Policies).
        </Typography>
      </Box>

      {/* Overview Stat Badges */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
              Total Emails Dispatched
            </Typography>
            <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
              {overviewData?.totalEmailsSent ?? 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
              Delivered Successfully
            </Typography>
            <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#10B981', mt: 0.5 }}>
              {overviewData?.emailsDelivered ?? 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
              Delivery Notices / Failed
            </Typography>
            <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', mt: 0.5 }}>
              {overviewData?.emailsFailed ?? 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #BAE6FD',
              bgcolor: '#F0F9FF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>
              Active Auto-Attachments
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#0369A1', mt: 1, fontWeight: 600 }}>
              ✓ Offer Letter PDF + Policies PDF
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
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
              icon={<SendIcon sx={{ fontSize: '18px !important', mr: 0.8 }} />}
              iconPosition="start"
              label="Send Offer & Onboarding Email"
            />
            <Tab
              icon={<HistoryIcon sx={{ fontSize: '18px !important', mr: 0.8 }} />}
              iconPosition="start"
              label="Email History & Dispatch Logs"
            />
          </Tabs>
        </Box>

        {/* Tab 0: Send Offer Letter Form */}
        {activeTab === 0 && (
          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Compose Formal Offer & Auto-Attach Enclosures
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.3 }}>
                Select the engagement type below. The form adapts automatically with role-specific parameters and prepares 2 formal PDFs to send.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Left Column: Form Fields */}
              <Grid item xs={12} lg={8}>
                {/* 1. Core Engagement Type Selector */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '10px',
                    border: '2px solid #BAE6FD',
                    bgcolor: '#F0F9FF',
                    mb: 3,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0369A1', mb: 0.5 }}>
                        1. Select Employment Type:
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={formData.employment_type}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              employment_type: e.target.value,
                              job_title: e.target.value === 'internship' ? 'Software Engineering Intern' : 'Software Engineer',
                            }));
                          }}
                          sx={{
                            bgcolor: '#FFFFFF',
                            fontWeight: 700,
                            color: '#0F172A',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#7DD3FC' },
                          }}
                        >
                          <MenuItem value="employee" sx={{ fontWeight: 600 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmployeeIcon sx={{ fontSize: 18, color: '#0284C7' }} />
                              Employee (Full-Time Regular)
                            </Box>
                          </MenuItem>
                          <MenuItem value="internship" sx={{ fontWeight: 600 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <InternIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
                              Internship
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                        Recipient Source:
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={formData.candidate_source}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              candidate_source: val,
                              candidate_id: val === 'manual' ? null : prev.candidate_id,
                            }));
                          }}
                          sx={{ bgcolor: '#FFFFFF' }}
                        >
                          <MenuItem value="manual">Enter New Candidate Manually</MenuItem>
                          <MenuItem value="existing">Select from Staff / Candidate Directory</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Existing Employee Select Dropdown (if selected) */}
                  {formData.candidate_source === 'existing' && (
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Candidate / Employee</InputLabel>
                        <Select
                          label="Select Candidate / Employee"
                          value={formData.candidate_id || ''}
                          onChange={(e) => handleSelectExistingEmployee(e.target.value)}
                          sx={{ bgcolor: '#FFFFFF' }}
                        >
                          {employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name} ({emp.email}) — {emp.job_title || 'No Title'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Card>

                {/* 2. Candidate & Position Details */}
                <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
                  Candidate Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Candidate Full Name *"
                      value={formData.candidate_name}
                      onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                      error={Boolean(formErrors.candidate_name)}
                      helperText={formErrors.candidate_name}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Candidate Email Address *"
                      value={formData.candidate_email}
                      onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                      error={Boolean(formErrors.candidate_email)}
                      helperText={formErrors.candidate_email}
                      placeholder="e.g. rahul@example.com"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={formData.employment_type === 'internship' ? 'Internship Role / Position *' : 'Designation / Job Title *'}
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      error={Boolean(formErrors.job_title)}
                      helperText={formErrors.job_title}
                      placeholder="e.g. Software Engineer"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Department *</InputLabel>
                      <Select
                        label="Department *"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        {depts.length > 0 ? (
                          depts.map((d) => (
                            <MenuItem key={d.id} value={d.name}>
                              {d.name}
                            </MenuItem>
                          ))
                        ) : (
                          ['Engineering', 'Product', 'Marketing', 'Operations', 'Human Resources', 'Design', 'Finance'].map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Proposed Joining Date *"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(formErrors.joining_date)}
                      helperText={formErrors.joining_date}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Work Location / Mode</InputLabel>
                      <Select
                        label="Work Location / Mode"
                        value={formData.work_location}
                        onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                      >
                        <MenuItem value="Hybrid">Hybrid (Flexible Office & Remote)</MenuItem>
                        <MenuItem value="On-site">On-site (Headquarters)</MenuItem>
                        <MenuItem value="Remote">Fully Remote</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* 3. Conditional Fields: Internship vs Employee */}
                {formData.employment_type === 'internship' ? (
                  // INTERNSHIP FIELDS
                  <Card
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '10px',
                      border: '1px solid #DDD6FE',
                      bgcolor: '#FAF5FF',
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: '#6B21A8', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InternIcon fontSize="small" /> Internship Specific Terms
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Internship Duration *</InputLabel>
                          <Select
                            label="Internship Duration *"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          >
                            <MenuItem value="1 Month">1 Month</MenuItem>
                            <MenuItem value="2 Months">2 Months</MenuItem>
                            <MenuItem value="3 Months">3 Months (Standard)</MenuItem>
                            <MenuItem value="6 Months">6 Months (Extended)</MenuItem>
                            <MenuItem value="12 Months">12 Months (Full Academic Year)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Reporting Mentor / Supervisor"
                          value={formData.mentor_name}
                          onChange={(e) => setFormData({ ...formData, mentor_name: e.target.value })}
                          placeholder="e.g. Lead Software Architect"
                        />
                      </Grid>

                      {/* Paid or Unpaid Toggle */}
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend" sx={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>
                            Compensation / Stipend Status:
                          </FormLabel>
                          <RadioGroup
                            row
                            value={formData.is_paid ? 'paid' : 'unpaid'}
                            onChange={(e) => setFormData({ ...formData, is_paid: e.target.value === 'paid' })}
                          >
                            <FormControlLabel
                              value="paid"
                              control={<Radio size="small" sx={{ color: '#7C3AED', '&.Mui-checked': { color: '#7C3AED' } }} />}
                              label={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Paid Internship</Typography>}
                            />
                            <FormControlLabel
                              value="unpaid"
                              control={<Radio size="small" sx={{ color: '#7C3AED', '&.Mui-checked': { color: '#7C3AED' } }} />}
                              label={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Unpaid (Academic Experience & Training)</Typography>}
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {/* If Paid: Stipend Amount & Frequency */}
                      {formData.is_paid && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Stipend Amount *"
                              value={formData.stipend_amount}
                              onChange={(e) => setFormData({ ...formData, stipend_amount: e.target.value })}
                              error={Boolean(formErrors.stipend_amount)}
                              helperText={formErrors.stipend_amount}
                              placeholder="e.g. ₹20,000 or $1,500"
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Disbursement Frequency</InputLabel>
                              <Select
                                label="Disbursement Frequency"
                                value={formData.stipend_frequency}
                                onChange={(e) => setFormData({ ...formData, stipend_frequency: e.target.value })}
                              >
                                <MenuItem value="Per Month">Per Month</MenuItem>
                                <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                                <MenuItem value="Lump Sum (Upon Completion)">Lump Sum (Upon Completion)</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Card>
                ) : (
                  // EMPLOYEE FIELDS
                  <Card
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '10px',
                      border: '1px solid #BAE6FD',
                      bgcolor: '#F0F9FF',
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: '#0369A1', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmployeeIcon fontSize="small" /> Employee Specific Terms
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Annual CTC / Compensation *"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          error={Boolean(formErrors.salary)}
                          helperText={formErrors.salary}
                          placeholder="e.g. ₹8,50,000 per annum"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Probation Period</InputLabel>
                          <Select
                            label="Probation Period"
                            value={formData.probation_period}
                            onChange={(e) => setFormData({ ...formData, probation_period: e.target.value })}
                          >
                            <MenuItem value="None (Direct Permanent)">None (Direct Permanent)</MenuItem>
                            <MenuItem value="1 Month">1 Month</MenuItem>
                            <MenuItem value="3 Months">3 Months (Standard)</MenuItem>
                            <MenuItem value="6 Months">6 Months</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Reporting Manager / Department Head"
                          value={formData.reporting_manager}
                          onChange={(e) => setFormData({ ...formData, reporting_manager: e.target.value })}
                          placeholder="e.g. Elena Rostova (Director of Engineering)"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {/* Additional Instructions */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Special Joining Instructions / Enclosure Notes"
                    value={formData.additional_instructions}
                    onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                    placeholder="Provide any custom instructions or onboarding submission requirements..."
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenPreview}
                    startIcon={<ViewIcon />}
                    sx={{
                      borderColor: '#CBD5E1',
                      color: '#334155',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                    }}
                  >
                    Preview Offer & Email
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSendOfferEmail}
                    disabled={isSendingOffer}
                    startIcon={isSendingOffer ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    sx={{
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3.5,
                      py: 1,
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                      '&:hover': { bgcolor: '#0369A1' },
                    }}
                  >
                    {isSendingOffer ? 'Generating PDFs & Sending...' : 'Send Offer Email with 2 PDFs'}
                  </Button>
                </Box>
              </Grid>

              {/* Right Column: Automated Enclosure Summary Card */}
              <Grid item xs={12} lg={4}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#F8FAFC',
                    position: 'sticky',
                    top: 24,
                  }}
                >
                  <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AttachIcon sx={{ color: '#0284C7', fontSize: 20 }} />
                    Automated Enclosures
                  </Typography>

                  <Typography sx={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5, mb: 2 }}>
                    Upon dispatch, staffEase dynamically generates and attaches 2 verified PDF documents to this email:
                  </Typography>

                  {/* Attachment 1 */}
                  <Box
                    sx={{
                      p: 1.8,
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #BAE6FD',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <PdfIcon sx={{ color: '#EF4444', fontSize: 26 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                          PDF 1: Offer Letter
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                          Ref: SE-OFR-2026-XXXX
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: '#475569', mt: 1, pl: 0.5 }}>
                      Personalized letterhead with candidate terms, role details, compensation/stipend, and digital signatory block.
                    </Typography>
                  </Box>

                  {/* Attachment 2 */}
                  <Box
                    sx={{
                      p: 1.8,
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #DDD6FE',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <PdfIcon sx={{ color: '#7C3AED', fontSize: 26 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                          PDF 2: Company Policies
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                          Ref: SE-POL-2026-V2
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: '#475569', mt: 1, pl: 0.5 }}>
                      Comprehensive workplace guidelines, NDA & IP confidentiality, IT security, and code of conduct.
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckIcon sx={{ color: '#10B981', fontSize: 18, mt: 0.2 }} />
                    <Typography sx={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      Recipient audit logs and delivery status are recorded in the system for tracking and retry management.
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Email History Table */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Dispatch History & Outbox Audit
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: '#64748B' }}>
                  Review all dispatched emails, delivery statuses, and retry any failed messages.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Search by recipient or subject..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  sx={{ width: 250 }}
                />

                <FormControl size="small" sx={{ width: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={historyStatus}
                    onChange={(e) => {
                      setHistoryStatus(e.target.value);
                      setHistoryPage(1);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => refetchHistory()}
                  startIcon={<RetryIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Recipient</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Attachments</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Sent Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '12px', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isHistoryLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : emailLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        No email dispatch records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    emailLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {log.recipient_name || 'N/A'}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                            {log.recipient_email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '12.5px', color: '#334155', maxWidth: 280, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {log.subject}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PdfIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                            <Typography sx={{ fontSize: '11.5px', color: '#0F172A', fontWeight: 600 }}>
                              2 PDFs
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={log.status?.toUpperCase() || 'SENT'}
                            sx={{
                              height: 22,
                              fontSize: '10.5px',
                              fontWeight: 700,
                              bgcolor:
                                log.status === 'sent' || log.status === 'delivered'
                                  ? '#DCFCE7'
                                  : log.status === 'failed'
                                  ? '#FEE2E2'
                                  : '#F1F5F9',
                              color:
                                log.status === 'sent' || log.status === 'delivered'
                                  ? '#15803D'
                                  : log.status === 'failed'
                                  ? '#B91C1C'
                                  : '#475569',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {log.status === 'failed' ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => retryMutate(log.id)}
                              disabled={isRetrying}
                              startIcon={<RetryIcon />}
                              sx={{ textTransform: 'none', fontSize: '11px', py: 0.2 }}
                            >
                              Retry
                            </Button>
                          ) : (
                            <Chip size="small" label="Delivered" variant="outlined" sx={{ fontSize: '10px' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            {historyPagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button
                  size="small"
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  sx={{ textTransform: 'none' }}
                >
                  Previous
                </Button>
                <Typography sx={{ alignSelf: 'center', fontSize: '12px', color: '#64748B' }}>
                  Page {historyPage} of {historyPagination.totalPages}
                </Typography>
                <Button
                  size="small"
                  disabled={historyPage >= historyPagination.totalPages}
                  onClick={() => setHistoryPage((p) => p + 1)}
                  sx={{ textTransform: 'none' }}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Card>

      {/* Live Preview Modal */}
      <OfferLetterPreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        formData={formData}
        onConfirmSend={handleSendOfferEmail}
        isSending={isSendingOffer}
      />
    </Box>
  );
}
