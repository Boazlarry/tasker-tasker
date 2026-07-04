# Spec 0001: MVP Jira Integration

Status: Accepted

## Source

Derived from `README.md`, `GEMINI.md`, the current Next.js source tree, and user decisions made on 2026-07-01.

## Goal

Provide a Jira 7.x workspace where a user can register a Jira server, inspect work, search issues, use team and kanban views, and create or edit Jira work items from one UI.

## Users

- Individual developer or team member who works with an older Jira instance.
- User may have more than one Jira server/account.

## Functional Requirements

### Platform Setup

- User can add a Jira platform with name, base URL, username, and API token/password.
- User can edit and delete saved platforms.
- User can choose theme mode and custom colors.
- User can configure local workspace layout preferences, including sidebar visibility, floating quick menu visibility, and visible Jira menu entries.
- First-run users are routed to onboarding.
- Credentials are persisted only on the user's local machine.
- The app must not persist credentials on a remote server, in git, or in shared project files.
- During the web MVP, local persistence can use browser storage. A later Tauri build should move this to OS-backed local secure storage.
- Jira credentials may be sent transiently to Jira or a local proxy route only for the active request and must not be logged.

### Jira Project List

- App requests `GET /rest/api/2/project` through the local Next.js API route.
- UI shows project name and key.
- User can select a project.
- Last selected project can be restored for the same Jira platform.

### Jira Issue List

- App requests Jira issues for a selected project using Jira REST API v2 search.
- UI shows issue key, summary, type, status, and reporter.
- User can open an issue detail tab from the issue list.

### Jira Issue Detail

- App requests a specific issue by key.
- UI shows issue key, summary, status, rendered description, and comment/activity context.
- Failed loads show an actionable error state.

### Jira Comment Sources

- Comments and activity must preserve their source.
- Jira issue comments are sourced from Jira comment data, such as `fields.comment.comments` or `/rest/api/2/issue/{issueKey}/comment`.
- Jira changelog entries are sourced separately from `changelog.histories`.
- Future platform comments must remain grouped or labeled by their origin platform and source API.
- UI should not merge source types into one anonymous stream without source labels.

### Jira Issue Creation

- User can create a Jira issue in a selected project.
- Required fields include project, issue type, summary, and any Jira-required fields returned by metadata.
- Creation failures expose Jira validation messages where available.
- Successful creation opens or focuses the new issue detail.

### Jira Issue Editing

- User can edit supported Jira fields for an existing issue.
- MVP editable fields should include summary, description, status transition when available, assignee, priority, labels, and comments where Jira permissions allow them.
- The UI must surface permission or workflow failures from Jira.
- The app should avoid silently overwriting concurrent updates.

### Jira Team View

- Team view is in MVP scope.
- It should show people or roles relevant to the selected Jira platform/project.
- The exact source can be Jira project roles, assignable users, watchers, or another Jira 7.x-compatible source chosen during implementation.

### Jira Kanban View

- Kanban view is in MVP scope.
- It should group issues by workflow status or board column.
- Moving issues between columns should use Jira transitions when supported and should show a blocked state when no transition exists.

### Jira Issue Search

- Issue search is in MVP scope.
- User can search/filter issues across a selected Jira platform.
- MVP should support text/JQL-oriented search, project filter, status filter, assignee filter, and issue type filter when Jira data is available.

## Non-Functional Requirements

- The app must not commit real Jira credentials.
- Credentials must be stored only locally.
- Jira base URLs should be normalized enough to avoid duplicate slashes.
- API routes should return consistent JSON errors and preserve meaningful Jira status codes where possible.
- Browser UI must remain usable without a configured platform by routing to onboarding.
- Jira-rendered HTML must be treated as untrusted unless it is sanitized or intentionally trusted by an explicit local-only policy.
- Jira issue list and search requests should use Jira REST pagination (`startAt`, `maxResults`) and request only needed fields where possible.
- Aggregate MVP views such as team and kanban must avoid per-project fan-out or unbounded full-instance issue reads. Bounded recent-issue samples are acceptable until a more exact Jira source is specified.

## Acceptance Criteria

- `npm run verify` passes.
- A mock or real Jira-compatible server can satisfy project, issue list, issue detail, create, edit, team, kanban, and search flows.
- Missing Jira URL/auth produces a controlled error response.
- Invalid Jira credentials or server failure produces a visible UI error.
- Opening the same issue twice focuses the existing detail tab instead of duplicating it.
- Credentials are never written outside local browser/desktop storage.
- Comment and activity UI labels source data separately by origin.
- Create/edit operations show Jira validation and permission errors without losing user input.

## Out of Scope

- Background sync.
- Tauri packaging as a distributable binary.
- Notion/Trello integrations.

## Remaining Decisions

- Jira Cloud compatibility versus Jira 7.x Server/Data Center only.
- First editable field set and exact UX for create/edit forms.
- Exact Jira source for team data.
- Exact kanban board source: workflow status, Jira agile board API, or configurable columns.
- Long-term paging/cache strategy for large Jira instances.
