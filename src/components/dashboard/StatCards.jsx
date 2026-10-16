import React from 'react';
import { Box, Card, Typography, Grid } from '@mui/material';

export function StatCard({ title, value, subtitle, icon: Icon, color = '#23A4E8', bgLight = '#E0F2FE' }) {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '16px',
        border: '1px solid #EEF2F6',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              display: 'block'
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              mt: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem' }
            }}
          >
            {value}
          </Typography>
        </Box>

        {Icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: bgLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              flexShrink: 0
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Card>
  );
}

export default function StatCardsGrid({ items = [] }) {
  if (!items.length) return null;

  return (
    <Grid container spacing={2.5}>
      {items.map((item, idx) => (
        <Grid item xs={12} sm={6} md={12 / Math.min(items.length, 4)} key={idx}>
          <StatCard {...item} />
        </Grid>
      ))}
    </Grid>
  );
}
