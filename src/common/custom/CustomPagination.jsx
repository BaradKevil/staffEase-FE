/**
 * ===========================================
 *  Custom Table Pagination
 * ===========================================
 */

import React from 'react';
import { Box, Typography, IconButton, Select, MenuItem } from '@mui/material';
import {
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';

const CustomPagination = ({
  pagination = { currentPage: 1, totalPages: 1, totalCount: 0 },
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  const { currentPage, totalPages, totalCount } = pagination;
  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        px: 2.5,
        py: 2,
        borderTop: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>Rows per page:</Typography>
        {onPageSizeChange && (
          <Select
            size="small"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            sx={{
              height: 32,
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              '& .MuiSelect-select': { py: 0.5, px: 1.5 },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        )}
        <Typography sx={{ fontSize: '13px', color: '#64748B', ml: 1 }}>
          Showing <strong>{startIdx}</strong>-<strong>{endIdx}</strong> of{' '}
          <strong>{totalCount}</strong> items
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            color: '#334155',
            '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
          }}
        >
          <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', px: 1 }}>
          Page {currentPage} of {totalPages || 1}
        </Typography>

        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            color: '#334155',
            '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
          }}
        >
          <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CustomPagination;
