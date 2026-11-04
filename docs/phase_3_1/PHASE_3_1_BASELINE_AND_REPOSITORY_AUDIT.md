# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Baseline and Repository Integrity Audit Report

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev` (Local Development Environment)  
**HEAD Commit:** `aa3117fef487b564a5160fe320c4b9c9406c6eeb`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**Audit Stage:** Post-Implementation Integrity Audit & Source Reconciliation Gate  
**Status:** FULLY RECONCILED — ALL TESTS PASSED (38/38 Files, 478/478 Tests)

---

## 1. Executive Summary & Audit Mandate

Following Phase 3 implementation, this forensic baseline audit establishes the absolute ground truth across the NIYAMSETU application codebase, local database infrastructure, regulatory corpora, operational PDF records, and automated regression suites.

The primary mission of Phase 3.1 is to verify that:
1. The **NSWS simulation** functions not as a detached frontend cosmetic mockup, but as a fully operational, cryptographic-gated application intake and case-injection gateway.
2. Inbound cases from NSWS are processed by the central authoritative routing engine (`src/backend/policy/dynamicRouteEngine.ts`), evaluated against statutory rules without artificial limits, persisted immutably in local MongoDB `niyamsetu_dev` (and companion memory adapter), and made immediately visible in the respective institution's portal and internal regulatory role dockets.
3. Hardcoded institution identity shortcuts (e.g. string matching on `BATU`, `APEX`, `PDIMTR`) in route projections and status filters are permanently eliminated and replaced by dynamic evaluation of route stages, statutory clauses, and policy version identifiers.
4. All regulatory deadlines, appeal windows, intake calculations, and operational records are strictly reconciled against official gazettes, handbooks, and operational files.

---

## 2. Git Repository & Branch State Verification

| Parameter | Observed State | Compliance & Constraints |
| :--- | :--- | :--- |
| **Current Branch** | `dev` | STRICT: Local development on `dev` only. No branch switching. |
| **Protected Branch** | `main` | Untouched, pristine. Zero modifications. |
| **Remote Git Actions** | 0 pushes, 0 merges, 0 remote operations | Strict isolation maintained. Zero commits pushed to GitHub. |
| **Commit HEAD** | `aa3117fef487b564a5160fe320c4b9c9406c6eeb` | Audited and verified. |
| **Workspace Directory** | `c:\Users\parth\Documents\SIH-26-AICTE` | Local repository root. |

---

## 3. Database Environment Verification

### 3.1 Local Database Isolation
- **Database Engine:** MongoDB Community Server (Local Engine, Port 27017)
- **Authorized Database Name:** `niyamsetu_dev`
- **Connection URI:** `mongodb://127.0.0.1:27017/niyamsetu_dev` (or `mongodb://localhost:27017/niyamsetu_dev`)
- **Remote / Production Access:** STRICTLY FORBIDDEN AND VERIFIED ZERO ACCESS. No connection strings to MongoDB Atlas, Render, AWS, or production clusters exist in active execution.

### 3.2 Collection Inventory & Required Indexes in `niyamsetu_dev`
All 9 canonical collections and unique compound index constraints defined in `src/backend/persistence/mongoCore.ts` (`REQUIRED_INDEXES`) are validated:
1. `applications`: `caseData.id` (Unique, Sparse: false), `applicationNumber` (Unique, Sparse: false)
2. `institutions`: `id` (Unique, Sparse: false), `permanentId` (Unique, Sparse: false)
3. `core_audit`: `id` (Unique, Sparse: false)
4. `core_outbox`: `eventId` (Unique, Sparse: false)
5. `core_receipts`: `key` (Unique, Sparse: false)
6. `policy_revisions`: `id` (Unique, Sparse: false)
7. `core_decisions`: `id` (Unique, Sparse: false)
8. `compliance_records`: `id` (Unique, Sparse: false)
9. `evc_tasks`: `id` (Unique, Sparse: false)

---

## 4. Codebase Architecture Integrity & Single Routing Engine

### 4.1 Authoritative Routing Engine Preservation
- **Path:** `src/backend/policy/dynamicRouteEngine.ts`
- **Status:** **Preserved and Enhanced as the Single Source of Truth**.
- No competing, parallel, or alternative routing engines were introduced.
- Evaluates:
  - Table 2.3 statutory routes (Rows 1 to 21)
  - Chapter I New Institution routes (Clauses 1.8–1.9)
  - Addendum-Corrigendum 2026–27 Item 16 / Clause 2.6(c)(i) & Errata p. 42 (NBA Fast-Track EVC waiver)
  - Division boundary conditions ($X = 360$) requiring explicit Executive Committee Policy Review
  - Restoration and shifting EVC requirements (Table 2.3 Row 3 / Row 14)

### 4.2 Architectural Correction: Decoupling Route Projection from Institution Names
- **Problem Identified:** In `src/backend/persistence/mongoCore.ts`, `mongoInit.ts`, and `src/services/api.ts`, route projection previously checked `a.id.includes('BATU')`, `a.id.includes('APEX')`, and `a.id.includes('PDIMTR')`.
- **Correction Executed:** Implemented `deriveRouteType(a: Application)` which inspects `a.route.result`, `a.route.stages`, `a.route.policyRevisionId`, and `a.category` directly.
- **Result:** Any institution application—whether originated from NSWS or API intake—receives its correct statutory route title without hardcoded institution ID dependencies.

---

## 5. Automated Test Suite Baseline

- **Test Framework:** Vitest v5.0.5
- **Total Test Files:** 38 passed (38 files)
- **Total Unit & Integration Tests:** 478 passed (478 tests)
- **Failures / Regressions:** 0
- **Total Execution Duration:** ~15.13s
- **Pass Rate:** **100.0%**

Detailed test breakdown and forensic logs are cataloged in `PHASE_3_1_TEST_EXECUTION_AND_EVIDENCE_REPORT.md`.
