<table align="center">
  <tr>
    <td align="left" width="65%">
      <img src="./docs/assets/defensor-logo.jpg" width="235" alt="Team DEFENSOR official logo" />
    </td>
    <td align="right" width="35%">
      <img src="./docs/assets/sih-2026-logo.png" width="90" alt="Smart India Hackathon 2026 official logo" />
    </td>
  </tr>
</table>

<div align="center">

# NIYAMSETU (नियमसेतु)

**A clearer way to manage AICTE approvals and post-approval compliance.**

Smart India Hackathon 2026 · AICTE Problem Statement **26262** · Team **DEFENSOR**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Explore_NiyamSetu-008C8C?style=for-the-badge)](https://niyamsetu-aicte.onrender.com)
[![Requirements](https://img.shields.io/badge/Requirements-36_Tracked-0B2F54?style=for-the-badge)](./docs/PS_COMPLIANCE_MATRIX.md)
[![Tests](https://img.shields.io/badge/Tests-388_Reported_Passing-16834B?style=for-the-badge)](./tests/)

**[🌐 Live demo](https://niyamsetu-aicte.onrender.com) · [🎥 Demo video](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x) · [💻 Source code](https://github.com/Parth-Chavan-15/SIH-2026-AICTE) · [📖 User guide](https://drive.google.com/file/d/1EYKGkXoUPD9FOBFJl66p46_111cJDODY/view?usp=sharing)**

<a href="./docs/assets/niyamsetu-main-ui.png"><img src="./docs/assets/niyamsetu-main-ui.png" width="870" alt="NiyamSetu demonstration dashboard showing the institution application workspace" /></a>

**22 application categories · 6 role-based workspaces · 11 expandable workflow diagrams**

</div>

---

## 🏛️ What is NiyamSetu?

Technical institutions need AICTE approval for new colleges, annual extensions, intake changes and other activities. Applications can involve separate portals, document reviews, campus visits, decisions and later compliance checks.

**NiyamSetu connects these activities in one traceable workflow.** It selects the applicable route using the AICTE Approval Process Handbook (APH) 2024–27 and the 2026–27 Addendum Errata G02, explains each step, and tracks follow-up obligations. **Final approval remains with authorized officials.**

## ✨ Innovation & Uniqueness

| Innovation | How it works and why it matters |
|:--|:--|
| 📋 **Version-Pinned Rule Registry** | Each application keeps a record of the AICTE rule version used to determine its route. Later rule updates do not silently change an ongoing case, and reviewers can see the relevant rule references. |
| 🛡️ **Scope-Locked Scrutiny Snapshots** | When deficiencies are corrected, previously cleared checklist items remain protected and read-only. Reviewers examine only the items identified for re-scrutiny, reducing repeated checks and protecting earlier findings. |
| 🏅 **Conditional NBA Fast-Track (Eligible Only)** | NBA accreditation can support a simpler route only when the applicable rules and eligibility conditions allow it. The system checks the case-specific conditions instead of automatically waiving scrutiny or inspection. |
| 📄 **Five-State Document Verification** | Documents progress through **Submitted, Observed, Independently Verified, Rejected,** or **Superseded** states. Earlier versions remain recorded so reviewers can trace what was submitted, checked and replaced. |
| 📅 **Four-Category Deadline Engine** | Tracks academic cutoffs, event-based deadlines, document validity and internal officer targets. Relevant reminders help institutions and officials act on upcoming obligations and overdue work. |
| 🔄 **Optimistic Concurrency Protection** | The system checks whether a case changed after a user opened it. An outdated or conflicting update is rejected rather than silently overwriting another officer's work. |
| 🔗 **SHA-256 Tamper-Evident Audit Chain** | Cryptographic hashes link recorded actions and evidence to help reveal unexpected changes in the case history. This supports integrity checks and accountability without claiming that tampering is impossible. |
| ✉️ **Outbox Notifications & Dispatch Tracking** | Case events create traceable notification records that can be followed through dispatch. Institutions and officers can review the communication history alongside the actions that prompted each notice. |

### ⚙️ Core Capabilities

| Capability | What users can do |
|:--|:--|
| 🧭 **Explainable Case Routing** | Identify the applicable approval route and view the reason behind it, including the relevant rule reference. This makes the next steps clearer to institutions and reviewers. |
| 🔒 **Protected Deficiency Re-Scrutiny** | Submit and review corrections only for recorded deficiencies. Previously cleared evidence stays protected, so the full application need not be checked again unnecessarily. |
| 📍 **Conditional Expert Visits & Reports** | When the rules require a visit, EVC members record inspection observations, supporting evidence and findings. Applications that do not require an inspection follow their applicable route. |
| 🗂️ **Role-Based Dashboards** | Six workspaces show the cases, responsibilities and actions relevant to each user. Role and institution permissions limit access to authorized information and operations. |
| ⚖️ **Authorized Human Decisions** | Competent authorities review the case dossier, committee recommendations and required checks before recording a decision. Software supports the review but does not approve applications independently. |
| 📑 **Approval Compliance & Renewals** | Connect approved cases to applicable conditions, renewal requirements and supporting documents. Institutions and officers can follow obligations after the approval order. |
| 🔔 **Deadline Alerts, Escalation & Reporting** | Monitor upcoming due dates, overdue activities and pending work. Reminders, escalation records and reports help users identify actions that need attention. |
| 🕘 **Traceable Case History** | Follow the history of applications, scrutiny, decisions, document changes, notices and compliance actions in one case record. This supports clear handoffs and later review. |

## 🖼️ Visual overview — approval to compliance

Follow the journey from application intake through review, **human authorization**, post-approval compliance and audit history. The grey panel shows alternative outcomes that apply only when required.

<p align="center">
  <a href="./docs/assets/niyamsetu-approval-to-compliance.png" title="Click to open the full-size workflow infographic">
    <img src="./docs/assets/niyamsetu-approval-to-compliance.png" width="650" alt="NiyamSetu approval-to-compliance infographic with institution intake, government system adapters, the human decision gate, green approved outcome, grey alternative outcomes, post-approval compliance and audit trail" />
  </a>
</p>

<p align="center"><sub>🔎 <strong>Click the infographic to view it at full size.</strong></sub></p>

## 🔄 Complete workflow architecture

**Application intake → rule-based routing → relevant scrutiny or inspection → authorized decision → applicable obligations → audit trail.** Corrections, hearings, appeals and grievances follow separate, conditional routes.

Open the interactive diagram below for the complete decision flow, including exceptions and regulatory references. Its light colors are intended to be legible on GitHub.

<details>
<summary><strong>▶ Click here to view the complete workflow architecture (interactive diagram)</strong></summary>

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

</details>

## 🧭 Detailed regulatory routes

**10 focused diagrams (A–J)** cover the major application routes, appeals, grievances, re-scrutiny and post-approval obligations. ▶ **Click a diagram title below to expand its flowchart.** Click it again to collapse.

For the full regulatory mapping, refer to the [route-to-diagram matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md).

<details>
<summary><strong>▶ Click here to view Diagram A · New technical institution (Chapter I)</strong></summary>

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
<summary><strong>▶ Click here to view Diagram B · Self-disclosure EoA</strong></summary>

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
<summary><strong>▶ Click here to view Diagram C · Scrutiny-only routes</strong></summary>

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
<summary><strong>▶ Click here to view Diagram D · Scrutiny followed by EVC</strong></summary>

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
<summary><strong>▶ Click here to view Diagram E · Direct or category-specific EVC</strong></summary>

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
<summary><strong>▶ Click here to view Diagram F · Deficiency and differential re-scrutiny</strong></summary>

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
<summary><strong>▶ Click here to view Diagram G · Standing Hearing Committee (SHC)</strong></summary>

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
<summary><strong>▶ Click here to view Diagram H · Standing Appellate Committee (SAC)</strong></summary>

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
<summary><strong>▶ Click here to view Diagram I · Complaints and grievances</strong></summary>

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
<summary><strong>▶ Click here to view Diagram J · Post-approval compliance</strong></summary>

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

Every user sees only the cases and actions allowed for their role.

| Workspace | Main responsibility |
|:--|:--|
| 🏫 **Institution / Applicant** | Submit applications, respond to deficiencies, view orders and track obligations. |
| 🔍 **Desk Scrutiny** | Check documents, record findings and review only permitted corrections. |
| 📍 **Expert Visit Committee** | Record campus inspections, evidence and committee recommendations. |
| 🗂️ **Regional Office** | Assign committees, monitor pending cases, coordinate hearings and check compliance. |
| ⚖️ **Approval Bureau / Council** | Review dossiers, issue authorized decisions and handle appeals. |
| ⚙️ **Policy Administration** | Maintain versioned rules, view statistics and inspect audit records. |

<details>
<summary><strong>🔑 Show demonstration accounts</strong></summary>

These are sample accounts for exploring the prototype, not official government accounts. The uploaded README lists demo password **`password123`**.

| Role | Email |
|:--|:--|
| Institution | `principal@coep.ac.in` / `principal@pdimtr.ac.in` |
| Scrutiny | `scrutiny.reviewer@aicte.gov.in` |
| EVC | `evc.chair@aicte.gov.in` |
| Regional Office | `ro.officer@aicte.gov.in` |
| Approval Bureau | `bureau.approval@aicte.gov.in` |
| Policy Admin | `admin@aicte.gov.in` |

</details>

## 🚀 Run locally

**Requirements:** Node.js 20 or 22 LTS and npm 9+. The source README describes a built-in memory mode for local demonstration.

```bash
git clone https://github.com/Parth-Chavan-15/SIH-2026-AICTE.git SIH-26-AICTE
cd SIH-26-AICTE
npm install
npx tsc --noEmit
npm test
npm run build
npm run dev
```

Open **http://localhost:3000** or visit the **[live prototype](https://niyamsetu-aicte.onrender.com)**.

## 🎬 Five-minute guided demo

1. **🏫 Institution / Applicant — `APP-2026-COEP`:** Open the institution workspace to check application status, notices, pending actions and the explanation for its inspection waiver. See how applicants understand their route and respond to permitted deficiencies.
2. **🔍 Desk Scrutiny — `APP-2026-GIITS`:** Open the scrutiny checklist to examine recorded deficiencies and previously cleared items. See how reviewers check only the permitted corrections while earlier clearances remain read-only.
3. **📍 Expert Visit Committee — GIITS inspection:** Explore the visit checklist, sample location information, video evidence and committee findings. See how inspection evidence is recorded when the selected regulatory route requires an EVC visit.
4. **🗂️ Regional Office — case coordination:** Explore the Regional Office workspace to inspect assigned cases, pending reviews and committee handoffs where available. See how officers coordinate progress and follow up on cases awaiting action.
5. **⚖️ Approval Bureau / Competent Authority — `APP-2026-PDIMTR`:** Review the case dossier and committee recommendations, then inspect the authorized decision flow and watermarked demonstration EoA. See how approval conditions become follow-up obligations without automatic approval.
6. **⚙️ Policy Administration — rule oversight:** Explore the rule registry, version history, statistics and conflict checks. See how authorized administrators inspect rule references and maintain a traceable policy history.

## 🧱 Technology stack

| Layer | Technology |
|:--|:--|
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS, Vite 6, Lucide |
| **Backend** | Node.js 20/22, Express, REST APIs |
| **Data** | MongoDB Atlas and transactional in-memory engine |
| **Performance** | Request deduplication and actor-scoped six-second read cache |
| **Security** | HttpOnly cookies, SHA-256 evidence hashes, HMAC-SHA256 demo seals |
| **Testing** | Vitest, Supertest and strict TypeScript |

## 🧪 Testing and engineering checks

**Source-reported results:** **388 passing tests** across **35 suites**, including **38 deliverable regression checks**. These figures come from the provided README; they are not a new test run.

- **Rules and decisions:** Route classification (37 tests), decision authority and order generation (34 tests).
- **Access and isolation:** Authentication (18), institution separation (7) and role-specific hearing controls (5).
- **Operational reliability:** Persistence and deadline safeguards (10), notifications (3) and performance checks (5).
- **End-to-end verification:** Deliverable regression suite (38 tests).

For individual test files and the complete test results, see the [test directory](./tests/) and [performance verification](./docs/performance/PERFORMANCE_VERIFICATION.md).

## 📚 Essential resources

- **[Live prototype](https://niyamsetu-aicte.onrender.com)** — explore the application.
- **[Demonstration video](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x)** — watch the system in action.
- **[Screen-by-screen walkthrough](https://drive.google.com/file/d/1EYKGkXoUPD9FOBFJl66p46_111cJDODY/view?usp=sharing)** — follow the user journey.
- **[AICTE requirement matrix](./docs/PS_COMPLIANCE_MATRIX.md)** — trace problem-statement coverage.
- **[Regulatory route matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md)** — browse application categories and all ten detailed route diagrams.
- **[Regulatory source register](./docs/regulatory/SOURCE_REGISTER.md)** — APH, AICTE Act and addendum references.

<p align="center"><sub>Built by <strong>Team DEFENSOR</strong> for Smart India Hackathon 2026 · AICTE PS 26262</sub></p>
