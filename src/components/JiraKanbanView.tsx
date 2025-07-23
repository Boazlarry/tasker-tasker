'use client';

import { Box, Typography } from '@mui/material';
import { Platform } from '../hooks/usePlatformManager';

interface JiraKanbanViewProps {
  jiraPlatform: Platform;
}

export default function JiraKanbanView({ jiraPlatform }: JiraKanbanViewProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {jiraPlatform.name} - 칸반보드 뷰
      </Typography>
      <Typography variant="body1">
        이곳은 칸반보드를 표시하는 공간입니다. (구현 예정)
      </Typography>
    </Box>
  );
}
