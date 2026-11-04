# NIYAMSETU (नियमसेतु) — PHASE 3.1 DEADLINE & COMPLIANCE SPECIFICATION
**Project:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev` (Strictly Local Development)  
**Verification Date:** 2026-11-03  
**Status:** PHASE 3.1 RECONCILED — TIMING ARCHITECTURE & CLOCK GUARDS VERIFIED

---

## 1. The 4-Clock Regulatory Timing Architecture

To prevent timing conflation, NIYAMSETU establishes a strict architectural separation between statutory legal deadlines and operational system SLAs. Every time-bound requirement in the AICTE approval lifecycle is assigned to one of four mutually exclusive virtual clock categories:

```
+---------------------------------------------------------------------------------------------------+
|                                  THE 4-CLOCK REGULATORY MODEL                                     |
+---------------------------------+---------------------------------+-------------------------------+
| Clock Type                      | Trigger Mechanism               | Governing Provisions & Scope  |
+---------------------------------+---------------------------------+-------------------------------+
| 1. FIXED_ACADEMIC_CALENDAR      | Fixed statutory cut-off dates   | - 31st May (10% Penalty cut)  |
|                                 | published in Gazette / APH      | - 30th June (PGDM Refund cut) |
|                                 |                                 | - 31st July (20% Penalty cut) |
+---------------------------------+---------------------------------+-------------------------------+
| 2. EVENT_RELATIVE_DURATION      | Calendar days elapsed since an  | - 7 days from LoD ISSUE (§1.11)
|                                 | official recorded domain event  | - 7 days from EC UPLOAD (§2.24)
|                                 |                                 | - 15 days from SUBMISSION CLOSE
|                                 |                                 |   for University views (§2.19c)
|                                 |                                 | - 15 days from FDR intimation 
|                                 |                                 | - 7 days for fee refund (§6.45)
+---------------------------------+---------------------------------+-------------------------------+
| 3. DOCUMENT_VALIDITY_WINDOW     | Expiration date stated on legal | - Fire Safety Certificate     |
|                                 | instrument or certificate       |   (State Authority Validity)  |
|                                 |                                 | - 30-Year Registered Lease    |
|                                 |                                 | - Building Safety Certificate |
+---------------------------------+---------------------------------+-------------------------------+
| 4. SIMULATED_OPERATIONAL_SLA    | Internal workflow turnaround    | - 10-day deficiency cure SLA  |
|                                 | targets (non-statutory product  | - 7-day scrutiny review SLA   |
|                                 | reminders, NOT legal notices)   | - 48-hour alert reminders     |
+---------------------------------+---------------------------------+-------------------------------+
```

---

## 2. Comprehensive Statutory Timing Register & Primary Ground Truths

### 2.1 Standing Appellate Committee (SAC) Statute of Limitations (Clause 1.11(a) vs 2.24(a))
- **Applicability:** Aggrieved institutions appealing an adverse decision or deficiency finding.
- **Chapter I (Setting Up New Technical Institutions):**
  - **Statutory Trigger:** Strictly **"within 7 days from the date of issue of Letter of Deficiency (LoD)"** per Clause 1.11(a) (Physical PDF p. 25).
  - *Correction of Myth:* The statute strictly anchors to the **date of issue**, NOT the date of receipt by the applicant.
- **Chapter II (Existing Technical Institutions):**
  - **Statutory Trigger:** Strictly **"within 7 days from the date of uploading of the decision"** on the AICTE Web-Portal per Clause 2.24(a) (Physical PDF p. 45), accompanied by a detailed Speaking Order per Clause 2.23.3.
- **Boundary Enforcement:**
  - Day 1.0 through Day 7.0: Appeal is timely and accepted for SAC scheduling.
  - Day 8.0 or later: Appeal is time-barred (`STATUTORY_APPEAL_TIME_BARRED`).
- **Legal Guardrail:** The case is flagged as `APPEAL_WINDOW_ELAPSED_PENDING_COUNCIL_ORDER`. The portal does NOT autonomously issue final cancellation orders; a formal Council decision is required.

---

### 2.2 Post-Approval Security Deposit & Joint FDR Timeline (Clause 2.25(e) & 2.25(f))
- **Applicability:** Strictly **post-approval** when an existing institution is granted approval for a New Programme/Level. Never conflated with pre-approval deficiency turnaround.
- **Statutory Trigger:** Date of receipt of formal intimation letter from AICTE following Executive Committee recommendation.
- **Grace Period (0% penalty):** Within 15 calendar days from intimation, the institution must submit proof of Joint FDR deposit and Affidavit 3.
- **Penalty Stage 1 (10% penalty):** Submissions after 15 calendar days and up to **31st May** of the Calendar Year incur a 10% penalty on the deposit amount.
- **Penalty Stage 2 (20% penalty):** Submissions between **1st June and 31st July** of the Calendar Year incur a 20% penalty on the deposit amount.
- **Default Stage (Beyond 31st July):**
  - If deposit proof is not submitted by 31st July, approval is subject to withdrawal.
  - **Guardrail:** The portal transitions the case to `SECURITY_DEPOSIT_DEFAULT_PENDING_COUNCIL_ORDER`. The system **strictly forbids unilateral autonomous revocation**. Legal withdrawal requires a formal Speaking Order passed by the Council.

---

### 2.3 Affiliating University / State Government Views (Clause 2.19(c) vs 1.4.7)
- **Applicability:** Specifically applies to applications seeking Change in Name of Institution / Affiliating University / Board, or Type of Institution converted into University.
- **Statutory Trigger:** Governed by Clause 2.19(c) (Physical PDF p. 42): *"within 15 days from the last date of submission of the application"* (the portal closing date, NOT dispatch date).
- **Statutory Effect of Non-Response:** The Council shall proceed for further processing without the views of the State Government / Affiliating University (`PROCEED_WITHOUT_EXTERNAL_VIEWS`).
- **Guardrail:** The engine strictly forbids synthesizing fictitious `DEEMED_CONCURRENCE` tokens. The application proceeds under normal AICTE scrutiny on its own merits without external concurrence.

---

### 2.4 Statutory Fee Refund Policy (Clause 6.45 vs Annexure 6 Clause 6.12)
- **General Technical Institutions (Clause 6.45):**
  - Applies to Engineering, Technology, Management, MCA, Architecture, Pharmacy, Hotel Management.
  - Trigger: Formal withdrawal request submitted by candidate prior to commencement of classes.
  - Refund Amount: 100% of entire fee collected, minus a maximum processing fee of **Rs. 1,000/-**.
  - Turnaround Time: Entire fee refund must be credited within **7 calendar days**.
  - Return of Certificates: Original educational certificates and documents must be returned within **7 calendar days**.
- **Standalone PGDM Institutions (Annexure 6 Clause 6.12):**
  - Applies *strictly* to standalone Post Graduate Diploma in Management institutions.
  - Cut-Off Date: **30th June** of the relevant Academic Year.
  - Processing Fee: Capped at Rs. 1,000/- if withdrawn before 30th June.

---

### 2.5 Live Land Lease Duration & Verification (Clause 2.1(e) & 6.17(a))
- **Registered Lease:** Must be a registered long-term lease for a minimum period of 30 years.
- **Live Lease:** Must be at least equal to the maximum duration of the program / course at the time of submission (e.g. 4 years for B.Tech, 3 years for Diploma, 2 years for MBA).
- **Statutory Clarification:** There is **NO "+1 year"** in the statutory text! An institution with 4 years of live lease remaining applying for a 4-year B.Tech program is 100% compliant.

---

### 2.6 Conditional EoA Undertakings & Accurate Month Math (Clause 2.25)
- **Turnaround Window:** Exactly 6 calendar months from decision issuance (grounded in precedent order OP-09).
- **Date Clamping Safeguard (`addCalendarMonths`):**
  - Native JavaScript `setUTCMonth(m + 6)` contains an inherent overflow bug: August 31 + 6 months naively evaluates to March 3rd.
  - NIYAMSETU implements `addCalendarMonths(baseDate, months)` in `complianceService.ts`:
    - August 31, 2026 + 6 months -> **February 28, 2027** (non-leap year clamped to month-end).
    - August 31, 2023 + 6 months -> **February 29, 2024** (leap year clamped to month-end).
    - March 31, 2026 + 6 months -> **September 30, 2026** (30-day month clamped to month-end).
    - January 15, 2026 + 6 months -> **July 15, 2026** (standard date preservation).

---

### 2.7 Fire Safety Certificate Validity (Clause 6.17(i))
- **Statutory Text:** *"A valid Fire Safety Certificate shall be obtained from the Competent Authority."*
- **Clarification:** AICTE does not dictate a universal 1-year duration. Validity follows the issuing State Fire Service Authority. An expired certificate generates a post-approval renewal obligation rather than an instant rejection.

---

## 3. Product Reminders vs Statutory Notices Distinction

To prevent legal confusion, NIYAMSETU strictly distinguishes between **Internal Product Reminders** and **Statutory Formal Notices**:

1. **Internal Product Reminders (SIMULATED_OPERATIONAL_SLA):**
   - Automated email/portal notifications sent at T-60, T-30, T-15, and T-7 days.
   - Purpose: Usability aids to help institutions prepare documents before deadlines.
   - Legal Status: Non-binding product reminders. They do not initiate regulatory sanctions or create administrative liabilities.
2. **Statutory Formal Notices (EVENT_RELATIVE_DURATION / FIXED_ACADEMIC_CALENDAR):**
   - Official administrative instruments (Letter of Deficiency, Show Cause Notice under Clause 7.10(c), Security Deposit Demand Letter under Clause 2.25(f)).
   - Signed cryptographically with HMAC-SHA256 digests and tracked with immutable audit timestamps.
   - Legal Status: Binding statutory instruments carrying legal consequences and formal appeal rights.

---

## 4. Virtual Clock Verification Matrix

| Clock Identifier | Clock Category | Governing Clause | Target Stage | Asserted Boundary | Test Suite Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CLK-SAC-CH1` | `EVENT_RELATIVE_DURATION` | Chapter I §1.11(a) | Rejection / LoD | 7 days from LoD Issue Date | `tests/regulatory_clock_guards.test.ts` (Test 4) |
| `CLK-SAC-CH2` | `EVENT_RELATIVE_DURATION` | Chapter II §2.24(a) | Rejection Speaking Order | 7 days from Upload of Decision | `tests/regulatory_clock_guards.test.ts` (Test 5) |
| `CLK-FDR-15D` | `EVENT_RELATIVE_DURATION` | Chapter II §2.25(f) | Post-Approval Issued | 15 days from intimation (0% penalty) | `tests/regulatory_clock_guards.test.ts` (Test 1) |
| `CLK-FDR-MAY31` | `FIXED_ACADEMIC_CALENDAR` | Chapter II §2.25(f) | Post-Approval Issued | 31st May (10% penalty stage) | `tests/regulatory_clock_guards.test.ts` (Test 2) |
| `CLK-FDR-JULY31` | `FIXED_ACADEMIC_CALENDAR` | Chapter II §2.25(f) | Post-Approval Issued | 31st July (20% penalty stage) | `tests/regulatory_clock_guards.test.ts` (Test 3) |
| `CLK-FDR-DEFAULT` | `FIXED_ACADEMIC_CALENDAR` | Chapter II §2.25(f) | Default Escalation | Post-31 July: Council Speaking Order | `tests/regulatory_clock_guards.test.ts` (Test 4) |
| `CLK-REFUND-GEN` | `EVENT_RELATIVE_DURATION` | Chapter VI §6.45 | Pre-Commencement Withdrawal | 7 days fee refund & certificate return | `tests/regulatory_clock_guards.test.ts` (Test 6) |
| `CLK-REFUND-PGDM`| `FIXED_ACADEMIC_CALENDAR` | Annexure 6 §6.12 | Pre-Commencement Withdrawal | 30th June statutory cutoff | `tests/regulatory_clock_guards.test.ts` (Test 7) |
| `CLK-UNIV-NOC` | `EVENT_RELATIVE_DURATION` | Chapter II §2.19(c) | Name / University Conversion | 15 days from submission close | `tests/regulatory_clock_guards.test.ts` (Test 9) |
| `CLK-COND-EOA` | `EVENT_RELATIVE_DURATION` | Chapter II §2.25 | Conditional Approval | 6 calendar months (clamped math) | `tests/m3_obligations_timers.test.ts` (Test 9) |
