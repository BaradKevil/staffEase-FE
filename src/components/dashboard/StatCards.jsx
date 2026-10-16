import React from 'react';
import { Box, Card, Typography } from '@mui/material';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#23A4E8',
  bgLight = '#E0F2FE',
  progress = 65
}) {
  return (
    <Card
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        border: '1px solid #E2E8F0',
        p: { xs: 2.25, sm: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
        }
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {/* Top Header: Title + Big Value on Left, Production Icon Badge on Right */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.75 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                mb: 0.75,
                lineHeight: 1.3
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '26px', sm: '30px' },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                wordBreak: 'break-word'
              }}
            >
              {value}
            </Typography>
          </Box>

          {/* Top-Right Icon Badge */}
          {Icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: bgLight,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${color}25`,
                boxShadow: `0 2px 8px ${color}15`
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Box>
          )}
        </Box>

        {/* Subtitle Status Pill */}
        {subtitle && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              bgcolor: bgLight,
              border: `1px solid ${color}20`,
              width: 'fit-content',
              maxWidth: '100%'
            }}
          >
            <Typography
              sx={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: color,
                lineHeight: 1.2
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bottom Linear Accent Bar (SmartOps-Pay Production Polish) */}
      <Box sx={{ mt: 'auto', pt: 2.25 }}>
        <Box
          sx={{
            height: '4px',
            width: '100%',
            bgcolor: '#F1F5F9',
            borderRadius: '99px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              bgcolor: color,
              borderRadius: '99px'
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

export default function StatCardsGrid({ items = [] }) {
  if (!items.length) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: `repeat(${Math.min(items.length, 4)}, 1fr)`
        },
        gap: { xs: 2, sm: 2.5 },
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </Box>
  );
}
