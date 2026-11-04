# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Test Execution, Regression & Empirical Evidence Report

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:39+05:30  
**Test Runner:** Vitest v5.0.5  
**Result Summary:** 38/38 Test Suites Passed | 478/478 Tests Passed | 0 Failures (100% Pass Rate)

---

## 1. Full Test Suite Execution Summary

```
Test Files  38 passed (38)
     Tests  478 passed (478)
  Start at  16:50:23
  Duration  15.13s (import 69%, tests 28%, transform 3%)
```

---

## 2. Granular Test Suite Inventory & Coverage

| Index | Test Suite File Path | Test Count | Status | Key Coverage & Statutory Checks |
| :---: | :--- | :---: | :---: | :--- |
| 1 | `tests/acceptance/nsws_case_injection_e2e.test.ts` | 3 | **PASSED** | End-to-end NSWS intake, PAN KYC, DSC Class-3 validation, case injection, tenant isolation, and boundary check. |
| 2 | `tests/regression_retrofit_all_deliverables.test.ts` | 38 | **PASSED** | Comprehensive regression across all Phase 3 deliverables, QR verification, and route engine. |
| 3 | `tests/decisions/core.test.ts` | 34 | **PASSED** | Authority checks, decision validation, and cryptographic issuance. |
| 4 | `tests/policy/routing.test.ts` | 37 | **PASSED** | Table 2.3 statutory rule evaluation, NBA waivers, and intake calculation. |
| 5 | `tests/policy/phase1_intake_and_boundary.test.ts` | 38 | **PASSED** | Intake formula boundary tests, division ceilings, and boundary condition $X = 360$. |
| 6 | `tests/regulatory_clock_guards.test.ts` | 27 | **PASSED** | Parshvanath calendar, Chapter I vs II clock distinction, and Day 7.0 vs 8.0 boundary hours. |
| 7 | `tests/m3_obligations_timers.test.ts` | 9 | **PASSED** | Calendar month math clamping across month-ends, 30/31 days, and leap year 2028. |
| 8 | `tests/security/auth.test.ts` | 18 | **PASSED** | Authentication, bcrypt passwords, HttpOnly cookies, session revocation, and RBAC guards. |
| 9 | `tests/security/mongo-scope.test.ts` | 1 | **PASSED** | Actor scoping on MongoDB queries and institution multi-tenancy. |
| 10 | `tests/security/escalation_tenant_isolation.test.ts` | 7 | **PASSED** | Strict tenant isolation preventing cross-institution escalation and breach leakage. |
| 11 | `tests/acceptance/coep_notifications_verification.test.ts` | 3 | **PASSED** | Tenant isolation for alerts and notifications. |
| 12 | `tests/verification_t01_t16.test.ts` | 16 | **PASSED** | PS 26262 core requirements, artifact streaming, and tenant boundaries. |
| 13 | `tests/verification_t17_t22.test.ts` | 6 | **PASSED** | Ecosystem hardening, stage revert auditing, and re-scrutiny. |
| 14 | `tests/interaction_audit.test.ts` | 17 | **PASSED** | UI interaction endpoints, emBridge hardware token validation, and observations. |
| 15 | `tests/appeals_and_hearings_api.test.ts` | 6 | **PASSED** | Standing Appellate Committee and Standing Hearing Committee proceedings. |
| 16 | `tests/acceptance/shc_sac_role_separation.test.ts` | 5 | **PASSED** | Strict committee member separation between SHC and SAC panels. |
| 17 | `tests/production_persistence_idempotency.test.ts` | 10 | **PASSED** | Idempotency keys, WORM HMAC audit hash chaining, and diagnostic readiness. |
| 18 | `tests/performance/load_benchmarks.test.ts` | 5 | **PASSED** | Performance benchmarks (health <250ms, NSWS onboarding <50ms, route engine <10ms). |
| 19 | `tests/core/http.test.ts` | 7 | **PASSED** | HTTP guards, Origin checks, DTO parsing, and status code invariants. |
| 20 | `tests/core/mongo-adapter.test.ts` | 16 | **PASSED** | MongoDB session adapter, transaction retries, and receipt collision handling. |
| 21 | `tests/real-db/native.test.ts` | 12 | **PASSED** | Native MongoDB operations against local `niyamsetu_dev`. |
| 22 | `tests/workflow.test.ts` | 5 | **PASSED** | Workflow lifecycle progression and state machine transitions. |
| 23 | `tests/acceptance/boundaries.test.ts` | 20 | **PASSED** | Land norms, supernumerary quotas, and closure boundaries. |
| 24 | `tests/acceptance/navigation.test.tsx` | 4 | **PASSED** | Frontend tab switching and UI role navigation. |
| 25 | `tests/acceptance/target.test.ts` | 24 | **PASSED** | Regulatory target assertions and clause validation. |
| 26 | `tests/frontend/canonical.test.tsx` | 18 | **PASSED** | React component rendering and UI test fixtures. |
| 27 | `tests/policy/http.test.ts` | 1 | **PASSED** | Source-linked route explanation HTTP endpoints. |
| 28 | `tests/acceptance/http-client.test.ts` | 1 | **PASSED** | Canonical API client integration. |
| 29 | `tests/security/client.test.ts` | 5 | **PASSED** | Client-side security state validation. |
| 30 | `tests/core/commands.test.ts` | 15 | **PASSED** | Command dispatching and transaction context mapping. |
| 31 | `tests/shared/contracts.test.ts` | 8 | **PASSED** | Shared contract validation and type checking. |
| 32 | `tests/shared/ports.test.ts` | 7 | **PASSED** | Storage port interfaces and repository contracts. |
| 33 | `tests/policy/authoritativeRouting.test.ts` | 25 | **PASSED** | Authoritative policy clauses and handbook rules. |
| 34 | `src/backend/modules/scrutiny/scrutinyIntegration.test.ts` | 6 | **PASSED** | Scrutiny evaluation business logic. |
| 35 | `src/backend/modules/scrutiny/validateCorrections.test.ts` | 6 | **PASSED** | Scrutiny deficiency cure validation. |
| 36 | `src/utils/workflowEngine.test.ts` | 8 | **PASSED** | Core workflow state engine transitions. |
| 37 | `src/backend/modules/evc/evcEligible.test.ts` | 6 | **PASSED** | EVC eligibility evaluation logic. |
| 38 | `src/backend/modules/evc/evcIntegration.test.ts` | 4 | **PASSED** | EVC scheduling, reporting, and sign-off integration. |

**TOTAL: 38 Files, 478 Tests, 0 Failures.**
