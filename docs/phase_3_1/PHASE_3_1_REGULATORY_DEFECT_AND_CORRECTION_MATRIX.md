# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Regulatory Defect, Audit Discrepancy & Correction Matrix

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**Verification Method:** Root Cause Analysis, Code Modification & Regression Proof

---

## 1. Defect & Discrepancy Reconciliation Summary

During Phase 3 review and Phase 3.1 integrity audit, several discrepancies were identified between historical audit reports, original regulatory sources, and early prototype implementation shortcuts.

All identified defects have been forensically analyzed, corrected in application code, and confirmed through automated regression tests.

---

## 2. Comprehensive Defect & Correction Matrix

| Defect ID | Defect Category | Historical Flaw / Assumption | Official Source Ground Truth | Root Cause in Prototype | Corrective Implementation in Phase 3.1 | Verification & Regression Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | **NSWS Hand-Off Disconnect** | NSWS submission was a frontend-only simulation; cases were not visible to logged-in institutions. | NSWS is AICTE's single point of intake. Applications must flow into portal queues and institution dockets. | Mismatched institution IDs (`INST-COEP-WES` vs actor's `INST-SOUTH`); synthetic overwrite in `mongoCore.ts`. | Harmonized institution identifiers in `NSWSSimulationView.tsx`, `identity.ts`, and preserved `facts.institutionName` in `mongoCore.ts`. Added direct hand-off navigation. | `tests/acceptance/nsws_case_injection_e2e.test.ts` (Passed) |
| **DEF-02** | **Hardcoded Route Projections** | `mongoCore.ts`, `mongoInit.ts`, and `api.ts` checked `id.includes('BATU')`, `id.includes('APEX')` to determine route. | Routes are statutory legal pathways defined by Table 2.3 stages and clauses, irrespective of institution name. | Early prototyping shortcut for 5 sample institutions. | Created `deriveRouteType(a: Application)` in `mongoCore.ts` and `api.ts` that derives route purely from `a.route.stages` and `policyRevisionId`. | `tests/core/mongo-adapter.test.ts`, `tests/regression_retrofit_all_deliverables.test.ts` (Passed) |
| **DEF-03** | **Synthetic Overwrite on Insert** | `mongoCore.ts` line 82 hardcoded `institutionName: app.institutionId, state: 'Synthetic', city: 'Synthetic'`. | Case persistence must preserve real institutional applicant facts. | Hardcoded fixture injection in mongo adapter. | Updated line 82 to read `(app.facts as any)?.institutionName || app.institutionId` and real geographical fields. | `tests/acceptance/nsws_case_injection_e2e.test.ts` (Passed) |
| **DEF-04** | **Intake Formula Boundary $X = 360$** | Assumed intake formula applied without ceiling or treated 360 as standard automated approval. | APH 2024–27 Clause 2.9 & Table 2.3 Row 9: Division boundary $X = 360$ requires explicit Executive Committee / Policy Review. | Lack of explicit boundary guard in dynamic route evaluation. | Implemented `evaluateDynamicRoute` boundary check: if `proposedIntake > 360` or `existingIntake >= 360`, returns `review_required`. | `tests/policy/phase1_intake_and_boundary.test.ts` (38 tests passed) |
| **DEF-05** | **Parshvanath Calendar vs Public Notice Deadlines** | Rigidly enforcing April 30 cutoff from Parshvanath judgment without honoring valid administrative extension notices. | Public Notices 26.11.2025 (DOC-08, DOC-09) officially extended AY 2026–27 filing deadlines to 15.01.2026 and 31.01.2026. | Rigid static calendar comparator. | Enhanced `regulatory_clock_guards.ts` to distinguish Chapter I vs Chapter II deadlines, recognizing extended filing windows. | `tests/regulatory_clock_guards.test.ts` (27 tests passed) |
| **DEF-06** | **Calendar Month Clamping (Leap Year / Month-End)** | Date math using naive 30-day increments or `month += 6` causing overflow (e.g. Aug 31 + 6 months -> March 3). | Statutory deadlines must clamp cleanly to the last day of target month (e.g. Aug 31 -> Feb 28/29). | Standard JavaScript `Date` month increment rollover. | Implemented `addCalendarMonths` with clamping in `workflowEngine.ts` and `m3_obligations_timers.ts`. | `tests/m3_obligations_timers.test.ts` (9 tests passed) |
| **DEF-07** | **SHC / SAC Committee Overlap** | Prototype lacked enforcement preventing the same committee members from serving on both SHC and SAC for the same case. | APH §1.10 and §1.11 require strict judicial separation of first hearing (SHC) and final appeal (SAC). | Missing cross-committee validation guard. | Added `validateCommitteeSeparation(shcMembers, sacMembers)` in `appealsAndHearingsService.ts`. | `tests/acceptance/shc_sac_role_separation.test.ts` (5 tests passed) |
| **DEF-08** | **DSC Hardware Token Validation** | Early mock accepted any random string without verifying emBridge USB crypto-token format. | AICTE DSC Manual mandates Class-3 Hardware USB Crypto-Token (`ePass2003Auto`, `mSigner V3.2`). | Simple boolean `dscSigned: true` check. | Added cryptographic token type validation in `adapterRoutes.ts` and `nswsService.ts` rejecting non-hardware tokens. | `tests/interaction_audit.test.ts` (Passed) |
| **DEF-09** | **Tenant Isolation for Escalation Dockets** | Escalation dockets could potentially leak SLA breach alerts across institutions. | PS 26262 requires strict multi-tenant isolation: institutions must never observe peer dockets or alerts. | Incomplete actor scoping on alert queries. | Enforced `actor.institutionIds` filtering on `/api/v1/alerts` and `/api/v1/escalations`. | `tests/security/escalation_tenant_isolation.test.ts` (7 tests passed) |
| **DEF-10** | **WORM Audit Trail Chaining** | Audit records were stored as disconnected flat records vulnerable to backdated modification. | Comptroller / CVC standards require write-once read-many immutable audit chaining. | Standard unchained database inserts. | Implemented HMAC-SHA256 hash chaining (`computeAuditHash`) with secret key `AICTE-PRAVAHREG-WORM-GOVERNANCE-KEY-2026`. | `tests/production_persistence_idempotency.test.ts` (10 tests passed) |
