'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';
import { createBasicAuthHeader } from '../lib/jiraAuth';

interface JiraKanbanViewProps {
  jiraPlatform: Platform;
}

interface KanbanIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    assignee?: { displayName: string };
  };
}

const KANBAN_ISSUE_LIMIT = 80;
const KANBAN_ISSUE_FIELDS = 'summary,status,assignee';

export default function JiraKanbanView({ jiraPlatform }: JiraKanbanViewProps) {
  const [issues, setIssues] = useState<KanbanIssue[]>([]);
  const [issueTotal, setIssueTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKanbanIssues = async () => {
      setLoading(true);
      setError(null);
      setIssues([]);
      setIssueTotal(0);

      try {
        const headers = {
          Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
          'X-Jira-Url': jiraPlatform.url,
        };
        const response = await axios.get('/api/jira/issues', {
          headers,
          params: {
            jql: 'ORDER BY updated DESC',
            startAt: 0,
            maxResults: KANBAN_ISSUE_LIMIT,
            fields: KANBAN_ISSUE_FIELDS,
          },
        });

        setIssues(response.data.issues || []);
        setIssueTotal(response.data.total ?? response.data.issues?.length ?? 0);
      } catch (err: any) {
        setError(err.response?.data?.error || '칸반 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanIssues();
  }, [jiraPlatform]);

  const columns = useMemo(() => {
    return issues.reduce<Record<string, KanbanIssue[]>>((acc, issue) => {
      const status = issue.fields.status.name;
      acc[status] = acc[status] || [];
      acc[status].push(issue);
      return acc;
    }, {});
  }, [issues]);
  const sampledIssueCount = loading ? KANBAN_ISSUE_LIMIT : issues.length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', animation: 'tasker-rise-in 220ms ease-out' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">
            {jiraPlatform.name} - 칸반보드
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            최근 업데이트 이슈 {sampledIssueCount}개까지 워크플로 상태별로 묶어 봅니다.
          </Typography>
        </Box>
        <Chip
          label={issueTotal > issues.length ? `${issues.length} / ${issueTotal} issues` : `${issues.length} issues`}
          size="small"
          color="important"
        />
      </Stack>
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
          {[...Array(3)].map((_, columnIndex) => (
            <Paper key={columnIndex} variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
              <Skeleton width="42%" height={28} />
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {[...Array(3)].map((__, itemIndex) => <Skeleton key={itemIndex} height={86} />)}
              </Stack>
            </Paper>
          ))}
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
          {Object.entries(columns).map(([status, statusIssues]) => (
            <Paper
              key={status}
              variant="outlined"
              sx={{
                p: 2,
                minHeight: 240,
                borderColor: 'divider',
                backgroundImage: 'linear-gradient(180deg, rgba(101, 211, 196, 0.08), transparent 120px)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="h6">{status}</Typography>
                <Chip label={statusIssues.length} size="small" color="positive" />
              </Stack>
              <Box className="tasker-scrollbar" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 'calc(100dvh - 320px)', overflowY: 'auto', pr: 0.5 }}>
                {statusIssues.map((issue) => (
                  <Paper
                    key={issue.key}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: 'secondary.main', fontWeight: 850 }}>{issue.key}</Typography>
                    <Typography variant="body2" sx={{ my: 1 }}>{issue.fields.summary}</Typography>
                    <Chip
                      label={issue.fields.assignee?.displayName || 'Unassigned'}
                      size="small"
                      variant="outlined"
                    />
                  </Paper>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

