'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';
import { createBasicAuthHeader } from '../lib/jiraAuth';

interface Project {
  id: string;
  key: string;
  name: string;
}

interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: { name: string; iconUrl: string };
    reporter: { displayName: string };
    status: { name: string };
  };
}

interface JiraPlatformViewProps {
  jiraPlatform: Platform;
  onOpenContentTab: (
    type: 'jira-project-list' | 'jira-issue-detail' | 'jira-team' | 'jira-kanban' | 'jira-issue-search',
    key: string,
    platform: Platform,
    title: string
  ) => void;
}

export default function JiraPlatformView({ jiraPlatform, onOpenContentTab }: JiraPlatformViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createSummary, setCreateSummary] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createIssueType, setCreateIssueType] = useState('Task');
  const [savingIssue, setSavingIssue] = useState(false);

  const authorization = createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken);

  const handleProjectClick = useCallback(async (projectKey: string) => {
    setSelectedProject(projectKey);
    localStorage.setItem(`lastSelectedProject:${jiraPlatform.id}`, projectKey);
    localStorage.setItem('lastSelectedProject', projectKey);
    setLoadingIssues(true);
    setIssues([]);
    setError(null);

    try {
      const response = await axios.get(`/api/jira/issues?projectKey=${projectKey}`, {
        headers: {
          Authorization: authorization,
          'X-Jira-Url': jiraPlatform.url,
        },
      });
      setIssues(response.data.issues || []);
    } catch (err: any) {
      setError(err.response?.data?.error || `'${projectKey}' 프로젝트의 이슈를 불러오는 데 실패했습니다.`);
    } finally {
      setLoadingIssues(false);
    }
  }, [authorization, jiraPlatform.id, jiraPlatform.url]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError(null);

    try {
      const response = await axios.get('/api/jira/projects', {
        headers: {
          Authorization: authorization,
          'X-Jira-Url': jiraPlatform.url,
        },
      });
      const fetchedProjects: Project[] = response.data;
      setProjects(fetchedProjects);

      const lastSelectedProject =
        localStorage.getItem(`lastSelectedProject:${jiraPlatform.id}`) ||
        localStorage.getItem('lastSelectedProject');

      if (lastSelectedProject && fetchedProjects.some((project) => project.key === lastSelectedProject)) {
        handleProjectClick(lastSelectedProject);
      } else if (fetchedProjects[0]) {
        handleProjectClick(fetchedProjects[0].key);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '프로젝트를 불러오는 데 실패했습니다.');
    } finally {
      setLoadingProjects(false);
    }
  }, [authorization, handleProjectClick, jiraPlatform.id, jiraPlatform.url]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleIssueClick = (issue: Issue) => {
    onOpenContentTab('jira-issue-detail', issue.key, jiraPlatform, issue.fields.summary);
  };

  const handleCreateIssue = async () => {
    if (!selectedProject || !createSummary.trim()) {
      setError('프로젝트와 이슈 요약이 필요합니다.');
      return;
    }

    setSavingIssue(true);
    setError(null);

    try {
      const response = await axios.post(
        '/api/jira/issues',
        {
          projectKey: selectedProject,
          summary: createSummary.trim(),
          description: createDescription,
          issueType: createIssueType,
        },
        {
          headers: {
            Authorization: authorization,
            'X-Jira-Url': jiraPlatform.url,
          },
        }
      );

      const createdIssue: Issue = response.data;
      setIssues((prevIssues) => [createdIssue, ...prevIssues]);
      setCreateDialogOpen(false);
      setCreateSummary('');
      setCreateDescription('');
      setCreateIssueType('Task');
      onOpenContentTab('jira-issue-detail', createdIssue.key, jiraPlatform, createdIssue.fields.summary);
    } catch (err: any) {
      setError(err.response?.data?.error || '이슈 생성에 실패했습니다.');
    } finally {
      setSavingIssue(false);
    }
  };

  const selectedProjectName = projects.find((project) => project.key === selectedProject)?.name;

  return (
    <Box sx={{ minHeight: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr)' }, gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderColor: 'divider',
          alignSelf: 'start',
          position: { lg: 'sticky' },
          top: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
              Jira Projects
            </Typography>
            <Typography variant="h6">{jiraPlatform.name}</Typography>
          </Box>
          <IconButton aria-label="refresh projects" onClick={fetchProjects} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        {loadingProjects ? (
          <Stack spacing={1}>
            {[...Array(5)].map((_, index) => <Skeleton key={index} height={44} />)}
          </Stack>
        ) : (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {projects.map((project) => (
              <ListItemButton
                key={project.id}
                selected={selectedProject === project.key}
                onClick={() => handleProjectClick(project.key)}
                sx={{
                  borderRadius: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(34, 102, 91, 0.11)',
                    '&:hover': { bgcolor: 'rgba(34, 102, 91, 0.16)' },
                  },
                }}
              >
                <ListItemText
                  primary={project.name}
                  secondary={project.key}
                  primaryTypographyProps={{ fontWeight: 800, noWrap: true }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ borderColor: 'divider', overflow: 'hidden', minWidth: 0 }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h5" noWrap>
              {selectedProject ? `${selectedProject} 이슈` : '프로젝트를 선택하세요'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedProjectName || '프로젝트를 선택하면 이슈 목록이 표시됩니다.'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={!selectedProject}
          >
            이슈 생성
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        {selectedProject ? (
          <>
            <Box sx={{ display: { xs: 'block', sm: 'none' }, p: 2 }}>
              {loadingIssues && (
                <Stack spacing={1.25}>
                  {[...Array(4)].map((_, index) => (
                    <Box key={index} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Skeleton width="32%" />
                      <Skeleton sx={{ mt: 1 }} />
                      <Skeleton width="58%" />
                    </Box>
                  ))}
                </Stack>
              )}

              {!loadingIssues && issues.length > 0 && (
                <Stack spacing={1.25}>
                  {issues.map((issue) => (
                    <Box
                      key={issue.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleIssueClick(issue)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleIssueClick(issue);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: 'background.paper',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                        <Typography sx={{ color: 'secondary.main', fontWeight: 850, whiteSpace: 'nowrap' }}>
                          {issue.key}
                        </Typography>
                        <Chip label={issue.fields.status.name} size="small" color="positive" />
                      </Stack>
                      <Typography sx={{ mt: 1, fontWeight: 750, lineHeight: 1.35 }}>
                        {issue.fields.summary}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mt: 1.25 }}>
                        <Chip
                          avatar={<Avatar src={issue.fields.issuetype.iconUrl} alt={issue.fields.issuetype.name} sx={{ width: 16, height: 16 }} />}
                          label={issue.fields.issuetype.name}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {issue.fields.reporter.displayName}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}

              {!loadingIssues && issues.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="h6">이슈가 없습니다</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>새 이슈를 생성하거나 다른 프로젝트를 선택하세요.</Typography>
                </Box>
              )}
            </Box>

            <TableContainer sx={{ display: { xs: 'none', sm: 'block' }, maxHeight: 'calc(100dvh - 250px)' }}>
              <Table stickyHeader aria-label="issues table" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 96 }}>키</TableCell>
                    <TableCell>요약</TableCell>
                    <TableCell sx={{ width: 116 }}>타입</TableCell>
                    <TableCell sx={{ width: 120 }}>상태</TableCell>
                    <TableCell sx={{ width: 136 }}>보고자</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingIssues && [...Array(8)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))}
                  {!loadingIssues && issues.map((issue) => (
                    <TableRow
                      key={issue.key}
                      hover
                      onClick={() => handleIssueClick(issue)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography noWrap sx={{ color: 'secondary.main', fontWeight: 850 }}>{issue.key}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 560 }}>{issue.fields.summary}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          avatar={<Avatar src={issue.fields.issuetype.iconUrl} alt={issue.fields.issuetype.name} sx={{ width: 16, height: 16 }} />}
                          label={issue.fields.issuetype.name}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={issue.fields.status.name} size="small" color="positive" />
                      </TableCell>
                      <TableCell>
                        <Typography noWrap title={issue.fields.reporter.displayName}>{issue.fields.reporter.displayName}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loadingIssues && issues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                          <Typography variant="h6">이슈가 없습니다</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.5 }}>새 이슈를 생성하거나 다른 프로젝트를 선택하세요.</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6">왼쪽에서 프로젝트를 선택하세요</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>프로젝트별 이슈 목록이 이 영역에 표시됩니다.</Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>새 Jira 이슈 생성</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="이슈 타입"
              value={createIssueType}
              onChange={(event) => setCreateIssueType(event.target.value)}
            >
              <MenuItem value="Task">Task</MenuItem>
              <MenuItem value="Story">Story</MenuItem>
              <MenuItem value="Bug">Bug</MenuItem>
            </TextField>
            <TextField
              required
              label="요약"
              value={createSummary}
              onChange={(event) => setCreateSummary(event.target.value)}
            />
            <TextField
              label="설명"
              multiline
              minRows={4}
              value={createDescription}
              onChange={(event) => setCreateDescription(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={savingIssue}>취소</Button>
          <Button onClick={handleCreateIssue} variant="contained" disabled={savingIssue || !createSummary.trim()}>
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
