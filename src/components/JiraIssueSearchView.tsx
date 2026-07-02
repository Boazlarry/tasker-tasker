'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';
import { createBasicAuthHeader } from '../lib/jiraAuth';

interface JiraIssueSearchViewProps {
  jiraPlatform: Platform;
}

interface SearchIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: { name: string };
    status: { name: string };
    reporter: { displayName: string };
  };
}

export default function JiraIssueSearchView({ jiraPlatform }: JiraIssueSearchViewProps) {
  const [query, setQuery] = useState('');
  const [issues, setIssues] = useState<SearchIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/jira/issues?query=${encodeURIComponent(query.trim())}`, {
        headers: {
          Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
          'X-Jira-Url': jiraPlatform.url,
        },
      });

      setIssues(response.data.issues || []);
      setPage(0);
    } catch (err: any) {
      setError(err.response?.data?.error || '이슈 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const visibleIssues = issues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= issues.length) {
      setPage(Math.max(0, Math.ceil(issues.length / rowsPerPage) - 1));
    }
  }, [issues.length, page, rowsPerPage]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, animation: 'tasker-rise-in 220ms ease-out' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">
            {jiraPlatform.name} - 이슈 검색
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            검색 결과는 페이지 단위로 표시됩니다.
          </Typography>
        </Box>
        <Chip label={`${issues.length} results`} size="small" color="important" />
      </Stack>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label="검색어"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSearch();
          }}
          fullWidth
        />
        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} disabled={loading}>
          검색
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: 'divider' }}>
        <TableContainer className="tasker-scrollbar" sx={{ maxHeight: 'calc(100dvh - 300px)' }}>
          <Table stickyHeader aria-label="issue search results" sx={{ tableLayout: 'fixed', minWidth: { xs: 640, md: 0 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 96 }}>키</TableCell>
                <TableCell>요약</TableCell>
                <TableCell sx={{ width: 120 }}>타입</TableCell>
                <TableCell sx={{ width: 120 }}>상태</TableCell>
                <TableCell sx={{ width: 150 }}>보고자</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))}
              {!loading && visibleIssues.map((issue) => (
                <TableRow key={issue.id || issue.key}>
                  <TableCell><Typography noWrap sx={{ color: 'secondary.main', fontWeight: 850 }}>{issue.key}</Typography></TableCell>
                  <TableCell><Typography noWrap>{issue.fields.summary}</Typography></TableCell>
                  <TableCell>{issue.fields.issuetype.name}</TableCell>
                  <TableCell><Chip label={issue.fields.status.name} size="small" /></TableCell>
                  <TableCell><Typography noWrap>{issue.fields.reporter.displayName}</Typography></TableCell>
                </TableRow>
              ))}
              {!loading && !issues.length && (
                <TableRow>
                  <TableCell colSpan={5}>검색 결과가 없습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && issues.length > 0 && (
          <TablePagination
            component="div"
            count={issues.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[8, 16, 32]}
            labelRowsPerPage="결과"
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        )}
      </Paper>
    </Box>
  );
}

