import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  EventAvailableRounded as HolidayIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useCreateHoliday } from '../../Api/Api';
import { toast } from 'react-toastify';

export default function AddHolidayModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    holiday_date: '',
    description: ''
  });

  const createMutation = useCreateHoliday();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.holiday_date) {
      toast.error('Holiday name and date are required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        holiday_name: formData.name.trim(),
        name: formData.name.trim(),
        holiday_date: formData.holiday_date,
        description: formData.description.trim() || undefined
      });
      toast.success('Company holiday added successfully');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', holiday_date: '', description: '' });
    onClose();
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      height: 44,
      borderRadius: '10px',
      bgcolor: '#F8FAFC',
      '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
      '&:hover fieldset': { borderColor: '#23A4E8' },
      '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '13.5px',
      color: '#0F172A',
      '&::placeholder': { color: '#94A3B8', opacity: 1 }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          borderTop: '5px solid #23A4E8',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          width: { xs: 'calc(100% - 32px)', sm: '100%' },
          m: { xs: 2, sm: 'auto' }
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.8,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              color: '#23A4E8',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HolidayIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '17px', lineHeight: 1.3 }}>
              Add Company Holiday
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Configure paid non-working company days
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {/* Holiday Name */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Holiday Name <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                name="name"
                fullWidth
                required
                placeholder="e.g. Diwali, Independence Day"
                value={formData.name}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>

            {/* Holiday Date */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Holiday Date <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                name="holiday_date"
                type="date"
                fullWidth
                required
                value={formData.holiday_date}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>

            {/* Description */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                Description <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
              </Typography>
              <TextField
                name="description"
                fullWidth
                multiline
                rows={2}
                placeholder="Optional notes or details..."
                value={formData.description}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    p: 1.5,
                    '& fieldset': { borderColor: '#E2E8F0', transition: 'border-color 0.2s' },
                    '&:hover fieldset': { borderColor: '#23A4E8' },
                    '&.Mui-focused fieldset': { borderColor: '#23A4E8', borderWidth: '1.5px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: '13.5px',
                    color: '#0F172A',
                    '&::placeholder': { color: '#94A3B8', opacity: 1 }
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
          <Button
            onClick={handleClose}
            sx={{
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              px: 2.5,
              borderRadius: '10px'
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#23A4E8',
              '&:hover': { bgcolor: '#1D8BC4' }
            }}
          >
            {createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save Holiday'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
