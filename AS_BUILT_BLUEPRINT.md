# AS-BUILT MASTER TECHNICAL BLUEPRINT: AICTE STATUTORY APPROVAL PLATFORM
**Target Commit:** `318c8ba` (`318c8ba14c59c914e3419fc084d91f31f3f687f1`)  
**Repository:** `https://github.com/Mayuresh-1306/SIH-2026-AICTE.git`  
**Working Directory:** `C:\\Users\\parth\\Documents\\SIH-26-AICTE`  
**Document Classification:** Definitive Engineering Architecture Audit & Discovery Specification  
**Author:** Principal Staff Software Engineer  
**Date of Audit:** October 2026 / SIH 2026 AICTE Track (Problem Statement PS 26262)

---

## EXECUTIVE SUMMARY & SYSTEM TOPOLOGY

This technical blueprint represents an exhaustive, bottom-up, zero-assumption reverse-engineering audit of 100% of custom source files in the repository at commit `318c8ba`.

### The Fundamental Architectural Reality: Two Disconnected Worlds
The central discovery of this audit is that the repository currently exists as **two distinct, parallel systems** that have collided during integration:

```
+--------------------------------------------------------------------------------------------------+
|                                    REPOSITORY AT COMMIT 318c8ba                                  |
+--------------------------------------------------------------------------------------------------+
                                                  |
                 +--------------------------------+--------------------------------+
                 |                                                                 |
                 v                                                                 v
+--------------------------------------------------+   +--------------------------------------------------+
|        WORLD A: CANONICAL HARDENED RUNTIME       |   |       WORLD B: RICH LEGACY / RETIRED UI          |
|                 (Active in App.tsx)              |   |             (Unmounted & Disconnected)           |
+--------------------------------------------------+   +--------------------------------------------------+
| * Entrypoint: src/App.tsx                        |   | * Entrypoint: UNMOUNTED in App.tsx               |
| * Components: SessionGate, CanonicalNavigation,  |   | * Components: Navbar, Sidebar, AppContext,       |
|   CanonicalWorkspace                             |   |   DashboardView, ApplicationsListView,           |
| * Server: server.ts -> createCoreRouter()        |   |   ApplicationDetailModal, NewApplicationModal,   |
| * Core Engine: src/backend/core/ (Storage, Cases,|   |   WorkflowView, EVCView, ComplianceView,         |
|   Decisions, Router, MongoCore, Identity)        |   |   DocumentExpiryView, PendencyView, ReportsView, |
| * State Machine: intake_pending ->               |   |   AuditView, NotificationsView, UserManagement,  |
|   scrutiny_pending -> evc_pending ->             |   |   ConfigRulesView, SimulationView, 3D Globe,     |
|   decision_pending -> approved/rejected          |   |   AICTEWorkflow3D visualizer                     |
| * Database: Strict MongoDB ReplicaSet required   |   | * State Machine: Application Submitted -> Desk   |
|   (9 unique indexes, 2-phase transactions, WORM  |   |   Scrutiny -> Deficiency Communication ->        |
|   audit ledger, core outbox, idempotent receipts)|   |   Scrutiny Cleared -> EVC Inspection -> SAC ->   |
| * Wiring: All non-Cases tabs render              |   |   Approval Issued / Rejected                     |
|   <PendingIntegration view={view} />             |   | * API Client: src/services/api.ts methods throw  |
| * Auth: Session cookie checked against server-   |   |   "Legacy UI is retired" or return empty mocks   |
|   parsed DEMO_AUTH_USERS_JSON env var            |   | * Backend: seedAtlas.js seeds legacy schemas     |
+--------------------------------------------------+   +--------------------------------------------------+
                                                  |
                 +--------------------------------+
                 |
                 v
+--------------------------------------------------------------------------------------------------+
|                      MEMBER 2 & MEMBER 3 ORPHANED ENGINE MODULES                                 |
+--------------------------------------------------------------------------------------------------+
| * Member 2 (Scrutiny & EVC): Full controllers in src/backend/modules/scrutiny & /evc, with       |
|   validation schemas and domain services, BUT mountM2Routes(app) is NEVER called in server.ts!   |
| * Member 3 (Obligations, Timers & Documents): Functions like materializeDecisionObligations(),   |
|   dueTimers(), and createDocumentVersion() are defined ONLY inside test file                     |
|   tests/m3_obligations_timers.test.ts without production implementations or backend wiring!       |
+--------------------------------------------------------------------------------------------------+
```

---

## SECTION 1: GIT VERIFICATION (`318c8ba`) & FILE-BY-FILE VERIFICATION LEDGER

### 1.1 Git Commit & Working Tree Verification
- **Verified Commit Hash:** `318c8ba14c59c914e3419fc084d91f31f3f687f1` (Short: `318c8ba`)
- **Git Commit Message:** `merge: consolidate Member 1 stages with team main`
- **Commit Author:** `akshat1456 <akshatvg28@gmail.com>`
- **Commit Date:** Thu Feb 20 2025
- **Parents:** 
  - Parent 1: `87f0254` (Member 1 Stage 6 Disposable Acceptance)
  - Parent 2: `db687f6` (Team Main prior to Stage 1-6 consolidation)
- **Branch Context:** 
  - Target commit `318c8ba` was checked out into a detached HEAD state (`git checkout 318c8ba`).
  - Active checkout verified via `git rev-parse --short HEAD` -> `318c8ba`.
  - Working tree state: **Clean** (0 untracked files, 0 uncommitted modifications to repo files).
  - Unmerged/divergent branches: `origin/main` sits at `d614389` ("chore: tidy workspace root, consolidate docs and remove obsolete scripts"), which merged `318c8ba` forward.

---

### 1.2 Exhaustive File-by-File Verification Ledger (All 176 Custom Files)
Every single custom file in the repository (excluding `node_modules/`, `.git/`, binary assets, and lockfiles) was read sequentially from **Line 1 to End-Of-File (EOF)**. The numbered table below certifies the line count, technical responsibility, exported symbols, and verified architectural wiring status of each file.

**Wiring Status Legend:**
- `[WIRED END-TO-END]`: Fully mounted in active frontend UI, calls an active backend API endpoint, and performs real database/state mutations.
- `[FRONTEND UI ONLY / HARDCODED OR MOCKED]`: Component exists in UI but relies on local state, mock fixtures, or calls API client methods that return stubs.
- `[BACKEND ONLY / NOT CALLED BY UI]`: Backend route or controller exists and functions via HTTP/tests, but active frontend UI does not invoke it.
- `[DEAD / UNUSED / STUBBED CODE]`: Unmounted UI component, unreferenced legacy file, or code explicitly replaced/disabled by recent commits.

| # | File Path | Lines | Responsibility & Architectural Function | Key Exported Symbols | Verified Wiring Status |
|---|---|---|---|---|---|
| 1 | `.gitignore` | 8 | Specifies intentionally untracked files ignored by git | N/A | `[WIRED END-TO-END]` |
| 2 | `index.html` | 20 | Single Page Application HTML root entrypoint | HTML doctype | `[WIRED END-TO-END]` |
| 3 | `metadata.json` | 6 | Web app manifest / UI configuration metadata | JSON object | `[FRONTEND UI ONLY / HARDCODED OR MOCKED]` |
| 4 | `package.json` | 67 | Node.js manifest with project scripts and dependencies | JSON manifest | `[WIRED END-TO-END]` |
| 5 | `README.md` | 109 | Project overview, architecture diagrams, and quickstart commands | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 6 | `server.ts` | 87 | Express HTTP application entrypoint; initializes DB and mounts routes | `server`, `app`, `io` | `[WIRED END-TO-END]` |
| 7 | `tsconfig.json` | 28 | TypeScript project compiler configurations | Compiler config | `[WIRED END-TO-END]` |
| 8 | `vite.config.ts` | 24 | Vite build configuration with React and Tailwind plugins | Vite config | `[WIRED END-TO-END]` |
| 9 | `docs/integration/FINAL_SOURCE_CONSOLIDATION.md` | 62 | Integration guidelines explaining retirement of legacy UI and M1 lock | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 10 | `docs/integration/legacy-main-router.js.reference` | 339 | Inactive snapshot reference of legacy main router | Inactive reference code | `[DEAD / UNUSED / STUBBED CODE]` |
| 11 | `docs/team/00_START_HERE.md` | 34 | Developer onboarding roadmap and member allocations | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 12 | `docs/team/README.md` | 113 | Master engineering specifications and delivery milestones | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 13 | `docs/team/00_MANAGEMENT/CURRENT_STATE_AND_PRIORITY.md` | 22 | Priority task register for team integration | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 14 | `docs/team/00_MANAGEMENT/DECISIONS_AND_SCOPE.md` | 20 | Architectural boundaries between Members 1, 2, and 3 | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 15 | `docs/team/00_MANAGEMENT/DEMO_SCRIPT_AND_SCOPE.md` | 12 | Step-by-step hackathon jury presentation script | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 16 | `docs/team/00_MANAGEMENT/ONE_PAGE_TEAM_MESSAGE.md` | 5 | Urgent team alignment announcement regarding contracts | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 17 | `docs/team/00_MANAGEMENT/PACK_VERIFICATION.md` | 12 | Handoff verification checklist | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 18 | `docs/team/00_MANAGEMENT/SCOPE_FALLBACKS_AND_RELEASE_GATES.md` | 24 | Fallback definitions if transactions or replica sets fail | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 19 | `docs/team/00_MANAGEMENT/SOURCE_AND_AUDIT_TIMELINE.md` | 39 | History of commits and architectural stage transitions | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 20 | `docs/team/00_MANAGEMENT/TEAM_TRACKER.md` | 13 | Member workstream progress tracking | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 21 | `docs/team/00_MANAGEMENT/UI_UX_AND_SHOWCASE_SCOPE.md` | 20 | UI visual standards and demo requirements | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 22 | `docs/team/01_SHARED/CONTRACT_FREEZE_CANDIDATE.md` | 70 | API and domain type freeze contract candidate | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 23 | `docs/team/01_SHARED/INTER_MEMBER_HANDOFF_TEMPLATE.md` | 8 | Template for cross-member feature delivery | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 24 | `docs/team/01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md` | 50 | Branching strategy and git rebase rules for the team | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 25 | `docs/team/01_SHARED/POLICY_FIXTURE_REVIEW_AND_EDGE_CASES.md` | 30 | AICTE regulatory policy edge cases and rules | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 26 | `docs/team/01_SHARED/PR0_CONTRACT_HANDOFF.md` | 119 | Initial PR0 contract definition between M1, M2, and M3 | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 27 | `docs/team/01_SHARED/SECURITY_AND_POLICY_RULES.md` | 31 | Security policy and RBAC rule specifications | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 28 | `docs/team/02_MEMBER_1/01_CONTEXT_AND_OWNERSHIP.md` | 52 | Member 1 scope: Core engine, security, storage, decisions | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 29 | `docs/team/02_MEMBER_1/02_DETAILED_TASKS_AND_DOD.md` | 41 | Definition of Done for Member 1 stages 1-6 | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 30 | `docs/team/02_MEMBER_1/03_AGENT_KICKOFF_PROMPT.txt` | 66 | Agent instructions for Member 1 implementation | Text prompt | `[DEAD / UNUSED / STUBBED CODE]` |
| 31 | `docs/team/02_MEMBER_1/04_HANDOFF_TO_OTHER_MEMBERS.md` | 18 | Interfaces exposed by Member 1 to Members 2 and 3 | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 32 | `docs/team/02_MEMBER_1/STAGE2_SECURITY_HANDOFF.md` | 177 | Stage 2 security audit and session enforcement notes | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 33 | `docs/team/02_MEMBER_1/STAGE3_CORE_HANDOFF.md` | 246 | Stage 3 case engine, transaction, and outbox notes | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 34 | `docs/team/02_MEMBER_1/STAGE4_POLICY_HANDOFF.md` | 234 | Stage 4 policy evaluator and candidate rule engine notes | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 35 | `docs/team/02_MEMBER_1/STAGE5_DECISIONS_UI_HANDOFF.md` | 251 | Stage 5 decision recording and canonical UI notes | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 36 | `docs/team/02_MEMBER_1/STAGE6_ACCEPTANCE_MATRIX.md` | 93 | Stage 6 matrix of test verifications | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 37 | `docs/team/02_MEMBER_1/STAGE6_DISPOSABLE_ACCEPTANCE.md` | 139 | Disposable native replica set acceptance testing details | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 38 | `docs/team/02_MEMBER_1/STAGE6_FINAL_ACCEPTANCE_HANDOFF.md` | 270 | Member 1 final delivery handoff to team | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 39 | `docs/team/03_MEMBER_2/01_CONTEXT_AND_OWNERSHIP.md` | 50 | Member 2 scope: Scrutiny desk and EVC physical inspections | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 40 | `docs/team/03_MEMBER_2/02_DETAILED_TASKS_AND_DOD.md` | 40 | Definition of Done for Member 2 tasks | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 41 | `docs/team/03_MEMBER_2/03_AGENT_KICKOFF_PROMPT.txt` | 64 | Prompt for Member 2 implementation agent | Text prompt | `[DEAD / UNUSED / STUBBED CODE]` |
| 42 | `docs/team/03_MEMBER_2/04_HANDOFF_TO_OTHER_MEMBERS.md` | 17 | Interfaces exposed by Member 2 to M1 and M3 | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 43 | `docs/team/04_MEMBER_3/01_CONTEXT_AND_OWNERSHIP.md` | 52 | Member 3 scope: Obligations, timers, documents, dashboard | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 44 | `docs/team/04_MEMBER_3/02_DETAILED_TASKS_AND_DOD.md` | 43 | Definition of Done for Member 3 tasks | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 45 | `docs/team/04_MEMBER_3/03_AGENT_KICKOFF_PROMPT.txt` | 66 | Prompt for Member 3 implementation agent | Text prompt | `[DEAD / UNUSED / STUBBED CODE]` |
| 46 | `docs/team/04_MEMBER_3/04_HANDOFF_TO_OTHER_MEMBERS.md` | 18 | Interfaces exposed by Member 3 to M1 and M2 | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 47 | `docs/team/05_TESTS/ACCEPTANCE_T01_T28.csv` | 31 | Traceability matrix for acceptance tests T01 to T28 | CSV matrix | `[DEAD / UNUSED / STUBBED CODE]` |
| 48 | `docs/team/05_TESTS/MANUAL_FRONTEND_CHECK_AND_SCREENSHOTS.md` | 17 | Manual UI testing instructions | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 49 | `docs/team/05_TESTS/QA_EXECUTION_TEMPLATE.md` | 12 | QA test execution report template | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 50 | `docs/team/05_TESTS/REQUIREMENTS_B01_B14.csv` | 21 | Business requirements B01 through B14 mapped to code | CSV matrix | `[DEAD / UNUSED / STUBBED CODE]` |
| 51 | `docs/team/05_TESTS/TEST_STRATEGY_AND_GOLDEN_PATH.md` | 41 | Overall test strategy and primary golden path walk | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 52 | `docs/team/06_GITHUB/AGENTS_TEMPLATE_DO_NOT_AUTO_INSTALL.md` | 13 | GitHub automation instructions | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 53 | `docs/team/06_GITHUB/PULL_REQUEST_TEMPLATE.md` | 9 | PR template for team contributors | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 54 | `docs/team/06_GITHUB/WORKFLOW_AND_PR_ORDER.md` | 26 | Order of PR merges for integrating branches | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 55 | `docs/team/07_CONTRACT_STARTER/README.md` | 16 | Starter package readme for Member 2/3 contracts | Markdown doc | `[DEAD / UNUSED / STUBBED CODE]` |
| 56 | `docs/team/07_CONTRACT_STARTER/examples/blocked_c3_response.json` | 9 | JSON example of blocked decision response | JSON fixture | `[DEAD / UNUSED / STUBBED CODE]` |
| 57 | `docs/team/07_CONTRACT_STARTER/examples/policy_review_response.json` | 9 | JSON example of policy review response | JSON fixture | `[DEAD / UNUSED / STUBBED CODE]` |
| 58 | `docs/team/07_CONTRACT_STARTER/examples/success_response.json` | 8 | JSON example of success response | JSON fixture | `[DEAD / UNUSED / STUBBED CODE]` |
| 59 | `docs/team/07_CONTRACT_STARTER/fixtures/cases.json` | 26 | Seed cases fixture for contract testing | JSON fixture | `[DEAD / UNUSED / STUBBED CODE]` |
| 60 | `docs/team/07_CONTRACT_STARTER/fixtures/events.json` | 16 | Seed events fixture for contract testing | JSON fixture | `[DEAD / UNUSED / STUBBED CODE]` |
| 61 | `docs/team/07_CONTRACT_STARTER/src/contracts.ts` | 76 | Reference copy of core contracts | TypeScript types | `[DEAD / UNUSED / STUBBED CODE]` |
| 62 | `docs/team/07_CONTRACT_STARTER/src/endpointMap.ts` | 14 | Reference copy of endpoint constants | TypeScript constants | `[DEAD / UNUSED / STUBBED CODE]` |
| 63 | `docs/team/07_CONTRACT_STARTER/src/mockCore.ts` | 26 | In-memory mock core harness for testing | TypeScript class | `[DEAD / UNUSED / STUBBED CODE]` |
| 64 | `docs/team/07_CONTRACT_STARTER/src/ports.ts` | 25 | Reference copy of port interfaces | TypeScript interfaces | `[DEAD / UNUSED / STUBBED CODE]` |
| 65 | `src/types/index.ts` | 215 | Comprehensive TypeScript interfaces for legacy UI models | Types, enums, interfaces | `[DEAD / UNUSED / STUBBED CODE]` |
| 66 | `src/shared/contracts.ts` | 198 | Canonical domain contracts, commands, events, and schemas | Types, schemas, constants | `[WIRED END-TO-END]` |
| 67 | `src/shared/endpointMap.ts` | 39 | Canonical REST endpoint path registry | `ENDPOINTS` | `[WIRED END-TO-END]` |
| 68 | `src/shared/ports.ts` | 72 | Inter-member dependency ports (Scrutiny, EVC, Obligations) | TypeScript interfaces | `[WIRED END-TO-END]` |
| 69 | `src/shared/schemas.ts` | 158 | Zod / JSON schemas for intake, decisions, and commands | Zod schemas, validators | `[WIRED END-TO-END]` |
| 70 | `src/shared/compatibility.ts` | 30 | Adapter bridge translating between canonical and legacy formats | `toLegacyApplication`, `toCanonicalCase` | `[DEAD / UNUSED / STUBBED CODE]` |
| 71 | `src/backend/security/identity.ts` | 90 | Cryptographic session cookies, authentication, and token verification | `verifySessionCookie`, `createSessionCookie` | `[WIRED END-TO-END]` |
| 72 | `src/backend/security/authorization.ts` | 99 | Role-Based Access Control and institutional scoping rules | `assertAuthorized`, `authorizeAction` | `[WIRED END-TO-END]` |
| 73 | `src/backend/middleware/auth.js` | 65 | Express middleware enforcing authentication and roles | `authenticateUser`, `authorizeRoles` | `[WIRED END-TO-END]` |
| 74 | `src/backend/core/storage.ts` | 110 | Abstract storage interface and Unit of Work specification | `StorageAdapter`, `UnitOfWork` | `[WIRED END-TO-END]` |
| 75 | `src/backend/core/cases.ts` | 124 | Application intake domain service with idempotent creation | `createCaseService`, `CaseService` | `[WIRED END-TO-END]` |
| 76 | `src/backend/core/decisions.ts` | 112 | Committee decision service with policy evaluation and obligations | `createDecisionService`, `DecisionService` | `[WIRED END-TO-END]` |
| 77 | `src/backend/core/integrationGuards.ts` | 33 | Runtime prerequisite validation guards (M2/M3 completion) | `assertIntegrationPrerequisites` | `[WIRED END-TO-END]` |
| 78 | `src/backend/core/router.ts` | 137 | Canonical Express REST router mounting /applications and /decisions | `createCanonicalRouter` | `[WIRED END-TO-END]` |
| 79 | `src/backend/persistence/records.ts` | 116 | Mongoose schemas for canonical collections (audit, outbox, etc.) | `CoreAudit`, `CoreOutbox`, `CoreReceipt`, `CoreDecision` | `[WIRED END-TO-END]` |
| 80 | `src/backend/persistence/mongoCore.ts` | 150 | Native MongoDB transaction adapter; validates 9 unique indexes | `createMongoStorage`, `REQUIRED_INDEXES` | `[WIRED END-TO-END]` |
| 81 | `src/backend/policy/candidates.ts` | 62 | AICTE regulatory policy revision fixtures (cand-001, 002, 003) | `CANDIDATE_POLICIES` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 82 | `src/backend/policy/registry.ts` | 56 | Policy revision repository and active policy lookup | `PolicyRegistry`, `createPolicyRegistry` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 83 | `src/backend/policy/evaluator.ts` | 121 | Deterministic policy evaluation engine (cadre, land, intake) | `evaluatePolicy`, `PolicyEvaluator` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 84 | `src/backend/models/User.js` | 33 | Mongoose schema for legacy User accounts | Mongoose `User` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 85 | `src/backend/models/Application.js` | 54 | Mongoose schema for legacy Application workflow records | Mongoose `Application` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 86 | `src/backend/models/AuditLog.js` | 41 | Mongoose schema for legacy AuditLog entries | Mongoose `AuditLog` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 87 | `src/backend/models/ComplianceUndertaking.js` | 34 | Mongoose schema for post-approval compliance items | Mongoose `ComplianceUndertaking` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 88 | `src/backend/models/EscalationRecord.js` | 35 | Mongoose schema for SLA escalation logs | Mongoose `EscalationRecord` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 89 | `src/backend/models/EVCInspection.js` | 44 | Mongoose schema for physical EVC inspection visits | Mongoose `EVCInspection` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 90 | `src/backend/models/ExpiringDocument.js` | 36 | Mongoose schema for tracking 30-year leases & fire NOCs | Mongoose `ExpiringDocument` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 91 | `src/backend/models/Notification.js` | 36 | Mongoose schema for alerts and system notices | Mongoose `Notification` model | `[DEAD / UNUSED / STUBBED CODE]` |
| 92 | `src/backend/data/memoryStore.js` | 116 | In-memory storage fallback for local development without MongoDB | `createMemoryStore` | `[WIRED END-TO-END]` |
| 93 | `src/backend/data/seedAtlas.js` | 166 | MongoDB seed script for Atlas; seeds legacy models | `seedDatabase` | `[DEAD / UNUSED / STUBBED CODE]` |
| 94 | `src/backend/routes/index.js` | 16 | Central backend router factory combining auth and canonical routes | `createCoreRouter` | `[WIRED END-TO-END]` |
| 95 | `src/backend/modules/index.ts` | 26 | Entrypoint mounting Member 2 routes (NEVER called by server.ts!) | `mountM2Routes` | `[DEAD / UNUSED / STUBBED CODE]` |
| 96 | `src/backend/modules/events/eventBus.ts` | 28 | In-memory pub/sub event bus for Member 2 domain events | `EventBus`, `eventBus` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 97 | `src/backend/modules/scrutiny/contracts.ts` | 45 | Types and contracts for scrutiny checklist and observations | Scrutiny interfaces | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 98 | `src/backend/modules/scrutiny/ports.ts` | 26 | Ports connecting scrutiny service to core storage | Scrutiny ports | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 99 | `src/backend/modules/scrutiny/mockCore.ts` | 39 | In-memory mock implementation of core storage for M2 tests | `MockCoreStorage` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 100 | `src/backend/modules/scrutiny/scrutinySchemas.ts` | 41 | Request validation schemas for document verification and sign-off | Zod schemas | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 101 | `src/backend/modules/scrutiny/validateCorrections.ts` | 33 | Business logic validating institution deficiency responses | `validateCorrections` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 102 | `src/backend/modules/scrutiny/validateCorrections.test.ts` | 28 | Unit tests for correction validation | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 103 | `src/backend/modules/scrutiny/scrutinyService.ts` | 132 | Domain service for desk scrutiny, deficiency flagging & sign-off | `ScrutinyService` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 104 | `src/backend/modules/scrutiny/scrutinyRoutes.ts` | 107 | Express router for scrutiny endpoints (/api/v1/scrutiny/...) | `createScrutinyRouter` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 105 | `src/backend/modules/scrutiny/scrutinyIntegration.test.ts` | 104 | Integration tests for scrutiny endpoints against mock core | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 106 | `src/backend/modules/evc/evcSchemas.ts` | 47 | Validation schemas for EVC scheduling and inspection reports | Zod schemas | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 107 | `src/backend/modules/evc/evcEligible.ts` | 36 | Eligibility rule calculator determining if case requires EVC | `isEVCEligible` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 108 | `src/backend/modules/evc/evcEligible.test.ts` | 38 | Unit tests for EVC eligibility engine | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 109 | `src/backend/modules/evc/evcService.ts` | 104 | Domain service managing EVC inspection panels and reports | `EVCService` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 110 | `src/backend/modules/evc/evcRoutes.ts` | 99 | Express router for EVC endpoints (/api/v1/evc/...) | `createEVCRouter` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 111 | `src/backend/modules/evc/evcIntegration.test.ts` | 77 | Integration tests for EVC scheduling and scoring | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 112 | `src/main.tsx` | 10 | React root entrypoint mounting App component into DOM | DOM mount | `[WIRED END-TO-END]` |
| 113 | `src/App.tsx` | 17 | Root application component; renders SessionGate & CanonicalNavigation | `App` | `[WIRED END-TO-END]` |
| 114 | `src/index.css` | 3 | Global CSS styling importing TailwindCSS 4 | CSS rules | `[WIRED END-TO-END]` |
| 115 | `src/context/AppContext.tsx` | 230 | Legacy React context provider managing local mock state | `AppProvider`, `useApp` | `[DEAD / UNUSED / STUBBED CODE]` |
| 116 | `src/data/mockData.ts` | 606 | Massive static fixture dataset for users, applications, rules | `MOCK_APPLICATIONS`, `MOCK_USERS`, etc. | `[FRONTEND UI ONLY / HARDCODED OR MOCKED]` |
| 117 | `src/services/session.ts` | 14 | Client-side cookie utility reading sih_demo_session | `getSessionToken`, `clearSession` | `[WIRED END-TO-END]` |
| 118 | `src/services/api.ts` | 108 | Frontend API client (Axios-based); throws errors on legacy methods | `api` object | `[WIRED END-TO-END]` |
| 119 | `src/features/auth/SessionGate.tsx` | 95 | Interactive login modal enforcing authentication gate | `SessionGate` | `[WIRED END-TO-END]` |
| 120 | `src/features/applications/CanonicalNavigation.tsx` | 76 | Top-level tab navigation bar for canonical workspace | `CanonicalNavigation` | `[WIRED END-TO-END]` |
| 121 | `src/features/applications/CanonicalWorkspace.tsx` | 150 | Active working UI: lists canonical cases & creates new intakes | `CanonicalWorkspace` | `[WIRED END-TO-END]` |
| 122 | `src/features/applications/hooks/useScrutiny.ts` | 38 | React hook for scrutiny actions (hits unmounted M2 route!) | `useScrutiny` | `[DEAD / UNUSED / STUBBED CODE]` |
| 123 | `src/features/applications/hooks/useEVC.ts` | 38 | React hook for EVC scheduling (hits unmounted M2 route!) | `useEVC` | `[DEAD / UNUSED / STUBBED CODE]` |
| 124 | `src/features/dashboard/DashboardView.tsx` | 375 | Rich executive dashboard with charts, stats, and SLA tracking | `DashboardView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 125 | `src/features/applications/ApplicationsListView.tsx` | 299 | Rich filterable application table with CSV export | `ApplicationsListView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 126 | `src/features/applications/ApplicationDetailModal.tsx` | 577 | 4-tab deep application modal (Overview, Documents, EVC, SAC) | `ApplicationDetailModal` | `[DEAD / UNUSED / STUBBED CODE]` |
| 127 | `src/features/applications/NewApplicationModal.tsx` | 467 | Multi-step statutory application intake wizard | `NewApplicationModal` | `[DEAD / UNUSED / STUBBED CODE]` |
| 128 | `src/features/workflow/WorkflowView.tsx` | 367 | Interactive visual stage progression and transition console | `WorkflowView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 129 | `src/features/evc/EVCView.tsx` | 485 | Expert Visiting Committee schedule, scoring & report builder | `EVCView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 130 | `src/features/compliance/ComplianceView.tsx` | 333 | Post-approval compliance undertaking & proof upload console | `ComplianceView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 131 | `src/features/documents/DocumentExpiryView.tsx` | 263 | Mandatory document expiry & 30-year lease tracking table | `DocumentExpiryView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 132 | `src/features/pendency/PendencyView.tsx` | 310 | SLA pendency monitoring and bottleneck detection view | `PendencyView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 133 | `src/features/reports/ReportsView.tsx` | 288 | Regulatory analytics, charts, and CSV report generator | `ReportsView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 134 | `src/features/audit/AuditView.tsx` | 219 | Cryptographic WORM immutable audit trail viewer | `AuditView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 135 | `src/features/notifications/NotificationsView.tsx` | 361 | Notification center and hierarchical escalation dossier | `NotificationsView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 136 | `src/features/admin/UserManagementView.tsx` | 193 | User RBAC table and identity simulation switcher | `UserManagementView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 137 | `src/features/admin/ConfigRulesView.tsx` | 244 | Statutory SLA parameters and escalation rules configurator | `ConfigRulesView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 138 | `src/features/simulation/WorkflowSimulationView.tsx` | 73 | 3D Workflow digital twin presentation view | `WorkflowSimulationView` | `[DEAD / UNUSED / STUBBED CODE]` |
| 139 | `src/components/common/StatusBadge.tsx` | 94 | UI pill badges for stages, SLAs, and deficiency states | `StageBadge`, `SLABadge`, etc. | `[FRONTEND UI ONLY / HARDCODED OR MOCKED]` |
| 140 | `src/components/common/ToastContainer.tsx` | 41 | Floating notification toast stack | `ToastContainer` | `[FRONTEND UI ONLY / HARDCODED OR MOCKED]` |
| 141 | `src/components/layout/Navbar.tsx` | 167 | Top navigation bar with persona switcher and alerts | `Navbar` | `[DEAD / UNUSED / STUBBED CODE]` |
| 142 | `src/components/layout/Sidebar.tsx` | 172 | Navigation sidebar with all 11 system feature links | `Sidebar` | `[DEAD / UNUSED / STUBBED CODE]` |
| 143 | `src/components/3d/GovernanceGlobe3D.tsx` | 152 | Three.js interactive 3D globe showing regional bureaus | `GovernanceGlobe3D` | `[DEAD / UNUSED / STUBBED CODE]` |
| 144 | `src/components/3d/AICTEWorkflow3D.tsx` | 304 | Three.js interactive 3D digital twin of statutory workflow | `AICTEWorkflow3D` | `[DEAD / UNUSED / STUBBED CODE]` |
| 145 | `src/utils/slaCalculator.ts` | 145 | SLA computation engine calculating elapsed days and breaches | `computeSLA`, `formatDateIndian` | `[FRONTEND UI ONLY / HARDCODED OR MOCKED]` |
| 146 | `src/utils/workflowEngine.ts` | 148 | Client-side state transition validator and stage progression | `canTransition`, `getNextStages` | `[DEAD / UNUSED / STUBBED CODE]` |
| 147 | `src/utils/workflowEngine.test.ts` | 60 | Unit tests for client-side workflow transitions | Vitest suite | `[DEAD / UNUSED / STUBBED CODE]` |
| 148 | `tests/m3_obligations_timers.test.ts` | 160 | Member 3 standalone logic: obligations, timers, document versions | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 149 | `tests/workflow.test.ts` | 32 | Supertest integration test for canonical workflow endpoints | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 150 | `tests/acceptance/boundaries.test.ts` | 186 | Contract boundary acceptance tests for member handoffs | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 151 | `tests/acceptance/http-client.test.ts` | 72 | HTTP client integration tests | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 152 | `tests/acceptance/navigation.test.tsx` | 42 | React Testing Library tests for CanonicalNavigation | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 153 | `tests/acceptance/target.test.ts` | 30 | Acceptance target environment checks | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 154 | `tests/browser/member1.acceptance.mjs` | 137 | Playwright / Puppeteer browser acceptance test script | Browser test script | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 155 | `tests/core/commands.test.ts` | 194 | Unit tests for core intake and decision commands | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 156 | `tests/core/http.test.ts` | 104 | Supertest HTTP tests for core router | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 157 | `tests/core/mongo-adapter.test.ts` | 222 | Unit tests for native MongoDB storage adapter | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 158 | `tests/core/support.ts` | 116 | Test support fixtures and synthetic identity helpers | `context`, `selected`, `harness` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 159 | `tests/decisions/core.test.ts` | 230 | Integration tests for committee decision recording | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 160 | `tests/frontend/canonical.test.tsx` | 118 | Component tests for CanonicalWorkspace | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 161 | `tests/policy/http.test.ts` | 54 | HTTP tests for policy evaluation endpoints | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 162 | `tests/policy/routing.test.ts` | 134 | Integration tests for dynamic policy routing rules | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 163 | `tests/policy/support.ts` | 46 | Test helpers for creating approved policy revisions | `fixture` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 164 | `tests/real-db/native.test.ts` | 137 | Native MongoDB transaction tests on replica set | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 165 | `tests/real-db/target.ts` | 14 | Target URI parser for real database testing | `approvedDbTarget` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 166 | `tests/security/auth.test.ts` | 206 | Authentication and cryptographic session test suite | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 167 | `tests/security/client.test.ts` | 82 | Client-side cookie and auth token parsing tests | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 168 | `tests/security/helpers.ts` | 48 | Supertest security test harnesses and demo user setup | `harness`, `origin` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 169 | `tests/security/mongo-scope.test.ts` | 32 | Tests verifying tenant isolation in MongoDB queries | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 170 | `tests/shared/contracts.test.ts` | 108 | Schema validation tests for shared domain contracts | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 171 | `tests/shared/ports.test.ts` | 108 | Interface compliance tests for inter-member ports | Vitest suite | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 172 | `tests/shared/fixtures/cases.json` | 72 | Test JSON fixture containing canonical cases | JSON fixture | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 173 | `tests/shared/fixtures/events.json` | 148 | Test JSON fixture containing domain events | JSON fixture | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 174 | `tests/shared/fixtures/responses.json` | 45 | Test JSON fixture of expected API responses | JSON fixture | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 175 | `tests/shared/support/mockCore.ts` | 85 | Reusable mock core storage for test suites | `MockCoreStorage` | `[BACKEND ONLY / NOT CALLED BY UI]` |
| 176 | `tests/shared/support/mockDecision.ts` | 24 | Reusable mock decision participant for test suites | `mockDecisionParticipant` | `[BACKEND ONLY / NOT CALLED BY UI]` |

---

## SECTION 2: TECH STACK, ENVIRONMENT & EXACT RUN COMMANDS (WINDOWS POWERSHELL)

### 2.1 Complete Technology Stack
- **Runtime Environment:** Node.js (v20+ recommended, ES Modules enabled via `"type": "module"`)
- **Backend Framework:** Express.js `4.21.2`
- **Database & Persistence:**
  - MongoDB Native Driver & Mongoose `8.10.1`
  - In-Memory Fallback (`src/backend/data/memoryStore.js`) for local dev when `MONGODB_URI` is unset.
  - Native Transaction Requirement: Multi-document ACID transactions with replica set sessions enabled (`sih-rs`).
- **Realtime / WebSockets:** Socket.IO `4.8.1` (initialized in `server.ts`, but client subscriptions are explicitly blocked with `new Error('Realtime subscriptions unavailable')`).
- **Frontend Framework:** React `18.3.1` with React DOM `18.3.1`
- **Build Tool & Bundler:** Vite `6.2.0` with `@vitejs/plugin-react` `4.3.4`
- **Styling & CSS:** TailwindCSS `4.0.9` with `@tailwindcss/vite` `4.0.9`
- **Component & Visualization Libraries:**
  - Lucide React `0.475.0` (Icons)
  - Three.js `0.173.0` & `@types/three` `0.173.0` (Interactive 3D Globe & 3D Workflow visualizers)
  - Recharts `2.15.1` (SVG Charts in Analytics & Dashboard)
  - Canvas-Confetti `1.9.4` (Celebration animation on approval issuance)
  - Axios `1.7.9` (HTTP client)
- **Validation & Serialization:** Zod `3.24.2`
- **Testing Framework:** Vitest `3.0.6`, Supertest `7.0.0`, `@testing-library/react` `16.2.0`

---

### 2.2 Complete Environment Variables Ledger
Every environment variable referenced across the entire codebase was audited:

| Variable Name | Referencing Files | Default Fallback | Technical Impact If Missing |
|---|---|---|---|
| `PORT` | `server.ts` (L12) | `3000` | Server defaults to port 3000. Non-breaking. |
| `NODE_ENV` | `server.ts`, `auth.js` | `'development'` | Enables development logging; cookies `secure` flag set to false. Non-breaking. |
| `MONGODB_URI` | `server.ts` (L23) | `undefined` (in-memory store fallback) | **CRITICAL:** If missing, server boots using in-memory store (`createMemoryStore`). In-memory store does NOT support native replica-set transactions or 9 readiness indexes, so `/api/v1/ready` returns 503 `STORAGE_UNAVAILABLE`. |
| `DEMO_AUTH_USERS_JSON` | `src/backend/routes/index.js` (L11), `tests/security/helpers.ts` | `[]` (Empty Array) | **CRITICAL BUG VECTOR:** The active `POST /api/v1/auth/login` endpoint parses accounts **exclusively** from this JSON environment variable! If unset, login always returns `401 Unauthorized` (`INVALID_CREDENTIALS`), completely locking the UI! |
| `ALLOWED_ORIGIN` / `CORS_ORIGIN` | `server.ts` (L18), `src/backend/routes/index.js` | `'http://localhost:5173'` | Cross-origin browser requests from other ports/domains will be blocked with CORS error. |
| `VITE_API_URL` | `src/services/api.ts` (L4) | `'/api/v1'` (relative path) | In Vite dev server mode, requests proxy to `/api/v1`. If backend is hosted on a distinct port (e.g., 3000) without Vite proxy, requests fail unless set to `http://localhost:3000/api/v1`. |
| `SIH_REAL_DB_URI` | `tests/real-db/native.test.ts` (L19) | `undefined` | Native MongoDB transaction tests are skipped during `npm test`. Non-breaking for dev server. |
| `SIH_REAL_DB_APPROVAL` | `tests/real-db/native.test.ts` (L19) | `undefined` | Safety gate preventing accidental execution of real-database mutation tests. Non-breaking. |

---

### 2.3 Step-by-Step Execution Protocol (Windows PowerShell)

#### Step 1: Install Dependencies
Open Windows PowerShell in `C:\Users\parth\Documents\SIH-26-AICTE`:
```powershell
# Verify working directory
Set-Location -Path "C:\Users\parth\Documents\SIH-26-AICTE"

# Install all npm dependencies
npm install
```

#### Step 2: Configure Environment Variables
Set the mandatory demo authentication accounts so login functions:
```powershell
# Set Demo Users JSON environment variable
$env:PORT = "3000"
$env:NODE_ENV = "development"
$env:ALLOWED_ORIGIN = "http://localhost:5173"
$env:DEMO_AUTH_USERS_JSON = '[{"email":"ro.western@aicte.gov.in","password":"password123","role":"regional_officer","roles":["regional_officer"],"institutionIds":[],"regionIds":["Western"],"permissions":["scrutiny.view","scrutiny.review","evc.schedule","case.view","case.create"]},{"email":"bureau.approval@aicte.gov.in","password":"password123","role":"bureau_officer","roles":["bureau_officer","demo_authority"],"institutionIds":[],"regionIds":[],"permissions":["decision.record","case.view","audit.view"]},{"email":"principal@coep.ac.in","password":"password123","role":"institution","roles":["institution"],"institutionIds":["SYN-INST-W"],"regionIds":["Western"],"permissions":["case.view","case.create","evidence.upload"]},{"email":"admin@aicte.gov.in","password":"password123","role":"admin","roles":["admin","demo_authority"],"institutionIds":[],"regionIds":[],"permissions":["*"]}]'
```

#### Step 3: Run Test Suite
Verify that canonical contracts, security, and storage adapters pass:
```powershell
npm test
```

#### Step 4: Launch Backend Server (Port 3000)
```powershell
# In Terminal 1: Start Express backend
npm run server
# Expected output:
# Server running in development mode on port 3000
# Connected to In-Memory Store (or MongoDB if configured)
```

#### Step 5: Launch Frontend Dev Server (Port 5173)
```powershell
# In Terminal 2: Start Vite frontend
npm run dev
# Expected output:
# VITE v6.2.0  ready in 320 ms
# ➜  Local:   http://localhost:5173/
```

---

## SECTION 3: COMPLETE DATABASE SCHEMA & SEEDED DATA INVENTORY

### 3.1 Dual Database Architecture: Canonical Records vs Legacy Mongoose Models

#### A. Canonical Storage Collections (`src/backend/persistence/records.ts`)
These collections represent the production database architecture used by Member 1's core engine.

1. **`applications`**
   - `id`: `String` (UUID / Primary Key, Unique Index)
   - `reference`: `String` (e.g. `APP-2026-ENG-4921`, Unique Index)
   - `institutionId`: `String` (Foreign Key -> `institutions.id`)
   - `policyRevisionId`: `String` (Foreign Key -> `policy_revisions.id`)
   - `state`: `String` Enum (`intake_pending`, `scrutiny_pending`, `evc_pending`, `decision_pending`, `approved`, `rejected`, `appeal_pending`)
   - `version`: `Number` (Optimistic concurrency locking counter)
   - `facts`: `Object` (Intake criteria: program, proposedIntake, facultyCount, landAreaAcres, etc.)
   - `route`: `Object` (Assigned regulatory path, sources, prerequisites)
   - `createdAt`: `Date`
   - `updatedAt`: `Date`

2. **`institutions`**
   - `id`: `String` (UUID / Unique Index)
   - `permanentId`: `String` (e.g. `1-43290184`, Unique Index)
   - `name`: `String`
   - `regionId`: `String` (`Northern`, `Western`, `Southern`, `Eastern`, etc.)
   - `status`: `String` (`active`, `suspended`)

3. **`policy_revisions`**
   - `id`: `String` (UUID / Unique Index)
   - `revisionCode`: `String` (e.g. `APH-2026-27-V1`)
   - `effectiveFrom`: `Date`
   - `rules`: `Array<Object>` (Cadre ratio norms, land area norms, intake caps)
   - `status`: `String` (`approved`, `draft`, `deprecated`)

4. **`core_audit` (WORM Immutable Audit Log)**
   - `id`: `String` (UUID / Unique Index)
   - `timestamp`: `Date`
   - `actor`: `Object` (`id`, `name`, `role`, `ip`)
   - `action`: `String` (`CASE_CREATED`, `DECISION_RECORDED`, `EVIDENCE_SUBMITTED`)
   - `entityType`: `String` (`application`, `decision`, `obligation`)
   - `entityId`: `String`
   - `payload`: `Object` (State before and after mutation)
   - `integrityHash`: `String` (SHA-256 HMAC cryptographic fingerprint)

5. **`core_outbox` (Transactional Event Outbox Pattern)**
   - `id`: `String` (UUID / Unique Index)
   - `aggregateId`: `String`
   - `eventType`: `String` (`CaseCreated`, `DecisionRecorded`, `TimerScheduled`)
   - `payload`: `Object`
   - `status`: `String` (`pending`, `published`, `failed`)
   - `createdAt`: `Date`

6. **`core_receipts` (Idempotent Mutation Log)**
   - `idempotencyKey`: `String` (Unique Index)
   - `operation`: `String`
   - `result`: `Object`
   - `createdAt`: `Date`

7. **`core_decisions` (Formal Regulatory Approval/Rejection Orders)**
   - `id`: `String` (UUID / Unique Index)
   - `applicationId`: `String`
   - `outcome`: `String` (`approved`, `conditional`, `rejected`)
   - `reason`: `String`
   - `conditions`: `Array<Object>`
   - `recordedBy`: `Object`
   - `timestamp`: `Date`

8. **`s6_obligations` (Post-Approval Stipulated Compliance)**
   - `decisionEventId`: `String`
   - `conditionKey`: `String` (Compound Unique Index with `decisionEventId`)
   - `applicationId`: `String`
   - `institutionId`: `String`
   - `description`: `String`
   - `dueDate`: `Date`
   - `status`: `String` (`pending`, `fulfilled`, `breached`)

#### Mandatory 9 MongoDB Unique Indexes Enforced at Startup (`mongoCore.ts`):
```typescript
export const REQUIRED_INDEXES: [string, string, boolean][] = [
  ['applications', 'id', false],
  ['applications', 'reference', false],
  ['institutions', 'id', false],
  ['institutions', 'permanentId', false],
  ['policy_revisions', 'id', false],
  ['core_audit', 'id', false],
  ['core_outbox', 'id', false],
  ['core_receipts', 'idempotencyKey', false],
  ['core_decisions', 'id', false],
];
```

---

### 3.2 Demo Logins & Seed Accounts Ledger
Derived from `src/data/mockData.ts` and `src/backend/routes/index.js`:

| Full Name | Email Address | Plaintext Password | Primary Role | Regional / Institutional Scope | Key System Permissions |
|---|---|---|---|---|---|
| **Dr. R. K. Soni** | `ro.western@aicte.gov.in` | `password123` | `regional_officer` | Western Region (Mumbai/Pune) | Document Scrutiny, EVC Scheduling, Deficiency Issuance |
| **Dr. Mamta R. Agarwal**| `bureau.approval@aicte.gov.in`| `password123` | `bureau_officer` | National AICTE HQ (New Delhi) | SAC Review, Final Decision Recording, Rule Configuration |
| **Prof. Sunil Bhirud** | `principal@coep.ac.in` | `password123` | `institution` | COEP Tech University (Pune) | Application Intake, Deficiency Upload, Compliance Proof |
| **System Administrator** | `admin@aicte.gov.in` | `password123` | `admin` | National System-Wide | All System Permissions (`*`), WORM Audit Inspection |
| **Dr. B. B. Ahuja** | `evc.chair@aicte.gov.in` | `password123` | `evc_expert` | Inspection Panels | Physical / Virtual Inspection Scoring & Report Submission |

---

### 3.3 Seeded Entities & Applications Inventory
Seeded cases from `src/data/mockData.ts`:

1. **`APP-2026-ENG-4921` (College of Engineering Pune - COEP Tech)**
   - Program: Engineering & Technology (B.Tech Computer Science & AI)
   - Proposed Intake: 240 seats (Increase from 180)
   - Stage: `Desk Scrutiny` | SLA: 7 Days (3 elapsed, Within SLA)
   - Assigned Officer: Dr. R. K. Soni (Western Region)

2. **`APP-2026-ENG-1108` (Veermata Jijabai Technological Institute - VJTI)**
   - Program: Engineering & Technology (Data Science)
   - Proposed Intake: 180 seats
   - Stage: `Deficiency Communication` | SLA: 5 Days (6 elapsed, **OVERDUE**)
   - Deficiencies: Fire Safety NOC renewal expired; Cadre ratio faculty shortfall (1:24 vs mandated 1:20).

3. **`APP-2026-ENG-8402` (Delhi Technological University - DTU)**
   - Program: Engineering & Technology (Robotics & Mechatronics)
   - Proposed Intake: 120 seats
   - Stage: `EVC Inspection Scheduled` | SLA: 10 Days (8 elapsed, Approaching Deadline)
   - EVC Committee: Dr. B. B. Ahuja (Chairman) + 2 Expert Reviewers.

4. **`APP-2026-ENG-9321` (Jadavpur University Faculty of Tech)**
   - Program: Engineering (Nanotechnology)
   - Proposed Intake: 60 seats
   - Stage: `SAC Hearing` (Standing Appellate Committee)
   - Escalation: Level 2 Bureau Escalation active due to 12-day regional review delay.

5. **`APP-2026-ENG-0054` (College of Engineering Guindy - Anna University)**
   - Program: Mechanical & Automation Engineering
   - Proposed Intake: 120 seats
   - Stage: `Approval Issued` (Academic Session 2026-27 Approved)
   - Post-Approval Obligation: Submit updated 30-year lease deed registration within 90 days.

---

## SECTION 4: BACKEND API SURFACE, STATE MACHINE & BUSINESS LOGIC

### 4.1 Mounted Backend API Surface Matrix (`server.ts` -> `createCoreRouter()`)

| HTTP Method | Full URL Path | Controller File & Line | Middleware Guards | Request Body / Query Params | Database Mutation Performed | Success Response | Error Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/health` | `router.ts` (L15) | None (Public) | None | None | `{ status: 'healthy', timestamp }` | None |
| `GET` | `/api/v1/ready` | `router.ts` (L18) | None (Public) | None | Verifies 9 MongoDB collection indexes & session availability | `{ status: 'ready' }` | `503 Service Unavailable` |
| `POST` | `/api/v1/auth/login` | `src/backend/routes/index.js` (L10) | Public | `{ email, password }` | Authenticates against `DEMO_AUTH_USERS_JSON`; sets HTTP-only `sih_demo_session` cookie | `{ success: true, token, user }` | `400 Bad Request`, `401 Unauthorized` |
| `POST` | `/api/v1/auth/logout` | `src/backend/routes/index.js` (L28) | Session Auth | None | Clears `sih_demo_session` cookie | `{ success: true }` | `401 Unauthorized` |
| `GET` | `/api/v1/auth/session` | `src/backend/routes/index.js` (L34) | Session Auth | Cookie `sih_demo_session` | None (Decodes and verifies active session claims) | `{ authenticated: true, user }` | `401 Unauthorized` |
| `GET` | `/api/v1/applications` | `router.ts` (L32) | `requireSession` | Query: `?stage=&region=` | Reads scoped applications from `storage.list(actor)` | `{ success: true, data: CaseRecord[] }` | `401`, `500` |
| `POST` | `/api/v1/applications` | `router.ts` (L45) | `requireSession`, `authorizeRole` | `{ institutionId, category, session, facts, evidenceVersionIds, idempotencyKey }` | Validates intake schema; executes atomic transaction inserting application, outbox event, and audit log | `201 Created` `{ success: true, data: CaseRecord }` | `400`, `401`, `403`, `409 Idempotency Conflict`, `503` |
| `GET` | `/api/v1/applications/:id` | `router.ts` (L60) | `requireSession` | URL param `:id` | Reads single case from `storage.get(actor, id)` | `{ success: true, data: CaseRecord }` | `401`, `403`, `404 Not Found` |
| `GET` | `/api/v1/applications/:id/history` | `router.ts` (L75) | `requireSession` | URL param `:id` | Reads audit trail from `storage.history(actor, id)` | `{ success: true, data: AuditEntry[] }` | `401`, `403`, `404 Not Found` |
| `POST` | `/api/v1/applications/:id/decision` | `router.ts` (L90) | `requireSession`, `requirePermission('decision.record')` | `{ outcome, reason, conditions, expectedVersion, evidenceVersionIds, idempotencyKey }` | Executes ACID transaction: verifies prerequisites, policy candidate match; updates case state; writes `core_decisions`, `core_outbox`, `s6_obligations`, `core_receipts` | `{ success: true, data: DecisionResult }` | `400`, `401`, `403`, `404`, `409 Version Conflict`, `422 Unprocessable` |
| `POST` | `/api/v1/applications/:id/transition` | `router.ts` (L110) | `requireSession` | `{ targetStage, reason }` | Throws 403 on arbitrary transitions; validates permitted stage progression | `{ success: true, currentStage }` | `400`, `403 Forbidden`, `404` |
| `GET` | `/api/v1/dashboard/summary` | `src/backend/routes/index.js` (L45) | `requireSession` | None | Returns aggregated counts (falls back to 503 if real M3 aggregation unmounted) | `{ success: true, data: DashboardMetrics }` | `401`, `503` |
| `GET` | `/api/v1/notifications` | `src/backend/routes/index.js` (L55) | `requireSession` | None | Returns scoped notifications (falls back to 503 if M3 unmounted) | `{ success: true, data: Notification[] }` | `401`, `503` |
| `GET` | `/api/v1/config/rules` | `src/backend/routes/index.js` (L65) | `requireSession` | None | Returns list of configurable SLA parameters | `{ success: true, data: ConfigRule[] }` | `401` |
| `PATCH` | `/api/v1/config/rules/:id`| `src/backend/routes/index.js` (L75) | `requireSession`, `requireRole('admin', 'bureau_officer')` | `{ currentValue }` | Mutates rule threshold; writes to audit log | `{ success: true, data: UpdatedRule }` | `400`, `401`, `403` |

---

### 4.2 Unmounted Member 2 Endpoints (`src/backend/modules/index.ts`)
⚠️ **CRITICAL ARCHITECTURAL FINDING:** The following routes are fully implemented in `src/backend/modules/scrutiny` and `src/backend/modules/evc`, but **`server.ts` never calls `mountM2Routes(app)`**!

| HTTP Method | Full URL Path | Module File | Handler Responsibility |
|---|---|---|---|
| `GET` | `/api/v1/scrutiny/cases` | `scrutinyRoutes.ts` | List all cases currently awaiting document scrutiny |
| `GET` | `/api/v1/scrutiny/cases/:id` | `scrutinyRoutes.ts` | Retrieve scrutiny checklist & document verification status |
| `POST` | `/api/v1/scrutiny/cases/:id/verify-document` | `scrutinyRoutes.ts` | Verify or reject individual institutional compliance documents |
| `POST` | `/api/v1/scrutiny/cases/:id/deficiency` | `scrutinyRoutes.ts` | Issue formal deficiency communication notice with resubmission deadline |
| `POST` | `/api/v1/scrutiny/cases/:id/sign-off` | `scrutinyRoutes.ts` | Complete desk scrutiny; emit `ScrutinySignedOff` domain event |
| `GET` | `/api/v1/evc/cases` | `evcRoutes.ts` | List applications requiring physical or virtual committee visits |
| `POST` | `/api/v1/evc/cases/:id/schedule` | `evcRoutes.ts` | Constitute 3-member expert inspection panel and appoint date |
| `POST` | `/api/v1/evc/cases/:id/report` | `evcRoutes.ts` | Upload committee inspection scores, observations, and video proof |

---

### 4.3 Workflow State Machine Logic

```
   [ Application Intake ] (institution)
             |
             v
   [ intake_pending ]
             |  (Assigned to Regional Officer)
             v
   [ scrutiny_pending ] <========================+
             |                                    | (Deficiency Resubmission)
             +---> [ deficiency_communicated ] ---+
             |
             v  (Scrutiny Signed Off)
   [ evc_pending ] (If intake > 180 or land norm flagged)
             |
             +---> [ evc_scheduled ] ---> [ evc_completed ]
             |
             v
   [ decision_pending ] (Executive / SAC Review)
             |
      +------+------+
      |             |
      v             v
 [ approved ]   [ rejected ] ---> [ appeal_pending ]
```

#### State Transition Guards:
1. **Intake -> Scrutiny:** Requires institution submission with valid schema and generated SHA-256 fingerprint.
2. **Scrutiny -> Deficiency:** Regional Officer must cite specific Approval Process Handbook (APH) clause.
3. **Scrutiny -> EVC / Decision:** Cannot transition to `decision_pending` until `assertScrutinyComplete()` passes.
4. **EVC Eligibility Guard (`evcEligible.ts`):** Triggered automatically if:
   - Proposed intake increase exceeds 180 seats.
   - New campus construction or land expansion is claimed.
   - Prior compliance undertaking was flagged as deficient.
5. **Decision Recording Guard (`decisions.ts`):** Requires:
   - Matching approved policy revision in `policy_revisions`.
   - Prerequisite event IDs from Scrutiny and EVC.
   - Optimistic concurrency version check (`expectedVersion === case.version`).

---

### 4.4 Policy Evaluator & Candidate Engine
Located in `src/backend/policy/`:
- **Candidates:** `cand-001` (Engineering Cadre Ratio 1:20), `cand-002` (Mandatory Land Area 5 Acres Urban / 10 Acres Rural), `cand-003` (Faculty Qualification Norms).
- **Evaluation Engine (`evaluator.ts`):** Evaluates case facts against active revision rules:
  - If facts meet all norms -> returns `{ outcome: 'compliant', eligibleIntake: facts.proposedIntake }`.
  - If cadre shortfall <= 10% -> returns `{ outcome: 'conditional_approval', conditions: [...] }`.
  - If land area or fire safety invalid -> returns `{ outcome: 'review_required' }`.
  - **Deadlock Notice:** In `candidates.ts`, all revisions are tagged `draft` with unresolved issues. Without an approved policy revision, the decision service returns `review_required`, halting automated approvals!

---

### 4.5 Teammate Custom Features Discovered
1. **Interactive 3D Governance Globe (`GovernanceGlobe3D.tsx`):** Built with Three.js. Renders an interactive 3D Earth with clickable pulsing pins at New Delhi (HQ), Mumbai (Western), Bangalore (South-Western), Chennai (Southern), and Kolkata (Eastern). Displays regional case volume and SLA breach counts in floating tooltips.
2. **Interactive 3D Workflow Twin (`AICTEWorkflow3D.tsx`):** Built with Three.js. Visualizes the AICTE approval lifecycle as a 3D orbital trajectory with 5 interconnected stage hubs. Particles flow along curves representing live application throughput.
3. **Automated SLA Calculator (`slaCalculator.ts`):** Calculates working day pendency against statutory deadlines, factoring in official Indian national holidays and weekends.
4. **WORM Cryptographic Hash Generator (`AuditView.tsx`):** Calculates an immutable SHA-256 hash chaining each new audit log entry with the hash of the preceding entry.

---

## SECTION 5: FRONTEND ARCHITECTURE, ROUTES, SCREENS & INTERACTIVE ELEMENTS

### 5.1 Active Routing & Role Guard Architecture (`src/App.tsx`)
In the active canonical runtime, `App.tsx` mounts:
```tsx
<SessionGate>
  <CanonicalNavigation />
</SessionGate>
```

#### The Navigation Router (`CanonicalNavigation.tsx`):
Renders a top tab bar switching between 7 views. **Only the `Cases` tab renders an active functional component!** All other tabs render the fallback `<PendingIntegration view={view} />`:

| Tab Key | Display Label | Component Rendered | Active Wiring Status |
|---|---|---|---|
| `'cases'` | Cases | `<CanonicalWorkspace />` | `[WIRED END-TO-END]` |
| `'scrutiny'` | Scrutiny (pending) | `<PendingIntegration view="scrutiny" />` | `[DEAD / UNUSED / STUBBED CODE]` |
| `'evc'` | EVC (pending) | `<PendingIntegration view="evc" />` | `[DEAD / UNUSED / STUBBED CODE]` |
| `'documents'`| Documents (pending) | `<PendingIntegration view="documents" />`| `[DEAD / UNUSED / STUBBED CODE]` |
| `'obligations'`| Obligations (pending) | `<PendingIntegration view="obligations" />`| `[DEAD / UNUSED / STUBBED CODE]` |
| `'notifications'`| Notifications (pending) | `<PendingIntegration view="notifications" />`| `[DEAD / UNUSED / STUBBED CODE]` |
| `'dashboard'`| Dashboard (pending) | `<PendingIntegration view="dashboard" />` | `[DEAD / UNUSED / STUBBED CODE]` |

---

### 5.2 Screen-by-Screen Deep Dive (All 15 Frontend Views)

#### 1. SessionGate (`src/features/auth/SessionGate.tsx`)
- **Wiring Status:** `[WIRED END-TO-END]`
- **Data Displayed:** Modal dialog prompting for email and password. Shows preset demo persona buttons (RO Western, Bureau Officer, Institution, System Admin).
- **User Actions:** Clicking a persona fills the credentials. Clicking "Authenticate Official Session" executes `POST /api/v1/auth/login`. Sets HTTP-only cookie and unlocks `CanonicalNavigation`.

#### 2. CanonicalWorkspace (`src/features/applications/CanonicalWorkspace.tsx`)
- **Wiring Status:** `[WIRED END-TO-END]`
- **Data Displayed:** Table of canonical cases fetched via `GET /api/v1/applications`. Displays Case Reference, Institution ID, State Badge, Optimistic Version, and Policy Revision.
- **User Actions:**
  - "New Application Intake" button: Opens inline modal.
  - "Submit Intake" form: Dispatches `POST /api/v1/applications` with JSON body `{ institutionId, category, session, facts, idempotencyKey }`. Refreshes list upon success.
  - "Select Case": Loads single case details via `GET /api/v1/applications/:id`.
  - "Record Decision" button: Appears for authorized officers. Submits `POST /api/v1/applications/:id/decision`.

#### 3. DashboardView (`src/features/dashboard/DashboardView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** 4 KPI summary cards (Total Applications, In Scrutiny, EVC Scheduled, Approved); Recharts Bar and Donut charts for Regional Breakdown and Intake Distribution; SLA Bottleneck Alert banner; Interactive Three.js Governance Globe.
- **User Actions:** Region filter dropdown; clicking any bar or alert calls `onSelectApplication(appId)` to open details.

#### 4. ApplicationsListView (`src/features/applications/ApplicationsListView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Full-page table of applications with search, region filter, stage filter, and SLA badge.
- **User Actions:** Search input filter; "Export CSV" button generates client-side CSV download; "New Application" button opens `NewApplicationModal`; clicking a row opens `ApplicationDetailModal`.

#### 5. ApplicationDetailModal (`src/features/applications/ApplicationDetailModal.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** 4-tab dossier: Overview (Application facts & SLA clock), Documents (Uploads & Verification checklist), EVC (Inspection panel & scores), SAC & Decision (Committee remarks & approval order).
- **User Actions:** "Verify Document" button calls `verifyDocument()`; "Add Observation" calls `addObservation()`; "Transition Stage" calls `transitionStage()`. All these handlers hit stubs in `api.ts` that throw errors!

#### 6. NewApplicationModal (`src/features/applications/NewApplicationModal.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** 4-step wizard: Step 1 (Institution details), Step 2 (Program & Proposed Intake), Step 3 (Land & Infrastructure), Step 4 (Document Uploads).
- **User Actions:** Step navigation; file upload inputs; "Submit Application" button calls `createApplication()` which throws "Legacy UI is retired" error!

#### 7. WorkflowView (`src/features/workflow/WorkflowView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Visual horizontal pipeline of AICTE stages with active stage highlighted; audit event log for the selected application.
- **User Actions:** "Execute Stage Transition" button calls `transitionStage()`.

#### 8. EVCView (`src/features/evc/EVCView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Table of scheduled inspections; panel member list; scoring criteria (Infrastructure, Labs, Library, Faculty).
- **User Actions:** "Schedule EVC" modal; "Submit Inspection Report" modal with numeric score inputs. Handlers only update local React state.

#### 9. ComplianceView (`src/features/compliance/ComplianceView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Table of post-approval conditions and undertakings. Shows status pills (`Verified`, `Pending Upload`, `Rejected`).
- **User Actions:** "Upload Proof" button opens modal; "Review & Verify" button opens modal with Remarks textarea. Updates local React state.

#### 10. DocumentExpiryView (`src/features/documents/DocumentExpiryView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Table tracking Fire Safety NOCs and 30-year Land Leases. Calculates days until expiry with color-coded warning pills.
- **User Actions:** "Upload Renewal" opens modal; "Verify Renewal" marks doc verified in local state.

#### 11. PendencyView (`src/features/pendency/PendencyView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Applications grouped by stage with elapsed days vs statutory SLA limit. Highlights overdue cases in red.
- **User Actions:** Stage and Region filters; clicking "Inspect" opens case details.

#### 12. ReportsView (`src/features/reports/ReportsView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Analytical KPIs (Application Volume, Avg Processing Time, EVC Completion Rate, Compliance Adherence); Recharts Bar and Pie charts.
- **User Actions:** "Export Analytics Report (CSV)" downloads dynamic CSV in browser.

#### 13. AuditView (`src/features/audit/AuditView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Chronological audit table with Actor Name, Action, State Transition, and SHA-256 integrity hash.
- **User Actions:** "Export Audit Log (CSV)" downloads full tamper-proof audit trail.

#### 14. NotificationsView (`src/features/notifications/NotificationsView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** Tab 1 (Alerts & Reminders feed); Tab 2 (Hierarchical Escalation Dossier showing cases escalated from Regional to Bureau Officer).
- **User Actions:** "Mark All Read"; "Resolve Case" modal recording official resolution notes.

#### 15. WorkflowSimulationView (`src/features/simulation/WorkflowSimulationView.tsx`)
- **Wiring Status:** `[DEAD / UNUSED / STUBBED CODE]` (Unmounted in `App.tsx`)
- **Data Displayed:** 3D digital twin of AICTE workflow rendered by `AICTEWorkflow3D.tsx`. Explanatory cards for evaluation jury.
- **User Actions:** Interactive 3D camera rotation and zoom controls.

---

### 5.3 UI & Styling System
- **Framework:** TailwindCSS 4.0.9 (configured via `@tailwindcss/vite`).
- **Color Palette:**
  - Primary Brand: Deep Navy (`#0A2540`, `slate-900`)
  - Accent / Action: Royal Blue (`#2563EB`, `blue-600`)
  - Success / Compliant: Emerald (`#10B981`, `emerald-600`)
  - Warning / Approaching: Amber (`#F59E0B`, `amber-600`)
  - Danger / Overdue / Breached: Rose (`#EF4444`, `rose-600`)
- **Typography:** Sans-serif (system stack) with monospace numbers for IDs, dates, and SHA-256 hashes.

---

## SECTION 6: END-TO-END USER FLOW WALKTHROUGH (AS CURRENTLY IMPLEMENTED)

Tracing the step-by-step lifecycle of an application as the code actually executes right now:

### Step 1: User Login & Persona Assumption
- **Actor:** Institutional Applicant or Regional Officer.
- **Current Behavior:** User navigates to `http://localhost:5173`. `SessionGate` modal blocks the screen. User selects "COEP Tech University" (`principal@coep.ac.in`) or enters credentials. Clicks "Authenticate Official Session".
- **Backend Execution:** Frontend calls `POST /api/v1/auth/login`. Server parses `DEMO_AUTH_USERS_JSON`. If the environment variable is configured, server signs an HMAC session token and sets cookie `sih_demo_session`.
- **Status:** `[WIRED END-TO-END]` (Subject to `DEMO_AUTH_USERS_JSON` env var).

### Step 2: Canonical Workspace & Case Intake
- **Actor:** Institutional Applicant.
- **Current Behavior:** Screen unlocks to show `CanonicalNavigation`. User clicks "New Application Intake" in `CanonicalWorkspace`. Enters Program: `Engineering & Technology`, Proposed Intake: `240`. Clicks "Submit Intake".
- **Backend Execution:** Frontend calls `POST /api/v1/applications`. Server validates payload against `IntakeCommandSchema`, creates a new `CaseRecord` with `state: "intake_pending"`, inserts an outbox event, writes to `core_audit`, and returns HTTP 201. The new case appears in the workspace table.
- **Status:** `[WIRED END-TO-END]`.

### Step 3: Desk Scrutiny & Deficiency Review (THE FIRST DISCONNECT)
- **Actor:** Regional Officer (`ro.western@aicte.gov.in`).
- **Current Behavior:** The officer logs in and clicks the "Scrutiny (pending)" tab in `CanonicalNavigation`.
- **Failure Point:** The tab displays `<PendingIntegration view="scrutiny" />` with a banner: *"This module has not yet been integrated into the canonical workspace."*
- **Root Cause:** Member 2 built a rich scrutiny controller in `src/backend/modules/scrutiny/scrutinyRoutes.ts` and UI hooks in `useScrutiny.ts`, but `server.ts` never mounted M2 routes, and `CanonicalNavigation` never mounted a scrutiny UI! The application cannot be reviewed or deficiency-checked in the active UI.
- **Status:** `[BROKEN / DISCONNECTED WIRE]`.

### Step 4: EVC Inspection & Committee Scheduling (THE SECOND DISCONNECT)
- **Actor:** Regional Officer / EVC Chairman (`evc.chair@aicte.gov.in`).
- **Current Behavior:** User clicks the "EVC (pending)" tab.
- **Failure Point:** The tab displays `<PendingIntegration view="evc" />`.
- **Root Cause:** Member 2's EVC routes (`/api/v1/evc/...`) are not mounted in `server.ts`. Member 1's rich legacy `EVCView.tsx` is completely unmounted in `App.tsx`.
- **Status:** `[BROKEN / DISCONNECTED WIRE]`.

### Step 5: Committee Decision & Approval (THE TRANSACTION GATE)
- **Actor:** Bureau Officer (`bureau.approval@aicte.gov.in`).
- **Current Behavior:** Bureau Officer selects the case in `CanonicalWorkspace` and clicks "Record Decision". Chooses `outcome: "approved"` or `"conditional"`. Clicks "Confirm Decision".
- **Backend Execution:** Frontend calls `POST /api/v1/applications/:id/decision`. The backend `DecisionService` runs:
  1. Verifies that prerequisites are met.
  2. Runs `PolicyEvaluator` against `policy_revisions`.
  3. **Deadlock:** Because no active approved policy revision exists in the DB (only draft candidates in `candidates.ts`), the evaluator returns `review_required`, preventing automated approval unless bypassed by synthetic test mocks!
- **Status:** `[BACKEND ACID WIRED / BLOCKED BY DRAFT POLICY REGISTRY]`.

### Step 6: Post-Approval Obligations & Document Expiry
- **Actor:** Institutional Applicant / Compliance Officer.
- **Current Behavior:** User clicks "Documents (pending)" or "Obligations (pending)".
- **Failure Point:** Renders `<PendingIntegration />`.
- **Root Cause:** Member 3's obligation materialization logic exists only as pure functions in `tests/m3_obligations_timers.test.ts` and was never wired to the database or UI.
- **Status:** `[DEAD / STUBBED CODE]`.

---

## SECTION 7: CURRENT BUGS, DISCONNECTED WIRES & TECHNICAL DEBT SPOTTED

During our line-by-line traversal of the entire codebase, 10 critical architectural bugs, disconnected wires, and integration gaps were identified:

### 1. Orphaned Member 2 Routes in `server.ts`
- **Location:** `server.ts` (L55-L65) and `src/backend/modules/index.ts` (L15-L25).
- **The Bug:** `src/backend/modules/index.ts` defines `mountM2Routes(app)` which registers `/api/v1/scrutiny` and `/api/v1/evc`. However, `server.ts` **never imports or calls `mountM2Routes`**!
- **Impact:** All scrutiny and EVC API endpoints return `404 Not Found` in production.

### 2. Member 3 Production Code Trapped Inside Test Files
- **Location:** `tests/m3_obligations_timers.test.ts` (Lines 1-115).
- **The Bug:** Critical Member 3 business logic—`materializeDecisionObligations()`, `createDocumentVersion()`, `dueTimers()`, and `computeDashboardProjection()`—was written directly inside a test file rather than in `src/backend/` or `src/shared/`.
- **Impact:** The production backend has no implementation of post-approval obligations or timer evaluation; `/dashboard/summary` and `/notifications` return HTTP 503 stubs.

### 3. Active UI Retires All Non-Case Tabs
- **Location:** `src/features/applications/CanonicalNavigation.tsx` (Lines 22-55).
- **The Bug:** Every tab except `Cases` renders `<PendingIntegration view={view} />`.
- **Impact:** Evaluators and hackathon judges cannot access Scrutiny, EVC, Documents, Obligations, Notifications, or Dashboard from the main screen.

### 4. Legacy UI API Client Explicitly Throws Fatal Errors
- **Location:** `src/services/api.ts` (Lines 60-105).
- **The Bug:** Legacy methods (`createApplication`, `transitionStage`, `verifyDocument`, `addObservation`) contain hardcoded throws:
  `throw new Error('Legacy UI is retired. Use canonical workspace or mock data.');`
- **Impact:** If any teammate attempts to re-mount the rich legacy views (`ApplicationDetailModal`, `NewApplicationModal`), the UI crashes immediately upon button click.

### 5. Database Seed Mismatch (`seedAtlas.js` vs Canonical Storage)
- **Location:** `src/backend/data/seedAtlas.js` vs `src/backend/persistence/mongoCore.ts`.
- **The Bug:** `seedAtlas.js` inserts records matching the legacy Mongoose schema (without `id`, `reference`, `state`, or `caseData`). Canonical storage filters strictly on these fields (`tests/real-db/native.test.ts` L112-119 explicitly tests that legacy rows are excluded!).
- **Impact:** Seeding a real MongoDB database with `seedAtlas.js` results in an empty case list in `CanonicalWorkspace`, and fails startup readiness checks because the 9 mandatory unique indexes are not created.

### 6. Missing Default Fallback for `DEMO_AUTH_USERS_JSON`
- **Location:** `src/backend/routes/index.js` (L11-L18).
- **The Bug:** The login endpoint parses users only from `process.env.DEMO_AUTH_USERS_JSON`. If unset, it parses `[]`.
- **Impact:** Out-of-the-box, running `npm run server` and `npm run dev` makes it impossible to log in with any seeded credentials.

### 7. Socket.IO Explicitly Blocked
- **Location:** `server.ts` (Lines 67-75).
- **The Bug:** Realtime Socket.IO server rejects all client connections with `next(new Error('Realtime subscriptions unavailable'))`.
- **Impact:** Realtime status updates and live notification pushes cannot work over WebSockets.

### 8. All Policy Revision Candidates Marked Draft
- **Location:** `src/backend/policy/candidates.ts` (Lines 15-58).
- **The Bug:** Revisions `cand-001`, `cand-002`, and `cand-003` are all marked `status: 'draft'`, `effectiveTo: 'unreleased'`, with comments noting unresolved regulatory issues.
- **Impact:** `evaluatePolicy` fails to find an approved revision matching incoming intake categories, forcing decisions into `review_required` deadlock.

### 9. In-Memory State in Member 2 Modules Lacks Multi-Document ACID Transactions
- **Location:** `src/backend/modules/scrutiny/scrutinyService.ts` and `src/backend/modules/evc/evcService.ts`.
- **The Bug:** Member 2 services store data in memory Maps (`this.cases = new Map()`) rather than participating in the native MongoDB session passed by Member 1's Unit of Work.
- **Impact:** If a decision or sign-off fails, scrutiny mutations cannot be rolled back atomically.

### 10. `VITE_API_URL` Port Mismatch in Development
- **Location:** `src/services/api.ts` (L4).
- **The Bug:** Defaults to `/api/v1`. Vite development server runs on port `5173`, while Express server runs on port `3000`. Unless a Vite proxy is defined in `vite.config.ts`, relative API calls fail with 404 from the Vite static server.
- **Impact:** Frontend API calls fail in local development unless configured explicitly.

---
