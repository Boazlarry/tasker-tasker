# Product Brief

## What This Project Is

Tasker Tasker is intended to be a unified work-item manager for issue-management platforms. The existing README names Trello, Notion, and Jira as long-term platform targets, but the current MVP is Jira 7.x.

## MVP Intent

The MVP should let a user:

- register a Jira server URL and Basic Authentication credentials
- list Jira projects from the configured server
- view issues for a selected project
- open an issue detail view with description and comments/activity context
- search/filter Jira issues
- use team and kanban views
- create and edit Jira work items
- keep credentials stored only on the user's local machine

## Current Implementation Snapshot

Implemented or partially implemented:

- Next.js app shell with MUI theming
- localStorage-backed platform management
- onboarding flow for adding a Jira platform
- settings page for platform and theme management
- API routes for Jira projects, project issues, and issue details
- project and issue-list UI
- issue detail UI

MVP scope but not implemented yet:

- team view
- kanban board view
- issue search/filter view
- issue creation
- issue editing
- source-separated comment/activity display

Deferred:

- actual Jira connection test in onboarding
- Tauri packaging and OS-backed local secure credential storage
- Notion/Trello support

## Main Risks

- Jira credentials are currently stored in browser `localStorage`, which satisfies local-only persistence but not secure local storage.
- Client code constructs Basic Auth headers directly.
- Onboarding connection test is mocked.
- Issue creation/editing is not implemented.
- Team, kanban, and search views are currently placeholders even though they are MVP scope.
- Tauri is mentioned in docs, but no `src-tauri/` directory exists.
- Jira 7.x REST response shapes need fixtures before broad UI work.
