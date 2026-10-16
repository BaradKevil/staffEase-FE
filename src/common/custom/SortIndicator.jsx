/**
 * ===========================================
 *  Table Column Sort Indicator
 * ===========================================
 */

import React from 'react';
import { Box } from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

const SortIndicator = ({ sortKey, currentSortKey, sortDirection }) => {
  if (sortKey !== currentSortKey) {
    return null;
  }

  return (
    <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', ml: 0.5 }}>
      {sortDirection === 'asc' ? (
        <ArrowUpwardIcon sx={{ fontSize: 14, color: '#23A4E8' }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: 14, color: '#23A4E8' }} />
      )}
    </Box>
  );
};

export default SortIndicator;
