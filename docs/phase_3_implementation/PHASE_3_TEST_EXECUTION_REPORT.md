# NIYAMSETU (नियमसेतु) — PHASE 3.1 TEST EXECUTION REPORT
**Project:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Test Runner:** Vitest v5.0.5 | Node.js v24.12.0  
**Target Branch:** `dev` (Strictly Local Development)  
**Execution Timestamp:** 2026-11-03T14:02:16+05:30  
**Overall Result:** 37 / 37 SUITES PASSED | 475 / 475 TESTS PASSED | 0 FAILURES | 100% PASS RATE

---

## 1. Executive Summary & Table Discrepancy Reconciliation

The complete automated test suite for NIYAMSETU Phase 3.1 was executed against the local codebase. All **thirty-seven (37) test files passed cleanly with 475 tests and zero failures**.

```
================================================================================
                    NIYAMSETU PHASE 3.1 TEST EXECUTION SUMMARY
================================================================================
  Test Files:      37 passed (37 total)
  Tests:           475 passed (475 total)
  Failures:        0
  Skipped:         0
  Duration:        11.60 seconds
  Import Time:     75%
  Test Execution:  23%
  Transform:       2%
================================================================================
```

### 1.1 Reconciliation of Previous Test Count Discrepancy
In an earlier Phase 3 draft report, the executive summary header stated `37 suites / 467 tests`, but the markdown breakdown tables only itemized 24 test files totaling 369 tests.
- **Root Cause of Discrepancy:** The previous report omitted 13 test files (accounting for 98 tests) from its domain breakdown tables due to a formatting truncation, even though all 37 files had been executed by the Vitest runner.
- **Phase 3.1 Hardening & Additions:**
  - Added 4 comprehensive month-end clamping tests to `tests/m3_obligations_timers.test.ts` (now 9 tests).
  - Added 4 statutory appeal trigger disambiguation and Speaking Order tests to `tests/regulatory_clock_guards.test.ts` (now 27 tests).
  - Total test count expanded from 467 to **475 tests**.
- **Resolution:** Section 2 below provides the complete, authoritative, un-truncated master execution table itemizing **all 37 test files (1 to 37)** with exact test counts and durations, completely eliminating the discrepancy.

---

## 2. Complete Authoritative Master Test Execution Table (All 37 Test Files)

| # | Test File | Tests | Status | Duration |
|---|-----------|-------|--------|----------|
| 01 | `src/backend/modules/evc/evcEligible.test.ts` | 6 | PASSED | 5.26025390625ms |
| 02 | `src/backend/modules/evc/evcIntegration.test.ts` | 4 | PASSED | 6.152099609375ms |
| 03 | `src/backend/modules/scrutiny/scrutinyIntegration.test.ts` | 6 | PASSED | 12.8916015625ms |
| 04 | `src/backend/modules/scrutiny/validateCorrections.test.ts` | 6 | PASSED | 8.315185546875ms |
| 05 | `src/utils/workflowEngine.test.ts` | 8 | PASSED | 7.468017578125ms |
| 06 | `tests/acceptance/boundaries.test.ts` | 20 | PASSED | 62.95068359375ms |
| 07 | `tests/acceptance/coep_notifications_verification.test.ts` | 3 | PASSED | 573.600341796875ms |
| 08 | `tests/acceptance/http-client.test.ts` | 1 | PASSED | 666.20751953125ms |
| 09 | `tests/acceptance/navigation.test.tsx` | 4 | PASSED | 29.0234375ms |
| 10 | `tests/acceptance/shc_sac_role_separation.test.ts` | 5 | PASSED | 165.880126953125ms |
| 11 | `tests/acceptance/target.test.ts` | 24 | PASSED | 10.4921875ms |
| 12 | `tests/appeals_and_hearings_api.test.ts` | 6 | PASSED | 207.710693359375ms |
| 13 | `tests/core/commands.test.ts` | 15 | PASSED | 90.743408203125ms |
| 14 | `tests/core/http.test.ts` | 7 | PASSED | 2446.902099609375ms |
| 15 | `tests/core/mongo-adapter.test.ts` | 16 | PASSED | 48.416259765625ms |
| 16 | `tests/decisions/core.test.ts` | 34 | PASSED | 578.281494140625ms |
| 17 | `tests/frontend/canonical.test.tsx` | 18 | PASSED | 221.375732421875ms |
| 18 | `tests/interaction_audit.test.ts` | 17 | PASSED | 745.824462890625ms |
| 19 | `tests/m3_obligations_timers.test.ts` | 9 | PASSED | 4.264404296875ms |
| 20 | `tests/performance/load_benchmarks.test.ts` | 5 | PASSED | 514.810302734375ms |
| 21 | `tests/policy/authoritativeRouting.test.ts` | 25 | PASSED | 26.28564453125ms |
| 22 | `tests/policy/http.test.ts` | 1 | PASSED | 561.114013671875ms |
| 23 | `tests/policy/phase1_intake_and_boundary.test.ts` | 38 | PASSED | 11.144287109375ms |
| 24 | `tests/policy/routing.test.ts` | 37 | PASSED | 195.84033203125ms |
| 25 | `tests/production_persistence_idempotency.test.ts` | 10 | PASSED | 510.043212890625ms |
| 26 | `tests/real-db/native.test.ts` | 12 | PASSED | 87.723876953125ms |
| 27 | `tests/regression_retrofit_all_deliverables.test.ts` | 38 | PASSED | 3048.007568359375ms |
| 28 | `tests/regulatory_clock_guards.test.ts` | 27 | PASSED | 12.2490234375ms |
| 29 | `tests/security/auth.test.ts` | 18 | PASSED | 8082.0732421875ms |
| 30 | `tests/security/client.test.ts` | 5 | PASSED | 396.508056640625ms |
| 31 | `tests/security/escalation_tenant_isolation.test.ts` | 7 | PASSED | 539.42236328125ms |
| 32 | `tests/security/mongo-scope.test.ts` | 1 | PASSED | 457.02001953125ms |
| 33 | `tests/shared/contracts.test.ts` | 8 | PASSED | 42.6455078125ms |
| 34 | `tests/shared/ports.test.ts` | 7 | PASSED | 21.45654296875ms |
| 35 | `tests/verification_t01_t16.test.ts` | 16 | PASSED | 2554.802734375ms |
| 36 | `tests/verification_t17_t22.test.ts` | 6 | PASSED | 962.267578125ms |
| 37 | `tests/workflow.test.ts` | 5 | PASSED | 42.10693359375ms |
| **TOTAL** | **37 Test Files** | **475** | **ALL PASSED** | - |

---

## 3. Test Suite Breakdown by Functional Domain

### 3.1 Authoritative Regulatory Policy & Dynamic Routing (101 Tests)
- `tests/policy/phase1_intake_and_boundary.test.ts` (38 tests, 11 ms): Complete 21-row Table 2.3 intake, Chapter I New Institutions, $X = 360$ boundary halt.
- `tests/policy/authoritativeRouting.test.ts` (25 tests, 26 ms): Deterministic route selection, skipped stages, fast-track NBA bypass.
- `tests/policy/routing.test.ts` (37 tests, 196 ms): Category mapping, conditional branching, policy revision ID assignment.
- `tests/policy/http.test.ts` (1 test, 561 ms): Source-linked policy explanation over HTTP guards.

### 3.2 Regulatory Clock Guards, Virtual Timers & Compliance (36 Tests)
- `tests/regulatory_clock_guards.test.ts` (27 tests, 12 ms): Chapter I §1.11(a) (LoD issue date) vs Chapter II §2.24(a) (EC upload date) triggers, Day 7.0 valid vs Day 8.0 time-barred, Speaking Order mandate, Clause 6.45 vs 6.12 fee refund, Clause 6.17(a) lease, Clause 2.25(f) FDR stages, Clause 2.19(c) NOC timeout.
- `tests/m3_obligations_timers.test.ts` (9 tests, 4 ms): Post-approval obligation materialization, document versioning, virtual clock cancellation, 6-calendar-month undertaking math with `addCalendarMonths` month-end clamping (Feb 28/29, Sep 30).

### 3.3 Security, Multi-Tenant Isolation & Authentication (31 Tests)
- `tests/security/auth.test.ts` (18 tests, 8.08 s): HttpOnly SameSite cookie sessions, RBAC permission checks, prevention of privilege escalation.
- `tests/security/escalation_tenant_isolation.test.ts` (7 tests, 539 ms): Strict tenant isolation: College A cannot read College B escalation docket.
- `tests/security/mongo-scope.test.ts` (1 test, 457 ms): MongoDB adapter scoped query assertions (tenant isolation at query level).
- `tests/security/client.test.ts` (5 tests, 397 ms): Client authentication adapter, HTTP 401 handling without optimistic leaks.

### 3.4 End-to-End Acceptance Verification Suites T01–T22 (60 Tests)
- `tests/verification_t01_t16.test.ts` (16 tests, 2.55 s): Full SIH PS 26262 core deliverables: Tenant isolation (T01), artifact security (T02), NSWS bridge (T03), scope gate (T04), differential re-scrutiny (T05), NBA bypass (T06), decision role block (T07), 5-state document lifecycle (T08), boundary review (T09), alerts (T11).
- `tests/verification_t17_t22.test.ts` (6 tests, 962 ms): Stage revert audit (T18), electronic case summary & statutory notices (T19), DSC validation (T20), API Setu removal (T21), consolidated reporting & closure (T22).
- `tests/regression_retrofit_all_deliverables.test.ts` (38 tests, 3.05 s): Complete regression test covering all retrofits, schema validations, and deliverable APIs.

### 3.5 Adjudication, Appeals, Hearings & Grievances (11 Tests)
- `tests/appeals_and_hearings_api.test.ts` (6 tests, 208 ms): REST API endpoints for SAC appeals, SHC hearings, and PGRC complaints.
- `tests/acceptance/shc_sac_role_separation.test.ts` (5 tests, 166 ms): Strict role and route separation between SHC compliance hearings and SAC statutory appeals.

### 3.6 Desk Scrutiny & Expert Visit Committee (22 Tests)
- `src/backend/modules/scrutiny/validateCorrections.test.ts` (6 tests, 8 ms): Clause 1.8(g) validation: blocks correction of items outside signed deficiency set.
- `src/backend/modules/scrutiny/scrutinyIntegration.test.ts` (6 tests, 13 ms): Multi-round scrutiny snapshots, signing events, and transition guards.
- `src/backend/modules/evc/evcEligible.test.ts` (6 tests, 5 ms): Fast-track eligibility, non-NBA requirement, and committee allocation preconditions.
- `src/backend/modules/evc/evcIntegration.test.ts` (4 tests, 6 ms): EVC task scheduling, report submission, and recommendation persistence.

### 3.7 Decision Documents, Cryptographic Seals & Interactions (51 Tests)
- `tests/interaction_audit.test.ts` (17 tests, 746 ms): Class-3 DSC hardware token gateway, emBridge simulation, LoR Speaking Order generation.
- `tests/decisions/core.test.ts` (34 tests, 578 ms): Transactional decision recording, condition attachment, authority role verification.

### 3.8 Persistence, Database Adapters & Health Probes (38 Tests)
- `tests/production_persistence_idempotency.test.ts` (10 tests, 510 ms): Synthetic persistence round-trip, `/health` and `/api/v1/ready` diagnostic probes, anonymous complaint rejection under Clause 7.10(h).
- `tests/real-db/native.test.ts` (12 tests, 88 ms): Native MongoDB client queries and transactions.
- `tests/core/mongo-adapter.test.ts` (16 tests, 48 ms): Storage adapter operations, schema mapping, and index verification.

### 3.9 Frontend UI & Client Workflow Integration (22 Tests)
- `tests/frontend/canonical.test.tsx` (18 tests, 221 ms): Institution workspace, scrutiny reviewer desk, modal rendering, document upload.
- `tests/acceptance/navigation.test.tsx` (4 tests, 29 ms): Role-based navigation, route switches, tab transitions.

### 3.10 Performance Verification Benchmarks (5 Tests)
- `tests/performance/load_benchmarks.test.ts` (5 tests, 515 ms):
  - `GET /health` latency: 212 ms (< 250 ms cold target)
  - `NSWS Step 1 Onboarding` latency: 51 ms
  - `NSWS Step 3 Dynamic Route` latency: 12 ms (< 50 ms target)
  - `GET /api/v1/appeals-hearings` latency: 9 ms (< 50 ms target)
  - `Authenticated Applicant / Bureau load cycle` latency: 146 ms / 7.9 ms

### 3.11 Architecture, Boundaries, Workflow & Ports (28 Tests)
- `tests/acceptance/boundaries.test.ts` (20 tests, 63 ms)
- `src/utils/workflowEngine.test.ts` (8 tests, 7 ms)
- `tests/acceptance/target.test.ts` (24 tests, 10 ms)
- `tests/workflow.test.ts` (5 tests, 42 ms)
- `tests/core/commands.test.ts` (15 tests, 91 ms)
- `tests/core/http.test.ts` (7 tests, 2.45 s)
- `tests/acceptance/http-client.test.ts` (1 test, 666 ms)
- `tests/shared/contracts.test.ts` (8 tests, 43 ms)
- `tests/shared/ports.test.ts` (7 tests, 21 ms)
- `tests/acceptance/coep_notifications_verification.test.ts` (3 tests, 574 ms)
