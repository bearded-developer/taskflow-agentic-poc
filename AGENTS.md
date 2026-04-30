# AGENTS.md — TaskFlow Standards

You are working on TaskFlow, a team task management web app. Read this file
before any change. These rules are non-negotiable.

## Layout
- `/frontend` — React 18 + Vite + TypeScript. Vitest + Testing Library.
- `/backend` — Express + TypeScript + Prisma + SQLite. Jest + Supertest.
- `/shared` — Shared types, imported as `@shared/types` on both sides.

## Workflow
1. Before writing code, post a development plan as an issue comment with:
   files to change, approach, edge cases, test strategy, open questions.
   Wait for human "LGTM, proceed" before implementing. Revise if asked.
2. Branch name: `task-{issue-number}-{slug}`. Target `develop`, never `main`.
3. Reference Jira key (e.g., `TASK-1`) in PR description and commit messages.

## Coding Standards
- Tests required for all changes. Backend: Jest. Frontend: Vitest. Cross-stack: both.
- Minimum 80% line coverage on new code; do not lower existing coverage.
- Prisma migrations for all schema changes. Never edit DB directly.
- Update `backend/openapi.yaml` for any endpoint change.
- React components: functional, TypeScript prop types, under
  `frontend/src/components/`.
- Validate all inputs with Zod on the backend.
- Parameterized Prisma queries only. No raw SQL string concatenation.

## Prohibited
- No `any` type without an inline disable comment explaining why.
- No `console.log` in committed code; use `backend/src/logger.ts`.
- No hardcoded secrets — env vars only.
- No new top-level dependencies without justification in PR description.

## Pre-PR Checks (must pass locally)
- `npm test` in `/frontend` and `/backend`
- `npm run lint` and `npm run typecheck` at root

## PR Format
- Title: `TASK-NNN: short imperative description`
- Description: Jira link, planning issue link, summary, screenshots for UI,
  Testing section.
- Keep diffs under 400 lines where possible.

## Code Review Focus (for Copilot reviewer)
When reviewing PRs, prioritize in this order:
1. Plan adherence — does the code match the approved plan in the linked issue?
2. Correctness vs acceptance criteria.
3. Test quality — meaningful tests, edge cases, not just happy path.
4. Security — input validation, parameterized queries, no leaked secrets.
5. AGENTS.md compliance — cite the specific rule when flagging.
Do not block on stylistic nits. Do not invent requirements not in the plan.