# NIYAMSETU — PHASE 5: FUNCTIONALITY & WORKFLOW VERIFICATION

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Document Ref:** `PHASE_5_FUNCTIONALITY_AND_WORKFLOW_VERIFICATION.md`  

---

## 1. Verification Scope & Methodology

This document details the functional, security, and statutory workflow verification performed across the overhauled NIYAMSETU prototype. Testing encompassed:
1. Vitest automated test suite (Unit, Integration, RBAC, and Security).
2. Local MongoDB persistence and transaction boundary checks.
3. Headless Chrome browser automation verifying end-to-end user journeys.
4. Tenant isolation and permission enforcement.

---

## 2. Automated Test Execution Summary

The complete test suite was executed against the active local repository on branch `dev`:

```
 RUN  v5.0.5 C:/Users/parth/Documents/SIH-26-AICTE

 Test Files  38 passed (38)
      Tests  478 passed (478)
   Start at  05:43:31
   Duration  11.17s (import 74%, tests 23%, transform 2%)
```

### Critical Test Category Breakdown:

| Test Suite Category | Test Files | Total Tests | Pass Rate | Key Verification Assurances |
| :--- | :---: | :---: | :---: | :--- |
| **Security & Authentication** | 4 | 29 | 100% | Origin verification, SameSite HttpOnly cookies, bcrypt byte length, brute-force throttling. |
| **RBAC & Tenant Isolation** | 6 | 42 | 100% | Principal of COEP cannot see GIITS records; officer roles cannot approve own submissions. |
| **Regulatory Route Engine** | 5 | 125 | 100% | 32 regulatory rules traced to APH 2024–27 clauses; Errata p. 42 Fast-Track verified. |
| **Scrutiny & Scope Lock** | 3 | 18 | 100% | Scope Lock USP B06 verified; compliant items permanently locked during re-scrutiny. |
| **EVC & Campus Verification** | 3 | 14 | 100% | Telemetry checks, geo-coordinates, EVC score calculation, and R3-S02 report registers. |
| **Compliance, Timers & Clock** | 4 | 45 | 100% | 4-clock deadline triggers (Academic, Relative, Expiry, SLA); clock advance simulation. |
| **Acceptance & End-to-End** | 8 | 102 | 100% | Full NSWS intake pipeline; case injection to institution workspace; document vault. |
| **Production Persistence** | 5 | 103 | 100% | Standalone MongoDB durability, idempotent writes, WORM SHA-256 audit ledger. |
| **TOTALS** | **38** | **478** | **100%** | **Full System Integrity Verified** |

---

## 3. Dynamic Routing Engine Verification

The central dynamic routing engine (`src/backend/policy/`) was verified across all canonical categories:

1. **Intake Increase with Tier-1 NBA (COEP Pune):**  
   - Category: `increase_intake` | Proposed: 180 | NBA Score: 680  
   - Evaluated Route: **Fast-Track Scrutiny Only**  
   - Statutory Rule: Addendum 2026–27 Item 16 / Clause 2.6(c)(i) & Errata p. 42  
   - Stages: `submitted → scrutiny_pending → decision_pending` (EVC waived).
2. **Intake Increase without NBA (GIITS Tech):**  
   - Category: `increase_intake` | Proposed: 240 | NBA Score: 0  
   - Evaluated Route: **Dual-Track (Scrutiny + Physical EVC)**  
   - Statutory Rule: APH 2024–27 Table 2.3 Row 9  
   - Stages: `submitted → scrutiny_pending → evc_pending → decision_pending`.
3. **Annual EoA Renewal (PDIMTR Management):**  
   - Category: `extension_of_approval` | Proposed: 180  
   - Evaluated Route: **Fast-Track EoA Automated Endorsement**  
   - Statutory Rule: APH 2024–27 Clause 2.5 & Table 2.3 Row 1  
   - Stages: Auto-endorsed without pre-approval scrutiny or EVC.
4. **New Institution Establishment (Apex Institute):**  
   - Category: `new_institution` | Proposed: 300  
   - Evaluated Route: **Chapter I Scrutiny + Site EVC + Land Concurrence**  
   - Statutory Rule: APH 2024–27 Chapter I Clauses 1.8–1.9.
5. **Course Rationalization / Closure (Dr. BATU):**  
   - Category: `closure` | Proposed: 180  
   - Evaluated Route: **Desk Scrutiny Only (Closure Norms)**  
   - Statutory Rule: APH 2024–27 Clause 2.18 & Table 2.3 Row 16.
6. **Boundary Hold Check (VVIT Boundary X=360):**  
   - Proposed Intake: 360  
   - Evaluated Route: **Policy Review Required (Executive Committee Hold)**  
   - Statutory Rule: APH Table 2.3 Row 9 Division Ceiling.

---

## 4. Multi-Tenant Isolation & Role Security

Tenant isolation was verified through both automated tests (`tests/verification_t01_t16.test.ts`, `tests/security/auth.test.ts`) and browser verification:
- When authenticated as **COEP Pune** (`principal@coep.ac.in`), only COEP applications (`APP-COEP-2026`, etc.) and alerts are returned by the server.
- The server refuses any cross-scope filter injection or unauthorized reads with `HTTP 403 Forbidden` (`SCOPE_VIOLATION`).
- Role transitions strictly enforce authority: an applicant cannot approve their own case, and a scrutiny reviewer cannot issue council decisions.

---

## 5. Scope Lock (USP B06) Enforcement

In Desk Scrutiny and Deficiency Cure workflows:
- Items marked **"Verified / Compliant"** in Round 1 scrutiny receive an immutable cryptographic lock.
- In Round 2 (Re-Scrutiny), the system prevents reviewers from re-evaluating or rejecting previously cleared items.
- The institution's upload interface restricts replacement document uploads strictly to flagged deficiency items.

---

## 6. Cryptographic Document & Audit Integrity

- **WORM Audit Trail:** Every transaction (intake, scrutiny digital signature, EVC report, council decision) appends an event to the `core_audit` collection containing SHA-256 state hashes, actor attribution, and timestamps.
- **Decision Documents:** Formal Approval Letters (EoA/LoA) generated by the Competent Authority feature HMAC-SHA256 digital seals, QR verification codes, and permanent WORM audit citations.
