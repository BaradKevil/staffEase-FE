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
  CircularProgress
} from '@mui/material';
import { EventAvailableRounded as HolidayIcon } from '@mui/icons-material';
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7'
          }}
        >
          <HolidayIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.125rem' }}>
          Add Company Holiday
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Holiday Name *"
              name="name"
              size="small"
              fullWidth
              required
              placeholder="e.g. Diwali, Independence Day"
              value={formData.name}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              label="Holiday Date *"
              name="holiday_date"
              type="date"
              size="small"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.holiday_date}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              label="Description (Optional)"
              name="description"
              size="small"
              fullWidth
              multiline
              rows={2}
              placeholder="Optional notes or details..."
              value={formData.description}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#FAFCFE', borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={handleClose} sx={{ color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            sx={{
              borderRadius: '10px',
              px: 3,
              fontWeight: 600,
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
