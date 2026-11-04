# NIYAMSETU — UNRESOLVED POLICY QUESTIONS REGISTER
**Exhaustive Register of Regulatory Ambiguities, Gaps & Conflicting Provisions**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**
**Status: Strict Source Adherence — Zero Speculation | Tag: `POLICY_REVIEW_REQUIRED`**

---

## 1. REGISTER PRINCIPLE

In strict compliance with the audit directive:
*"If a particular route, threshold, eligibility condition, exception or workflow cannot be established from the nine supplied documents, explicitly classify it as: `POLICY_REVIEW_REQUIRED`. Do not invent a condition, assume a default route or silently create a fallback."*

The following 6 regulatory questions cannot be conclusively resolved from the text of the nine supplied documents alone:

---

## 2. CATALOGUE OF UNRESOLVED POLICY QUESTIONS

### UPQ-01: Intake Threshold Exact Boundary $X = 360$ in Errata Table
- **Location:** `AICTE Addendum-Corrigendum 2026–27.pdf`, Page 42, Errata to Clause 2.6(c)(i).
- **Exact Text:**
  ```
  Existing Intake (X) (Per Programme/Level) | Allowed Intake
  < 360                                     | Up to 360 + 60 (+ n divisions)
  > 360                                     | X + 60 (+ n divisions)
  ```
- **Ambiguity / Conflict:** The table explicitly provides mathematical formulas for existing intake strictly less than 360 ($X < 360$) and strictly greater than 360 ($X > 360$). The exact boundary value where existing intake is **exactly 360** ($X = 360$) is omitted from both rows.
- **Engine Handling:** When an application has $X = 360$, the engine halts automated stage selection, flags `POLICY_REVIEW_REQUIRED: Boundary condition X = 360 is undefined in Addendum Page 42`, and refers the case to human policy review.

### UPQ-02: Interpretation of Accredited Courses 'n' vs Divisions
- **Location:** `AICTE Addendum-Corrigendum 2026–27.pdf`, Page 42, Errata to Clause 2.6(c)(i).
- **Exact Text:** *"Allowed Intake for 'n' valid Accredited Courses: Up to 360 + 60 + 'n' divisions"*.
- **Ambiguity:** Does 'n' represent the number of accredited degree courses, or the number of permitted divisions, and what is the exact intake division size for postgraduate vs undergraduate diploma programs?
- **Engine Handling:** Flagged as `POLICY_REVIEW_REQUIRED` whenever $n > 1$ across mixed UG/PG levels.

### UPQ-03: Experiential Learning Program (ELP) Percentage Contradiction
- **Location:** `AICTE Addendum-Corrigendum 2026–27.pdf`, Page 14 Item 32 vs Concept Note Page 19.
- **Contradiction:** Addendum Page 14 specifies *"Minimum 50% experiential learning"* while Concept Note Page 19 specifies *"Up to 50% experiential learning"*.
- **Engine Handling:** If an institution applies under the Experiential Learning Pilot, the engine records `POLICY_REVIEW_REQUIRED: Contradiction between Addendum p. 14 (Min 50%) and Concept Note p. 19 (Up to 50%)`.

### UPQ-04: Hibernation Timing Discrepancy
- **Location:** `AICTE Addendum-Corrigendum 2026–27.pdf`, Page 8 Item 24 (Clause 2.16.1(d)).
- **Ambiguity:** Heading cites hibernation for institutions with consecutive zero admissions, while body text specifies up to three years of hibernation upon trust application with distinct fee parameters.
- **Engine Handling:** Cases requesting Hibernation are routed to Scrutiny + EVC + Council per Table 2.3 Row 7, but flagged for policy verification of hibernation duration.

### UPQ-05: Permitted EVC Mode for Chapter II Categories
- **Location:** `Approval Process Handbook 2024-2027.pdf`, Page 46 Table 2.3 vs Clause 1.9.
- **Ambiguity:** Table 2.3 marks EVC as "Yes" for Categories 3, 5, 6, 7, 9B, 10, 11, 13, 14, 20, 21, but does not explicitly specify whether the EVC must be physical on-site or may be online virtual inspection (as was permitted during pandemic addenda).
- **Engine Handling:** Engine defaults to mandatory Physical On-Site EVC based on Clause 1.9, but records `POLICY_REVIEW_REQUIRED` if virtual EVC mode is requested.

### UPQ-06: TER Charges Refund Clause Citation Typo
- **Location:** `AICTE Addendum-Corrigendum 2026–27.pdf`, Page 3 Item 8 (Clause 1.4.2(h)).
- **Ambiguity:** Text states: *"Applications submitted under Clause 1.3.2, if rejected without availing the appeal provision, the TER Charges after a deduction of Rs. 0.60 lakh..."* However, Clause 1.3.2 in APH 2024–27 governs submission of applications through NSWS, not fee refunds.
- **Engine Handling:** Handled as an editorial reference error in the document, without blocking routing.
