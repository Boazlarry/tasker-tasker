'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  Paper,
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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
  const theme = useTheme();
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

      const authorization = createBasicAuthHeader(jiraPlatform.auth.username, jiraPlatform.auth.apiToken);

      try {
        const response = await axios.get(`/api/jira/issue/${issueKey}`,
        {
          headers: {
            Authorization: authorization,
            'X-Jira-Url': jiraPlatform.url,
          },
        });
        setSelectedIssue(response.data);
      } catch (err) {
        setError(`이슈 ${issueKey} 정보를 가져오는 데 실패했습니다.`);
      }
      setLoading(false);
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

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : selectedIssue ? (
        <>
          <CardHeader
            title={`[${selectedIssue.key}] ${selectedIssue.fields.summary}`}
            titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
            subheader={<Chip label={selectedIssue.fields.status.name} color="important" size="small" sx={{ mt: 1 }} />}
            action={
              <Box>
                <IconButton onClick={handleOpenEditDialog} aria-label="edit issue">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={onClose} aria-label="close issue">
                  <CloseIcon />
                </IconButton>
              </Box>
            }
            sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
          />
          <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>설명</Typography>
            <Paper variant="outlined" sx={{ p: 2, my: 2, bgcolor: 'action.hover', maxHeight: 300, overflowY: 'auto' }}>
              <Box dangerouslySetInnerHTML={{ __html: selectedIssue.renderedFields.description }} />
            </Paper>

            <Typography variant="h6" gutterBottom>댓글 원천: Jira comments</Typography>
            <Divider sx={{ my: 1 }} />
            {selectedIssue.fields.comment?.comments?.length ? (
              <List sx={{ maxHeight: 220, overflowY: 'auto' }}>
                {selectedIssue.fields.comment.comments.map((comment) => (
                  <ListItem key={comment.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{comment.author.displayName}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{comment.body}</Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>Jira comment 원천의 댓글이 없습니다.</Typography>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>활동 원천: Jira changelog</Typography>
            <Divider sx={{ my: 1 }} />
            {selectedIssue.changelog.histories.length > 0 ? (
              <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {selectedIssue.changelog.histories.map((history) =>
                  history.items.map((item: any, index: number) => (
                    <ListItem key={`${history.id}-${index}`} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{history.author.displayName}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.field}: {item.fromString || '-'} → {item.toString || '-'}
                      </Typography>
                    </ListItem>
                  )
                  )
                )}
              </List>
            ) : (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>Jira changelog 원천의 활동이 없습니다.</Typography>
            )}
          </CardContent>
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Jira 이슈 편집</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>취소</Button>
              <Button onClick={handleSaveEdit} variant="contained" disabled={saving || !editSummary.trim()}>
                저장
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Alert severity="error">{error || '이슈 정보를 불러오는 데 실패했습니다.'}</Alert>
      )}
    </Card>
  );
}
