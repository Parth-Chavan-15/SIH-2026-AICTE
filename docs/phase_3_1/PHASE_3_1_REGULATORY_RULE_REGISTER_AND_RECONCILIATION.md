# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Regulatory Rule Register & Source Reconciliation

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**Verification Method:** Cross-Document Citation Analysis & Implementation Traceability

---

## 1. Statutory Rule Catalog & Hierarchy of Authority

In accordance with constitutional administrative law, the normative hierarchy governing NIYAMSETU is strictly maintained:
1. **Primary Legislation:** AICTE Act, 1987 (Act 52 of 1987) — Statutory powers of Council (§10, §11).
2. **Judicial Decrees:** Supreme Court Orders (Parshvanath Charitable Trust 2013, Orissa Lift Irrigation 2017, Supreme Court Order 22 Jan 2018).
3. **Subordinate Legislation / Gazetted Regulations:** AICTE (Grant of Approvals) Guidelines 2024–27 (DOC-01).
4. **Authoritative Handbooks & Addenda:** Approval Process Handbook 2024–27 (DOC-04) as amended by Addendum-Corrigendum 2026–27 (DOC-03).
5. **Administrative Notices & Circulars:** Public Notices (DOC-08, DOC-09) and BBA/BMS/BCA Circulars (DOC-05).

---

## 2. Reconciled Rule Register (32 Traced Statutory Rules)

| Rule ID | Regulatory Category | Statutory Clause Citation | Document ID | Rule Summary & Condition | System Implementation & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RULE-01** | Chapter I: New Inst | APH §1.8.1, Gazette Reg 4 | DOC-04, DOC-01 | Sequential Desk Scrutiny followed by physical EVC mandatory for all new institutions. | `dynamicRouteEngine.ts`, `tests/policy/routing.test.ts` |
| **RULE-02** | Chapter I: Land | APH §1.8.4, Table 1.2 | DOC-04 | Land ownership / leasehold verified against mega/metro/rural thresholds. | `landNorms.ts`, `tests/verification_t01_t16.test.ts` |
| **RULE-03** | Chapter II: EoA Self-Disc | APH §2.5, Table 2.3 Row 1 | DOC-04 | Existing institutions with zero deficiency eligible for Fast-Track automated EoA without Scrutiny/EVC. | `dynamicRouteEngine.ts`, `tests/workflow.test.ts` |
| **RULE-04** | Chapter II: Intake Surge | APH §2.6, Table 2.3 Row 9 | DOC-04, DOC-03 | Additional course / intake increase: NBA accredited waives EVC; non-NBA mandates Scrutiny + EVC. | `dynamicRouteEngine.ts`, `tests/acceptance/nsws_case_injection_e2e.test.ts` |
| **RULE-05** | NBA Accreditation Waiver | Addendum Item 16, Errata p. 42 | DOC-03 | NBA accredited programmes (>=650 points) waived from physical EVC inspection. | `dynamicRouteEngine.ts`, `tests/regression_retrofit_all_deliverables.test.ts` |
| **RULE-06** | Intake Ceiling Boundary | APH §2.9.2, Table 2.3 Row 9 | DOC-04 | Division boundary X = 360 requires explicit Executive Committee / Policy Review. | `dynamicRouteEngine.ts`, `tests/policy/phase1_intake_and_boundary.test.ts` |
| **RULE-07** | Change of Site / Location | APH Table 2.3 Row 3 | DOC-04 | Mandatory physical EVC inspection to verify land and physical infrastructure before shifting. | `dynamicRouteEngine.ts`, `tests/policy/routing.test.ts` |
| **RULE-08** | Restoration of Intake | APH Table 2.3 Row 14 | DOC-04 | Break-in-EoA or restoration mandates physical EVC to verify rectified deficiencies. | `dynamicRouteEngine.ts`, `tests/regression_retrofit_all_deliverables.test.ts` |
| **RULE-09** | Course Closure | APH §2.18, Table 2.3 Row 16 | DOC-04 | Progressive closure processed through Desk Scrutiny only; physical EVC waived. | `dynamicRouteEngine.ts`, `tests/acceptance/boundaries.test.ts` |
| **RULE-10** | Institution Closure | APH §2.19, Table 2.3 Row 17 | DOC-04 | Complete closure requires Desk Scrutiny, NOC from Affiliating University & State Govt. | `dynamicRouteEngine.ts`, `tests/acceptance/boundaries.test.ts` |
| **RULE-11** | ODL / Online Learning | UGC (ODL) Reg 2020, APH Ch III | DOC-04 | Distance education requires UGC concurrence; flagged as UGC dependency. | `dynamicRouteEngine.ts`, `tests/policy/authoritativeRouting.test.ts` |
| **RULE-12** | BBA/BMS/BCA Regulation | AICTE Circular Dec 2023 | DOC-05 | Non-technical undergraduate programs brought under AICTE EoA norms. | `dynamicRouteEngine.ts`, `tests/policy/routing.test.ts` |
| **RULE-13** | Scrutiny Composition | APH §1.8.2 | DOC-04 | 3-member Scrutiny Committee: 1 Professor, 1 Assoc Professor, 1 AICTE/Industry Nominee. | `scrutinyRoutes.ts`, `tests/interaction_audit.test.ts` |
| **RULE-14** | EVC Constitution | APH §1.9.1 | DOC-04 | 3-member Expert Visiting Committee: 2 Professors, 1 Regional Architect / Expert. | `evcRoutes.ts`, `tests/verification_t01_t16.test.ts` |
| **RULE-15** | Scrutiny Deficiency Cure | APH §1.8.3, REC-08 | DOC-04, REC-08 | Maximum 1 re-scrutiny opportunity granted before adverse recommendation. | `scrutinyIntegration.ts`, `tests/verification_t17_t22.test.ts` |
| **RULE-16** | EVC Compliance Window | APH §1.9.4, REC-02 | DOC-04, REC-02 | EVC deficiency compliance report evaluated by Standing Complaint Committee (SCC/SHC). | `complianceService.ts`, `tests/interaction_audit.test.ts` |
| **RULE-17** | Standing Hearing Committee | APH §1.10.1, REC-07 | DOC-04, REC-07 | SHC grants personal hearing to institutions recommended for rejection by Scrutiny/EVC. | `appealsAndHearingsRoutes.ts`, `tests/appeals_and_hearings_api.test.ts` |
| **RULE-18** | Standing Appellate Comm | APH §1.11.1, REC-07 | DOC-04, REC-07 | SAC is the final internal quasi-judicial appellate authority under former High Court Judge. | `appealsAndHearingsRoutes.ts`, `tests/acceptance/shc_sac_role_separation.test.ts` |
| **RULE-19** | SHC / SAC Role Separation | APH §1.10, §1.11 | DOC-04 | Rigid separation: Members who sat on SHC cannot sit on SAC for the same case. | `appealsAndHearingsRoutes.ts`, `tests/acceptance/shc_sac_role_separation.test.ts` |
| **RULE-20** | Re-Hearing Guard | APH §1.11.4 | DOC-04 | Maximum 1 appeal before SAC permitted; second appeals barred. | `appealsAndHearingsRoutes.ts`, `tests/appeals_and_hearings_api.test.ts` |
| **RULE-21** | Ter Charges Exemption | APH §2.4, Table 2.1 | DOC-04 | Government / University-run institutions exempt from Processing TER charges. | `dynamicRouteEngine.ts`, `tests/shared/contracts.test.ts` |
| **RULE-22** | Land Concurrence | APH §1.8.4, REC-04 | DOC-04, REC-04 | State Govt / University Concurrence letter required for LoA. | `dynamicRouteEngine.ts`, `tests/acceptance/boundaries.test.ts` |
| **RULE-23** | Digital Signature Guard | AICTE DSC Manual | AICTE Manual | Class-3 Hardware USB Crypto-Token (ePass2003Auto) mandatory for all institutional filings. | `adapterRoutes.ts`, `tests/interaction_audit.test.ts` |
| **RULE-24** | NSWS Single-Window Gate | AICTE NSWS Guide | NSWS Guide | Ingestion through NSWS simulation with PAN verification and investor profile mapping. | `nswsRoutes.ts`, `tests/acceptance/nsws_case_injection_e2e.test.ts` |
| **RULE-25** | Parshvanath SC Deadline | Supreme Court Order 2013 | DOC-06 | Rigid calendar: April 30 final approval deadline; May 31 appellate cutoff. | `regulatory_clock_guards.ts`, `tests/regulatory_clock_guards.test.ts` |
| **RULE-26** | Public Notice Filing Ext | Public Notice 26.11.2025 | DOC-08, DOC-09 | Extended application filing deadline to 15.01.2026 / 31.01.2026 with late fee. | `regulatory_clock_guards.ts`, `tests/regression_retrofit_all_deliverables.test.ts` |
| **RULE-27** | Deficiency Communicated SLA | APH §1.8.3, Operational | DOC-04 | Maximum 7 calendar days for regional office to dispatch deficiency report. | `workflowEngine.ts`, `tests/m3_obligations_timers.test.ts` |
| **RULE-28** | Institution Cure SLA | APH §1.8.3 | DOC-04 | Maximum 10 calendar days for institution to upload compliance documents. | `workflowEngine.ts`, `tests/m3_obligations_timers.test.ts` |
| **RULE-29** | Cryptographic QR Seal | IT Act 2000 §3A | Statutory | HMAC-SHA256 signature and verification QR embedded on all issued LoA/EoA/LoR documents. | `decisionDocumentsRoutes.ts`, `tests/regression_retrofit_all_deliverables.test.ts` |
| **RULE-30** | Tenant Isolation | Data Protection Norms | PS 26262 | Institution actor can only view cases belonging to their own assigned institution ID. | `authorization.ts`, `tests/security/auth.test.ts`, `tests/verification_t01_t16.test.ts` |
| **RULE-31** | WORM Audit Immutability | Comptroller / IT Audit | Best Practice | Audit log records chained via HMAC-SHA256 hash tree preventing log tampering. | `memoryAdapter.ts`, `tests/production_persistence_idempotency.test.ts` |
| **RULE-32** | Idempotent Submission | Distributed Systems Norms | PS 26262 | Duplicate requests with same idempotency key return original response without re-executing. | `mongoCore.ts`, `tests/production_persistence_idempotency.test.ts` |
