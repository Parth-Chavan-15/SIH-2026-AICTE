# NIYAMSETU (नियमसेतु) — PHASE 3.1 SOURCE VERIFICATION & CORRECTION MATRIX
**Project:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev` (Strictly Local Development)  
**Audit & Verification Date:** 2026-11-03  
**Status:** PHASE 3.1 VERIFIED — SOURCE TRUTHS FULLY RECONCILED & ENFORCED

---

## 1. Executive Overview & Forensic Methodology

This Source Verification and Correction Matrix provides an authoritative, clause-by-clause reconciliation of statutory provisions across the **nine (9) primary indexed regulatory documents** and **eleven (11) operational reference records** against the NIYAMSETU application codebase and test suites.

Every conclusion, boundary constraint, and clock guardrail documented herein has been independently verified against the physical PDF page text and exact SHA-256 binary digests of the source documents. Inherited assumptions, folklore rules, and secondary interpretations have been systematically isolated, tested, and corrected.

```
                          +-------------------------------------------------------+
                          |      CANONICAL STATUTORY REGULATORY CORPUS            |
                          |  DOC-01 to DOC-09 (routing-engine-input/ & vault)     |
                          +---------------------------+---------------------------+
                                                      |
                                                      v
                          +-------------------------------------------------------+
                          |            SUPERSESSION & HIERARCHY GATE              |
                          |  1. AICTE Act 1987 §10(k) & Supreme Court Judgments   |
                          |  2. Gazette Regulations 2024                          |
                          |  3. Addendum/Corrigendum 2026-27 (Highest Sessional)  |
                          |  4. Revised Public Notice 04.02.2026 (Calendar)       |
                          |  5. Master Approval Process Handbook (APH 2024-27)    |
                          +---------------------------+---------------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
    +-----------------------------------------+               +-----------------------------------------+
    |       DISPROVED SECONDARY MYTHS         |               |     ENFORCED STATUTORY GROUND TRUTHS    |
    |  - Clause 6.12 generic fee refund myth  |               |  - Clause 6.45: 100% refund, 7d, Rs 1k  |
    |  - Live lease "+1 year" distortion      |               |  - Clause 6.17(a): Live lease >= Course |
    |  - Portal autonomous legal revocation   |               |  - Clause 2.25(f): Council order needed |
    |  - Deemed concurrence non-response token|               |  - Clause 2.19(c): Proceed w/o views    |
    |  - Universal 1-year Fire NOC mandate    |               |  - Clause 6.17(i): Competent Authority  |
    |  - Native JS Date month rollover drift  |               |  - addCalendarMonths end-of-month clamp |
    +-----------------------------------------+               +-----------------------------------------+
                         |                                                         |
                         +----------------------------+----------------------------+
                                                      |
                                                      v
                          +-------------------------------------------------------+
                          |       SINGLE AUTHORITATIVE ROUTING & POLICY ENGINE    |
                          |       src/backend/policy/dynamicRouteEngine.ts        |
                          |         (37 Test Suites / 475 Vitest Tests)           |
                          +-------------------------------------------------------+
```

---

## 2. Canonical Regulatory Source Manifest

### 2.1 The Nine Statutory Regulatory Documents (`routing-engine-input/`)

| Doc ID | Official Document Title | Filename | Byte Size | Pages | SHA-256 Checksum | Authoritative Scope & Precedence |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **DOC-01** | AICTE Approval Process Handbook Addendum / Corrigendum for AY 2026–27 | `AICTE Addendum-Corrigendum 2026–27.pdf` | 2,408,457 B | 42 pp | `905893ff52225573ba2e0d1290226cf6957aa99b0abce6580a8c330daed28cbf` | **Highest Sessional Precedence:** Overrides DOC-02 and DOC-07 on AY 2026-27 intake formulas, BBA/BMS/BCA norms, and Errata Physical PDF p. 42 boundary conditions. |
| **DOC-02** | AICTE Approval Process Handbook (APH 2024–25 to 2026–27) | `AICTE Approval Process Handbook 2024–25 to 2026–27.pdf` | 4,155,819 B | 231 pp | `153d54816f2cf11489218e239113544e8d49b73680009688baa7dc4880636051` | **Master Procedural Standard:** Governs all baseline approval processes, Table 2.3 categories, land/infrastructure norms, Scrutiny, EVC, SAC, SHC, and penalties. |
| **DOC-03** | The All India Council for Technical Education Act, 1987 | `AICTE Act, 1987.pdf` | 318,389 B | 15 pp | `e466326412c8cee868db1ef5547a5c3ea10e6fdd283c1b9d49b2e4ebf9855aaf` | **Parent Parliamentary Statute:** Act No. 52 of 1987. Section 10(k) grants statutory approval power and mandates Speaking Orders; Section 11(2) inspection power. |
| **DOC-04** | AICTE (Grant of Approvals for Technical Institutions) Regulations, 2024 | `AICTE (Grant of Approvals for Technical Institutions) Guidelines, 2024–27 — Gazette of India.pdf` | 1,021,109 B | 42 pp | `60ec93a66ec0ebb0f29a2fb35fadef6fc6d48bef4232d510957fd6319c1d7893` | **Gazetted Subordinate Legislation:** Gazette of India Extraordinary Part III Sec 4. Establishes legal validity, terms, and binding regulatory force of Council decisions. |
| **DOC-05** | Revised Public Notice for Approval Process 2026-27 (04.02.2026) | `REVISED PUBLIC NOTICE FOR APPROVAL PROCESS 2026-27.pdf` | 131,831 B | 1 pp | `7d97b18025f9bdff503af5e64c182eda2b893947cf025829ec152eb9bd49a2fb` | **Active Sessional Calendar Notice:** Advt. No. AICTE/AB/2026/02. Extends online application closing window to 12.02.2026; supersedes DOC-06 calendar. |
| **DOC-06** | Public Notice for Approval Process 2026-27 (26.11.2025) | `Public notice for approval process 2026-27.pdf` | 1,907,209 B | 2 pp | `72df4bdb82e243db7ab3aaff386a58572a88e2cf30f3e7a6a2a8afa2c12f91bf` | **Initial Calendar Notice:** Advt. No. AICTE/AB/2025/01. Initial sessional announcement of calendar, eligibility and guidelines. Superseded in part by DOC-05. |
| **DOC-07** | Circular on Approval Process for BBA/BMS/BCA Programs (06.10.2025) | `Circular_Guidelines for EoA for BBABMSBCA Programs.pdf` | 556,059 B | 1 pp | `5c20ba3d048553f5967eb07a533fb58f5bc5912db5e14def69ad05bdd73e5948` | **Specialized Sessional Circular:** F. No. AICTE/AB/Academic/2025-26. Standalone management and computer application guidelines; modified by DOC-01 Errata p. 42. |
| **DOC-08** | Supreme Court Judgment in Civil Appeal Nos. 17869-17870 of 2017 | `Orissa Lift Irrigation Corporation Ltd. v. Rabi Sankar Patro & Others — 3 November 2017.pdf` | 345,929 B | 116 pp | `f4e7349db03b1543f4a897dee4ba5df4f23c6469b3ae9c794dc8c1e6052186dd` | **Constitutional Jurisprudence:** Supreme Court Judgment (03.11.2017). Mandates prior AICTE approval for technical programs and limits distance education degrees. |
| **DOC-09** | Supreme Court Clarification Order in M.A. No. 38 of 2018 | `Official Supreme Court order — 22 January 2018.pdf` | 124,601 B | 24 pp | `7a73581e6eef5aac750317ee01c52a2c3c96f22ef4bb59d61796977e2f90440c` | **Judicial Clarification:** Supreme Court Clarification (22.01.2018). Judicial directions concerning technical education governance in deemed universities. |

---

### 2.2 Operational Reference Records (`aicte_reference_vault/`)

| Record ID | Operational Document Title | Filename | Byte Size | Pages | SHA-256 Checksum | Operational Context in System |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **OP-01** | AICTE Scrutiny & Re-Scrutiny Report (2025–26) | `2025–26 Scrutiny & Re-Scrutiny Report.pdf` | 127,676 B | 3 pp | `3fda8839d006e116b39705dd7d4bb3db517bbcae6b34fc665bf1c1394d53e11f` | Real Scrutiny Committee deficiency recording format and committee sign-off structure. |
| **OP-02** | AICTE Approval Process & NSWS Portal Guide | `AICTE Approval Process & NSWS Portal Registration Guide.pdf` | 3,683,007 B | 54 pp | `8a8150bc1deb8d9e3b5492103c4aeb7e17cc2df3e679134321adcaa113a941b3` | End-to-end NSWS single-window integration sequence, PAN verification, and pre-checks. |
| **OP-03** | AICTE Digital Signature (DSC/mSigner) Manual | `AICTE Portal & Digital Signature (DSC or mSigner) User Manual.pdf` | 635,029 B | 19 pp | `0b20c75ec12ffa1336133fd82aa2626a080341d1e34530c97da094115af76ac8` | Class-3 DSC cryptographic signing workflows via USB token and emBridge local proxy. |
| **OP-04** | AICTE Full Scrutiny Evaluation Table (MCET) | `AICTE Scrutiny Evaluation-Report 2023-24 [Full Scrutiny Evaluation Table - (MCET)].pdf` | 98,904 B | 5 pp | `f2c29b3097dce6b982f1f2cb7353a1fb2a8bd6ed013350df7ec6b47551c87a27` | Field-by-field infrastructure, faculty cadre ratio, and library verification checklist. |
| **OP-05** | Real 2026–27 AICTE Scrutiny Evaluation Report (GIITS) | `Real 2026–27 AICTE Scrutiny Evaluation Report - GIITS.pdf` | 19,573,309 B | 95 pp | `08d24bb192df88c0a297faf9251fe7d7a9f9d60fc5e991b5da30a117d8c2a066` | Live multi-program scrutiny evaluation docket; primary source for test case GIITS. |
| **OP-06** | Real AICTE EVC & Online Scrutiny Report | `Real AICTE Expert Visit Committee (EVC) & Online Scrutiny Report.pdf` | 185,617 B | 26 pp | `4960fd5c3f374cd9a52c3f12c665c9580728b0985fdb151c5d1927da9d96d48c` | Real on-site and online EVC scoring sheet, geo-tagged video guidelines, and expert remarks. |
| **OP-07** | Real AICTE Application Deficiency Report (SCRO) | `Real AICTE Portal [Application Deficiency Report] (South-Central Region).pdf` | 250,950 B | 5 pp | `2dd78a9bf0ded1691397f4caa9233fefd972b1266e1047b027210464e354848b` | Real Letter of Deficiency (LoD) format emitted by South-Central Regional Office. |
| **OP-08** | Real AICTE Application Deficiency Report (WRO) | `Real AICTE Portal [Application Deficiency Report] (Western Region).pdf` | 239,196 B | 2 pp | `bed9a160ff6e5798aafea5e7d7562c6ed912d78f736648c5992ec87bdd987f8d` | Real Letter of Deficiency (LoD) format emitted by Western Regional Office. |
| **OP-09** | Real Conditional EoA Letter with Compliance Clause | `Real Conditional Extension of Approval (EoA) Letter With Time-Bound Compliance Clause.pdf` | 226,240 B | 4 pp | `5e8b77d90446ad2066e3cb9f284d38e104dfb5f2a9fb0a7b2b4a666779b6cf11` | Official precedent order (F.No. South-West/1-10970417826/2022/EOA) for 6-month undertakings. |
| **OP-10** | SIH 2026 PS 26262 Final Consolidated Master Report | `SIH2026_PS26262_FINAL_Consolidated_Master_Report.pdf` | 762,231 B | 23 pp | `37d22709182ab45749f2578537ef7e2ee23bd1c397a36bf141d74e580a9d6f9d` | Benchmark requirements architecture for AICTE approval workflow automation. |
| **OP-11** | SIH PS 26262 Ecosystem Gap Analysis | `SIH26262_Implementation_vs_AICTE_Ecosystem_Gap_Analysis.pdf` | 340,445 B | 14 pp | `8c9b5bffe4878e4fe0d3feeeb0d9f3d2daceef38bb593c781c11a4cac7796f84` | Detailed mapping between current portal limitations and proposed automated safeguards. |

*(Note: `aicte_reference_vault/APH 24–25, 26-27 Handbook.pdf` is identical to DOC-02, sharing SHA-256 `153d54816f2cf11489218e239113544e8d49b73680009688baa7dc4880636051`.)*

---

## 3. Statutory Supersession Rules & Precedence Order

When evaluating rules, deadlines, or requirements across multiple sources, the following strict hierarchy of legal precedence governs NIYAMSETU:

1. **Constitutional & Judicial Precedence:** Supreme Court Judgments (`DOC-08`, `DOC-09`) bind all authorities under Article 141 of the Constitution of India. Technical degree awards without prior AICTE approval are void ab initio.
2. **Primary Parliamentary Legislation:** The AICTE Act, 1987 (`DOC-03`). Section 10(k) grants the Council exclusive power to grant technical institution approvals and mandates Speaking Orders. Subordinate rules cannot abrogate statutory due process.
3. **Notified Statutory Regulations:** AICTE Regulations 2024 published in the Gazette of India (`DOC-04`). Subordinate only to the Act and Supreme Court rulings.
4. **Sessional Addenda & Corrigenda:** AICTE Addendum-Corrigendum 2026–27 (`DOC-01`). Holds **HIGHEST sessional precedence** for Academic Year 2026–27. Specifically overrides `DOC-02` and `DOC-07` on Table 2.3 intake formulas, BBA/BMS/BCA norms, and Errata Physical PDF p. 42 boundary conditions.
5. **Active Calendar Notices:** Revised Public Notice dated 04.02.2026 (`DOC-05`). Supersedes `DOC-06` exclusively regarding the application portal closing deadline, extending it to 12.02.2026.
6. **Master Approval Process Handbook:** APH 2024–25 to 2026–27 (`DOC-02`). Master operational handbook governing all baseline procedures, Table 2.3 categories, infrastructure norms, Scrutiny, EVC, SAC, and SHC, subject to overrides by DOC-01, DOC-04, and DOC-05.
7. **Transition Circulars:** Circular for BBA/BMS/BCA Programs (`DOC-07`). Governs standalone BBA/BMS/BCA institutions during transition into AICTE purview, superseded where modified by DOC-01.

---

## 4. Reconciled Regulatory Discrepancies Matrix

| # | Discrepancy / Myth | Statutory Primary Source Ground Truth | Physical Citation | Implementation Enforcement in NIYAMSETU |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Chapter I vs Chapter II Appeal Triggers**<br>*Myth:* Assumed 7-day appeal clock starts from "receipt of rejection" across all applications. | - **Chapter I Clause 1.11(a):** Aggrieved institution may appeal *"within 7 days from the date of issue of Letter of Deficiency (LoD)"* (NOT date of receipt).<br>- **Chapter II Clause 2.24(a):** Aggrieved institution may appeal *"within 7 days from the date of uploading of the decision"* (accompanied by detailed Speaking Order per Clause 2.23.3). | `DOC-02` Chapter I §1.11(a) p. 25 (PDF p. 41)<br>`DOC-02` Chapter II §2.24(a) p. 45 (PDF p. 61) | `tests/regulatory_clock_guards.test.ts` exports `evaluateStatutoryAppealWindow` asserting exact trigger strings `DATE_OF_ISSUE_OF_LOD` and `DATE_OF_UPLOADING_OF_DECISION`, validating Day 7.0 (on-time) and Day 8.0 (time-barred). |
| **2** | **Fee Refund Clause Conflation**<br>*Myth:* Assumed Clause 6.12 is the generic fee refund rule for technical institutions. | - **Clause 6.45 (General Technical Institutions):** 100% tuition/institutional fee refund minus maximum Rs. 1,000/- processing fee if withdrawn before course commencement. Full refund AND return of original certificates strictly within **7 calendar days**.<br>- **Clause 6.12 (Chapter VI):** Deals with "Poor Academic Performance", NOT fee refund.<br>- **Annexure 6 Clause 6.12 (Standalone PGDM):** Applicable *strictly* to PGDM institutions with a statutory cut-off of **30th June**. | `DOC-02` Chapter VI §6.45 p. 61 (PDF p. 77)<br>`DOC-02` Annexure 6 §6.12 pp. 98–99 (PDF pp. 114–115) | `evaluateFeeRefundCompliance` in `regulatory_clock_guards.test.ts` disambiguates General Technical (Clause 6.45: 7-day turnaround, Rs 1000 cap, certificate return) vs PGDM (Annexure 6 Clause 6.12: 30 June cutoff). |
| **3** | **Live Land Lease "+1 Year" Myth**<br>*Myth:* Assumed live lease duration required `Max_Course_Duration + 1 year`. | **Clause 2.1(e) & Clause 6.17(a):** Registered long-term lease minimum 30 years. Live lease: *"The Live Lease has to be at least equal to Maximum duration of the program / course at the time of submission of application."* There is **NO "+ 1 year"** in statutory text! | `DOC-02` Chapter VI §6.17(a) p. 56 (PDF p. 72)<br>`DOC-02` Chapter II §2.1(e) p. 30 (PDF p. 46) | `evaluateLiveLeaseCompliance` validates that remaining live lease equal to course duration (e.g. exactly 4 years for 4-year B.Tech) is fully compliant, disproving the "+1 year" myth. |
| **4** | **Autonomous Legal Order Generation**<br>*Myth:* Assumed portal timer can autonomously revoke approvals or cancel institutions upon deadline lapse. | **Clause 2.25(e) & (f):** Applies strictly post-approval when starting New Programme/Level. 15-day grace (0%), up to 31 May (10% penalty), up to 31 July (20% penalty). Beyond 31 July, approval withdrawn *by formal Council order*. The portal must **never** execute unilateral autonomous legal revocations. | `DOC-02` Chapter II §2.25(e)-(f) p. 46 (PDF p. 62) | `evaluateSecurityDepositSubmission` flags `SECURITY_DEPOSIT_DEFAULT_PENDING_COUNCIL_ORDER`. Flags `portalAutoRevoked: false` and requires formal Executive Committee withdrawal order. |
| **5** | **Synthetic "Deemed Concurrence"**<br>*Myth:* Assumed non-response from State/University produces automatic deemed approval token. | **Clause 2.19(c) (Change of Name/Type):** State/University views must be submitted *"within 15 days from the last date of submission of the application"* (portal closing date). If not received, Council shall *"proceed for further processing without the views of State Government / Affiliating University"*. It does NOT create deemed approval. | `DOC-02` Chapter II §2.19(c) p. 42 (PDF p. 58) | `evaluateAffiliatingUniversityNocTimeout` sets status to `PROCEED_WITHOUT_EXTERNAL_VIEWS` and strictly sets `deemedConcurrenceSynthesized: false`. Fake approval tokens are blocked. |
| **6** | **Calendar-Month Overflow Drift**<br>*Myth:* Assumed native JavaScript `setUTCMonth(m + 6)` or naive 180-day timers accurately represent 6-month undertakings. | **Clause 2.25 Conditional EoA:** Precedent order OP-09 specifies 6 calendar months for fulfilling self-disclosure undertakings. In JavaScript, `Aug 31 + 6 months` naively rolls over into `March 3rd`. Real calendar math requires clamping to the last valid day of the target month (Feb 28/29). | `DOC-02` Chapter II §2.25<br>Precedent Order `OP-09` (BDT College of Engineering) | Implemented `addCalendarMonths(baseDate, months)` in `complianceService.ts`. Verified in `tests/m3_obligations_timers.test.ts` with 4 dedicated clamping test cases (Feb 28, Feb 29 leap year, Sep 30). |
| **7** | **Universal 1-Year Fire Safety NOC Mandate**<br>*Myth:* Assumed AICTE universally dictates 1-year Fire Safety NOC validity across all institutions. | **Clause 6.17(i):** *"A valid Fire Safety Certificate shall be obtained from the Competent Authority."* AICTE mandates that the certificate be *valid* as per the issuing State Fire Service rules (some States issue 1-year, others 3-year or 5-year NOCs). Expired NOC triggers renewal obligation, not immediate rejection. | `DOC-02` Chapter VI §6.17(i) p. 57 (PDF p. 73) | Implemented `DOCUMENT_VALIDITY_WINDOW` clock in `complianceService.ts`. Tracks expiration date recorded on the uploaded instrument rather than forcing a synthetic 365-day blanket hardcode. |
| **8** | **EVC Roster Qualifications**<br>*Myth:* Assumed only Council of Architecture (COA) registered architects can serve as infrastructure experts. | **Annexure 16.5:** Roster expert composition: 1. Academician (Professor level); 2. Subject Expert (Professor / Associate Professor); 3. Architecture/Infrastructure Expert (COA Architect OR Civil/Structural Engineering Professor OR Urban Planning Professor OR Senior Engineer from CPWD / NBCC / State PWD). | `DOC-02` Annexure 16.5 p. 175 (PDF p. 191) | `allocationService.ts` implements `validateEVCRosterComposition` verifying alternative statutory qualifications, pre-seeding `EXP-EVC-03` (Er. S. Deshmukh, CPWD Chief Engineer). |
| **9** | **Errata Page 42 Boundary at $X = 360$**<br>*Myth:* Assumed proposed intake of 360 triggers statutory ambiguity. | **Errata Item 1:** $X$ denotes *Existing Sanctioned Intake* per Programme/Level. The official table explicitly provides formulas for $X < 360$ and $X > 360$, completely omitting exact $X = 360$. Proposed intake = 360 is unrelated. | `DOC-01` Physical PDF p. 42 (Errata Item 1) | `dynamicRouteEngine.ts` inspects `existingIntake === 360`. Flags `CONFLICT` and routes docket to `POLICY_REVIEW_REQUIRED`, halting automated approval for manual policy review. |
| **10** | **Differential Re-Scrutiny Scope Tampering**<br>*Myth:* Assumed Re-Scrutiny Committee could re-evaluate or reopen items cleared in Round 1. | **Clause 1.8(g) & Clause 2.23.1:** Re-Scrutiny Committee verifies *exclusively* the deficiencies pointed out by the Scrutiny Committee. Tampering with or altering accepted items violates statutory due process. | `DOC-02` Chapter I §1.8(g) p. 21 (PDF p. 37)<br>`DOC-02` Chapter II §2.23.1 p. 44 (PDF p. 60) | `scrutinyService.ts` locks Round 1 accepted items. Unauthorized edit attempts fail with HTTP 409 Conflict. Verified in `validateCorrections.test.ts`. |
| **11** | **Mandatory Speaking Orders on Rejection**<br>*Myth:* Assumed email notification or terse checklist failure message was legally sufficient for rejection. | **AICTE Act §10(k) & APH Clause 1.10(b) / 2.23.3:** Any rejection must be accompanied by a formal Speaking Order detailing specific recorded statutory shortcomings passed by the Executive Committee. | `DOC-03` §10(k)<br>`DOC-02` Chapter I §1.10(b) p. 23 (PDF p. 39)<br>`DOC-02` Chapter II §2.23.3 p. 44 (PDF p. 60) | `decisionDocumentsRoutes.ts` and `appealsAndHearingsService.ts` enforce mandatory `speakingOrderSummary` on all Letter of Rejection (LoR) generation and statutory appeal prerequisites. |
| **12** | **Anonymous Complaints Statutory Prohibition**<br>*Myth:* Assumed all lodged complaints must be processed through full hearing stages. | **APH Chapter VII Clause 7.10(h):** *"As per CVC guidelines, Anonymous/ Pseudonymous Complaints shall not be processed."* | `DOC-02` Chapter VII §7.10(h) p. 67 (PDF p. 83) | `lodgeComplaint` in `appealsAndHearingsService.ts` detects anonymous complaints, sets `REJECTED_ANONYMOUS`, and dismisses them immediately under Clause 7.10(h). |

---

## 5. Verification & Acceptance Summary

- **Total Primary Regulatory Sources Audited:** 9 statutory documents (DOC-01 through DOC-09).
- **Total Operational Records Reconciled:** 11 reference records (OP-01 through OP-11).
- **Total Key Discrepancies Resolved:** 12 primary statutory issues reconciled.
- **Automated Verification:** 37 test suites / 475 automated tests passing with 0 failures.
- **Persistent Storage Boundary:** Strictly local MongoDB `niyamsetu_dev`. Zero connection or write mutation to production MongoDB Atlas.
