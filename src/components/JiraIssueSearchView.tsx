'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
    } catch (err: any) {
      setError(err.response?.data?.error || '이슈 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {jiraPlatform.name} - 이슈 검색
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table aria-label="issue search results">
            <TableHead>
              <TableRow>
                <TableCell>키</TableCell>
                <TableCell>요약</TableCell>
                <TableCell>타입</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>보고자</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id || issue.key}>
                  <TableCell>{issue.key}</TableCell>
                  <TableCell>{issue.fields.summary}</TableCell>
                  <TableCell>{issue.fields.issuetype.name}</TableCell>
                  <TableCell><Chip label={issue.fields.status.name} size="small" /></TableCell>
                  <TableCell>{issue.fields.reporter.displayName}</TableCell>
                </TableRow>
              ))}
              {!issues.length && (
                <TableRow>
                  <TableCell colSpan={5}>검색 결과가 없습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

