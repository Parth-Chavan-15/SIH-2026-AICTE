# NIYAMSETU (नियमसेतु) — WORKFLOW DOCUMENTATION ARCHITECTURE
## AICTE Statutory Regulatory Workflows & Route Specifications (AY 2026–27)

**Document Version:** 2.0 (Authoritative Modular Architecture)  
**Inspection Commit:** `bc341e6`  
**Governing Standard:** AICTE Approval Process Handbook (APH 2024–25 to 2026–27) & AY 2026–27 Addendum  
**System Target:** NIYAMSETU SIH 2026 (Problem Statement 26262)

---

## 1. Architectural Principles of Modular Workflow Documentation

The previous monolithic architecture combined unrelated application categories into a single oversized diagram, erroneously conflating Chapter I (New Institutions) with Chapter II (Existing Institutions), and presenting complaints as a routine stage in the happy path.

**NIYAMSETU's modular workflow architecture replaces the single mega-flow with 9 independently understandable, source-grounded route specifications:**

```
docs/workflows/
├── README.md                              <- Architecture overview & navigation index (this file)
├── 01_chapter_i_new_institution.md        <- Setting up New Technical Institution (Chapter I)
├── 02_chapter_ii_self_disclosure_eoa.md   <- Annual EoA on Self-Disclosure (Table 2.3 Row 1)
├── 03_chapter_ii_scrutiny_and_evc_routes.md <- Intake increase, NBA Fast-Track, site shifting
├── 04_chapter_ii_route_matrix.md          <- Exhaustive 21-category Table 2.3 matrix with AA legend
├── 05_shc_compliance.md                   <- Standing Hearing Committee (SHC) shortcomings route
├── 06_chapter_specific_appeals.md         <- Standing Appellate Committee (SAC) 7-day appeals
├── 07_chapter_vii_complaints.md           <- Chapter VII penal action / disciplinary route
├── 08_post_approval_compliance.md         <- Order-conditional obligations, 4 clocks & 5-state docs
└── 99_common_end_to_end_architecture.md   <- Holistic system lifecycle with dashed conditional branches
```

---

## 2. Navigation Index & Scope Coverage

| Workflow Document | Covered Application Categories | Non-Covered Categories | Key Statutory Nodes & Stages | Governing Source |
|---|---|---|---|---|
| [`01_chapter_i_new_institution.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/01_chapter_i_new_institution.md) | Setting up New Technical Institution (Diploma, Degree, PG, Standalone) | Existing technical institutions seeking EoA or variations | Desk Scrutiny &rarr; LoD &rarr; Re-Scrutiny &rarr; Mandatory Physical EVC &rarr; RO Western Desk &rarr; Executive Committee / Council &rarr; LoA (Subject to Joint FDR & Affidavit 3) or LoR | APH 2024–27 Chapter I §1.1–§1.10 & Annexure 7 |
| [`02_chapter_ii_self_disclosure_eoa.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/02_chapter_ii_self_disclosure_eoa.md) | Extension of Approval based on Self-Disclosure (Nil Deficiencies) | New institutions, intake increases, site changes | Self-Disclosure Affidavit 2 &rarr; Direct Council Decision Gate (Bypasses pre-approval scrutiny and EVC) &rarr; EoA Order | APH 2024–27 Chapter II §2.5 & Table 2.3 Row 1 |
| [`03_chapter_ii_scrutiny_and_evc_routes.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/03_chapter_ii_scrutiny_and_evc_routes.md) | Increase in Intake, Additional Courses, Site Relocation, Break-in-EoA Restoration, Administrative Modifications | Self-disclosure EoA, new institutions | Route A (NBA >=50%): Fast-Track Scrutiny Only (EVC Waived).<br>Route B (Non-NBA): Scrutiny + Physical EVC.<br>Route C (Site Change): Direct EVC (Scrutiny Bypassed).<br>Route D (Admin): Desk Scrutiny Only. | APH 2024–27 Table 2.3 & Addendum 2026–27 Item 16 |
| [`04_chapter_ii_route_matrix.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/04_chapter_ii_route_matrix.md) | **All 21 Categories** under Table 2.3 | Chapter I New Institutions | Exhaustive verification table mapping Self-Disclosure, Scrutiny, EVC, and SAC/SHC with strict preservation of `AA` (As Applicable). | APH 2024–27 Chapter II Table 2.3 (Printed p. 30) |
| [`05_shc_compliance.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/05_shc_compliance.md) | Institutions with non-fatal checklist shortcomings referred under §2.23.3 | Unsubstantiated public complaints, clean approvals | Regional Office referral &rarr; Hearing Notice (min 5d) &rarr; Standing Hearing Committee (Retired Judge bench) &rarr; Recommendations &rarr; Council Order | APH 2024–27 Chapter II §2.23.3 & Chapter VIII §8.1 |
| [`06_chapter_specific_appeals.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/06_chapter_specific_appeals.md) | Aggrieved institutions whose applications were rejected under Chapter I or Chapter II | Cases currently under active scrutiny or pending decision | Rejection Communication / Portal Upload &rarr; **Strict 7-Day Appeal Window** &rarr; Standing Appellate Committee (SAC) Hearing &rarr; Final Council Adjudication | APH Chapter I §1.11 & Chapter II §2.24 |
| [`07_chapter_vii_complaints.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/07_chapter_vii_complaints.md) | Verified public, student, or faculty grievances against approved institutions | Routine application processing | Public Grievance Redressal Cell (PGRC) &rarr; §7.10(h) Anonymous Dismissal &rarr; SCSC &rarr; Fact-Finding EVC &rarr; SHC &rarr; Executive Committee Penal Action | APH 2024–27 Chapter VII §7.1–§7.10 |
| [`08_post_approval_compliance.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/08_post_approval_compliance.md) | Approved applications with order-stipulated conditions and recurring statutory renewals | Applications still in pre-approval stages | Approval Order &rarr; Condition-backed Obligation Creation &rarr; Four-Clock Timer Engine &rarr; 5-State Doc Lifecycle &rarr; Outbox Dispatch | APH Chapter II §2.25 & Appendices 4, 5, 7, 8 |
| [`99_common_end_to_end_architecture.md`](file:///c:/Users/parth/Documents/SIH-26-AICTE/docs/workflows/99_common_end_to_end_architecture.md) | Universal System Lifecycle | N/A (Holistic overview) | Intake &rarr; Validation &rarr; Route Engine &rarr; Scrutiny/EVC &rarr; Authority Gate &rarr; Obligations &rarr; Audit & Persistence | Complete System Architecture |

---

## 3. Visual & Syntax Standards

Every Mermaid diagram in this documentation adheres to the following rules:
1. **GitHub Rendering Compatibility:** Tested with valid flowchart (`graph TD` or `flowchart TD`) and state diagram syntax.
2. **Directionally Accurate Connectors:** Solid arrows (`-->`) for mandatory sequential transitions; dashed arrows (`-.->`) for conditional or exceptional branches.
3. **Short Node Labels:** Human-readable concise labels; statutory legal citations are placed in accompanying markdown text tables.
4. **Distinct Authority Decisions:** System automation nodes are visually separated from human committee/authority decisions.
