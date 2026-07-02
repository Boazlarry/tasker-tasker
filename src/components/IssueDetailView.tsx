'use client';

import { useState, useEffect } from 'react';
import {
  Alert,
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
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';
import { createBasicAuthHeader } from '../lib/jiraAuth';

interface IssueDetail {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    issuetype: { name: string; iconUrl: string };
    reporter: { displayName: string };
    status: { name: string };
    comment?: {
      comments: Array<{
        id: string;
        author: { displayName: string };
        body: string;
        created: string;
      }>;
    };
  };
  renderedFields: {
    description: string;
  };
  changelog: {
    histories: any[];
  };
}

interface IssueDetailViewProps {
  issueKey: string;
  jiraPlatform: Platform;
  onClose: () => void;
}

export default function IssueDetailView({ issueKey, jiraPlatform, onClose }: IssueDetailViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchIssueDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/jira/issue/${issueKey}`, {
          headers: {
            Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
            'X-Jira-Url': jiraPlatform.url,
          },
        });
        setSelectedIssue(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || `이슈 ${issueKey} 정보를 가져오는 데 실패했습니다.`);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetail();
  }, [issueKey, jiraPlatform]);

  const handleOpenEditDialog = () => {
    if (!selectedIssue) return;

    setEditSummary(selectedIssue.fields.summary);
    setEditDescription(selectedIssue.fields.description || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedIssue || !editSummary.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const response = await axios.put(
        `/api/jira/issue/${issueKey}`,
        {
          summary: editSummary.trim(),
          description: editDescription,
        },
        {
          headers: {
            Authorization: createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken),
            'X-Jira-Url': jiraPlatform.url,
          },
        }
      );

      setSelectedIssue(response.data);
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || `이슈 ${issueKey} 수정에 실패했습니다.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ minHeight: 360, display: 'grid', placeItems: 'center', borderColor: 'divider' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (!selectedIssue) {
    return <Alert severity="error">{error || '이슈 정보를 불러오는 데 실패했습니다.'}</Alert>;
  }

  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider', overflow: 'hidden' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Chip label={selectedIssue.key} color="secondary" size="small" />
            <Chip label={selectedIssue.fields.status.name} color="important" size="small" />
          </Stack>
          <Typography variant="h5">{selectedIssue.fields.summary}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {jiraPlatform.name} / {selectedIssue.fields.reporter.displayName}
          </Typography>
        </Box>
        <IconButton onClick={handleOpenEditDialog} aria-label="edit issue">
          <EditIcon />
        </IconButton>
        <IconButton onClick={onClose} aria-label="close issue">
          <CloseIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

      <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.2fr) minmax(340px, 0.8fr)' }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
          <Typography variant="h6">설명</Typography>
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{
              color: 'text.primary',
              '& p': { mt: 0, mb: 1.25 },
              '& strong': { fontWeight: 800 },
            }}
            dangerouslySetInnerHTML={{ __html: selectedIssue.renderedFields?.description || '<p>설명이 없습니다.</p>' }}
          />
        </Paper>

        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Typography variant="h6">댓글 원천</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Jira comments
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            {selectedIssue.fields.comment?.comments?.length ? (
              <List disablePadding>
                {selectedIssue.fields.comment.comments.map((comment) => (
                  <ListItem key={comment.id} disableGutters sx={{ alignItems: 'flex-start', flexDirection: 'column', py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{comment.author.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">{comment.body}</Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">Jira comment 원천의 댓글이 없습니다.</Typography>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Typography variant="h6">활동 원천</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Jira changelog
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            {selectedIssue.changelog.histories.length > 0 ? (
              <List disablePadding>
                {selectedIssue.changelog.histories.map((history) =>
                  history.items.map((item: any, index: number) => (
                    <ListItem key={`${history.id}-${index}`} disableGutters sx={{ alignItems: 'flex-start', flexDirection: 'column', py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{history.author.displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.field}: {item.fromString || '-'} → {item.toString || '-'}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
            ) : (
              <Typography color="text.secondary">Jira changelog 원천의 활동이 없습니다.</Typography>
            )}
          </Paper>
        </Stack>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Jira 이슈 편집</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              label="요약"
              value={editSummary}
              onChange={(event) => setEditSummary(event.target.value)}
            />
            <TextField
              label="설명"
              multiline
              minRows={5}
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>취소</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving || !editSummary.trim()}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
