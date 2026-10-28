# NiyamSetu (नियमसेतु)
### Automated Approval Workflow & Regulatory Compliance Monitoring Platform for AICTE
**Smart India Hackathon 2026 | Problem Statement 26262 (AICTE Regulation Bureau) | Academic Year 2026–2027**

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-niyamsetu--aicte.onrender.com-success?style=for-the-badge&logo=render)](https://niyamsetu-aicte.onrender.com)
[![Status](https://img.shields.io/badge/Status-High--Fidelity%20Transactional%20Prototype-brightgreen?style=flat-square)](https://niyamsetu-aicte.onrender.com)
[![Regression Suite](https://img.shields.io/badge/Deliverables%20Suite-36%2F36%20Passed%20(100%25)-brightgreen.svg?style=flat-square)](./tests/regression_retrofit_all_deliverables.test.ts)
[![Total Test Suite](https://img.shields.io/badge/Total%20Test%20Suite-325%2F325%20Passed%20(100%25)-brightgreen.svg?style=flat-square)](./tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20(0%20Errors)-blue.svg?style=flat-square)](./tsconfig.json)
[![Handbook Base](https://img.shields.io/badge/Handbook%20Base-APH%202024--27%20%2B%20Addendum%20G02-orange.svg?style=flat-square)](https://www.aicte-india.org)

---

## 🏛️ Executive Summary & Statutory Purpose

Every year, the **All India Council for Technical Education (AICTE)** governs technical education across India, processing approval applications from over **10,000 polytechnics, engineering institutions, and management colleges**. Approval categories span Setting up New Technical Institutions, Extension of Approval (EoA), Increase in Intake / Additional Courses, Introduction of Supernumerary Quotas, Change of Site / Location, and Restoration of Intake.

Managing these workflows historically involved manual handoffs between national intake portals, regional office desks, ad-hoc scrutiny panels, physical inspection committees, and post-approval compliance tracking.

**NiyamSetu (नियमसेतु)** is an enterprise-grade regulatory companion engine engineered for the AICTE Regulation Bureau to:
1. Provide a seamless, simulated **National Single Window System (NSWS) → AICTE** application intake pipeline with emBridge Class-3 USB token authentication.
2. Execute a **deterministic, source-grounded Dynamic Route Engine** anchored directly to APH 2024–27 Table 2.3 and AY 2026–27 Addendum Errata G02, failing safely to `review_required` on material policy ambiguities ($X=360$, ELP 50%, Hibernation).
3. Provide an active **Regional Office Operations Desk Allocation** console with workload tracking across standing Scrutiny and Expert Visit Committee (EVC) groups.
4. Support an **Existing AICTE Portal Scrutiny Report Ingestion Flow** with immutable report preservation and automated extraction mapping.
5. Enforce server-enforced **Differential Re-Scrutiny Scope-Locks (APH §1.8(g))** that permanently lock previously cleared items read-only against any modification.
6. Decouple **Standing Appellate Committee (SAC) appeals, Standing Hearing Committee (SHC) shortcomings hearings, and Chapter VII §7.10 Grievances** from the main application spine.
7. Provide a **Central Policy Administrator Workspace (Role 6)** featuring an Active Rules & Routing Registry, versioned draft editor, before/after diff visualizer, route sandbox, and regulatory conflict register.
8. Synthesize per-case **institute-specific decision documents (LoA/EoA/LoD/LoR)** with HMAC-SHA256 prototype integrity seals (non-production test key), tamper detection, and order-backed compliance materialization.
9. Track post-approval obligations through an automated **4-clock deterministic timer engine**, isolating APH §2.25(f) security deposits from pre-approval scrutiny cure windows.

---

## 🔄 End-to-End Approval Lifecycle Architecture

```mermaid
flowchart TD
    classDef startNode fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef processNode fill:#0f172a,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef branch fill:#312e81,stroke:#6366f1,stroke-width:1.5px,color:#fff;
    classDef decisionNode fill:#831843,stroke:#ec4899,stroke-width:2px,color:#fff;
    classDef docNode fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef auditNode fill:#1c1917,stroke:#f59e0b,stroke-width:1.5px,color:#fbbf24;

    A["1. NSWS Intake Simulation<br/>(PAN Check + emBridge DSC Token Simulation)"]:::startNode --> B["2. Dynamic Route Engine<br/>(APH 2024-27 Table 2.3 + Addendum Errata G02)"]:::processNode
    
    B -->|Self-Disclosure EoA| G_EC["Chapter II Executive Committee Gate<br/>(Grant of EoA APH §2.25)"]:::decisionNode
    B -->|New Inst / Non-NBA Intake| C["RO Desk Allocation<br/>(Assign Standing Scrutiny Group)"]:::processNode
    B -->|Site Shifting / Restoration| E["RO Desk Allocation<br/>(Direct EVC Panel Assignment)"]:::processNode
    B -->|Policy Ambiguity Hold X=360| BH["Policy Review Required Hold<br/>(Addendum 2026-27 p. 42 / Safe Halt)"]:::decisionNode

    C --> D["Desk Scrutiny Committee<br/>(6 Statutory Checklist Categories)"]:::processNode
    D -->|Deficiencies Flagged D1, D2| D_LOD["Issue Formal Letter of Deficiency (LoD)<br/>(Statutory Shortcomings Notice APH §1.11 / §2.25c)"]:::decisionNode
    D_LOD -->|Cure Window 15 Days| D1["Differential Re-Scrutiny Scope-Lock<br/>(APH §1.8g: Cleared C3/C4 Read-Only)"]:::branch
    D1 -->|Deficiencies Successfully Cured| D2Check{"Route Requires<br/>EVC?"}
    D -->|All Compliant C1-C6| D2Check

    D2Check -->|Yes: Non-NBA Intake / New Inst| E
    D2Check -->|No: Valid NBA per Addendum §2.6c1| G_EC

    E --> F["Expert Visit Committee (EVC)<br/>(On-Site Physical Inspection APH §1.9<br/>Engineering Enhancement: 500m geofence)"]:::processNode
    F -->|Satisfactory Report| G_ROUTE{"Application<br/>Category?"}
    
    G_ROUTE -->|Chapter I: New Institution| G_CH1_EC["Executive Committee Decision<br/>(APH §1.10a)"]:::decisionNode
    G_CH1_EC --> G_CH1_COUNCIL["Council Ratification<br/>(APH §1.10a)"]:::decisionNode
    G_CH1_COUNCIL -->|Approved| H1["Issue Letter of Approval (LoA)<br/>(AICTE Act §10k / APH §1.10)"]:::docNode
    G_CH1_COUNCIL -->|Rejected| I2["Issue Letter of Rejection (LoR)<br/>(Speaking Order AICTE Act §10k)"]:::decisionNode

    G_ROUTE -->|Chapter II: Existing Institution| G_EC
    G_EC -->|Approved| H2["Issue Extension of Approval (EoA)<br/>(Speaking Order APH §2.25)"]:::docNode
    G_EC -->|Adverse Decision| I2

    %% Decoupled Chapter II SHC Shortcomings Branch
    D -.->|Unresolved Shortcomings| SHC_COMP["Chapter II SHC Compliance Opportunity<br/>(APH §2.23.3: Hearing & Evidence)"]:::branch
    F -.->|Serious Deficiencies| SHC_COMP
    SHC_COMP --> SHC_REC["SHC Recommendations<br/>(Submitted to Executive Committee)"]:::branch
    SHC_REC --> G_EC

    %% Decoupled Chapter II SAC Appellate Branch
    I2 -.->|Aggrieved within 7 Days| SAC_APP["Standing Appellate Committee (SAC)<br/>(Eligible Statutory Appeal APH §2.24)"]:::branch
    SAC_APP --> SAC_REC["SAC Recommendations<br/>(Submitted to Council)"]:::branch
    SAC_REC --> SAC_FINAL["Council Decision<br/>(Final under APH §2.24)"]:::decisionNode

    %% Decoupled Chapter VII Grievance & Complaint Branch
    PGRC["Chapter VII PGRC Intake<br/>(Identity Verification; Reject Anonymous APH §7.10)"]:::startNode -.-> SCSC["Standing Complaint Scrutiny Committee (SCSC)<br/>(Evidence Scrutiny & Fact Assessment)"]:::branch
    SCSC -.-> SCSC_ACT{"Action Required?"}
    SCSC_ACT -.->|Show-Cause / Fact-Finding| SCSC_EVC["Warning / Show-Cause Notice / Fact-Finding EVC"]:::branch
    SCSC_EVC -.-> SHC_COMP

    %% Post-Approval Compliance Materialization
    H1 --> N["Post-Approval Compliance DB<br/>(Materialized Strictly from Authorized Order Conditions)"]:::auditNode
    H2 --> N
    N --> N1["Clock 1: APH §2.25f Security Deposit & Affidavit-3 (15 Days - Statutory)"]:::auditNode
    N -.->|When Imposed by Order| N2["Clock 2: Fire Safety NOC Renewal (Operational SLA / Local Municipal Rule)"]:::auditNode
    N -.->|When Imposed by Order| N3["Clock 3: 30-Year Registered Land Lease Deed (APH §6.17a)"]:::auditNode
    N -.->|When Imposed by Order| N4["Clock 4: Faculty Appointment Undertaking (6-Month Cadre Ratio)"]:::auditNode
```

---

## 📦 Audit of Mandatory Retrofit Deliverables

| Deliverable | Statutory Grounding | Code Implementation | Test Verification |
|---|---|---|---|
| **1. NSWS Intake Simulation** | National Single Window System integration guidelines | [`src/backend/modules/nsws/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/nsws/)<br/>[`src/features/nsws/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/nsws/) | `Deliverable 1` test in [`regression_retrofit_all_deliverables.test.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/tests/regression_retrofit_all_deliverables.test.ts) |
| **2. Dynamic Route Engine** | APH 2024–27 Table 2.3, Chapter I §1.8–§1.9, Addendum 2026–27 §2.6(c)(1) | [`src/backend/policy/dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts) | `Deliverable 2` tests (3 scenarios: NBA waiver, non-NBA EVC, $X=360$ flag) |
| **3. RO Operations Desk Allocation** | Regional Office operational workload distribution norms | [`src/backend/modules/allocation/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/allocation/)<br/>[`src/features/ro/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/ro/) | `Deliverable 3` tests (Capacity checks, EVC precondition guard, audit trail) |
| **4. Existing Portal Report Ingestion** | AICTE Scrutiny Evaluation Report format (GIITS & MCET) | [`src/backend/modules/portalImport/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/portalImport/)<br/>[`src/features/portalImport/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/portalImport/) | `Deliverable 4` tests (Local demo fixtures, confidence mapping, scoped tasks) |
| **5. Re-Scrutiny Scope-Lock** | APH 2024–27 Chapter I Clause 1.8(g) | [`src/backend/modules/scrutiny/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/scrutiny/) | `Deliverable 5` test (HTTP 409 Conflict upon editing cleared items) |
| **6. Decoupled SAC / SHC / Grievance** | APH §1.11, §2.23.3, §2.24, and Chapter VII §7.10 | [`src/backend/modules/appealsAndHearings/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/appealsAndHearings/)<br/>[`src/features/appeals/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/appeals/) | `Deliverable 6` tests (7-day SAC appeal window, anonymous grievance rejection) |
| **7. Active Rules & Routing Registry** | Role 6 Policy Administration & Versioning Norms | [`src/backend/modules/rulesRegistry/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/rulesRegistry/)<br/>[`src/features/admin/ConfigRulesView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/admin/ConfigRulesView.tsx) | `Deliverable 7` tests (Searchable active rules, diff editor, conflict register) |
| **8. Generated Decision Documents** | AICTE Act 1987 §10(k), Official Order Issuance | [`src/backend/modules/decisionDocuments/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/decisionDocuments/)<br/>[`src/features/documents/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/documents/) | `Deliverable 8` tests (Dynamic PDF rendering, demo digital signing, complianceDB sync) |
| **9. Timers & Regulatory Clocks** | APH §2.25(f) vs Deficiency Cure Distinction | [`src/backend/modules/compliance/`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/compliance/) | Acceptance tests T10–T12 & `m3_obligations_timers.test.ts` |
| **10. Removal of Mock Adapters** | Clean architecture; removal of API Setu, DTE, Siebel | [`src/backend/routes/adapterRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/routes/adapterRoutes.ts) | `Deliverable 10` tests (All 3 excised endpoints return HTTP 404) |
| **11. Regression Tests & Documentation** | Verification rigour & demonstration clarity | [`tests/regression_retrofit_all_deliverables.test.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/tests/regression_retrofit_all_deliverables.test.ts) | 21/21 retrofit tests + 310 total repository tests passing natively |

---

## 👥 The 6 Statutory User Personas

| Role ID | Persona Title | Statutory Responsibilities in NiyamSetu |
|---|---|---|
| `institution` | **College Principal / Trust Signatory** | Onboards via NSWS simulation, tracks stage progression, cures flagged deficiencies ($D1, D2$) during 15-day windows, and uploads compliance renewal proofs. *Constitutional guard: Cannot edit cleared checklist items or self-approve.* |
| `reviewer` | **Desk Scrutiny Committee Expert** | University professors and empanelled subject experts. Evaluates applications across 6 statutory categories, flags deficiencies, and signs evaluation reports. *Constitutional guard: Cannot re-evaluate cleared items ($C3, C4$) on re-scrutiny.* |
| `evc` | **Expert Visit Committee Officer** | Senior inspection experts. Coordinates on-site physical audits and confirms geo-coordinates and walkthrough recordings per APH §1.9 (note: 500m campus geofencing is an application engineering enhancement; APH §1.9 mandates on-site physical visit and geo-coordinates verification). |
| `regional_officer` | **Regional Office Operations Desk** | AICTE Regional Directors (Western, Northern, Eastern, Southern, South-Central, South-Western, North-Western, Central). Allocates cases across Scrutiny Groups A/B and EVC Panels Alpha/Beta, monitors 8-region pendency buckets, and tracks SLAs. |
| `bureau_officer` | **Approval Bureau / Council Authority** | AICTE Executive Committee & Member Secretary. Reviews consolidated case summaries, exercises human-only decision authority (AICTE Act 1987 §10(k)), and generates digitally signed LoA/EoA/LoD/LoR orders with conditional undertakings. |
| `policy_admin` | **Central Policy Administrator** | Custodians of the Active Rules & Routing Registry. Edits versioned rules, inspects before/after diffs, simulates routes in the sandbox, manages the conflict register, and inspects the SHA-256 audit ledger. |

---

## 🏫 The 5 Canonical Sample Colleges Seeded

| Institution Name | Region | Category & Scope | Canonical Workflow Demonstrated |
|---|---|---|---|
| **GIITS Visakhapatnam**<br/>`APP-2026-GIITS` | South-Central | Increase in Intake (`180 ➔ 240`)<br/>Non-NBA accredited | Non-NBA course requires Desk Scrutiny followed by physical EVC inspection. Demonstrates initial scrutiny deficiency flagging ($D1, D2$), applicant rectification, differential re-scrutiny scope-lock, and progression to EVC. |
| **COEP Tech University, Pune**<br/>`APP-2026-COEP` | Western | Increase in Intake (`120 ➔ 180`)<br/>NBA Tier-1 Accredited (Score 680) | Holds valid NBA accreditation. Dynamic Route Engine executes Fast-Track route: physical EVC inspection is **explicitly bypassed** under Addendum 2026–27 p. 42 §2.6(c)(1). |
| **PDIMTR / Univ BDT College**<br/>`APP-2026-PDIMTR` | Western | Extension of Approval (EoA)<br/>Conditional Order Compliance | Approved with mandatory undertakings. Actively tracks 3 post-approval obligations in `complianceDB`: 30-year registered land lease deed, annual Fire Safety NOC renewal, and 6-month faculty appointment undertaking. |
| **Apex Institute of Technology**<br/>`APP-2026-APEX` | Northern | Increase in Intake<br/>Decoupled Governance Branch | Demonstrates decoupled appellate workflows: adverse rejection order triggers statutory appeal to the Standing Appellate Committee (SAC) within a 7-calendar-day window with appellant DSC token. |
| **BATU Lonere**<br/>`APP-2026-BATU` | Western | Change of Site / Location<br/>Break-in-EoA Restoration | Evaluates under APH Table 2.3 Row 11: Desk Scrutiny is **bypassed** in favor of immediate physical site verification by EVC Panel Beta. |

---

## 🚀 Step-by-Step Golden Demo Runbooks

### 🌟 Path A: NSWS Intake Simulation to Council Order & Compliance

```
[NSWS Onboarding] ➔ [Route Engine] ➔ [RO Allocation] ➔ [Scrutiny & Scope-Lock] ➔ [EVC Bypass/Visit] ➔ [Council Decision & Signed PDF] ➔ [Obligations DB]
```

1. **Step 1 — NSWS Intake Simulation (`/nsws`):**
   - Click **NSWS Simulation** in the top navigation bar.
   - Onboard *College of Engineering Pune (COEP)*: verify simulated PAN (`AAACB1234F`) and emBridge Class-3 cryptographic USB token (`EP2003-8841-A99B`).
   - Review live route pre-check: NBA Score 680 waives physical EVC inspection under Addendum 2026–27 p. 42.
   - Submit application: creates a persistent record with `intakeChannel: 'NSWS_SIMULATION'`.
2. **Step 2 — Regional Office Operations Desk Allocation (`/ro-allocation`):**
   - Switch persona to **Regional Officer** (`ro.western@aicte.gov.in`).
   - Navigate to **RO Desk Allocation**: review standing panels `SCR-GROUP-A`, `SCR-GROUP-B`, `EVC-GROUP-A`, `EVC-GROUP-B`.
   - Attempt to assign case `APP-2026-COEP` to `EVC-GROUP-A`: observe system **blocking the assignment with HTTP 422** (`EVC_NOT_APPLICABLE_FOR_ROUTE`).
   - Assign to `SCR-GROUP-B` with reason: *"Western regional desk workload balancing"*; review audit trail.
3. **Step 3 — Scrutiny Desk & Scope-Lock Enforcement (`/scrutiny`):**
   - Switch persona to **Scrutiny Reviewer** (`scrutiny.reviewer@aicte.gov.in`).
   - Review submitted documents: mark Land Conversion compliant and Faculty Cadre deficient ($D1$).
   - On re-scrutiny under **APH §1.8(g)**, previously approved items ($C3, C4$) are locked read-only.
   - Any attempt to modify cleared items returns **HTTP 409 Conflict (`SCOPE_VIOLATION`)**.
4. **Step 4 — Council Decision & PDF Decision Document (`/decision-docs`):**
   - Switch persona to **Bureau Officer** (`bureau.approval@aicte.gov.in`).
   - Open **Decision Documents**: generate an **Extension of Approval (EoA)** for `APP-2026-COEP`.
   - Click **Download PDF**: inspect the generated document rendered via `pdf-lib` containing case details, courses, approved intake (180), and the prominent watermark:
     > `DEMO DIGITAL SIGNATURE — NOT AN OFFICIAL AICTE SIGNATURE / NOT AN OFFICIAL ORDER`
   - Click **Verify Digital Signature**: observe HMAC SHA-256 certificate validation.
   - Open **Post-Approval Compliance**: observe obligations materialized strictly and only from represented conditions in the authorized decision.

---

### 📂 Path B: Existing Portal Report Ingestion & Policy Registry

```
[Portal Report Ingest] ➔ [Mapping Preview] ➔ [Scoped Re-Scrutiny] ➔ [Policy Registry Diff] ➔ [Conflict Register]
```

1. **Step 1 — Portal Deficiency Report Ingestion (`/portal-import`):**
   - Click **Portal Report Import** in the navigation bar.
   - Select offline fixture `Real 2026–27 AICTE Scrutiny Evaluation Report - GIITS.pdf` (or upload a PDF/JSON deficiency report).
   - Click **Generate Extraction Preview**: inspect extracted fields, source page numbers (pp. 1–6), mapping confidence scores (0.95–0.99), and SHA-256 immutable original report hash.
   - Click **Confirm Ingestion & Spawn Scoped Re-Scrutiny Task**: preserves original report immutable as Evidence V1 and creates task `RESCRUTINY-TASK-...` targeting only original deficiency IDs ($D1, D2$).
2. **Step 2 — Policy Administrator Workspace (`/admin/rules`):**
   - Switch persona to **Policy Administrator** (`admin@aicte.gov.in`).
   - Navigate to **Active Rules & Routing Registry**: browse active rules with physical and printed page citations.
   - Click **Edit Rule** on `ADD-2026-27-CH2-2.6C-NBA`: edit intake threshold in the draft editor and inspect the **Before / After Diff Viewer**.
   - Open the **Sandbox Route Simulator**: test intake expansion with $X=360$ and observe the unresolved ambiguity flag.
   - Open the **Conflict Register**: review documented regulatory divergences ($ELP\text{ 50\%}$, $X=360$, Hibernation timing) and their safe holding paths.

---

## 💻 Quick Start: Run Locally in Under 2 Minutes

The project requires **zero external database setup**. Its built-in transactional memory storage starts instantly out of the box.

### Prerequisites
- **Node.js**: v18 or v20 LTS
- **npm**: v9 or higher

### Commands (Copy & Paste)

```bash
# 1. Clone the repository
git clone https://github.com/Mayuresh-1306/SIH-2026-AICTE.git SIH-26-AICTE
cd SIH-26-AICTE

# 2. Install dependencies
npm install

# 3. Check TypeScript strictness (0 errors)
npx tsc --noEmit

# 4. Run automated regression & acceptance test suites
# Full retrofitted regression suite (36/36 passed)
npx vitest run tests/regression_retrofit_all_deliverables.test.ts

# Acceptance verification suites (22/22 passed)
npx vitest run tests/verification_t01_t16.test.ts tests/verification_t17_t22.test.ts

# Complete repository suite (325/325 passed across 27 files)
npx vitest run

# 5. Build and launch development server
npm run build
npm run dev
```

Open your browser to:  
👉 **`http://localhost:3000`**

### Live Production Deployment
Try the full application online without installing anything:  
🌐 **`https://niyamsetu-aicte.onrender.com`**

---

## 🧪 Automated Test Coverage (325 Tests / 27 Suites)

```
Test Files  27 passed (27)
     Tests  325 passed (325)
  Duration  9.91s (100% pass rate, 0 failed, 0 skipped)
```

- **`tests/regression_retrofit_all_deliverables.test.ts` (36 tests):** Verifies all 11 mandatory deliverables end-to-end, including decision preconditions, outcome alignment, HMAC-SHA256 integrity verification, and boundary hold conditions.
- **`tests/verification_t01_t16.test.ts` (16 tests):** Acceptance checks T01–T16 (tenant isolation, scrutiny scope-lock, human-only decisions, timer acceleration).
- **`tests/verification_t17_t22.test.ts` (6 tests):** Acceptance checks T17–T22 (authorized reverts, statutory notices, DSC signatures, compliance certificates).
- **`tests/policy/routing.test.ts` (37 tests):** Comprehensive route engine predicate tests across Table 2.3.
- **`tests/decisions/core.test.ts` (34 tests):** Decision transactions, authority guards, and speaking order verification.
- **`tests/security/auth.test.ts` (18 tests):** Session authentication, cookie security, RBAC scopes, and login attempt throttling.
- **`tests/core/http.test.ts` & `tests/core/commands.test.ts` (22 tests):** HTTP guards, transaction serialization, rollback semantics, and outbox isolation.

---

## ⚖️ Regulatory Traceability & Primary Sources

- **Primary Statutory Authorities**: All routes, rules, and workflows are anchored to the **AICTE Act 1987**, **AICTE Approval Process Handbook (APH 2024–2027)**, and **AY 2026–27 Addendum with Corrigendum Errata G02**.
- **Member 6 Research Status**: As documented in the repository checklist, no separate research file explicitly labelled *"Member 6"* was found in the repository or attachments; its contents were not invented or assumed.
- **Simulation Transparency**: All simulated external integrations (NSWS onboarding, emBridge Class-3 DSC token validation, mock notification dispatch, and HMAC SHA-256 digital document signing) carry prominent non-production prototype disclosures and never claim live sovereign API connections.

---

## 👥 Smart India Hackathon 2026

- **Problem Statement 26262**: AICTE Regulation Bureau — NiyamSetu (नियमसेतु)
- **Academic Year**: 2026–2027
- **Tracked Remotes**:
  - `origin`: `https://github.com/Mayuresh-1306/SIH-2026-AICTE.git` (Tracked master)
  - `personal`: `https://github.com/Parth-Chavan-15/SIH-2026-AICTE.git` (Backup deployment mirror)
- **Live Deployment**: [https://niyamsetu-aicte.onrender.com](https://niyamsetu-aicte.onrender.com)
- **Status**: High-Fidelity Transactional Prototype with In-Memory State Engines (AY 2026–27 | 325/325 Tests Passing)
