'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Container,
  Skeleton,
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Avatar,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';
import { createBasicAuthHeader } from '../lib/jiraAuth';

const drawerWidth = 280;

// Type definitions
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
  onOpenContentTab: (type: 'jira-project-list' | 'jira-issue-detail', key: string, platform: Platform, title: string) => void;
}

export default function JiraPlatformView({ jiraPlatform, onOpenContentTab }: JiraPlatformViewProps) {
  const theme = useTheme();

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

  const handleProjectClick = useCallback(async (projectKey: string) => {
    setSelectedProject(projectKey);
    localStorage.setItem('lastSelectedProject', projectKey);
    setLoadingIssues(true);
    setIssues([]);
    setError(null);

    const authorization = createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken);

    try {
      const response = await axios.get(
        `/api/jira/issues?projectKey=${projectKey}`,
        {
          headers: {
            Authorization: authorization,
            'X-Jira-Url': jiraPlatform.url,
          },
        }
      );
      setIssues(response.data.issues);
    } catch (err) {
      setError(`'${projectKey}' 프로젝트의 이슈를 불러오는 데 실패했습니다.`);
    }
    setLoadingIssues(false);
  }, [jiraPlatform]);

  useEffect(() => {
    const fetchProjects = async () => {
      const authorization = createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken);

      try {
        const response = await axios.get('/api/jira/projects', {
          headers: {
            Authorization: authorization,
            'X-Jira-Url': jiraPlatform.url,
          },
        });
        const fetchedProjects: Project[] = response.data;
        setProjects(fetchedProjects);

        const lastSelectedProject = localStorage.getItem('lastSelectedProject');
        if (lastSelectedProject && fetchedProjects.some(p => p.key === lastSelectedProject)) {
          handleProjectClick(lastSelectedProject);
        }

      } catch (err) {
        setError('프로젝트를 불러오는 데 실패했습니다.');
      }
      setLoadingProjects(false);
    };

    fetchProjects();
  }, [jiraPlatform, handleProjectClick]);

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
            Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
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

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
            top: '64px', // Below AppBar
            height: 'calc(100% - 64px)', // Adjust height
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {jiraPlatform.name}
          </Typography>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          {loadingProjects ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, index) => <Skeleton key={index} height={40} sx={{ my: 1 }}/>)}
            </Box>
          ) : (
            <List>
              {projects.map((project) => (
                <ListItem key={project.id} disablePadding>
                  <ListItemButton
                    selected={selectedProject === project.key}
                    onClick={() => handleProjectClick(project.key)}
                    sx={{ 
                      m: 1, borderRadius: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        ':hover': {
                          bgcolor: 'primary.dark'
                        }
                      }
                    }}
                  >
                    <ListItemText primary={project.name} secondary={project.key} primaryTypographyProps={{ fontWeight: 'medium' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
      <Container maxWidth="xl" component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {selectedProject ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {selectedProject} 이슈 목록
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              이슈 생성
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Paper sx={{ p: 2, mt: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="issues table">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>키</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>요약</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>타입</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>상태</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>보고자</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingIssues ? (
                      [...Array(10)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      issues.map((issue) => (
                        <TableRow
                          key={issue.key}
                          onClick={() => handleIssueClick(issue)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <TableCell sx={{ color: 'secondary.main', fontWeight: 'medium' }}>{issue.key}</TableCell>
                          <TableCell>{issue.fields.summary}</TableCell>
                          <TableCell>
                            <Chip 
                              avatar={<Avatar src={issue.fields.issuetype.iconUrl} alt={issue.fields.issuetype.name} sx={{ width: 16, height: 16 }} />} 
                              label={issue.fields.issuetype.name} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={issue.fields.status.name} size="small" color="positive" />
                          </TableCell>
                          <TableCell>{issue.fields.reporter.displayName}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <InboxIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
            <Typography variant="h5" sx={{ color: 'text.secondary', mt: 2 }}>
              프로젝트를 선택해주세요.
            </Typography>
            <Typography sx={{ color: 'text.disabled' }}>
              왼쪽 사이드바에서 프로젝트를 선택하면 이슈 목록이 표시됩니다.
            </Typography>
          </Box>
        )}
      </Container>
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>새 Jira 이슈 생성</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
          </Box>
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
