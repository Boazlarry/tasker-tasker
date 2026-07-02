# Spec-Driven Development

Tasker Tasker uses lightweight SDD: product changes start from a spec, implementation follows the accepted slice, and verification maps back to acceptance criteria.

## Spec Status

- `Draft`: captured from docs/code, not confirmed.
- `Needs confirmation`: blocked on a product or technical decision.
- `Accepted`: ready for implementation.
- `Implemented`: code merged and verified against acceptance criteria.

## Current Specs

- `specs/0001-mvp-jira-integration.md`: Jira 7.x MVP product behavior.
- `specs/0002-development-harness.md`: local/CI verification and parallel-agent workflow.

## Human-Readable References

- `../current-implementation.md`: what is implemented now versus planned MVP behavior.
- `../domain-map.md`: current domain map and embedded diagram image.

## Workflow

1. Read the relevant spec and open questions.
2. Confirm or record assumptions before changing behavior.
3. Keep changes within one spec slice.
4. Add or update acceptance criteria when implementation reveals ambiguity.
5. Run `npm run verify` for code changes.
