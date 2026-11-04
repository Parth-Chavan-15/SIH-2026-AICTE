# NIYAMSETU (नियमसेतु) — HANDS-ON DEMONSTRATION RUNBOOK
## Operator Manual & Complete Case-by-Case Evaluator Walkthrough

**Project:** NIYAMSETU — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target URL:** `http://127.0.0.1:3000`  
**Default Password across all Demo Accounts:** `password123`

---

## 1. Quick-Start Launch Instructions

Follow these exact steps from a clean terminal to start NIYAMSETU:

1. **Open PowerShell in the project directory:**
   ```powershell
   cd c:\Users\parth\Documents\SIH-26-AICTE
   ```
2. **Verify local MongoDB is running:**
   ```powershell
   net start MongoDB
   ```
3. **Verify database connection and fixtures:**
   ```powershell
   npm run db:check
   ```
   *(Expected: `✅ Successfully connected to MongoDB database [niyamsetu_dev]!`)*
4. **Start the application:**
   ```powershell
   npm run dev
   ```
   *(Expected: `🚀 AICTE NiyamSetu Server running on http://127.0.0.1:3000`)*
5. **Open your browser and navigate to:**
   ```
   http://127.0.0.1:3000
   ```

---

## 2. Six-Role Persona Access Guide

Switch roles instantly using the top government header persona selector:

| Role # | Statutory Persona | Demo Email | Password | Starting Tab | Key Authorized Capabilities |
|:---:|:---|:---|:---|:---|:---|
| **#1** | Principal, COEP Tech (Applicant) | `principal@coep.ac.in` | `password123` | `inst-apps` | NSWS intake, deficiency cure upload, view EoA/LoA documents, compliance evidence. |
| **#2** | Reviewer, Desk Scrutiny Committee | `scrutiny.reviewer@aicte.gov.in`| `password123` | `scrutiny-eval` | Checklist evaluation (C1–C14), Snapshot v1 signing, differential re-scrutiny scope lock. |
| **#3** | Chairman, Expert Visit Committee (EVC)| `evc.chair@aicte.gov.in` | `password123` | `evc-inspect` | Telemetry verification, 30-min walkthrough video check, scoring, inspection report. |
| **#4** | Regional Officer, Western Region (WRO) | `ro.western@aicte.gov.in` | `password123` | `ro-allocation` | Expert committee allocation, regional pendency matrix, compliance verification. |
| **#5** | Member Secretary, Approval Bureau | `bureau.approval@aicte.gov.in`| `password123` | `ca-decision` | Council speaking orders, statutory decision gate, digital PDF signing & HMAC seal. |
| **#6** | Policy Admin & System Auditor | `admin@aicte.gov.in` | `password123` | `admin-policy` | Dynamic policy rules (R01–R32), WORM audit trail, ecosystem adapter simulator. |

---

## 3. Case-by-Case Canonical Walkthroughs

---

### Case 1: `APP-2026-COEP` — NBA Fast-Track Route A1
**Objective:** Demonstrate automated fast-track routing for accredited institutions with zero EVC inspection requirement and immediate EoA document generation.

1. **Role #1 (Applicant):**
   - Click top role selector $\rightarrow$ Select `Role 1: Principal, COEP Tech`.
   - In left sidebar, click `1. My Applications & Live Status` (`inst-apps`).
   - Notice case `APP-2026-COEP` showing route badge **`Route A1: NBA Fast-Track`** and stage `Scrutiny in Progress`.
   - Click case row to open `Case Detail Modal`.
   - Inspect the 5-stage stepper: notice that Step 3 (EVC) is marked **`EVC EXEMPT (APH §2.3.4)`**.
   - Close modal.
2. **Role #2 (Scrutiny Committee):**
   - Switch role to `Role 2: Desk Scrutiny Committee`.
   - Open `1. Desk Scrutiny Evaluation & Deficiencies` (`scrutiny-eval`).
   - Select `APP-2026-COEP`.
   - Inspect checklist cards (C1–C14): All parameters compliant.
   - Click **"Sign & Seal Snapshot v1"**. Case advances to `Scrutiny Cleared`.
3. **Role #5 (Approval Bureau):**
   - Switch role to `Role 5: Competent Authority / Approval Bureau`.
   - Open `1. Statutory Decision Gate` (`ca-decision`).
   - Select `APP-2026-COEP`. Notice recommendation: `Scrutiny Cleared — EVC Exempt Fast-Track`.
   - Click **"Grant Extension of Approval (EoA)"**. Speaking order template is automatically pre-populated.
   - Click **"Execute Council Determination & Seal Order"**. Case advances to `Approval Issued`.
4. **Document Generation & Verification:**
   - In sidebar, click `2. Decision Letters & PDF Signing` (`ca-decision-docs`).
   - Find `APP-2026-COEP` in the catalog.
   - Click **"Verify Signature"**: Notice verification modal confirming:
     `HMAC-SHA256 Prototype Integrity Seal Validated against Council Digest`.
   - Click **"Download PDF"**: Browser downloads the generated official signed PDF order.

---

### Case 2: `APP-2026-GIITS` — Non-NBA Surge & Differential Re-Scrutiny Scope Lock (USP B06)
**Objective:** Demonstrate server-enforced immutability under APH §1.8(g) where accepted items are locked, and only flagged deficiencies can be cured.

1. **Role #2 (Scrutiny Committee):**
   - Switch role to `Role 2: Desk Scrutiny Committee`.
   - Open `2. Differential Re-Scrutiny (Locked C3)` (`scrutiny-rescrutiny`).
   - Select `APP-2026-GIITS`.
   - Observe the split interface:
     - *Locked Items:* Item C3 (Registered Land Title Deed) and C4 (Structural Certificate) display green lock icons.
     - *Active Review Items:* Item D1 (Faculty Cadre Shortage) and D2 (Fire Safety NOC).
2. **The Scope Lock Tamper Test (Live Server Enforcement):**
   - Click the prominent button: **"Live USP B06 Scope Lock Tamper Test"**.
   - Watch the server response modal appear in under $50\text{ms}$:
     - Status: `HTTP 412 Precondition Failed`
     - Error Code: `RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES`
     - Reason: "Server-Enforced Scope Lock Violation: Under APH §1.8(g), only items flagged deficient in signed Snapshot v1 can be re-evaluated. Item C3 is immutable."
   - This proves conclusively to evaluators that scope locking is enforced by backend HTTP middleware, not just a disabled frontend toggle.
3. **Role #1 (Applicant Cure Submission):**
   - Switch role to `Role 1: Principal, GIITS Vizag`.
   - Open `3. Deficiency Responses & Document Cures` (`inst-deficiencies`).
   - Notice the remaining cure countdown clock.
   - In Item D1, upload compliance evidence: `GIITS_Faculty_Cadre_Restoration_Form16.pdf`.
   - Click **"Submit Remediation Package"**. Status updates to `Cure Submitted`.

---

### Case 3: `APP-2026-BATU` — Campus Restructuring & EVC Physical Inspection
**Objective:** Demonstrate Regional Office committee allocation, GPS telemetry inspection, campus video check, and scoring.

1. **Role #4 (Regional Office):**
   - Switch role to `Role 4: Regional Officer (WRO)`.
   - Open `1. Committee Allocation & Workloads` (`ro-allocation`).
   - Review panel capacity bars: Panel A (4 cases), Panel B (2 cases), Panel C (1 case).
   - Find unallocated conversion case `APP-2026-BATU`.
   - Click **"Assign Committee"**, select `Expert Visit Committee (EVC)`, choose `GRP-WRO-EVC-01`, and confirm.
2. **Role #3 (EVC Inspection Chairman):**
   - Switch role to `Role 3: EVC Committee Portal`.
   - Open `1. Campus Inspections & Telemetry` (`evc-inspect`).
   - Select `APP-2026-BATU`.
   - Review GPS coordinates: `18.1652° N, 73.3361° E` (`[DEMO Telemetry Fixture]`).
   - Verify 30-minute uninterrupted campus walkthrough video check (§1.9(f)).
   - Adjust scoring sliders: Infrastructure ($94\%$), Faculty ($88\%$), Laboratories ($92\%$).
   - Enter observation remarks and click **"Submit Official Inspection Report"**. Stage advances to `EVC Inspection Completed`.

---

### Case 4: `APP-2026-PDIMTR` — Post-Approval Compliance & 4-Clock Timers
**Objective:** Demonstrate multi-deadline obligation tracking, evidence submission, and Regional Office verification.

1. **Role #1 (Applicant):**
   - Switch role to `Role 1: Principal, PDIMTR Nagpur`.
   - Open `5. Post-Approval Obligations & Undertakings` (`inst-renewals`).
   - Inspect the **4-Clock Obligation Timers**:
     - Clock 1: Fire Safety NOC Renewal (60-day advance renewal rule under APH §2.25(f)).
     - Clock 2: Faculty Cadre Ratio Restoration (180-day compliance window).
     - Clock 3: Land Conversion Revenue Endorsement.
     - Clock 4: Mandatory Disclosure Annual Return.
   - Click **"Upload Evidence"** on Fire Safety NOC. Enter file name `PDIMTR_Fire_NOC_2026_27.pdf`, check mandatory legal undertaking checkbox, and submit. Status changes to `Submitted`.
2. **Role #4 (Regional Office Oversight):**
   - Switch role to `Role 4: Regional Officer (WRO)`.
   - Open `4. Post-Approval Compliance & 4-Clock Timers` (`ro-obligations`).
   - Find PDIMTR's submission.
   - Click **"Verify Submission"**. Select `Verified (Compliant)`, enter officer remark: *"Verified with Municipal Fire Service Authority"*, and confirm. Status updates to `Verified & Closed`.

---

### Case 5: `APP-2026-APEX` — Adverse Order & Quasi-Judicial Appellate Recourse (SAC/SHC)
**Objective:** Demonstrate formal legal recourse against a rejection order under APH §1.11 / §2.23.3.

1. **Role #1 (Applicant Appeal Petition):**
   - Switch role to `Role 1: Principal, Apex Rajasthan`.
   - Open `6. Standing Appellate Committee (SAC)` (`appeals-hearings`).
   - View adverse order citing disputed land conversion.
   - Formulate grounds of appeal: enter statutory citation *"District Collector revenue sanction order dated 12-Nov-2025 affirms conversion under Land Revenue Code §44"*.
   - Click **"File Statutory Appeal Petition"**. Status advances to `Appeal Listed`.
2. **Role #5 (Approval Bureau / SAC Adjudication):**
   - Switch role to `Role 5: Competent Authority / Approval Bureau`.
   - Open `3. SAC Appeals & Dispositions` (`ca-appeals`).
   - Select Apex appeal petition.
   - Review judicial bench composition (Retired High Court Judge Chair, Senior Academic, Industry Expert).
   - Enter Council disposition: Select `Overturn Rejection & Grant Conditional EoA`.
   - Click **"Issue Final Appellate Speaking Order"**. Relief granted.

---

## 4. Special Scenario Demonstrations

### Special Scenario 1: Intake Boundary $X = 360$ (The Statutory Ceiling Test)
1. Switch to `Role 1: Applicant`. Open `2. NSWS Onboarding & Dynamic Route` (`inst-nsws`).
2. Click preset: **`Vidya Vardhini Institute (Boundary X=360)`**.
3. Notice: Existing Intake $X = 360$, Proposed $= 750$.
4. Click through to Step 4 (Dynamic Route Engine Preview).
5. Observe engine result:
   - Status: **`Route C1: Regulatory Intake Ceiling Hold`**
   - Triggered Rule: `R02_INTAKE_SURGE_CEILING_BREACH`
   - Explanation: "Under APH §2.3.2, existing institutions with intake $X \le 360$ are strictly capped at maximum expansion of $360$ seats (ceiling $2X = 720$). Proposed $750$ exceeds ceiling by $30$ seats. Automated approval blocked."

### Special Scenario 2: WORM Tamper-Evident Chained Audit Trail
1. Switch to `Role 6: Policy Admin`. Open `2. WORM Cryptographic Audit Trail` (`admin-worm`).
2. Search by case `APP-2026-COEP` or action `STAGE_TRANSITION`.
3. Click any row to expand its cryptographic SHA-256 block hash tree.
4. Notice the `previousHash` pointer linking each block to the prior transaction.
5. Click **"Export Audit Log (CSV)"** to download the forensic audit record.

---

## 5. Safe Reset for Repeated Demonstrations

To reset the demonstration environment to its clean baseline after an evaluation:
1. Open PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/v1/demo/reset" -Method POST
   ```
2. Refresh your browser. All 5 canonical cases return to their initial demonstration stages.
