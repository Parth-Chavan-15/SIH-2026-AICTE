# NIYAMSETU — AUTHORITATIVE ROUTE DECISION MATRIX
**Deterministic Regulatory Logic Mapping Inputs to Statutory Workflows**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**

---

## 1. MATRIX OVERVIEW & LEGEND

This matrix establishes the definitive application-category-to-processing-stage rules. The engine selects the processing path deterministically without guessing or relying on frontend conditional fallbacks.

### Legend:
- **`YES`**: Mandatory linear stage for all applications in this category.
- **`EXEMPT` / `-`**: Stage is skipped by statutory exemption.
- **`CONDITIONAL`**: Stage activates only when specific verified facts/predicates are satisfied.
- **`AA` (As Applicable)**: Stage activates ONLY upon documented shortcomings from the preceding stage (e.g. Scrutiny deficiency or EVC shortfall), followed by Executive Committee speaking order.
- **`7-DAY SAC`**: Standing Appellate Committee appeal window active for 7 days from uploading of rejection speaking order.
- **`FD`**: Future Development dependency on additional UGC regulatory documents.

---

## 2. MASTER ROUTE DECISION MATRIX

| Category Code | Category Description | Applicable Chapter | Self-Disclosure | Initial Scrutiny (1.8) | Re-Scrutiny (1.8g) | EVC (1.9) | EVC Mode | Conditional SHC (2.23.3) | Executive Committee | Council Decision (10k) | Post-Approval Obligations | Source Citation | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `CAT-CH1-NEW` | Setting up New Technical Institution | Chapter I | Yes (NSWS) | YES | CONDITIONAL (Deficiency cure 15d) | YES | Physical Inspection | AA (Shortcoming hearing) | YES | YES (Grant of Approval LoA) | Security Deposit FDR (1.12 Table 1.4) within 15d | APH Ch I, Addendum p. 3 | **FULLY IMPLEMENTED** |
| `CAT-CH2-01` | Extension of Approval (EoA) Self-Disclosure | Chapter II | YES (Affidavit 2) | EXEMPT | EXEMPT | EXEMPT | None (Surprise check 2.3.5 only) | AA (If complaint/penalty) | Consolidated Ratification | YES (Delegated EoA) | Annual compliance & 4-Clock Timers | APH Clause 2.5, Table 2.3 Row 1 | **FULLY IMPLEMENTED** |
| `CAT-CH2-02` | Seats for Non-Resident Indian(s) | Chapter II | YES | EXEMPT | EXEMPT | EXEMPT | None | AA | Consolidated Ratification | YES | Tuition fee norms & audit | APH Clause 2.11, Table 2.3 Row 2 | **FULLY IMPLEMENTED** |
| `CAT-CH2-03` | Conversion Diploma to Degree & vice-versa | Chapter II | - | YES | CONDITIONAL | YES | Physical Campus Inspection | AA | YES | YES | Security Deposit balance FDR (2.25d) | APH Clause 2.19, Table 2.3 Row 3 | **FULLY IMPLEMENTED** |
| `CAT-CH2-04` | Change Name Institution / Affiliating Board | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Updated land deed & trust resolution | APH Clause 2.20, Table 2.3 Row 4 | **FULLY IMPLEMENTED** |
| `CAT-CH2-05` | Start New Programme / Level in Existing Inst | Chapter II | - | YES | CONDITIONAL | YES | Physical Inspection | AA | YES | YES | Security Deposit FDR (2.25e) | APH Clause 2.7, Table 2.3 Row 5 | **FULLY IMPLEMENTED** |
| `CAT-CH2-06` | Merger of Institutions in Same Campus/City | Chapter II | - | YES | CONDITIONAL | YES | Physical Contiguity Check | AA | YES | YES | Surrender of excess approvals & FDR | APH Clause 2.21, Table 2.3 Row 6 | **FULLY IMPLEMENTED** |
| `CAT-CH2-07` | Break-in-EoA / Restoration / Hibernation | Chapter II | - | YES | CONDITIONAL | YES | Physical Verification | AA | YES | YES | Restoration fee & affidavit | APH Clause 2.16.1, Addendum p. 8 | **FULLY IMPLEMENTED** |
| `CAT-CH2-08` | Supernumerary Seats FN / OCI / Gulf | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Dedicated hostel amenities & reporting | APH Clause 2.22, Table 2.3 Row 8 | **FULLY IMPLEMENTED** |
| `CAT-CH2-09A` | Increase Intake [WITH Valid NBA Accreditation] | Chapter II | - | YES | CONDITIONAL | **EXEMPT** (Waived Errata p. 42) | None | AA | YES | YES | Proportionate faculty appointment | Addendum p. 42 Clause 2.6(c)(i) | **FULLY IMPLEMENTED** |
| `CAT-CH2-09B` | Increase Intake [WITHOUT NBA Accreditation] | Chapter II | - | YES | CONDITIONAL | **YES** (Mandatory Errata p. 42) | Physical Inspection | AA | YES | YES | Proportionate faculty & lab infra | Addendum p. 42 Clause 2.6(c)(i) | **FULLY IMPLEMENTED** |
| `CAT-CH2-10` | Introduction of Integrated / Dual Degree | Chapter II | - | YES | CONDITIONAL | YES | Physical Inspection | AA | YES | YES | University affiliation concurrence | APH Clause 2.15, Table 2.3 Row 10 | **FULLY IMPLEMENTED** |
| `CAT-CH2-11` | Fellow Programme in Management (FPM) | Chapter II | - | YES | CONDITIONAL | YES | Physical Inspection | AA | YES | YES | Research guides & library norms | APH Clause 2.13, Table 2.3 Row 11 | **FULLY IMPLEMENTED** |
| `CAT-CH2-12` | Change Name of Course / Reduction Intake | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Student protection undertaking | APH Clause 2.8, 2.9, 2.10 | **FULLY IMPLEMENTED** |
| `CAT-CH2-13` | Collaboration & Twinning Programme | Chapter II / III | - | YES | CONDITIONAL | YES | Physical Inspection | AA | YES | YES | Top 500 QS ranking & UGC compliance | APH Chapter III, Table 2.3 Row 13 | **PARTIALLY (UGC: FD)** |
| `CAT-CH2-14` | Change of Site / Location | Chapter II | - | YES | CONDITIONAL | YES | Mandatory Physical Site Inspection | AA | YES | YES | Encumbrance-free land deed & Master Plan | APH Clause 2.17, Table 2.3 Row 14 | **FULLY IMPLEMENTED** |
| `CAT-CH2-15` | Closure of the Institution | Chapter II | - | YES | CONDITIONAL | EXEMPT | None (Unless dispute) | AA | YES | YES | Student migration NOCs & liabilities | APH Clause 2.16.2, Table 2.3 Row 15 | **FULLY IMPLEMENTED** |
| `CAT-CH2-16` | Conversion Women's Institution to Co-ed | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Security Deposit balance FDR (2.25d) | APH Clause 2.18, Table 2.3 Row 16 | **FULLY IMPLEMENTED** |
| `CAT-CH2-17` | Closure of Programme(s) / Course(s) | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Transcripts & faculty redeployment | APH Clause 2.16.3, Table 2.3 Row 17 | **FULLY IMPLEMENTED** |
| `CAT-CH2-18` | Change in the Bank Details | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Resolution of Governing Body & Bank NOC | APH Clause 2.23, Table 2.3 Row 18 | **FULLY IMPLEMENTED** |
| `CAT-CH2-19` | Change Name of Trust / Society / Company | Chapter II | - | YES | CONDITIONAL | EXEMPT | None | AA | YES | YES | Charity Commissioner / RoC Certificate | APH Clause 2.20.2, Table 2.3 Row 19 | **FULLY IMPLEMENTED** |
| `CAT-CH2-20` | Converted to Deemed-to-be-University | Chapter II / IV | - | YES | CONDITIONAL | YES | Physical Inspection | AA | YES | YES | MoE Gazette Notification & AICTE EoA | APH Chapter IV, Table 2.3 Row 20 | **PARTIALLY (UGC: FD)** |
| `CAT-CH2-21` | Online Learning / ODL courses | Chapter II / V | - | YES | CONDITIONAL | YES (Mandatory Addendum p. 13) | Physical / Telemetry Inspection | AA | YES | YES | E-content, LMS & one batch pass out | Addendum p. 13 Clause 5.3.8 | **PARTIALLY (UGC: FD)** |
| `CAT-BBA-BCA` | Standalone BBA / BCA / BMS Institutions | Chapter II & Errata p. 42 | YES | EXEMPT (As Is Where Is) | EXEMPT | EXEMPT | None | AA | Consolidated Ratification | YES (As Is Where Is EoA) | Proportionate faculty if intake increased | Addendum Errata p. 42 Item 2 | **FULLY IMPLEMENTED** |
