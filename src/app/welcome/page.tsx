'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { usePlatformManager } from '../../hooks/usePlatformManager';
import { MOCK_JIRA_URL } from '../../lib/mockJira';

const steps = [
  { label: '플랫폼 선택', description: `연동할 플랫폼 종류를 선택하세요.` },
  { label: '정보 입력', description: '서버 정보와 인증 정보를 입력하세요.' },
  { label: '연결 테스트', description: '입력한 정보로 연결을 테스트합니다.' },
];

export default function WelcomePage() {
  const router = useRouter();
  const { addPlatform } = usePlatformManager();
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [platformType, setPlatformType] = useState<'jira' | 'notion'>('jira');
  const [platformName, setPlatformName] = useState('');
  const [jiraUrl, setJiraUrl] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleConnectTest = async () => {
    setLoading(true);
    setError(null);
    // Mock connection test
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (jiraUrl && username && apiToken) {
      addPlatform({
        type: platformType,
        name: platformName || `${platformType.toUpperCase()} - ${new URL(jiraUrl).hostname}`,
        url: jiraUrl,
        auth: { username, apiToken },
      });
      router.push('/');
    } else {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
    }
  };

  const handleStartDemo = () => {
    addPlatform({
      type: 'jira',
      name: 'Tasker Demo Jira',
      url: MOCK_JIRA_URL,
      auth: { username: 'demo', apiToken: 'demo' },
    });
    router.push('/');
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel id="platform-select-label">플랫폼 타입</InputLabel>
            <Select
              labelId="platform-select-label"
              value={platformType}
              label="플랫폼 타입"
              onChange={(e) => setPlatformType(e.target.value as any)}
            >
              <MenuItem value="jira">Jira</MenuItem>
              <MenuItem value="notion" disabled>Notion (준비 중)</MenuItem>
            </Select>
          </FormControl>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="플랫폼 별칭 (선택)"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              helperText="예: 회사 Jira, 개인 Jira"
            />
            <TextField
              required
              label="Jira 서버 URL"
              value={jiraUrl}
              onChange={(e) => setJiraUrl(e.target.value)}
            />
            <TextField
              required
              label="사용자 아이디 (이메일)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              required
              label="API 토큰"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography>아래 버튼을 눌러 Jira 서버와 연결을 테스트하세요.</Typography>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: { xs: 2, sm: 4 }, p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Tasker 시작하기
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
          첫 번째 작업 플랫폼을 연동하여 생산성을 높여보세요.
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleStartDemo}
          sx={{ mb: 3 }}
        >
          데모 Jira로 바로 시작
        </Button>
        <Alert severity="info" sx={{ mb: 3 }}>
          Vercel 배포본은 mock 확인용입니다. 실제 Jira 크레덴셜은 로컬 실행 또는 이후 Tauri 보안 저장소 흐름에서만 사용하세요.
        </Alert>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography sx={{ mb: 2 }}>{step.description}</Typography>
                <Box sx={{ mb: 2 }}>{getStepContent(index)}</Box>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleConnectTest : handleNext}
                      disabled={loading}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {loading ? <CircularProgress size={24} /> : (index === steps.length - 1 ? '연결 및 완료' : '다음')}
                    </Button>
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      이전
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
}
