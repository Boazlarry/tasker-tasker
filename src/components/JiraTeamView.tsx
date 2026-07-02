'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
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
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';
import { createBasicAuthHeader } from '../lib/jiraAuth';

interface JiraTeamViewProps {
  jiraPlatform: Platform;
}

interface TeamIssue {
  key: string;
  fields: {
    reporter?: { displayName: string };
    assignee?: { displayName: string };
  };
}

export default function JiraTeamView({ jiraPlatform }: JiraTeamViewProps) {
  const [issues, setIssues] = useState<TeamIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  useEffect(() => {
    const fetchTeamContext = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = {
          Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
          'X-Jira-Url': jiraPlatform.url,
        };
        const projectsResponse = await axios.get('/api/jira/projects', { headers });
        const projectKeys = projectsResponse.data.map((project: { key: string }) => project.key);
        const issueResponses = await Promise.all(
          projectKeys.map((projectKey: string) => axios.get(`/api/jira/issues?projectKey=${projectKey}`, { headers }))
        );

        setIssues(issueResponses.flatMap((response) => response.data.issues || []));
      } catch (err: any) {
        setError(err.response?.data?.error || '팀 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamContext();
  }, [jiraPlatform]);

  const people = useMemo(() => {
    const map = new Map<string, { name: string; reported: number; assigned: number }>();

    issues.forEach((issue) => {
      const reporter = issue.fields.reporter?.displayName;
      const assignee = issue.fields.assignee?.displayName;

      if (reporter) {
        const person = map.get(reporter) || { name: reporter, reported: 0, assigned: 0 };
        person.reported += 1;
        map.set(reporter, person);
      }

      if (assignee) {
        const person = map.get(assignee) || { name: assignee, reported: 0, assigned: 0 };
        person.assigned += 1;
        map.set(assignee, person);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.assigned + b.reported - (a.assigned + a.reported));
  }, [issues]);
  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= people.length) {
      setPage(Math.max(0, Math.ceil(people.length / rowsPerPage) - 1));
    }
  }, [page, people.length, rowsPerPage]);

  const visiblePeople = people.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, animation: 'tasker-rise-in 220ms ease-out' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">
            {jiraPlatform.name} - 팀 뷰
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            담당/보고 이슈 기준으로 팀 컨텍스트를 집계합니다.
          </Typography>
        </Box>
        <Chip label={`${people.length} people`} size="small" color="secondary" />
      </Stack>
      {loading ? (
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
          <Stack spacing={1.25}>
            {[...Array(5)].map((_, index) => <Skeleton key={index} height={54} />)}
          </Stack>
        </Paper>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: 'divider' }}>
          <TableContainer className="tasker-scrollbar" sx={{ maxHeight: 'calc(100dvh - 292px)' }}>
            <Table stickyHeader aria-label="team table">
              <TableHead>
                <TableRow>
                  <TableCell>사람</TableCell>
                  <TableCell sx={{ width: 140 }}>담당</TableCell>
                  <TableCell sx={{ width: 140 }}>보고</TableCell>
                  <TableCell sx={{ width: 140 }}>전체</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visiblePeople.map((person) => (
                  <TableRow key={person.name} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{person.name.slice(0, 1)}</Avatar>
                        <Typography fontWeight={800}>{person.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{person.assigned}</TableCell>
                    <TableCell>{person.reported}</TableCell>
                    <TableCell>
                      <Chip label={person.assigned + person.reported} size="small" color="positive" />
                    </TableCell>
                  </TableRow>
                ))}
                {!people.length && (
                  <TableRow>
                    <TableCell colSpan={4}>표시할 팀 데이터가 없습니다.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {people.length > 0 && (
            <TablePagination
              component="div"
              count={people.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[8, 16, 32]}
              labelRowsPerPage="사람"
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
          )}
        </Paper>
      )}
    </Box>
  );
}

