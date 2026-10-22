/**
 * ===========================================
 *  Group Members Management Modal
 * ===========================================
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Divider,
} from '@mui/material';
import {
  PersonAddOutlined as AddIcon,
  DeleteOutlineRounded as RemoveIcon,
  ExitToApp as LeaveIcon,
  AdminPanelSettingsOutlined as AdminIcon,
} from '@mui/icons-material';
import { useAddGroupMember, useRemoveGroupMember, useChatDirectory } from '../../Api/Api';
import { getAvatarFullUrl } from './chatUtils';
import { toast } from 'react-toastify';

export default function GroupMembersModal({
  open,
  onClose,
  conversation,
  currentUserId,
  userRole,
}) {
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const { data: directoryEmployees = [] } = useChatDirectory();

  const isGroupAdmin = conversation?.my_role === 'admin' || userRole === 'admin';
  const members = conversation?.members || [];
  const currentMemberIds = members.map((m) => m.user_id);

  // Available employees who are not yet members
  const availableEmployees = directoryEmployees.filter(
    (emp) => !currentMemberIds.includes(emp.id)
  );

  const { mutate: addMember, isPending: isAdding } = useAddGroupMember(
    () => {
      toast.success('Member added to group!');
      setSelectedUserToAdd('');
      setShowAddSection(false);
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to add member.')
  );

  const { mutate: removeMember, isPending: isRemoving } = useRemoveGroupMember(
    () => {
      toast.success('Member removed from group.');
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to remove member.')
  );

  const handleAdd = () => {
    if (!selectedUserToAdd) return;
    addMember({
      conversationId: conversation.id,
      userId: Number(selectedUserToAdd),
    });
  };

  const handleRemove = (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the group?')) {
      removeMember({
        conversationId: conversation.id,
        userId,
      });
    }
  };

  const handleLeaveGroup = () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      removeMember(
        {
          conversationId: conversation.id,
          userId: currentUserId,
        },
        {
          onSuccess: () => {
            toast.info('You left the group.');
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #EDEBE9' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#242424' }}>
          Group Members ({members.length})
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#616161' }}>
          {conversation?.title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Add Member Toggle (For group admins) */}
        {isGroupAdmin && (
          <Box sx={{ mb: 2 }}>
            {!showAddSection ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                onClick={() => setShowAddSection(true)}
                sx={{
                  borderColor: '#5B5FC7',
                  color: '#5B5FC7',
                  textTransform: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#F0F9FF', borderColor: '#4F52B2' },
                }}
              >
                Add Member to Group
              </Button>
            ) : (
              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#475569', mb: 1 }}>
                  Select colleague to add:
                </Typography>
                <Stack spacing={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="select-emp-label">Choose colleague</InputLabel>
                    <Select
                      labelId="select-emp-label"
                      label="Choose colleague"
                      value={selectedUserToAdd}
                      onChange={(e) => setSelectedUserToAdd(e.target.value)}
                      sx={{ bgcolor: '#FFFFFF', borderRadius: '6px' }}
                    >
                      {availableEmployees.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.department?.name || 'Staff'})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => setShowAddSection(false)} sx={{ fontSize: '11px', color: '#64748B' }}>
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleAdd}
                      disabled={!selectedUserToAdd || isAdding}
                      sx={{ bgcolor: '#5B5FC7', fontSize: '11px', '&:hover': { bgcolor: '#4F52B2' } }}
                    >
                      {isAdding ? 'Adding...' : 'Add Member'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Member List */}
        <List sx={{ maxHeight: 300, overflowY: 'auto', p: 0 }}>
          {members.map((m) => {
            const u = m.user || {};
            const isMe = Number(m.user_id) === Number(currentUserId);
            const isMemberAdmin = m.role === 'admin';

            return (
              <ListItem
                key={m.id}
                secondaryAction={
                  isMe ? (
                    <Chip label="You" size="small" sx={{ fontSize: '10px', height: 20, bgcolor: '#EDEBE9', fontWeight: 600 }} />
                  ) : isGroupAdmin ? (
                    <IconButton size="small" onClick={() => handleRemove(m.user_id)} disabled={isRemoving} sx={{ color: '#EF4444' }}>
                      <RemoveIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  ) : null
                }
                disablePadding
                sx={{ mb: 0.5, py: 0.5 }}
              >
                <ListItemAvatar>
                  <Avatar src={getAvatarFullUrl(u.profile_photo)} sx={{ width: 34, height: 34, bgcolor: '#EDEBE9', color: '#5B5FC7', fontSize: '12px', fontWeight: 700 }}>
                    {u.first_name?.[0] || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#242424' }}>
                        {u.first_name} {u.last_name}
                      </Typography>
                      {isMemberAdmin && (
                        <Chip
                          icon={<AdminIcon sx={{ fontSize: '13px !important' }} />}
                          label="Admin"
                          size="small"
                          sx={{ fontSize: '10px', height: 18, bgcolor: '#EEF2FF', color: '#5B5FC7', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={u.designation || u.department?.name || 'Staff'}
                  secondaryTypographyProps={{ fontSize: '11px', color: '#707070' }}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid #EDEBE9', justifyContent: 'space-between' }}>
        <Button
          color="error"
          size="small"
          startIcon={<LeaveIcon sx={{ fontSize: 16 }} />}
          onClick={handleLeaveGroup}
          sx={{ textTransform: 'none', fontSize: '12px', fontWeight: 600 }}
        >
          Leave Group
        </Button>
        <Button onClick={onClose} sx={{ color: '#424242', textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
