'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Container,
  Divider,
} from '@mui/material';
import { useThemeContext } from '../../context/ThemeContext';

export default function SettingsPage() {
  const { themeMode, setThemeMode } = useThemeContext();
  const [jiraUrl, setJiraUrl] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');

  useEffect(() => {
    const storedUrl = localStorage.getItem('jiraUrl');
    const storedUser = localStorage.getItem('username');
    const storedToken = localStorage.getItem('apiToken');
    if (storedUrl) setJiraUrl(storedUrl);
    if (storedUser) setUsername(storedUser);
    if (storedToken) setApiToken(storedToken);
  }, []);

  const handleSave = () => {
    localStorage.setItem('jiraUrl', jiraUrl);
    localStorage.setItem('username', username);
    localStorage.setItem('apiToken', apiToken);
    alert('Jira 설정이 저장되었습니다.');
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ mt: 4, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          설정
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Theme Settings */}
        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            테마 설정
          </Typography>
          <FormControl component="fieldset">
            <FormLabel component="legend">모드</FormLabel>
            <RadioGroup
              row
              aria-label="theme mode"
              name="theme-mode"
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as any)}
            >
              <FormControlLabel value="light" control={<Radio />} label="라이트" />
              <FormControlLabel value="dark" control={<Radio />} label="다크" />
              <FormControlLabel value="system" control={<Radio />} label="시스템 기본" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Jira Settings */}
        <Box component="section">
          <Typography variant="h5" component="h2" gutterBottom>
            Jira 연동 설정
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Jira 서버 URL (e.g., https://your-domain.atlassian.net)"
              variant="outlined"
              value={jiraUrl}
              onChange={(e) => setJiraUrl(e.target.value)}
            />
            <TextField
              label="사용자 아이디 (이메일)"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="API 토큰"
              type="password"
              variant="outlined"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              helperText="Jira에서 생성한 API 토큰을 입력하세요."
            />
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 1 }}>
              Jira 설정 저장
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
