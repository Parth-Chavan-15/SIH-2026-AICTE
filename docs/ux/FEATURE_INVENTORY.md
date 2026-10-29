# NIYAMSETU (नियमसेतु) — Comprehensive Feature Inventory & Preservation Contract

**Project:** NIYAMSETU (AICTE PS 26262 Approval Workflow Automation)  
**Baseline Commit:** `700ccce`  
**Date:** 2026-10-29  
**Status:** Canonical Preservation Baseline  

---

## 1. Feature Inventory & Disposition Matrix

Every existing feature in NIYAMSETU has been audited across backend APIs, domain state machines, persistence engines, frontend routes, and UI components. Each capability is assigned one of the five mandatory disposition codes:
- **[A] Preserve as a core capability**: Must remain fully functional without degradation.
- **[B] Preserve but simplify its presentation**: Retain underlying logic/API while reducing clutter.
- **[C] Move to contextual or advanced access**: Move from crowded default view to dedicated tab, drawer, or modal.
- **[D] Remove from the visible UI**: Strictly for decorative, duplicate, or dead UI controls.
- **[E] Fix before deciding**: Broken or ambiguous feature requiring code repair.

| Feature ID | Capability / Component | Current Implementation | Disposition | Detailed Rationale & Preservation Requirement |
| :--- | :--- | :--- | :---: | :--- |
| **FEAT-01** | **Dynamic Route Engine (APH Table 2.3)** | `src/backend/policy/engine.ts`, `routing.ts` | **[A]** | Authoritative 21-category route selector; evaluates accreditation, intake surge, land title, and chapter distinctions. Must remain purely backend-driven. |
| **FEAT-02** | **Policy Review Required Hold ($X=360$, ELP, Hibernation)** | `src/backend/policy/rules.ts` | **[A]** | Material ambiguities safely halt to `policy_review_required` hold. No hardcoding or heuristic guessing allowed. |
| **FEAT-03** | **Differential Scope-Locked Re-Scrutiny (APH §1.8(g))** | `src/backend/modules/scrutiny/`, `validateCorrections.ts` | **[A]** | Cleared checklist items ($C3, C4$) are cryptographically locked read-only. Modifying them returns `HTTP 409 Conflict`. Core natural justice innovation. |
| **FEAT-04** | **Chapter I vs Chapter II Routing Separation** | `docs/workflows/01_chapter_i...`, `02_chapter_ii...` | **[A]** | Strict separation of New Institutions (LoD $\to$ LoR $\to$ LoA, physical EVC, 10-yr FDR) from Existing Institutions (EoA renewal, Table 2.3). |
| **FEAT-05** | **Desk Scrutiny Checklist Review (Snapshot v1)** | `ScrutinyEvaluationView.tsx`, `scrutinyRoutes.ts` | **[B]** | 6 statutory checklist categories; digital signing of Snapshot v1. Simplify dense multi-nested UI into clean, task-oriented checklist layout. |
| **FEAT-06** | **Applicant Deficiency Cure Window (Annexure 7)** | `InstitutionDeficiencyCureView.tsx`, `api.ts` | **[B]** | 10-day operational SLA turnaround for applicant to upload rectified evidence for flagged items ($D1, D2$). Keep fully active with clean upload controls. |
| **FEAT-07** | **Physical EVC & 500m Geo-Fencing** | `EVCView.tsx`, `evcRoutes.ts`, `evcService.ts` | **[B]** | GPS verification within 500m perimeter and 30-min continuous walkthrough video upload. Clean up UI telemetry display. |
| **FEAT-08** | **NBA Tier-1 Physical EVC Exemption (§2.6(c)(1))** | `engine.ts`, `CaseDetailView.tsx` | **[A]** | High NBA score ($\ge 650$) automatically waives physical inspection per APH Addendum Errata G02 p. 42. Keep explanation prominent. |
| **FEAT-09** | **Competent Authority Human Decision Gate (§1.10)** | `CompetentAuthorityDecisionView.tsx` | **[B]** | Human-only adjudication gate; AI/automation cannot self-approve. Simplify crowded voting console to clear speaking order formulation. |
| **FEAT-10** | **Quasi-Judicial Decision Document Generator (PDF-Lib)** | `decisionDocumentsService.ts`, `GeneratedDocumentsView.tsx` | **[A]** | Generates tamper-evident LoA, EoA, and LoR PDFs with SHA-256 digest and HMAC-SHA256 seal. Preserves full binary generation. |
| **FEAT-11** | **Standing Hearing Committee (SHC) Compliance (§2.23.3)** | `AppealsAndHearingsView.tsx`, `appealsAndHearingsRoutes.ts` | **[B]** | Quasi-judicial hearing workflow for persistent shortcomings. Decoupled from core spine to avoid blocking clean applications. |
| **FEAT-12** | **Standing Appellate Committee (SAC) 7-Day Appeals** | `AppealsAndHearingsView.tsx`, `regulatory_clock_guards.test.ts` | **[A]** | Strict 7-calendar-day statute of limitations under APH §1.11 / §2.24. Time-bars late appeals; records speaking orders. |
| **FEAT-13** | **Chapter VII Complaint Redressal & §7.10(h) Anonymous Bar** | `AppealsAndHearingsView.tsx`, `appealsAndHearingsService.ts` | **[A]** | Rejects anonymous complaints at intake per CVC/APH norms; routes verified complaints through SCSC $\to$ Surprise EVC $\to$ SHC $\to$ Council. |
| **FEAT-14** | **4-Clock Deterministic Timer Engine** | `complianceService.ts`, `m3_obligations_timers.test.ts` | **[A]** | Strictly isolates: (1) 7-day SAC appeal, (2) 10-day operational SLA cure, (3) 15-day §2.25(f) Joint FDR/Affidavit-3, (4) 30-day statutory committees. |
| **FEAT-15** | **5-State Document Verification Lifecycle** | `storage.ts`, `contracts.ts`, `DocumentExpiryView.tsx` | **[A]** | State machine: `DRAFT` $\to$ `SUBMITTED` $\to$ `VERIFIED` / `DEFICIENT` $\to$ `SCOPE_LOCKED`. No automatic self-verification. |
| **FEAT-16** | **Regional Office Desk Allocation & Workload Balancer** | `ROAllocationView.tsx`, `allocationRoutes.ts` | **[B]** | Groups 1-4 quota allocation across Western Region. Streamline table view with clear group assignments. |
| **FEAT-17** | **Authorized Stage Revert / Return per APH §1.8(f)-(g)** | `ApplicationDetailModal.tsx`, `workflowRoutes.ts` | **[C]** | RO/Bureau can return case to previous stage with mandatory written statutory reason recorded to WORM audit log. Accessible via contextual action. |
| **FEAT-18** | **Electronic Case Summary & 5 Standardized Statutory Notices** | `CaseSummaryNoticesModal.tsx`, `workflowRoutes.ts` | **[C]** | Formal notices (Scrutiny Schedule, Annexure 7 Deficiency, EVC Intimation, Conditional EoA, Speaking Order). Accessible via button in Dossier. |
| **FEAT-19** | **NSWS Application Ingestion & Onboarding Simulation** | `NSWSSimulationView.tsx`, `nswsRoutes.ts` | **[B]** | Trim 5 cumbersome steps down to 5 clean, coherent conceptual steps (Identity $\to$ DSC $\to$ App Details $\to$ Route Eval $\to$ Submit & Dossier). |
| **FEAT-20** | **Class-3 DSC / emBridge USB Token Hardware Simulation** | `NSWSSimulationView.tsx`, `adapterRoutes.ts` | **[B]** | Clearly labelled simulation; supports ePass2003Auto, WatchKey, expired cert rejection (422), and unsigned bypass when not required. |
| **FEAT-21** | **Portal Import & Ecosystem Ingestion (JSON Fixtures)** | `PortalImportView.tsx`, `portalImportRoutes.ts` | **[B]** | Ingestion bridge for NSWS webhooks and Siebel records. Retain clean drag-and-drop JSON simulation. |
| **FEAT-22** | **Central Policy Administration & Active Rules Registry** | `ConfigRulesView.tsx`, `rulesRegistryRoutes.ts` | **[B]** | Pinned handbook version inspector (AY 2026-27), rule parameter tuning (360-seat hold). Move into clean, readable policy studio. |
| **FEAT-23** | **Tamper-Evident HMAC-SHA256 WORM Audit Ledger** | `AuditView.tsx`, `mongoInit.ts`, `records.ts` | **[A]** | Cryptographic hash chaining on all transitions, reverts, and decisions. Preserves full evidentiary trail. |
| **FEAT-24** | **Dual-Engine Persistence (MongoDB Atlas + Memory Fallback)** | `server.ts`, `mongoInit.ts`, `memoryAdapter.ts` | **[A]** | Durable write-through persistence across all 11 domain models when Atlas is connected, with transactional fallback. |
| **FEAT-25** | **Safe Version & Diagnostic Probes** | `server.ts`, `companionApp.ts` (`/api/version`, `/health`) | **[A]** | Non-sensitive JSON diagnostic endpoint returning commit SHA, version, uptime, and storage readiness without exposing credentials. |
| **FEAT-26** | **Global Case Quick-Search (Ctrl+K / Cmd+K)** | `App.tsx` | **[A]** | Instant keyboard-accessible modal searching across PID, institution name, stage, and region. |
| **FEAT-27** | **Case Dossier (ApplicationDetailModal)** | `ApplicationDetailModal.tsx` | **[B]** | Redesign from 1,613-line nested scrolling modal to clean, lifecycle-first presentation with compact identity, route bar, and primary next action. |
| **FEAT-28** | **Redundant Decorative Status Cards** | Various views | **[D]** | Remove duplicate cards that repeat the exact same metadata 3-4 times on the same screen (e.g. status in header + status in badge + status in table + status in subcard). |

---

## 2. Preservation Audit of the 8 Core NIYAMSETU Innovations

| Innovation Mechanism | Statutory Grounding | Architectural Implementation | Preservation Status |
| :--- | :--- | :--- | :---: |
| **1. Version-Pinned Rule Registry** | APH 2024-27 & Errata G02 p. 42 | Policy facts linked to immutable `policyRevisionId`; in-flight cases never drift when new rules are published. | **PRESERVED** |
| **2. Differential Scope-Locked Re-Scrutiny** | APH §1.8(g) Natural Justice | Server rejects changes to cleared items ($C3, C4$) with `HTTP 409 Conflict: RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES`. | **PRESERVED** |
| **3. Conditional NBA Fast-Track EVC Waiver** | APH §2.6(c)(1) & Errata G02 p. 42 | Mathematical evaluation: Tier-1 accredited programs ($\text{Score} \ge 650$) skip physical inspection stage. | **PRESERVED** |
| **4. 5-State Document Verification Lifecycle** | APH §1.8 & Annexure 7 | `DRAFT` $\to$ `SUBMITTED` $\to$ `VERIFIED` / `DEFICIENT` $\to$ `SCOPE_LOCKED`. Manual verification required. | **PRESERVED** |
| **5. 4-Clock Deterministic Timer Engine** | APH §1.11, §1.8, §2.25(f), §2.19(c) | Isolates 7d SAC appeal, 10d SLA cure, 15d FDR post-approval, and 15d DTE concurrence. Stale alerts suppressed. | **PRESERVED** |
| **6. Optimistic Concurrency Protection** | System Invariant | Every mutation passes `expectedVersion`; concurrent conflicting updates return `HTTP 409 / 412`. | **PRESERVED** |
| **7. Tamper-Evident HMAC-SHA256 Audit Chain** | Evidence Act compliance | Every audit block calculates $\text{HMAC-SHA256}(\text{PrevHash} \parallel \text{Payload})$. Tampering breaks chain. | **PRESERVED** |
| **8. Outbox-Based Dispatch & Traceable Notifications** | Reliable Government Messaging | Events written atomically to `core_outbox`; dispatched asynchronously with attempt counters and delivery tracking. | **PRESERVED** |
