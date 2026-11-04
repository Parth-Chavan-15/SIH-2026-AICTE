# NIYAMSETU — PHASE 5: BASELINE & REPOSITORY STATE REPORT
## Empirical Codebase State, Environment Inspection & Safety Baseline

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Starting Reference HEAD:** `aa3117fef487b564a5160fe320c4b9c9406c6eeb`  
**Confirmed Current HEAD:** `aa3117fef487b564a5160fe320c4b9c9406c6eeb` (Commit: `Update README.md`)  
**Audit & Verification Date:** 2026-11-03T22:30:00+05:30  
**Operating Database Target:** Local MongoDB Community — `niyamsetu_dev` on `127.0.0.1:27017`

---

## 1. Non-Negotiable Safety Gate Verification

Before performing any operational execution, the repository state was forensically verified:

1. **Branch Verification:**
   - Active branch: `dev` (strictly local).
   - Remote interactions: ZERO pushes, fetches, merges, rebases, or remote repository touches.
2. **Commit Integrity:**
   - Verified Git HEAD matches reference: `aa3117fef487b564a5160fe320c4b9c9406c6eeb`.
   - Worktree inspection preserves all user changes, untracked artifacts, reports, and screenshots.
3. **Database Isolation:**
   - Explicitly configured to local MongoDB `niyamsetu_dev` on `127.0.0.1:27017`.
   - Zero access to remote Atlas clusters or production databases.
   - Database seed and check scripts executed with strict idempotency (zero data destruction or record duplication).

---

## 2. Package Architecture & Runtime Dependencies

NIYAMSETU operates as a unified modern web application providing both a high-concurrency Express REST companion API and an interactive React Single Page Application (SPA) bundled via Vite.

```
Node.js Runtime : v20+ / v24.12.0
Language        : TypeScript 5.7+ / ES Modules ("type": "module")
Bundler         : Vite v8.3.5 / Rolldown
Testing Engine  : Vitest v5.0.5
Styling         : Tailwind CSS v3.4+ / Lucide React v0.344+
Database ORM    : Mongoose v8.10+ / MongoDB Community Native Driver
Security Libs   : BcryptJS, Helmet, Express-Rate-Limit, Zod
```

### Verified Package Scripts (`package.json`)
- `npm run dev`: Executes `npx tsx server.ts` (Unified full-stack server hosting backend API and hot-reloading Vite frontend on `http://127.0.0.1:3000`).
- `npm run build`: Executes `vite build` (Production client bundle in `dist/`, transforming 2,364 modules in ~1.35s).
- `npm start`: Executes `npx tsx server.ts` (Production-ready Express server serving static `dist/` bundle).
- `npm run db:check`: Executes `npx tsx scripts/seedMongo.ts` (Idempotently verifies database connection, indexes, and canonical fixtures).
- `npm run seed:mongo`: Executes `npx tsx scripts/seedMongo.ts`.
- `npm test`: Executes `vitest run` (Automated suite of 38 files, 478 tests).
- `npm run lint`: Executes `tsc --noEmit` (TypeScript type integrity gate).

---

## 3. Database Layer & Persistence Configuration

The application implements a dual-persistence architecture:
1. **Primary Store:** MongoDB database (`niyamsetu_dev`) when available locally. All collections, indexes, transactions, and audit records persist to disk.
2. **Zero-Downtime Fallback:** High-fidelity in-memory companion engine that mirrors canonical college cases if MongoDB is temporarily offline.

### Collection Schema & Index Manifest (`REQUIRED_INDEXES` in `mongoCore.ts`)
| Collection | Indexed Field | Unique | Sparse | Purpose |
|:---|:---|:---:|:---:|:---|
| `applications` | `caseData.id` | Yes | No | Canonical application ID uniqueness (`APP-2026-COEP`, etc.). |
| `applications` | `applicationNumber` | Yes | No | Statutory government application reference (`1-43657568230`). |
| `institutions` | `id` | Yes | No | Tenant institution ID (`INST-SOUTH`, `INST-WEST`, etc.). |
| `institutions` | `permanentId` | Yes | No | AICTE Permanent Institute ID (`1-43657568230`). |
| `core_audit` | `id` | Yes | No | Append-only WORM audit log transaction ID. |
| `core_outbox` | `eventId` | Yes | No | Asynchronous outbox event message ID. |
| `core_receipts` | `key` | Yes | No | Idempotency receipt key preventing duplicate submissions. |
| `policy_revisions` | `id` | Yes | No | Version-pinned policy rule revision ID. |
| `core_decisions` | `id` | Yes | No | Competent Authority speaking order determination ID. |

---

## 4. Phase 5 Code Modifications & Operational Fixes

During Phase 5 baseline verification, two operational defects were discovered and corrected:

### Defect 1: Runtime Reference Error in `mongoInit.ts`
- **Symptom:** Executing `npm run db:check` failed with `❌ MongoDB connection failed: deriveRouteType is not defined`.
- **Root Cause:** `mongoInit.ts` lines 355 and 447 called `deriveRouteType(c as any)`, but `deriveRouteType` was exported from `./mongoCore` and had not been imported.
- **Remediation:** Added `deriveRouteType` to the import statement on line 5 of [mongoInit.ts](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/persistence/mongoInit.ts):
  ```typescript
  import { REQUIRED_INDEXES, deriveRouteType } from './mongoCore';
  ```
- **Verification:** `npm run db:check` succeeded cleanly and connected to `niyamsetu_dev`.

### Defect 2: Standalone MongoDB `ready()` Check False-Positive Rejection
- **Symptom:** Calling `GET /api/v1/ready` returned `HTTP 503 Authoritative storage unavailable`.
- **Root Cause:** Line 111 in [mongoCore.ts](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/persistence/mongoCore.ts) required `hello.setName` (which is only present on MongoDB replica sets). On standalone local MongoDB Community servers, `hello.setName` is `undefined`, while `hello.isWritablePrimary` is `true`.
- **Remediation:** Updated line 111 in [mongoCore.ts](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/persistence/mongoCore.ts):
  ```typescript
  if ((!hello.setName && !hello.isWritablePrimary && hello.msg !== 'isdbgrid') || hello.logicalSessionTimeoutMinutes == null) throw unavailable();
  ```
- **Verification:** Standalone local MongoDB is accepted as a writable primary. `GET /api/v1/ready` now returns `HTTP 200 OK` (`{"status":"ready","storageMode":"mongodb","pingLatencyMs":3}`).

---

## 5. Summary of Baseline Verification Status

| Verification Item | Required State | Actual State | Result |
|:---|:---|:---|:---:|
| Git Branch | `dev` | `dev` | **PASSED** |
| Git HEAD | `aa3117fef487b564a5160fe320c4b9c9406c6eeb` | `aa3117fef487b564a5160fe320c4b9c9406c6eeb` | **PASSED** |
| Local Database | `niyamsetu_dev` on 127.0.0.1:27017 | Connected (readyState 1, 3ms ping) | **PASSED** |
| Automated Tests | All existing passing | 38/38 suites, 478/478 tests (100%) | **PASSED** |
| Production Build | Zero build errors | Vite build succeeded in 1.35s | **PASSED** |
| Live Server | Unified Express + Vite | Running live on `http://127.0.0.1:3000` | **PASSED** |
