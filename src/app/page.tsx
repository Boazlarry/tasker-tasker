'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Modal,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
  Chip,
  Alert,
  Container,
  Skeleton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InboxIcon from '@mui/icons-material/Inbox';
import axios from 'axios';

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

interface IssueDetail extends Issue {
  renderedFields: {
    description: string;
  };
  changelog: {
    histories: any[];
  };
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', md: '70vw' },
  maxHeight: '85vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
};

export default function JiraPage() {
  const router = useRouter();
  const theme = useTheme();
  const [authChecked, setAuthChecked] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedIssue, setSelectedIssue] = useState<IssueDetail | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const handleProjectClick = useCallback(async (projectKey: string) => {
    setSelectedProject(projectKey);
    localStorage.setItem('lastSelectedProject', projectKey);
    setLoadingIssues(true);
    setIssues([]);
    setError(null);

    const jiraUrl = localStorage.getItem('jiraUrl');
    const username = localStorage.getItem('username');
    const apiToken = localStorage.getItem('apiToken');
    const token = Buffer.from(`${username}:${apiToken}`).toString('base64');

    try {
      const response = await axios.get(
        `/api/jira/issues?projectKey=${projectKey}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            'X-Jira-Url': jiraUrl,
          },
        }
      );
      setIssues(response.data.issues);
    } catch (err) {
      setError(`'${projectKey}' 프로젝트의 이슈를 불러오는 데 실패했습니다.`);
    }
    setLoadingIssues(false);
  }, []);

  useEffect(() => {
    const jiraUrl = localStorage.getItem('jiraUrl');
    const username = localStorage.getItem('username');
    const apiToken = localStorage.getItem('apiToken');

    if (!jiraUrl || !username || !apiToken) {
      router.push('/settings');
      return;
    }

    setAuthChecked(true);

    const fetchProjects = async () => {
      const token = Buffer.from(`${username}:${apiToken}`).toString('base64');

      try {
        const response = await axios.get('/api/jira/projects', {
          headers: {
            Authorization: `Basic ${token}`,
            'X-Jira-Url': jiraUrl,
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
  }, [router, handleProjectClick]);

  const handleIssueClick = async (issueKey: string) => {
    setModalOpen(true);
    setLoadingModal(true);

    const jiraUrl = localStorage.getItem('jiraUrl');
    const username = localStorage.getItem('username');
    const apiToken = localStorage.getItem('apiToken');
    const token = Buffer.from(`${username}:${apiToken}`).toString('base64');

    try {
      const response = await axios.get(`/api/jira/issue/${issueKey}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
          'X-Jira-Url': jiraUrl,
        },
      });
      setSelectedIssue(response.data);
    } catch (err) {
      setError(`이슈 ${issueKey} 정보를 가져오는 데 실패했습니다.`);
    }
    setLoadingModal(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedIssue(null);
  };

  if (!authChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Tasker - Jira
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
                          onClick={() => handleIssueClick(issue.key)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <TableCell sx={{ color: 'secondary.main', fontWeight: 'medium' }}>{issue.key}</TableCell>
                          <TableCell>{issue.fields.summary}</TableCell>
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

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Card sx={modalStyle}>
          {loadingModal ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : selectedIssue ? (
            <>
              <CardHeader
                title={`[${selectedIssue.key}] ${selectedIssue.fields.summary}`}
                titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
                subheader={<Chip label={selectedIssue.fields.status.name} color="important" size="small" sx={{ mt: 1 }} />}
                action={
                  <IconButton onClick={handleCloseModal}>
                    <CloseIcon />
                  </IconButton>
                }
                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>설명</Typography>
                <Paper variant="outlined" sx={{ p: 2, my: 2, bgcolor: 'action.hover', maxHeight: 300, overflowY: 'auto' }}>
                  <Box dangerouslySetInnerHTML={{ __html: selectedIssue.renderedFields.description }} />
                </Paper>

                <Typography variant="h6" gutterBottom>댓글</Typography>
                <Divider sx={{ my: 1 }} />
                {selectedIssue.changelog.histories.length > 0 ? (
                  <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {selectedIssue.changelog.histories.map((history) =>
                      history.items.map((item: any) =>
                        item.field === 'comment' ? (
                          <ListItem key={history.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{history.author.displayName}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.toString}</Typography>
                          </ListItem>
                        ) : null
                      )
                    )}
                  </List>
                ) : (
                  <Typography sx={{ color: 'text.secondary', mt: 2 }}>댓글이 없습니다.</Typography>
                )}
              </CardContent>
            </>
          ) : (
            <Alert severity="error">이슈 정보를 불러오는 데 실패했습니다.</Alert>
          )}
        </Card>
      </Modal>
    </Box>
  );
}
