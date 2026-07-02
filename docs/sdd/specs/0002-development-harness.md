# Spec 0002: Development Harness

Status: Draft

## Goal

Make the repo ready for parallel agent work and SDD-driven development with repeatable local and CI checks.

## Current Baseline

Present:

- Next.js, TypeScript, ESLint, and package lock.
- `GEMINI.md` with high-level verification guidance.

Missing before this spec:

- root agent instructions
- parallel-agent role briefs
- SDD specs and open-question tracking
- typecheck script
- test script
- full verify script
- CI workflow

## Requirements

- Root `AGENTS.md` defines product boundaries, coordination rules, and verification commands.
- `docs/agents/README.md` defines parallel agent roles with distinct write scopes.
- `docs/sdd/` stores product brief, specs, and open questions.
- `package.json` exposes `lint`, `lint:fix`, `typecheck`, and `verify`.
- `package.json` exposes `test` and `test:watch` for Vitest.
- GitHub Actions runs install, lint, typecheck, test, and build on pushes and PRs.

## Acceptance Criteria

- `npm run lint` is a non-mutating check.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run test` runs Vitest once.
- `npm run verify` runs lint, typecheck, test, and build in order.
- CI workflow uses `npm ci` and the same verification commands.
- Documentation-only changes can skip runtime verification with an explicit note.

## Future Additions

- Mock Jira fixtures for project, search, and issue detail responses.
- Playwright smoke test for onboarding and issue navigation once a mock server exists.
