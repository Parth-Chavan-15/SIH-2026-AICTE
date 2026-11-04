# NIYAMSETU (नियमसेतु) — PHASE 3.1
## UI Action Acceptance & Role Workspace Verification Matrix

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**UI Freeze Directive:** Verified existing UI appearance and action bindings without unauthorized layout refactoring.

---

## 1. UI Architecture & View Bindings

In accordance with the Phase 3.1 instruction, the existing demonstrated UI structure, tab navigation, color palettes, and component hierarchy have been strictly preserved while ensuring backend action completeness.

---

## 2. UI Action Acceptance Verification Table

| UI View Component | Tab Identifier | Tested User Role | Observed UI Control / Action | Expected Backend Trigger | Result & Verification Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NSWS Simulation** | `inst-nsws` | Institution / Applicant | Mode A Presets selector; Mode B Form; "Evaluate Route" & "Submit" buttons. | `POST /api/v1/nsws/evaluate-route`, `POST /api/v1/nsws/submit` | **Accepted & Tested.** Route evaluated dynamically; case persisted into `niyamsetu_dev`. |
| **NSWS Direct Hand-Off** | `inst-nsws` (Step 5) | Institution / Applicant | "Open Case Dossier (Direct Hand-off)" button. | `onSelectApplication(submittedApp.id)` triggers `ApplicationDetailModal`. | **Accepted & Tested.** Case dossier opens immediately with full facts. |
| **Applications Docket** | `inst-apps`, `scrutiny-queue` | Institution, Scrutiny Reviewer, RO | Search input, Region filter dropdown, Status pills, Application row click. | `GET /api/v1/applications`, client-side filter and modal selection. | **Accepted & Tested.** Respects multi-tenant isolation; displays route type cleanly. |
| **Scrutiny Evaluation Console** | `scrutiny-eval` | Scrutiny Reviewer (`usr-scrutiny-reviewer`) | "Verify", "Deficiency Flag", "Mandatory Observation", "Finalize Evaluation". | `POST /api/v1/scrutiny/:id/evaluate`, `/api/v1/applications/:id/transition` | **Accepted & Tested.** Observations recorded; deficiency communicates back to institution. |
| **Institution Deficiency Cure** | `inst-deficiencies` | Institution Principal (`usr-inst-coep`, etc.) | "Upload Remediated Evidence", "Submit Cure Filing". | `POST /api/v1/scrutiny/:id/cure` | **Accepted & Tested.** Cured documents queued for re-scrutiny; 10-day SLA monitored. |
| **RO Committee Allocation** | `ro-allocations` | Regional Officer (`usr-ro-western`) | Roster declaration, Expert selection, Bias conflict declaration, EVC Schedule. | `POST /api/v1/allocation/roster`, `POST /api/v1/evc/schedule` | **Accepted & Tested.** Prevents conflicted assignments; enforces 3-expert quorum. |
| **EVC Inspection Console** | `evc-inspections` | EVC Chair / Member (`usr-evc-chair`) | Geotagged photo check, Infrastructure verification table, EVC Report sign-off. | `POST /api/v1/evc/:id/report` | **Accepted & Tested.** Records EVC findings; validates built-up area and labs. |
| **Appeals & SAC Hearings** | `appeals-hearings` | Legal Directorate / SAC Members | Appeal docket, Hearing notice issue, Judicial finding entry, Speaking order dispatch. | `POST /api/v1/appeals-hearings`, `/api/v1/appeals-hearings/:id/minutes` | **Accepted & Tested.** Enforces strict separation between SHC and SAC committee members. |
| **Competent Authority Decision** | `ca-decisions` | Approval Bureau HQ (`usr-bureau-hq`) | "Grant Approval (LoA/EoA)", "Issue Rejection Order (LoR)", "Executive Committee Override". | `POST /api/v1/applications/:id/decisions` | **Accepted & Tested.** Requires demo authority; signs decision cryptographically. |
| **Document Vault** | `inst-decision-docs` | Institution, RO, Bureau | Download PDF, Verify QR Seal, View Watermark. | `GET /api/v1/artifacts/:id/download` | **Accepted & Tested.** Streams tamper-evident PDF with dynamic QR and HMAC signature. |
| **Audit & Governance** | `admin-audit` | System Admin (`usr-admin`) | WORM audit log inspection, SHA-256 hash tree validation, Tamper alert monitor. | `GET /api/v1/audit-logs` | **Accepted & Tested.** Full chronological audit chain visible with actor attribution. |
