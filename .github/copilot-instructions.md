# Copilot Instructions

## Repo Goals
- Build an agentic taskflow platform with clear boundaries between frontend, backend, and shared contracts.

## Agent Pipeline
- Planning starts from a GitHub issue labeled `agent-task`.
- `jira-plan.yml` fetches Jira details and asks Copilot to post a Development Plan comment.
- Human feedback on the issue can request plan revisions.
- Implementation starts only after a human comment says `LGTM, proceed`.
- PRs are reviewed by `ai-review.yml` with a capped iteration loop.
- Fixes are applied by `fix-iteration.yml` on `CHANGES_REQUESTED`.
- All orchestration must stay inside GitHub Actions and GitHub Copilot.

## Coding Guidelines
- Use TypeScript across frontend and backend.
- Keep shared types in /shared and import them from both apps.
- Prefer small, testable functions and explicit naming.
- Keep changes scoped to approved plan and acceptance criteria.
- Add tests for all non-trivial logic changes.
- Update OpenAPI for endpoint changes.
- Use Prisma migrations for schema changes.

## Review Expectations
- Validate input/output contracts for API changes.
- Call out breaking changes in pull requests.
- Add tests for non-trivial logic.
- Prioritize plan adherence, correctness, tests, security, then standards.

## Automation Files
- Agent prompts: `.agent/planner-prompt.md`, `.agent/developer-prompt.md`, `.agent/reviewer-prompt.md`
- Workflow helpers: `.github/scripts/fetch-jira.js`, `.github/scripts/iteration-cap.js`
