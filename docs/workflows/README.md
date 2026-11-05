# NIYAMSETU (नियमसेतु) — WORKFLOW DOCUMENTATION ARCHITECTURE
## AICTE Statutory Regulatory Workflows & Route Specifications (AY 2026–27)

**Document Version:** 2026.2.0 (Authoritative Modular Architecture)  
**Governing Standard:** AICTE Approval Process Handbook (APH 2024–25 to 2026–27) & AY 2026–27 Addendum Errata G02  
**System Target:** NIYAMSETU SIH 2026 (Problem Statement PS 26262)

---

## 1. Architectural Principles of Modular Workflow Documentation

The previous monolithic architecture combined unrelated application categories into a single oversized diagram, erroneously conflating Chapter I (New Institutions) with Chapter II (Existing Institutions), and presenting complaints as a routine stage in the happy path.

**NIYAMSETU's modular workflow architecture replaces the single mega-flow with 12 independently understandable, source-grounded route specifications:**

```
docs/workflows/
├── README.md                              <- Architecture overview & navigation index (this file)
├── ROUTE_TO_DIAGRAM_MATRIX.md             <- Exhaustive 22-category mapping to Diagrams A-J & test suites
├── 01_chapter_i_new_institution.md        <- Setting up New Technical Institution (Chapter I)
├── 02_chapter_ii_self_disclosure_eoa.md   <- Annual EoA on Self-Disclosure (Table 2.3 Row 1)
├── 03_chapter_ii_scrutiny_and_evc_routes.md <- Intake increase, NBA Fast-Track, site shifting
├── 04_chapter_ii_route_matrix.md          <- Exhaustive 21-category Table 2.3 matrix with AA legend
├── 05_shc_compliance.md                   <- Standing Hearing Committee (SHC) shortcomings route
├── 06_chapter_specific_appeals.md         <- Standing Appellate Committee (SAC) 7-day appeals
├── 07_chapter_vii_complaints.md           <- Chapter VII penal action / disciplinary route
├── 08_post_approval_compliance.md         <- Order-conditional obligations, 4 clocks & 5-state docs
├── 10_canonical_institution_journeys.md   <- End-to-end journeys for all 6 canonical institutions
├── 11_six_role_workspaces.md              <- RBAC & workflow architectures for all 6 role workspaces
├── 12_implemented_exceptional_workflows.md <- emBridge DSC, USP B06 Scope Lock, 4-Clock SLA, WORM Audit
└── 99_common_end_to_end_architecture.md   <- Universal system lifecycle with dashed conditional branches
```

---

## 2. Navigation Index & Scope Coverage

| Workflow Document | Covered Application Categories / Scope | Key Statutory Nodes & Stages | Governing Source |
|---|---|---|---|
| [`01_chapter_i_new_institution.md`](./01_chapter_i_new_institution.md) | Setting up New Technical Institution (Diploma, Degree, PG, Standalone) | Desk Scrutiny &rarr; LoD &rarr; Re-Scrutiny &rarr; Mandatory Physical EVC &rarr; RO Desk &rarr; Executive Committee / Council &rarr; LoA (Subject to Joint FDR & Affidavit 3) or LoR | APH 2024–27 Chapter I §1.1–§1.10 & Annexure 7 |
| [`02_chapter_ii_self_disclosure_eoa.md`](./02_chapter_ii_self_disclosure_eoa.md) | Extension of Approval based on Self-Disclosure (Nil Deficiencies) | Self-Disclosure Affidavit 2 &rarr; Direct Council Decision Gate (Bypasses pre-approval scrutiny and EVC) &rarr; EoA Order | APH 2024–27 Chapter II §2.5 & Table 2.3 Row 1 |
| [`03_chapter_ii_scrutiny_and_evc_routes.md`](./03_chapter_ii_scrutiny_and_evc_routes.md) | Increase in Intake, Additional Courses, Site Relocation, Break-in-EoA Restoration, Administrative Modifications | Route A (NBA >=50%): Fast-Track Scrutiny Only (EVC Waived).<br>Route B (Non-NBA): Scrutiny + Physical EVC.<br>Route C (Site Change): Direct EVC (Scrutiny Bypassed).<br>Route D (Admin): Desk Scrutiny Only. | APH 2024–27 Table 2.3 & Addendum 2026–27 Item 16 |
| [`04_chapter_ii_route_matrix.md`](./04_chapter_ii_route_matrix.md) | **All 21 Categories** under Table 2.3 | Exhaustive verification table mapping Self-Disclosure, Scrutiny, EVC, and SAC/SHC with strict preservation of `AA` (As Applicable). | APH 2024–27 Chapter II Table 2.3 (Printed p. 30) |
| [`05_shc_compliance.md`](./05_shc_compliance.md) | Institutions with non-fatal checklist shortcomings referred under §2.23.3 | Regional Office referral &rarr; Hearing Notice (min 5d) &rarr; Standing Hearing Committee (Retired Judge bench) &rarr; Recommendations &rarr; Council Order | APH 2024–27 Chapter II §2.23.3 & Chapter VIII §8.1 |
| [`06_chapter_specific_appeals.md`](./06_chapter_specific_appeals.md) | Aggrieved institutions whose applications were rejected under Chapter I or Chapter II | Rejection Communication / Portal Upload &rarr; **Strict 7-Day Appeal Window** &rarr; Standing Appellate Committee (SAC) Hearing &rarr; Final Council Adjudication | APH Chapter I §1.11 & Chapter II §2.24 |
| [`07_chapter_vii_complaints.md`](./07_chapter_vii_complaints.md) | Verified public, student, or faculty grievances against approved institutions | Public Grievance Redressal Cell (PGRC) &rarr; §7.10(h) Anonymous Dismissal &rarr; SCSC &rarr; Fact-Finding EVC &rarr; SHC &rarr; Executive Committee Penal Action | APH 2024–27 Chapter VII §7.1–§7.10 |
| [`08_post_approval_compliance.md`](./08_post_approval_compliance.md) | Approved applications with order-stipulated conditions and recurring statutory renewals | Approval Order &rarr; Condition-backed Obligation Creation &rarr; Four-Clock Timer Engine &rarr; 5-State Doc Lifecycle &rarr; Outbox Dispatch | APH Chapter II §2.25 & Appendices 4, 5, 7, 8 |
| [`10_canonical_institution_journeys.md`](./10_canonical_institution_journeys.md) | **All 6 Canonical Institutions** (COEP, GIITS, PDIMTR, Apex, BATU, VVIT) | Dedicated end-to-end Mermaid flows for each canonical institution including NBA Fast-Track, Dual-Track, EoA, New Inst, Site Shifting, and Boundary $X=360$. | APH Table 2.3 & Addendum Errata p. 42 |
| [`11_six_role_workspaces.md`](./11_six_role_workspaces.md) | **All 6 Role-Based Workspaces** (Applicant, Scrutiny, EVC, RO, Bureau, Admin) | Role-specific permissions, UI component wiring, action barriers, and state transitions for all 6 personas. | AICTE Statutory Delegation of Powers |
| [`12_implemented_exceptional_workflows.md`](./12_implemented_exceptional_workflows.md) | **Mission-Critical Safeguards & Protocols** | emBridge Class-3 DSC challenge, USP B06 Scope Lock, 4-Clock Regulatory SLA auto-escalations, WORM HMAC-SHA256 ledger, and SAC 7-day appeals. | IT Act 2000 & APH §1.8(g), §1.11 |
| [`99_common_end_to_end_architecture.md`](./99_common_end_to_end_architecture.md) | Universal System Lifecycle | Intake &rarr; Validation &rarr; Route Engine &rarr; Scrutiny/EVC &rarr; Authority Gate &rarr; Obligations &rarr; Audit & Persistence | Complete System Architecture |

---

## 3. Visual & Syntax Standards

Every Mermaid diagram in this documentation adheres to the following rules:
1. **GitHub Rendering Compatibility:** Tested with valid flowchart (`graph TD` or `flowchart TD`) and sequence diagram syntax.
2. **Directionally Accurate Connectors:** Solid arrows (`-->`) for mandatory sequential transitions; dashed arrows (`-.->`) for conditional or exceptional branches.
3. **Decoupled Governance:** Quasi-judicial appellate paths (SAC / SHC) and penal complaints (Chapter VII) are visually decoupled from standard approval flows.
4. **Short Node Labels:** Human-readable concise labels; statutory legal citations are placed in accompanying markdown text tables.
5. **Distinct Authority Decisions:** Automated system routing nodes are visually separated from human committee/authority decisions.
