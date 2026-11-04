# NIYAMSETU — ROUTE TEST CATALOGUE
**Automated Test Specifications Derived Directly from Authoritative Source Matrix**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**

---

## 1. TEST SUITE STRUCTURE

The automated routing test suite (`tests/policy/routing.test.ts`) verifies every documented application category, processing combination, conditional stage, and error boundary with exact source citations.

---

## 2. TEST CASE MATRIX

| Test ID | Test Category | Target Category / Clause | Input Parameters / Facts | Expected Routing Outcome | Exact Statutory Source Reference |
|---|---|---|---|---|---|
| `TC-ROUTE-01` | Positive Eligibility | Category 1 (New Technical Institution) | `category: 'new_institution', program: 'engineering', nswsId: 'NSWS-2026-001'` | `stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']` | APH 2024–27 Chapter I Clauses 1.1–1.10, Addendum p. 3 |
| `TC-ROUTE-02` | Sessional Exemption | Category 2 (EoA Self-Disclosure) | `category: 'extension_of_approval', hasIntakeExpansion: false` | `stages: ['submitted', 'decision_pending']` (Scrutiny & EVC skipped) | APH 2024–27 Chapter II Clause 2.5 & Table 2.3 Row 1 |
| `TC-ROUTE-03` | Conditional Branching | Category 9A (Intake Increase WITH NBA) | `category: 'increase_intake', nbaAccredited: true, coreBranches: 3, nonCsCore: 2, existingIntake: 240, proposedIntake: 300` | `stages: ['submitted', 'scrutiny_pending', 'decision_pending']` (EVC skipped) | Addendum 2026–27 Page 42 Errata Clause 2.6(c)(i) Item (a) |
| `TC-ROUTE-04` | Conditional Branching | Category 9B (Intake Increase WITHOUT NBA) | `category: 'increase_intake', nbaAccredited: false, coreBranches: 3, nonCsCore: 2, existingIntake: 240, proposedIntake: 300` | `stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']` (EVC mandatory) | Addendum 2026–27 Page 42 Errata Clause 2.6(c)(i) Item (d) |
| `TC-ROUTE-05` | Negative Eligibility | Intake Increase Core Branch Deficit | `category: 'increase_intake', coreBranches: 2, nonCsCore: 1, isRegionalLanguage: false` | `result: 'review_required', error: 'ELIGIBILITY_FAILED_CORE_BRANCH_DEFICIT'` | Addendum 2026–27 Page 42 Errata Clause 2.6(c)(i) |
| `TC-ROUTE-06` | Statutory Exception | Intake Increase Regional Language Course | `category: 'increase_intake', coreBranches: 1, isRegionalLanguageCourse: true` | Permitted (Regional Language exception applies) | Addendum 2026–27 Page 42 Errata Clause 2.6(c)(i) |
| `TC-ROUTE-07` | Mandatory Physical EVC | Category 14 (Change of Site / Location) | `category: 'change_of_site'` | `stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']` (EVC Mode: Physical Site) | APH 2024–27 Chapter II Clause 2.17 & Table 2.3 Row 14 |
| `TC-ROUTE-08` | Scrutiny Only | Category 4 (Institution Name Change) | `category: 'name_change_institution'` | `stages: ['submitted', 'scrutiny_pending', 'decision_pending']` (EVC skipped) | APH 2024–27 Chapter II Table 2.3 Row 4 |
| `TC-ROUTE-09` | Sessional Supersession | BBA / BCA / BMS Standalone Institutions | `category: 'bba_bca_bms'` | `stages: ['submitted', 'decision_pending']` (Issued LoA/EoA on As Is Where Is) | Addendum 2026–27 Page 42 Errata Item 2 |
| `TC-ROUTE-10` | Mandatory EVC | Category 21 (ODL / Online Courses) | `category: 'odl_courses', passOutBatches: 1` | `stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']` | Addendum 2026–27 Page 13 Item 32 & Table 2.3 Row 21 |
| `TC-ROUTE-11` | Negative Eligibility | ODL Course Without Pass Out Batch | `category: 'odl_courses', passOutBatches: 0` | `result: 'review_required', error: 'ELIGIBILITY_FAILED_NO_PASS_OUT_BATCH'` | Addendum 2026–27 Page 13 Item 32 |
| `TC-ROUTE-12` | Unresolved Boundary Gap | Exact Intake Boundary X = 360 | `category: 'increase_intake', existingIntake: 360` | `result: 'review_required', flag: 'POLICY_REVIEW_REQUIRED: Boundary X=360 undefined'` | Addendum 2026–27 Page 42 Errata Table |
| `TC-ROUTE-13` | Future Development Guard | University Graded Autonomy | `category: 'university_technical', requestGradedAutonomy: true` | `futureDevelopmentDependencies: ['FDD-03: UGC Graded Autonomy Regulations 2018']` | APH Chapter IV Clause 4.7 |
| `TC-ROUTE-14` | Future Development Guard | Twinning Foreign University Credit Mapping | `category: 'collaboration_twinning'` | `futureDevelopmentDependencies: ['FDD-02: UGC 2022 Collaboration Regulations']` | APH Chapter III Clause 3.2(m) |
| `TC-ROUTE-15` | Sessional Deadlines | Expired Application Window Guard | `session: '2026-27', submissionDate: '2026-11-02'` | Window preserved as historical record; not enforced as active permanent block | Public Notice 26.11.2025 & Revised Notice 04.02.2026 |
