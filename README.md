# NiyamSetu (नियमसेतु)
### Intelligent Regulatory Approval & Compliance Companion Platform
**Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau**

[![Live Deployed Prototype](https://img.shields.io/badge/Live%20Prototype-niyamsetu--aicte.onrender.com-success?style=for-the-badge&logo=render)](https://niyamsetu-aicte.onrender.com)
[![CI Status](https://img.shields.io/badge/CI-GitHub%20Actions%20Active-brightgreen?style=flat-square&logo=githubactions)](.github/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/Vitest-283%2F289%20Passing%20(97.9%25)-brightgreen.svg?style=flat-square)](./docs/testing.md)
[![Acceptance Suite](https://img.shields.io/badge/Acceptance%20Suite-T01--T22%20(100%25%20PS%20Mapped)-blue.svg?style=flat-square)](./docs/testing.md)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20(0%20Errors)-blue.svg?style=flat-square)](./tsconfig.json)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Rewrite%20Companion%20Layer-purple.svg?style=flat-square)](./docs/architecture.md)
[![Benchmark](https://img.shields.io/badge/Research-SIH%20Winner%20Benchmark-orange.svg?style=flat-square)](./docs/research/sih-repository-benchmark.md)

---

## 🏛️ Executive Summary & Core Differentiator

National technical education regulation in India governs **10,000+ technical institutions**, **millions of student admissions**, and thousands of annual regulatory approvals spanning **Extension of Approval (EoA)**, **Increase in Intake**, **New Technical Institutions**, **Site Shifting**, and **Post-Approval Compliance Monitoring**.

Today, national regulators operate on established legacy portal infrastructures (**NSWS** for single-window investor clearance and **AICTE Oracle Siebel Core CRM** for institutional databases). Monolithic "rip-and-replace" proposals are high-risk, cost-prohibitive, and bureaucratically unfeasible.

### The NiyamSetu Differentiator: Continuous Regulatory Lifecycle
Existing systems treat pre-approval application scrutiny and post-approval statutory compliance as disconnected silos. **NiyamSetu (नियमसेतु)** bridges this gap by unifying:
1. **Pre-Approval Workflows:** Scrutiny, Differential Re-Scrutiny, Expert Visit Committees (EVC), and Standing Appellate Committees (SAC/SHC).
2. **Post-Approval Obligations:** 30-year registered land lease deeds, 1-year Fire Safety NOCs, 6-month faculty cadre ratio undertakings, and affiliating university concurrence.

...onto a **single, automated, tamper-evident timeline** implemented via a **Zero-Rewrite Companion Layer (Sidecar Architecture)**. NiyamSetu attaches seamlessly to existing NSWS and Siebel portals without altering a single line of the sovereign database core.

---

## 📸 Genuine Application Visual Showcase

All interfaces shown below are captured directly from the live, production-grade NiyamSetu companion engine running on Node.js/Express and React.

### 1. Official NiyamSetu Access Gateway & 6-Role Switcher
The unified session gate provides instantaneous, authenticated switching across all 6 statutory personas and 5 canonical technical institutions without requiring manual credential entry.
![Official Access Gateway](./docs/assets/screenshots/01-session-gate-login.png)

---

### 2. Role 2: Desk Scrutiny Committee Live Verification & Snapshot v1
Interactive statutory verification workspace. Scrutiny officers evaluate institutional facts, examine streamed vault PDFs, apply presets (`Mark All Compliant` or `Flag D1/D2 Deficiencies`), and record cryptographically signed Snapshot v1 data.
![Desk Scrutiny Checklist](./docs/assets/screenshots/02-scrutiny-checklist.png)

---

### 3. Role 2: Differential Re-Scrutiny & Scope Lock Engine (APH §1.8(g))
Our core statutory innovation: during re-scrutiny, previously verified items ($C1, C2, C3$) are cryptographically locked against alteration. Officers can only evaluate the cured proofs for previously flagged deficiencies ($D1, D2$), eliminating administrative harassment.
![Differential Re-Scrutiny Scope Lock](./docs/assets/screenshots/03-differential-rescrutiny-scopelock.png)

---

### 4. Role 3: Expert Visit Committee (EVC) & On-Site Inspection Management
Comprehensive inspection dispatch portal tracking Chapter I (7-Day SLA) vs Chapter II (14-Day SLA) cases, verifying 30-minute geo-tagged video walkthroughs, and validating latitude/longitude coordinates (`16.9891° N, 81.7840° E`).
![EVC Inspection Portal](./docs/assets/screenshots/04-evc-management.png)

---

### 5. Role 4: Regional Office Operations Desk & 8-Region Pendency Matrix
Regional officers monitor live application ageing across 4 duration buckets (`0–7d`, `8–15d`, `16–30d`, `>30d`), detect processing bottlenecks, and execute authorized stage reverts with mandatory recorded reasons.
![Regional Pendency Matrix](./docs/assets/screenshots/05-regional-pendency-matrix.png)

---

### 6. Role 5: Competent Authority Adjudication Gate (APH §1.10)
Enforces statutory human-only adjudication. Council authorities review automated route recommendations, inspect the tamper-evident WORM audit ledger, and render final binding decisions (`Grant EoA`, `Issue LoA`, or `Reject`).
![Statutory Decision Gate](./docs/assets/screenshots/06-statutory-decision-gate.png)

---

### 7. National Ecosystem Adapters Console
Live query and status console for the 5 sovereign adapters: AICTE EMS Committee Sync, AICTESigner mSigner Class-3 DSC Gateway, API Setu Registries (NBA/NAAC), State DTE 15-Day Concurrence, and Downstream Siebel CRM Write-Back.
![National Ecosystem Adapters](./docs/assets/screenshots/07-national-adapters.png)

---

### 8. Role 1: Technical Institution Signatory Workspace
Institutional signatories track their application through the 5-stage progress bar, view route classifications with handbook justifications, and submit cured evidence via the Annexure 7 deficiency cure window.
![Applicant Signatory Workspace](./docs/assets/screenshots/08-applicant-portal.png)

---

## 🎯 100% PS 26262 Regulatory Specification Coverage (Domains A–F)

| Domain | PS 26262 Statutory Requirement | NiyamSetu Implementation & Handbook Citation | Acceptance Test |
| :--- | :--- | :--- | :--- |
| **Domain A: Workflow Automation** | • All 5 APH Route combinations<br>• Authorized Stage Return/Revert<br>• Standardised Communications & Case Summaries | **All 5 Routes Implemented:** Self-Disclosure EoA, Scrutiny Only, Scrutiny + EVC, EVC + SAC/SHC Hearing Loop, and Only EVC (Restoration/Site Shifting per APH §2.16.1 & §2.17(e)).<br>**Revert Facility:** `POST /api/v1/applications/:id/revert` requiring mandatory justification and immutable WORM audit log.<br>**Case Summaries & 5 Notices:** `GET /api/v1/applications/:id/case-summary` generating 5 formal statutory templates. | **T06, T08, T17, T18, T19** |
| **Domain B: Pendency & Workload** | • Real-Time 8-Region Dashboard<br>• Ageing Duration Buckets<br>• Automated Bottleneck Detection | **8-Region Real-Time Dashboard:** Monitored across WRO, SCRO, SRO, SWRO, NRO, NWRO, ERO, CRO.<br>**Ageing Distribution:** Evaluated in 4 buckets: `0–7d` (On-Track), `8–15d` (Moderate), `16–30d` (Approaching SLA), `>30d` (Critical Bottleneck).<br>**Bottleneck Detection:** Automated stage velocity index identifying peak pendency stages. | **T11, T16, T22** |
| **Domain C: EVC Scheduling & GPS** | • Differentiated Processing Timelines<br>• Geo-Tagged Video & GPS Verification<br>• Dynamic Committee Composition | **Differentiated SLAs:** Chapter I New Technical Institutions (7-Day Priority LoA SLA) vs Chapter II Existing Institutions (14-Day Standard EoA SLA).<br>**Video & GPS:** Walkthrough URL streaming and coordinates verification (`16.9891° N, 81.7840° E`).<br>**Committee Sync:** Automated 3-expert roster generation with unbiased declaration sign-off. | **T04, T06, T21** |
| **Domain D: Time-Bound Undertakings** | • Post-Approval Undertakings Tracking<br>• 6-Month Faculty Deficit Replacement<br>• Conditional EoA Enforcement | **Undertakings Engine:** Dedicated ledger for 6-month faculty cadre ratio undertakings, 30-year registered lease deeds, and structural affidavits.<br>**Virtual Clock Acceleration:** Simulated advance (`+7d`, `+15d`, `+30d`) triggering timely compliance alerts. | **T10, T11, T19** |
| **Domain E: Document Validity** | • Prescribed Document Expiry Ledger<br>• 60-Day Advance Renewal Rule<br>• 1-Year Fire Safety NOC Tracking | **Document Validity Engine:** Tracks Fire NOCs (1-year validity) with mandatory 60-day advance renewal notification rule (APH §2.20 & GIITS case `2-SOC1770029225`).<br>**5-State Lifecycle:** `submitted` ➔ `source_status_observed` ➔ `verified` / `rejected` ➔ `superseded`. | **T11, T12, T22** |
| **Domain F: Reporting & Case Closure** | • Consolidated 6-Category Reporting Hub<br>• Authorized Case & Obligation Closure<br>• Cryptographic Audit Trail | **Consolidated Reports Hub:** `GET /api/v1/reports/consolidated` generating all 6 statutory reports.<br>**Authorized Case Closure:** `POST /api/v1/applications/:id/close-compliance` verifying all obligations and issuing closure certificate.<br>**WORM Ledger:** HMAC-SHA256 tamper-proof chaining on every mutation. | **T13, T22** |

---

## 🏗️ System Architecture & Workflow State Machine

For full architectural diagrams and data schemas, see [`docs/architecture.md`](./docs/architecture.md).

```mermaid
flowchart TB
    subgraph Sovereign_Ecosystem ["Sovereign Infrastructure (Unmodified)"]
        NSWS["NSWS Single Window"]
        SIEBEL["AICTE Siebel Core CRM"]
        APISETU["API Setu & Registries"]
    end

    subgraph NiyamSetu_Companion ["NiyamSetu Companion Layer (Zero-Rewrite)"]
        INGEST["Ingestion Webhook Adapter"]
        AUTH["RBAC & Tenant Isolation Gateway"]
        POLICY["5-Route Policy Engine (APH 2024-27)"]
        SCOPELOCK["Differential Re-Scrutiny Engine (§1.8(g))"]
        CLOCKS["4 Statutory Clock Engines"]
        MEM_DB["Transactional Companion State Store"]
        WORM["HMAC-SHA256 Cryptographic WORM Ledger"]
        WRITEBACK["Downstream Siebel Write-Back Dispatcher"]
    end

    subgraph Frontends ["Role-Based Workspaces"]
        R1["Role 1: Technical Institution"]
        R2["Role 2: Desk Scrutiny Panel"]
        R3["Role 3: EVC Committee"]
        R4["Role 4: Regional Desk"]
        R5["Role 5: Approval Bureau"]
        R6["Role 6: Policy Admin"]
    end

    NSWS --> INGEST
    INGEST --> AUTH
    AUTH --> POLICY
    POLICY --> SCOPELOCK
    POLICY --> CLOCKS
    SCOPELOCK <--> MEM_DB
    CLOCKS <--> MEM_DB
    MEM_DB --> WORM
    MEM_DB --> WRITEBACK
    WRITEBACK --> SIEBEL
    MEM_DB <--> R1 & R2 & R3 & R4 & R5 & R6
```

---

## 🏫 The 5 Canonical Real-World Technical Institutions

The application boots pre-seeded with 5 canonical real-world technical institutions demonstrating every operational scenario:

| Reference | Institution | Permanent ID / NSWS Ref | Workflow Scenario | Statutory Significance |
| :--- | :--- | :--- | :--- | :--- |
| **College A** | **GIITS (Godavari Institute of Eng. & Tech.)** *(South-Central)* | `1-6055691`<br>`1-46258917694`<br>`NSWS-2026-SCRO-101` | Non-NBA Intake Increase (`240 ➔ 300`) with D1/D2 deficiencies | Evaluates Initial Scrutiny Snapshot `2-SOC1770029225`; C3/C4 accepted, D1/D2 deficient. APH §1.8(g) scope lock prohibits tampering on C3. Valid rectification advances to EVC. |
| **College B** | **COEP Technological University** *(Western)* | `1-1437622971`<br>`1-43657568230`<br>`NSWS-2026-WRO-202` | Valid NBA Accreditation Fast-Path | 2026–27 Errata G02 p. 42 bypasses EVC entirely. Scheduling EVC returns `409 Conflict (EVC_NOT_REQUIRED)`. Direct transition from Scrutiny to Council Decision. |
| **College C** | **PDIMTR / Univ BDT College of Eng.** *(Western)* | `1-447718433`<br>`1-10970417826`<br>`NSWS-2026-WRO-303` | Post-Approval Compliance & 4-Clock Timers | 3 active statutory trackers: 30-year lease deed expiring in 12 days, 1-year Fire NOC, 6-month faculty cadre undertaking. Simulated clock advance triggers automated alerts. |
| **College D** | **EVIT (East Valley Institute of Tech.)** *(Eastern)* | `1-9981234004`<br>`1-46222870004`<br>`NSWS-2026-ERO-404` | Unexpressed Boundary Intake ($X = 360$) | Errata does not express rule for $X = 360$. Routing engine halts with `policy_review_required` and automatically escalates to National Approval Bureau. |
| **College E** | **VJTI (Veermata Jijabai Tech. Institute)** *(Western)* | `1-7770001122`<br>`1-46222870005`<br>`NSWS-2026-WRO-505` | Multi-Tenant Isolation Shield | Scoped exclusively to `principal@vjti.ac.in`. Read attempts by College A or unauthorized actors return `403 Forbidden` and log security audit events. |

---

## 💻 Local Setup & Quick Start (< 2 Minutes)

NiyamSetu requires zero external database installation; its transactional in-memory companion engine boots deterministically out of the box.

### Prerequisites
- **Node.js**: v18.0.0 or v20.x
- **npm**: v9.0.0 or higher

### Installation & Execution

```bash
# 1. Clone repository
git clone https://github.com/parth-ai28/SIH-2026-AICTE.git
cd SIH-26-AICTE

# 2. Install dependencies
npm install

# 3. Type-check TypeScript codebase (Strict mode - 0 errors)
npx tsc --noEmit

# 4. Run automated test suite (283/289 Passing)
npx vitest run

# 5. Build production bundle
npm run build

# 6. Start development server
npm run dev
```

Open your browser to:  
👉 **`http://localhost:3000`**

---

## 🧪 Testing Evidence & Acceptance Suite (T01–T22)

- **Total Automated Tests:** 289 Tests across 26 Test Files
- **Passed:** 283 Tests (**97.9% Pass Rate**)
- **Diverged / Legacy Mocks:** 6 Tests (Transparently documented in [`docs/testing.md`](./docs/testing.md))

```bash
# Run full suite
npx vitest run

# Run core acceptance verification suite (T01–T16)
npx vitest run tests/verification_t01_t16.test.ts

# Run extended ecosystem suite (T17–T22)
npx vitest run tests/verification_t17_t22.test.ts
```

For the complete API Route Matrix and parameter schemas, see [`docs/api-route-matrix.md`](./docs/api-route-matrix.md).  
For the comparative research benchmark of previous SIH winners, see [`docs/research/sih-repository-benchmark.md`](./docs/research/sih-repository-benchmark.md).

---

## 👥 Smart India Hackathon 2026

- **Problem Statement 26262**: AICTE Regulation Bureau — NiyamSetu (नियमसेतु)
- **Academic Year**: 2026–2027
- **Deployment**: [https://niyamsetu-aicte.onrender.com](https://niyamsetu-aicte.onrender.com)
- **Status**: Production-Grade Regulatory Companion Platform (100% PS 26262 Coverage)

*Built with statutory precision, zero-rewrite companion architecture, and cryptographic immutability for the All India Council for Technical Education (AICTE).*
