/**
 * ===========================================
 *  Conversation Details & Employee Profile Side Panel
 * ===========================================
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Divider,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  CloseRounded as CloseIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  BadgeOutlined as IdIcon,
  BusinessOutlined as DeptIcon,
  PersonOutlineRounded as ProfileIcon,
  InsertDriveFileOutlined as FileIcon,
  ImageOutlined as ImageIcon,
  DownloadOutlined as DownloadIcon,
  PersonAddOutlined as AddMemberIcon,
  ExitToApp as LeaveIcon,
  GroupsOutlined as GroupIcon,
  SupportAgentOutlined as SupportIcon,
} from '@mui/icons-material';
import { getAvatarFullUrl, formatFileSize, formatChatTimestamp } from './chatUtils';
import { useNavigate } from 'react-router-dom';

export default function ConversationDetailsPanel({
  open,
  onClose,
  conversation,
  messages = [],
  currentUserId,
  userRole,
  onOpenMembersModal,
  onLeaveGroup,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Media & Files

  if (!open || !conversation) return null;

  const isGroup = conversation.type === 'group';
  const isSupport = conversation.type === 'admin_support';
  const otherUser = conversation.other_user || {};
  const members = conversation.members || [];

  // Extract shared attachments across all messages
  const attachments = messages.flatMap((m) =>
    (m.attachments || []).map((att) => ({
      ...att,
      sender_name: m.sender ? `${m.sender.first_name} ${m.sender.last_name}` : 'Unknown',
      created_at: m.createdAt || m.created_at,
    }))
  );

  const images = attachments.filter((att) => att.file_type && att.file_type.startsWith('image/'));
  const docs = attachments.filter((att) => !att.file_type || !att.file_type.startsWith('image/'));

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 340 },
        height: '100%',
        bgcolor: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxShadow: '-4px 0 20px rgba(15, 23, 42, 0.04)',
        animation: 'slideInRight 0.25s ease-out',
        '@keyframes slideInRight': {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>
          {isGroup ? 'Group Information' : isSupport ? 'Support Channel' : 'Staff Profile'}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748B', '&:hover': { bgcolor: '#F1F5F9' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="fullWidth"
        sx={{
          minHeight: 42,
          borderBottom: '1px solid #F1F5F9',
          '& .MuiTab-root': {
            minHeight: 42,
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748B',
            '&.Mui-selected': { color: '#0284C7' },
          },
          '& .MuiTabs-indicator': { bgcolor: '#0284C7', height: 2 },
        }}
      >
        <Tab label="Details" />
        <Tab label={`Files (${attachments.length})`} />
      </Tabs>

      {/* Panel Body */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
        {activeTab === 0 ? (
          <Box>
            {/* Top Identity Card */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
              {isGroup ? (
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: '#E0F2FE',
                    color: '#0284C7',
                    fontWeight: 700,
                    fontSize: '28px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)',
                    mb: 1.5,
                  }}
                >
                  <GroupIcon sx={{ fontSize: 38 }} />
                </Avatar>
              ) : isSupport ? (
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    fontWeight: 700,
                    fontSize: '28px',
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.2)',
                    mb: 1.5,
                  }}
                >
                  <SupportIcon sx={{ fontSize: 38 }} />
                </Avatar>
              ) : (
                <Avatar
                  src={getAvatarFullUrl(otherUser.profile_photo)}
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '26px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                    mb: 1.5,
                  }}
                >
                  {(otherUser.first_name || 'U').charAt(0).toUpperCase()}
                </Avatar>
              )}

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px' }}>
                {isGroup
                  ? conversation.title || 'Staff Group'
                  : isSupport
                  ? conversation.title || 'HR Support Desk'
                  : `${otherUser.first_name || ''} ${otherUser.last_name || ''}`}
              </Typography>

              {!isGroup && !isSupport && (
                <Typography variant="body2" sx={{ color: '#0284C7', fontWeight: 600, fontSize: '13px', mt: 0.3 }}>
                  {otherUser.designation || 'Staff Member'}
                </Typography>
              )}

              {isGroup && (
                <Chip
                  label={`${members.length} members`}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: '#F0F9FF',
                    color: '#0369A1',
                    fontWeight: 600,
                    fontSize: '11px',
                    border: '1px solid #BAE6FD',
                  }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

            {/* Direct Member Details */}
            {!isGroup && (
              <Stack spacing={2}>
                {otherUser.employee_id && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F1F5F9', color: '#64748B' }}>
                      <IdIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                        EMPLOYEE ID
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                        {otherUser.employee_id}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {otherUser.department && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F1F5F9', color: '#64748B' }}>
                      <DeptIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                        {otherUser.department.name || otherUser.department}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {otherUser.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F1F5F9', color: '#64748B' }}>
                      <EmailIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                        WORK EMAIL
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500, wordBreak: 'break-all' }}>
                        {otherUser.email}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {otherUser.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#F1F5F9', color: '#64748B' }}>
                      <PhoneIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                        PHONE
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
                        {otherUser.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* View Full Profile action */}
                {userRole === 'admin' && otherUser.id && (
                  <Button
                    variant="outlined"
                    startIcon={<ProfileIcon />}
                    onClick={() => navigate('/admin/employees')}
                    sx={{
                      mt: 2,
                      borderColor: '#E2E8F0',
                      color: '#0284C7',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '10px',
                      '&:hover': { borderColor: '#0284C7', bgcolor: '#F0F9FF' },
                    }}
                  >
                    View in Employee Directory
                  </Button>
                )}
              </Stack>
            )}

            {/* Group Members List Preview */}
            {isGroup && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                    MEMBERS ({members.length})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddMemberIcon />}
                    onClick={onOpenMembersModal}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', color: '#0284C7' }}
                  >
                    Manage
                  </Button>
                </Box>

                <List disablePadding>
                  {members.slice(0, 6).map((m) => {
                    const u = m.user || {};
                    return (
                      <ListItem
                        key={m.id || u.id}
                        disableGutters
                        sx={{ py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            src={getAvatarFullUrl(u.profile_photo)}
                            sx={{ width: 32, height: 32, fontSize: '12px', bgcolor: '#0284C7', fontWeight: 600 }}
                          >
                            {(u.first_name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                              {u.first_name} {u.last_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                              {u.designation || 'Staff'}
                            </Typography>
                          </Box>
                        </Box>
                        {m.role === 'admin' && (
                          <Chip
                            label="Admin"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '10px',
                              fontWeight: 700,
                              bgcolor: '#E0F2FE',
                              color: '#0284C7',
                            }}
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>

                {members.length > 6 && (
                  <Button
                    fullWidth
                    size="small"
                    onClick={onOpenMembersModal}
                    sx={{ mt: 1, color: '#64748B', textTransform: 'none', fontSize: '12px' }}
                  >
                    View all {members.length} members
                  </Button>
                )}

                <Divider sx={{ my: 2.5, borderColor: '#F1F5F9' }} />

                {/* Leave Group Action */}
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LeaveIcon />}
                  onClick={onLeaveGroup}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '10px',
                    borderColor: '#FCA5A5',
                    color: '#EF4444',
                    '&:hover': { bgcolor: '#FEF2F2', borderColor: '#EF4444' },
                  }}
                >
                  Leave Group
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          /* Media & Files Tab */
          <Box>
            {/* Images Gallery */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px', mb: 1 }}>
              IMAGES ({images.length})
            </Typography>
            {images.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12px', mb: 2 }}>
                No images shared yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
                {images.map((img) => (
                  <Box
                    key={img.id}
                    component="a"
                    href={getAvatarFullUrl(img.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      aspectRatio: '1',
                      border: '1px solid #E2E8F0',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'scale(1.04)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={getAvatarFullUrl(img.file_url)}
                      alt={img.file_name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

            {/* Documents List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px', mb: 1 }}>
              DOCUMENTS ({docs.length})
            </Typography>
            {docs.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                No documents shared yet.
              </Typography>
            ) : (
              <List disablePadding>
                {docs.map((doc) => (
                  <ListItem
                    key={doc.id}
                    disableGutters
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        component="a"
                        href={getAvatarFullUrl(doc.file_url)}
                        download={doc.file_name}
                        target="_blank"
                        sx={{ color: '#0284C7' }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ py: 1, borderBottom: '1px solid #F8FAFC' }}
                  >
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <FileIcon sx={{ color: '#0284C7', fontSize: 24 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.file_name}
                      secondary={`${formatFileSize(doc.file_size)} • ${formatChatTimestamp(doc.createdAt || doc.created_at)}`}
                      primaryTypographyProps={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#0F172A',
                        noWrap: true,
                        maxWidth: 180,
                      }}
                      secondaryTypographyProps={{ fontSize: '11px', color: '#94A3B8' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
