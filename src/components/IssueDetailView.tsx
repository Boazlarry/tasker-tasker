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
  ListItemText,
  Paper,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Platform } from '../hooks/usePlatformManager';

interface IssueDetail {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: { name: string; iconUrl: string };
    reporter: { displayName: string };
    status: { name: string };
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

  useEffect(() => {
    const fetchIssueDetail = async () => {
      setLoading(true);
      setError(null);

      const token = Buffer.from(`${jiraPlatform.auth.username}:${jiraPlatform.auth.apiToken}`).toString('base64');

      try {
        const response = await axios.get(`/api/jira/issue/${issueKey}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
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
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            }
            sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
          />
          <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
        <Alert severity="error">{error || '이슈 정보를 불러오는 데 실패했습니다.'}</Alert>
      )}
    </Card>
  );
}
