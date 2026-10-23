# Git collaboration workflow — three members, conflict resistant

The earlier CodeX final handoff recorded matching `origin/main` at `0b61969996d512b5ad2745c79fde1e1cd7c3b14d`. **Do not assume it remains so.** Before branching:
```powershell
git status
git fetch origin
git log --oneline -5
git rev-parse HEAD
git rev-parse origin/main
```
If a teammate has pushed since, inspect new commits and agree on an updated baseline. Never `git push --force`, `git reset --hard`, or overwrite a clone based on an obsolete SHA.

## PR protocol
1. Team accepts architecture ADRs; Member 1 opens `handoff/shared-contracts` PR0 with `src/shared` DTOs, events, errors, local mock ports and fixtures, without rewriting every domain.
2. All three comment on shape and version; merge PR0 once approved (at this point, contract `v0.1.0` is genuinely frozen).
3. Branches **from latest main after PR0**: `feat/security-policy-case-core` (M1), `feat/scrutiny-evc` (M2), `feat/obligations-documents-alerts` (M3). Members 2/3 can develop mock-ready domain logic on their own worktrees before PR0 but rebase/reconcile deliberately afterward.
4. M1 alone edits shared AppContext, API service, type module and route/server registration. M2/M3 export modules + PR snippets for registration; do not simultaneously rewrite M1 files.
5. Unit/negative tests for each domain must be green, compile under shared contract, and use synthetic fixtures; require at least one other member review.
6. Merge domain PRs in validated dependency order: contracts → security/storage → intake/policy → scrutiny/EVC → decision/obligations/files → timers/dashboards → final tests/demo.
7. Each merge: `git fetch`, review range, run lint/build/targeted tests and merged negative tests; no acceptance claim based solely on code inspection.

## Suggested labels
`scope:core`, `scope:scrutiny-evc`, `scope:compliance-alerts`, `contract-change`, `security-P0`, `demo-mock`, `ready-for-review`, `blocked-by-contract`, `acceptance-evidence`.

## Known conflict hotspots
`src/context/AppContext.tsx`, `src/services/api.ts`, `src/types/index.ts`, `server.ts`, monolithic router `src/backend/routes/index.js`, shared Application model, package scripts, Vite configuration. Only M1 changes these with M2/3 review for affected contracts.

## Branch protection (if settings permit)
Require PR, reviewer, passing TypeScript/build/test CI and deny force-push on main. Do not set required checks before CI exists and genuinely works.
