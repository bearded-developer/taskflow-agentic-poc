# AGENTS.md — TaskFlow Standards

You are working on TaskFlow, a team task management web app. Read this file
before any change. These rules are non-negotiable.

## Automated Pipeline Overview

```
GitHub Issue (label: agent-task)
  ↓  jira-plan.yml
Copilot fetches Jira ticket details → posts Development Plan as issue comment
  ↓  issue-comment.yml  [human feedback loop — reply freely to revise]
  ↓  "LGTM, proceed"
Copilot coding agent assigned → creates branch → implements → opens PR
  ↓  ai-review.yml  (max 5 rounds)
Copilot reviewer checks PR vs approved plan + acceptance criteria
  ├─ APPROVE → ✅ READY FOR HUMAN MERGE (human merges)
  └─ CHANGES REQUESTED
    ↓  fix-iteration.yml
    Copilot developer fixes issues → pushes → re-review (loop)
    ↓  (cap hit)
    Human fallback reviewer assigned
```

**Agent prompts:** `.agent/planner-prompt.md`, `.agent/developer-prompt.md`,
`.agent/reviewer-prompt.md`

## Layout
- `/frontend` — React 18 + Vite + TypeScript. Vitest + Testing Library.
- `/backend` — Express + TypeScript + Prisma + SQLite. Jest + Supertest.
- `/shared` — Shared types, imported as `@shared/types` on both sides.
- `/.agent` — Agent system prompts and automation scripts.
- `/.github/scripts` — Helper scripts called by workflows (Jira fetch, etc.).

## Workflow
1. Before writing code, a Development Plan is posted as an issue comment
  (with `<!-- ai-plan-marker -->` marker). The plan includes: files to change,
  approach, edge cases, test strategy, open questions.
2. Human replies with feedback to revise, or `LGTM, proceed` to approve.
3. Implementation starts only after `LGTM, proceed`.
4. Branch name: `task-{issue-number}-{slug}`. Target `develop`, never `main`.
5. Reference Jira key (e.g., `TASK-1`) in PR description and commit messages.

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
```bash
cd backend && npm ci && npm run lint && npm run typecheck && npm test
cd ../frontend && npm ci && npm run lint && npm run typecheck && npm test
```

## PR Format
- Title: `TASK-NNN: short imperative description`
- Description: Jira link, planning issue link (`Closes #NN`), summary,
  screenshots for UI, Testing section, Plan Adherence checklist.
- Keep diffs under 400 lines where possible.

## Code Review Focus (for Copilot reviewer)

Prioritize in this order:
1. Plan adherence — does the code match the approved plan in the linked issue?
2. Correctness vs acceptance criteria from the Jira ticket / planning issue.
3. Test quality — meaningful tests, edge cases, not just happy path.
4. Security — Zod validation, parameterized queries, no leaked secrets.
5. AGENTS.md compliance — cite the specific rule when flagging.

Do not block on stylistic nits. Do not invent requirements not in the plan.