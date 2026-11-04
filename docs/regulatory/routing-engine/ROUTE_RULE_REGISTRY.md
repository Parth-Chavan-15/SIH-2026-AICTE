# NIYAMSETU — ROUTE RULE REGISTRY
**Version-Pinned, Machine-Readable Specification of All Routing Rules**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**
**Active Policy Version: `v2026.2-FINAL-ERRATA-P42`**

---

## 1. RULE REGISTRY SPECIFICATION

Every rule in this registry represents an auditable, deterministic predicate directly sourced from the nine regulatory documents.

```
+------------------------------------------------------------------------------------------------------+
| RULE-CH1-001: Establishment of New Technical Institution                                             |
| Source: APH 2024–27 Chapter I Clauses 1.1–1.13 | Addendum 2026–27 Item 1–10                          |
| Effective AY: 2026–27 | Priority: 100                                                                |
| Condition: category == 'new_institution'                                                             |
| Pipeline: [NSWS_ONBOARDING, APPLICATION_SUBMITTED, SCRUTINY_PENDING, EVC_PENDING, COUNCIL_DECISION]  |
| Conditional Stages: [DEFICIENCY_CURE (15d), RE_SCRUTINY, STANDING_HEARING_COMMITTEE, SAC_APPEAL]    |
| Post-Approval: [SECURITY_DEPOSIT_FDR (15d under Clause 1.12 Table 1.4)]                              |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-CH2-CAT01: Extension of Approval based on Self-Disclosure                                       |
| Source: APH 2024–27 Chapter II Clause 2.5, Table 2.3 Row 1                                           |
| Effective AY: 2026–27 | Priority: 90                                                                 |
| Condition: category == 'extension_of_approval' && hasIntakeExpansion == false                       |
| Pipeline: [APPLICATION_SUBMITTED, COUNCIL_DECISION]                                                  |
| Skipped Stages:                                                                                      |
|   - SCRUTINY_PENDING (Exempted under Table 2.3 Row 1)                                                |
|   - EVC_PENDING (Exempted under Table 2.3 Row 1; subject to randomized inspection under Clause 2.3.5(a); no fixed percentage quota) |
| Post-Approval: [4-CLOCK COMPLIANCE (Clause 2.25(f))]                                                 |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-CH2-CAT09A: Increase in Intake with Valid NBA Accreditation                                     |
| Source: Addendum 2026–27 Page 42 Errata Clause 2.6(c)(i) Table Item (a)                              |
| Effective AY: 2026–27 | Priority: 95                                                                 |
| Condition: category == 'increase_intake' && hasValidNbaAccreditation == true                         |
| Eligibility Predicate:                                                                               |
|   coreBranchesCount >= 3 && nonCsCoreBranchesCount >= 2                                              |
|   (Regional Language Courses exempted from core branch condition)                                    |
| Formula:                                                                                             |
|   If existingIntake < 360: allowedIntake = min(proposedIntake, 360 + 60 + n * divisionSize)          |
|   If existingIntake > 360: allowedIntake = min(proposedIntake, existingIntake + 60 + n * divisionSize) |
|   If existingIntake == 360: FLAG AS POLICY_REVIEW_REQUIRED (Boundary gap)                            |
| Pipeline: [APPLICATION_SUBMITTED, SCRUTINY_PENDING, COUNCIL_DECISION]                                |
| Skipped Stages:                                                                                      |
|   - EVC_PENDING (Explicitly waived for accredited programmes under Errata p. 42)                     |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-CH2-CAT09B: Increase in Intake WITHOUT NBA Accreditation                                        |
| Source: Addendum 2026–27 Page 42 Errata Clause 2.6(c)(i) Table Item (d)                              |
| Effective AY: 2026–27 | Priority: 95                                                                 |
| Condition: category == 'increase_intake' && hasValidNbaAccreditation == false                        |
| Eligibility Predicate:                                                                               |
|   coreBranchesCount >= 3 && nonCsCoreBranchesCount >= 2                                              |
|   (Regional Language Courses exempted)                                                               |
| Formula:                                                                                             |
|   If existingIntake < 360: allowedIntake = min(proposedIntake, 360 + 60)                             |
|   If existingIntake > 360: allowedIntake = min(proposedIntake, existingIntake + 60)                  |
|   If existingIntake == 360: FLAG AS POLICY_REVIEW_REQUIRED                                           |
| Pipeline: [APPLICATION_SUBMITTED, SCRUTINY_PENDING, EVC_PENDING, COUNCIL_DECISION]                   |
| Required Stages: EVC is MANDATORY for non-NBA intake expansion.                                      |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-CH2-CAT14: Change of Site / Location                                                            |
| Source: APH 2024–27 Chapter II Clause 2.17, Table 2.3 Row 14                                         |
| Effective AY: 2026–27 | Priority: 85                                                                 |
| Condition: category == 'change_of_site'                                                              |
| Pipeline: [APPLICATION_SUBMITTED, SCRUTINY_PENDING, EVC_PENDING, COUNCIL_DECISION]                   |
| EVC Mode: MANDATORY Physical On-Site Inspection of New Campus Site                                   |
| Post-Approval: [LAND_CONVERSION_60D, BUILDING_COMPLETION_180D]                                       |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-CH2-ADMIN-SCRUTINY-ONLY: Administrative Document Modifications                                  |
| Source: APH 2024–27 Chapter II Table 2.3 Rows 4, 8, 12, 15, 16, 17, 18, 19                           |
| Effective AY: 2026–27 | Priority: 80                                                                 |
| Condition: category IN ['name_change_institution', 'supernumerary_fn_oci', 'course_name_change',     |
|                         'reduction_intake', 'closure_institution', 'closure_course',                 |
|                         'conversion_women_coed', 'bank_change', 'trust_change']                      |
| Pipeline: [APPLICATION_SUBMITTED, SCRUTINY_PENDING, COUNCIL_DECISION]                                |
| Skipped Stages:                                                                                      |
|   - EVC_PENDING (Exempted under Table 2.3)                                                           |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-BBA-BCA-AS-IS: Standalone BBA / BCA / BMS Institutions                                          |
| Source: Addendum 2026–27 Page 42 Errata Item 2 (Superseding Circular dated 6.10.2025)                |
| Effective AY: 2026–27 | Priority: 92                                                                 |
| Condition: category == 'bba_bca_bms' || program IN ['BBA', 'BCA', 'BMS']                             |
| Pipeline: [APPLICATION_SUBMITTED, COUNCIL_DECISION]                                                  |
| Statutory Basis: Issued LoA / EoA based on 'As Is Where Is' for AY 2026–27. Pre-approval facility    |
|                  EVC and unconditional SAC stages from earlier circular are superseded.              |
+------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------+
| RULE-CH5-ODL-ONLINE: Open and Distance Learning / Online Courses                                     |
| Source: APH Chapter V | Addendum 2026–27 Page 13 Item 32 & Table 2.3 Row 21                          |
| Effective AY: 2026–27 | Priority: 85                                                                 |
| Condition: category IN ['odl_courses', 'online_learning']                                            |
| Eligibility: passOutBatches >= 1 (Modified by Addendum Item 32)                                      |
| Pipeline: [APPLICATION_SUBMITTED, SCRUTINY_PENDING, EVC_PENDING, COUNCIL_DECISION]                   |
| Dependency: UGC ODL Regulations 2020 -> FUTURE_DEVELOPMENT                                           |
+------------------------------------------------------------------------------------------------------+
```
