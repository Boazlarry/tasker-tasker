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
  Stack,
} from '@mui/material';
import { usePlatformManager } from '../../hooks/usePlatformManager';
import { MOCK_JIRA_URL } from '../../lib/mockJira';
import BrandMark from '../../components/BrandMark';

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
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', p: 2 }}>
      <Container maxWidth="md">
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 4 },
            borderColor: 'divider',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.85fr 1.15fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          <Box>
            <BrandMark />
            <Typography variant="h4" component="h1" sx={{ mt: 4 }}>
              로컬 우선 Jira 워크스페이스
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
              Tasker Tasker는 오래된 Jira 환경도 더 정돈된 작업 콘솔로 다루기 위한 앱입니다. 먼저 demo로 화면 흐름을 확인하거나, 로컬에서 실제 Jira를 연결하세요.
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 3 }}>
              <Button variant="contained" fullWidth onClick={handleStartDemo}>
                데모 Jira로 바로 시작
              </Button>
              <Alert severity="info">
                Vercel 배포본은 mock 확인용입니다. 실제 Jira 크레덴셜은 로컬 실행 또는 이후 Tauri 보안 저장소 흐름에서만 사용하세요.
              </Alert>
            </Stack>
          </Box>

          <Box>
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
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
