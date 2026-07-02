'use client';

import { useState, type ChangeEvent } from 'react';
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

const SEARCH_ISSUE_FIELDS = 'summary,issuetype,reporter,status';

export default function JiraIssueSearchView({ jiraPlatform }: JiraIssueSearchViewProps) {
  const [query, setQuery] = useState('');
  const [issues, setIssues] = useState<SearchIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const handleSearch = async (nextPage = 0, nextRowsPerPage = rowsPerPage) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setIssues([]);
    setTotal(0);

    try {
      const response = await axios.get('/api/jira/issues', {
        headers: {
          Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
          'X-Jira-Url': jiraPlatform.url,
        },
        params: {
          query: trimmedQuery,
          startAt: nextPage * nextRowsPerPage,
          maxResults: nextRowsPerPage,
          fields: SEARCH_ISSUE_FIELDS,
        },
      });

      setIssues(response.data.issues || []);
      setTotal(response.data.total ?? response.data.issues?.length ?? 0);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.response?.data?.error || '이슈 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: unknown, nextPage: number) => {
    void handleSearch(nextPage, rowsPerPage);
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextRowsPerPage = Number(event.target.value);
    setRowsPerPage(nextRowsPerPage);
    void handleSearch(0, nextRowsPerPage);
  };

  const visibleIssues = issues;

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
        <Chip label={`${total} results`} size="small" color="important" />
      </Stack>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label="검색어"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleSearch();
          }}
          fullWidth
        />
        <Button variant="contained" startIcon={<SearchIcon />} onClick={() => void handleSearch()} disabled={loading}>
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
              {!loading && total === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>검색 결과가 없습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && total > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[8, 16, 32]}
            labelRowsPerPage="결과"
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        )}
      </Paper>
    </Box>
  );
}

