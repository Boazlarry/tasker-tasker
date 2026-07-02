# Tasker Tasker Agent Guide

This repository is a Next.js + TypeScript app for unifying issue-management platforms. The MVP is focused on Jira 7.x read workflows.

## Working Rules

- Start from the SDD docs in `docs/sdd/` before changing product behavior.
- Keep changes scoped to the spec or task you own.
- Do not store real Jira credentials, tokens, or server URLs in git.
- Do not add Tauri/Rust assumptions until `src-tauri/` exists.
- Coordinate parallel work through `docs/agents/README.md`.

## Verification

Run these commands before handing off a code change:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

For a full local gate:

```bash
npm run verify
```

If a change is documentation-only, note that the verification gate was not required.

## Product Boundaries

Current MVP scope:

- register Jira server connection metadata in the UI
- list Jira projects from Jira REST API v2
- list issues for a selected project
- open issue details with rendered description and activity context

Out of scope until explicitly specified:

- editing Jira issues
- sync jobs or background polling
- Notion/Trello integrations
- Tauri credential storage and packaging
