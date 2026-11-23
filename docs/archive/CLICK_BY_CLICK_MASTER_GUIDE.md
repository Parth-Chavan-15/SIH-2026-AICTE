# PravahReg / AICTE CaseFlow (PS 26262)
## Master Click-by-Click Demonstration & Verification Testing Guide

---

### Executive Overview & Regulatory Baseline
**PravahReg / AICTE CaseFlow** is the integrated digital companion platform for the **AICTE Regulation Bureau**, engineered strictly for **Smart India Hackathon (SIH) 2026 Problem Statement 26262**. It automates and monitors end-to-end technical education approval workflows under the **AICTE Approval Process Handbook (APH 2024–2027)** and the **2026–27 Updated Addendum & Final Errata (G02)**.

All workflows, notice templates, committee structures, and data models are grounded directly in the 12 authentic case files from `aicte_reference_vault/`, including the real 2026–27 Andhra Pradesh case **Gonna Institute of Information Technology and Sciences (GIITS), Visakhapatnam** (`1-46258917694`) and the 6-month faculty conditional clause precedent from **University BDT College of Engineering (UBDTCE Davangere, F.No. South-West/1-10970417826/2022/EOA)**.

---

### Quick Start: Local System Setup
```bash
# Terminal 1: Companion API Server (Express + Security Middleware + In-Memory/Mongo Vault)
npm run start:server
# Server listens on http://localhost:4000 (Health Check: http://localhost:4000/health)

# Terminal 2: Interactive Frontend (React 19 + Vite + Tailwind CSS + Lucide Icons)
npm run dev
# Application UI opens on http://localhost:3000
```

---

## 1. Quick-Switch Personas & RBAC Authentication Matrix

The platform implements authentic **Role-Based Access Control (RBAC)** backed by `HttpOnly`, `SameSite=Strict`, cryptographically signed session cookies, Origin verification, and strict tenant boundaries.

You can switch personas at any moment using the **Persona Quick-Switcher** located in the top-right banner or via standard credential login:

| Role | Synthetic Identity | Login Identifier | Purpose & Access Boundary |
|---|---|---|---|
| **Regional Officer** | Dr. R. K. Soni (SCRO) | `ro.scro@aicte-india.org` | South-Central Region case officer. Authorized to run desk scrutiny, record reverts, and verify regional documents. |
| **Bureau Officer** | Bureau Central Approval | `bureau.approval@aicte-india.org` | National-level authority across all 8 AICTE Regional Bureaus. Can view all cases, trigger reconciliations, and monitor SLAs. |
| **Institution User (College A)** | Principal GIITS | `principal@giits.edu.in` | **Tenant-Isolated**. Can ONLY view and upload compliance evidence for GIITS (`APP-2026-GIITS`). Strictly blocked from College E. |
| **Institution User (College E)** | Principal VJTI | `principal@vjti.ac.in` | **Tenant-Isolated**. Can ONLY view VJTI (`APP-2026-VJTI`). Blocked from viewing College A, B, C, or D. |
| **EVC Expert** | Prof. Sivasubramanian Velmurugan | `evc.expert@aicte-india.org` | Expert Visit Committee Chairman. Inspects infrastructure, verifies 30-min walkthrough video + GPS coordinates, and submits EVC reports. |
| **Decision Authority** | Executive Committee Member | `ec.member@aicte-india.org` | Demo Authority with `decision.record` permission to issue final Letters of Approval (LoA), EoA, or Speaking Orders. |
| **Platform Administrator** | Super Admin | `superadmin@aicte-india.org` | Full access to policy configurations, canonical resets, WORM audit inspection, and system health monitors. |

---

## 2. Top-Level Navigation Walkthrough (8 Core Tabs)

### Tab 1: Dashboard (`/dashboard`)
* **Click KPI Tiles:**
  - `Total Active Applications` (5 canonical cases loaded)
  - `Under Scrutiny` (Desk evaluation underway)
  - `EVC Inspections Pending` (On-site visit scheduled)
  - `Time-Bound Undertakings` (Trackers for lease, fire safety NOC, faculty deficit)
  - `SLA Overdue` (Breached operational SLA alerts)
* **Ageing Distribution & Stage Velocity:** Interactive horizontal progress chart displaying application wait-time distributions across stages (`0–7 Days`, `8–14 Days`, `15–30 Days`, `>30 Days`).
* **Regional Bureau Workload & SLA Adherence:** Bar graph tracking active cases vs overdue cases across the 8 AICTE Regional Offices (South-Central, Western, Northern, Eastern, South-Western, etc.).
* **"Generate Consolidated 6-Category Reports" Button:**
  - Click the dark blue button in the upper header.
  - A modal opens rendering all 6 regulatory reports prescribed by PS 26262 Domain E:
    1. *Stage-Wise Pendency & Processing Bottlenecks*
    2. *EVC Scheduling & Completion Timelines*
    3. *Time-Bound Undertakings & Compliance Deficits (APH §2.25(c)/(f))*
    4. *Prescribed Documents & 60-Day Renewal Warnings*
    5. *Overdue Cases & Bureau Escalation Registry*
    6. *8 Regional AICTE Bureaus Processing Performance*
  - Click **"Trigger Siebel Downstream Sync"** to simulate bi-directional export to Siebel CRM.
  - Click **"Close Report"** to return.

---

### Tab 2: Applications Pipeline (`/applications`)
* **Search & Filters:**
  - Type `GIITS`, `COEP`, `PDIMTR`, `EVIT`, or `VJTI` in the search box to filter in real-time.
  - Filter by Region (`All`, `South-Central`, `Western`, `Eastern`).
  - Filter by Application Type (`Increase in Intake`, `Extension of Approval`).
  - Filter by Stage (`Scrutiny in Progress`, `Deficiency Communicated`, `EVC Scheduled`, `Approval Issued`, `Draft`).
* **Application Card Clicks:**
  - Clicking any row or the **"View Case Dossier"** button opens the **11-Tab Deep Dossier Modal**.
  - Notice the **SLA Badges**: `Within Prescribed SLA` (Green), `Approaching SLA` (Amber), or `Overdue SLA` (Red).

---

### Tab 3: Scrutiny Queue (`/scrutiny`)
* Displays cases actively awaiting desk verification.
* Select **GIITS (APP-2026-GIITS)**:
  - See Scrutiny Snapshot `2-SOC1770029225` (Round 1).
  - Verify Scrutiny Committee: **Prof. Maheshwari Prasad Singh (NIT Patna)** & **Prof. Rakesh Kumar (Central University of Haryana)**.
  - Inspect items:
    - `C3` (Land Conversion/Clear Title Deed) — **Accepted**
    - `C4` (Municipal Structural Stability & Occupancy) — **Accepted**
    - `D1` (Cadre Ratio Shortfall in CSE/IT) — **Deficient** (shortfall of 2 Professors)
    - `D2` (Fire NOC Expiring in 14 days) — **Deficient** (<60-day renewal threshold)
  - Notice deficiency communication banner formatted per **APH 2024–27 §1.8(f)–(g)**.

---

### Tab 4: EVC Queue (`/evc`)
* Dedicated module for Expert Visit Committee management.
* Select scheduled case `APP-2026-GIITS`:
  - **Inspection Task:** `2-SOC1774344316` scheduled for 28-OCT-2026.
  - **Committee Roster:** Prof. Sivasubramanian Velmurugan (Chairman, NIT Calicut), Assoc. Prof. Hareesh K (Member, KK Govt Engg College), Architect Md. Danish (CoA Nominee, NIT Patna).
  - **SLA Guardrail:** Clearly marked as `Configured Operational SLA (Simulated): 14 Days [Chapter II Existing Institution EoA]`.
  - **Click "View Geo-Tagged Evidence":**
    - Displays authentic coordinates: `17° 42' 7" N, 83° 6' 47" E` (`17.702834° N, 83.113288° E`, Gonnavanipalem, Parawada Mandal, Visakhapatnam).
    - Link to 30-minute walkthrough MP4 stream per **AICTE Act §11(2)** & **APH §1.9 / §2.23.2**.

---

### Tab 5: Compliance & Undertakings (`/compliance`)
* Monitors post-approval conditional undertakings for **Prerna / Univ BDT College of Engineering (PDIMTR)** (`APP-2026-PDIMTR`):
  1. `OBL-PDIMTR-LEASE`: 30-year Land Lease expiring 05-NOV-2026 (12 days remaining).
  2. `OBL-PDIMTR-FIRE-NOC`: 1-Year Fire Safety NOC requiring 60-day advance renewal submission (expiring 24-NOV-2026).
  3. `OBL-PDIMTR-FACULTY`: 6-Month Faculty Appointment Undertaking (UBDTCE Davangere Precedent, `F.No. South-West/1-10970417826/2022/EOA` per **APH §2.25(c)/(f)**).
* **Click "Simulate Clock Forward (+15 Days)":**
  - Land Lease timer advances into **Overdue / Expired** state.
  - Automated escalation notification is generated to Regional Bureau.

---

### Tab 6: Pendency & Escalations (`/pendency`)
* Real-time automated escalation matrix under PS 26262 Domain B & C:
  - Level 1: Regional Scrutiny Cell (0–7 days)
  - Level 2: Regional Officer / Director (8–14 days)
  - Level 3: AICTE Member Secretary / Executive Committee (>14 days)
* Highlights cases with breached operational SLAs, displaying exact elapsed days, responsible officer, and automated escalation dispatch timestamps.

---

### Tab 7: Configuration & Policies (`/configuration`)
* Transparent regulatory engine inspection:
  - **Policy Revision:** `POL_2026_INTAKE_NON_NBA` (APH 2026–27 Errata G02 p. 42: Non-NBA intake increase requires Scrutiny + Re-Scrutiny + EVC).
  - **Policy Revision:** `POL_2026_INTAKE_NBA` (APH 2026–27 Errata G02: Valid NBA skips EVC).
  - **Boundary Rule Check:** Highlights **East Valley Institute of Technology (EVIT)** (`APP-2026-EVIT`), where intake increase `X = 360` falls outside handbook Table 2.3 limits and automatically transitions to `policy_review_required`.

---

### Tab 8: Audit Trail (`/audit`)
* Immutable, append-only **WORM (Write Once, Read Many)** audit ledger.
* Every intake, desk verification, stage transition, revert, and decision logs:
  - Unique Audit Event ID (e.g., `AUDIT-GENESIS-2026`)
  - Timestamp (ISO 8601 UTC)
  - Authenticated Actor ID & IP address
  - Before-State & After-State
  - Evidence Version IDs
  - SHA-256 cryptographic digest ensuring tamper evidence

---

## 3. Application Dossier Deep-Dive: The 11 Inner Tabs

Open any application (e.g., **GIITS**, `APP-2026-GIITS`) to reveal the 11-tab operational dossier modal:

```
[Overview] [Route & Policy] [Documents] [Scrutiny] [EVC Inspection] [EC Decision]
[Compliance & Closure] [Audit Logs] [Case Summary & Notices] [DSC Verification] [Ecosystem Adapters]
```

### Action Bar (Modal Header Buttons)
* **"Return / Revert" (Amber Button):**
  - Available to `regional_officer`, `bureau_officer`, and `admin`.
  - Click to open the **Authorized Stage Return/Revert Modal**.
  - Select Target Stage: `Initial Submission`, `Scrutiny Stage`, `Correction Window`, `Re-Scrutiny Stage`, `EVC Queue`.
  - Enter substantive regulatory reason (enforces minimum 5 characters per **APH §1.8(f)–(g) & §2.23.1**).
  - Click **"Confirm & Record Revert"** -> Immediately transitions stage and appends an immutable `APPLICATION_REVERTED` audit record.
* **"Vault Scrutiny PDF" (Blue Button):**
  - Streams the official 95-page `Real 2026–27 AICTE Scrutiny Evaluation Report - GIITS.pdf` directly from `aicte_reference_vault/`.
  - Protected by session authorization (returns 403 to unauthorized actors).
* **"Export Proforma" (Gray Button):**
  - Downloads a machine-readable summary proforma for archival.

---

### Detailed Inner Tab Breakdown

#### Inner Tab 1: Application Overview
* Summary card displaying Application Permanent ID (`1-6055691`), Reference (`1-46258917694`), Region (`South-Central`), Session (`2026-2027`), and Sponsoring Body (`Sri Veera Jagannadha Educational Society`).
* Stage progress stepper visualizing current position in the approval lifecycle.

#### Inner Tab 2: Route Policy & Rule Provenance
* Displays exact rule evaluation tree.
* Shows why EVC was mandated: *"APH 2026-27 Errata G02 §2.6: Non-NBA intake increase requires Scrutiny + Re-Scrutiny + EVC"*.
* Cites official source document `DOC-APH-2026-ERRATA` (p. 42 §2.6(c)(1)).

#### Inner Tab 3: Document Verification (5-State Lifecycle)
* Real-world verification table for uploaded statutory items:
  1. `DOC-C3`: Registered Land Conversion Deed (30-year lease) — Status: **Verified**
  2. `DOC-C4`: Municipal Structural Safety Certificate — Status: **Verified**
  3. `DOC-D1`: Faculty Cadre Table & Biometric Muster — Status: **Deficient**
  4. `DOC-D2`: State Fire Services Safety NOC — Status: **Deficient**
* Click **"Verify Evidence"** or **"Mark Deficient"** to test state mutations.

#### Inner Tab 4: Scrutiny Checklists & Findings
* Detailed breakdown of Round 1 Scrutiny Snapshot `2-SOC1770029225`.
* Verified by Scrutiny Committee: Prof. Maheshwari Prasad Singh & Prof. Rakesh Kumar.
* Deficiencies clearly highlighted with regulatory remedy instructions for the institute.

#### Inner Tab 5: Expert Visit Committee (EVC) & Geotagged Verification
* Complete EVC details:
  - Committee: Prof. Sivasubramanian Velmurugan (NIT Calicut), Assoc. Prof. Hareesh K (KK Govt Engg College), Architect Md. Danish (NIT Patna).
  - **Campus GPS Coordinates:** `17° 42' 7" N, 83° 6' 47" E (17.702834° N, 83.113288° E)` (Gonnavanipalem, Parawada Mandal, Visakhapatnam).
  - **Operational SLA Badge:** `Configured Operational SLA (Simulated): 14 Days [Chapter II Existing Institution EoA]`.
  - Infrastructure score (88/100), Laboratory score (85/100), Faculty muster score (72/100).

#### Inner Tab 6: Executive Committee Decision & Speaking Order
* Reserved for `demo_authority` (Executive Committee Member).
* Allows recording of final statutory outcome:
  - `Approved (Full EoA / LoA)`
  - `Conditionally Approved (Subject to Undertakings)`
  - `Rejected (Issue Speaking Order / Letter of Rejection)`
* Form generates formal regulatory orders citing **APH 2024–27 §1.10(b), §1.11(a), §2.23.3, §2.24(a), and §2.25(c)/(i)** with statutory **7-day SAC appeal window**.

#### Inner Tab 7: Compliance Undertakings & Authorized Closure
* Manages post-approval conditional obligations.
* **"Authorize Case & Obligation Closure" (Green Button):**
  - Available to `regional_officer`, `bureau_officer`, and `admin`.
  - Click button to execute formal closure under **APH §2.25(c)/(f)**.
  - Verifies all obligations, discharges conditions, marks case as closed, and records WORM audit digest.

#### Inner Tab 8: Audit Trail & Tamper Evidence
* In-modal chronological log of all interactions specific to this application.
* Shows user ID, timestamp, before/after states, and SHA-256 cryptographic hashes.

#### Inner Tab 9: Electronic Case Summary & 5 Standardised Statutory Notices
* Built strictly to fulfill **PS 26262 Domain A (Bullet 4)**.
* Click the sub-tabs to inspect all 5 standardized statutory notices with 100% authentic citations:
  1. **`SCRUTINY_SCHEDULE_INTIMATION`**: Cites *APH 2024–27 §1.8(b) & §1.8(c) (p. 7)* (Intimation of Scrutiny Committee date, time, and login links).
  2. **`PORTAL_DEFICIENCY_COMMUNICATION`**: Cites *APH 2024–27 §1.8(f)–(g) (p. 7) & §2.4 / §2.23.1 (pp. 15, 29)* (Communication of deficiencies post-scrutiny with correction window).
  3. **`EVC_INSPECTION_INTIMATION`**: Cites *AICTE Act, 1987 Section 11(2) (Preamble p. xii) & APH 2024–27 §1.9 / §2.23.2 (pp. 8, 29)* (Inspection intimation with 30-min video and GPS verification).
  4. **`CONDITIONAL_EOA_UNDERTAKING`**: Cites *APH 2024–27 §2.25(c) & §2.25(f) (p. 31) + 2026–27 Addendum G02 §2.25(f) (PDF p. 11)* + *Conditional EoA Clause (UBDTCE Davangere Precedent, F.No. South-West/1-10970417826/2022/EOA)* (Conditional approval subject to time-bound fulfillment).
  5. **`SPEAKING_ORDER_OR_LOD`**: Cites *APH 2024–27 §1.10(b) (p. 8), §1.11(a) (p. 9), §2.23.3 & §2.24(a) (p. 29), and §2.25(c)/(i) (p. 31)* (Formal Speaking Order with 7-day Standing Appeal Committee window).

#### Inner Tab 10: Class-3 DSC & mSigner Digital Signature Verification
* Simulates authentic **AICTESigner / mSigner Class-3 Digital Signature Certificate (DSC)** token verification:
  - View certificate serial number, issuer (`e-Mudhra / CCA India`), algorithm (`SHA-256 with RSA 2048-bit`), and validity.
  - Test validation check: verifies signer PAN matches the Head of Institution declaration.
  - Blocks submission if unsigned or invalid token is supplied (enforcing HTTP 422).

#### Inner Tab 11: Ecosystem Adapter Bridge (External Registries & Downstream Siebel Sync)
* Transparent boundary layer integrating the 5 external ecosystem adapters:
  1. `External Statutory Registries Sync`: Real-time cross-checks with National Building Code (NBC), State Fire Services, Municipal Land Records, and NBA accreditation databases.
  2. `Committee Auto-Selection Engine`: Implements conflict-of-interest filters, preventing experts from inspecting institutions in their own state or alumni affiliations.
  3. `Siebel Downstream Sync Adapter`: Manages bi-directional hand-off with legacy Siebel CRM portal.
  4. `NSWS Single Window Ingestion Adapter`: Ingests investor login and PAN identity tokens.
  5. `DigiLocker / Aadhaar e-Sign Adapter`: Verifies faculty PAN and biometric records.
* Every adapter displays honest architectural metadata:
  - `Integration Mode`: `SIMULATED_COMPANION_ADAPTER`
  - `Evidence State`: `SOURCE_STATUS_OBSERVED`
  - `Authoritative Owner`: `AICTE Regulation Bureau`
  - `Sync Status`: `SYNCHRONIZED`

---

## 4. Master Acceptance Testing Script (T01–T22 Verification)

To prove 100% compliance during an evaluation or hackathon jury demonstration, execute these test sequences:

| Test ID | Objective | Manual Click Sequence | Expected Result |
|---|---|---|---|
| **T01** | **Tenant Isolation** | 1. Switch persona to `principal@giits.edu.in`.<br>2. Try opening `APP-2026-VJTI` via URL or direct call.<br>3. Inspect table view. | VJTI is completely hidden. Direct API access returns `403 Forbidden` (`INSUFFICIENT_SCOPE`). |
| **T02** | **Vault PDF Security** | 1. Log in as `ro.scro@aicte-india.org`.<br>2. Click **"Vault Scrutiny PDF"**.<br>3. Test while unauthenticated. | Authenticated stream serves the 95-page GIITS PDF. Unauthenticated access returns `401 Unauthorized`. |
| **T03** | **NSWS / Siebel Ingestion** | 1. Open Inner Tab 11 (Ecosystem Adapters).<br>2. Inspect NSWS Ingestion details. | Displays NSWS Reference `NSWS-2026-SCRO-101` and Siebel Portal 8-step hand-off state. |
| **T08** | **5-State Document Lifecycle** | 1. Open Inner Tab 3 (Documents).<br>2. Click **"Verify Document"** on `DOC-C3`. | Document transitions through `Draft` -> `Uploaded` -> `Under Verification` -> `Verified` with audit log. |
| **T09** | **Boundary Condition Trap (X=360)** | 1. Open Applications list.<br>2. Find **East Valley Institute of Technology (EVIT)**. | Status shows `Draft / policy_review_required` because intake increase 360 is unexpressed in Table 2.3. |
| **T11** | **Clock Advance & Suppression** | 1. Go to Tab 5 (Compliance).<br>2. Note pending alerts.<br>3. Advance clock +15 days. | Expired lease triggers overdue escalation; verified items do not re-alert. |
| **T18** | **Authorized Revert Guardrails** | 1. Log in as `ro.scro@aicte-india.org`.<br>2. Open GIITS case.<br>3. Click **"Return / Revert"**.<br>4. Leave reason blank.<br>5. Enter 10-char reason and submit. | Blank reason is blocked with validation error. Valid reason reverts case and logs APH §1.8(f) audit event. |
| **T19** | **5 Statutory Notices** | 1. Open Inner Tab 9 (Case Summary & Notices).<br>2. Click through all 5 notice tabs. | All 5 notices render authentic APH 2024–27 clauses and institutional metadata. |
| **T20** | **Class-3 DSC Signature** | 1. Open Inner Tab 10 (DSC Verification).<br>2. Test submission with unsigned payload.<br>3. Submit with valid simulated token. | Unsigned payload returns `422 Unprocessable Entity`; valid token succeeds with SHA-256 verification. |
| **T21** | **Statutory Registry Sync** | 1. Open Inner Tab 11 (Ecosystem Adapters).<br>2. Check Committee Roster. | Roster reflects real 2026–27 experts with COI rules enforced. |
| **T22** | **Consolidated Reports & Closure** | 1. On Dashboard, click **"Generate 6-Category Reports"**.<br>2. In GIITS dossier, click **"Authorize Case & Obligation Closure"**. | 6-category modal renders full metrics; closure marks all obligations resolved under APH §2.25(c)/(f). |

---

## 5. Automated Verification Summary

All 277 automated tests run continuously and verify full compliance across all layers:
```bash
npx vitest run
# Test Files  25 passed | 1 skipped (26)
# Tests       277 passed | 12 skipped (289)
# Duration    19.21s

npx tsc --noEmit
# 0 errors

npm run build
# Built client production bundle in ~580ms
```
