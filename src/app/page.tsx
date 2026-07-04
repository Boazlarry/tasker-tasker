'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  useTheme,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Fab,
  Paper,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AppsIcon from '@mui/icons-material/Apps';
import BrandMark from '../components/BrandMark';
import { usePlatformManager, Platform } from '../hooks/usePlatformManager';
import JiraPlatformView from '../components/JiraPlatformView';
import IssueDetailView from '../components/IssueDetailView';
import JiraTeamView from '../components/JiraTeamView';
import JiraKanbanView from '../components/JiraKanbanView';
import JiraIssueSearchView from '../components/JiraIssueSearchView';

const sidebarWidth = 272;

interface ContentTab {
  id: string;
  type: 'jira-project-list' | 'jira-issue-detail' | 'jira-team' | 'jira-kanban' | 'jira-issue-search';
  title: string;
  platformId: string;
  data?: { key?: string };
}

interface WorkspaceHistoryState {
  taskerTaskerWorkspace: true;
  activeContentTabId: string | null;
  selectedPlatformId: string | null;
}

const jiraNavItems: Array<{
  type: ContentTab['type'];
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  surface: string;
}> = [
  {
    type: 'jira-project-list',
    key: 'projects',
    label: '프로젝트',
    description: '프로젝트별 이슈',
    icon: <FolderOutlinedIcon fontSize="small" />,
    accent: '#65d3c4',
    surface: 'rgba(101, 211, 196, 0.18)',
  },
  {
    type: 'jira-team',
    key: 'team',
    label: '팀',
    description: '담당자와 보고자',
    icon: <GroupsOutlinedIcon fontSize="small" />,
    accent: '#9ebcff',
    surface: 'rgba(158, 188, 255, 0.17)',
  },
  {
    type: 'jira-kanban',
    key: 'kanban',
    label: '칸반보드',
    description: '상태별 흐름',
    icon: <ViewKanbanOutlinedIcon fontSize="small" />,
    accent: '#e1a640',
    surface: 'rgba(225, 166, 64, 0.17)',
  },
  {
    type: 'jira-issue-search',
    key: 'search',
    label: '이슈 검색',
    description: '전체 검색',
    icon: <SearchOutlinedIcon fontSize="small" />,
    accent: '#ff7a8f',
    surface: 'rgba(255, 122, 143, 0.16)',
  },
];

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const { platforms, loading: platformsLoading } = usePlatformManager();

  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [contentTabs, setContentTabs] = useState<ContentTab[]>([]);
  const [activeContentTabId, setActiveContentTabId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const historyReadyRef = useRef(false);
  const restoringHistoryRef = useRef(false);
  const lastHistoryStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!platformsLoading) {
      if (platforms.length === 0) {
        router.push('/welcome');
      } else if (!selectedPlatformId || !platforms.some((platform) => platform.id === selectedPlatformId)) {
        setSelectedPlatformId(platforms[0].id);
      }
    }
  }, [platformsLoading, platforms, router, selectedPlatformId]);

  useEffect(() => {
    if (platformsLoading || platforms.length === 0 || !selectedPlatformId) {
      return;
    }

    const historyState: WorkspaceHistoryState = {
      taskerTaskerWorkspace: true,
      activeContentTabId,
      selectedPlatformId,
    };
    const serializedState = JSON.stringify(historyState);

    if (!historyReadyRef.current) {
      window.history.replaceState(historyState, '', window.location.href);
      historyReadyRef.current = true;
      lastHistoryStateRef.current = serializedState;
      return;
    }

    if (restoringHistoryRef.current) {
      restoringHistoryRef.current = false;
      lastHistoryStateRef.current = serializedState;
      return;
    }

    if (lastHistoryStateRef.current !== serializedState) {
      window.history.pushState(historyState, '', window.location.href);
      lastHistoryStateRef.current = serializedState;
    }
  }, [activeContentTabId, platforms.length, platformsLoading, selectedPlatformId]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as Partial<WorkspaceHistoryState> | null;

      if (!state?.taskerTaskerWorkspace) {
        return;
      }

      const nextPlatformId =
        state.selectedPlatformId && platforms.some((platform) => platform.id === state.selectedPlatformId)
          ? state.selectedPlatformId
          : platforms[0]?.id || null;
      const nextActiveContentTabId =
        state.activeContentTabId &&
        contentTabs.some((tab) => tab.id === state.activeContentTabId && tab.platformId === nextPlatformId)
          ? state.activeContentTabId
          : null;

      restoringHistoryRef.current = true;
      setSelectedPlatformId(nextPlatformId);
      setActiveContentTabId(nextActiveContentTabId);
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [contentTabs, platforms]);

  const handleOpenContentTab = useCallback((type: ContentTab['type'], key: string, platform: Platform, title: string) => {
    const newTabId = `${platform.id}-${type}-${key}`;
    const existingTab = contentTabs.find((tab) => tab.id === newTabId);

    if (existingTab) {
      setActiveContentTabId(newTabId);
      return;
    }

    const newTab: ContentTab = {
      id: newTabId,
      type,
      title,
      platformId: platform.id,
      data: { key },
    };

    setContentTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveContentTabId(newTabId);
  }, [contentTabs]);

  const handleCloseContentTab = useCallback((tabId: string) => {
    setContentTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return prevTabs;

      const updatedTabs = prevTabs.filter((tab) => tab.id !== tabId);

      if (activeContentTabId === tabId) {
        if (updatedTabs.length > 0) {
          const newActiveIndex = tabIndex === 0 ? 0 : tabIndex - 1;
          setActiveContentTabId(updatedTabs[newActiveIndex].id);
        } else {
          setActiveContentTabId(null);
        }
      }

      return updatedTabs;
    });
  }, [activeContentTabId]);

  const handlePlatformMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatformId(platformId);
    const firstTabOfPlatform = contentTabs.find((tab) => tab.platformId === platformId);
    setActiveContentTabId(firstTabOfPlatform?.id || null);
    setAnchorEl(null);
  };

  const handleQuickMenuBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setQuickMenuOpen(false);
    }
  };

  if (platformsLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (platforms.length === 0) {
    return null;
  }

  const currentPlatform = platforms.find((platform) => platform.id === selectedPlatformId) || platforms[0];
  const activeTab = contentTabs.find((tab) => tab.id === activeContentTabId);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        height: '100dvh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        component="header"
        sx={{
          minHeight: 64,
          height: { xs: 'auto', md: 64 },
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1, md: 0 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(90deg, rgba(101, 211, 196, 0.10), rgba(158, 188, 255, 0.08) 52%, rgba(225, 166, 64, 0.06))',
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: { xs: 'auto', md: sidebarWidth - 24 }, flexShrink: 0, flexGrow: { xs: 1, md: 0 } }}>
          <BrandMark />
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          endIcon={<ExpandMoreIcon />}
          onClick={handlePlatformMenuOpen}
          sx={{
            minWidth: { xs: 0, sm: 220 },
            maxWidth: { xs: 'calc(100% - 56px)', md: 280 },
            flexGrow: { xs: 1, md: 0 },
            justifyContent: 'space-between',
          }}
        >
          {currentPlatform.name}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {platforms.map((platform) => (
            <MenuItem key={platform.id} selected={platform.id === currentPlatform.id} onClick={() => handlePlatformSelect(platform.id)}>
              {platform.name}
            </MenuItem>
          ))}
        </Menu>
        <Chip label={currentPlatform.type.toUpperCase()} size="small" variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="text" startIcon={<AddIcon />} onClick={() => router.push('/welcome')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          플랫폼 추가
        </Button>
        <IconButton aria-label="플랫폼 추가" onClick={() => router.push('/welcome')} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          <AddIcon />
        </IconButton>
        <IconButton aria-label="settings" onClick={() => router.push('/settings')}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', minHeight: 0, flexGrow: 1, overflow: 'hidden' }}>
        <Box
          component="aside"
          className="tasker-scrollbar"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            p: 2,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 2,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              Workspace
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {currentPlatform.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              로컬 저장 기반의 작업 콘솔
            </Typography>
          </Box>
          <Divider />
          {currentPlatform.type === 'jira' && (
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {jiraNavItems.map((item) => {
                const selected = activeTab?.platformId === currentPlatform.id && activeTab.type === item.type;

                return (
                  <ListItemButton
                    key={item.key}
                    selected={selected}
                    onClick={() => handleOpenContentTab(item.type, item.key, currentPlatform, `${currentPlatform.name} ${item.label}`)}
                    sx={{
                      borderRadius: 1,
                      minHeight: 58,
                      alignItems: 'flex-start',
                      border: '1px solid transparent',
                      transition: 'transform 160ms ease, background-color 160ms ease, border-color 160ms ease',
                      '&:hover': {
                        transform: 'translateX(2px)',
                        borderColor: item.accent,
                        bgcolor: item.surface,
                      },
                      '&.Mui-selected': {
                        bgcolor: item.surface,
                        color: item.accent,
                        borderColor: item.accent,
                        '&:hover': { bgcolor: item.surface },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 34, mt: 0.25 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        <Box
          component="main"
          sx={{
            minWidth: 0,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1.5, md: 2.5 },
            gap: 1.5,
            overflow: 'hidden',
            pb: { xs: 1, md: 2 },
          }}
        >
          {contentTabs.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                flexShrink: 0,
                overflow: 'hidden',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                animation: 'tasker-rise-in 220ms ease-out',
              }}
            >
              <Box
                role="tablist"
                aria-label="content tabs"
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  minHeight: 44,
                  overflowX: 'auto',
                  p: 0.5,
                }}
              >
                {contentTabs.map((tab) => (
                  <Box
                    key={tab.id}
                    role="tab"
                    aria-selected={activeContentTabId === tab.id}
                    tabIndex={0}
                    onClick={() => setActiveContentTabId(tab.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActiveContentTabId(tab.id);
                      }
                    }}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      maxWidth: 260,
                      minHeight: 36,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      flex: '0 0 auto',
                      cursor: 'pointer',
                      bgcolor: activeContentTabId === tab.id ? 'rgba(101, 211, 196, 0.14)' : 'transparent',
                      color: activeContentTabId === tab.id ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        bgcolor: activeContentTabId === tab.id ? 'rgba(101, 211, 196, 0.2)' : 'action.hover',
                      },
                    }}
                  >
                    <Typography component="span" noWrap sx={{ fontSize: 13, fontWeight: 750, color: 'inherit' }}>
                      {tab.title}
                    </Typography>
                    <IconButton
                      aria-label={`close ${tab.title}`}
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCloseContentTab(tab.id);
                      }}
                      sx={{ width: 24, height: 24, color: 'inherit' }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          <Box
            className="tasker-scrollbar"
            sx={{
              minHeight: 0,
              flexGrow: 1,
              overflow: 'auto',
              pb: { xs: 9, md: 3 },
              pr: { xs: 0, md: 0.5 },
            }}
          >
            {!activeContentTabId && (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 3, md: 4 },
                  minHeight: 360,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderColor: 'divider',
                  backgroundImage: 'linear-gradient(135deg, rgba(101, 211, 196, 0.12), transparent 44%, rgba(225, 166, 64, 0.10))',
                  animation: 'tasker-rise-in 260ms ease-out',
                }}
              >
                <Typography variant="h4">작업할 뷰를 선택하세요</Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 620 }}>
                  왼쪽 내비게이션에서 프로젝트, 팀, 칸반보드, 이슈 검색을 열 수 있습니다. 각 뷰는 탭으로 유지됩니다.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
                  {jiraNavItems.map((item) => (
                    <Button
                      key={item.key}
                      variant="outlined"
                      startIcon={item.icon}
                      onClick={() => handleOpenContentTab(item.type, item.key, currentPlatform, `${currentPlatform.name} ${item.label}`)}
                      sx={{
                        borderColor: item.accent,
                        color: item.accent,
                        bgcolor: item.surface,
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>
              </Paper>
            )}

            {activeContentTabId && contentTabs.map((tab) => (
              <Box key={tab.id} sx={{ display: activeContentTabId === tab.id ? 'block' : 'none', minHeight: '100%' }}>
                {tab.type === 'jira-project-list' && currentPlatform && (
                  <JiraPlatformView jiraPlatform={currentPlatform} onOpenContentTab={handleOpenContentTab} />
                )}
                {tab.type === 'jira-issue-detail' && currentPlatform && tab.data?.key && (
                  <IssueDetailView issueKey={tab.data.key} jiraPlatform={currentPlatform} onClose={() => handleCloseContentTab(tab.id)} />
                )}
                {tab.type === 'jira-team' && currentPlatform && (
                  <JiraTeamView jiraPlatform={currentPlatform} />
                )}
                {tab.type === 'jira-kanban' && currentPlatform && (
                  <JiraKanbanView jiraPlatform={currentPlatform} />
                )}
                {tab.type === 'jira-issue-search' && currentPlatform && (
                  <JiraIssueSearchView jiraPlatform={currentPlatform} />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {currentPlatform.type === 'jira' && (
        <Box
          component="nav"
          aria-label="빠른 보기 이동"
          data-open={quickMenuOpen ? 'true' : undefined}
          onMouseEnter={() => setQuickMenuOpen(true)}
          onMouseLeave={() => setQuickMenuOpen(false)}
          onFocus={() => setQuickMenuOpen(true)}
          onBlur={handleQuickMenuBlur}
          sx={{
            position: 'fixed',
            left: '50%',
            bottom: { xs: 14, md: 18 },
            transform: 'translateX(-50%)',
            zIndex: theme.zIndex.appBar + 1,
            width: 96,
            height: 72,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            transition: 'height 180ms ease',
            '&:hover, &:focus-within, &[data-open="true"]': {
              height: 296,
            },
            '&:hover .quick-action, &:focus-within .quick-action, &[data-open="true"] .quick-action': {
              opacity: 1,
              pointerEvents: 'auto',
              transform: 'translate(-50%, 0) scale(1)',
            },
          }}
        >
          <Box sx={{ position: 'relative', width: 72, height: '100%', pointerEvents: 'auto' }}>
            {jiraNavItems.map((item, index) => {
              const selected = activeTab?.platformId === currentPlatform.id && activeTab.type === item.type;

              return (
                <Tooltip key={item.key} title={`${item.label} - ${item.description}`} placement="left" arrow>
                  <Fab
                    className="quick-action"
                    size="small"
                    aria-label={item.description}
                    aria-pressed={selected}
                    onClick={() => {
                      handleOpenContentTab(item.type, item.key, currentPlatform, `${currentPlatform.name} ${item.label}`);
                      setQuickMenuOpen(false);
                    }}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: 78 + index * 52,
                      width: 42,
                      height: 42,
                      minHeight: 42,
                      color: selected ? '#10201d' : 'text.primary',
                      bgcolor: selected ? item.accent : 'background.paper',
                      border: '1px solid',
                      borderColor: selected ? item.accent : 'divider',
                      boxShadow: selected ? `0 12px 28px ${item.surface}` : '0 12px 28px rgba(0, 0, 0, 0.20)',
                      opacity: 0,
                      pointerEvents: 'none',
                      transform: 'translate(-50%, 14px) scale(0.8)',
                      transition:
                        'opacity 160ms ease, transform 180ms ease, border-color 160ms ease, background-color 160ms ease',
                      transitionDelay: `${index * 24}ms`,
                      '&:hover': {
                        bgcolor: selected ? item.accent : item.surface,
                        borderColor: item.accent,
                        transform: 'translate(-50%, -1px) scale(1.02)',
                      },
                    }}
                  >
                    {item.icon}
                  </Fab>
                </Tooltip>
              );
            })}
            <Tooltip title="빠른 메뉴" placement="top" arrow>
              <Fab
                color="primary"
                aria-label="빠른 메뉴"
                aria-expanded={quickMenuOpen}
                onClick={() => setQuickMenuOpen(true)}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 0,
                  transform: 'translateX(-50%)',
                  boxShadow: '0 18px 46px rgba(0, 0, 0, 0.32)',
                  animation: 'tasker-rise-in 240ms ease-out',
                  '&:hover': {
                    transform: 'translateX(-50%) translateY(-1px)',
                  },
                }}
              >
                <AppsIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
}
