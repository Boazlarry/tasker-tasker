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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useThemeContext } from '../../context/ThemeContext';
import { usePlatformManager, Platform } from '../../hooks/usePlatformManager';
import BrandMark from '../../components/BrandMark';

export default function SettingsPage() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeContext();
  const { platforms, addPlatform, updatePlatform, deletePlatform } = usePlatformManager();

  const [openPlatformDialog, setOpenPlatformDialog] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

  // Form state for platform dialog
  const [platformType, setPlatformType] = useState<'jira' | 'notion'>('jira');
  const [platformName, setPlatformName] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');

  // Theme customization state
  const [customPrimary, setCustomPrimary] = useState('');
  const [customSecondary, setCustomSecondary] = useState('');
  const [customPositive, setCustomPositive] = useState('');
  const [customImportant, setCustomImportant] = useState('');
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    // Load custom colors from localStorage or use defaults
    setCustomPrimary(localStorage.getItem('customPrimaryColor') || '#22665b');
    setCustomSecondary(localStorage.getItem('customSecondaryColor') || '#4f658b');
    setCustomPositive(localStorage.getItem('customPositiveColor') || '#2f7d52');
    setCustomImportant(localStorage.getItem('customImportantColor') || '#b7791f');
    setCustomError(localStorage.getItem('customErrorColor') || '#c2413d');
  }, []);

  const handleOpenAddPlatformDialog = () => {
    setEditingPlatform(null);
    setPlatformType('jira');
    setPlatformName('');
    setPlatformUrl('');
    setUsername('');
    setApiToken('');
    setOpenPlatformDialog(true);
  };

  const handleOpenEditPlatformDialog = (platform: Platform) => {
    setEditingPlatform(platform);
    setPlatformType(platform.type);
    setPlatformName(platform.name);
    setPlatformUrl(platform.url);
    setUsername(platform.auth.username || '');
    setApiToken(platform.auth.apiToken || '');
    setOpenPlatformDialog(true);
  };

  const handleClosePlatformDialog = () => {
    setOpenPlatformDialog(false);
  };

  const handleSavePlatform = () => {
    const platformData: Omit<Platform, 'id'> = {
      type: platformType,
      name: platformName || `${platformType.toUpperCase()} - ${new URL(platformUrl).hostname}`,
      url: platformUrl,
      auth: { username, apiToken },
    };

    if (editingPlatform) {
      updatePlatform({ ...platformData, id: editingPlatform.id });
    } else {
      addPlatform(platformData);
    }
    handleClosePlatformDialog();
  };

  const handleSaveCustomColors = () => {
    localStorage.setItem('customPrimaryColor', customPrimary);
    localStorage.setItem('customSecondaryColor', customSecondary);
    localStorage.setItem('customPositiveColor', customPositive);
    localStorage.setItem('customImportantColor', customImportant);
    localStorage.setItem('customErrorColor', customError);
    alert('커스텀 색상이 저장되었습니다. 앱을 새로고침하면 적용됩니다.');
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <BrandMark />
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            워크스페이스로 돌아가기
          </Button>
        </Stack>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderColor: 'divider' }}>
          <Typography variant="h4" component="h1">
            설정
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            로컬 플랫폼 연결과 앱 표시 방식을 관리합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box component="section" sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h5" component="h2">
                  플랫폼 관리
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  크레덴셜은 이 브라우저의 로컬 저장소에만 저장됩니다.
                </Typography>
              </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddPlatformDialog}
          >
            새 플랫폼 추가
          </Button>
            </Stack>
          <List component={Paper} variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
            {platforms.length === 0 ? (
              <ListItem>
                <ListItemText primary="등록된 플랫폼이 없습니다." />
              </ListItem>
            ) : (
              platforms.map((platform) => (
                <ListItem key={platform.id} divider>
                  <ListItemText
                    primary={platform.name}
                    secondary={`${platform.type.toUpperCase()} - ${platform.url}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditPlatformDialog(platform)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => deletePlatform(platform.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
          </Box>

        <Divider sx={{ my: 3 }} />

        {/* Theme Settings */}
        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            테마 설정
          </Typography>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
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

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            커스텀 색상
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1">메인 색상 (Primary)</Typography>
              <input
                type="color"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                style={{ width: '100%', height: '50px', border: 'none', padding: 0 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1">보조 색상 (Secondary)</Typography>
              <input
                type="color"
                value={customSecondary}
                onChange={(e) => setCustomSecondary(e.target.value)}
                style={{ width: '100%', height: '50px', border: 'none', padding: 0 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1">긍정 (Positive)</Typography>
              <input
                type="color"
                value={customPositive}
                onChange={(e) => setCustomPositive(e.target.value)}
                style={{ width: '100%', height: '50px', border: 'none', padding: 0 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1">중요 (Important)</Typography>
              <input
                type="color"
                value={customImportant}
                onChange={(e) => setCustomImportant(e.target.value)}
                style={{ width: '100%', height: '50px', border: 'none', padding: 0 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1">실패 (Error)</Typography>
              <input
                type="color"
                value={customError}
                onChange={(e) => setCustomError(e.target.value)}
                style={{ width: '100%', height: '50px', border: 'none', padding: 0 }}
              />
            </Box>
          </Box>
          <Button variant="contained" color="primary" onClick={handleSaveCustomColors} sx={{ mt: 3 }}>
            커스텀 색상 저장
          </Button>
        </Box>
        </Paper>
      </Container>

      {/* Platform Add/Edit Dialog */}
      <Dialog open={openPlatformDialog} onClose={handleClosePlatformDialog}>
        <DialogTitle>{editingPlatform ? '플랫폼 수정' : '새 플랫폼 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="platform-type-label">플랫폼 타입</InputLabel>
              <Select
                labelId="platform-type-label"
                value={platformType}
                label="플랫폼 타입"
                onChange={(e) => setPlatformType(e.target.value as any)}
                disabled={!!editingPlatform} // Cannot change type when editing
              >
                <MenuItem value="jira">Jira</MenuItem>
                <MenuItem value="notion" disabled>Notion (준비 중)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="플랫폼 별칭 (선택)"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              helperText="예: 회사 Jira, 개인 Jira"
            />
            <TextField
              required
              label="Jira 서버 URL"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlatformDialog}>취소</Button>
          <Button onClick={handleSavePlatform} variant="contained">
            {editingPlatform ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
