'use client';

import { Box, Typography } from '@mui/material';

interface BrandMarkProps {
  compact?: boolean;
}

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          width: compact ? 32 : 38,
          height: compact ? 32 : 38,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          boxShadow: '0 10px 24px rgba(34, 102, 91, 0.22)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '64%',
            height: '64%',
            border: '2px solid currentColor',
            borderRadius: '4px',
            transform: 'rotate(8deg)',
            opacity: 0.95,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '36%',
            height: 2,
            bgcolor: 'currentColor',
            borderRadius: 999,
            transform: 'translateY(3px) rotate(8deg)',
          },
        }}
      />
      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="div"
            sx={{
              color: 'text.primary',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: 0,
              fontSize: 18,
            }}
          >
            Tasker Tasker
          </Typography>
          <Typography
            component="div"
            sx={{
              color: 'text.secondary',
              fontSize: 11,
              lineHeight: 1.25,
              mt: 0.45,
              whiteSpace: 'nowrap',
            }}
          >
            Local-first work console
          </Typography>
        </Box>
      )}
    </Box>
  );
}

