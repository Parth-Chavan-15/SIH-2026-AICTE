# NIYAMSETU: Live Deployment Recovery & Regulatory Verification Dossier

**Project:** NIYAMSETU (नियमसेतु)  
**Hackathon:** Smart India Hackathon 2026 | Problem Statement 26262 (AICTE Regulation Bureau)  
**Live Production URL:** `https://niyamsetu-aicte.onrender.com`  
**Repository:** `c:\Users\parth\Documents\SIH-26-AICTE`  
**Current Branch:** `main`  
**Date:** 2026-10-29  

---

## 1. Deployment Incident Diagnosis & Root Cause Analysis

### Incident Summary
The live Render prototype (`https://niyamsetu-aicte.onrender.com`) remained stuck serving an outdated commit (`2beba60`) despite subsequent commits (`32a98bf`, `bc341e6`) being pushed to GitHub. Live diagnostic probes to `/health` and `/api/v1/ready` confirmed that new features, uptime metrics, and database readiness diagnostics were absent from the live container.

### Root Causes Identified
1. **Frontend Bundle Out-of-Memory (OOM) Crash on Render Free Dyno**:
   - `src/features/applications/hooks/useEVC.ts` and `src/features/applications/hooks/useScrutiny.ts` imported backend service modules (`evcService.ts`, `scrutinyService.ts`) for catch-block fallback handlers.
   - These backend services imported `mongoose` and MongoDB BSON drivers.
   - During `vite build`, Vite attempted to bundle Mongoose and Node.js built-ins (`crypto`, `net`, `tls`, `fs`, `stream`), dragging in **2,816 modules** and producing a bloated **3.1 MB client JavaScript bundle**.
   - On Render's 512 MB RAM container, this caused Node.js heap exhaustion (`SIGKILL OOM`) after 38+ seconds of compilation, causing the build to fail and Render to keep serving the previous successful deployment (`2beba60`).

2. **`render.yaml` Dependency Installation Flaw**:
   - `render.yaml` specifies `NODE_ENV: production`.
   - When `npm install` executes in production mode without explicit flags, npm can omit `devDependencies` (Vite, TypeScript, TailwindCSS), causing subsequent build commands to fail.

---

## 2. Remediation Implemented

| Remediation Area | Previous State | Remediated State | Performance Impact |
| :--- | :--- | :--- | :--- |
| **Frontend Hook Coupling** | `useEVC.ts` and `useScrutiny.ts` imported Mongoose backend services | Decoupled hooks; replaced backend imports with pure client-side mock fallback state | Bundle size reduced from **3,100 kB** to **1,197 kB** (61% reduction) |
| **Vite Compilation Speed** | Built in **38.13s** (frequent 512MB RAM OOM) | Built in **850ms** | **44x faster build time**, zero memory exhaustion |
| **Node.js Core Warnings** | 12 externalization warnings (`crypto`, `fs`, `tls`, `net`) | **Zero warnings** | Clean browser-safe client bundle |
| **Render Build Command** | `npm install && npm run build` | `npm install --include=dev && npm run build` in `render.yaml` | Guarantees all build tools (Vite, TS) are installed in production |
| **Version Diagnostic API** | Hardcoded commit `'2beba60'`, no `/api/version` endpoint | Added `GET /api/version` and `GET /version` returning commit SHA, version, uptime, and environment without secrets | Authoritative version verification |

---

## 3. Regulatory Route Discrepancies Resolved

### 3.1 Disambiguation of Clocks & 15-Day Timeline
- **Previous Discrepancy**: Generic "15-day cure window" language was used across scrutiny notices, deficiency modals, and compliance alerts.
- **Statutory Truth**:
  - **15 Days** is **strictly** the post-approval statutory security deposit (Joint FDR) and Affidavit-3 window under **APH §2.25(f)**.
  - Pre-approval deficiency turnaround operates under an internal **10-day operational SLA turnaround**.
  - Standing Appellate Committee (SAC) appeals are strictly governed by a **7-calendar-day statute of limitations** under **APH §1.11 / §2.24**.
- **Remediation**:
  - Updated `CaseSummaryNoticesModal.tsx`, `complianceService.ts`, and `api.ts` to strictly reflect these statutory distinctions.
  - Added negative automated tests in `tests/regulatory_clock_guards.test.ts` verifying that §2.25(f) deposit timelines cannot be reused during pre-approval deficiency scrutiny.

### 3.2 Modular Workflow Architecture
Replaced monolithic workflow representations with **9 clean, specialized workflow specifications**:
1. `docs/workflows/01_chapter_i_new_institution.md` — Chapter I (New Institutions: LoD $\to$ LoR $\to$ LoA, physical EVC, 10-yr FDR).
2. `docs/workflows/02_chapter_ii_self_disclosure_eoa.md` — Chapter II (Self-Disclosure EoA Table 2.3 Row 1).
3. `docs/workflows/03_chapter_ii_scrutiny_and_evc_routes.md` — Chapter II (Scrutiny, EVC, NBA Fast-Track, Scope-Lock HTTP 409).
4. `docs/workflows/04_chapter_ii_route_matrix.md` — Exhaustive 21-category Table 2.3 Matrix (preserving category `AA`).
5. `docs/workflows/05_shc_compliance.md` — Standing Hearing Committee under §2.23.3.
6. `docs/workflows/06_chapter_specific_appeals.md` — Standing Appellate Committee under §1.11 / §2.24 (strict 7-day bar).
7. `docs/workflows/07_chapter_vii_complaints.md` — Chapter VII Complaint inquiries (PGRC $\to$ SCSC $\to$ EVC $\to$ SHC $\to$ EC).
8. `docs/workflows/08_post_approval_compliance.md` — Post-Approval Obligations (§2.25(f) FDR, Affidavit 3, 4 clocks, 5-state document lifecycle).
9. `docs/workflows/99_common_end_to_end_architecture.md` — Common Platform Architecture.

### 3.3 Authoritative Regulatory Register
- Created `docs/regulatory/SOURCE_REGISTER.md`
- Created `docs/regulatory/RULE_MAPPING_MATRIX.md`
- Created `docs/regulatory/UNVERIFIED_OR_CONFLICTING_RULES.md`

---

## 4. Verification Evidence & Test Results

- **TypeScript Compilation (`npx tsc --noEmit`)**: **0 errors**, exited with code 0.
- **Frontend Production Build (`npm run build`)**: **Built in 850ms**, generated browser-optimized bundle `dist/assets/index-C_lU8p4t.js` (1,197 kB).
- **Automated Test Suite (`npm test` / Vitest)**:
  - **Total Test Files**: 31 passed (31)
  - **Total Tests**: **368 passed (368)**
  - **Failed Tests**: **0**
  - **Duration**: 36.81s

---

## 5. Live Endpoint Probing & Deployment Protocol

Once committed and pushed to `origin/main` and `personal/main`:
1. Render triggers automated build with `npm install --include=dev && npm run build`.
2. Probe `GET https://niyamsetu-aicte.onrender.com/api/version`:
   - Confirms `status: "ok"`
   - Confirms `version: "2.5.0"`
   - Confirms `commit: "<LATEST_COMMIT_SHA>"`
3. Probe `GET https://niyamsetu-aicte.onrender.com/health`:
   - Confirms `status: "alive"`, `uptimeSeconds > 0`, `readiness: "/api/v1/ready"`, `version: "/api/version"`.
4. Probe `GET https://niyamsetu-aicte.onrender.com/api/v1/ready`:
   - Confirms database connectivity, ping latency, and storage readiness.
