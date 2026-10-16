import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import {
  FileDownloadOutlined as ExportIcon,
  AssessmentOutlined as ReportIcon,
  HistoryRounded as AuditIcon
} from '@mui/icons-material';
import { useLeaveReport, useAuditLogs } from '../../Api/Api';
import CustomTableLoader from '../../common/custom/CustomTableLoader';
import CustomPagination from '../../common/custom/CustomPagination';
import { toast } from 'react-toastify';

export default function ReportsAndAudit() {
  const [activeTab, setActiveTab] = useState('summary');
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(10);

  const { data: reportData, isLoading: reportLoading } = useLeaveReport();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    page: auditPage,
    limit: auditLimit
  });

  const report = reportData?.data || [];
  const logs = auditData?.data || [];
  const totalAudit = auditData?.total || 0;

  const handleExportCSV = () => {
    if (!report.length) {
      toast.info('No report data available to export');
      return;
    }

    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Department',
      'Designation',
      'CL Entitled',
      'CL Used',
      'CL Balance',
      'SL Entitled',
      'SL Used',
      'SL Balance',
      'Total Balance'
    ];

    const rows = report.map((emp) => [
      `"${emp.employee_id || ''}"`,
      `"${emp.name}"`,
      `"${emp.email}"`,
      `"${emp.department || ''}"`,
      `"${emp.designation || ''}"`,
      emp.casual_leave?.entitled || 0,
      emp.casual_leave?.used || 0,
      emp.casual_leave?.remaining || 0,
      emp.sick_leave?.entitled || 0,
      emp.sick_leave?.used || 0,
      emp.sick_leave?.remaining || 0,
      (emp.casual_leave?.remaining || 0) + (emp.sick_leave?.remaining || 0)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `staffEase_Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report exported successfully');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          width: '100%'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Reports & Audit Logs
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Enterprise leave balances reporting, ledger histories, and security audit trails.
          </Typography>
        </Box>

        {activeTab === 'summary' && (
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            sx={{
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' },
              borderRadius: '10px',
              px: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Export Report (CSV)
          </Button>
        )}
      </Box>

      {/* Tabs Card */}
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="primary"
          indicatorColor="primary"
          sx={{
            borderBottom: '1px solid #F1F5F9',
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 2
            }
          }}
        >
          <Tab value="summary" icon={<ReportIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Leave Balance Summary" />
          <Tab value="audit" icon={<AuditIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="System Audit Logs" />
        </Tabs>

        {activeTab === 'summary' ? (
          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DEPARTMENT</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#0284C7', fontSize: '0.75rem' }}>CL ENTITLED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#0284C7', fontSize: '0.75rem' }}>CL USED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#0284C7', fontSize: '0.75rem' }}>CL BALANCE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#047857', fontSize: '0.75rem' }}>SL ENTITLED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#047857', fontSize: '0.75rem' }}>SL USED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#047857', fontSize: '0.75rem' }}>SL BALANCE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.75rem' }}>TOTAL BALANCE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportLoading ? (
                  <CustomTableLoader rows={6} colSpan={9} />
                ) : report.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                      No leave balance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.map((emp) => {
                    const totalRemaining = (emp.casual_leave?.remaining || 0) + (emp.sick_leave?.remaining || 0);
                    return (
                      <TableRow key={emp.user_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {emp.email} • ID: {emp.employee_id || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#334155' }}>
                            {emp.department || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#475569' }}>
                            {emp.casual_leave?.entitled || 0}d
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600 }}>
                            {emp.casual_leave?.used || 0}d
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${emp.casual_leave?.remaining || 0}d`}
                            sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700 }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#475569' }}>
                            {emp.sick_leave?.entitled || 0}d
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600 }}>
                            {emp.sick_leave?.used || 0}d
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${emp.sick_leave?.remaining || 0}d`}
                            sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700 }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9375rem' }}>
                            {totalRemaining} days
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>PERFORMED BY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ENTITY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DETAILS</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>IP ADDRESS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>TIMESTAMP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLoading ? (
                    <CustomTableLoader rows={6} colSpan={6} />
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                        No audit events recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Chip
                            size="small"
                            label={log.action}
                            sx={{
                              bgcolor: log.action.includes('APPROVED')
                                ? '#ECFDF5'
                                : log.action.includes('REJECTED')
                                ? '#FEE2E2'
                                : '#F1F5F9',
                              color: log.action.includes('APPROVED')
                                ? '#047857'
                                : log.action.includes('REJECTED')
                                ? '#B91C1C'
                                : '#334155',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {log.user?.work_email || 'automated'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#334155' }}>
                            {log.entity_type} #{log.entity_id || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace' }}>
                            {log.details ? JSON.stringify(log.details) : '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {log.ip_address || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <CustomPagination
              count={totalAudit}
              page={auditPage}
              rowsPerPage={auditLimit}
              onPageChange={(e, p) => setAuditPage(p)}
              onRowsPerPageChange={(e) => {
                setAuditLimit(parseInt(e.target.value, 10));
                setAuditPage(1);
              }}
            />
          </>
        )}
      </Card>
    </Box>
  );
}
