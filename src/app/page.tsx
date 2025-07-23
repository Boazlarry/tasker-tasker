'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Fab,
  Menu,
  MenuItem,
  useTheme,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Paper,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { usePlatformManager, Platform } from '../hooks/usePlatformManager';
import JiraPlatformView from '../components/JiraPlatformView';
import IssueDetailView from '../components/IssueDetailView';
import JiraTeamView from '../components/JiraTeamView';
import JiraKanbanView from '../components/JiraKanbanView';
import JiraIssueSearchView from '../components/JiraIssueSearchView';

const drawerWidth = 280;

interface ContentTab {
  id: string; // Unique ID for the tab (e.g., platformId-type-key)
  type: 'jira-project-list' | 'jira-issue-detail' | 'jira-team' | 'jira-kanban' | 'jira-issue-search'; // Type of content
  title: string;
  platformId: string;
  data?: any; // Data specific to the tab (e.g., issueKey for issue detail)
}

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const { platforms, loading: platformsLoading } = usePlatformManager();

  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [contentTabs, setContentTabs] = useState<ContentTab[]>([]);
  const [activeContentTabId, setActiveContentTabId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // For FAB menu

  // Initial routing logic and platform selection
  useEffect(() => {
    if (!platformsLoading) {
      if (platforms.length === 0) {
        router.push('/welcome');
      } else if (!selectedPlatformId) {
        setSelectedPlatformId(platforms[0].id);
      }
    }
  }, [platformsLoading, platforms, router, selectedPlatformId]);

  // Handle opening a new content tab
  const handleOpenContentTab = useCallback((type: ContentTab['type'], key: string, platform: Platform, title: string) => {
    const newTabId = `${platform.id}-${type}-${key}`;
    const existingTab = contentTabs.find(tab => tab.id === newTabId);

    if (existingTab) {
      setActiveContentTabId(newTabId);
    } else {
      const newTab: ContentTab = {
        id: newTabId,
        type,
        title,
        platformId: platform.id,
        data: { key }, // Store key for issue detail
      };
      setContentTabs(prevTabs => [...prevTabs, newTab]);
      setActiveContentTabId(newTabId);
    }
  }, [contentTabs]);

  // Handle closing a content tab
  const handleCloseContentTab = useCallback((tabId: string) => {
    setContentTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) return prevTabs;

      const updatedTabs = prevTabs.filter(tab => tab.id !== tabId);

      if (activeContentTabId === tabId) {
        // If the closed tab was active, activate an adjacent one
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

  const handlePlatformTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedPlatformId(newValue);
    // When platform changes, activate the first content tab of that platform or null
    const firstTabOfNewPlatform = contentTabs.find(tab => tab.platformId === newValue);
    setActiveContentTabId(firstTabOfNewPlatform ? firstTabOfNewPlatform.id : null);
  };

  const handleContentTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveContentTabId(newValue);
  };

  const handleFabClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    handleFabMenuClose();
  };

  if (platformsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (platforms.length === 0) {
    return null; // Redirect handled by useEffect
  }

  const currentPlatform = platforms.find(p => p.id === selectedPlatformId);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar for Platform Tabs */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            Tasker
          </Typography>
          <Tabs value={selectedPlatformId} onChange={handlePlatformTabChange} aria-label="platform tabs">
            {platforms.map((platform) => (
              <Tab key={platform.id} label={platform.name} value={platform.id} />
            ))}
          </Tabs>
          <Button color="primary" startIcon={<AddIcon />} onClick={() => router.push('/welcome')}>
            플랫폼 추가
          </Button>
        </Toolbar>
      </AppBar>

      {/* Dynamic Sidebar */}
      {currentPlatform && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
              top: '64px', // Below AppBar
              height: 'calc(100% - 64px)', // Adjust height
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {currentPlatform.name}
            </Typography>
          </Box>
          <Box sx={{ overflow: 'auto' }}>
            {/* Dynamic Sidebar Content based on platform type */}
            {currentPlatform.type === 'jira' && (
              <List>
                <ListItemButton onClick={() => handleOpenContentTab('jira-project-list', currentPlatform.id, currentPlatform, `${currentPlatform.name} 프로젝트`)}>
                  <ListItemText primary="프로젝트" />
                </ListItemButton>
                <ListItemButton onClick={() => handleOpenContentTab('jira-team', currentPlatform.id, currentPlatform, `${currentPlatform.name} 팀`)}>
                  <ListItemText primary="팀" />
                </ListItemButton>
                <ListItemButton onClick={() => handleOpenContentTab('jira-kanban', currentPlatform.id, currentPlatform, `${currentPlatform.name} 칸반보드`)}>
                  <ListItemText primary="칸반보드" />
                </ListItemButton>
                <ListItemButton onClick={() => handleOpenContentTab('jira-issue-search', currentPlatform.id, currentPlatform, `${currentPlatform.name} 이슈 검색`)}>
                  <ListItemText primary="이슈 검색" />
                </ListItemButton>
              </List>
            )}
            {/* Add other platform types here */}
          </Box>
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px', // Offset for AppBar
          ml: currentPlatform ? `${drawerWidth}px` : 0, // Offset for Drawer
          width: currentPlatform ? `calc(100% - ${drawerWidth}px)` : '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Content Tabs */}
        {contentTabs.length > 0 && (
          <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeContentTabId}
              onChange={handleContentTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="content tabs"
            >
              {contentTabs.map((tab) => (
                <Tab
                  key={tab.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {tab.title}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseContentTab(tab.id);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  value={tab.id}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* Render active content tab */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {activeContentTabId && contentTabs.map((tab) => (
            <Box key={tab.id} sx={{ display: activeContentTabId === tab.id ? 'block' : 'none', height: '100%' }}>
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
              {/* Add other content types here */}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="settings"
        sx={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
        onClick={handleFabClick}
      >
        <SettingsIcon />
      </Fab>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFabMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={handleSettingsClick}>설정</MenuItem>
        {/* Future: Add other global actions here */}
      </Menu>
    </Box>
  );
}
