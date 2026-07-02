# Parallel Agent Harness

Use these briefs when splitting Tasker Tasker work across sub-agents. Each worker owns a distinct write set and should report changed files plus verification results.

## Coordination Rules

- Every agent reads `AGENTS.md` and the relevant `docs/sdd/` spec first.
- Agents must not revert or overwrite changes outside their assigned files.
- If two tasks need the same file, serialize them or nominate one owner.
- Product behavior changes require an SDD spec status of `Accepted` or a clearly labeled `Draft` change with open questions listed.
- Keep PR-sized patches: one product slice, one harness slice, or one spec slice.

## Agent Roles

### spec-steward

Purpose: maintain SDD docs and turn existing intent into explicit requirements.

Default write scope:

- `docs/sdd/**`
- `README.md`
- `AGENTS.md`

Typical prompt:

```text
Read AGENTS.md and docs/sdd. Update the relevant spec with decisions, acceptance criteria, and open questions. Do not edit product code.
```

### jira-api-worker

Purpose: implement and harden Jira REST API integration boundaries.

Default write scope:

- `src/app/api/jira/**`
- API-focused tests when a test harness is present

Typical prompt:

```text
Read AGENTS.md and docs/sdd/specs/0001-mvp-jira-integration.md. Implement the API-route slice only. Preserve existing UI behavior unless the spec requires a contract change.
```

### frontend-shell-worker

Purpose: improve platform setup, navigation, issue list, detail, and placeholder views.

Default write scope:

- `src/app/**`
- `src/components/**`
- `src/hooks/**`
- `src/context/**`
- `src/styles/**`

Typical prompt:

```text
Read AGENTS.md and docs/sdd/specs/0001-mvp-jira-integration.md. Implement the assigned UI slice only and keep API contracts stable unless coordinated with jira-api-worker.
```

### qa-harness-worker

Purpose: maintain lint/type/build/test/CI tooling and document local verification.

Default write scope:

- `package.json`
- `package-lock.json`
- `.github/workflows/**`
- test configuration files
- `docs/sdd/specs/0002-development-harness.md`

Typical prompt:

```text
Read AGENTS.md and docs/sdd/specs/0002-development-harness.md. Improve the verification harness without changing product behavior. Report exact commands run and failures.
```

### design-reviewer

Purpose: review UX consistency and workflow ergonomics after UI changes.

Default write scope:

- no default write scope; read-only unless assigned a specific UI file

Typical prompt:

```text
Read AGENTS.md and inspect the changed UI files. Report user-facing issues, layout risks, and missing states. Do not edit files unless explicitly assigned.
```

