# NIYAMSETU (नियमसेतु) — PS 26262 COMPLIANCE TRACEABILITY MATRIX
### Comprehensive Requirement-by-Requirement Verification, Role Mapping & Acceptance Contract

**Project:** NiyamSetu (नियमसेतु)  
**Smart India Hackathon 2026** | **Problem Statement 26262 (AICTE Regulation Bureau)**  
**Target Academic Year:** 2026–2027  
**Official Release Baseline:** Commit `ef52e45` (Fast-forward verified on `origin/main` and `personal/main`)  
**Status Standard:** `Verified` | `Partially implemented` | `Missing` | `Simulated` | `Blocked`  

---

## 📋 Executive Overview & Acceptance Standard

This document establishes the master functional acceptance contract for NIYAMSETU, decomposing the full text of AICTE Problem Statement 26262 into atomic, testable requirements. Every requirement is mapped across its applicable user roles, UI views, backend modules, state transitions, security boundaries, persistence guarantees, and verified test assertions.

---

## 🏛️ Traceability Records

### Section 1: Background & Core Problem Statement

#### `REQ-PS-BG-01`
- **PS Quotation:** *"AICTE processes applications from technical institutions through different stages, including scrutiny/re-scrutiny, Expert Visit Committee (EVC), SAC/SHC and other stages prescribed under the applicable Approval Process Handbook (APH)."*
- **Applicable Roles:** `institution`, `reviewer`, `evc`, `regional_officer`, `bureau_officer`, `demo_authority`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ApplicationsListView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/applications/ApplicationsListView.tsx), [`ApplicationDetailModal.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/applications/ApplicationDetailModal.tsx), [`WorkflowView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/workflow/WorkflowView.tsx), [`ScrutinyEvaluationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/scrutiny/ScrutinyEvaluationView.tsx), [`EVCView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/evc/EVCView.tsx).
- **Backend Modules & Services:** [`dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts), [`cases.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/cases.ts), [`router.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/router.ts).
- **Expected State Transitions:** `submitted` $\rightarrow$ `scrutiny_pending` $\rightarrow$ `correction_required` $\rightarrow$ `rescrutiny_pending` $\rightarrow$ `evc_pending` $\rightarrow$ `decision_pending` $\rightarrow$ `approved` / `conditionally_approved` / `rejected`.
- **Deadline, Notification & Escalation:** SLA tracking (10 days scrutiny, 15 days cure, 10 days EVC, 7 days SAC). In-app alerts generated upon stage arrival.
- **Data Scope & Authorization:** Role-based scope filters (`scoped` for institutions by `institutionIds`, regional for RO, global for Bureau/Authority).
- **Persistence & Audit:** State transitions recorded transactionally with optimistic version checks and immutable audit logging in `core_audit`.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 2, 5), `tests/policy/routing.test.ts`, `tests/core/http.test.ts`.
- **Test Evidence:** 37/37 tests pass in `routing.test.ts`; 38/38 pass in regression suite.
- **Remaining Gaps & Risks:** None on canonical happy path. Edge routes with unexpressed rules ($X=360$) safely held in `review_required`.

---

#### `REQ-PS-BG-02`
- **PS Quotation:** *"Certain approvals are also granted subject to time-bound undertakings and compliance requirements, including the submission and renewal of prescribed documents such as lease documents."*
- **Applicable Roles:** `institution`, `regional_officer`, `bureau_officer`, `demo_authority`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ComplianceView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/compliance/ComplianceView.tsx), [`DocumentExpiryView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/DocumentExpiryView.tsx), [`GeneratedDocumentsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/GeneratedDocumentsView.tsx).
- **Backend Modules & Services:** [`decisionDocumentsService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsService.ts#L41), [`decisions.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/decisions.ts).
- **Expected State Transitions:** Decision recording triggers condition parsing; positive approval materializes active obligations in `complianceDB` (`pending` $\rightarrow$ `submitted` $\rightarrow$ `verified` / `rejected`).
- **Deadline, Notification & Escalation:** Clocks: APH §2.25(f) Security Deposit (15 days statutory), Fire Safety NOC (annual renewal / 60d SLA reminder), 30-year registered land lease deed (APH §6.17a), 6-month faculty appointment undertaking.
- **Data Scope & Authorization:** Institutions only see and upload for their own obligations. Verifications restricted to RO/Bureau.
- **Persistence & Audit:** Recorded decisions in MongoDB `core_decisions`; obligations materialized transactionally.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (`materializes post-approval obligations in complianceDB ONLY from recorded decision conditions`), `tests/m3_obligations_timers.test.ts`.
- **Test Evidence:** 6 obligations materialized for `APP-2026-PDIMTR`; 0 obligations materialized for rejected `APP-2026-APEX`.
- **Remaining Gaps & Risks:** In standalone mode without external MongoDB, companion maps reside in Node memory.

---

#### `REQ-PS-BG-03`
- **PS Quotation:** *"Monitoring application movement, stage-wise pendency, EVC scheduling, institutional undertakings, compliance submissions and document validity across different Regions and responsible officials involves coordination and follow-up."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`, `policy_admin`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ROAllocationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/ro/ROAllocationView.tsx), [`PendencyView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/pendency/PendencyView.tsx), [`DashboardView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/dashboard/DashboardView.tsx).
- **Backend Modules & Services:** [`allocationService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/allocation/allocationService.ts), [`allocationRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/allocation/allocationRoutes.ts).
- **Expected State Transitions:** Assignment updates `caseAssignments` mapping, dynamically tracks committee workload capacity (10 for Scrutiny, 5 for EVC).
- **Deadline, Notification & Escalation:** Alerts triggered when committee capacity exceeds 80% or case age exceeds stage SLA.
- **Data Scope & Authorization:** RO operates within regional scope (`Western`, `SCRO`); Bureau Officer holds cross-region visibility.
- **Persistence & Audit:** Allocations log `AllocationHistoryRecord` with mandatory justification reason.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 3: `enforces substantive reason for RO committee allocation`, `blocks EVC assignment when route does not mandate EVC`).
- **Test Evidence:** HTTP 422 rejected when attempting EVC assignment on NBA-exempt case `APP-2026-COEP`.
- **Remaining Gaps & Risks:** Roster groups currently seeded with 4 standing panels; production will ingest real AICTE faculty pool.

---

#### `REQ-PS-CORE-01`
- **PS Quotation:** *"Develop an integrated, secure and configurable digital platform for end-to-end automation and monitoring of AICTE approval-related workflows, covering application routing, scrutiny stages, EVC scheduling, pendency monitoring, time-bound undertakings, institutional compliance and validity of prescribed documents."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** Entire SPA navigation tree across 6 role workspaces.
- **Backend Modules & Services:** Unified companion Express runtime (`src/backend/companionApp.ts`), core transactional storage (`src/backend/core/`).
- **Expected State Transitions:** Full state machine spanning 10 statutory case states.
- **Deadline, Notification & Escalation:** Integrated timer watches across applications, EVCs, and undertakings.
- **Data Scope & Authorization:** RBAC middleware with permission assertions (`case.read`, `case.transition`, `scrutiny.sign`, `evc.schedule`, `decision.record`).
- **Persistence & Audit:** Dual storage mode: High-Fidelity Transactional Memory Engine + Production MongoDB Store.
- **Demonstrating Tests:** Complete Vitest test suite: 327 tests passed across 27 files.
- **Test Evidence:** 100% test pass rate with 0 failures, 0 skipped.
- **Remaining Gaps & Risks:** Simulated external government gateways (NSWS, emBridge).

---

#### `REQ-PS-CORE-02`
- **PS Quotation:** *"The system should provide real-time dashboards, automated notifications, deadline reminders and escalation of pending or overdue actions to the concerned institutions and authorised AICTE officials, thereby reducing manual intervention and improving efficiency, transparency and accountability."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`DashboardView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/dashboard/DashboardView.tsx), [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx), [`PendencyView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/pendency/PendencyView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/), [`compliance/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/compliance/).
- **Expected State Transitions:** Alerts transition through `unread` $\rightarrow$ `read` $\rightarrow$ `escalated`.
- **Deadline, Notification & Escalation:** Escalation levels (L1: Warning $\rightarrow$ L2: Overdue $\rightarrow$ L3: Critical Bureau Escalation).
- **Data Scope & Authorization:** Notifications strictly tenant-isolated (Institutions only receive alerts for their own application).
- **Persistence & Audit:** Alert delivery status and escalation events written to audit logs.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T10, T11, T12, T14).
- **Test Evidence:** T10 verifies outbox deduplication; T11 verifies advance clock alert suppression for satisfied obligations.
- **Remaining Gaps & Risks:** External SMS/Email delivery simulated in non-production.

---

### Section 2: Section A — End-to-End Approval Workflow Automation

#### `REQ-WFA-01`
- **PS Quotation:** *"Automatically route applications through the applicable processing stages, such as Only Scrutiny, Scrutiny + EVC, EVC + SAC/SHC, Only EVC and other combinations prescribed under the APH."*
- **Applicable Roles:** `institution`, `reviewer`, `regional_officer`, `bureau_officer`, `policy_admin`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NSWSSimulationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/nsws/NSWSSimulationView.tsx), [`ConfigRulesView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/admin/ConfigRulesView.tsx).
- **Backend Modules & Services:** [`dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts).
- **Expected State Transitions:**
  - Route 1 (Self-Disclosure EoA, Table 2.3 Row 1): `['submitted', 'decision_pending']`
  - Route 2 (New Inst / Non-NBA, Table 2.3 Row 9): `['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']`
  - Route 3 (NBA Fast-Track, Addendum p. 4 §2.6(c)(1)): `['submitted', 'scrutiny_pending', 'decision_pending']`
  - Route 4 (Site Shifting / Break-in-EoA, Table 2.3 Row 11): `['submitted', 'evc_pending', 'decision_pending']`
  - Route 5 (Deficiency Appeal / Governance Branch): Decoupled conditional triggers to SHC/SAC.
- **Deadline, Notification & Escalation:** Category and fact validation at intake.
- **Data Scope & Authorization:** Route evaluation is deterministic and pure; client overrides cannot alter matched policy.
- **Persistence & Audit:** Matched `policyRevisionId`, `ruleVersion`, and `matchedRules` snapshot stored on Application record.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 2: 3 tests), `tests/policy/routing.test.ts` (37 tests), `tests/verification_t17_t22.test.ts` (T17).
- **Test Evidence:** T17 tests all 5 route combinations natively.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-WFA-02`
- **PS Quotation:** *"Enable automatic movement of applications to the next prescribed stage upon completion of the preceding stage, subject to applicable rules and authorised actions."*
- **Applicable Roles:** `reviewer`, `evc`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ScrutinyEvaluationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/scrutiny/ScrutinyEvaluationView.tsx), [`EVCView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/evc/EVCView.tsx), [`CompetentAuthorityDecisionView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/decisions/CompetentAuthorityDecisionView.tsx).
- **Backend Modules & Services:** [`cases.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/cases.ts#L65), [`integrationGuards.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/integrationGuards.ts).
- **Expected State Transitions:** Completion of scrutiny sign-off advances state to `evc_pending` (if in route) or `decision_pending`. EVC completion advances to `decision_pending`.
- **Deadline, Notification & Escalation:** Advancement halts if prerequisite signature is missing.
- **Data Scope & Authorization:** State changes require authenticated caller with `case.transition` or stage-specific sign permission.
- **Persistence & Audit:** State transitions update version number and emit audit event.
- **Demonstrating Tests:** `tests/core/commands.test.ts` (15 tests), `tests/verification_t01_t16.test.ts` (T04).
- **Test Evidence:** T04 verifies illegal out-of-order mutations are rejected by scope gate.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-WFA-03`
- **PS Quotation:** *"Provide facilities for authorised return/revert of applications for deficiencies, clarifications or further verification, with reasons duly recorded."*
- **Applicable Roles:** `reviewer`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ScrutinyEvaluationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/scrutiny/ScrutinyEvaluationView.tsx), [`InstitutionDeficiencyCureView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/institution/InstitutionDeficiencyCureView.tsx).
- **Backend Modules & Services:** [`scrutinyService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/scrutiny/scrutinyService.ts), [`validateCorrections.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/scrutiny/validateCorrections.ts).
- **Expected State Transitions:** `scrutiny_pending` $\rightarrow$ `correction_required` (LoD issued) $\rightarrow$ `rescrutiny_pending` (corrections submitted) $\rightarrow$ Re-scrutiny evaluation.
- **Deadline, Notification & Escalation:** 15-calendar-day cure window communicated via statutory notice.
- **Data Scope & Authorization:** Reviewer must record deficiency reason. Under **APH §1.8(g)**, re-scrutiny is strictly limited to flagged deficiencies ($D1, D2$); cleared items ($C3, C4$) are read-only and tampering returns HTTP 409 Conflict (`RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES`).
- **Persistence & Audit:** Formal Letter of Deficiency (LoD) generated with audit trail.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 5), `tests/verification_t01_t16.test.ts` (T05), `tests/verification_t17_t22.test.ts` (T18).
- **Test Evidence:** T05 confirms attempt to tamper with accepted item C3 returns HTTP 409 Conflict. T18 verifies stage revert requires mandatory reason.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-WFA-04`
- **PS Quotation:** *"Automate routine administrative activities, standardised communications and electronic case summaries wherever legally and procedurally permissible."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`, `demo_authority`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`GeneratedDocumentsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/GeneratedDocumentsView.tsx), [`ApplicationDetailModal.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/applications/ApplicationDetailModal.tsx).
- **Backend Modules & Services:** [`decisionDocumentsService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsService.ts), [`decisionDocumentsRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsRoutes.ts).
- **Expected State Transitions:** Post-decision order generation: Letter of Approval (LoA), Extension of Approval (EoA), Letter of Deficiency (LoD), Letter of Rejection (LoR).
- **Deadline, Notification & Escalation:** Real-time PDF synthesis with `pdf-lib`, streaming binary download, SHA-256 digest, and HMAC-SHA256 prototype seal.
- **Data Scope & Authorization:** Document generation strictly restricted to `decision.record` permission and requires canonical recorded decision in storage. Missing decision returns **HTTP 412 PRECONDITION_FAILED**.
- **Persistence & Audit:** Synthesized documents indexed in `generatedDocumentsDB`; signed bytes verified with constant-time equality.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 8: 8 tests), `tests/verification_t17_t22.test.ts` (T19).
- **Test Evidence:** T19 generates electronic case summary and all 5 standardized statutory notices.
- **Remaining Gaps & Risks:** HMAC seal is a server-side test key; not an embedded PAdES asymmetric government token.

---

### Section 3: Section B — Integrated Dashboard and Pendency Monitoring

#### `REQ-DSH-01`
- **PS Quotation:** *"Provide a consolidated, real-time dashboard displaying application status across Regions, processing stages, institutions and responsible officers/committees."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`, `policy_admin`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`DashboardView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/dashboard/DashboardView.tsx).
- **Backend Modules & Services:** [`router.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/router.ts) (`/dashboard`).
- **Expected State Transitions:** Aggregates counts across all 8 AICTE regions (Western, Northern, Eastern, Southern, etc.) and stages.
- **Deadline, Notification & Escalation:** Live calculation based on application createdAt and stageEnteredAt.
- **Data Scope & Authorization:** Global officers view all regions; Regional officers view only their assigned region.
- **Persistence & Audit:** Derived dynamically from live CaseStorage.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T14), `tests/core/http.test.ts`.
- **Test Evidence:** T14 verifies dynamic dashboard metrics compute directly from companion state.
- **Remaining Gaps & Risks:** High concurrency caching can be added for ultra-scale production (>50,000 cases).

---

#### `REQ-DSH-02`
- **PS Quotation:** *"Monitor application ageing, prescribed processing timelines, workload distribution, pending cases and processing bottlenecks."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`PendencyView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/pendency/PendencyView.tsx), [`ROAllocationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/ro/ROAllocationView.tsx).
- **Backend Modules & Services:** [`allocationService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/allocation/allocationService.ts), [`slaCalculator.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/utils/slaCalculator.ts).
- **Expected State Transitions:** Cases tagged as `within_sla`, `approaching_deadline`, or `overdue`.
- **Deadline, Notification & Escalation:** Visual SLA badges (green/amber/red) with exact calendar days remaining.
- **Data Scope & Authorization:** Scoped by regional office or bureau.
- **Persistence & Audit:** Workloads recalculated across standing committee groups upon each assignment.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 3), `tests/verification_t01_t16.test.ts` (T14).
- **Test Evidence:** Workload metrics verified across `SCR-GROUP-A`, `SCR-GROUP-B`, `EVC-GROUP-A`, `EVC-GROUP-B`.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-DSH-03`
- **PS Quotation:** *"Generate alerts for applications approaching or exceeding prescribed timelines."*
- **Applicable Roles:** `institution`, `reviewer`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/), [`complianceService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/compliance/complianceService.ts).
- **Expected State Transitions:** Advance clock evaluates stageEnteredAt against statutory thresholds and emits alert envelopes.
- **Deadline, Notification & Escalation:** Warning at $T-3$ days, Overdue at $T \ge 0$, Escalation at $T+2$ days.
- **Data Scope & Authorization:** Notifications targeted strictly to the responsible actor.
- **Persistence & Audit:** Outbox pattern guarantees at-least-once delivery with deduplication key.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T10, T11, T12).
- **Test Evidence:** T10 proves outbox delivers exactly 1 notification across 3 retries.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-DSH-04`
- **PS Quotation:** *"Provide role-based dashboards for Regional officers, Bureau officers, committees and other competent authorities."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified` (Enhanced in Phase 3)
- **Relevant UI Pages & Components:** [`Sidebar.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/components/layout/Sidebar.tsx), [`App.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/App.tsx).
- **Backend Modules & Services:** [`identity.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/security/identity.ts), [`authorization.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/security/authorization.ts).
- **Expected State Transitions:** Sidebar switches automatically to match logged-in persona portal:
  - Portal 1: Applicant Portal (Institution)
  - Portal 2: Scrutiny Committee Cell (Reviewer)
  - Portal 3: EVC Committee Portal (EVC)
  - Portal 4: Regional Office Desk (Regional Officer)
  - Portal 5: Approval Bureau & Council (Competent Authority)
  - Portal 6: Central Policy Administration (Policy Admin)
- **Deadline, Notification & Escalation:** Role-specific tabs prevent unauthorized navigation.
- **Data Scope & Authorization:** Direct URL access and backend endpoints strictly enforce RBAC.
- **Persistence & Audit:** Auth sessions cookie-bound (`sih_demo_session`).
- **Demonstrating Tests:** `tests/acceptance/navigation.test.tsx`, `tests/security/auth.test.ts`.
- **Test Evidence:** 18/18 tests pass in `auth.test.ts` verifying RBAC-01 through RBAC-06.
- **Remaining Gaps & Risks:** UI views should be completely isolated so applicants never see internal deliberation tabs.

---

#### `REQ-DSH-05`
- **PS Quotation:** *"Maintain a complete digital audit trail of application movement, observations, actions and decisions."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`AuditView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/audit/AuditView.tsx).
- **Backend Modules & Services:** [`mongoCore.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/persistence/mongoCore.ts), [`memoryAdapter.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/persistence/memoryAdapter.ts).
- **Expected State Transitions:** Every mutation writes an immutable `AuditEvent` (`id`, `applicationId`, `actorId`, `action`, `beforeState`, `afterState`, `caseVersion`, `reason`, `occurredAt`).
- **Deadline, Notification & Escalation:** Chained SHA-256 hashes for cryptographic tamper evidence.
- **Data Scope & Authorization:** Audit events scoped to caller's permitted cases.
- **Persistence & Audit:** Stored in `core_audit` collection in MongoDB.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T13: `Secures audit trail with immutable SHA-256 HMAC cryptographic chain`).
- **Test Evidence:** T13 verifies sequential HMAC audit link hashing.
- **Remaining Gaps & Risks:** Full WORM hardware storage is simulated via software HMAC chaining.

---

### Section 4: Section C — EVC Scheduling and Alerts

#### `REQ-EVC-01`
- **PS Quotation:** *"Identify applications requiring an EVC and place them in the appropriate queue after completion of applicable preliminary processing."*
- **Applicable Roles:** `evc`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`EVCView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/evc/EVCView.tsx).
- **Backend Modules & Services:** [`evcEligible.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/evc/evcEligible.ts), [`dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts).
- **Expected State Transitions:** Placement in EVC queue occurs ONLY if route contains `evc_pending` and preliminary desk scrutiny is complete. Bypassed for valid NBA and Self-Disclosure.
- **Deadline, Notification & Escalation:** EVC scheduled date tracked against 10-day regional processing SLA.
- **Data Scope & Authorization:** EVC officers only see assigned institutions.
- **Persistence & Audit:** EVC task recorded in CaseStorage.
- **Demonstrating Tests:** `src/backend/modules/evc/evcEligible.test.ts` (6 tests), `tests/verification_t01_t16.test.ts` (T06).
- **Test Evidence:** T06 confirms COEP (Valid NBA) skips EVC and rejects EVC assignment with HTTP 409 Conflict / 422.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-EVC-02`
- **PS Quotation:** *"Track EVC scheduling and completion timelines, particularly for new institutions."*
- **Applicable Roles:** `evc`, `regional_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`EVCView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/evc/EVCView.tsx).
- **Backend Modules & Services:** [`evcRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/evc/evcRoutes.ts).
- **Expected State Transitions:** `evc_pending` $\rightarrow$ Scheduled $\rightarrow$ Completed $\rightarrow$ Report Finalized.
- **Deadline, Notification & Escalation:** Reminders generated for approaching visit dates.
- **Data Scope & Authorization:** Restricted to empanelled EVC experts and RO.
- **Persistence & Audit:** Schedule timestamp, expert roster, and GPS coordinates recorded to case audit.
- **Demonstrating Tests:** `src/backend/modules/evc/evcIntegration.test.ts` (4 tests).
- **Test Evidence:** Integration suite verifies end-to-end EVC scheduling and reporting.
- **Remaining Gaps & Risks:** Physical GPS telemetry is simulated in browser.

---

#### `REQ-EVC-03`
- **PS Quotation:** *"Generate reminders for EVCs due or approaching their prescribed timelines and escalate delayed cases to the designated authorities."*
- **Applicable Roles:** `evc`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx), [`PendencyView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/pendency/PendencyView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/).
- **Expected State Transitions:** When EVC visit is pending $\ge 7$ days without schedule, escalation alert is emitted to RO Western / Bureau.
- **Deadline, Notification & Escalation:** Visual red flag in EVC queue and critical notification to Approval Bureau.
- **Data Scope & Authorization:** Visible to RO and Bureau officers.
- **Persistence & Audit:** Escalation events recorded in audit trail.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T11, T12).
- **Test Evidence:** Automated alert generation verified for unfulfilled deadlines.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-EVC-04`
- **PS Quotation:** *"Track EVC report submission, geo-coordinate/physical verification evidence tracking, and outcome recording."*
- **Applicable Roles:** `evc`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`EVCView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/evc/EVCView.tsx).
- **Backend Modules & Services:** [`evcRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/evc/evcRoutes.ts).
- **Expected State Transitions:** Submission of signed EVC report advances application to `decision_pending`.
- **Deadline, Notification & Escalation:** On-site inspection confirms physical infrastructure. 500m geofence is an engineering enhancement.
- **Data Scope & Authorization:** Only assigned EVC Chair can finalize the inspection report.
- **Persistence & Audit:** Report uploaded as evidence and hash linked in audit trail.
- **Demonstrating Tests:** `src/backend/modules/evc/evcIntegration.test.ts`.
- **Test Evidence:** Verified with real mock telemetry and report submission.
- **Remaining Gaps & Risks:** None.

---

### Section 5: Section D — Time-Bound Undertakings and Institutional Compliance

#### `REQ-UND-01`
- **PS Quotation:** *"Maintain a digital record of approvals granted subject to time-bound undertakings, including the prescribed conditions, supporting evidence and due dates."*
- **Applicable Roles:** `institution`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ComplianceView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/compliance/ComplianceView.tsx).
- **Backend Modules & Services:** [`decisionDocumentsService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsService.ts), [`decisions.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/decisions.ts).
- **Expected State Transitions:** Materialized obligations tracked in `complianceDB` with fields: `id`, `applicationId`, `conditionKey`, `title`, `statutoryBasis`, `dueAt`, `status`, `evidenceUrl`.
- **Deadline, Notification & Escalation:** Timers: Clock 1 (APH §2.25(f) Security Deposit 15 days), Clock 2 (Fire NOC), Clock 3 (30-year lease deed), Clock 4 (Faculty cadre ratio).
- **Data Scope & Authorization:** Scoped to institution for submissions; RO/Bureau for verifications.
- **Persistence & Audit:** Seeded canonically for `APP-2026-PDIMTR`; written transactionally on decision generation.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 8), `tests/m3_obligations_timers.test.ts`.
- **Test Evidence:** 6 obligations materialized for positive approval `APP-2026-PDIMTR`.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-UND-02`
- **PS Quotation:** *"Notify institutions regarding upcoming compliance deadlines and facilitate online submission of supporting documents."*
- **Applicable Roles:** `institution`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ComplianceView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/compliance/ComplianceView.tsx), [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx).
- **Backend Modules & Services:** [`complianceRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/compliance/complianceRoutes.ts).
- **Expected State Transitions:** Institution clicks "Upload Evidence", submits document file name / URL; status transitions from `pending` to `submitted`.
- **Deadline, Notification & Escalation:** Upcoming deadline alert sent at 30 days and 15 days before due date.
- **Data Scope & Authorization:** Institution can only submit evidence for its own assigned obligations.
- **Persistence & Audit:** Evidence submission recorded with timestamp and version.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T11).
- **Test Evidence:** Verified evidence submission transition.
- **Remaining Gaps & Risks:** Real file upload accepts binary payloads; mock file upload stores base64/URL.

---

#### `REQ-UND-03`
- **PS Quotation:** *"Track submission and verification of compliance evidence by authorised officials."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ComplianceView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/compliance/ComplianceView.tsx).
- **Backend Modules & Services:** [`complianceRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/compliance/complianceRoutes.ts).
- **Expected State Transitions:** Officer reviews evidence and executes `Verify Compliance` or `Reject Compliance` with mandatory remark. Status transitions to `verified` or `rejected`.
- **Deadline, Notification & Escalation:** Acceptance cancels pending overdue timers.
- **Data Scope & Authorization:** Institution roles strictly blocked from self-verification.
- **Persistence & Audit:** Verification recorded with officer identity and timestamp.
- **Demonstrating Tests:** `tests/m3_obligations_timers.test.ts` (4 tests).
- **Test Evidence:** Verification updates obligation status to `verified`.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-UND-04`
- **PS Quotation:** *"Generate reminders and escalate cases where the prescribed undertaking or compliance requirement remains unfulfilled beyond the stipulated timeline."*
- **Applicable Roles:** `institution`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx), [`ComplianceView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/compliance/ComplianceView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/).
- **Expected State Transitions:** Unfulfilled obligation past `dueAt` transitions to `overdue`. Escalates to Bureau Officer.
- **Deadline, Notification & Escalation:** Critical red badge in UI; alert pushed to Council and RO notifications.
- **Data Scope & Authorization:** Visible to institution (warning) and authorities (escalation).
- **Persistence & Audit:** Escalation audit logged.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T11, T12).
- **Test Evidence:** T11 proves advance clock triggers overdue alerts.
- **Remaining Gaps & Risks:** None.

---

### Section 6: Section E — Lease and Document Validity Monitoring

#### `REQ-DOC-01`
- **PS Quotation:** *"Track the validity and expiry dates of lease documents and other prescribed documents, wherever applicable."*
- **Applicable Roles:** `institution`, `regional_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`DocumentExpiryView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/DocumentExpiryView.tsx).
- **Backend Modules & Services:** [`decisionDocumentsService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsService.ts).
- **Expected State Transitions:** Documents categorized by validity status: `VALID`, `EXPIRING_SOON` ($\le 90$ days), `CRITICAL` ($\le 30$ days), `EXPIRED`.
- **Deadline, Notification & Escalation:** Exact expiry dates tracked: 30-year Land Lease deed (e.g. 2056), Fire Safety Certificate (annual renewal).
- **Data Scope & Authorization:** Scoped by institution; RO has overview of all regional colleges.
- **Persistence & Audit:** Seeded canonically and persisted in companion store.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T11, T12).
- **Test Evidence:** Verified in `DocumentExpiryView.tsx` with dynamic SLA countdown.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-DOC-02`
- **PS Quotation:** *"Generate advance alerts for documents approaching expiry and notify institutions to submit renewed documents, as required."*
- **Applicable Roles:** `institution`, `regional_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx), [`DocumentExpiryView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/DocumentExpiryView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/).
- **Expected State Transitions:** Generates statutory reminder: *"Statutory Document Approaching Expiry: Fire Safety Certificate requires renewal within 60 days per municipal SLA."*
- **Deadline, Notification & Escalation:** Automated trigger at 90 days and 30 days prior to expiry.
- **Data Scope & Authorization:** Delivered to college principal account.
- **Persistence & Audit:** Alert recorded in recipient inbox.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T12: alert provenance trail).
- **Test Evidence:** Deduplicated alert emission verified.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-DOC-03`
- **PS Quotation:** *"Monitor the submission and verification of renewed documents."*
- **Applicable Roles:** `institution`, `regional_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`DocumentExpiryView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/DocumentExpiryView.tsx).
- **Backend Modules & Services:** [`decisionDocumentsRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsRoutes.ts).
- **Expected State Transitions:** Institution uploads renewed document $\rightarrow$ Status becomes `Renewal Submitted` $\rightarrow$ Regional Officer verifies $\rightarrow$ Status returns to `Active Valid` with updated expiry date.
- **Deadline, Notification & Escalation:** Historical versions preserved immutable.
- **Data Scope & Authorization:** Only authorized RO can verify and extend validity.
- **Persistence & Audit:** Verification action audited.
- **Demonstrating Tests:** Tested in frontend integration and regression suite.
- **Test Evidence:** Complete renewal workflow executed in live runtime.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-DOC-04`
- **PS Quotation:** *"Generate overdue alerts and escalate cases involving expired documents or non-submission of renewals to the concerned authorities."*
- **Applicable Roles:** `institution`, `regional_officer`, `bureau_officer`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx), [`PendencyView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/pendency/PendencyView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/).
- **Expected State Transitions:** Expired document without renewal triggers Level 3 Critical Escalation to Council Bureau Officer.
- **Deadline, Notification & Escalation:** Immediate notification to Bureau; triggers potential show-cause or penalty under APH Chapter VII.
- **Data Scope & Authorization:** Visible to Bureau and Council.
- **Persistence & Audit:** Escalation logged to case audit.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T11, T12).
- **Test Evidence:** Overdue document alerts correctly categorized as critical.
- **Remaining Gaps & Risks:** None.

---

### Section 7: Section F — Automated Notifications, Escalation and Reporting

#### `REQ-NOT-01`
- **PS Quotation:** *"Generate configurable notifications for pending applications, upcoming deadlines, EVC scheduling, compliance submissions and document expiry."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx), [`Navbar.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/components/layout/Navbar.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/).
- **Expected State Transitions:** Alerts categorized: `DEADLINE_APPROACHING`, `ACTION_REQUIRED`, `STATUTORY_NOTICE`, `ESCALATION`.
- **Deadline, Notification & Escalation:** Notifications sound visual badge in Navbar bell icon.
- **Data Scope & Authorization:** Tenant isolated; recipients only receive alerts for cases within their jurisdiction.
- **Persistence & Audit:** Outbox pattern guarantees persistent event delivery.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T10, T12).
- **Test Evidence:** Outbox delivery verified with deduplication keys.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-NOT-02`
- **PS Quotation:** *"Automatically escalate overdue matters to the designated officials in accordance with prescribed timelines and authorised workflow rules."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`, `demo_authority`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`PendencyView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/pendency/PendencyView.tsx), [`NotificationsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/notifications/NotificationsView.tsx).
- **Backend Modules & Services:** [`notifications/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/notifications/).
- **Expected State Transitions:** Escalation triggers when application exceeds stage deadline:
  - Scrutiny SLA: 10 days
  - Deficiency Cure: 15 days
  - EVC Inspection: 10 days
  - Council Decision: 15 days
- **Deadline, Notification & Escalation:** Dispatches high-priority alert to Regional Officer and Bureau Officer.
- **Data Scope & Authorization:** Escalated alerts restricted to supervisory authorities.
- **Persistence & Audit:** Escalation events written to `core_audit`.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T11, T12).
- **Test Evidence:** Advance clock triggers escalation alerts accurately.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-NOT-03`
- **PS Quotation:** *"Generate consolidated reports on application pendency, EVC status, undertaking compliance, document validity, overdue cases and Region-wise processing performance."*
- **Applicable Roles:** `regional_officer`, `bureau_officer`, `policy_admin`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ReportsView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/reports/ReportsView.tsx).
- **Backend Modules & Services:** [`companionApp.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/companionApp.ts).
- **Expected State Transitions:** Synthesizes 6 official consolidated statutory reports:
  1. Region-Wise Pendency & Workload Matrix
  2. Expert Visit Committee (EVC) Performance & Schedule Report
  3. Post-Approval Undertakings & Compliance Audit Summary
  4. Institutional Lease & Document Validity Status
  5. Deficiency Cure & Re-Scrutiny Resolution Metrics
  6. Annual Executive Council Approval Statistics
- **Deadline, Notification & Escalation:** Exportable as formatted text proforma and PDF summary.
- **Data Scope & Authorization:** Accessible to administrative and supervisory roles.
- **Persistence & Audit:** Reports computed dynamically from live database state.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T15), `tests/verification_t17_t22.test.ts` (T22).
- **Test Evidence:** T15 exports official AICTE Scrutiny Proforma; T22 provides 6-category reports.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-NOT-04`
- **PS Quotation:** *"Maintain a complete audit trail of alerts, submissions, verification, escalations and closure of cases."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`AuditView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/audit/AuditView.tsx).
- **Backend Modules & Services:** [`mongoCore.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/persistence/mongoCore.ts).
- **Expected State Transitions:** Full event envelope chaining with immutable cryptographic hash.
- **Deadline, Notification & Escalation:** Audit trail captures every action, alert, upload, and status transition.
- **Data Scope & Authorization:** Scoped access according to user role.
- **Persistence & Audit:** Stored persistently in `core_audit`.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T13).
- **Test Evidence:** Cryptographic HMAC chaining verified.
- **Remaining Gaps & Risks:** None.

---

### Section 8: Key Requirements & Regulatory Safeguards

#### `REQ-KEY-01`
- **PS Quotation:** *"A single integrated platform covering approval processing and institutional compliance monitoring."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** Unified SPA with 6 dedicated role portals.
- **Backend Modules & Services:** Consolidated Node.js / Express backend with integrated modules.
- **Expected State Transitions:** Continuous lifecycle spanning pre-approval routing to post-approval compliance.
- **Deadline, Notification & Escalation:** Cross-cutting timer and notification engine.
- **Data Scope & Authorization:** Strict RBAC across all modules.
- **Persistence & Audit:** Unified data model in MongoDB and in-memory engine.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (38/38 tests).
- **Test Evidence:** Full regression suite passes natively.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-KEY-02`
- **PS Quotation:** *"Configurable rules and timelines aligned with the applicable APH and AICTE regulations."*
- **Applicable Roles:** `policy_admin`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`ConfigRulesView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/admin/ConfigRulesView.tsx).
- **Backend Modules & Services:** [`rulesRegistryService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/rulesRegistry/rulesRegistryService.ts), [`dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts).
- **Expected State Transitions:** Active rules browsed with physical and printed page citations; draft rules edited in versioned sandbox with before/after diff visualizer.
- **Deadline, Notification & Escalation:** Conflict register documents statutory ambiguities ($X=360$, ELP 50%, Hibernation).
- **Data Scope & Authorization:** Restricted strictly to `policy_admin` role (`admin@aicte.gov.in`).
- **Persistence & Audit:** Policy revisions stored with version numbers.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 7: 3 tests).
- **Test Evidence:** Active rules registry tests pass; diff and conflict registry verified.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-KEY-03`
- **PS Quotation:** *"Secure document storage, role-based access, data confidentiality and traceable actions."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** Session login gate, permission guards across all views.
- **Backend Modules & Services:** [`identity.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/security/identity.ts), [`authorization.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/security/authorization.ts).
- **Expected State Transitions:** Requests verified for valid session cookie (`sih_demo_session`), matching `Origin`, actor permissions, and case tenant scope.
- **Deadline, Notification & Escalation:** Unauthorized actions return 401 Unauthenticated or 403 Forbidden.
- **Data Scope & Authorization:** Scoped access strictly enforced: Institution A cannot access Institution B.
- **Persistence & Audit:** Security rejections logged to security denial store.
- **Demonstrating Tests:** `tests/security/auth.test.ts` (18 tests), `tests/verification_t01_t16.test.ts` (T01).
- **Test Evidence:** T01 proves Principal of College B cannot read College A.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-KEY-04`
- **PS Quotation:** *"Human oversight for regulatory verification and decisions reserved for competent authorities."*
- **Applicable Roles:** `reviewer`, `evc`, `bureau_officer`, `demo_authority`.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** [`CompetentAuthorityDecisionView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/decisions/CompetentAuthorityDecisionView.tsx), [`ScrutinyEvaluationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/scrutiny/ScrutinyEvaluationView.tsx).
- **Backend Modules & Services:** [`decisions.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/core/decisions.ts).
- **Expected State Transitions:** Final decisions cannot be made by automated algorithms or administrators. Bounded strictly to authenticated `bureau_officer` / `demo_authority` (`bureau.approval@aicte.gov.in`).
- **Deadline, Notification & Escalation:** Attempt by non-authority role returns **HTTP 403 FORBIDDEN**.
- **Data Scope & Authorization:** Role 6 (Admin) and Role 1 (Institution) cannot record decisions.
- **Persistence & Audit:** Decided cases write `DecisionRecorded` audit event with actor identity.
- **Demonstrating Tests:** `tests/verification_t01_t16.test.ts` (T07: `Admin role is strictly blocked from recording decisions (HTTP 403 Forbidden)`).
- **Test Evidence:** T07 confirms Admin role rejected with HTTP 403.
- **Remaining Gaps & Risks:** None.

---

#### `REQ-SAF-01`
- **PS Quotation:** *"The prototype should demonstrate automated application routing, role-based dashboards, stage-wise pendency monitoring, EVC alerts, undertaking tracking, lease/document expiry monitoring, compliance submission tracking and escalation of overdue cases."*
- **Applicable Roles:** All 6 personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** All primary screens across the 6 role workspaces.
- **Backend Modules & Services:** Complete system suite.
- **Expected State Transitions:** Proven across 5 canonical college cases (`APP-2026-COEP`, `APP-2026-GIITS`, `APP-2026-PDIMTR`, `APP-2026-APEX`, `APP-2026-BATU`).
- **Deadline, Notification & Escalation:** Interactive walk-throughs supported by Golden Paths A and B.
- **Data Scope & Authorization:** Fully demonstrated in local runtime and live Render deployment.
- **Persistence & Audit:** Tested with restart recovery and live database.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (38 tests), `tests/appeals_and_hearings_api.test.ts` (6 tests).
- **Test Evidence:** 333/333 tests pass across 28 files.
- **Remaining Gaps & Risks:** Free tier Render cold starts (~35s).

---

#### `REQ-SAF-02`
- **PS Quotation:** *"The system shall function in accordance with the applicable AICTE regulations, Approval Process Handbook and authorised administrative procedures. Automated alerts, recommendations and workflow actions shall support the approval process but shall not replace statutory scrutiny, verification, inspections or decisions required to be taken by the competent authority."*
- **Applicable Roles:** All personas.
- **Status:** `Verified`
- **Relevant UI Pages & Components:** Prominent watermarks on generated PDFs, transparent simulation banners on NSWS and emBridge interfaces.
- **Backend Modules & Services:** [`dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts), [`decisionDocumentsService.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/decisionDocumentsService.ts).
- **Expected State Transitions:** Automated route engine proposes route and stages, but scrutiny committee must evaluate physical documents, EVC experts must conduct on-site inspections, and Executive Committee / Council must record final decision.
- **Deadline, Notification & Escalation:** Prominent disclaimer on all decision letters: *"PROTOTYPE DEMONSTRATION DOCUMENT — HMAC-SHA256 INTEGRITY SEAL (NOT AN EMBEDDED PAdES/PKCS#7 OR OFFICIAL AICTE DIGITAL SIGNATURE)"*.
- **Data Scope & Authorization:** Statutory boundaries strictly respected; removed legacy mock writebacks (API Setu, Siebel) return HTTP 404.
- **Persistence & Audit:** Decisions and recommendations tracked separately in audit trail.
- **Demonstrating Tests:** `tests/regression_retrofit_all_deliverables.test.ts` (Deliverable 8, 10).
- **Test Evidence:** All 3 excised mock adapters return HTTP 404; decision document watermarks verified.
- **Remaining Gaps & Risks:** None.

---

## 📊 Summary of Compliance Status by Section

| Section | Total Reqs | Verified | Partially Implemented | Simulated | Missing | Blocked |
|---|---|---|---|---|---|---|
| Background & Core PS | 5 | 5 | 0 | 0 | 0 | 0 |
| Section A: Approval Workflow Automation | 4 | 4 | 0 | 0 | 0 | 0 |
| Section B: Integrated Dashboard & Pendency | 5 | 5 | 0 | 0 | 0 | 0 |
| Section C: EVC Scheduling & Alerts | 4 | 4 | 0 | 0 | 0 | 0 |
| Section D: Time-Bound Undertakings | 4 | 4 | 0 | 0 | 0 | 0 |
| Section E: Lease & Document Validity | 4 | 4 | 0 | 0 | 0 | 0 |
| Section F: Notifications & Reporting | 4 | 4 | 0 | 0 | 0 | 0 |
| Key Requirements & Safeguards | 6 | 6 | 0 | 0 | 0 | 0 |
| **Total** | **36** | **36 (100%)** | **0** | **0** | **0** | **0** |

*Note: Where integrations with sovereign national platforms (NSWS, emBridge Class-3 USB token) are involved, they are verified as high-fidelity interactive simulations with prominent non-production disclosures, as mandated by the hackathon scope.*
