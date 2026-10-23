# AICTE PS 26262 — Three-Member Team Implementation Guide

**Project:** Smart India Hackathon 2026 — Integrated AICTE Approval Workflow, Compliance Monitoring and Alert Management System  
**Repository:** `Mayuresh-1306/SIH-2026-AICTE`  
**Team roles:** Member 1, Member 2, Member 3  
**Starting point:** Existing React + Vite + TypeScript UI and Express backend. **Do not rebuild from scratch.**  
**Goal:** One securely integrated, explainable demonstration: case submission → policy-based route → scrutiny/re-scrutiny → conditional EVC → human decision → obligation/document review → reminder → accurate dashboard/audit.

> **IMPORTANT — Where these instructions live:** At initial upload, this `docs/team/` handbook was committed on **`docs/team-handoff`**, not on `main`. A fresh clone of `main` will NOT contain these files until the docs-only PR is reviewed and merged. The coordinator should open a PR **base `main` ← compare `docs/team-handoff`** and merge it after confirming it only adds documentation. Until then, read the files using the GitHub branch selector. Do not begin feature branches from an out-of-date `main` assuming the handbook is there.

## 1. What each folder is for

All paths below start with `docs/team/`.

| Folder/file | What it contains | When to use it |
|---|---|---|
| `README.md` | This guide and the overall navigation | Everyone, first |
| `00_START_HERE.md` | Day-zero checklist, current architecture and milestone gates | Everyone, immediately |
| `00_MANAGEMENT/` | Current evidence, team decisions, progress tracker, demo scope, risks and schedule | Team meeting, daily coordination and submission |
| `01_SHARED/` | Proposed common contracts, security/policy rules, parallel-work guide and handoff template | All members **before coding** and whenever exchanging an API/event |
| `02_MEMBER_1/` | Member 1's ownership, tickets, agent prompt and cross-team outputs | Member 1 only (other members may review interfaces) |
| `03_MEMBER_2/` | Member 2's ownership, tickets, agent prompt and cross-team outputs | Member 2 only (other members may review interfaces) |
| `04_MEMBER_3/` | Member 3's ownership, tickets, agent prompt and cross-team outputs | Member 3 only (other members may review interfaces) |
| `05_TESTS/` | B01–B14 coverage, acceptance T01–T28, golden path, QA template and manual UI checks | Every PR and final integration |
| `06_GITHUB/` | Branch/PR workflow, PR template and *optional* agent-instruction template | Before creating PRs; do **not** auto-install agent rules |
| `07_CONTRACT_STARTER/` | Proposed TypeScript DTOs, ports, fake core, endpoint map, synthetic JSON fixtures/responses | Day zero: **use as references/mocks**, not production source |

**Inside each member folder:** `01_CONTEXT_AND_OWNERSHIP.md` explains your boundary; `02_DETAILED_TASKS_AND_DOD.md` is the ticket checklist; `03_AGENT_KICKOFF_PROMPT.txt` is the exact AI-agent starting message; `04_HANDOFF_TO_OTHER_MEMBERS.md` states what you must supply to the others.

**Essential external references:** The final 23-page consolidated research PDF and final Codex engineering handoff describe the desired requirements and verified current gaps. They are **not inside the ten items originally uploaded to `docs/team/`**. The coordinator must privately share the actual documents or add an approved, reviewed copy later. The long audit-conversation history is optional provenance, not something every agent must reread. If your agent cannot access a required source, tell the team; **do not invent it**.

## 2. What is and isn't already built

- **Present:** Existing frontend pages/components, Express routes, demo fixtures, partial Mongo/Mongoose code, TypeScript tooling and build pipeline.
- **Verified:** Dependency installation, TypeScript validation and Vite build passed; 8 utility tests and 5 API tests passed using **separate** runners.
- **Broken:** Default `npm test` discovery; router-only checks showed missing/invalid authentication accepted, wrong passwords accepted, cross-region records exposed, invalid/skipped stages accepted and hardcoded dashboard figures.
- **Unverified:** Browser functionality was blocked by a Chrome-startup issue. Database durability and production deployment were not verified.
- **Not yet complete:** The full 10-step MVP and all four proposed differentiators.

**Never mark a mock UI, a TypeScript compilation, or a passing helper test as proof of an integrated regulatory workflow. Use only synthetic institutions and demo accounts.**

## 3. One-time team setup (all three)

1. **Coordinator:** merge the docs-only PR (after review) so `docs/team/` exists in `main` for everyone. This is documentation, not a feature merge.
2. **Repository owner:** invite all three GitHub accounts to the private repository. Everyone accepts the invitation.
3. **Each member:** clone the actual repository through **VS Code → Ctrl+Shift+P → Git: Clone** using `https://github.com/Mayuresh-1306/SIH-2026-AICTE.git`; open the cloned folder, not a GitHub Download-ZIP extraction. Prefer a non-OneDrive location such as `C:\Projects`.
4. Open **Terminal → New Terminal** in the cloned repository and, if the working tree is clean, run:

   ```powershell
   git status
   git switch main
   git fetch origin
   git pull --ff-only origin main
   git log -1 --oneline
   ```

   If Git refuses because of local modifications, **stop; do not run `reset --hard` or force-push**. The historical audit SHA was `0b61969996d512b5ad2745c79fde1e1cd7c3b14d`, but newer reviewed commits are expected.
5. Read `00_START_HERE.md`, `00_MANAGEMENT/DECISIONS_AND_SCOPE.md`, `01_SHARED/CONTRACT_FREEZE_CANDIDATE.md`, `01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md`, your own member files, and the finalized research PDF.
6. **All three jointly review ADR-01…ADR-10** in `00_MANAGEMENT/DECISIONS_AND_SCOPE.md`; these are proposals, not already-approved decisions. Decide how transaction-capable MongoDB will run; if unavailable, record that as a blocker, not silently as memory persistence.
7. **Member 1 prepares PR0 (`handoff/shared-contracts`)** using `07_CONTRACT_STARTER/` as a *proposal*. Members 2/3 review PR0 **while coding isolated, fake-port-backed logic** on separate branches. After review/merge, PR0 becomes the canonical source for types/events/errors. No one invents competing DTOs.

## 4. Member ownership and exactly how to begin

### Member 1 — Core, security, policy and integration

**Read:** `02_MEMBER_1/01_CONTEXT_AND_OWNERSHIP.md`, `02_DETAILED_TASKS_AND_DOD.md`, `03_AGENT_KICKOFF_PROMPT.txt`, `04_HANDOFF_TO_OTHER_MEMBERS.md`.

**Owns:** shared DTOs/route registration, authentication/RBAC, institution/region scope, authoritative case storage, guarded server transitions, source-linked policy routing, human-only demo decisions, typed frontend API adapter and integration. Only Member 1 coordinates edits to `server.ts`, central router, `src/services/api.ts`, `src/context/AppContext.tsx`, `src/types/index.ts`, and shared manifests/scripts.

**First independent deliverable:** PR0 proposing approved actors, case/state keys, commands, event names, error envelopes, endpoint map and synthetic mock ports. Write failing/negative auth and transition tests before replacing unsafe logic.

**Then implement:** (a) invalid credentials/tokens rejected; (b) scoped list/read/write; (c) persisted case and validated commands; (d) two reviewed policy-linked routes and `POLICY_REVIEW_REQUIRED` at unresolved X=360; (e) authorized fictional decision with an atomic hook for Member 3's obligation participant; (f) one frontend-to-server data path. Fix default test runner as an integration task.

**Gives Member 2:** agreed `Actor`, `Application`, route/version, command/context, evidence IDs, event and error types; transaction/case ports. **Gives Member 3:** agreed `DecisionRecorded` event, transaction participant interface, source policy reference, case/actor context and outbox contract.

### Member 2 — Scrutiny, re-scrutiny and conditional EVC

**Read:** `03_MEMBER_2/01_CONTEXT_AND_OWNERSHIP.md`, `02_DETAILED_TASKS_AND_DOD.md`, `03_AGENT_KICKOFF_PROMPT.txt`, `04_HANDOFF_TO_OTHER_MEMBERS.md`.

**Owns:** signed checklist snapshots, deficiency IDs, correction rounds, server-side restricted re-scrutiny, EVC eligibility, scheduling/report modules and application-dossier/EVC UI. **Do not edit Member 1's central API/context/router files directly.**

**First independent deliverable:** With `07_CONTRACT_STARTER/src/mockCore.ts` and synthetic fixtures, create/test `validateCorrections(snapshot, changes)` and `evcEligible(route, prerequisites, state)` as pure modules. Show **D1/D2 changes accepted, C3 change rejected, EVC generated only when applicable, no duplicate task**. Mark mock results clearly.

**Then integrate:** export scrutiny/EVC route modules and services; use Member 1's case/actor/version/transaction boundary and Member 3's document-version references. Provide events such as `ScrutinySigned`, `CorrectionSubmitted`, `RescrutinyCompleted`, `EVCTaskCreated`, `EVCReportSubmitted`. A signed demo snapshot means attributable/immutable record, **not** certified legal signature.

**Gives Members 1/3:** typed scrutiny-completed/eligibility guard, prerequisite event IDs, snapshot and deficiency identifiers, EVC task/status/report events and acceptance tests.

### Member 3 — Obligations, documents, reminders and dashboards

**Read:** `04_MEMBER_3/01_CONTEXT_AND_OWNERSHIP.md`, `02_DETAILED_TASKS_AND_DOD.md`, `03_AGENT_KICKOFF_PROMPT.txt`, `04_HANDOFF_TO_OTHER_MEMBERS.md`.

**Owns:** conditional decision obligations, evidence/document versions and review, private demo file access, timer/outbox/notifications, dashboard/pendency/report calculations and related UI. Member 3 **cannot issue approvals** and must not change global authentication.

**First independent deliverable:** Use `07_CONTRACT_STARTER/fixtures/events.json` and mocked decision ports to test (a) one obligation for an applicable condition, zero for non-applicable decisions; (b) submission stays `submitted` until authorized review; (c) exactly one reminder on retries and stale reminder canceled after review/extension; (d) zero EVC records means zero EVC dashboard count.

**Then integrate:** implement `DecisionObligationParticipant` that Member 1 invokes **within the same transaction** as the authorized decision; preserve actual document versions, scoped download, due-date origins and virtual-clock testability. Build scoped, stored-data dashboards. Never claim filename-only metadata is an uploaded file or a fake hash is cryptographic protection.

**Gives Members 1/2:** transaction participant and event contracts, document-version IDs/access port, obligation status, timer/outbox event names, real aggregate endpoints and acceptance evidence.

## 5. Exactly how to use Codex or another AI coding agent

Each member uses a **separate Codex conversation** in their own **real Git clone**. Open the member's `03_AGENT_KICKOFF_PROMPT.txt` and paste its **full contents** into the new conversation. Also direct the agent to the shared documents, current code, research PDF and the member's `01`/`02`/`04` files. Ask it to **confirm it can read each required file**.

Use **Work locally** and **Ask for approval**. Start in planning/read-only mode. First expected answer: current Git branch/SHA; source files it verified; files it proposes to edit; endpoints/types produced or consumed; exact first PR; negative tests; blockers. **Review and approve that plan before allowing edits.** Don't paste all three member prompts into a single agent or ask it to replace the framework. Medium effort is a reasonable default; use higher reasoning only for difficult security/state-machine choices if available.

**The `07_CONTRACT_STARTER/src/*.ts` files are examples/reference code inside documentation, NOT the live application's `src/`.** A feature can depend on local mocks while another member's backend is incomplete, but the mock must be clearly labeled and replaced/reconciled against the reviewed PR0 contract before merge.

## 6. Feature branches and pull requests (never code directly on `main`)

After the **docs PR is merged** and the team's contract decision is agreed:

**Member 1 PR0:** create `handoff/shared-contracts` from up-to-date `main`. All three review and merge it.

**Feature branches after PR0:** Member 1 → `feat/security-policy-case-core`; Member 2 → `feat/scrutiny-evc`; Member 3 → `feat/obligations-documents-alerts`. Members 2/3 may already have independent WIP branches with mock-backed logic; reconcile intentionally before final PR rather than overwriting their work.

To create your feature branch from a clean, updated `main`:

```powershell
git switch main
git fetch origin
git pull --ff-only origin main
git switch -c feat/YOUR-APPROVED-BRANCH
```

Work only in your domain files. Review `git diff`, run relevant tests, and stage **only intended files** (e.g. `git add src/backend/modules/scrutiny tests/...`, adjusted to actual paths). Don't casually use `git add .` when temporary reports or credentials exist.

```powershell
git status
git diff --check
git diff --cached --name-only
git commit -m "feat: concise description of tested work"
git push -u origin YOUR-APPROVED-BRANCH
```

Open a GitHub Pull Request with **base `main` ← compare your branch**, tag a second member for review and use `01_SHARED/INTER_MEMBER_HANDOFF_TEMPLATE.md` / `06_GITHUB/PULL_REQUEST_TEMPLATE.md` in the PR description. Include contract version, changed files, tests passed/failed, screenshots where relevant and exact next integration steps. **Do not merge failing or mock-only work as a completed regulatory feature.** No force pushes or Git hard resets to resolve divergence.

## 7. Communication rules — prevent conflicts

- **One source of truth:** approved types, state mapping, URLs, error codes and events from PR0. If a field must change, open a reviewed contract-change PR and notify all members.
- **Member 1 owns shared integration files.** Members 2/3 export domain modules, interfaces, and proposed integration snippets; Member 1 wires them into shared router/context/adapter.
- **Use `01_SHARED/INTER_MEMBER_HANDOFF_TEMPLATE.md` after each meaningful PR.** State: branch and SHA, contract version, owned modules, consumed/produced events, example request/response, tests and remaining blockers.
- **Never assume another feature exists.** Call the fake port from the contract starter until a tested live endpoint replaces it. Synthetic/mock outputs are not production acceptance.
- **Daily sync:** update `00_MANAGEMENT/TEAM_TRACKER.md` with G0–G5 status and PR/test links; communicate blocker, next deliverable and needed interfaces—not entire source files through chat.

## 8. Milestone gates and test evidence

| Gate | Proof required | Owner(s) |
|---|---|---|
| **G0: Contract** | ADRs decided; shared actors/cases/errors/events approved, PR0 merged | All, led by M1 |
| **G1: Core** | 401/403 rejects; no invalid stage; scoped persisted cases; two explained routes | M1 |
| **G2: Scrutiny/EVC** | Signed D1/D2/C3 snapshot; forbidden C3 correction rejected; conditional EVC task once | M2 with M1 |
| **G3: Decision/compliance** | Fictional competent actor's decision atomically creates applicable obligation; document submitted ≠ verified | M1 + M3 |
| **G4: Alerts/monitoring** | Timer retry deduped and outdated timer canceled; dashboards from real scoped records; default tests fixed | M3 + M1 |
| **G5: Demo** | Full 10-step golden path and alternative route, screenshots, negative tests, coherent audit | All |

Review `05_TESTS/REQUIREMENTS_B01_B14.csv`, `05_TESTS/ACCEPTANCE_T01_T28.csv`, `05_TESTS/TEST_STRATEGY_AND_GOLDEN_PATH.md`, and `05_TESTS/QA_EXECUTION_TEMPLATE.md`. Run `npm run lint`, `npm run build` and relevant targeted tests after approved dependency setup. **Known baseline:** `npm test` currently fails due to the mixed `node:test`/Vitest discovery; do not falsely claim full test green. Member 1 coordinates fixing the default command early.

## 9. Non-negotiable safety and research boundaries

- Keep the current React/Vite/Express architecture unless the team approves a justified change; no unreviewed migration.
- Authenticated server-side role/institution/region checks control every read, mutation, evidence download and decision—never trust frontend role switching.
- Use fictional institutions and synthetic files; don't commit `.env`, API keys, personal records or `node_modules`/`dist`.
- No real AICTE API or legal approval authority is claimed. The final decision is recorded by a separately authorized **fictional demo authority**, not an automatic AI decision.
- Policy source versions must be pinned; unresolved 2026–27 X=360 stays `POLICY_REVIEW_REQUIRED`. Re-scrutiny ordinarily addresses only signed deficiencies (e.g. D1/D2), not cleared C3. EVC is conditional. Official academic deadlines are different from invented demo SLAs.
- A passing frontend build or mock test does not prove functional integration. Capture real negative tests and end-to-end evidence before showing a feature as completed.

**Where to start right now:** (1) Make the documentation accessible on `main` by reviewing/merging the docs-only PR; (2) all three read and approve the shared decisions/contracts; (3) Member 1 prepares PR0 while Members 2 and 3 start mock-backed independent tests; (4) merge in gate order, validating after each PR.
