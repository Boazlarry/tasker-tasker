'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Paper, Typography } from '@mui/material';
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

export default function JiraKanbanView({ jiraPlatform }: JiraKanbanViewProps) {
  const [issues, setIssues] = useState<KanbanIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKanbanIssues = async () => {
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

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom>
        {jiraPlatform.name} - 칸반보드
      </Typography>
      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
          {Object.entries(columns).map(([status, statusIssues]) => (
            <Paper key={status} sx={{ p: 2, minHeight: 240 }}>
              <Typography variant="h6" gutterBottom>{status}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {statusIssues.map((issue) => (
                  <Paper key={issue.key} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{issue.key}</Typography>
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

