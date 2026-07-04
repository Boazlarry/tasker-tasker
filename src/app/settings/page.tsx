'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Checkbox,
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
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../../context/ThemeContext';
import { usePlatformManager, Platform } from '../../hooks/usePlatformManager';
import BrandMark from '../../components/BrandMark';
import {
  defaultWorkspacePreferences,
  jiraMenuKeys,
  readWorkspacePreferences,
  saveWorkspacePreferences,
  type JiraMenuKey,
} from '../../lib/workspacePreferences';
import {
  defaultCustomThemeColors,
  getCustomColorsWithDefaults,
  type CustomThemeColors,
} from '../../styles/theme';

const jiraMenuLabels: Record<JiraMenuKey, string> = {
  projects: '프로젝트',
  team: '팀',
  kanban: '칸반보드',
  search: '이슈 검색',
};

export default function SettingsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setCustomColors, setThemeMode } = useThemeContext();
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
  const [customPrimary, setCustomPrimary] = useState(defaultCustomThemeColors.primary);
  const [customSecondary, setCustomSecondary] = useState(defaultCustomThemeColors.secondary);
  const [customPositive, setCustomPositive] = useState(defaultCustomThemeColors.positive);
  const [customImportant, setCustomImportant] = useState(defaultCustomThemeColors.important);
  const [customError, setCustomError] = useState(defaultCustomThemeColors.error);
  const [customBackground, setCustomBackground] = useState(defaultCustomThemeColors.background);
  const [customSurface, setCustomSurface] = useState(defaultCustomThemeColors.surface);
  const [showSidebar, setShowSidebar] = useState(defaultWorkspacePreferences.showSidebar);
  const [showQuickMenu, setShowQuickMenu] = useState(defaultWorkspacePreferences.showQuickMenu);
  const [enabledJiraMenuKeys, setEnabledJiraMenuKeys] = useState<JiraMenuKey[]>(
    defaultWorkspacePreferences.enabledJiraMenuKeys
  );
  const [appearanceStatus, setAppearanceStatus] = useState('');

  useEffect(() => {
    const colors = getCustomColorsWithDefaults({
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      positive: theme.palette.positive.main,
      important: theme.palette.important.main,
      error: theme.palette.error.main,
      background: theme.palette.background.default,
      surface: theme.palette.background.paper,
    });

    setCustomPrimary(colors.primary);
    setCustomSecondary(colors.secondary);
    setCustomPositive(colors.positive);
    setCustomImportant(colors.important);
    setCustomError(colors.error);
    setCustomBackground(colors.background);
    setCustomSurface(colors.surface);
  }, [
    theme.palette.background.default,
    theme.palette.background.paper,
    theme.palette.error.main,
    theme.palette.important.main,
    theme.palette.positive.main,
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ]);

  useEffect(() => {
    const preferences = readWorkspacePreferences();

    setShowSidebar(preferences.showSidebar);
    setShowQuickMenu(preferences.showQuickMenu);
    setEnabledJiraMenuKeys(preferences.enabledJiraMenuKeys);
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
    const colors: CustomThemeColors = {
      primary: customPrimary,
      secondary: customSecondary,
      positive: customPositive,
      important: customImportant,
      error: customError,
      background: customBackground,
      surface: customSurface,
    };

    setCustomColors(colors);
    setAppearanceStatus('색상 설정을 저장했습니다.');
  };

  const handleToggleJiraMenuKey = (key: JiraMenuKey) => {
    setEnabledJiraMenuKeys((currentKeys) =>
      currentKeys.includes(key)
        ? currentKeys.filter((currentKey) => currentKey !== key)
        : [...currentKeys, key]
    );
  };

  const handleSaveWorkspacePreferences = () => {
    saveWorkspacePreferences({
      showSidebar,
      showQuickMenu,
      enabledJiraMenuKeys,
    });
    setAppearanceStatus('워크스페이스 표시 설정을 저장했습니다.');
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
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {[
              ['메인', customPrimary, setCustomPrimary],
              ['보조', customSecondary, setCustomSecondary],
              ['긍정', customPositive, setCustomPositive],
              ['중요', customImportant, setCustomImportant],
              ['실패', customError, setCustomError],
              ['배경', customBackground, setCustomBackground],
              ['표면', customSurface, setCustomSurface],
            ].map(([label, value, setter]) => (
              <Box key={label as string}>
                <Typography variant="subtitle1">{label as string}</Typography>
                <input
                  type="color"
                  aria-label={`${label as string} 색상`}
                  value={value as string}
                  onChange={(event) => (setter as (nextValue: string) => void)(event.target.value)}
                  style={{ width: '100%', height: '46px', border: 'none', padding: 0, background: 'transparent' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {value as string}
                </Typography>
              </Box>
            ))}
          </Box>
          <Button variant="contained" color="primary" onClick={handleSaveCustomColors} sx={{ mt: 3 }}>
            색상 적용
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="section">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
            <Box sx={{ flex: '1 1 420px' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                워크스페이스 편집
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                사이드바, 플로팅 메뉴, Jira 메뉴 노출을 로컬 설정으로 저장합니다.
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={showSidebar} onChange={(event) => setShowSidebar(event.target.checked)} />}
                  label="데스크톱 사이드바 표시"
                />
                <FormControlLabel
                  control={<Switch checked={showQuickMenu} onChange={(event) => setShowQuickMenu(event.target.checked)} />}
                  label="하단 플로팅 빠른 메뉴 표시"
                />
              </FormGroup>

              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Jira 메뉴 노출</FormLabel>
                <FormGroup row>
                  {jiraMenuKeys.map((key) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={enabledJiraMenuKeys.includes(key)}
                          onChange={() => handleToggleJiraMenuKey(key)}
                        />
                      }
                      label={jiraMenuLabels[key]}
                    />
                  ))}
                </FormGroup>
              </FormControl>

              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleSaveWorkspacePreferences}>
                  레이아웃 저장
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowSidebar(defaultWorkspacePreferences.showSidebar);
                    setShowQuickMenu(defaultWorkspacePreferences.showQuickMenu);
                    setEnabledJiraMenuKeys(defaultWorkspacePreferences.enabledJiraMenuKeys);
                    saveWorkspacePreferences(defaultWorkspacePreferences);
                    setAppearanceStatus('기본 표시 설정으로 되돌렸습니다.');
                  }}
                >
                  기본값
                </Button>
              </Stack>
              {appearanceStatus && (
                <Typography role="status" color="text.secondary" sx={{ mt: 1.5 }}>
                  {appearanceStatus}
                </Typography>
              )}
            </Box>

            <Box
              aria-label="workspace layout preview"
              sx={{
                flex: '1 1 360px',
                minHeight: 260,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: customBackground,
                position: 'relative',
              }}
            >
              <Box sx={{ height: 42, bgcolor: customSurface, borderBottom: '1px solid', borderColor: 'divider', px: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: customPrimary }} />
                <Typography variant="caption" color="text.secondary">Preview</Typography>
              </Box>
              <Box sx={{ display: 'flex', height: 218 }}>
                {showSidebar && (
                  <Box sx={{ width: 96, bgcolor: customSurface, borderRight: '1px solid', borderColor: 'divider', p: 1 }}>
                    {jiraMenuKeys.filter((key) => enabledJiraMenuKeys.includes(key)).map((key) => (
                      <Box key={key} sx={{ height: 18, borderRadius: 0.75, bgcolor: key === 'projects' ? customPrimary : 'action.hover', mb: 1 }} />
                    ))}
                  </Box>
                )}
                <Box sx={{ flex: 1, p: 1.5 }}>
                  <Box sx={{ height: 34, borderRadius: 1, bgcolor: customSurface, mb: 1.5 }} />
                  <Box sx={{ height: 72, borderRadius: 1, bgcolor: customSurface, mb: 1.5 }} />
                  <Box sx={{ height: 72, borderRadius: 1, bgcolor: customSurface }} />
                </Box>
              </Box>
              {showQuickMenu && enabledJiraMenuKeys.length > 0 && (
                <Box sx={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', width: 42, height: 42, borderRadius: '50%', bgcolor: customPrimary, boxShadow: '0 12px 28px rgba(0,0,0,0.24)' }} />
              )}
            </Box>
          </Stack>
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
