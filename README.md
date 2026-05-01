# taskflow-agentic-poc

Jira-driven, no-touch agentic development pipeline for TaskFlow using GitHub Copilot and GitHub Actions.

## Structure
- frontend: React + Vite + TypeScript
- backend: Express + TypeScript + Prisma
- shared: Shared contracts and types
- .github: CI workflows, templates, and Copilot instructions
- .agent: Planner/Developer/Reviewer agent prompts
- .github/scripts: Jira fetch + review iteration cap helpers

## Pipeline Overview
1. Fetch
- Opening or labeling an issue with `agent-task` triggers `.github/workflows/jira-plan.yml`.
- Workflow parses Jira key from the issue body and fetches Jira details via `.github/scripts/fetch-jira.js`.

2. Plan
- Workflow posts an `@copilot` comment asking for a Development Plan using `.agent/planner-prompt.md`.

3. Feedback Loop
- Any human issue comment (except `LGTM, proceed`) triggers `.github/workflows/issue-comment.yml` to ask `@copilot` to revise the plan.
- Loop repeats until a human comments exactly: `LGTM, proceed`.

4. Develop
- The same workflow detects approval and posts an `@copilot` implementation kickoff with branch naming and PR requirements from `.agent/developer-prompt.md`.

5. Review
- PR open/sync/reopen triggers `.github/workflows/ai-review.yml`.
- Workflow asks `@copilot` for a Jira-and-plan-aware review using `.agent/reviewer-prompt.md`.

6. Fix Loop
- Any PR review with `CHANGES_REQUESTED` triggers `.github/workflows/fix-iteration.yml`.
- Workflow asks `@copilot` to apply fixes on the PR branch and comment a summary.
- New commits retrigger review automatically.

7. Done
- Pipeline ends when reviewer output is `APPROVE` and the ready comment starts with `✅ READY FOR HUMAN MERGE`.

## Key Constraint Compliance
- Entire orchestration is inside GitHub Actions workflows.
- Agent execution is delegated through GitHub Copilot (`@copilot` requests).
- No external AI orchestrator is used.

## Required Repository Setup
1. Enable GitHub Copilot coding agent for the repository.
2. Configure repository secrets:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
3. Optional repository variable:
- `HUMAN_FALLBACK_USER` for review-cap fallback assignment.
4. Use issue template `.github/ISSUE_TEMPLATE/agent-task.md` and keep label `agent-task`.

## Workflow Files
- `.github/workflows/jira-plan.yml`
- `.github/workflows/issue-comment.yml`
- `.github/workflows/ai-review.yml`
- `.github/workflows/fix-iteration.yml`

## Notes
- `ai-review.yml` enforces a max automated review iteration cap using `.github/scripts/iteration-cap.js`.
- All plan and review comments use markers (`<!-- ai-plan-marker -->`, `<!-- ai-reviewer-marker -->`) for loop control.
