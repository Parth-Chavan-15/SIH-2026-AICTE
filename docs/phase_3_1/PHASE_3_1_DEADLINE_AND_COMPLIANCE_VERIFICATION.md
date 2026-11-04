# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Deadline, Regulatory Clock & Statutory Compliance Verification

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**Verification Suite:** `tests/regulatory_clock_guards.test.ts` (27 tests), `tests/m3_obligations_timers.test.ts` (9 tests)

---

## 1. Statutory Deadline Reconciliation & Jurisprudential Context

The Supreme Court of India in *Parshvanath Charitable Trust v. AICTE (2013) 3 SCC 385* laid down an inflexible annual calendar for AICTE approvals:
- **April 30:** Final deadline for grant or refusal of approval by AICTE.
- **May 31:** Final deadline for disposal of appeals by the Standing Appellate Committee.
- **August 15:** Final cutoff for second/third round counseling and admissions.

### Administrative Extensions via Public Notices (AY 2026–27)
Official Public Notices issued for AY 2026–27 (DOC-08 on 26.11.2025 and DOC-09) officially established:
- **Normal Filing Deadline:** Extended to **15 January 2026** (midnight).
- **Extended Filing Window with Late Fee:** Extended to **31 January 2026** (midnight).
- **Chapter I New Institutions:** Sequential processing requiring Scrutiny and EVC to conclude prior to April 10.
- **Chapter II Existing Institutions:** Automated Fast-Track processing for zero deficiency self-disclosure concluding by March 31.

---

## 2. Regulatory Clock Implementation & Guards

### 2.1 Distinction Between Chapter I and Chapter II Timelines
Implemented in `src/backend/policy/regulatoryClockGuards.ts`:
- Applications evaluate statutory deadlines based on `category`:
  - `new_institution`: Enforces strict Day 7.0 / Day 8.0 Scrutiny scheduling trigger and Chapter I cutoff dates.
  - `increase_intake` / `extension_of_approval`: Enforces Chapter II filing deadlines with late fee penalty calculation.

### 2.2 Boundary Day 7.0 vs Day 8.0 Verification
Under APH guidelines, a 7-day cure window provides exact hour-by-hour statutory grace:
- At **$t = 7.00$ days ($168.0$ hours):** Application remains strictly within statutory SLA; no default adverse order may be issued.
- At **$t = 8.00$ days ($192.0$ hours):** Statutory cure limitation expires; case transitions automatically to `approaching_deadline` or `overdue` with escalation alert emitted to Regional Officer.
- Verified in `tests/regulatory_clock_guards.test.ts` across 27 distinct boundary assertions.

### 2.3 Calendar Month Math Clamping (Leap Year & Month-End)
- Naive arithmetic ($+30$ days or $+180$ days) violates statutory calendar months.
- When an obligation or undertaking spans 6 months from August 31:
  - Standard addition yields March 3 in non-leap years.
  - NIYAMSETU implements `addCalendarMonths(startDate, months)` which clamps to the final day of the target month (**February 28** or **February 29** in leap year 2028).
- Verified in `tests/m3_obligations_timers.test.ts` across 9 tests.
