export const workspacePreferenceStorageKey = 'tasker-workspace-preferences';
export const workspacePreferencesChangedEvent = 'tasker-workspace-preferences-changed';

export const jiraMenuKeys = ['projects', 'team', 'kanban', 'search'] as const;

export type JiraMenuKey = (typeof jiraMenuKeys)[number];

export interface WorkspacePreferences {
  showSidebar: boolean;
  showQuickMenu: boolean;
  enabledJiraMenuKeys: JiraMenuKey[];
}

export const defaultWorkspacePreferences: WorkspacePreferences = {
  showSidebar: true,
  showQuickMenu: true,
  enabledJiraMenuKeys: [...jiraMenuKeys],
};

export function readWorkspacePreferences(): WorkspacePreferences {
  if (typeof window === 'undefined') {
    return defaultWorkspacePreferences;
  }

  try {
    return normalizeWorkspacePreferences(
      JSON.parse(localStorage.getItem(workspacePreferenceStorageKey) || 'null')
    );
  } catch {
    return defaultWorkspacePreferences;
  }
}

export function saveWorkspacePreferences(preferences: WorkspacePreferences) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    workspacePreferenceStorageKey,
    JSON.stringify(normalizeWorkspacePreferences(preferences))
  );
  window.dispatchEvent(new Event(workspacePreferencesChangedEvent));
}

export function normalizeWorkspacePreferences(value: unknown): WorkspacePreferences {
  if (!value || typeof value !== 'object') {
    return defaultWorkspacePreferences;
  }

  const rawPreferences = value as Partial<WorkspacePreferences>;
  const enabledJiraMenuKeys = Array.isArray(rawPreferences.enabledJiraMenuKeys)
    ? rawPreferences.enabledJiraMenuKeys.filter((key): key is JiraMenuKey =>
        jiraMenuKeys.includes(key as JiraMenuKey)
      )
    : defaultWorkspacePreferences.enabledJiraMenuKeys;

  return {
    showSidebar: rawPreferences.showSidebar ?? defaultWorkspacePreferences.showSidebar,
    showQuickMenu: rawPreferences.showQuickMenu ?? defaultWorkspacePreferences.showQuickMenu,
    enabledJiraMenuKeys,
  };
}
