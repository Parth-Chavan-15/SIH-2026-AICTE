# NIYAMSETU — APH 2024–27 VS ADDENDUM 2026–27 CHANGELOG
**Comprehensive Audit of All Amendments and Errata for Academic Year 2026–27**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**

---

## 1. RECONCILIATION OVERVIEW

This changelog audits every modification introduced by the **AICTE Addendum-Corrigendum 2026–27 (`DOC-01`)** against the foundational **Approval Process Handbook 2024–25 to 2026–27 (`DOC-02`)**.

---

## 2. DETAILED ITEM-BY-ITEM CHANGELOG

### A. CHAPTER I — ESTABLISHMENT OF NEW TECHNICAL INSTITUTIONS

| Addendum Item | APH Clause | Original APH 2024–27 Provision | Modified Addendum 2026–27 Provision | Routing Engine Impact |
|---|---|---|---|---|
| **Item 1** | Clause 1.1(g) | Stated university exemption norms under earlier Supreme Court rulings. | Clarifies State Public, Private, and Central Universities do not mandatorily require AICTE approval, but must apply for ALL programmes if opting in. | Universities applying to AICTE must apply for all technical programmes; partial application rejected. |
| **Item 3** | Clause 1.3.3(b) | Non-Technical Institutions running UG/PG courses. | Clarifies technical institutions running BCA/BBA/BMS and MCA/MBA in Management and Computer Applications. | Categorizes standalone BCA/BBA/BMS into Chapter I / II approval paths. |
| **Item 4–6** | Clause 1.4.2 | TER Charges table for different applicant types. | Updates TER charges schedule and concessions for Women, PwD, and North-Eastern institutions. | Validates fee payment compliance before routing to Scrutiny. |
| **Item 8** | Clause 1.4.2(h) | TER refund upon Scrutiny rejection. | Clarifies Rs. 0.60 lakh deduction if rejected without availing appeal. | Financial tracking parameter. |
| **Item 9** | Clause 1.7.1 | Multidisciplinary / Regional Language Courses. | Promoter may apply for one or more programmes; regional language courses exempted from certain restrictions. | Activates Regional Language Course flag. |
| **Item 10** | Clause 1.12 Table 1.4 | Security Deposit values for new institutions. | Re-specifies exact FDR deposit requirements across programme levels. | Pins post-approval FDR amounts for Chapter I approvals. |

---

### B. CHAPTER II — EXISTING TECHNICAL INSTITUTIONS

| Addendum Item | APH Clause | Original APH 2024–27 Provision | Modified Addendum 2026–27 Provision | Routing Engine Impact |
|---|---|---|---|---|
| **Item 15** | Clause 2.6(L)(i) | Institutions with >50% courses accredited. | Clarifies conditions under which institutions with >50% accredited courses are eligible for autonomous intake expansion. | Evaluates accreditation percentage condition. |
| **Item 16** | Clause 2.6(c) | Increase in Intake / Additional Course requirements. | **Superseded by Errata on Page 42.** See below. | Replaced by Errata Page 42 text. |
| **Item 22** | Clause 2.12(j) | Scrutiny / Re-Scrutiny procedure for existing institutions. | Elaborates on document verification for administrative changes. | Governs checklist evaluation for Chapter II categories. |
| **Item 24** | Clause 2.16.1(d) | Hibernation of technical institutions. | Sets conditions under which an institution may enter hibernation (up to 3 years). | Maps Category 7 (Break-in-EoA / Hibernation) to Scrutiny + EVC + Council. |
| **Item 27** | Clause 2.23.3 | Standing Hearing Committee (SHC) procedure. | Inserts *"wherever applicable"*, confirming SHC is a conditional shortcoming compliance hearing, not an unconditional linear stage. | **CRITICAL:** SHC activates ONLY when shortcomings/deficiencies are referred from Scrutiny or EVC. |
| **Item 28** | Clause 2.25(f) | Typographical error in APH citing Clause 2.3.2 for Security Deposit. | Corrects reference to **Clause 2.12** of APH. Submission of Affidavit 3 within 15 days, with 10% and 20% penalties up to 31 May and 31 July. | Reconciles Security Deposit citation; drives 4-Clock Timer Clock 1. |

---

### C. PAGE 42 FINAL ERRATA — AUTHORITATIVE AMENDMENTS

The Errata on Page 42 represents the highest sessional authority for AY 2026–27:

#### 1. Modification to Clause 2.6(c)(i): Core Branch Mandate
- **Exact Mandate:** Increase in intake or introduction of an additional course at Diploma, Undergraduate, or Postgraduate level in Engineering & Technology is permissible **ONLY if the Institution is already offering a minimum of three (3) core branch courses, of which at least two (2) shall be from non-Computer Science or non-allied disciplines** as defined in Annexure 11 broad classification.
- **Exception:** This provision shall NOT apply to Regional Language Courses.
- **Engine Implementation:** Validates core course count $\ge 3$ and non-CS core count $\ge 2$. If violated and not a regional language course, the engine flags `ELIGIBILITY_FAILED_CORE_BRANCH_DEFICIT`.

#### 2. Modification to Table for Allowed Intake & Evaluation Modes
- **Institutions with Valid NBA (valid up to at least 30th April 2026):**
  - Existing Intake $X < 360$: Allowed Intake is **Up to $360 + 60 + n	ext{ divisions}$** (where $n$ is valid accredited courses).
  - Existing Intake $X > 360$: Allowed Intake is **$X + 60 + n	ext{ divisions}$**.
  - Increase permitted to equal number of courses accredited at respective level/program.
  - Evaluation Mode: **Scrutiny / Re-Scrutiny Only** (Physical EVC is waived).
- **Institutions NOT Having NBA Accreditation:**
  - Existing Intake $X < 360$: Allowed Intake is **Up to $360 + 60$**.
  - Existing Intake $X > 360$: Allowed Intake is **$X + 60$**.
  - Evaluation Mode: **Scrutiny / Re-Scrutiny / EVC** (Physical EVC is MANDATORY).
- **Unresolved Policy Question (`POLICY_REVIEW_REQUIRED`):** The boundary condition where existing intake $X$ is exactly equal to 360 ($X = 360$) is omitted from the table (table specifies $< 360$ and $> 360$). Cases with $X = 360$ are flagged as `POLICY_REVIEW_REQUIRED`.

#### 3. BBA/BCA/BMS Standalone Institutions Supersession
- **Point 2 on Page 42:** *"New and Existing institutions offering BBA/BCA/BMS courses shall be issued 'LoA/EoA' respectively, based on 'As Is Where Is' for the Academic Year 2026-27. (In supersession to AICTE earlier Circular F. No. AICTE/RB-BBA-BMS-BCA/2020-27 dated 6.10.2025)."*
- **Engine Implementation:** BBA/BCA/BMS institutions in AY 2026–27 are processed under the *"As Is Where Is"* statutory directive. Pre-approval facility EVC and unconditional SAC reviews from earlier circular are superseded.

---

### D. CHAPTER IV — UNIVERSITIES

| Addendum Item | APH Clause | Original APH Provision | Modified Addendum Provision | Routing Engine Impact |
|---|---|---|---|---|
| **Item 30** | Clause 4.1(iv) | State Private Universities definition. | Expands definition to include establishment by State/society/trust/company/PPP mode subsequent to gazette notification. | Institutional classification check. |
| **Item 31** | Clause 4.7 | Evaluation of Application Category A: Autonomous Category. | Universities meeting NIRF/NAAC thresholds considered under Autonomous Category with NIL deficiency. | Dependent on UGC Autonomous regulations -> Deferred to `FUTURE_DEVELOPMENT`. |

---

### E. CHAPTER V — ODL AND ONLINE LEARNING

| Addendum Item | APH Clause | Original APH Provision | Modified Addendum Provision | Routing Engine Impact |
|---|---|---|---|---|
| **Item 32** | Clause 5.3.8 | Universities applying for ODL/OL required at least two batch pass outs. | Reduced to **one batch pass out** for applying for ODL / OL. | Evaluates `facts.passOutBatches >= 1`. |
| **Item 32 Note** | Clause 5.3.8 Note | Procedural stages for ODL/OL. | Explicitly specifies: **"All the Proposals will be evaluated with SC & EVC."** | ODL/OL applications mandatorily route through Scrutiny Committee AND Expert Visit Committee before Council decision. |
