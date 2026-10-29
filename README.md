<h1 align="center">NIYAMSETU <sub>नियमसेतु</sub></h1>

<p align="center"><strong>Clear, traceable AICTE approval and compliance workflows.</strong></p>
<p align="center"><sub>Smart India Hackathon 2026 &nbsp;•&nbsp; AICTE Problem Statement 26262 &nbsp;•&nbsp; Academic Year 2026–27</sub></p>

<p align="center">
  <a href="https://niyamsetu-aicte.onrender.com"><img alt="Live prototype" src="https://img.shields.io/badge/Live%20Prototype-Explore%20Now-008C8C?style=for-the-badge" /></a>
  <a href="./docs/PS_COMPLIANCE_MATRIX.md"><img alt="36 requirements traced" src="https://img.shields.io/badge/Requirements-36%20Traced-0B2F54?style=for-the-badge" /></a>
  <a href="./tests/"><img alt="388 tests reported passing" src="https://img.shields.io/badge/Tests-388%20Reported%20Passing-16834B?style=for-the-badge" /></a>
</p>

<p align="center">
  <a href="https://niyamsetu-aicte.onrender.com">🚀 Live demo</a> &nbsp;·&nbsp;
  <a href="./docs/workflows/README.md">📖 Workflow documentation</a> &nbsp;·&nbsp;
  <a href="./docs/PS_COMPLIANCE_MATRIX.md">✅ Requirements matrix</a>
</p>

<p align="center"><img src="docs/assets/niyamsetu-main-ui.png" width="920" alt="NiyamSetu application interface" /></p>

<p align="center"><strong>🧩 22 application categories &nbsp; | &nbsp; 👥 6 workspaces &nbsp; | &nbsp; 🗺️ 11 workflow diagrams</strong></p>

---

## 🏛️ Overview

The All India Council for Technical Education (AICTE) manages approvals for thousands of technical institutions. Applications, scrutiny, inspections, decisions, and later compliance checks often involve separate processes.

**NiyamSetu brings these steps into one traceable workflow.** It identifies the applicable approval route using the AICTE Approval Process Handbook (APH) 2024–27 and the 2026–27 Addendum Errata G02, helps officers review evidence, and tracks obligations after approval. **Only authorized officials make final approval decisions.**

It supports new institutions, annual Extensions of Approval (EoA), intake changes, new programmes, site changes, restoration of intake, and other documented categories. Routes vary by application type and supporting evidence; a visit or hearing is required only when the applicable rules call for one.

## ✨ Core capabilities

| Core capability | What it means |
|---|---|
| 🧭 **Explainable rule-based routing** | Selects among Routes 1–5 using a recorded rule version, with a **“Why this route?”** explanation. Unclear cases (including `X=360`, ELP 50%, and hibernation) stop at `review_required` for human review. |
| 🔒 **Scope-locked re-scrutiny** | Rechecks only notified deficiencies. Previously cleared items stay read-only with SHA-256 integrity checks; unauthorized edits are rejected (`HTTP 409`). |
| ⚖️ **Human decision authority** | Council-authorized personnel review and release LoA/EoA decisions. Demo PDFs include HMAC-SHA256 seals; software does not approve cases by itself. |
| 📅 **Approval-to-compliance continuity** | Links order conditions to deadlines, evidence uploads, renewals, and audit records after approval. |

### 🛠️ Additional engineering capabilities

- 🧩 **22-category coverage:** Chapter I new institutions plus 21 Chapter II Table 2.3 categories, with conditional scrutiny and Expert Visit Committee (EVC) routes.
- 🔗 **Simulated single-window intake:** Pre-filled National Single Window System (NSWS) data and Class-3 Digital Signature Certificate (DSC) token checks.
- 🗂️ **Protected evidence:** Separate applicant records, expert notes, and decision drafts; SHA-256 evidence digests.
- 📍 **EVC inspection controls:** Demonstration GPS geofence (500 m), timestamped walkthrough video, and inspection reports.
- ⏱️ **Deadline and escalation controls:** Separate scrutiny/cure timers, seven-day Standing Appellate Committee (SAC) appeals, and post-approval clocks.
- 🎯 **Guided evaluation:** Pre-seeded cases and scenarios across six role-specific workspaces.

## 🔄 Approval-to-compliance workflow

**Intake → rule-based route → required scrutiny or visit → authorized decision → applicable compliance obligations → audit history.** Hearings, appeals, grievances, and re-scrutiny are conditional branches, not mandatory steps for every case.

The complete architecture below retains the detailed decision paths, exception handling, statutory references, and post-approval branches from the source README.

**Color guide:** 🟦 Intake and evaluation · 🟪 Conditional review · 🟧 Authorized decision · 🟩 Issued order · 🟨 Compliance tracking

```mermaid
flowchart TD
    classDef startNode fill:#EAF4FC,stroke:#0B2F54,stroke-width:2px,color:#0B2F54;
    classDef processNode fill:#E8F8F5,stroke:#008C8C,stroke-width:1.5px,color:#075953;
    classDef branch fill:#F2ECFF,stroke:#6941A5,stroke-width:1.5px,color:#452479;
    classDef decisionNode fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef docNode fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;
    classDef auditNode fill:#FFF8D9,stroke:#C99716,stroke-width:1.5px,color:#6D4E00;

    A["1. Application Intake Simulation<br/>(NSWS Ingestion + DSC Simulation)"]:::startNode --> B["2. Dynamic Route Engine<br/>(APH 2024-27 Table 2.3 + Errata G02)"]:::processNode
    
    B -->|Self-Disclosure EoA Table 2.3 Row 1| G_EC["Chapter II Executive Committee Gate<br/>(Grant of EoA APH §2.25)"]:::decisionNode
    B -->|New Inst / Non-NBA Table 2.3 Row 9| C["RO Desk Allocation<br/>(Assign Standing Scrutiny Group)"]:::processNode
    B -->|Site Shifting / Restoration Table 2.3 Row 11/14| E["RO Desk Allocation<br/>(Direct EVC Panel Assignment)"]:::processNode
    B -->|Policy Ambiguity Hold X=360| BH["Policy Review Required Hold<br/>(Addendum 2026-27 p. 42 / Safe Halt)"]:::decisionNode

    C --> D["Desk Scrutiny Committee<br/>(6 Statutory Checklist Categories)"]:::processNode
    D -->|Deficiencies Flagged D1, D2| D_LOD["Issue Letter of Deficiency (LoD)<br/>(Statutory Shortcomings Notice APH §1.11)"]:::decisionNode
    D_LOD -->|10-Day SLA Cure Window| D1["Differential Re-Scrutiny Scope-Lock<br/>(APH §1.8g: Cleared C3/C4 Locked Read-Only)"]:::branch
    D1 -->|Deficiencies Successfully Cured| D2Check{"Route Requires<br/>EVC?"}
    D -->|All Compliant C1-C6| D2Check

    D2Check -->|Yes: Non-NBA Intake / New Inst| E
    D2Check -->|No: Valid NBA per Addendum §2.6c1| G_EC

    E --> F["Expert Visit Committee (EVC)<br/>(On-Site Physical Inspection APH §1.9<br/>Engineering Safeguard: 500m Geofence)"]:::processNode
    F -->|Satisfactory Report| G_ROUTE{"Application<br/>Category?"}
    
    G_ROUTE -->|Chapter I: New Institution| G_CH1_EC["Executive Committee Decision<br/>(APH §1.10a)"]:::decisionNode
    G_CH1_EC --> G_CH1_COUNCIL["Council Ratification<br/>(APH §1.10a)"]:::decisionNode
    G_CH1_COUNCIL -->|Approved| H1["Issue Letter of Approval (LoA)<br/>(AICTE Act §10k / APH §1.10)"]:::docNode
    G_CH1_COUNCIL -->|Rejected| I2["Issue Letter of Rejection (LoR)<br/>(Speaking Order AICTE Act §10k)"]:::decisionNode

    G_ROUTE -->|Chapter II: Existing Institution| G_EC
    G_EC -->|Approved| H2["Issue Extension of Approval (EoA)<br/>(Speaking Order APH §2.25)"]:::docNode
    G_EC -->|Adverse Decision| I2

    %% Decoupled Governance Branches
    D -.->|Unresolved Shortcomings| SHC_COMP["Standing Hearing Committee (SHC)<br/>(APH §2.23.3: Hearing & Evidence)"]:::branch
    F -.->|Serious Deficiencies| SHC_COMP
    SHC_COMP --> SHC_REC["SHC Recommendations"]:::branch
    SHC_REC --> G_EC

    I2 -.->|Aggrieved within 7 Days| SAC_APP["Standing Appellate Committee (SAC)<br/>(Eligible Statutory Appeal APH §2.24)"]:::branch
    SAC_APP --> SAC_REC["SAC Recommendations"]:::branch
    SAC_REC --> SAC_FINAL["Council Decision<br/>(Final under APH §2.24)"]:::decisionNode

    PGRC["Chapter VII Grievance Intake<br/>(Reject Anonymous APH §7.10h)"]:::startNode -.-> SCSC["Standing Complaint Scrutiny (SCSC)"]:::branch
    SCSC -.-> SCSC_EVC["Show-Cause Notice / Fact-Finding EVC"]:::branch
    SCSC_EVC -.-> SHC_COMP

    %% Post-Approval Compliance Materialization
    H1 --> N["Post-Approval Compliance Engine<br/>(Materialized from Order Conditions)"]:::auditNode
    H2 --> N
    N --> N1["Clock 1: Joint FDR & Affidavit-3 (15 Days - APH §2.25f)"]:::auditNode
    N -.->|When Imposed| N2["Clock 2: Fire Safety NOC Renewal (Annual SLA)"]:::auditNode
    N -.->|When Imposed| N3["Clock 3: 30-Yr Registered Land Lease (APH §6.17a)"]:::auditNode
    N -.->|When Imposed| N4["Clock 4: Faculty Appointment Undertaking (6 Months)"]:::auditNode
```

## 🗺️ Regulatory route diagrams

The following **ten original Mermaid diagrams (A–J)** preserve the route-specific logic and decision paths. Open only the route you need; the diagrams are collapsed to keep the README readable.

For category-to-diagram mappings and tests, see the [Route-to-Diagram Matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md).

<details>
<summary><strong>🏛️ Diagram A · New technical institution (Chapter I)</strong></summary>

APH Chapter I §§1.8–1.10: document scrutiny, physical EVC, Executive Committee consideration, and Council ratification.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Chapter I New Institution Intake<br/>(Land, Society/Trust, Building Plan, DPR)"]:::step --> B["Desk Scrutiny Committee<br/>(Original Document Verification)"]:::step
    B -->|Deficiencies Noted| B_LOD["Issue Letter of Deficiency (LoD)<br/>(Cure window enabled)"]:::decision
    B_LOD -->|Differential Re-Scrutiny| B_RE["Re-Scrutiny Panel<br/>(APH §1.8g Scope-Locked)"]:::step
    B_RE -->|Deficiencies Cleared| C["Mandatory Expert Visit Committee (EVC)<br/>(Physical Infrastructure & Land Inspection)"]:::step
    B -->|All Compliant| C

    C -->|Unsatisfactory Infrastructure| C_DEF["Referral to Standing Hearing Committee (SHC)<br/>(APH §2.23.3 Natural Justice Hearing)"]:::decision
    C -->|Satisfactory Report| D["Regional Office Compilation & Forwarding"]:::step

    D --> E["Executive Committee Evaluation<br/>(APH §1.10a)"]:::decision
    E --> F["Full Council Consideration & Decision<br/>(APH §1.10a)"]:::decision
    F -->|Approved| G["Grant Letter of Approval (LoA)<br/>(Imposes Mandatory 10-Year Joint FDR)"]:::terminal
    F -->|Rejected| H["Issue Letter of Rejection (LoR)<br/>(With Speaking Order & 7-Day Appeal Right)"]:::terminal
```

</details>

<details>
<summary><strong>🔁 Diagram B · Self-disclosure EoA</strong></summary>

APH §2.4, Chapter II Table 2.3 Row 1: an eligible existing institution can follow the streamlined route.

```mermaid
flowchart LR
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Institutional Self-Disclosure Filing<br/>(Annual Compliance & Mandatory Affidavits)"]:::step --> B["Automated AICTE Portal Consistency Check<br/>(Affidavit Integrity & Zero Penalty Record)"]:::step
    B -->|Anomaly / Penalty Detected| C["Escalate to RO Desk Scrutiny<br/>(Exit Fast-Track Route)"]:::decision
    B -->|Verified Compliant| D["Automated Recommendation to Executive Committee"]:::step
    D --> E["Executive Committee Decision<br/>(APH §2.25)"]:::decision
    E -->|Grant EoA| F["Issue Digitally Sealed EoA<br/>(Speaking Order Generated)"]:::terminal
```

</details>

<details>
<summary><strong>📋 Diagram C · Scrutiny-only routes</strong></summary>

Table 2.3 Rows 2, 4, 8, 9-NBA, 10, 12, 15–20: scrutiny without an EVC when applicable.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Application Filing (e.g. NBA Intake Increase,<br/>Name Change, Division Mergers)"]:::step --> B["RO Desk Scrutiny Committee Allocation"]:::step
    B --> C["Desk Scrutiny Evaluation<br/>(Evaluates NBA Status, NOCs, State Approvals)"]:::step
    C -->|Shortcomings Noted| D["Issue Formal LoD<br/>(10-Day SLA Window)"]:::decision
    D --> E["Differential Re-Scrutiny<br/>(APH §1.8g Scope-Locked)"]:::step
    E -->|Deficiencies Resolved| F["Scrutiny Recommendation Forwarding"]:::step
    C -->|All Compliant| F
    F --> G["Executive Committee Determination<br/>(EVC Waived by Regulation)"]:::decision
    G -->|Approved| H["Issue Official Order / EoA"]:::terminal
    G -->|Rejected| I["Issue Letter of Rejection (LoR)<br/>(Speaking Order with Appeal Window)"]:::terminal
```

</details>

<details>
<summary><strong>🔎 Diagram D · Scrutiny followed by EVC</strong></summary>

Rows 3, 5, 9-Non-NBA, 6, 11, 13, 21: document scrutiny and then a required inspection.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Application Filing<br/>(Non-NBA Intake Expansion / New Courses)"]:::step --> B["Desk Scrutiny Committee Verification"]:::step
    B -->|Deficiencies Identified| C["Letter of Deficiency (LoD) & Cure"]:::decision
    C --> D["Differential Re-Scrutiny Scope-Lock<br/>(APH §1.8g)"]:::step
    D -->|Cleared| E["Precondition Cleared for EVC"]:::step
    B -->|All Compliant| E
    E --> F["RO Orders Expert Visit Committee (EVC)<br/>(On-site verification of labs, faculty, equipment)"]:::step
    F --> G["EVC On-Site Inspection & Video Evidence Upload"]:::step
    G --> H["Executive Committee Review & Disposition"]:::decision
    H -->|Approved| I["Issue Extension of Approval (EoA)"]:::terminal
    H -->|Rejected| J["Issue Letter of Rejection (LoR)"]:::terminal
```

</details>

<details>
<summary><strong>📍 Diagram E · Direct or category-specific EVC</strong></summary>

Site shifting (Row 14) or restoration of intake (Row 7): a visit is central to evaluation.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Application Intake: Shifting of Site (Row 14)<br/>or Restoration of Penalized Intake (Row 7)"]:::step --> B["RO Administrative Completeness Verification"]:::step
    B --> C["Direct EVC Panel Constituted & Scheduled<br/>(Site Inspection is Primary Regulatory Condition)"]:::step
    C --> D["On-Site Physical EVC Inspection<br/>(Verifies New Campus Infrastructure or Penalty Rectification)"]:::step
    D -->|Deficiencies Exist| E["Standing Hearing Committee (SHC)<br/>(APH §2.23.3 Natural Justice Opportunity)"]:::decision
    D -->|Satisfactory Report| F["Regional Committee Recommendation"]:::step
    E -->|SHC Clears Case| F
    F --> G["Executive Committee Formal Consideration"]:::decision
    G -->|Approved| H["Grant Approval / Restoration Order"]:::terminal
    G -->|Rejected| I["Issue Formal Rejection Speaking Order"]:::terminal
```

</details>

<details>
<summary><strong>🔒 Diagram F · Deficiency and differential re-scrutiny</strong></summary>

APH §1.8(g): cleared items are locked; only deficiencies are re-examined.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef locked fill:#F2ECFF,stroke:#6941A5,stroke-width:1.5px,color:#452479;
    classDef unlocked fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Initial Scrutiny Report Completed<br/>(Checklist Items: C1, C2, C3, C4, C5, C6)"]:::step --> B{"Scrutiny Findings"}
    B -->|C3, C4 Passed| C["Cleared Items Permanently Scope-Locked<br/>(Read-only, SHA-256 Digest Frozen)"]:::locked
    B -->|D1, D2 Deficient| D["Flagged Deficiencies Unlocked for Cure<br/>(Institution Given 10-Day SLA Window)"]:::unlocked
    
    D --> E["Institution Uploads Rectification Evidence"]:::step
    C --> F["Differential Re-Scrutiny Panel Convened"]:::step
    E --> F
    
    F --> G{"Evaluator Attempts Edit on Locked Item?"}
    G -->|Yes: Tamper Attempt| H["Server-Side Rejection: HTTP 409 Conflict<br/>(RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES)"]:::unlocked
    G -->|No: Reviews Only D1, D2| I["Verify Cure Evidence for D1, D2"]:::step
    I -->|Satisfactory| J["Differential Re-Scrutiny Cleared"]:::terminal
    I -->|Deficiency Uncured| K["Referral to Standing Hearing Committee (SHC)"]:::terminal
```

</details>

<details>
<summary><strong>👥 Diagram G · Standing Hearing Committee (SHC)</strong></summary>

APH §2.23.3: opportunity to address unresolved shortcomings before a decision.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Unresolved Deficiency from Scrutiny or EVC"]:::step --> B["RO Issues Formal SHC Hearing Notice<br/>(Dates, Shortcomings & Required Representatives)"]:::step
    B --> C["Standing Hearing Committee (SHC) Session<br/>(Quorum: Senior Academician, Legal Expert, RO)"]:::step
    C --> D["Institutional Presentation & Evidence Scrutiny<br/>(Natural Justice Opportunity under APH §2.23.3)"]:::step
    D --> E{"SHC Hearing Assessment"}
    E -->|Deficiencies Fully Clarified| F["SHC Recommends Approval / Extension"]:::step
    E -->|Deficiencies Confirmed / Unresolved| G["SHC Recommends Non-Approval / Penalty"]:::decision
    F --> H["Executive Committee Deliberation & Speaking Order"]:::terminal
    G --> H
```

</details>

<details>
<summary><strong>⚖️ Diagram H · Standing Appellate Committee (SAC)</strong></summary>

APH §§1.11 and 2.24: appeal handling with a seven-day filing window.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Council Issues Letter of Rejection (LoR)<br/>(Speaking Order Communicated with Timestamp)"]:::step --> B{"Appeal Lodged within 7 Calendar Days?"}
    B -->|No: Day 8 or Later| C["Appeal Time-Barred by Statute<br/>(Server Rejection: SAC_APPEAL_TIME_BARRED)"]:::decision
    B -->|Yes: Within 7 Calendar Days| D["Standing Appellate Committee (SAC) Intake"]:::step
    D --> E["SAC Hearing Convened<br/>(Chaired by Retired High Court Judge / Senior Academic)"]:::step
    E --> F["Review of Evidence & Previous Committee Findings"]:::step
    F --> G["SAC Formulates Statutory Recommendations"]:::step
    G --> H["Final Decision by Council<br/>(Final Statutory Authority under APH §2.24)"]:::decision
    H -->|Appeal Allowed| I["Grant Letter of Approval / EoA"]:::terminal
    H -->|Appeal Dismissed| J["Confirm Rejection (Speaking Order Final)"]:::terminal
```

</details>

<details>
<summary><strong>✉️ Diagram I · Complaints and grievances</strong></summary>

APH Chapter VII §7.10: identity screening, fact finding, and any applicable Council action.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef decision fill:#FFF1E6,stroke:#CC5200,stroke-width:2px,color:#803400;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Grievance / Complaint Received via Public Grievance Portal"]:::step --> B{"Complainant Identity Verified?<br/>(APH §7.10h Anonymous Filter)"}
    B -->|Anonymous / Unverified| C["Dismissed Server-Side at Intake<br/>(APH §7.10h: Anonymous Complaints Barred)"]:::decision
    B -->|Verified Complainant with Affidavit| D["Standing Complaint Scrutiny Committee (SCSC)"]:::step
    D --> E{"Prima Facie Substance Found?"}
    E -->|No: Frivolous Complaint| F["Close Complaint with Speaking Order"]:::terminal
    E -->|Yes: Serious Irregularity| G["Issue Show-Cause Notice to Institution"]:::decision
    G --> H["Surprise Fact-Finding EVC Inspection"]:::step
    H --> I["Standing Hearing Committee (SHC) Proceeding"]:::step
    I --> J["Council Regulatory Action<br/>(Penalty, Reduction of Intake, or No Admission Status)"]:::terminal
```

</details>

<details>
<summary><strong>📅 Diagram J · Post-approval compliance</strong></summary>

Order-linked obligations: Joint FDR, Fire NOC, land-lease validity, and faculty undertakings.

```mermaid
flowchart TD
    classDef step fill:#EAF4FC,stroke:#0B2F54,stroke-width:1.5px,color:#0B2F54;
    classDef clock fill:#FFF8D9,stroke:#C99716,stroke-width:1.5px,color:#6D4E00;
    classDef terminal fill:#E5F7EA,stroke:#16834B,stroke-width:2px,color:#08522D;

    A["Official Approval Order Generated (LoA / EoA)"]:::step --> B["Post-Approval Compliance Engine Materialization<br/>(Extracts Statutory Conditions into Independent Clocks)"]:::step
    
    B --> C["Clock 1: Joint FDR & Affidavit-3<br/>(15 Calendar Days - APH §2.25f Statutory)"]:::clock
    B --> D["Clock 2: Fire Safety NOC Renewal<br/>(Annual Statutory Expiry SLA)"]:::clock
    B --> E["Clock 3: Registered Land Lease Deed<br/>(30-Year Continuous Validity - APH §6.17a)"]:::clock
    B --> F["Clock 4: Faculty Cadre Appointment<br/>(6-Month Regularization Undertaking)"]:::clock

    C --> G{"Compliance Evidence Uploaded Before Clock Expiry?"}
    D --> G
    E --> G
    F --> G

    G -->|Yes: Evidence Uploaded & Verified| H["Condition Marked Fulfilled & Sealed in Audit Trail"]:::terminal
    G -->|No: Clock Reaches Zero| I["Automated System Escalation Triggered<br/>(Notice to RO Desk & Institution Status Flagged Overdue)"]:::clock
    I --> J["Imposition of Penalty / Show-Cause under Chapter VII"]:::terminal
```

</details>

## 👥 Six role-based workspaces

Each role sees only the cases and actions it is permitted to access. The listed addresses are **demonstration accounts**, not official government accounts; the source README lists `password123` for the demo environment.

| Workspace | Demo account | Main tasks and safeguards |
|---|---|---|
| 🏫 **Institution / Applicant** | `principal@coep.ac.in` or `principal@pdimtr.ac.in` | Applications, intake simulation, deficiency responses, compliance tracking. Access limited to the institution; confidential review notes remain hidden. |
| 🔍 **Desk Scrutiny Reviewer** | `scrutiny.reviewer@aicte.gov.in` | Assigned queue, document checks, deficiency findings, and report sign-off. Cannot reopen cleared items or issue approval orders. |
| 📍 **Expert Visit Committee** | `evc.chair@aicte.gov.in` | Scheduled visits, simulated location/video evidence, facility checklist, and signed inspection report. Assigned panels only. |
| 🗃️ **Regional Office** | `ro.officer@aicte.gov.in` | Workload allocation, committee assignments, SHC hearings, and escalations. Assignment capacity and hearing quorum are checked. |
| ⚖️ **Approval Bureau / Council** | `bureau.approval@aicte.gov.in` | Decision docket, speaking orders, SAC appeals, and document release. Final decisions require authorized human action. |
| 🛠️ **Policy Administration** | `admin@aicte.gov.in` | National statistics, rule versions, conflict simulation, and audit history. Rule changes require a recorded rationale. |

## 🎬 Five-minute demo walkthrough

1. 🏫 **Institution:** Open `APP-2026-COEP`; review status, five sample notices, and the rule explanation for its NBA-based inspection waiver. Applicant views exclude internal deliberations.
2. 🔍 **Scrutiny:** Open `APP-2026-GIITS` and see how cleared items (`C3`, `C4`) stay locked while flagged deficiencies can be addressed.
3. 📍 **EVC:** Inspect the GIITS visit checklist, simulated coordinates, and 30-minute video evidence. Submit the report; the case moves to `decision_pending`, not automatic approval.
4. ⚖️ **Approval Bureau:** Review `APP-2026-PDIMTR`, prepare an EoA document, inspect its HMAC-SHA256 demonstration seal and watermark, then view the resulting obligations.
5. 🛠️ **Policy Admin:** Explore six KPI cards, six charts labeled as demonstration data, and the versioned rules and conflict sandbox.

## 🧱 Technology at a glance

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript 5.8, Tailwind CSS, Vite 6, Lucide | Fast, role-specific interface |
| Backend | Node.js 20/22, Express, REST APIs | Routes, permissions, and workflow operations |
| Storage | MongoDB Atlas and transactional in-memory engine | Persistent case records with in-memory demo support; source describes 11 critical domain models |
| Responsiveness | In-flight request deduplication, actor-scoped six-second read cache | Reduce duplicate requests and improve navigation |
| Security | HttpOnly cookies, SHA-256 evidence hashes, HMAC-SHA256 seals | Access separation and tamper-evident records |
| Verification | Vitest, Supertest, strict TypeScript | Source reports 388 tests across 35 suites and 38 deliverable regression checks |

## 🚀 Run locally

**Prerequisites:** Node.js 20 or 22 LTS and npm 9+. The built-in demonstration memory mode does not require local MongoDB configuration.

```bash
git clone https://github.com/Mayuresh-1306/SIH-2026-AICTE.git SIH-26-AICTE
cd SIH-26-AICTE
npm install
npx tsc --noEmit
npm test
npm run build
npm run dev
```

Open **http://localhost:3000** or use the [hosted prototype](https://niyamsetu-aicte.onrender.com).

## 🧪 Testing and safeguards

The uploaded README reports **388 passing tests in 35 suites** (recorded run: 14.22 seconds). This is a source-reported result, not a fresh verification of the current repository. Key suites cover:

| Area | Source test file | Reported tests |
|---|---|---:|
| Institution notifications and separation | `tests/acceptance/coep_notifications_verification.test.ts` | 3 |
| Cross-institution escalation access | `tests/security/escalation_tenant_isolation.test.ts` | 7 |
| SHC/SAC role separation and quorum | `tests/acceptance/shc_sac_role_separation.test.ts` | 5 |
| Routing, request, and docket latency | `tests/performance/load_benchmarks.test.ts` | 5 |
| Persistence, repeat scheduling, appeal/grievance guards, demo reset | `tests/production_persistence_idempotency.test.ts` | 10 |
| Full deliverables regression | `tests/regression_retrofit_all_deliverables.test.ts` | 38 |
| Rule-based routing | `tests/policy/routing.test.ts` | 37 |
| Decision authority and orders | `tests/decisions/core.test.ts` | 34 |
| Authentication, cookies, roles, and throttling | `tests/security/auth.test.ts` | 18 |

The source also reports benchmark targets/results of **NSWS transitions under 35 ms, route evaluation under 10 ms, and docket loads under 10 ms**, as well as tab switching under 1 ms. Consult the [performance verification](./docs/performance/PERFORMANCE_VERIFICATION.md) for supporting context.

## 🔐 Prototype scope and limitations

> [!IMPORTANT]
> **Demonstration prototype — not an official AICTE production service.** Government integrations, signing, inspections, and outgoing notices are simulated as described below.


- **NSWS and portal intake:** The three-step onboarding and `/api/v1/nsws/prefill` interface use simulated integration data; no live government systems are connected.
- **DSC signing:** Class-3 USB-token/emBridge checks are emulated; they are not live NIC or eMudhra PKI signing.
- **EVC visits:** The 500 m geofence, GPS readings, and timestamped 30-minute video flow are simulated demonstration controls.
- **Notifications:** The transactional outbox shows in-app alerts and simulated SMS/email delivery, separated by recipient and institution.
- **Decision PDFs:** LoA/EoA files carry an HMAC-SHA256 demonstration seal and **`NON-PRODUCTION PROTOTYPE — SIH 2026 DEMONSTRATION`** watermark; they are not official approval certificates.

Rules and obligations remain conditional on the applicable case and order. Ambiguous policies are flagged for authorized review rather than resolved automatically.

## 📚 Supporting documentation

| Document | Covers |
|---|---|
| [Route-to-diagram matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md) | Table 2.3 category mappings, Diagrams A–J, and tests |
| [Workflow overview](./docs/workflows/README.md) | Modular route architecture |
| [Statutory source register](./docs/regulatory/SOURCE_REGISTER.md) | AICTE Act 1987, APH 2024–27, Addendum G02 |
| [Rule mapping matrix](./docs/regulatory/RULE_MAPPING_MATRIX.md) | Seventeen core rules mapped to code |
| [Unverified or conflicting rules](./docs/regulatory/UNVERIFIED_OR_CONFLICTING_RULES.md) | `X=360`, ELP 50%, and hibernation holds |
| [Performance verification](./docs/performance/PERFORMANCE_VERIFICATION.md) | Benchmarks, caching, request deduplication |
| [SIH requirement matrix](./docs/PS_COMPLIANCE_MATRIX.md) | 36 requirements: source reports 34 verified and 2 simulated |
| [Chapter I — New institutions](./docs/workflows/01_chapter_i_new_institution.md) | Establishment process |
| [Chapter II — Self-disclosure](./docs/workflows/02_chapter_ii_self_disclosure_eoa.md) | Annual EoA path |
| [Chapter II — Scrutiny and EVC](./docs/workflows/03_chapter_ii_scrutiny_and_evc_routes.md) | Intake, waivers, site shifts, scope-lock |
| [SHC hearing workflow](./docs/workflows/05_shc_compliance.md) | Shortcomings hearings and separation |
| [SAC appeals workflow](./docs/workflows/06_chapter_specific_appeals.md) | Seven-day appeal handling |
| [Post-approval compliance](./docs/workflows/08_post_approval_compliance.md) | FDR, affidavits, statutory-body notices, four clocks |

**Regulatory basis:** APH 2024–27 and AY 2026–27 Addendum Errata G02. [AICTE official site](https://www.aicte-india.org).
