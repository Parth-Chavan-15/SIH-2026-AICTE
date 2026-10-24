# PravahReg / AICTE CaseFlow
### Intelligent Regulatory Companion Layer & Dynamic Compliance Platform
**Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau**

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=flat-square)](https://www.sih.gov.in/)
[![Problem Statement 26262](https://img.shields.io/badge/PS-26262-blue.svg?style=flat-square)](https://www.aicte-india.org/)
[![Tests Passing](https://img.shields.io/badge/Vitest-277%2F277%20Passed-brightgreen.svg?style=flat-square)](./tests)
[![Acceptance Suite](https://img.shields.io/badge/Acceptance%20Suite-T01--T22%20(22%2F22%20Verified)-success.svg?style=flat-square)](./tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20(0%20Errors)-blue.svg?style=flat-square)](./tsconfig.json)
[![Architecture](https://img.shields.io/badge/Architecture-Companion%20Layer%20(Zero--Rewrite)-purple.svg?style=flat-square)](#-architectural-paradigm-the-zero-rewrite-companion-layer)

---

## 🏛️ Executive Summary

National technical education regulation in India governs **10,000+ technical institutions**, **millions of student admissions**, and thousands of annual regulatory approvals spanning **Extension of Approval (EoA)**, **Increase in Intake**, **New Technical Institutions**, **Site Shifting**, and **Post-Approval Compliance Monitoring**.

Today, national regulators operate on established legacy portal infrastructures (**NSWS** for single-window investor clearance and **AICTE Siebel Core CRM** for institutional databases). Attempting a monolithic "rip-and-replace" of this sovereign architecture is high-risk, cost-prohibitive, and impractical.

**PravahReg / AICTE CaseFlow** solves this challenge by introducing an **Intelligent Regulatory Companion Layer** — a high-performance sidecar that attaches seamlessly to existing NSWS and Siebel portals. It hardens regulatory logic, enforces temporal legal precedence (AICTE 2026–27 Errata & APH 2024–27), guarantees multi-tenant institutional isolation, and tracks post-approval compliance across 4 statutory clock types — **without modifying a single line of the legacy Siebel core database**.

---

## 🎯 100% PS 26262 Regulatory Specification Coverage (Domains A–F)

| Domain | PS 26262 Statutory Requirement | PravahReg Implementation & Handbook Citation | Verification Test |
| :--- | :--- | :--- | :--- |
| **Domain A: Workflow Automation** | • All 5 APH Route combinations<br>• Authorized Stage Return/Revert<br>• Standardised Communications & Case Summaries | **All 5 Routes Implemented:** Self-Disclosure EoA, Scrutiny Only, Scrutiny + EVC, EVC + SAC/SHC Hearing Loop, and Only EVC (Restoration/Site Shifting per APH §2.16.1 & §2.17(e)).<br>**Revert Facility:** `POST /api/v1/applications/:id/revert` requiring mandatory reason and immutable WORM audit log.<br>**Case Summaries & 5 Notices:** `GET /api/v1/applications/:id/case-summary` generating 5 formal statutory templates. | **T06, T08, T17, T18, T19** |
| **Domain B: Pendency & Workload** | • Real-Time 8-Region Dashboard<br>• Ageing Duration Buckets<br>• Automated Bottleneck Detection | **8-Region Real-Time Dashboard:** Monitored across WRO, SCRO, SRO, SWRO, NRO, NWRO, ERO, CRO.<br>**Ageing Distribution:** Evaluated in 4 buckets: `0–7d` (On-Track), `8–15d` (Moderate), `16–30d` (Approaching SLA), `>30d` (Critical Bottleneck).<br>**Bottleneck Detection:** Automated stage velocity index identifying peak pendency stages. | **T11, T16, T22** |
| **Domain C: EVC Scheduling & GPS** | • Differentiated Processing Timelines<br>• Geo-Tagged Video & GPS Verification<br>• Dynamic Committee Composition | **Differentiated SLAs:** Chapter I New Technical Institutions (7-Day Priority LoA SLA) vs Chapter II Existing Institutions (14-Day Standard EoA SLA).<br>**Video & GPS:** Walkthrough URL streaming and coordinates verification (`16.9891° N, 81.7840° E`).<br>**Committee Sync:** Automated 3-expert roster generation with unbiased declaration sign-off. | **T04, T06, T21** |
| **Domain D: Time-Bound Undertakings** | • Post-Approval Undertakings Tracking<br>• 6-Month Faculty Deficit Replacement<br>• Conditional EoA Enforcement | **Undertakings Engine:** Dedicated ledger for 6-month faculty cadre ratio undertakings, 30-year registered lease deeds, and structural affidavits.<br>**Virtual Clock Acceleration:** Simulated advance (`+7d`, `+15d`, `+30d`) triggering timely compliance alerts. | **T10, T11, T19** |
| **Domain E: Document Validity** | • Prescribed Document Expiry Ledger<br>• 60-Day Advance Renewal Rule<br>• 1-Year Fire Safety NOC Tracking | **Document Validity Engine:** Tracks Fire NOCs (1-year validity) with mandatory 60-day advance renewal notification rule (APH §2.20 & GIITS case `2-SOC1770029225`).<br>**5-State Lifecycle:** `submitted` ➔ `source_status_observed` ➔ `verified` / `rejected` ➔ `superseded`. | **T11, T12, T22** |
| **Domain F: Reporting & Case Closure** | • Consolidated 6-Category Reporting Hub<br>• Authorized Case & Obligation Closure<br>• Cryptographic Audit Trail | **Consolidated Reports Hub:** `GET /api/v1/reports/consolidated` generating all 6 statutory reports.<br>**Authorized Case Closure:** `POST /api/v1/applications/:id/close-compliance` verifying all obligations and issuing closure certificate.<br>**WORM Ledger:** HMAC-SHA256 tamper-proof chaining on every mutation. | **T13, T22** |

---

## 🔌 Zero-Rewrite Companion Architecture & The 5 Ecosystem Adapters

PravahReg connects directly to the existing national technical education infrastructure via 5 companion adapters, with explicit `SIMULATED_ADAPTER` and `SOURCE_STATUS_OBSERVED` honesty metadata:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                           EXISTING SOVEREIGN INFRASTRUCTURE                            │
 │  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌────────────────────────┐  │
 │  │    NSWS Portal & DSC    │  │   AICTE Siebel Core CRM │  │   API Setu & Registries│  │
 │  │  (PAN, KYC, Dual-Sign)  │  │  (Institutional Records)│  │ (NBA, NAAC, IIC, APAAR)│  │
 │  └────────────┬────────────┘  └────────────┬────────────┘  └────────────┬───────────┘  │
 └───────────────┼────────────────────────────┼────────────────────────────┼──────────────┘
                 │                            │                            │
                 ▼                            ▼                            ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                 PRAVAHREG ZERO-REWRITE COMPANION LAYER (Node/Express + React)          │
 │                                                                                        │
 │  1. POST /adapter/committee-sync/:id  ──▶ Central Committee Auto-Selection Sync       │
 │  2. POST /adapter/dsc-verify          ──▶ AICTESigner / mSigner Class-3 DSC Gateway   │
 │  3. GET  /adapter/external-registries ──▶ API Setu Statutory Registries Sync          │
 │  4. GET  /adapter/concurrence/:id     ──▶ Univ & State DTE 15-Day Concurrence Tracker │
 │  5. POST /adapter/siebel-writeback/:id ──▶ Siebel Core Write-Back & 6-Authority Outbox │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Adapter 1: AICTE Portal Committee Auto-Selection Sync (`POST /api/v1/adapter/committee-sync/:caseId`)**:
   - Synchronizes with AICTE Expert Management System. Generates 3-expert inspection panels (Chairman, Convener, Architect/Subject Expert) and validates unbiased no-conflict declarations.
2. **Adapter 2: `AICTESigner` / `mSigner` Class-3 DSC Verification Gateway (`POST /api/v1/adapter/dsc-verify`)**:
   - Rejects unsigned affidavits with `422 DSC_SIGNATURE_REQUIRED` per APH §1.4.3 & §2.3.4(a). Validates Class-3 USB cryptographic e-tokens and generates SHA-256 integrity digests.
3. **Adapter 3: API Setu / External Statutory Registries Hub (`GET /api/v1/adapter/external-registries/:caseId`)**:
   - Live query interface for NBA accreditation validity, NAAC/NIRF tier, MoE Innovation Cell (IIC) star ratings, Academic Bank of Credits (ABC/APAAR) student linkages, and Central Anti-Ragging affidavits.
4. **Adapter 4: Affiliating University & State DTE 15-Day NOC Concurrence Tracker (`GET /api/v1/adapter/concurrence/:caseId`)**:
   - Implements statutory 15-day concurrence countdown timer under APH §2.19(c). Enforces Deemed Concurrence rule when state authorities do not reply within 15 days.
5. **Adapter 5: Downstream Siebel Status Write-Back & 6-Authority Bulk Dispatch (`POST /api/v1/adapter/siebel-writeback/:caseId`)**:
   - Generates Siebel partner transaction sync records and automated digital dispatch packages to 6 statutory authorities: Institution, Regional Office, Affiliating University, State DTE Director, Member Secretary AICTE, and National Portal NSWS.

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

## 🎮 Unified National Ecosystem Header & Control Center

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
3. **Consolidated Case Dossier Modal (11 Specialized Tabs)**:
   - **Overview & Route**: Visual workflow stepper, facts, and "Why this route?" regulatory rationale.
   - **Details**: Full institutional profile and sanctioned intake statistics.
   - **Documents & Proofs**: 5-state document repository with streaming official vault PDFs.
   - **Workflow Timeline**: Real-time event log of movements and actions.
   - **Observations**: Official remarks and clarification requests.
   - **EVC Details**: Chapter I (7d SLA) vs Chapter II (14d SLA) badges, 30-min geo-tagged video URL, and GPS coordinates.
   - **Compliance**: Institutional undertakings and "Authorized Case Closure" button (`POST /close-compliance`).
   - **Scrutiny & Scope Lock (USP B06)**: Interactive APH §1.8(g) scope lock tester.
   - **Case Summary & Notices (PS §A.4)**: Executive electronic summary and 5 standardised statutory notice templates with copy/print.
   - **AICTE Ecosystem Adapters (5)**: Interactive console for Committee Sync, DSC Gateway, API Setu Registries, Concurrence, and Siebel Write-Back.
   - **Audit History**: WORM cryptographic HMAC-SHA256 hash chaining stream.

---

## 💻 Local Setup & Quick Start

PravahReg runs with **zero external dependencies** using its built-in transactional in-memory companion engine.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Windows PowerShell, macOS Terminal, or Linux Bash

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Mayuresh-1306/SIH-2026-AICTE.git
cd SIH-26-AICTE

# 2. Install dependencies
npm install

# 3. Type-check TypeScript codebase (zero errors)
npx tsc --noEmit

# 4. Run the full verification test suite (277 tests across 25 suites)
npx vitest run

# 5. Build for production
npm run build

# 6. Start development server
npm run dev
```

The application will be live at:  
👉 **`http://localhost:3000`** (or `http://localhost:3001` depending on port availability).

---

## 🧪 Comprehensive Verification Suite (T01–T22)

The repository features 277 automated tests running via **Vitest**:

```bash
# Run all 277 unit, integration, and security tests
npx vitest run

# Run the 16 core acceptance verification tests (T01–T16)
npx vitest run tests/verification_t01_t16.test.ts

# Run the 6 extended ecosystem & PS 26262 verification tests (T17–T22)
npx vitest run tests/verification_t17_t22.test.ts
```

### Complete Acceptance Suite (T01–T22) Breakdown

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
- **T17**: Registers and supports all 5 APH route combinations including Only EVC (Restoration) & EVC+SAC/SHC (Hearing).
- **T18**: Enforces Authorized Stage Return/Revert requiring mandatory reason and recording to audit (`POST /revert`).
- **T19**: Generates Electronic Case Summary and all 5 Standardised Statutory Notice templates (`GET /case-summary`).
- **T20**: `AICTESigner` / `mSigner` DSC Gateway rejects unsigned affidavits (`422`) and validates Class-3 tokens.
- **T21**: External Statutory Registries Hub (API Setu) & Committee Selection Sync return observed metadata.
- **T22**: Consolidated 6-Category Reporting Hub, Downstream Siebel Write-Back & Authorized Case Closure (`POST /close-compliance`).

---

## 👥 Smart India Hackathon 2026 Team

- **Problem Statement 26262**: AICTE Regulation Bureau — PravahReg / AICTE CaseFlow
- **Academic Year**: 2026–2027
- **Current Branch**: `main` | **Status**: Verified Production-Ready Prototype (100% PS 26262 Coverage)

*Built with regulatory precision, architectural rigor, and zero-rewrite engineering for the All India Council for Technical Education (AICTE).*
