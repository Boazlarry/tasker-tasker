'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from '@mui/material';
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {jiraPlatform.name} - 팀 뷰
      </Typography>
      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ p: 2 }}>
          <List>
            {people.map((person) => (
              <ListItem key={person.name} divider>
                <ListItemAvatar>
                  <Avatar>{person.name.slice(0, 1)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={person.name}
                  secondary={`담당 이슈 ${person.assigned}개 / 보고 이슈 ${person.reported}개`}
                />
              </ListItem>
            ))}
            {!people.length && (
              <ListItem>
                <ListItemText primary="표시할 팀 데이터가 없습니다." />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}

