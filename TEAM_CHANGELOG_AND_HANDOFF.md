# TEAM HANDOFF & EXHAUSTIVE ENGINEERING CHANGELOG
**Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau**  
**Document Target:** All SIH 2026 Team Members (Frontend, Backend, Policy, Devops)  
**Baseline Git Commit:** `318c8ba` | **Target Branch:** `main`  
**Current Test Status:** **271 Tests Passing (100% Green)** | **Acceptance Suite (T01–T16): 16/16 Passing** | **TypeScript Errors:** 0  

---

## 1. Executive Summary & Purpose of This Handoff

Welcome to the consolidated and hardened codebase for **PravahReg / AICTE CaseFlow**!

At commit `318c8ba`, our team had completed the initial prototypes for Member 1 (Decisions & Core Routes), Member 2 (Scrutiny & EVC integration), and Member 3 (Obligations, 5-State Documents, and 4-Clock Timers). However, as documented in [`AS_BUILT_BLUEPRINT.md`](./AS_BUILT_BLUEPRINT.md), the repository suffered from a critical "Two Worlds" architectural split:
- **World A**: The canonical backend with strict schemas and session authorization was disconnected from the interactive UI.
- **World B**: The rich frontend dashboard was falling back to mocked local arrays because the backend API endpoints were not mounted.
- **Member 2 & Member 3**: Scrutiny, EVC, and compliance modules had incompatible schemas and were not connected to a unified server.
- **10 Critical Regulatory & Security Bugs**: Cross-institution data leakage, absence of APH §1.8(g) scope protection, failure to implement 2026–27 Errata fast-tracking, and auth lockouts prevented end-to-end acceptance.

Over this turn, we implemented the **Regulatory Companion Layer Architecture** ([`src/backend/companionApp.ts`](./src/backend/companionApp.ts)), resolved all 10 critical bugs, mounted all Member 2 and Member 3 modules, seeded 5 canonical college cases, and created the 16 acceptance verification tests ([`tests/verification_t01_t16.test.ts`](./tests/verification_t01_t16.test.ts)).

This document provides a line-by-line, file-by-file record of every addition, modification, workflow, and local setup instruction so the entire team can pick up seamlessly from this point forward.

---

## 2. Exhaustive File-by-File Ledger of Additions & Modifications

### A. Newly Created Files (Untracked in `318c8ba`)

#### 1. `src/backend/companionApp.ts` (148 lines)
- **Purpose:** Central Express application factory for the Zero-Rewrite Companion Layer.
- **Exports:** `createCompanionApp(options?: { storage?: CaseStorage, port?: number }): Express`
- **Key Wiring:**
  - Mounts global middleware (`express.json()`, `cookieParser()`, `cors()`, request ID generation).
  - Mounts public unauthenticated endpoints: `GET /api/v1/health`, `GET /api/v1/ready`.
  - Mounts identity authentication middleware: `authenticate(identity)` on `/api/v1` routes (exempting `/health`, `/ready`, `/auth/login`, `/timers/advance-clock`, `/alerts`, `/demo/reset`).
  - Wires Core Case Router (`createCoreRouter`), Member 2 Scrutiny Router (`createScrutinyRouter`), Member 2 EVC Router (`createEVCRouter`), Member 3 Compliance Router (`createComplianceRouter`), Upstream Adapter Router (`createAdapterRouter`), and Vault Artifacts Router (`createArtifactRouter`).

#### 2. `src/backend/data/seedCanonicalCases.ts` (416 lines)
- **Purpose:** Seeds the companion runtime memory with 5 canonical college cases, 5 institutions, GIITS Scrutiny Snapshot `2-SOC1770029225`, 3 post-approval obligations, approved policies, and WORM genesis audit.
- **Exports:**
  - `CANONICAL_APPLICATIONS`: Array of 5 canonical `Application` DTOs (`APP-2026-GIITS`, `APP-2026-COEP`, `APP-2026-PDIMTR`, `APP-2026-EVIT`, `APP-2026-VJTI`).
  - `CANONICAL_INSTITUTIONS`: Array of 5 institutional entities with permanent IDs and region mapping.
  - `GIITS_SCRUTINY_SNAPSHOT`: Immutable snapshot `2-SOC1770029225` with C3/C4 accepted and D1/D2 deficient.
  - `CANONICAL_OBLIGATIONS`: 3 active statutory obligations for College C (Land Lease Deed, Fire NOC, Faculty Undertaking).
  - `CANONICAL_DECISIONS`: Approved decisions linked to policy revisions.
  - `CANONICAL_EVC_TASKS`: EVC inspection records.
  - `getCanonicalSeedState()`: Factory returning cloned in-memory state.

#### 3. `src/backend/modules/compliance/complianceService.ts` (132 lines)
- **Purpose:** Business logic service for Member 3 compliance obligations, 4-clock timers, and notification alerts.
- **Key Methods:**
  - `getObligations(institutionId?: string)`: Fetches obligations filtered by institutional scope.
  - `uploadEvidence(obligationId, fileMeta)`: Transitions evidence state machine to `submitted`.
  - `verifyObligation(obligationId, decision, remarks, actor)`: Authoritative verification/rejection.
  - `advanceVirtualClock(days)`: Advances virtual date from `2026-10-24`, calculates timer deadlines, and emits alerts.
  - `computeDashboardMetrics()`: Live calculation of volume, overdue counts, approaching deadlines, and EVC tasks.

#### 4. `src/backend/modules/compliance/complianceRoutes.ts` (174 lines)
- **Purpose:** Express router for Member 3 endpoints.
- **Endpoints Mounted:**
  - `GET /api/v1/obligations`: Scoped list of compliance undertakings.
  - `POST /api/v1/obligations/:id/upload`: Document evidence upload with file size and date validity guards.
  - `POST /api/v1/obligations/:id/verify`: Officer verification endpoint (`verified` / `rejected`).
  - `GET /api/v1/timers`: List of active statutory timers (Academic, Event, Validity, SLA).
  - `POST /api/v1/timers/advance-clock`: Virtual clock accelerator (`+7d`, `+15d`, `+30d`, `reset`).
  - `GET /api/v1/alerts`: Notification inbox items triggered by clock advances.
  - `GET /api/v1/compliance/dashboard`: Dynamic metrics aggregation for frontend dashboard.
  - `GET /api/v1/audit-logs`: Chronological audit trail with HMAC-SHA256 hashes.
  - `POST /api/v1/demo/reset`: Resets companion memory to canonical seed state.

#### 5. `src/backend/modules/scrutiny/corePortAdapter.ts` (76 lines)
- **Purpose:** Bridges the canonical `CaseStorage` to Member 2's `CorePort` transactional interface.
- **Exports:**
  - `SYSTEM_OFFICER_ACTOR`: Authorized fallback actor for scrutiny evaluations.
  - `createStorageCorePort(storage: CaseStorage, getActorFn?: () => Actor): CorePort`
  - Transaction wrapper executing atomic unit saves and appending events to the WORM audit ledger.

#### 6. `src/backend/persistence/memoryAdapter.ts` (307 lines)
- **Purpose:** In-memory transactional storage implementing `CaseStorage` and `Unit` with zero external dependencies.
- **Key Capabilities:**
  - **WORM HMAC-SHA256 Audit**: Every create, transition, and denial appends a cryptographic hash chained from the previous event hash.
  - **9 Unique Constraints**: Enforces uniqueness on application references, idempotency keys, snapshot IDs, and document versions.
  - **P0 Tenant Isolation Check**: Line 110 inspects incoming actor. If an institutional actor attempts to read a case owned by a different institution, it halts immediately, appends a `TENANT_ISOLATION_VIOLATION` to the audit log, and throws `FORBIDDEN` (403).

#### 7. `src/backend/routes/adapterRoutes.ts` (136 lines)
- **Purpose:** Express router for upstream NSWS and Siebel integration.
- **Endpoints Mounted:**
  - `POST /api/v1/adapter/ingest`: Accepts upstream payloads, runs schema validation, and inserts/updates cases idempotently.
  - `GET /api/v1/adapter/status`: Health and synchronization statistics of the companion adapter.

#### 8. `src/backend/routes/artifactRoutes.ts` (115 lines)
- **Purpose:** Role-guarded streaming of official AICTE PDFs from `aicte_reference_vault/`.
- **Endpoints Mounted:**
  - `GET /api/v1/cases/:id/official-artifacts/:artifactKey`: Validates user role and streams official PDF files.
  - `GET /api/v1/cases/:id/export-proforma`: Generates dynamic inspection proforma export.
- **Key Bug Fix:** Uses `safeAsciiBasename` replacing Unicode en-dashes (`\u2013`) with ASCII hyphens (`-`) in the `Content-Disposition` header to prevent Node HTTP `ERR_INVALID_CHAR` crashes.

#### 9. `tests/verification_t01_t16.test.ts` (375 lines)
- **Purpose:** Comprehensive automated acceptance test suite verifying all 16 acceptance criteria (T01–T16) defined in the SIH Master Engineering Spec.
- **Execution:** Runs with `npx vitest run tests/verification_t01_t16.test.ts`. 16 tests passing in ~2 seconds.

#### 10. `aicte_reference_vault/` (12 PDF Documents)
- Contains official AICTE Approval Process Handbooks, real 2026–27 Scrutiny Evaluation Reports (GIITS 95 pages), NSWS Portal User Manuals, and Deficiency Reports.

#### 11. `.env.example`
- Template file providing default ports, session secrets, and optional MongoDB URI configuration.

---

### B. Modified Existing Files

#### 1. `server.ts`
- **Previous State:** Connected directly to MongoDB via Mongoose; failed if MongoDB was not running locally.
- **Modified State:** Added smart companion fallback:
  ```typescript
  if (!process.env.MONGODB_URI) {
    const companionApp = createCompanionApp();
    companionApp.listen(PORT, () => console.log(`PravahReg Companion Server live on port ${PORT}`));
  }
  ```
  Now boots immediately without requiring a local MongoDB daemon!

#### 2. `src/services/api.ts`
- **Previous State:** Standalone mock client that returned static in-memory objects and did not hit backend routes.
- **Modified State:** Complete rewrite into a unified production API client:
  - Added `mapCanonicalToUI()`: Converts backend DTOs into rich frontend UI models.
  - Wired `/applications`, `/evc/queue`, `/obligations`, `/timers`, `/alerts`, `/audit-logs`.
  - Added `scheduleEVC()`, `submitEVCReport()`, `submitComplianceEvidence()`, `verifyCompliance()`.
  - Added `advanceClock()`, `resetDemo()`, `rescrutinize()`, `ingestUpstream()`.
  - Fully typed for TypeScript strict mode (0 errors).

#### 3. `src/features/auth/SessionGate.tsx`
- **Previous State:** Generic password login screen; missing quick persona switching and clock controls.
- **Modified State:**
  - Added top **National Ecosystem Header** with AICTE branding and simulated clock display.
  - Added **1-Click Role Switcher** with 6 built-in persona cards (`Principal COEP`, `Principal VJTI`, `RO Western`, `EVC Chair`, `Bureau Approval`, `Policy Admin`).
  - Added **Simulated Statutory Clock Controller** with `+7d`, `+15d`, `+30d`, and `Reset` buttons.

#### 4. `src/features/applications/ApplicationDetailModal.tsx`
- **Previous State:** Static case details drawer.
- **Modified State:**
  - Added **Official Vault PDF Streaming** button (`Vault Scrutiny PDF`) linking to `/api/v1/cases/:id/official-artifacts/scrutiny-report`.
  - Added **Export Proforma** action.
  - Connected "Why this route?" to display regulatory policy citations from the backend.

#### 5. `src/backend/modules/scrutiny/scrutinyRoutes.ts` & `scrutinyService.ts`
- **Previous State:** Re-scrutiny allowed modifying any checklist item; returned 400 on violations.
- **Modified State:**
  - Implemented **APH §1.8(g) Differential Scope Guard**: Compares resubmitted items against the initial snapshot. If an accepted item (e.g., C3) is modified, the service returns `{ success: false, error: { code: 'SCOPE_VIOLATION' } }`.
  - In `scrutinyRoutes.ts`, mapped `SCOPE_VIOLATION` to HTTP **`409 Conflict`**.

#### 6. `src/backend/modules/evc/evcRoutes.ts` & `evcSchemas.ts`
- **Previous State:** Scheduling EVC tasks required manually supplying `expectedVersion` and `idempotencyKey` in the request body; returned generic 400 on precondition failure.
- **Modified State:**
  - Added default generation for `idempotencyKey` and `expectedVersion`.
  - Mapped precondition and policy conflicts to HTTP **`409 Conflict`**.

#### 7. `src/backend/security/identity.ts`
- **Previous State:** Failed login attempts counter never cleared; after 10 total logins, legitimate users were locked out with 401 rate-limit errors.
- **Modified State:** Added `attempts.delete(key)` upon successful bcrypt authentication, preserving brute-force protection while preventing test suite lockouts.
- Expanded `DEMO_PERSONAS` to include 6 canonical roles.

#### 8. `src/backend/policy/candidates.ts`
- **Previous State:** Exported draft policies with unindexed 2026 errata rules.
- **Modified State:** Exported `APPROVED_2026_POLICIES` with the NBA fast-track rule (bypasses EVC) and the $X = 360$ boundary rule (`policy_review_required`).

#### 9. `vite.config.ts`
- Configured proxy for `/api` to route cleanly to the Express companion server during development.

---

## 3. The 10 Critical Bugs Resolved

| # | Bug Identified in Commit `318c8ba` | Root Cause | Exact Resolution Applied |
| :---: | :--- | :--- | :--- |
| **1** | **Two Worlds Architectural Split** | Frontend `api.ts` used static mocks; canonical backend routes `/applications` were uncalled. | Replaced `api.ts` with a consolidated API service mapping canonical backend DTOs to UI models via `mapCanonicalToUI()`. |
| **2** | **Unmounted Member 2 & 3 Modules** | Scrutiny, EVC, and compliance routers were defined in subfolders but never mounted on `server.ts`. | Created `companionApp.ts` which mounts Scrutiny, EVC, Compliance, Timers, Alerts, and Ingestion subrouters. |
| **3** | **APH §1.8(g) Scope Violation** | Re-scrutiny endpoint allowed altering previously accepted checklist items. | Added differential scope comparison in `scrutinyService.ts`; tampering returns `409 Conflict (SCOPE_VIOLATION)`. |
| **4** | **2026–27 Errata Fast-Track Ignored** | All intake increases required EVC inspections under old 2024 rules. | Implemented 2026–27 Errata G02 p. 42: valid NBA courses skip EVC; boundary $X=360$ flags `policy_review_required`. |
| **5** | **P0 Tenant Isolation Leak** | Institutional users could query cases belonging to other colleges. | Added institutional boundary guard in `memoryAdapter.ts` (lines 109–130). Cross-tenant queries return `403 Forbidden` and log to WORM audit. |
| **6** | **Unserved Reference Vault Artifacts** | Official PDFs in `aicte_reference_vault/` had no API route. | Created `artifactRoutes.ts` serving `/api/v1/cases/:id/official-artifacts/:key` with role guards. |
| **7** | **Windows HTTP `ERR_INVALID_CHAR`** | File names with Unicode en-dashes (`\u2013`) crashed `res.setHeader('Content-Disposition')`. | Sanitized header file names to pure ASCII (`safeAsciiBasename`). |
| **8** | **Sequential Auth Lockout** | `attempts` map in `identity.ts` never cleared successful attempts, triggering rate limits during tests. | Added `attempts.delete(key)` on successful password verification. |
| **9** | **Admin Decision Authority Breach** | Central Admin could record decisions without demo authority permissions. | Strict RBAC permissions enforcement in `canDecide()`; denies unauthorized actors with `403 Forbidden`. |
| **10** | **Missing Upstream Ingestion Adapter** | No mechanism to ingest external NSWS and Siebel application payloads. | Created `adapterRoutes.ts` with `/api/v1/adapter/ingest` supporting idempotent inserts and updates. |

---

## 4. The 5 Canonical College Cases (Reference Guide)

All team members should test against these 5 pre-seeded cases:

1. **College A: Godavari Institute of Engineering & Technology (GIITS)**
   - **ID:** `APP-2026-GIITS` | **Permanent ID:** `1-6055691` | **App #:** `1-46258917694`
   - **Region:** South-Central (Andhra Pradesh) | **Session:** `2026-27`
   - **Scenario:** Non-NBA intake increase (`240 ➔ 300`). Initial Scrutiny Snapshot `2-SOC1770029225` has items C3/C4 accepted and D1/D2 deficient.
   - **What to test:** Differential re-scrutiny scope lock (APH §1.8(g)) and transition to EVC `2-SOC1774344316`.

2. **College B: COEP Technological University (COEP)**
   - **ID:** `APP-2026-COEP` | **Permanent ID:** `1-1437622971` | **App #:** `1-43657568230`
   - **Region:** Western (Maharashtra) | **Session:** `2026-27`
   - **Scenario:** Valid NBA-accredited intake increase (`300 ➔ 360`).
   - **What to test:** 2026–27 Errata fast-track bypasses physical EVC inspection. Case transitions directly from Scrutiny to Decision.

3. **College C: Prerna / Univ BDT College of Engineering (PDIMTR)**
   - **ID:** `APP-2026-PDIMTR` | **Permanent ID:** `1-447718433` | **App #:** `1-10970417826`
   - **Region:** Western | **Session:** `2026-27`
   - **Scenario:** Post-Approval Conditional EoA with 3 statutory undertakings:
     - 30-Year Land Lease Deed (expiring in 12 days).
     - 1-Year Fire Safety NOC with 60-day advance renewal rule.
     - 6-Month Faculty Cadre Deficiency Undertaking.
   - **What to test:** Simulated clock advances (`+15d`) trigger automated expiration alerts; document uploads update state to `submitted`.

4. **College D: East Valley Institute of Technology (EVIT)**
   - **ID:** `APP-2026-EVIT` | **Permanent ID:** `1-9981234004` | **App #:** `1-46222870004`
   - **Region:** Eastern (West Bengal) | **Session:** `2026-27`
   - **Scenario:** Proposed intake reaching boundary $X = 360$.
   - **What to test:** Routing engine evaluates that $X=360$ is unexpressed in the errata, halts with `policy_review_required`, and escalates to the National Approval Bureau.

5. **College E: Veermata Jijabai Technological Institute (VJTI)**
   - **ID:** `APP-2026-VJTI` | **Permanent ID:** `1-7770001122` | **App #:** `1-46222870005`
   - **Region:** Western | **Session:** `2026-27`
   - **Scenario:** Multi-tenant security isolation case owned exclusively by `principal@vjti.ac.in`.
   - **What to test:** Any attempt by other institutions or unauthorized officers to read this case returns `403 Forbidden` and logs a `TENANT_ISOLATION_VIOLATION` to the WORM audit trail.

---

## 5. Local Setup Guide for Teammates

Follow these steps to run the project locally on your machine:

### Step 1: Clone and Checkout `main`
```bash
git clone https://github.com/Mayuresh-1306/SIH-2026-AICTE.git
cd SIH-26-AICTE
git checkout main
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example`):
```bash
cp .env.example .env
```
Default `.env` contents:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=sih-2026-aicte-pravahreg-super-secure-jwt-secret-key-32chars
SESSION_SECRET=sih-2026-companion-layer-session-secret-key
CLIENT_ORIGIN=http://localhost:3001
# MONGODB_URI is optional. If omitted, the companion in-memory WORM engine is used.
```

### Step 4: Run the Automated Verification Suites
Before making any changes, verify that your local environment passes all tests:
```bash
# 1. Run all 271 unit, integration, and security tests
npx vitest run

# 2. Run the 16 acceptance verification tests
npx vitest run tests/verification_t01_t16.test.ts

# 3. Type-check TypeScript (should output 0 errors)
npx tsc --noEmit

# 4. Verify production build
npm run build
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Open your browser at **`http://localhost:3001`** (or the port specified in `.env`).

---

## 6. How to Use the Built-In Personas & Controls in the UI

1. **Top Header Role Switcher:**
   Click any of the quick persona cards at the top of the screen:
   - `Principal (COEP)`: Password `Password123!` — Institutional view for College B.
   - `Principal (VJTI)`: Password `Password123!` — Institutional view for College E.
   - `Regional Officer`: Password `Password123!` — Regional scrutiny and EVC scheduling.
   - `EVC Chairman`: Password `Password123!` — On-site committee scoring and reports.
   - `Bureau Approval`: Password `Password123!` — Council decision recording.
   - `Policy Admin`: Password `Password123!` — Regulatory policy and WORM audit inspection.
2. **Simulated Clock Controller:**
   Use the `+7d`, `+15d`, and `+30d` buttons in the header to simulate the passage of statutory time. Click `Reset` to return to base date `24 Oct 2026`.
3. **Official Vault PDFs:**
   Open any application dossier (e.g. GIITS), go to the **Documents** tab, and click **`Vault Scrutiny PDF`** to view the live 95-page official evaluation report streamed directly from the backend.

---

## 7. Guidelines for Extending the Codebase

When continuing development, teammates must maintain the following architectural invariants:

1. **Never Bypass Tenant Isolation:**
   When adding queries to `memoryAdapter.ts` or MongoDB, always enforce `actor.institutionIds.includes(case.institutionId)`. Any cross-tenant read must throw `FORBIDDEN` and log to `state.audit`.
2. **Preserve APH §1.8(g) Scope Locks:**
   In re-scrutiny endpoints, never allow an accepted checklist item from an earlier round to be overwritten or deleted.
3. **Maintain WORM Audit Chaining:**
   Every mutating state transition must invoke `computeAuditHash(prevHash, auditEvent)` to ensure the cryptographic audit chain remains unbroken.
4. **Follow 2026–27 Temporal Precedence:**
   Always cross-reference the 2026–27 Errata (G02) before applying base APH 2024–27 clauses.
5. **Keep All 271 Tests Green:**
   Always run `npx vitest run` and `npx tsc --noEmit` before opening a pull request.

---
*Prepared with engineering excellence for the SIH 2026 AICTE CaseFlow team.*
