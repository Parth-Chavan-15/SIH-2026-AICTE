# PravahReg / AICTE CaseFlow
### Intelligent Regulatory Companion Layer & Dynamic Compliance Platform
**Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau**

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=flat-square)](https://www.sih.gov.in/)
[![Problem Statement 26262](https://img.shields.io/badge/PS-26262-blue.svg?style=flat-square)](https://www.aicte-india.org/)
[![Tests Passing](https://img.shields.io/badge/Vitest-271%2F271%20Passed-brightgreen.svg?style=flat-square)](./tests)
[![Acceptance Suite](https://img.shields.io/badge/T01--T16%20Suite-16%2F16%20Verified-success.svg?style=flat-square)](./tests/verification_t01_t16.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20(0%20Errors)-blue.svg?style=flat-square)](./tsconfig.json)
[![Architecture](https://img.shields.io/badge/Architecture-Companion%20Layer%20(Zero--Rewrite)-purple.svg?style=flat-square)](#-architectural-paradigm-the-zero-rewrite-companion-layer)

---

## 🏛️ Executive Summary

National technical education regulation in India governs **10,000+ technical institutions**, **millions of student admissions**, and thousands of annual regulatory approvals spanning **Extension of Approval (EoA)**, **Increase in Intake**, **New Programs**, and **Post-Approval Compliance Monitoring**.

Today, national regulators operate on complex legacy portal infrastructures (**NSWS** for single-window investor clearance and **AICTE Siebel Core CRM** for institutional databases). Attempting a monolithic "rip-and-replace" of this sovereign architecture is high-risk, cost-prohibitive, and impractical.

**PravahReg / AICTE CaseFlow** solves this challenge by introducing an **Intelligent Regulatory Companion Layer** — a high-performance sidecar that attaches seamlessly to existing NSWS and Siebel portals. It hardens regulatory logic, enforces temporal legal precedence (AICTE 2026–27 Errata & APH 2024–27), guarantees multi-tenant institutional isolation, and tracks post-approval compliance across 4 statutory clock types — **without modifying a single line of the legacy Siebel core database**.

---

## 🚀 Architectural Paradigm: The Zero-Rewrite Companion Layer

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              UPSTREAM NATIONAL ECOSYSTEM                               │
 │   ┌──────────────────────────┐                      ┌──────────────────────────────┐   │
 │   │  NSWS Portal Hand-Off    │                      │  AICTE Siebel Core Database  │   │
 │   │  (PAN + DSC Clearance)   │                      │  (Legacy Portal Record Base) │   │
 │   └────────────┬─────────────┘                      └──────────────┬───────────────┘   │
 └────────────────┼───────────────────────────────────────────────────┼───────────────────┘
                  │ Ingest Command (Idempotency Key, Facts)           │ Webhook / Poll
                  ▼                                                   ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                     PRAVAHREG COMPANION LAYER (Zero-Rewrite Middleware)                │
 │                                                                                        │
 │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
 │  │ POST /api/v1/adapter/ingest  ──▶ Upstream Ingestion & Schema Adapter             │  │
 │  │ GET  /api/v1/cases/:id/official-artifacts/:key ──▶ Role-Guarded Vault Streaming │  │
 │  └──────────────────────────────────────────────────────────────────────────────────┘  │
 │                                                                                        │
 │  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌────────────────────────┐  │
 │  │     Member 2 Scrutiny   │  │       Member 2 EVC      │  │ Member 3 Compliance   │  │
 │  │  • APH §1.8(g) Lock     │  │  • Committee Dispatch   │  │  • 4-Clock Engine      │  │
 │  │  • Differential Guard   │  │  • Recommendation Check │  │  • 5-State Evidence    │  │
 │  └────────────┬────────────┘  └────────────┬────────────┘  └────────────┬───────────┘  │
 │               │                            │                            │              │
 │  ┌────────────┴────────────────────────────┴────────────────────────────┴───────────┐  │
 │  │                       HARDENED PERSISTENCE & GOVERNANCE LAYER                     │  │
 │  │  • WORM HMAC-SHA256 Cryptographic Audit Ledger                                   │  │
 │  │  • P0 Tenant Isolation Guard (Cross-Institution Access ──▶ 403 Forbidden)        │  │
 │  │  • 2026-27 Errata Routing Engine (NBA Bypasses EVC; X=360 Boundary Escalation)   │  │
 │  └──────────────────────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Companion Modules

1. **Upstream Ingestion Adapter (`/api/v1/adapter/ingest`)**: Ingests real application states from NSWS Investor Hand-Off and Siebel exports with full payload validation and deduplication.
2. **Member 2 Scrutiny & EVC Engine (`/api/v1/applications/:id/scrutiny`, `/api/v1/evc`)**:
   - Evaluates digital checklists against APH criteria.
   - Generates immutable Scrutiny Snapshots (e.g. `2-SOC1770029225`).
   - Dispatches Expert Visit Committees (EVC) with dynamic member assignments.
3. **APH §1.8(g) Differential Re-Scrutiny Scope Lock**:
   - Enforces the statutory prohibition against re-evaluating or tampering with previously accepted items during re-scrutiny rounds.
   - Any modification attempt targeting an accepted item immediately aborts with `409 Conflict (SCOPE_VIOLATION)`.
4. **Member 3 Post-Approval Obligations & 4-Clock Timers (`/api/v1/obligations`, `/api/v1/timers`)**:
   - Automated condition materialization upon approval decisions.
   - Multi-clock engine: *Academic Calendar Cutoff*, *Event Relative*, *Validity Expiry*, and *Internal SLA*.
   - 5-State Evidence State Machine: `submitted` ➔ `source_status_observed` ➔ `verified` / `rejected` ➔ `superseded` (uploads never auto-verify).
5. **WORM HMAC-SHA256 Cryptographic Audit Trail (`/api/v1/audit-logs`)**:
   - Write-Once-Read-Many tamper-proof hash chaining on all transactions and access denials.
6. **P0 Multi-Tenant Isolation Boundary**:
   - Strictly confines institutional users to their own permanent ID records. Cross-tenant access triggers an immediate `403 Forbidden` and writes an audit security event.
7. **Role-Guarded Official Vault Streaming (`/api/v1/cases/:id/official-artifacts/:key`)**:
   - Streams live, unredacted official AICTE PDFs (including the 95-page 2026–27 Scrutiny Report) directly to authorized actors.

---

## ⚖️ Regulatory Precedence: 2026–27 Errata & APH Hierarchy

PravahReg resolves all regulatory ambiguity using a strict **Temporal Precedence Hierarchy**:

| Tier | Regulatory Document | System Enforcement |
| :--- | :--- | :--- |
| **Tier 1 (Highest)** | **AICTE 2026–27 Errata & Addendum (G02 pp. 2–3, 11, 42)** + **Academic Calendar 2026–27 (G03)** | **NBA Fast-Track:** Courses with valid NBA accreditation bypass physical EVC inspections (skips 21 days latency).<br>**Unexpressed Boundary:** Proposed intake reaching $X = 360$ triggers `policy_review_required` and escalates to Council. |
| **Tier 2** | **AICTE Approval Process Handbook (APH 2024–2027)** | Base inspection proformas, statutory 30-year land lease deed rules, 1-year Fire Safety NOC with 60-day advance renewal rule, and faculty cadre ratios. |
| **Tier 3** | **Official Historical Manuals (NSWS Guide, DSC Manual, Deficiency Reports)** | Structural user workflows, digital signature mechanics (`AICTESigner` / `mSigner`), and dual-sign hand-offs. |

---

## 🏫 The 5 Canonical Real-World College Cases

The system boots with 5 canonical college cases seeded into runtime memory, demonstrating every major AICTE workflow scenario:

| Reference | Institution | Permanent ID / NSWS Ref | Scenario | Architectural Invariant Demonstrated |
| :--- | :--- | :--- | :--- | :--- |
| **College A** | **GIITS (Godavari Institute of Eng. & Tech.)** *(South-Central)* | `1-6055691`<br>`1-46258917694`<br>`NSWS-2026-SCRO-101` | Non-NBA Intake Increase (`240 ➔ 300`) with deficiencies | Initial Scrutiny Snapshot `2-SOC1770029225`; C3/C4 accepted, D1/D2 deficient. APH §1.8(g) blocks tampering on C3 with `409 Conflict`. Valid rectification transitions to EVC. |
| **College B** | **COEP Technological University** *(Western)* | `1-1437622971`<br>`1-43657568230`<br>`NSWS-2026-WRO-202` | Valid NBA Accreditation Fast-Path | 2026–27 Errata G02 p. 42 bypasses EVC entirely. Scheduling EVC returns `409 Conflict (EVC_NOT_REQUIRED)`. Direct transition from Scrutiny to Council Decision. |
| **College C** | **PDIMTR / Univ BDT College of Eng.** *(Western)* | `1-447718433`<br>`1-10970417826`<br>`NSWS-2026-WRO-303` | Post-Approval Compliance & 4-Clock Timers | 3 active statutory trackers: 30-year lease deed expiring in 12 days, 1-year Fire NOC, 6-month faculty cadre undertaking. Simulated clock advance triggers automated alerts. |
| **College D** | **EVIT (East Valley Institute of Tech.)** *(Eastern)* | `1-9981234004`<br>`1-46222870004`<br>`NSWS-2026-ERO-404` | Unexpressed Boundary Intake ($X = 360$) | Errata does not express rule for $X = 360$. Routing engine halts with `policy_review_required` and automatically escalates to National Approval Bureau. |
| **College E** | **VJTI (Veermata Jijabai Tech. Institute)** *(Western)* | `1-7770001122`<br>`1-46222870005`<br>`NSWS-2026-WRO-505` | Tenant Isolation Shield | Scoped exclusively to `principal@vjti.ac.in`. Read attempts by College A or unauthorized actors return `403 Forbidden` and log security audit events. |

---

## 🎮 Top Ecosystem Header & Control Center

The interface includes a **Unified National Ecosystem Header** designed for seamless evaluation and jury presentation:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ PRAVAHREG | AICTE REGULATORY COMPANION   [2026-27 ACTIVE]   Clock: 24 Oct 2026 [+7d] [+15d] [+30d] [Reset]         │
│ Persona Switcher: [Principal (COEP)] [Principal (VJTI)] [RO Western] [EVC Chair] [Bureau Approval] [Policy Admin]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **1-Click Persona Quick-Switcher (6 Built-In Personas)**:
   - `principal@coep.ac.in`: College B Institution Portal (Valid NBA).
   - `principal@vjti.ac.in`: College E Institution Portal (Tenant Isolation Test).
   - `ro.western@aicte.gov.in`: Regional Officer (Scrutiny & EVC Scheduling).
   - `evc.chair@aicte.gov.in`: Expert Committee Chairman (Inspection Scoring & Reports).
   - `bureau.approval@aicte.gov.in`: National Approval Bureau / Council Authority (Final Decisions).
   - `admin@aicte.gov.in`: Central Policy Administrator (Rule Configuration & WORM Audit Trail).
2. **Simulated Statutory Clock Controller**:
   - Base Date: `24 October 2026`.
   - 1-Click Accelerators: `+7 Days`, `+15 Days`, `+30 Days`, and `Reset`.
   - Instantly triggers statutory expiration timers, advance notification warnings, and SLA escalation alerts across all 4 clock engines.
3. **5-Tab Slide-Over Case Dossier Drawer**:
   - **Overview & Route**: Visual workflow stepper, facts, and "Why this route?" regulatory rationale.
   - **Documents & Proofs**: 5-state document repository with streaming official vault PDFs.
   - **Scrutiny Checklist**: Interactive checklist and immutable snapshot history.
   - **EVC Inspection**: Committee composition, scoring grids, and recommendation briefs.
   - **Compliance & Audit**: Statutory undertakings, 4-clock timers, and WORM cryptographic hash history.

---

## 💻 Local Setup & Quick Start

PravahReg runs with **zero external dependencies** using its built-in transactional in-memory companion engine, or can optionally connect to MongoDB.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Windows PowerShell, macOS Terminal, or Linux Bash

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mayuresh-1306/SIH-2026-AICTE.git
cd SIH-26-AICTE

# 2. Install dependencies
npm install

# 3. Create .env configuration (or use defaults)
cp .env.example .env

# 4. Run the full verification test suite (271 tests)
npx vitest run

# 5. Type-check TypeScript codebase (zero errors)
npx tsc --noEmit

# 6. Start the unified development server
npm run dev
```

The application will be live at:  
👉 **`http://localhost:3001`** (or `http://localhost:3000` depending on port configuration).

---

## 🧪 Comprehensive Verification Suite

The repository features an exhaustive automated test suite built with **Vitest**:

```bash
# Run all 271 unit, integration, and security tests
npx vitest run

# Run only the 16 acceptance verification tests (T01–T16)
npx vitest run tests/verification_t01_t16.test.ts

# Run with watch mode during development
npx vitest
```

### Acceptance Test Coverage (T01–T16)

- **T01**: Enforces Tenant Isolation (`principal@coep.ac.in` denied access to College E / VJTI ➔ `403 Forbidden`).
- **T02**: Controls Artifact Download Access & Streams Vault PDF for Authorized Actors.
- **T03**: Ingests Upstream NSWS & Siebel Hand-Off Payloads (`POST /api/v1/adapter/ingest`).
- **T04**: Signs Initial Scrutiny & Emits Deficiencies for College A (Snapshot `2-SOC1770029225`).
- **T05**: Enforces APH §1.8(g) Differential Re-Scrutiny Scope Lock (`409 Conflict: SCOPE_VIOLATION`).
- **T06**: Accepts Valid Rectification for Deficient Items & Advances to EVC (`200 OK`).
- **T07**: Strictly Denies Unauthorized Roles from Recording Decisions (`403 Forbidden`).
- **T08**: Applies 2026–27 Errata Fast-Track: College B Skips EVC (`409 Conflict: EVC_NOT_REQUIRED`).
- **T09**: Flags Unexpressed Boundary Condition $X = 360$ (`policy_review_required`).
- **T10**: Tracks Post-Approval Undertakings across 3 Statutory Conditions (College C).
- **T11**: Advances Virtual Clock by +15 Days and Fires Critical Document Expiry Alerts.
- **T12**: Enforces 5-State Document Lifecycle (Upload ➔ `submitted`, never auto-verified).
- **T13**: Verifies Cryptographic HMAC-SHA256 WORM Audit Hash Chaining.
- **T14**: Demonstrates Idempotent Webhook Retry Safety without Double-Execution.
- **T15**: Guarantees Zero Frontend Mock Fallback (UI directly reflects backend storage).
- **T16**: Verifies 1-Click Role Switcher & Persona Isolation across Regional Officer and Institution views.

---

## ⏱️ 5-Minute SIH Jury Demonstration Playbook

Follow this precise minute-by-minute playbook to deliver a high-impact presentation to the SIH 2026 evaluation jury:

| Time | Segment | What to Show in the UI | Key Narrative to Speak |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:00** | **Architectural Hook & 1-Click Personas** | Point to top ecosystem header. Click through the 6 persona cards (`Principal COEP`, `RO Western`, `EVC Chair`, `Bureau Approval`). Show live dashboard filtering. | *"National regulation cannot risk tearing out NSWS and Siebel. PravahReg is a zero-rewrite Regulatory Companion Layer that acts as an intelligent sidecar to the AICTE ecosystem without touching legacy databases."* |
| **1:00 – 2:00** | **APH §1.8(g) Scope Lock (College A - GIITS)** | Switch to `RO Western`. Open **GIITS** (`APP-2026-GIITS`). Open Scrutiny tab. Click **"Tamper Cleared Item (C3)"** button. Show instant **`409 Conflict: SCOPE_VIOLATION`**. Submit valid D1/D2 rectification. | *"Colleges often try to slip unapproved changes into cleared items. We enforce APH §1.8(g) mathematically: accepted items are locked; only deficient items can be rectified. The system rejects tampering with 409 Conflict."* |
| **2:00 – 3:00** | **2026–27 Errata Routing (College B vs D)** | Open **COEP** (`APP-2026-COEP`). Click **"Why this route?"**. Show NBA Fast-Path skipping EVC. Open **EVIT** (`APP-2026-EVIT`). Show boundary $X = 360$ triggering `policy_review_required` and Council escalation. | *"Under the 2026–27 Errata, valid NBA courses skip physical EVC inspections, saving 21 days. But at boundary X=360, the rule is unexpressed: the engine refuses to guess, halts the case, and escalates to Council."* |
| **3:00 – 4:00** | **Post-Approval Timers (College C - PDIMTR)** | Open **PDIMTR** (`APP-2026-PDIMTR`). Show 3 undertakings. In top bar, click **`+15 Days`** on the clock. Show Land Lease alert firing in the notification drawer. Upload renewal proof; observe status update to `submitted`. | *"Regulation doesn't end at approval. We track 30-year lease deeds, fire safety NOCs, and faculty undertakings across 4 statutory clock types. Advancing the virtual clock instantly fires advance renewal alerts."* |
| **4:00 – 5:00** | **Vault Artifacts & Cryptographic WORM Audit** | In the case drawer, click **`Vault Scrutiny PDF`** (streams live 95-page official GIITS report). Open **System Audit Trail** tab: show HMAC-SHA256 hash chaining and tenant violation logs. | *"Zero mock data. Real official AICTE PDFs streamed from our secure vault. Every decision and security violation is cryptographically sealed in our WORM HMAC-SHA256 audit ledger."* |

---

## 📁 Repository Directory Structure

```text
SIH-26-AICTE/
├── aicte_reference_vault/             # 12 official AICTE reference PDFs & 2026-27 reports
├── src/
│   ├── backend/                       # Companion Layer Backend Engine
│   │   ├── companionApp.ts            # Central Companion Layer Express factory
│   │   ├── data/
│   │   │   └── seedCanonicalCases.ts  # 5 Canonical College Cases (GIITS, COEP, etc.)
│   │   ├── modules/
│   │   │   ├── compliance/            # Member 3: Obligations, 4-clock timers, alerts
│   │   │   ├── scrutiny/              # Member 2: Scrutiny engine & APH §1.8(g) lock
│   │   │   └── evc/                   # Member 2: EVC inspection dispatch & scoring
│   │   ├── persistence/
│   │   │   └── memoryAdapter.ts       # WORM HMAC-SHA256 storage & P0 tenant isolation
│   │   ├── policy/                    # 2026-27 Errata & APH regulatory routing rules
│   │   ├── routes/
│   │   │   ├── adapterRoutes.ts       # Upstream NSWS & Siebel ingestion (/adapter/ingest)
│   │   │   └── artifactRoutes.ts      # Role-guarded official vault PDF streaming
│   │   └── security/
│   │       └── identity.ts            # RBAC permissions, 6 demo personas, bcrypt auth
│   ├── features/                      # Frontend Application Modules
│   │   ├── applications/              # Case dossier drawer & detail modal
│   │   └── auth/                      # Session gate, top ecosystem header, 1-click role switcher
│   ├── services/
│   │   └── api.ts                     # Consolidated API client (Zero mock fallback)
│   └── types/                         # Shared frontend & backend TypeScript definitions
├── tests/                             # Comprehensive Automated Test Suites
│   ├── verification_t01_t16.test.ts   # SIH 2026 Acceptance Verification Suite (T01–T16)
│   ├── acceptance/                    # Workflow & boundary tests
│   ├── core/                          # Transactional storage & HTTP guard tests
│   └── security/                      # RBAC, tenant isolation, and session tests
├── server.ts                          # Companion Server Entrypoint (boots companionApp)
├── vite.config.ts                     # Vite 6 + React 19 build configuration
├── package.json                       # Project dependencies and script definitions
├── AS_BUILT_BLUEPRINT.md              # Line-by-line audit blueprint of commit 318c8ba
└── TEAM_CHANGELOG_AND_HANDOFF.md      # Granular handoff guide and changelog for teammates
```

---

## 👥 Smart India Hackathon 2026 Team

- **Problem Statement 26262**: AICTE Regulation Bureau — PravahReg / AICTE CaseFlow
- **Academic Year**: 2026–2027
- **Commit Baseline**: `318c8ba` | **Status**: Verified Production-Ready Prototype

*Built with regulatory precision, architectural rigor, and zero-rewrite engineering for the All India Council for Technical Education (AICTE).*
