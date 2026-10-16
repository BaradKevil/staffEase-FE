/**
 * ===========================================
 *  Custom Table Skeleton Loader
 * ===========================================
 */

import React from 'react';
import { TableRow, TableCell, Skeleton } from '@mui/material';

export const SkeletonTableRows = ({ rows = 5, columns = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={rIdx}>
          {Array.from({ length: columns }).map((_, cIdx) => (
            <TableCell key={cIdx} sx={{ py: 2 }}>
              <Skeleton
                variant={cIdx === 0 ? 'text' : 'rounded'}
                height={22}
                width={cIdx === 0 ? '80%' : cIdx === 1 ? '50%' : '70%'}
                sx={{ borderRadius: '6px' }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default SkeletonTableRows;
