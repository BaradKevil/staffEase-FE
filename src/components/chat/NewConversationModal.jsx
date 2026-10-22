/**
 * ===========================================
 *  New Conversation Modal (Direct, Group & Admin Support)
 * ===========================================
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonOutlineRounded as PersonIcon,
  GroupsOutlined as GroupIcon,
  SupportAgentOutlined as SupportIcon,
} from '@mui/icons-material';
import {
  useChatDirectory,
  useStartDirectConversation,
  useCreateGroupConversation,
  useStartAdminSupport,
} from '../../Api/Api';
import { getAvatarFullUrl } from './chatUtils';
import { toast } from 'react-toastify';

export default function NewConversationModal({
  open,
  onClose,
  onConversationCreated,
  currentUserId,
}) {
  const [tabIndex, setTabIndex] = useState(0); // 0: Direct, 1: Group, 2: HR Support
  const [search, setSearch] = useState('');

  // Group Form State
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // HR Support Form State
  const [supportTopic, setSupportTopic] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const { data: employees = [], isLoading } = useChatDirectory(search);

  // Mutations
  const { mutate: startDirect, isPending: isStartingDirect } = useStartDirectConversation(
    (conv) => {
      onConversationCreated(conv.id);
      handleClose();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to start direct conversation.')
  );

  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateGroupConversation(
    (conv) => {
      toast.success(`Group "${conv.title}" created successfully!`);
      onConversationCreated(conv.id);
      handleClose();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to create group.')
  );

  const { mutate: startSupport, isPending: isStartingSupport } = useStartAdminSupport(
    (conv) => {
      toast.success('HR Support conversation initiated!');
      onConversationCreated(conv.id);
      handleClose();
    },
    (err) => toast.error(err?.response?.data?.message || 'Failed to start HR conversation.')
  );

  const handleClose = () => {
    setSearch('');
    setGroupTitle('');
    setGroupDescription('');
    setSelectedMemberIds([]);
    setSupportTopic('');
    setSupportMessage('');
    onClose();
  };

  const handleToggleMember = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupTitle.trim()) {
      toast.error('Please enter a group title.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one colleague to add to the group.');
      return;
    }

    createGroup({
      title: groupTitle.trim(),
      description: groupDescription.trim() || undefined,
      member_ids: selectedMemberIds,
    });
  };

  const handleStartSupport = () => {
    startSupport({
      topic: supportTopic.trim() || undefined,
      initial_message: supportMessage.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #EDEBE9' }}>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#242424' }}>
          New Communication
        </Typography>
        <Tabs
          value={tabIndex}
          onChange={(_, idx) => setTabIndex(idx)}
          sx={{
            mt: 1,
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'none',
              py: 0.5,
              color: '#616161',
              '&.Mui-selected': { color: '#5B5FC7' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#5B5FC7' },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Direct Chat" />
          <Tab icon={<GroupIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="New Group" />
          <Tab icon={<SupportIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Admin / HR Support" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        {/* ----------------------------------------------------------- */}
        {/* TAB 0: Direct Message Directory                             */}
        {/* ----------------------------------------------------------- */}
        {tabIndex === 0 && (
          <Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search employee by name, designation, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#707070' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#5B5FC7' }} />
              </Box>
            ) : employees.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#8A8886', fontSize: '13px' }}>
                No colleagues found matching your search.
              </Typography>
            ) : (
              <List sx={{ maxHeight: 320, overflowY: 'auto', p: 0 }}>
                {employees.map((emp) => (
                  <ListItemButton
                    key={emp.id}
                    onClick={() => startDirect(emp.id)}
                    disabled={isStartingDirect}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      py: 0.8,
                      '&:hover': { bgcolor: '#F3F2F1' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={getAvatarFullUrl(emp.profile_photo)}
                        sx={{ bgcolor: '#EDEBE9', color: '#5B5FC7', fontWeight: 700 }}
                      >
                        {emp.first_name?.[0] || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#242424' }}>
                            {emp.first_name} {emp.last_name}
                          </Typography>
                          {emp.is_online && (
                            <Chip label="Online" size="small" sx={{ height: 16, fontSize: '9.5px', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography sx={{ fontSize: '11.5px', color: '#616161' }}>
                          {emp.designation || 'Staff'} • {emp.department?.name || 'General'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 1: Create Group Conversation                            */}
        {/* ----------------------------------------------------------- */}
        {tabIndex === 1 && (
          <Box>
            <TextField
              fullWidth
              size="small"
              label="Group Name *"
              placeholder="e.g. Crest Coder Team, Frontend Squad, Project Launch"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Description (Optional)"
              placeholder="What is this group about?"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#424242', mb: 1, textTransform: 'uppercase' }}>
              Select Group Members ({selectedMemberIds.length} selected)
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Filter members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#707070' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <List sx={{ maxHeight: 220, overflowY: 'auto', p: 0, border: '1px solid #EDEBE9', borderRadius: '8px' }}>
              {employees.map((emp) => {
                const isChecked = selectedMemberIds.includes(emp.id);
                return (
                  <ListItem
                    key={emp.id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={isChecked}
                        onChange={() => handleToggleMember(emp.id)}
                        sx={{ color: '#5B5FC7', '&.Mui-checked': { color: '#5B5FC7' } }}
                      />
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => handleToggleMember(emp.id)} sx={{ py: 0.6 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={getAvatarFullUrl(emp.profile_photo)}
                          sx={{ width: 32, height: 32, bgcolor: '#EDEBE9', color: '#5B5FC7', fontSize: '12px' }}
                        >
                          {emp.first_name?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${emp.first_name} ${emp.last_name}`}
                        secondary={emp.department?.name || emp.designation}
                        primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: '11px' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: Dedicated Admin / HR Support Channel                 */}
        {/* ----------------------------------------------------------- */}
        {tabIndex === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2, fontSize: '12.5px' }}>
              This conversation connects directly to HR & System Administrators. Use it for confidential inquiries, leave questions, or workplace requests.
            </Alert>

            <TextField
              fullWidth
              size="small"
              label="Topic / Subject"
              placeholder="e.g. Leave Entitlement Question, Shift Adjustments"
              value={supportTopic}
              onChange={(e) => setSupportTopic(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Initial Message"
              placeholder="Type your message to HR..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #EDEBE9' }}>
        <Button onClick={handleClose} sx={{ color: '#616161', textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>

        {tabIndex === 1 && (
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={isCreatingGroup || !groupTitle.trim() || selectedMemberIds.length === 0}
            sx={{
              bgcolor: '#5B5FC7',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#4F52B2' },
            }}
          >
            {isCreatingGroup ? 'Creating...' : 'Create Group'}
          </Button>
        )}

        {tabIndex === 2 && (
          <Button
            variant="contained"
            onClick={handleStartSupport}
            disabled={isStartingSupport}
            sx={{
              bgcolor: '#5B5FC7',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#4F52B2' },
            }}
          >
            {isStartingSupport ? 'Connecting...' : 'Start HR Chat'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
