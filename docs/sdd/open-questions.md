# Open Questions

These remain after the 2026-07-01 MVP-scope decisions.

## Resolved Decisions

- Credentials are stored only locally.
- Comments/activity are shown by source origin instead of being merged anonymously.
- Team, kanban, and issue search are MVP scope.
- Jira work items must support create and edit, not only read-only viewing.

## Still Open

1. Is Jira 7.x Server/Data Center the only required target, or should Jira Cloud compatibility be kept in scope?
2. During the web MVP, is plaintext browser `localStorage` acceptable for local-only credential persistence, or should credential work wait for Tauri secure storage?
3. Which issue fields must be editable first: summary, description, assignee, priority, labels, status transitions, comments, or all supported metadata-driven fields?
4. What should define the team view first: project roles, assignable users, watchers, recently active users, or a manually configured team?
5. What should define kanban columns first: Jira workflow status, Jira Agile board columns, or user-configured columns?
6. Should issue creation use Jira metadata discovery from the start, or a minimal project/type/summary/description form first?
