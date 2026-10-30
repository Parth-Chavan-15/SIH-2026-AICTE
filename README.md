<table align="center">
  <tr>
    <td align="center" width="30%">
      <img src="./docs/assets/defensor-logo.jpg" width="220" alt="Official Team DEFENSOR logo" />
    </td>
    <td align="center" width="48%">
      <h1>NIYAMSETU</h1>
      <strong>नियमसेतु</strong><br />
      <sub>AICTE Approval &amp; Compliance Platform</sub>
    </td>
    <td align="center" width="22%">
      <img src="./docs/assets/sih-2026-logo.png" width="75" alt="Official Smart India Hackathon 2026 logo" />
    </td>
  </tr>
</table>

<div align="center">


**Clearer routes. Controlled reviews. Accountable decisions.**

*Smart India Hackathon 2026 · AICTE Problem Statement 26262 · Team DEFENSOR*

[![Live Prototype](https://img.shields.io/badge/LIVE_PROTOTYPE-EXPLORE-008C8C?style=for-the-badge)](https://niyamsetu-aicte.onrender.com)
[![Watch Demo](https://img.shields.io/badge/WATCH_DEMO-YOUTUBE-C99716?style=for-the-badge)](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x)
[![PS Coverage](https://img.shields.io/badge/REQUIREMENTS-36_TRACKED-0B2F54?style=for-the-badge)](./docs/PS_COMPLIANCE_MATRIX.md)

**[🌐 Launch prototype](https://niyamsetu-aicte.onrender.com) · [▶ Watch demonstration](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x) · [📖 Explore user guide](https://drive.google.com/file/d/1EYKGkXoUPD9FOBFJl66p46_111cJDODY/view?usp=sharing)**

`22 application categories` · `6 role-based workspaces` · `11 expandable Mermaid diagrams`


</div>

---

## 🏛️ What is NiyamSetu?

Technical institutions need AICTE approval for new colleges, annual extensions, intake changes and other activities. Applications can require different reviews, inspections, documents, decisions and later compliance checks.

**NiyamSetu brings the approval-to-compliance journey into one traceable workflow.** Version-aware rules propose an applicable processing route with a **“Why this route?”** explanation. Role-specific workspaces organize evidence, permitted corrections, official decisions and follow-up obligations. **Authorized officials—not software—make the final regulatory decisions.**

## ✨ Four ideas at the heart of NiyamSetu

| Innovation | What it means for users |
|:--|:--|
| 🧭 **Explainable routing** | Uses versioned rules to identify a route and explain why it applies. Unclear policies can pause for human review. |
| 🔒 **Protected re-scrutiny** | Limits rechecks to flagged deficiencies while keeping previously cleared items read-only. |
| ⚖️ **Human decision gate** | Supports competent authorities with a consolidated case record while preserving their decision-making responsibility. |
| 📅 **Continuous compliance** | Connects approval conditions with renewals, documents, deadline reminders and case history. |

**Supporting capabilities:** 22-category routing · simulated NSWS/DSC intake · evidence integrity checks · conditional EVC visits · permission-controlled corrections · appeals and alerts · four categories of post-approval obligations · guided demonstration cases.

## 🖥️ Inside the prototype

A view of the NiyamSetu applicant workspace, including case status, route, responsibility and pending actions.

<p align="center">
  <a href="./docs/assets/niyamsetu-main-ui.png" title="Click for full-size NiyamSetu interface screenshot">
    <img src="./docs/assets/niyamsetu-main-ui.png" width="900" alt="NiyamSetu applicant application-management dashboard, showing a case, route, stage and SLA status" />
  </a>
</p>
<p align="center"><sub>🔎 Click the screenshot to inspect the full-size application interface.</sub></p>

## 🎬 Watch NiyamSetu in action

Explore the prototype walkthrough, then try the live application using the guided scenario below.

<p align="center">
  <a href="https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x" title="Watch NiyamSetu prototype demonstration on YouTube">
    <img src="https://img.youtube.com/vi/NsloajwX8gU/hqdefault.jpg" width="510" alt="Click to watch the NiyamSetu prototype demonstration video" />
  </a>
</p>

<p align="center"><strong><a href="https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x">▶ Click here to watch the complete prototype demonstration</a></strong></p>

## 🖼️ From approval to compliance

See how application intake, rule-based review, authorized decisions, post-approval obligations and audit records fit together. Corrections, hearings and appeals appear only when applicable.

<p align="center">
  <a href="./docs/assets/niyamsetu-approval-to-compliance.png" title="Click to open the full-size approval-to-compliance infographic">
    <img src="./docs/assets/niyamsetu-approval-to-compliance.png" width="540" alt="NiyamSetu infographic showing application intake, government-system adapters, pre-approval review, authorized human decision, green approval stage, grey alternate outcomes, compliance and audit" />
  </a>
</p>
<p align="center"><sub>🔎 Click the infographic to view the full workflow at its original resolution.</sub></p>

---

## 🔄 Complete workflow architecture

**Application intake → rule-based routing → relevant scrutiny or inspection → authorized decision → applicable obligations → audit trail.** Corrections, hearings, appeals and grievances follow separate, conditional routes.

Select the expandable architecture below to inspect the decision flow, conditional branches, and recorded obligations.

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

## 🧭 Explore 10 regulatory routes

**Select any of the 10 expandable diagrams (A–J)** to explore an application route, re-scrutiny, hearing, appeal, grievance, or compliance workflow. Select again to collapse.

For the full regulatory mapping, see the [route-to-diagram matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md).

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

## 👥 Six workspaces. One connected workflow.

Each participant sees only the information and actions assigned to their role.

| Workspace | Main responsibility |
|:--|:--|
| 🏫 **Institution / Applicant** | Submit applications, respond to deficiencies, view orders and track obligations. |
| 🔍 **Desk Scrutiny** | Review documents, record findings and verify permitted corrections. |
| 📍 **Expert Visit Committee** | Record inspection observations, supporting evidence and recommendations. |
| 🗂️ **Regional Office** | Coordinate committees, monitor pendency, manage stage handoffs and oversee compliance. |
| ⚖️ **Approval Bureau / Council** | Review dossiers, record authorized decisions and manage applicable appeals. |
| ⚙️ **Policy Administration** | Manage versioned rules, monitor trends and inspect audit records. |

<details>
<summary><strong>🔑 Click to view demonstration accounts (sample data only)</strong></summary>

The accounts below are provided in the source README for exploring the prototype. They are demonstration identities, not official government accounts.

| Role | Demonstration email |
|:--|:--|
| Institution | `principal@coep.ac.in` / `principal@pdimtr.ac.in` |
| Scrutiny | `scrutiny.reviewer@aicte.gov.in` |
| EVC | `evc.chair@aicte.gov.in` |
| Regional Office | `ro.officer@aicte.gov.in` |
| Approval Bureau | `bureau.approval@aicte.gov.in` |
| Policy Admin | `admin@aicte.gov.in` |

Demonstration password listed in the supplied README: `password123`.

</details>

## 🧭 Explore the five-minute guided demo

1. **Institution:** Open `APP-2026-COEP` to inspect application status, notices and an explained inspection waiver.
2. **Scrutiny:** Open `APP-2026-GIITS` to inspect locked checklist clearances during re-scrutiny.
3. **EVC:** Review the GIITS inspection checklist, demonstration location information and video evidence; submit findings.
4. **Approval Bureau:** Inspect `APP-2026-PDIMTR`, generate a watermarked demonstration EoA and view follow-up obligations.
5. **Policy Administration:** Explore national statistics, versioned rules, historical changes and conflict checks.

## 🧱 Technology stack

| Area | Technologies and methods |
|:--|:--|
| **Frontend** | React 19 · TypeScript 5.8 · Tailwind CSS · Vite 6 · Lucide |
| **Backend** | Node.js 20/22 · Express · REST APIs |
| **Data** | MongoDB Atlas · transactional in-memory engine |
| **Performance** | Request deduplication · actor-scoped six-second read cache |
| **Security** | HttpOnly cookies · SHA-256 evidence hashes · HMAC-SHA256 demonstration seals |
| **Testing** | Vitest · Supertest · strict TypeScript |

## 🚀 Run NiyamSetu locally

**Prerequisites:** Node.js 20 or 22 LTS and npm 9+. The supplied README describes a built-in memory mode for local demonstration.

```bash
git clone https://github.com/Parth-Chavan-15/SIH-2026-AICTE.git SIH-26-AICTE
cd SIH-26-AICTE
npm install
npx tsc --noEmit
npm test
npm run build
npm run dev
```

Open **http://localhost:3000** or use the **[hosted prototype](https://niyamsetu-aicte.onrender.com)**.

## 🧪 Engineering verification

**Reported in the supplied README:** 388 passing tests across 35 suites, including 38 deliverable regression checks. These are **source-reported results**, not the result of a new test run.

- **Rules and decisions:** Route classification (37 tests); decision authority and order generation (34).
- **Access and isolation:** Authentication (18); institution separation (7); role-specific hearing controls (5).
- **Operational checks:** Persistence and deadline safeguards (10); notifications (3); performance checks (5).
- **Regression:** Deliverable regression suite (38 tests).

Evidence and supporting detail: [test directory](./tests/) · [performance verification](./docs/performance/PERFORMANCE_VERIFICATION.md).

---

## 📚 Essential resources

**[🌐 Live prototype](https://niyamsetu-aicte.onrender.com)** · **[▶ Demonstration video](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x)** · **[📖 Complete user walkthrough](https://drive.google.com/file/d/1DhHsp4X29YwySjYHP3_wgb6FaZRK0XGC/view?usp=sharing)**

**Technical evidence:** [AICTE requirement matrix](./docs/PS_COMPLIANCE_MATRIX.md) · [Regulatory route matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md) · [Source register](./docs/regulatory/SOURCE_REGISTER.md)

---

<div align="center">

**Built by Team DEFENSOR** · Smart India Hackathon 2026 · AICTE PS 26262

*NIYAMSETU — Connecting regulatory decisions, institutional obligations, and accountable governance.*

</div>
