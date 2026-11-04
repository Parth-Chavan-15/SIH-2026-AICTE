# NIYAMSETU (नियमसेतु) — PHASE 3.1 UI COMPATIBILITY & PRESERVATION REPORT
**Project:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev` (Strictly Local Development)  
**Verification Date:** 2026-11-03  
**Status:** PHASE 3.1 UI FREEZE COMPLIANT — 100% PRESERVED & FUNCTIONALLY COMPATIBLE

---

## 1. UI Freeze & Preservation Mandate

In strict accordance with Phase 3 and Phase 3.1 instructions, major UI redesign has been **strictly frozen**.
- **Visual Structure Preserved:** The entire demonstrated four-perspective visual layout, workspace navigation, role identities, and interactive workflows of NIYAMSETU have been **100% preserved**.
- **Zero Component Removal:** No demonstrated screens, buttons, navigation tabs, or modal flows were removed, hidden, or altered in a breaking manner.
- **Under-the-Hood Hardening:** All regulatory hardening (intake formulas, policy version pinning, month-end date clamping, roster validation, Speaking Orders) operates seamlessly under the hood without disrupting established presentation contracts.

```
+---------------------------------------------------------------------------------------------------+
|                                NIYAMSETU ROLE-BASED WORKSPACES                                    |
+---------------------------------------------------------------------------------------------------+
|  1. Institution Applicant Portal       |  2. Regional Office Operations Desk                      |
|     - NSWS 5-Step Simulation Flow      |     - Multi-Group Scrutiny/EVC Allocation                |
|     - Category Intake & Fast-Track     |     - Workload Balancing & Quorum Verification           |
|     - Post-Approval Obligation Tracker |     - Stage Return / Revert with Mandatory Audit Log     |
+----------------------------------------+----------------------------------------------------------+
|  3. Scrutiny Reviewer Desk             |  4. Adjudication & Approval Bureau                       |
|     - Checklist Item Evaluation        |     - 3-Tab Adjudication: SAC / SHC / PGRC               |
|     - Signed Deficiency Lock (§1.8(g)) |     - AICTE Act §10(k) Speaking Order Attachments        |
|     - Differential Re-Scrutiny Shield  |     - Cryptographic Decision Document Vault               |
+----------------------------------------+----------------------------------------------------------+
```

---

## 2. Workspace-by-Workspace Audit & Verification

### 2.1 Institution Applicant Workspace (`src/features/applications/`, `src/features/nsws/`)
- **NSWS Onboarding Simulator (`NSWSSimulationView.tsx`):**
  - Step 1: Investor profile registration (PAN verification with demo mock `AAACB1234F`).
  - Step 2: Digital Signature Certificate (DSC) verification via simulated emBridge USB cryptographic hardware token.
  - Step 3: Interactive Dynamic Route Pre-Check: evaluates proposed intake, NBA accreditation, and land area against `dynamicRouteEngine.ts`.
  - Step 4: Document Evidence Upload with 5-state lifecycle (`submitted` -> `review_pending` -> `verified`).
  - Step 5: Official Application Submission with pinned policy version (`AY-2026-27-V1 Pinned`).
- **Application Detail View (`ApplicationDetailModal.tsx`):**
  - Displays full case metadata, route explanation, and regulatory source citations (DOC-01 to DOC-09).
  - Displays post-approval obligations ledger (Joint FDR deposit under Clause 2.25(f), 6-month undertakings, Fire Safety NOC).
  - Interactive virtual clock trigger displays remaining days and statutory alert status.

### 2.2 Scrutiny Evaluation Reviewer Desk (`src/features/scrutiny/ScrutinyEvaluationView.tsx`)
- **Statutory Due Process Locks:**
  - Round 1 Desk Scrutiny produces signed snapshots of accepted and deficient items.
  - Round 2 Re-Scrutiny: Items marked `accepted` in Round 1 are visually and functionally **locked**. Reviewers and applicants cannot alter or re-open cleared items.
  - Tamper Simulation Button: An interactive button enables evaluators to test unauthorized modifications to cleared item `C3`, demonstrating real-time HTTP 409 Conflict tamper blocking under Clause 1.8(g).

### 2.3 Regional Office Committee Allocation Desk (`src/features/ro/ROCommitteeAllocationView.tsx`)
- **Multi-Group Structure:**
  - Scrutiny Panels: `SCR-GROUP-A` (Western/SCRO) and `SCR-GROUP-B` (Northern/Central).
  - EVC Panels: `EVC-GROUP-A` (Infrastructure & Computing) and `EVC-GROUP-B` (Polytechnic & Applied Sciences).
- **Roster Qualification Compliance:**
  - Validates Annexure 16.5 qualifications: displays verified credentials for Convener, Subject Expert, and Architecture/Infrastructure Expert (including COA Architects, Civil Professors, and CPWD Chief Engineers).
- **Stage Revert Dialog:**
  - Enforces mandatory justification text when returning an application to an earlier stage, recording the full audit payload (`occurredAt`, `actorId`, `reason`, `beforeState`, `afterState`).

### 2.4 National Bureau Adjudication & Appeals (`src/features/appeals/AppealsAndHearingsView.tsx`)
- **3-Tab Role Separation:**
  1. `SAC Appeals`: Chaired by a retired High Court Judge. Displays 7-day statutory clock countdown from Letter of Deficiency issue date or Executive Committee decision upload date, and rejects time-barred submissions.
  2. `SHC Compliance Hearings`: Verification of compliance under Clause 2.23.3.
  3. `PGRC & SCSC Complaints`: Chapter VII grievance tracking. Rejects anonymous complaints with statutory citations under Clause 7.10(h).
- **Decision Document Center (`DecisionDocumentsView.tsx`):**
  - Downloadable official letters (LoA, EoA, LoR) rendered with valid PDF byte stream generation.
  - Letters of Rejection prominently display the mandatory Executive Committee **Speaking Order** per AICTE Act §10(k).
  - Embedded HMAC-SHA256 QR code digest and digital seal verification block.

---

## 3. Simulation Labels & Demonstration Clarity

To ensure absolute transparency during hackathon evaluation, all synthetic or hardware-proxy interactions feature explicit simulation tags:
- **NSWS PAN Onboarding:** Labeled as `[NSWS Simulation Sandbox]` with mock enterprise PAN.
- **Class-3 DSC Token:** Labeled as `[emBridge USB Hardware Simulation Gateway]`.
- **Virtual Time Advancer:** Labeled as `[Virtual Regulatory Clock Demonstration Tool]`, clearly showing simulated timestamp `2026-10-24T00:00:00.000Z`.

---

## 4. Automated UI Test Verification

- **`tests/frontend/canonical.test.tsx`:** **18 passed** (0 failures, 221 ms).
- **`tests/acceptance/navigation.test.tsx`:** **4 passed** (0 failures, 29 ms).
- **DOM Stability:** Zero regression errors, zero unhandled promise rejections, zero missing route controls.
