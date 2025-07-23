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
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';

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

  const handleProjectClick = useCallback(async (projectKey: string) => {
    setSelectedProject(projectKey);
    localStorage.setItem('lastSelectedProject', projectKey);
    setLoadingIssues(true);
    setIssues([]);
    setError(null);

    const token = Buffer.from(`${jiraPlatform.auth.username}:${jiraPlatform.auth.apiToken}`).toString('base64');

    try {
      const response = await axios.get(
        `/api/jira/issues?projectKey=${projectKey}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
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
      const token = Buffer.from(`${jiraPlatform.auth.username}:${jiraPlatform.auth.apiToken}`).toString('base64');

      try {
        const response = await axios.get('/api/jira/projects', {
          headers: {
            Authorization: `Basic ${token}`,
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
                          <TableCell>
                            <Chip 
                              avatar={<img src={issue.fields.issuetype.iconUrl} alt={issue.fields.issuetype.name} width={16} height={16} />} 
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
    </Box>
  );
}
