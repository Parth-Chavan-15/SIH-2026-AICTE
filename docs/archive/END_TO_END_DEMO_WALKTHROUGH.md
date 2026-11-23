# AICTE CaseFlow (PravahReg) — End-to-End Master Demonstration Walkthrough
### Smart India Hackathon (SIH) 2026 — Problem Statement 26262 (AICTE Regulation Bureau)

---

## 🏛️ Executive System Overview

**AICTE CaseFlow (PravahReg)** is a unified, regulatory-grade digital governance platform built strictly according to:
- **AICTE Approval Process Handbook (APH) 2024–2027**
- **2026–2027 Updated Addendum & Final Errata (G02)**
- **Section 8.2 of the SIH Master Engineering Specification** (Zero-Trust 6-Role Architecture)
- Real-world AICTE inspection cases: *GIITS (`2-SOC1770029225`), MCET, UBDTCE, and AAA College*.

The prototype runs locally on **`http://localhost:3000`** with real HTTP cookie authentication, immutable WORM audit logging, a dynamic Policy Registry, and zero 1-click bypasses.

---

## 👥 The 6 Statutory Regulatory Roles & Authentic Credentials

All accounts use the standard password: **`password123`**.  
On the login screen (`http://localhost:3000`), click the **"Select"** button next to any role to pre-fill its credentials, then click **"Authenticate Session"**.

| Role # | Official Regulatory Role Title | Login Email | What They Do in the Flow | What They Are Legally Blocked From Doing | Statutory Citation |
|---|---|---|---|---|---|
| **1** | **Institution (Applicant)** | `principal@coep.ac.in` | Submits applications, uploads deficiency corrections, submits post-approval lease renewals. | Cannot edit unflagged items during re-scrutiny; cannot change policy; cannot approve self. | APH §1.8, Annexure 7 |
| **2** | **Scrutiny Reviewer (Committee)** | `scrutiny.reviewer@aicte.gov.in` | Evaluates checklist items, marks D1/D2 vs C3, signs immutable Snapshot v1, re-evaluates. | **Blocked by APH §1.8(g)**: Cannot reopen or fail an item (C3) cleared in initial scrutiny. | APH §1.8(g), p. 7 |
| **3** | **EVC Coordinator / Member** | `evc.chair@aicte.gov.in` | Views eligible EVC queue, schedules dates, inspects GPS/video evidence, signs EVC report. | Cannot self-constitute committees (Council mandate); cannot see scrutiny cases; cannot grant approval. | G02 pp. 2–3, AICTE Act §11(2) |
| **4** | **Regional / Bureau Officer (RO / RB)** | `ro.western@aicte.gov.in` | Monitors stage-wise pendency, desk ageing, escalations; verifies post-approval compliance/lease proofs. | Cannot grant statutory approval (LoA/EoA); cannot waive handbook penalties. | APH Chapter I & II |
| **5** | **Competent Authority User** | `bureau.approval@aicte.gov.in` | Final statutory human decision gate: reviews complete evidence dossier, issues signed EoA/LoA. | Cannot be automated or bypassed by AI; cannot decide until prior stages are digitally signed. | AICTE Act §10, 11 |
| **6** | **System Policy Administrator** | `admin@aicte.gov.in` | Publishes APH rule versions into Policy Engine, configures SLA timers and intake norms. | Cannot silently overwrite active policy; cannot retroactively alter in-flight case rules. | APH 2024–27 Chapter X |

---

## 🔄 The Continuous 8-Stage Regulatory Demonstration Flow

```
[1. Upstream Intake: NSWS & AICTE Siebel Hand-Off]
                   │
                   ▼
[2. Policy Registry Engine] ──► Pins APH 24–27 & 2026–27 Errata Rule Version
                   │             & Computes Route (e.g., NBA Fast-Path vs. EVC vs. X=360 Hold)
                   ▼
[3. Initial Scrutiny Stage] ──► Committee signs Snapshot v1 (e.g., GIITS 2-SOC1770029225)
                   │             marking D1/D2 deficient & C3/C4 accepted
                   ▼
[4. Re-Scrutiny Stage] ──────► Server Guard enforces APH §1.8(g): D1/D2 editable, C3 locked read-only
                   │             (Unauthorized tamper attempt returns HTTP 409 Conflict)
                   ▼
[5. Conditional EVC / SAC] ──► EVC Inspection (GPS/Video checked) or SAC Hearing if required
                   │             (Valid NBA-accredited courses automatically bypass EVC per G02 p. 42)
                   ▼
[6. Competent Authority Gate] ► Human Statutory Role records Decision (EoA / Conditional / Rejection)
                   │             (Ordinary admins blocked with HTTP 403 Forbidden)
                   ▼
[7. Post-Approval Compliance] ─► Atomically spawns Undertakings & Lease Expiry Trackers
                   │             (Triggering 4-clock timers & 5-state document verification)
                   ▼
[8. Live Monitoring & Alerts] ─► Stage ageing, clock simulator (+15d), stale alert suppression & sync
```

---

### STAGE 1: Upstream Intake, Tenant Isolation & Case Ingestion

#### Objective:
Prove multi-tenant isolation, upstream NSWS / AICTE Siebel adapter ingestion, and initial institutional application submission.

1. **Open the Login Portal**: Navigate to `http://localhost:3000`.
2. **Authenticate as Role 1**:
   - In the Role Table, click **Select** next to **`1. Institution (Applicant)`** (`principal@coep.ac.in`).
   - Click **Authenticate Session**.
3. **Verify Tenant Isolation (Acceptance Test T01)**:
   - Click on the **"Applications"** tab in the sidebar.
   - You will see College A (`APP-2026-COEP-001`, College of Engineering Pune).
   - Notice that College E (`APP-2026-VJTI-005`, VJTI Mumbai) is **strictly invisible**.
   - *Regulatory Guard*: Institutions are sandboxed to their own `institutionId`. Cross-tenant data leakage is cryptographically and logically blocked at the API gateway.
4. **Inspect Upstream Adapter Intake (Acceptance Test T03)**:
   - Click on the **"Intake & Adapter"** tab in the sidebar.
   - Observe the live adapter bridge simulating the **National Single Window System (NSWS)** and **AICTE Siebel CRM**:
     - *NSWS Investor Hand-Off*: Demonstrates PAN verification, Corporate Affairs validation, and seamless SSO hand-off.
     - *Siebel Ingestion*: Ingests raw XML/JSON application records into the clean companion layer without modifying existing legacy schemas.
5. **Log Out**:
   - Click the user badge at the top right $\rightarrow$ **Logout**.

---

### STAGE 2: Policy Registry Engine & Statutory Route Computation

#### Objective:
Demonstrate automated statutory policy pinning (APH 2024–27 & 2026–27 Errata G02) and route calculation: NBA Fast-Path vs. Mandatory EVC vs. X=360 Boundary Hold.

1. **Authenticate as Role 6**:
   - On the login screen, click **Select** next to **`6. System Policy Administrator`** (`admin@aicte.gov.in`).
   - Click **Authenticate Session**.
2. **Open the Policy Engine**:
   - Click on the **"Policy Engine"** tab in the sidebar.
3. **Inspect Pinned Rule Versions**:
   - Active Policy: **`APH 2024–2027 with 2026–2027 Errata (G02)`** (Effective Academic Year 2026–27).
   - Notice the rule parameters:
     - `NBA_FAST_PATH_ALLOWED = true` (APH 2026–27 Addendum G02 p. 42).
     - `MAX_INTAKE_PER_PROGRAM = 360` (Statutory ceiling boundary).
     - `RE_SCRUTINY_LOCK_RULE = APH_1_8_G` (Immutable cleared checklist locking).
4. **Understand the 3 Dynamic Routes**:
   - **Route 1: Mandatory EVC**: College A ("North Tech" / COEP intake expansion without NBA) $\rightarrow$ Pinned to `APH §2.1.4`, triggers mandatory physical/virtual inspection.
   - **Route 2: NBA Fast-Path (EVC Bypass)**: College B ("South Institute", $\ge 670$ NBA score) $\rightarrow$ Pinned to `G02 p. 42`, automatically bypasses the EVC queue directly to the Competent Authority!
   - **Route 3: The $X = 360$ Boundary Trap**: College D applies for expansion to 360 seats $\rightarrow$ Policy engine flags `THRESHOLD_BOUNDARY_HOLD` requiring executive committee clearance.
5. **Policy Immutability Protection**:
   - The Policy Engine strictly rejects in-flight schema mutations, ensuring no college is judged by rules enacted after their submission timestamp.
6. **Log Out**:
   - Top right user badge $\rightarrow$ **Logout**.

---

### STAGE 3: Initial Scrutiny Stage (Snapshot v1 & Deficiency Memo)

#### Objective:
Evaluate institutional checklists, mark deficiencies (D1/D2) vs cleared items (C3/C4), generate cryptographic Snapshot v1, and issue statutory Deficiency Memo.

1. **Authenticate as Role 2**:
   - On the login screen, click **Select** next to **`2. Scrutiny Reviewer (Committee)`** (`scrutiny.reviewer@aicte.gov.in`).
   - Click **Authenticate Session**.
2. **Open Initial Scrutiny Review**:
   - Navigate to **"Applications"** tab $\rightarrow$ Click on **`APP-2026-COEP-001`** (or GIITS case `2-SOC1770029225`).
   - The **Application Detail Modal** opens.
3. **Execute Checklist Evaluation**:
   - Inspect the statutory documents:
     - **Item D1 (Registered Land Lease Deed / Land Use Certificate)**: Mark as **`Deficient`** (Reason: *"Lease period less than 30 years mandated under APH Annexure 1"*).
     - **Item D2 (Faculty Cadre Ratio & Cadre Roster)**: Mark as **`Deficient`** (Reason: *"Cadre ratio 1:2.4 below APH standard; 2 Associate Professor vacancies unfulfilled"*).
     - **Item C3 (Fire Safety Certificate / NOC)**: Mark as **`Accepted`** (Fire NOC valid and issued by Competent State Authority).
     - **Item C4 (Approved Building Plan & Occupancy Certificate)**: Mark as **`Accepted`** (Municipal Corporation approval verified).
4. **Sign & Seal Snapshot v1**:
   - Click **"Sign & Seal Scrutiny Snapshot v1"**.
   - The platform creates an immutable, cryptographically sealed record (`Snapshot v1 Hash: SHA-256`).
   - The application transitions to status: **`DEFICIENCIES_COMMUNICATED`**.
   - An official **Statutory Deficiency Memo (APH Annexure 7)** is generated with an automated 10-day cure window.
5. **Log Out**:
   - Top right user badge $\rightarrow$ **Logout**.

---

### STAGE 4: Differential Re-Scrutiny Stage (Strict APH §1.8(g) Enforcement)

#### Objective:
Demonstrate the core regulatory USP of our platform: institutions can only upload corrections for flagged items, and reviewers are legally blocked from reopening previously cleared items.

1. **Step 4A: Institution Submits Compliance Proofs**:
   - Log in as **`1. Institution (Applicant)`** (`principal@coep.ac.in`).
   - Open **`APP-2026-COEP-001`**.
   - Notice the UI enforcement:
     - Items **C3 & C4** are completely locked with the green checkmark: *"Cleared in Initial Scrutiny — Locked"*.
     - Items **D1 & D2** display active upload slots:
       - For D1: Upload corrected 30-year registered lease deed document.
       - For D2: Upload faculty appointment compliance ledger & joining reports.
     - Click **"Submit Deficiency Compliance for Re-Scrutiny"**.
   - Log out.

2. **Step 4B: Reviewer Differential Re-Scrutiny**:
   - Log in as **`2. Scrutiny Reviewer (Committee)`** (`scrutiny.reviewer@aicte.gov.in`).
   - Open **`APP-2026-COEP-001`**.
   - The Differential Re-Scrutiny View displays:
     - Items **D1 & D2**: The reviewer reviews the new uploaded proofs and changes status to **`Cleared / Accepted`**.
     - Item **C3 (Fire NOC)**: Notice the Amber Regulatory Lock Banner:
       > 🛡️ **APH §1.8(g) Statutory Guard**:  
       > *"During Re-Scrutiny, the scrutiny committee shall ONLY scrutinize the documents for which deficiencies were communicated in the first scrutiny. Documents previously cleared cannot be reopened or re-evaluated."*
     - The status of C3 is completely disabled from modification in the UI.
3. **Step 4C: Verify Backend 409 Conflict Rejection (Tamper Test)**:
   - *Technical USP*: If a rogue actor bypasses the frontend and attempts to send a `PUT /api/v1/scrutiny/evaluate` payload marking C3 as deficient, the backend `validateCorrections` module immediately intercepts the call and rejects it with:
     ```json
     HTTP 409 Conflict: {
       "code": "APH_CLAUSE_1_8_G_VIOLATION",
       "error": "Item C3 was cleared in initial scrutiny snapshot v1 and cannot be modified during re-scrutiny."
     }
     ```
4. **Sign & Complete Re-Scrutiny**:
   - Click **"Sign & Seal Re-Scrutiny Evaluation"**.
   - Application advances to the next regulatory phase!
   - Log out.

---

### STAGE 5: Conditional EVC Inspection & SAC Hearing

#### Objective:
Demonstrate EVC queue scheduling, geo-tagged coordinate validation (`17° 42' 7" N, 83° 6' 47" E`), video inspection logs, and NBA Fast-Path bypass verification.

1. **Authenticate as Role 3**:
   - On the login screen, click **Select** next to **`3. EVC Coordinator / Member`** (`evc.chair@aicte.gov.in`).
   - Click **Authenticate Session**.
2. **Open the EVC Operational Queue**:
   - Click on the **"EVC Queue"** tab in the sidebar.
   - **Inspect Queue Entries**:
     - College A (`APP-2026-COEP-001`): Present in the queue awaiting inspection assignment.
     - College B (`APP-2026-NBA-002`): **NOT in the queue!**  
       *Notice the badge*: "NBA Fast-Path: Bypassed EVC per APH 2026–27 Errata G02 p. 42".
3. **Record EVC Inspection for College A**:
   - Click **"Schedule / Record Inspection"** on College A.
   - **Geo-Tagging Verification**:
     - Inspect latitude & longitude coordinates: `17° 42' 7" N, 83° 6' 47" E` (extracted from real GIITS EVC report `2-SOC1774344316`).
     - System performs boundary check verifying photos were taken inside the campus perimeter.
   - **30-Minute Video Walkthrough**:
     - Verify timestamped video hash for laboratories, instructional areas, and library.
   - **Score Infrastructure**:
     - Mark Laboratory Facilities: *Compliant*.
     - Mark Barrier-Free Built Environment & Lift Facilities: *Compliant*.
   - Click **"Submit Signed EVC Inspection Report"**.
   - Application moves to status: **`PENDING_COMPETENT_AUTHORITY`**.
4. **Log Out**:
   - Top right user badge $\rightarrow$ **Logout**.

---

### STAGE 6: Competent Authority Decision Gate (Statutory LoA / EoA)

#### Objective:
Demonstrate the human statutory decision gate: unauthorized users are blocked with HTTP 403, and the authorized Competent Authority reviews full evidence before issuing digital approval.

1. **Step 6A: Verify Security Authorization Gate (Negative Test)**:
   - Log in as **`6. System Policy Administrator`** (`admin@aicte.gov.in`) or **`4. Regional Officer`** (`ro.western@aicte.gov.in`).
   - Open **`APP-2026-COEP-001`**.
   - Notice that the **"Record Statutory Approval Decision"** button is **completely absent**.
   - If an unauthorized user attempts a POST to `/api/v1/decisions`, the server responds with **`403 Forbidden: INSUFFICIENT_STATUTORY_AUTHORITY`**.
   - Log out.

2. **Step 6B: Authorized Competent Authority Approval**:
   - Log in as **`5. Competent Authority User`** (`bureau.approval@aicte.gov.in`).
   - Open **"Applications"** $\rightarrow$ Click on **`APP-2026-COEP-001`**.
   - The Competent Authority Dossier View displays:
     - Initial Scrutiny Snapshot v1 (Sealed & Verified).
     - Differential Re-Scrutiny Clearance (Sealed & Verified).
     - EVC Inspection Summary & Geo-coordinates (Sealed & Verified).
3. **Record Final Approval Decision**:
   - In the Decision Panel, select: **"Grant Extension of Approval (EoA) for AY 2026–27"**.
   - Set Approval Validity: *1 Academic Year*.
   - **Digital Signature Token**: Class-3 DSC token hash is automatically verified (`AICTESigner-SHA256`).
   - Click **"Issue Statutory Approval Order (EoA)"**.
   - The official **AICTE Extension of Approval Letter** is generated!
   - Log out.

---

### STAGE 7: Post-Approval Compliance & Undertaking Engine

#### Objective:
Demonstrate how granting approval atomically spawns 3 statutory obligations, 4-clock timers, and initiates the 5-state document verification lifecycle.

1. **Authenticate as Role 4**:
   - On the login screen, click **Select** next to **`4. Regional / Bureau Officer (RO / RB)`** (`ro.western@aicte.gov.in`).
   - Click **Authenticate Session**.
2. **Open Compliance & Undertakings View**:
   - Click on the **"Compliance & Obligations"** tab in the sidebar.
3. **Inspect the 3 Atomically Spawned Statutory Trackers**:
   - The moment the Competent Authority approved College A, the backend companion engine atomically spawned:
     1. **Land Lease Deed Maintenance Tracker**:
        - Mandatory validity: 30 years (APH Annexure 1).
        - Tracks lease expiry date and annual ground rent receipts.
     2. **Fire Safety NOC Annual Renewal Tracker**:
        - Mandatory validity: 1 year.
        - **60-Day Advance Renewal Rule**: Statutory alert fires 60 days before expiry to prevent campus closure.
     3. **Faculty Shortfall Cadre Replacement Undertaking**:
        - Mandatory compliance period: 6 months (per GIITS SAC directive).
        - Tracks appointment of 2 Associate Professors with biometric proof.
4. **Demonstrate 5-State Document Lifecycle (Acceptance Test T08)**:
   - State Machine: `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Deficient` $\rightarrow$ `Resubmitted` $\rightarrow$ `Verified`.
   - The Regional Officer reviews the submitted compliance proofs and clicks **"Verify Document"**.
   - The status transitions to **`VERIFIED`**.
5. **Keep logged in** for Stage 8!

---

### STAGE 8: Live Monitoring, Clock Advance & Stale Alert Suppression

#### Objective:
Demonstrate stage-wise pendency ageing, live SLA escalation, clock simulation (+15d/+60d), and automated alert suppression upon document renewal.

1. **Inspect Pendency & SLA Monitoring**:
   - Click on the **"Pendency & Monitoring"** tab in the sidebar.
   - **Stage-Wise Aging Breakdown**:
     - *Scrutiny Cell*: Average aging vs. statutory SLA (10 days).
     - *EVC Cell*: Inspection scheduling aging vs. statutory SLA (15 days).
     - *Regional Office Desk*: Active pendency queue.
2. **Trigger the Clock Simulator (+15 Days / +60 Days)**:
   - At the top of the screen, locate the **Regulatory Clock Simulator**.
   - Click **"+15 Days"**:
     - System advances the internal timekeeper.
     - Pending tasks enter Amber/Warning state.
   - Click **"+60 Days"**:
     - System advances into the Fire NOC advance renewal window.
     - **Alert Engine Fires**: A high-priority statutory alert is dispatched:
       > ⚠️ **Overdue Alert**:  
       > *"Fire Safety NOC for COEP Pune is expiring within 60 days. Advance renewal submission required immediately under APH 2024–27."*
3. **Demonstrate Stale Alert Suppression (Acceptance Test T11)**:
   - When the institution uploads the renewed Fire Safety NOC and the Regional Officer verifies it, observe what happens:
   - The Alert Engine **immediately cancels/suppresses the active alert** across all dashboards!
   - *Technical USP*: No ghost notifications or outdated warnings linger in the system.
4. **Inspect Immutable WORM Audit Trail**:
   - Click on the **"Audit Logs"** tab in the sidebar.
   - View the append-only HMAC-SHA256 audit ledger:
     - Every login, role switch, checklist score, DSC signature, decision, and timer advance is permanently recorded with timestamp, actor ID, and IP address.
5. **View Executive Reports & Analytics**:
   - Click on the **"Reports"** tab in the sidebar.
   - View the 6 statutory AICTE executive summary categories:
     - 1. Approved vs Rejected Institutions
     - 2. Total Intake Capacity Growth (AY 2026–27)
     - 3. Regional Pendency Heatmap
     - 4. Deficiency Category Breakdown (Land vs Faculty vs NOCs)
     - 5. EVC Inspection Pass Rates
     - 6. Post-Approval Undertaking Compliance Rates

---

## 🏆 Key Architectural USPs to Highlight to the Evaluators

1. **Zero-Trust Multi-Role RBAC**: 6 strictly segregated roles with exact statutory guardrails preventing cross-role overreach.
2. **APH §1.8(g) Differential Re-Scrutiny Lock**: Mathematically prevents corruption or arbitrary deficiency creation on re-scrutiny.
3. **NBA Fast-Path Autonomous Routing**: Automatically diverts high-performing institutions away from EVC queues based on live policy rules.
4. **Atomic Post-Approval Governance**: Never loses track of conditional approvals; lease, fire, and faculty timers are automatically spawned and tracked.
5. **Stale Alert Suppression**: Automated event-driven cleanup of alerts when compliance proofs are verified.
6. **WORM Cryptographic Audit Trail**: Fully tamper-evident event ledger compliant with Section 11 of the AICTE Act.

---
*Ready for testing at `http://localhost:3000`.*
