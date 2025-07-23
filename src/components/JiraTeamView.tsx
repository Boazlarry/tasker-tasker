'use client';

import { Box, Typography } from '@mui/material';
import { Platform } from '../hooks/usePlatformManager';

interface JiraTeamViewProps {
  jiraPlatform: Platform;
}

export default function JiraTeamView({ jiraPlatform }: JiraTeamViewProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {jiraPlatform.name} - 팀 뷰
      </Typography>
      <Typography variant="body1">
        이곳은 팀 관련 정보를 표시하는 공간입니다. (구현 예정)
      </Typography>
    </Box>
  );
}
