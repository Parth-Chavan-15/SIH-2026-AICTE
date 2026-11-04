# NIYAMSETU — PHASE 4: SECONDARY INTERFACE & MODAL MATRIX
## Comprehensive Operational Specification of Modals, Drawers, and Overlay Interfaces

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Scope:** Complete catalog and interaction specification for all secondary modals, inspection drawers, and overlay dialogs.

---

## 1. Executive Summary & Inventory

In addition to the 30 primary workspace screens, NIYAMSETU implements 8 specialized secondary modal interfaces and overlays that provide deep interactive workflows without disrupting main screen continuity. Each interface preserves complete application context and ensures state integrity.

| Modal ID | Modal Name | Component File | Trigger Source | Primary Responsibility |
|:---|:---|:---|:---|:---|
| **MOD-01** | Case Detail & Timeline Modal | `ApplicationDetailModal.tsx` | Any application card / row | Multi-tab comprehensive case dossier, stage advancement, and evidence viewer. |
| **MOD-02** | Manual New Application Wizard | `NewApplicationModal.tsx` | Header / Applications ListView | 4-step manual application intake wizard with category routing. |
| **MOD-03** | Deficiency & Hearing Notice Modal | `CaseSummaryNoticesModal.tsx` | Quick action in Case Detail | Formal preview and issuance of procedural notices (LoD, Hearing Notice). |
| **MOD-04** | Document Expiry & Renewal Monitor | `DocumentExpiryView.tsx` | Secondary nav in Documents | Tracking expiring NOCs (Fire, Building, Affiliation) with 60-day warning clock. |
| **MOD-05** | Compliance Evidence Upload Modal | `ComplianceView.tsx` | Institution Compliance Row | Evidence file submission for post-approval statutory undertakings. |
| **MOD-06** | Regional Compliance Verification Modal | `ComplianceView.tsx` | RO Compliance Row | Verification determination with mandatory remarks. |
| **MOD-07** | Committee Allocation Modal | `ROAllocationView.tsx` | Unallocated case in RO | Assignment of case to Desk Scrutiny or EVC expert group. |
| **MOD-08** | Council Speaking Order Generator | `CompetentAuthorityDecisionView.tsx` | Approval Bureau Action | Formal statutory speaking order composition and dispatch. |

---

## 2. Detailed Modal Specifications

### Modal `MOD-01`: Case Detail & Timeline Modal (`ApplicationDetailModal.tsx`)
- **Trigger:** Clicking any application card or row in `ApplicationsListView`, `ScrutinyEvaluationView`, `ROAllocationView`, or `CompetentAuthorityDecisionView`.
- **Dimensions & Visual Frame:** Fixed high-contrast overlay (`z-50`) with backdrop blur, full-height drawer or centered large container (`max-w-6xl w-full`), with sticky header and independent content scroll.
- **Header Elements:**
  - Application ID badge (e.g., `APP-2026-COEP`).
  - Institution legal name, region, and academic year.
  - Authoritative statutory route badge (e.g., `NBA Fast-Track Route A1`, `Surge Extension Route B1`).
  - SLA status clock badge (`On Track`, `Critical`, `Breached`).
  - Close button (`Esc` key listener + `X` button).
- **Navigation Tabs:**
  1. *Overview Tab*:
     - Visual 5-stage sequential workflow stepper showing current stage, completed stages, and upcoming milestones.
     - Key institutional parameters (Existing Intake, Proposed Intake, NBA Accreditation Status, Built-up Area, Land Ownership).
     - Statutory evaluation findings summary.
     - Role-specific primary action button (e.g., "Advance to Next Stage", "Quick Accept", "Flag Deficiencies", "Issue Order").
  2. *Documents & Evidence Tab*:
     - Tabulated catalog of uploaded regulatory documents (Land Title, Building Plan, Fire NOC, AICTE Undertaking).
     - Document hash (SHA-256), upload timestamp, and verification status.
     - Preview and verification action buttons.
  3. *EVC Physical Inspection Tab*:
     - Campus geo-coordinates (`[DEMO Telemetry Fixture]`).
     - 30-minute campus walkthrough video validation card.
     - Scoring breakdown (Infrastructure, Faculty, Laboratories).
     - Committee recommendations and inspection summary.
  4. *Compliance Obligations Tab*:
     - Post-approval statutory undertakings assigned to this case.
     - 4-clock timer countdowns to submission cutoffs.
     - Uploaded evidence and verification history.
- **Workflow Transitions & Guards:**
  - Evaluates `validateWorkflowTransition()` before permitting any stage jump.
  - Rejects illegal transitions (e.g., jumping from `Application Submitted` directly to `Approval Issued`).
  - Prompts for mandatory justification remarks on return/rejection actions.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-02`: Manual New Application Wizard (`NewApplicationModal.tsx`)
- **Trigger:** Clicking `+ New Application` button in `ApplicationsListView` or header.
- **Dimensions & Visual Frame:** Centered modal container (`max-w-3xl`) with 4-stage progress indicator.
- **Step 1: Institutional Identification:**
  - Institution Code, Legal Name, Trust / Society Name, State / Region.
  - Institution Type (`Government`, `Private-Unaided`, `University Constituent`).
- **Step 2: Program & Category Selection:**
  - Level (`Undergraduate`, `Postgraduate`, `Diploma`).
  - Program (`Engineering & Technology`, `Management`, `Computer Applications`, `Pharmacy`).
  - Table 2.3 Category selection (e.g., *Category 1: Existing Institute seeking Extension of Approval (EoA)*, *Category 4: Increase in Intake / Additional Course*).
- **Step 3: Intake & Infrastructure Parameters:**
  - Existing approved intake ($X$).
  - Proposed intake expansion.
  - NBA accredited course percentage ($A$).
  - Built-up area in square meters.
- **Step 4: Review & Submission:**
  - Dynamic preview of evaluated route type based on entered parameters.
  - Statutory declarations and digital submission trigger.
- **Validation Rules:**
  - Form field completeness validation.
  - Numerical bounds check on intake figures.
  - Automatic injection of default fixture documents upon creation.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-03`: Deficiency & Hearing Notice Modal (`CaseSummaryNoticesModal.tsx`)
- **Trigger:** Clicking "Issue Formal Notice" in `ApplicationDetailModal` or Scrutiny console.
- **Visual Structure:** High-fidelity document preview formatted to mirror official AICTE communication stationery.
- **Key Elements:**
  - AICTE Official Header and Emblem.
  - Formal Dispatch Reference Number.
  - Specific Checklist Item Observations (Items D1, D2, etc.).
  - Statutory Cure Deadline Countdown (10-day statutory window / 15-day SLA limit).
  - Virtual Hearing Listing Details (for Standing Hearing Committee notices).
  - One-click copy or print preview button.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-04`: Document Expiry & Renewal Monitor (`DocumentExpiryView.tsx`)
- **Trigger:** Accessible via Document repository secondary navigation or institution dashboard.
- **Visual Structure:** Chronological expiration radar tracking validity of institutional documents:
  - *Fire Safety NOC* (1-year statutory validity with 60-day renewal rule under APH §2.25(f)).
  - *Structural Stability Certificate* (5-year validity).
  - *University Affiliation Letter* (Annual renewal).
  - *Land Lease Validity* (30-year statutory requirement).
- **Status Indicators:**
  - `Valid`: > 60 days remaining.
  - `Expiring Soon (Warning)`: ≤ 60 days remaining (Urgent renewal required).
  - `Expired (Deficient)`: Past validity date (Triggers immediate deficiency).
- **Key User Actions:**
  - Filter documents by urgency.
  - Upload renewed certificate to replace expiring document.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-05`: Compliance Evidence Upload Modal (`ComplianceView.tsx`)
- **Trigger:** Clicking "Upload Evidence" on any pending obligation card in institution view.
- **Visual Structure:** Compact dialog box displaying:
  - Undertaking Title and Statutory Clause (e.g., *Undertaking U1: Faculty Cadre Ratio Restoration under APH §2.20*).
  - Due Date & Remaining Time.
  - File Name / Evidence Link Input.
  - Mandatory Institutional Undertaking Checkbox.
  - "Submit Compliance Evidence" Button.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-06`: Regional Compliance Verification Modal (`ComplianceView.tsx`)
- **Trigger:** Clicking "Verify Submission" on any submitted compliance obligation in Regional Office view.
- **Visual Structure:** Evaluation dialog displaying:
  - Submitted Evidence Link and Institutional Remarks.
  - Decision Radio Group: `Verified (Compliant)` vs `Rejected (Deficient)`.
  - Mandatory Verification Remarks / Justification Input.
  - "Confirm Determination" Button.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-07`: Committee Allocation Modal (`ROAllocationView.tsx`)
- **Trigger:** Clicking "Assign Committee" on an unallocated case in Regional Office workspace.
- **Visual Structure:** Interactive panel displaying:
  - Target Case Details (Application Number, Institution Name, Region).
  - Assignment Type: `Desk Scrutiny Committee` or `Expert Visit Committee (EVC)`.
  - Available Regional Panels with current caseload meters and member names.
  - Institutional Conflict of Interest Check Indicator.
  - "Confirm Committee Assignment" Button.
- **Truth Label:** Fully Implemented.

---

### Modal `MOD-08`: Council Speaking Order Generator (`CompetentAuthorityDecisionView.tsx`)
- **Trigger:** Clicking "Issue Council Decision" in Approval Bureau workspace.
- **Visual Structure:** Speaking order workbench:
  - Statutory Decision Selector: `Grant Approval (EoA / LoA)`, `Issue Letter of Deficiency (LoD)`, `Refuse Approval / Letter of Rejection (LoR)`.
  - Conditions & Undertakings Selector (multi-select checkable list of statutory undertakings).
  - Speaking Order Justification Textarea (pre-populated with canonical legal clauses).
  - Cryptographic Signing Preview.
  - "Execute Council Determination & Seal Order" Button.
- **Truth Label:** Fully Implemented.

---

## 3. Workflow Continuity & Accessibility Invariants

1. **Backdrop & Focus Trap:** All modals implement standard accessible focus trapping and keyboard navigation (`Esc` to dismiss).
2. **Zero Context Loss:** Dismissing any modal returns the user to the exact filter, page, and scroll offset of the underlying workspace without data mutation.
3. **Synchronous State Hydration:** Successful mutations within any modal immediately dispatch global context updates (`addToast`, `transitionStage`, `verifyDocument`), refreshing all open cards and queues synchronously.
