'use client';

import { Box, Typography } from '@mui/material';
import { Platform } from '../hooks/usePlatformManager';

interface JiraIssueSearchViewProps {
  jiraPlatform: Platform;
}

export default function JiraIssueSearchView({ jiraPlatform }: JiraIssueSearchViewProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {jiraPlatform.name} - 이슈 검색 뷰
      </Typography>
      <Typography variant="body1">
        이곳은 이슈를 검색하고 필터링하는 공간입니다. (구현 예정)
      </Typography>
    </Box>
  );
}
