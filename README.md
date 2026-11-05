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
### The Bridge of Rules: Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System

Smart India Hackathon 2026 · AICTE Problem Statement **PS 26262** · Team **DEFENSOR**

[![Explore Live Prototype](https://img.shields.io/badge/Live_Prototype-Explore_NIYAMSETU-008C8C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://niyamsetu-aicte.onrender.com/)

<br/>

<a href="./docs/assets/niyamsetu-main-ui.png"><img src="./docs/assets/niyamsetu-main-ui.png" width="870" alt="NIYAMSETU application dashboard showing the institutional management interface" /></a>

**22 Statutory Application Categories · 6 Role-Based Workspaces · 14 Comprehensive Workflow Diagrams**

</div>

---

## 🏛️ What is NIYAMSETU? — Problem Statement & Solution

**NIYAMSETU (नियमसेतु — *The Bridge of Rules*) is an integrated digital platform built for the All India Council for Technical Education (AICTE)** to automate, streamline, and monitor approval workflows, institutional compliance, and statutory deadlines for technical education institutions across India.

Every academic year, thousands of institutions apply to AICTE for approvals under the Approval Process Handbook (APH), including setting up new institutions, extending annual approvals (EoA), expanding intake, and shifting campuses. Approvals often involve time-bound compliance undertakings, such as registered land lease deeds, building safety certificates, and financial security deposits.

Under **AICTE Problem Statement PS 26262**, the Council requires an integrated, secure, and configurable digital platform that:
- **Automates application routing** across applicable stages (Scrutiny only, Scrutiny + EVC, Direct EVC, and Council review) based on configurable rules.
- **Provides real-time dashboards** displaying application status, stage-wise pendency, processing timelines, and workload distribution across regions and committees.
- **Streamlines EVC scheduling** and tracks completion timelines, geo-coordinates, and physical verification evidence.
- **Monitors time-bound undertakings** and tracks the validity and renewal of prescribed documents.
- **Dispatches automated notifications**, advance deadline reminders, and escalations for pending or overdue actions to institutions and authorized officials.
- **Maintains complete digital audit trails** of application movement, observations, and decisions, while preserving secure access control and human decision authority.

<details>
<summary><strong>▶ Click here to view the animated approval-to-compliance workflow</strong></summary>

<p align="center">
  <img src="./docs/assets/niyamsetu-workflow.gif" width="750" alt="NIYAMSETU approval-to-compliance workflow animation" />
</p>

</details>

### The NIYAMSETU Engineering Solution

NIYAMSETU addresses PS 26262 through four structured engineering pillars, translating statutory rules into automated, predictable digital workflows while keeping final approval authority strictly with authorized human officials:

<details>
<summary><strong>▶ Click here to view the Four Engineering Pillars architecture diagram</strong></summary>

```mermaid
flowchart TD
    classDef p1 fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1,font-weight:bold;
    classDef p2 fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px,color:#312E81,font-weight:bold;
    classDef p3 fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46,font-weight:bold;
    classDef p4 fill:#FFFBEB,stroke:#D97706,stroke-width:2px,color:#92400E,font-weight:bold;
    classDef core fill:#0F172A,stroke:#38BDF8,stroke-width:2.5px,color:#FFFFFF,font-weight:bold;
    classDef outW fill:#FAF5FF,stroke:#9333EA,stroke-width:1.5px,color:#581C87;
    classDef outL fill:#FFF7ED,stroke:#EA580C,stroke-width:1.5px,color:#9A3412;
    classDef outD fill:#F0FDFA,stroke:#0D9488,stroke-width:1.5px,color:#134E4A;

    P1["🏛️ Pillar 1: External System Adapters<br/>(Single-window intake ingestion & digital signature verification)"]:::p1
    P2["📜 Pillar 2: Configurable Rule Registry<br/>(Deterministic routing based on APH rules & addenda)"]:::p2
    P3["🔒 Pillar 3: Document Review & Scope Lock<br/>(Protection of cleared documents during re-scrutiny)"]:::p3
    P4["⏱️ Pillar 4: Statutory SLA & Alert Management<br/>(Multi-clock deadline tracking, reminders & escalations)"]:::p4

    P1 --> CORE["🛡️ NIYAMSETU Core Platform Engine"]:::core
    P2 --> CORE
    P3 --> CORE
    P4 --> CORE

    CORE --> W["👥 6 Dedicated Role Workspaces<br/>(Applicant, Scrutiny, EVC, Regional Office, Council, Admin)"]:::outW
    CORE --> L["🔗 Tamper-Evident Audit Ledger<br/>(Immutable chronological action log)"]:::outL
    CORE --> D["💾 Persistent Data Engine<br/>(Reliable institutional records & compliance state)"]:::outD
```

</details>

1. **External System Adapters:** Connects institutional intake through single-window application adapters, validates digital signatures, and standardizes data exchange across portals without duplicate entry.
2. **Configurable Rule Registry:** Maps application parameters directly to APH regulations and addenda, automatically determining the exact statutory route and legal citations without ambiguity.
3. **Document Review & Scope Lock:** Enforces a structured document lifecycle that permanently locks previously cleared documents read-only during re-scrutiny, preventing repetitive objections on already verified items.
4. **Statutory SLA & Alert Management:** Tracks countdown timers across scrutiny, deficiency cure, inspection, and decision stages, triggering advance reminder alerts and escalating overdue dockets to Regional Officers.

---

## ⚙️ Core Platform Features

| Feature | Description |
| :--- | :--- |
| 🧭 **Deterministic Regulatory Routing** | Maps application parameters directly to the exact statutory route (Scrutiny only, Scrutiny + EVC, Direct EVC, or direct Council review), eliminating subjective manual routing. |
| 🛡️ **Protected Deficiency Re-Scrutiny** | Restricts re-scrutiny strictly to items flagged in a Letter of Deficiency (LoD), keeping previously cleared documents locked against new objections. |
| 📍 **Automated EVC Scheduling & Physical Verification** | Coordinates mandated on-site inspections and captures committee findings alongside GPS geofencing and walkthrough evidence. |
| ⏱️ **Four-Clock Statutory SLA Monitoring** | Tracks statutory deadlines across Scrutiny (10d), Deficiency Rectification (10d), EVC Inspection (15d), and Council Decisions (15d). |
| 📑 **Post-Approval Compliance Tracking** | Materializes order conditions into active compliance clocks for mandatory undertakings like 10-Year Joint FDRs, Fire Safety NOCs, and registered land leases. |
| 👥 **Six Dedicated Role Workspaces** | Provides role-isolated interfaces tailored for Institutions, Scrutiny Committees, EVC Panels, Regional Offices, Approval Bureau / Council, and Administrators. |
| ⚖️ **Authorized Human Decisions** | Compiles automated rule evaluations and case dockets while reserving final approval, conditional grant, and rejection speaking orders for authorized officials. |
| 🔗 **Tamper-Evident Audit Trail** | Records every stage movement, committee observation, and administrative decision in a chronologically verifiable audit log. |

## ✨ Eight Core Innovations

| Innovation | Description |
| :--- | :--- |
| 📋 **Version-Pinned Rule Registry** | Pins the applicable AICTE Approval Process Handbook (APH) rule version at submission, ensuring subsequent policy updates never alter historical evaluations. |
| 🛡️ **Scope-Locked Scrutiny Snapshots** | Enforces read-only state locks on cleared checklist items at the database layer, programmatically confining re-scrutiny to notified shortcomings. |
| 🏅 **Conditional NBA Fast-Track Routing** | Automatically waives pre-approval physical inspections under AICTE errata circulars when eligible programmes hold valid NBA accreditation. |
| 📄 **Five-State Document Verification** | Transitions records through five explicit states (`Pending`, `Verified`, `Deficient`, `Resubmitted`, `Sealed`) with an immutable version history. |
| 📅 **Four-Clock Statutory SLA Engine** | Runs decoupled state-machine timers across all four statutory stages, automating advance warning alerts and overdue regional escalations. |
| 🔄 **Concurrency & Idempotency Safeguards** | Prevents duplicate submissions, race conditions, and conflicting simultaneous reviews across distributed committee evaluations. |
| 🔗 **Cryptographic Tamper-Evident Audit Trail** | Cryptographically chains every administrative action and stage transition into an append-only ledger that immediately exposes unauthorized record mutations. |
| ✉️ **Reliable Outbox Notification Dispatch** | Guarantees fault-tolerant delivery of deadline alerts, LoD notices, and formal orders via an asynchronous transactional outbox queue. |

---

## 🖼️ Visual Overview — Approval to Compliance

Follow the end-to-end journey from application intake through scrutiny, inspection, **human decision authorization**, post-approval compliance tracking, and audit logging. The grey side panel illustrates exceptional hearing (SHC) and appellate (SAC) routes, which activate only when required:

<details open>
<summary><strong>▶ Click here to view the approval-to-compliance workflow infographic</strong></summary>

<p align="center">
  <a href="./docs/assets/niyamsetu-approval-to-compliance.png" title="Click to view the full-size workflow infographic">
    <img src="./docs/assets/niyamsetu-approval-to-compliance.png" width="680" alt="NIYAMSETU approval-to-compliance workflow infographic showing institution intake, review stages, human decision gate, and post-approval compliance" />
  </a>
</p>

<p align="center"><sub>🔎 <strong>Click the infographic above to view it at full resolution.</strong></sub></p>

</details>

---

## 🔄 Master End-to-End Workflow Architecture

**Application intake → rule-based routing → relevant scrutiny or inspection → authorized decision → compliance tracking → audit trail.** Rectification, hearings, appeals, and complaints follow dedicated conditional routes:

<details>
<summary><strong>▶ Click here to view the master end-to-end workflow architecture diagram</strong></summary>

```mermaid
flowchart TD
    classDef startNode fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E,font-weight:bold;
    classDef processNode fill:#EEF2FF,stroke:#4F46E5,stroke-width:1.5px,color:#312E81;
    classDef branchNode fill:#D1FAE5,stroke:#059669,stroke-width:2px,color:#064E3B,font-weight:bold;
    classDef decisionNode fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:bold;
    classDef docNode fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,font-weight:bold;
    classDef rejectNode fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#7F1D1D,font-weight:bold;
    classDef auditNode fill:#FFFBEB,stroke:#B45309,stroke-width:1.5px,color:#78350F;
    classDef quasiNode fill:#F3E8FF,stroke:#9333EA,stroke-width:1.5px,color:#581C87;

    A["1. Application Intake<br/>(Single-Window Ingestion & Signature Verification)"]:::startNode --> B["2. Configurable Policy Engine<br/>(Evaluates APH Table 2.3 Rules)"]:::processNode

    B -->|Self-Disclosure Renewal Row 1| G_EC["Executive Committee Gate<br/>(Grant of Annual EoA)"]:::decisionNode
    B -->|New Institution / Non-Accredited Intake| C["Regional Desk Allocation<br/>(Assign Scrutiny Group)"]:::processNode
    B -->|Campus Relocation / Restoration| E["Regional Desk Allocation<br/>(Direct EVC Inspection Panel)"]:::processNode

    C --> D["Desk Scrutiny Committee<br/>(Original Document Checklist Review)"]:::processNode
    D -->|Deficiencies Flagged| D_LOD["Issue Letter of Deficiency (LoD)<br/>(Formal Shortcomings Notice)"]:::decisionNode
    D_LOD -->|10-Day Cure Window| D1["Scope-Locked Re-Scrutiny<br/>(Cleared Documents Locked Read-Only)"]:::branchNode
    D1 -->|Deficiencies Resolved| D2Check{"Route Requires<br/>EVC?"}
    D -->|All Items Compliant| D2Check

    D2Check -->|Yes: Non-Accredited / New Inst| E
    D2Check -->|No: Valid NBA Accreditation| G_EC

    E --> F["Expert Visit Committee (EVC)<br/>(On-Site Physical Inspection with GPS & Video)"]:::processNode
    F -->|Satisfactory Report| G_ROUTE{"Application<br/>Category?"}

    G_ROUTE -->|Chapter I: New Institution| G_CH1_EC["Executive Committee Review"]:::decisionNode
    G_CH1_EC --> G_CH1_COUNCIL["Council Ratification"]:::decisionNode
    G_CH1_COUNCIL -->|Approved| H1["Issue Letter of Approval (LoA)<br/>(Imposes Mandatory 10-Yr Joint FDR)"]:::docNode
    G_CH1_COUNCIL -->|Rejected| I2["Issue Letter of Rejection (LoR)<br/>(Formal Speaking Order)"]:::rejectNode

    G_ROUTE -->|Chapter II: Existing Institution| G_EC
    G_EC -->|Approved| H2["Issue Extension of Approval (EoA)<br/>(Official Speaking Order)"]:::docNode
    G_EC -->|Adverse Finding| I2

    %% Exceptional Governance Branches
    D -.->|Unresolved Shortcomings| SHC_COMP["Standing Hearing Committee (SHC)<br/>(Natural Justice Hearing under APH §2.23.3)"]:::quasiNode
    F -.->|Severe Deficiencies| SHC_COMP
    SHC_COMP --> SHC_REC["SHC Recommendations"]:::quasiNode
    SHC_REC --> G_EC

    I2 -.->|Aggrieved within 7 Days| SAC_APP["Standing Appellate Committee (SAC)<br/>(Statutory Appeal under APH §2.24)"]:::quasiNode
    SAC_APP --> SAC_REC["SAC Recommendations"]:::quasiNode
    SAC_REC --> SAC_FINAL["Council Decision<br/>(Final Statutory Authority)"]:::decisionNode

    %% Post-Approval Compliance Materialization
    H1 --> N["Post-Approval Compliance Engine<br/>(Materialized from Order Conditions)"]:::auditNode
    H2 --> N
    N --> N1["Clock 1: Joint FDR & Affidavit 3 (15 Days)"]:::auditNode
    N -.->|When Mandated| N2["Clock 2: Fire Safety NOC Renewal (Annual)"]:::auditNode
    N -.->|When Mandated| N3["Clock 3: Registered Land Lease (30-Year Validity)"]:::auditNode
    N -.->|When Mandated| N4["Clock 4: Faculty Cadre Compliance (6 Months)"]:::auditNode
```

</details>

---

## 🧭 Detailed Regulatory Routes & Modular Workflows

AICTE processes applications across 22 statutory categories. NIYAMSETU organizes every category into an explainable route family based on APH Chapter II Table 2.3 and relevant addenda.

Click any entry below to expand and view the full workflow diagram directly inside this document:

#### Core Approval Routes (APH Chapters I & II)

<details>
<summary><strong>▶ Click here to view Diagram A · New Technical Institution (Chapter I)</strong></summary>

Comprehensive workflow for setting up new institutions, covering document scrutiny, mandatory physical campus inspection, Executive Committee review, Council ratification, 10-year Joint FDR compliance, and the 7-day appellate window.

*Detailed documentation: [`01_chapter_i_new_institution.md`](./docs/workflows/01_chapter_i_new_institution.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef appeal fill:#FFFBEB,stroke:#B45309,stroke-width:1.5px,stroke-dasharray: 4 4,color:#78350F;

    A["1. Application Intake<br/>Application Submission & Document Upload"]:::intake
    A --> B["2. Desk Scrutiny Committee<br/>Verifies Land, Building Plans, NOC & Affidavits"]:::committee

    B --> C{"Checklist Deficiencies Flagged?"}
    
    C -- "Yes (Deficiencies Found)" --> D["3. Letter of Deficiency (LoD) Issued<br/>Deficiencies communicated to applicant"]:::reject
    D --> E["4. Scope-Locked Re-Scrutiny<br/>Cleared items locked; only deficient items reviewed"]:::committee
    E --> F{"Re-Scrutiny Clearance?"}
    F -- "Rejected / Incurable" --> G["5. Letter of Rejection (LoR) Issued<br/>Speaking order with grounds of rejection"]:::reject

    C -- "No (Compliant)" --> H["6. Mandatory Physical EVC Inspection<br/>On-site verification of campus, labs & infrastructure"]:::committee
    F -- "Compliant" --> H

    H --> I{"EVC Inspection Findings?"}
    I -- "Severe Deficiencies" --> G
    I -- "Satisfactory Report" --> J["7. Regional Office Review<br/>Consolidated dossier compiled for Council"]:::intake

    J --> K["★ 8. Council / Executive Committee Decision Gate ★<br/>Authorized human official sign-off"]:::gate

    K --> L{"Council Adjudication"}
    L -- "Rejected" --> G
    L -- "Sanctioned Approval" --> M["9. Statutory Security Deposit Gate<br/>Submission of 10-Year Joint FDR & Affidavit 3"]:::gate

    M --> N["10. Letter of Approval (LoA) Issued<br/>Official approval order dispatched"]:::success
    N --> O["11. Post-Approval Compliance Tracking<br/>Monitors permanent building and compliance obligations"]:::success

    G -.-> P["Standing Appellate Committee (SAC) Appeal<br/>Strict 7-calendar-day statutory window"]:::appeal
    P -.-> Q{"SAC Recommendation"}
    Q -.->|Remand for Re-EVC| H
    Q -.->|Rejection Upheld| R["Final Legal Rejection"]:::reject
    Q -.->|Reversal Approved| M
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram B · Self-Disclosure Extension of Approval (EoA)</strong></summary>

Streamlined annual renewal route for existing institutions under Table 2.3 Row 1. Pre-approval scrutiny and inspections are waived based on verified self-disclosure, proceeding directly to Executive Committee approval.

*Detailed documentation: [`02_chapter_ii_self_disclosure_eoa.md`](./docs/workflows/02_chapter_ii_self_disclosure_eoa.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef bypass fill:#F3F4F6,stroke:#9CA3AF,stroke-width:1.5px,stroke-dasharray: 4 4,color:#4B5563;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef surprise fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px,stroke-dasharray: 4 4,color:#92400E;

    A["1. Institution Submits Annual Renewal Dossier<br/>Self-Disclosure (Affidavit 2) & Prescribed Fee"]:::intake
    A --> B["2. Automated Eligibility Screening<br/>Verifies clean prior EoA, zero active complaints, and valid status"]:::intake

    B --> C{"Eligibility Criteria Met?"}
    
    C -- "No (Discrepancy / Complaint Found)" --> D["Reroute to Scrutiny / Inquiry Route<br/>Transfers case out of Self-Disclosure fast-track"]:::surprise

    C -- "Yes (Clean Record)" --> E["★ Pre-Approval Stages Waived per Table 2.3 Row 1 ★<br/>• Pre-Approval Desk Scrutiny: WAIVED<br/>• Pre-Approval EVC Inspection: WAIVED"]:::bypass

    E --> F["★ 3. Competent Authority Decision Gate ★<br/>Authorized Executive Committee / Council sign-off"]:::gate

    F --> G["4. Extension of Approval (EoA) Order Released<br/>Official digital renewal order issued"]:::success

    G --> H["5. Post-Approval Compliance Tracking<br/>Tracks annual Fire Safety NOC and land lease renewal"]:::success

    G -.-> I["6. Random Post-Approval Surprise EVC Check<br/>Council randomly audits 5% of self-disclosure institutions"]:::surprise
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram C · Scrutiny-Only / NBA Fast-Track Intake Increase</strong></summary>

Fast-track intake expansion route for eligible accredited programmes under Table 2.3 Row 9 and Errata Page 42, where valid NBA accreditation waives physical EVC inspection.

*Detailed documentation: [`03_chapter_ii_scrutiny_and_evc_routes.md`](./docs/workflows/03_chapter_ii_scrutiny_and_evc_routes.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef bypass fill:#F3F4F6,stroke:#9CA3AF,stroke-width:1.5px,stroke-dasharray: 4 4,color:#4B5563;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;

    A["1. Application for Intake Expansion / New Courses<br/>Applicant submits details and valid NBA accreditation certificate"]:::intake
    A --> B["2. Desk Scrutiny Committee<br/>Evaluates original document checklist C1–C6"]:::committee

    B --> C{"Scrutiny Findings"}
    C -- "Deficiencies Flagged" --> D["Scope-Locked Re-Scrutiny<br/>Cleared items locked; institution cures only deficiencies"]:::committee
    D --> E{"Deficiencies Resolved?"}
    E -- "No" --> F["Refer to Standing Hearing Committee (SHC)"]:::reject
    E -- "Yes" --> G["Scrutiny Clearance Confirmed"]:::committee
    C -- "All Compliant" --> G

    G --> H{"NBA Accreditation Verification<br/>(Valid NBA Score >= 650 or >= 50% eligible courses)"}
    H -- "Accredited (Fast-Track Eligible)" --> I["★ Physical EVC Inspection Waived ★<br/>Waived under APH Addendum Errata Page 42"]:::bypass
    I --> J["★ 3. Council Decision Gate ★<br/>Authorized official sign-off on docket"]:::gate
    J --> K["4. Extension of Approval (EoA) Granted<br/>Expanded intake approved in official speaking order"]:::success
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram D · Dual-Track Route (Scrutiny followed by Mandatory EVC)</strong></summary>

Dual-track route for non-accredited course expansions and new programmes requiring initial desk scrutiny followed by mandatory on-site EVC inspection.

*Detailed documentation: [`03_chapter_ii_scrutiny_and_evc_routes.md`](./docs/workflows/03_chapter_ii_scrutiny_and_evc_routes.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;

    A["1. Application for Intake Expansion / New Programme<br/>Non-accredited course or new level in existing institution"]:::intake
    A --> B["2. Desk Scrutiny Committee<br/>Evaluates land, building area, faculty cadre ratio, and NOCs"]:::committee

    B --> C{"Desk Scrutiny Clearance"}
    C -- "Deficiencies Found" --> D["Scope-Locked Re-Scrutiny<br/>Institution cures only flagged shortcomings"]:::committee
    D --> E{"Rectification Successful?"}
    E -- "No" --> F["Refer to Standing Hearing Committee (SHC)"]:::reject
    E -- "Yes" --> G["Scrutiny Passed"]:::committee
    C -- "All Compliant" --> G

    G --> H["3. Mandatory Physical EVC Inspection<br/>3-member expert panel conducts on-site campus verification"]:::committee
    H --> I{"EVC Inspection Result"}
    I -- "Severe Deficiencies" --> F
    I -- "Satisfactory Report" --> J["★ 4. Council Decision Gate ★<br/>Authorized human official sign-off on docket"]:::gate

    J --> K["5. Extension of Approval (EoA) Issued<br/>Post-approval compliance conditions activated"]:::success
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram E · Direct EVC (Campus Shifting & Restoration)</strong></summary>

Direct physical inspection route for campus relocations (Row 14) and restoration of penalized intake (Row 7), bypassing desk scrutiny to verify campus infrastructure on site.

*Detailed documentation: [`03_chapter_ii_scrutiny_and_evc_routes.md`](./docs/workflows/03_chapter_ii_scrutiny_and_evc_routes.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef bypass fill:#F3F4F6,stroke:#9CA3AF,stroke-width:1.5px,stroke-dasharray: 4 4,color:#4B5563;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    A["1. Application Intake: Campus Relocation / Restoration<br/>Change of Site (Row 14) or Restoration of Penalized Intake (Row 7)"]:::intake
    A --> B["★ Desk Scrutiny Bypassed ★<br/>Statutory rules direct case immediately to on-site inspection"]:::bypass
    B --> C["2. Expert Visit Committee (EVC) Inspection<br/>Mandatory physical campus verification of new site and facilities"]:::committee
    C --> D{"EVC Inspection Findings"}
    D -- "Satisfactory Infrastructure" --> E["★ 3. Council Decision Gate ★<br/>Executive Committee / Council authorization"]:::gate
    E --> F["4. Relocation / Restoration Approval Granted<br/>Official order issued with updated campus details"]:::success
```

</details>

#### Deficiency Rectification, Hearings & Appeals

<details>
<summary><strong>▶ Click here to view Diagram F · Differential Re-Scrutiny & Scope Lock</strong></summary>

Statutory rectification workflow enforcing document protection. Cleared documents remain locked read-only, and re-scrutiny is restricted strictly to flagged deficiencies.

*Detailed documentation: [`12_implemented_exceptional_workflows.md`](./docs/workflows/12_implemented_exceptional_workflows.md)*

```mermaid
flowchart TD
    classDef initial fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef lod fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef locked fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef cure fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef reject fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B;

    A["Initial Scrutiny Review Completed<br/>Original document checklist evaluated"]:::initial
    --> B{"Scrutiny Result"}

    B -->|Verified Documents| C["Cleared Documents Scope-Locked<br/>Locked read-only; edit and reject controls disabled"]:::locked
    B -->|Deficiencies Flagged| D["Letter of Deficiency (LoD) Issued<br/>Specific shortfalls communicated to institution"]:::lod

    D --> E["10-Day Cure Window Active<br/>Institution uploads rectified documents for deficient items"]:::cure
    E --> F["Differential Re-Scrutiny Panel Convened"]:::cure

    F --> G{"Evaluator Review"}
    G -->|Attempt to reopen locked documents| H["Action Rejected: Scope Locked<br/>Previously cleared documents cannot be reopened"]:::reject
    G -->|Review of resubmitted deficient items| I["Verify Rectification Documents"]:::locked

    I -->|All Deficiencies Resolved| J["Scrutiny Passed<br/>Advances to EVC or Regional Review"]:::locked
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram G · Standing Hearing Committee (SHC) Natural Justice</strong></summary>

Quasi-judicial hearing route for disputed deficiencies or unrectified shortcomings, upholding principles of natural justice under APH §2.23.3 prior to a final Council decision.

*Detailed documentation: [`05_shc_compliance.md`](./docs/workflows/05_shc_compliance.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;

    A["1. Unresolved Shortcomings Flagged<br/>Disputed in desk re-scrutiny or reported by EVC"]:::intake
    A --> B["2. Regional Office Issues Hearing Notice<br/>Advance notice with itemized list of shortcomings"]:::intake
    B --> C["3. Institution Submits Rebuttal Dossier<br/>Documentary evidence restricted to notified shortcomings"]:::intake
    C --> D["4. Standing Hearing Committee (SHC) Convened<br/>Personal natural justice hearing conducted"]:::committee

    D --> E{"SHC Hearing Findings"}
    E -- "Shortcomings Satisfactorily Rebutted" --> F["SHC Recommends Approval<br/>Findings submitted to Council"]:::success
    E -- "Minor Deficit Cured with Undertaking" --> G["SHC Recommends Conditional Approval<br/>Requires time-bound compliance undertaking"]:::committee
    E -- "Shortcomings Unresolved / Incurable" --> H["SHC Recommends Rejection<br/>Grounds formulated for speaking order"]:::reject

    F --> I["★ 5. Competent Authority Decision Gate ★<br/>Authorized Council / Executive Committee decision"]:::gate
    G --> I
    H --> I

    I --> J{"Council Speaking Order"}
    J -- "Approved" --> K["Extension of Approval (EoA) Issued"]:::success
    J -- "Conditional Approval" --> L["Conditional Approval Issued with Deadline Timers"]:::success
    J -- "Rejected" --> M["Letter of Rejection (LoR) Issued<br/>7-Day statutory appellate window opens"]:::reject
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram H · Standing Appellate Committee (SAC) 7-Day Appeal</strong></summary>

Statutory appellate proceedings following a rejection speaking order, subject to a strict 7-calendar-day appeal window under APH §1.11 and §2.24.

*Detailed documentation: [`06_chapter_specific_appeals.md`](./docs/workflows/06_chapter_specific_appeals.md)*

```mermaid
flowchart TD
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    A["Letter of Rejection (LoR) Communicated<br/>Formal speaking order with detailed grounds"]:::reject
    A --> B["Statutory 7-Calendar-Day Appeal Window Active<br/>Strict deadline countdown enforced under APH §1.11 / §2.24"]:::intake

    B --> C{"Appeal Filed Within 7 Days?"}
    C -- "No (> 7 Days)" --> D["Appeal Time-Barred<br/>Case permanently closed; rejection stands"]:::reject
    C -- "Yes (<= 7 Days)" --> E["Appeal Admitted & Evidence Verified<br/>Appellant submits grounds of appeal and documentary proof"]:::intake

    E --> F["Standing Appellate Committee (SAC) Convened<br/>Chaired by retired High Court Judge"]:::committee
    F --> G["Appellate Oral Hearing & Document Review<br/>Deliberations restricted to grounds of rejection"]:::committee

    G --> H{"SAC Hearing Recommendation"}
    H -- "Rejection Upheld" --> I["SAC Recommends Confirming Rejection"]:::reject
    H -- "Factual Discrepancy Found" --> J["SAC Remands Case for Targeted Re-EVC<br/>Special committee verifies disputed infrastructure"]:::committee
    H -- "Grounds of Rejection Disproved" --> K["SAC Recommends Overturning Rejection"]:::success

    J --> L["Re-EVC Report Submitted to SAC"]:::committee
    L --> H

    I --> M["★ Council / Executive Committee Final Decision ★<br/>Statutory adjudication by competent authority"]:::gate
    K --> M

    M --> N{"Final Council Order"}
    N -- "Appeal Dismissed" --> O["Final Speaking Rejection Order Issued<br/>Administrative remedies exhausted"]:::reject
    N -- "Appeal Allowed" --> P["Approval Granted (LoA / EoA)<br/>Post-approval compliance obligations activated"]:::success
```

</details>

#### Complaints, Inquiries & Post-Approval Compliance

<details>
<summary><strong>▶ Click here to view Diagram I · Chapter VII Complaints & Grievance Screening</strong></summary>

Public grievance screening under Chapter VII, detailing identity and affidavit verification, summary dismissal of anonymous complaints (§7.10h), preliminary scrutiny, fact-finding surprise visits, and disciplinary penalties.

*Detailed documentation: [`07_chapter_vii_complaints.md`](./docs/workflows/07_chapter_vii_complaints.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef penal fill:#7F1D1D,stroke:#991B1B,stroke-width:2px,color:#FEF2F2;

    A["1. Public Grievance / Complaint Lodged<br/>Allegation of statutory or regulatory non-compliance"]:::intake
    A --> B{"Complainant Verification"}

    B -- "Anonymous / Unverified" --> C["Summary Dismissal under APH §7.10(h)<br/>Unverified complaints dismissed without inquiry"]:::reject

    B -- "Verified Complainant + Affidavit" --> D["2. Standing Complaint Scrutiny Committee (SCSC)<br/>Preliminary review of prima facie documentary evidence"]:::committee

    D --> E{"Prima Facie Case Established?"}
    E -- "No (Frivolous / Unsubstantiated)" --> F["Complaint Dismissed by SCSC<br/>Reasons permanently recorded in audit log"]:::reject

    E -- "Yes (Substantiated Allegations)" --> G["3. Fact-Finding Surprise EVC Inspection<br/>On-site inspection, physical verification & infrastructure audit"]:::committee

    G --> H["4. Show Cause Notice Issued<br/>Institution provided 10 days to reply with documentary defense"]:::committee

    H --> I["5. Standing Hearing Committee (SHC) Convened<br/>Personal hearing of institution management & complainant"]:::committee

    I --> J["SHC Findings & Recommendations Submitted<br/>Report submitted to Executive Committee"]:::committee

    J --> K["★ 6. Executive Committee Statutory Adjudication ★<br/>Decision under AICTE Act provisions"]:::gate

    K --> L{"Adjudicated Outcome"}
    L -- "Exonerated (Violations Disproved)" --> M["Disciplinary Case Closed with Clean Clearance"]:::intake
    L -- "Minor Non-Compliance" --> N["Warning Issued & Compliance Rectification Enforced"]:::committee
    L -- "Severe Statutory Violation" --> O["Statutory Penal Order Imposed<br/>• Reduction in Intake (25% / 50%)<br/>• No Admission Status<br/>• Withdrawal of Approval"]:::penal
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram J · Post-Approval Compliance Engine</strong></summary>

Automated monitoring of order conditions materialized into independent countdown clocks (10-Year Joint FDR, Fire Safety NOC, registered land lease, and mandatory committees).

*Detailed documentation: [`08_post_approval_compliance.md`](./docs/workflows/08_post_approval_compliance.md)*

```mermaid
flowchart TD
    classDef councilStyle fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff
    classDef postAppStyle fill:#065f46,stroke:#10b981,stroke-width:2px,color:#ffffff
    classDef clockStyle fill:#9a3412,stroke:#f97316,stroke-width:2px,color:#ffffff
    classDef stateStyle fill:#374151,stroke:#9ca3af,stroke-width:2px,color:#ffffff
    classDef penalStyle fill:#991b1b,stroke:#ef4444,stroke-width:2px,color:#ffffff

    subgraph CouncilApproval ["Executive Committee / Council Action"]
        CA_EC["Approval Order Sanctioned"]:::councilStyle
        CA_ISSUE["Issue Letter of Approval (LoA) / Extension of Approval (EoA)"]:::councilStyle
        CA_COND["Order Stipulates Specific Compliance Conditions"]:::councilStyle
    end

    subgraph Timers ["Post-Approval Statutory Countdown Clocks"]
        T_15D["15-Day Security Deposit Clock:<br/>10-Year Joint FDR & Affidavit 3"]:::clockStyle
        T_30D["30-Day Mandatory Committee Clock:<br/>Grievance, Anti-Ragging & ICC Notifications"]:::clockStyle
        T_COND["Conditional Order Window (60–90 Days):<br/>Fire Safety NOC / Land Lease / Building Undertaking"]:::clockStyle
    end

    subgraph InstitutionAction ["Institution Compliance Submission"]
        INST_FDR["Deposit Joint FDR in Nationalized Bank<br/>Joint name with Regional Officer"]:::postAppStyle
        INST_AFF["Execute and Notarize Affidavit 3"]:::postAppStyle
        INST_STAT["Upload Statutory Committee Gazette/Notice"]:::postAppStyle
        INST_DOCS["Upload Renewal Evidence for Conditional Clauses"]:::postAppStyle
    end

    subgraph Verification ["Regional Office Verification"]
        RO_REV["Regional Office Verification Officer"]:::stateStyle
        RO_CHECK{"Are All Compliance<br/>Obligations Met?"}:::stateStyle
    end

    subgraph FinalOutcome ["Compliance Outcome"]
        FINAL_ACTIVE["Status: Active Compliant<br/>Annual approval confirmed and listing maintained"]:::postAppStyle
        FINAL_PENAL["Status: Non-Compliant Default<br/>Escalated to Chapter VII regulatory inquiry"]:::penalStyle
    end

    CA_EC --> CA_ISSUE
    CA_ISSUE --> CA_COND
    CA_ISSUE --> T_15D
    CA_ISSUE --> T_30D

    CA_COND -->|Has Specific Conditions| T_COND
    CA_COND -->|Standard Approval| INST_FDR

    T_15D --> INST_FDR
    T_15D --> INST_AFF
    T_30D --> INST_STAT
    T_COND --> INST_DOCS

    INST_FDR --> RO_REV
    INST_AFF --> RO_REV
    INST_STAT --> RO_REV
    INST_DOCS --> RO_REV

    RO_REV --> RO_CHECK
    RO_CHECK -->|All Verified within Timelines| FINAL_ACTIVE
    RO_CHECK -->|Default / Unfulfilled after Notice| FINAL_PENAL
```

</details>

#### Case Journeys, Role Workspaces & Universal Architecture

<details>
<summary><strong>▶ Click here to view Diagram K · Canonical Institution End-to-End Journeys</strong></summary>

Step-by-step trajectories showing how different institutional archetypes (new technical institutions, self-disclosure extensions, NBA fast-track expansions, dual-track non-accredited courses, and campus relocations) traverse their statutory stages.

*Detailed documentation: [`10_canonical_institution_journeys.md`](./docs/workflows/10_canonical_institution_journeys.md)*

```mermaid
flowchart TD
    classDef newInst fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef eoa fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
    classDef nba fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef dual fill:#F3E8FF,stroke:#7C3AED,stroke-width:1.5px,color:#4C1D95;
    classDef shift fill:#FFF7ED,stroke:#EA580C,stroke-width:1.5px,color:#9A3412;

    K1["Scenario 1: New Technical Institution (Chapter I)<br/>Intake &rarr; Desk Scrutiny &rarr; Mandatory Physical EVC &rarr; Council LoA"]:::newInst
    K2["Scenario 2: Annual Extension of Approval (EoA)<br/>Self-Disclosure &rarr; Automated Screening &rarr; Direct Council EoA"]:::eoa
    K3["Scenario 3: NBA Fast-Track Intake Expansion<br/>Intake &rarr; Desk Scrutiny &rarr; EVC Waived under Errata p. 42 &rarr; Council EoA"]:::nba
    K4["Scenario 4: Dual-Track Scrutiny + Mandatory EVC<br/>Non-Accredited Intake &rarr; Desk Scrutiny &rarr; Physical EVC &rarr; Council EoA"]:::dual
    K5["Scenario 5: Campus Relocation / Restoration<br/>Relocation Intake &rarr; Desk Scrutiny Bypassed &rarr; Direct Physical EVC &rarr; Council Order"]:::shift
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram L · Six Role-Based Workspace Architectures</strong></summary>

Role-based access model illustrating functional separation between Applicants, Desk Scrutiny Committees, Expert Visit Panels, Regional Officers, Council Authorities, and Policy Administrators.

*Detailed documentation: [`11_six_role_workspaces.md`](./docs/workflows/11_six_role_workspaces.md)*

```mermaid
flowchart TD
    classDef inst fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef scrutiny fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef evc fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
    classDef ro fill:#F3E8FF,stroke:#7C3AED,stroke-width:1.5px,color:#4C1D95;
    classDef ca fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef admin fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;

    R1["1. Technical Institution / Applicant<br/>Submit applications, view status, respond to deficiencies, fulfill compliance"]:::inst
    R2["2. Desk Scrutiny Committee<br/>Review document checklist, record findings, differential re-scrutiny"]:::scrutiny
    R3["3. Expert Visit Committee (EVC)<br/>Conduct on-site inspections, record GPS and video evidence, submit reports"]:::evc
    R4["4. Regional Office (RO)<br/>Allocate reviewer panels, monitor regional pendency, handle escalations"]:::ro
    R5["5. Approval Bureau / Council<br/>Review consolidated dockets, evaluate findings, issue authorized speaking orders"]:::ca
    R6["6. Policy Administration<br/>Maintain rule parameters, test routes in sandbox, monitor audit trails"]:::admin

    R1 -->|"Submits Application"| R2
    R2 -->|"Reviews & Forwards"| R4
    R4 -->|"Assigns EVC (when mandated)"| R3
    R3 -->|"Submits Inspection Report"| R4
    R4 -->|"Compiles Dossier"| R5
    R5 -->|"Issues Authorized Order"| R1
    R6 -.->|"Maintains Rules & Monitors Telemetry"| R2 & R3 & R4 & R5
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram M · Implemented Exceptional Workflows & Protocols</strong></summary>

Comprehensive safeguard protocols including digital signature verification, document protection during re-scrutiny, statutory countdown monitoring, and tamper-evident audit logging.

*Detailed documentation: [`12_implemented_exceptional_workflows.md`](./docs/workflows/12_implemented_exceptional_workflows.md)*

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef lock fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
    classDef clock fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef audit fill:#EDE9FE,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6;

    M1["Digital Intake & Signature Verification<br/>Verifies applicant identity and digital signatures before ingestion"]:::intake
    M2["Scope-Locked Deficiency Rectification<br/>Locks cleared items during re-scrutiny; rejects repeated objections"]:::lock
    M3["Statutory SLA Deadline & Alert Engine<br/>Monitors 4 countdown clocks with advance reminders and escalations"]:::clock
    M4["Tamper-Evident Audit Trail<br/>Permanently logs all state changes and committee actions in verifiable ledger"]:::audit

    M1 --> M2 --> M3 --> M4
```

</details>

<details>
<summary><strong>▶ Click here to view Diagram N · Universal Master System Architecture</strong></summary>

Multi-tier system architecture detailing the relationships between client presentation layers, gateway routing, policy rules, deadline monitoring, compliance engines, and persistence.

*Detailed documentation: [`99_common_end_to_end_architecture.md`](./docs/workflows/99_common_end_to_end_architecture.md)*

```mermaid
flowchart TD
    classDef ui fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef gateway fill:#F3E8FF,stroke:#7C3AED,stroke-width:1.5px,color:#4C1D95;
    classDef core fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef persist fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;

    subgraph CLIENT ["Frontend Presentation Layer"]
        W1["6 Dedicated Role Workspaces<br/>(Applicant, Scrutiny, EVC, Regional Office, Council, Admin)"]:::ui
    end

    subgraph PLATFORM ["Core Platform Engine"]
        GW["Authentication, Role Authorization & Intake Gateway"]:::gateway
        ENG1["Deterministic Regulatory Route Engine<br/>(APH 2024–27 & AY 2026–27 Rules)"]:::core
        ENG2["Document Review & Scope Lock Engine"]:::core
        ENG3["Four-Clock Statutory SLA & Escalation Engine"]:::core
        ENG4["Post-Approval Compliance Monitoring"]:::core
    end

    subgraph STORAGE ["Persistence & Audit Layer"]
        DB["MongoDB Persistence Engine"]:::persist
        AUDIT["Tamper-Evident Cryptographic Audit Ledger"]:::persist
    end

    CLIENT --> GW
    GW --> ENG1
    ENG1 --> ENG2 & ENG3 & ENG4
    ENG2 & ENG3 & ENG4 --> DB & AUDIT
```

</details>

👉 **For the complete 22-category regulatory cross-reference matrix, see [`docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md`](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md).**

---

## 📄 Document Review and Deadline Tracking

### Structured Document Review & Scope Lock
The document review engine guides institutional evidence through five clear lifecycle states: `Pending (0) → Verified (1) → Deficient (2) → Resubmitted (3) → Sealed (4)`.

When deficiencies are identified during initial scrutiny, a Letter of Deficiency (LoD) details the exact shortcomings to the institution. To protect institutions from repeated objections on previously cleared submissions:
- **Locked Approved Documents:** Documents approved during earlier scrutiny rounds are permanently locked read-only. Reviewers cannot edit, comment on, or reject them.
- **Targeted Rectification:** Re-scrutiny is restricted strictly to reviewing resubmitted evidence for items flagged as deficient.
- **Server Enforcement:** Attempts to reopen or alter locked documents are automatically blocked.

<details>
<summary><strong>▶ Click here to view the document verification and scope lock workflow diagram</strong></summary>

```mermaid
flowchart LR
    classDef pending fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1,font-weight:bold;
    classDef verified fill:#D1FAE5,stroke:#059669,stroke-width:2px,color:#064E3B,font-weight:bold;
    classDef deficient fill:#FFE4E6,stroke:#E11D48,stroke-width:2px,color:#881337,font-weight:bold;
    classDef resubmit fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:bold;
    classDef sealed fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#581C87,font-weight:bold;
    classDef lock fill:#ECFDF5,stroke:#10B981,stroke-width:2.5px,color:#047857,font-weight:bold;

    S0["📄 State 0: PENDING<br/>(Uploaded by Institution)"]:::pending
    S1["✅ State 1: VERIFIED<br/>(Cleared in Initial Scrutiny)"]:::verified
    S2["⚠️ State 2: DEFICIENT<br/>(Shortcomings Flagged in LoD)"]:::deficient
    S3["📤 State 3: RESUBMITTED<br/>(Cured within 10-Day SLA)"]:::resubmit
    LOCK["🔒 Scope Lock Active<br/>(Permanently Locked Read-Only)"]:::lock
    S4["🛡️ State 4: SEALED<br/>(Order Issued · Immutable)"]:::sealed

    S0 -->|Initial Review Pass| S1
    S0 -->|Shortcomings Found| S2
    S1 -->|Re-Scrutiny Protection| LOCK
    LOCK --> S4
    S2 -->|Institution Rectification| S3
    S3 -->|Differential Review Cleared| S1
    S3 -->|Shortcomings Unresolved| S2
    S1 -->|Final Council Order| S4
```

</details>

### Four-Clock Regulatory SLA & Alert Management
NIYAMSETU actively tracks statutory processing timelines across four independent countdown clocks:
1. **Clock T1 (Desk Scrutiny):** 10 calendar days for initial document evaluation.
2. **Clock T2 (Deficiency Rectification):** 10 calendar days for institutions to cure notified shortcomings.
3. **Clock T3 (EVC Inspection):** 15 calendar days for scheduling and conducting physical campus visits.
4. **Clock T4 (Council Decision):** 15 calendar days for final adjudication and order issuance.

When a case reaches **80% of its allotted timeline**, an amber warning alert is dispatched to responsible officers. If a clock reaches **100% without completion**, the docket automatically escalates to the Regional Officer for immediate intervention.

<details>
<summary><strong>▶ Click here to view the regulatory deadline tracking and alert escalation diagram</strong></summary>

```mermaid
flowchart TD
    classDef c1 fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1,font-weight:bold;
    classDef c2 fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,font-weight:bold;
    classDef c3 fill:#CCFBF1,stroke:#0D9488,stroke-width:2px,color:#115E59,font-weight:bold;
    classDef c4 fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#4C1D95,font-weight:bold;
    classDef warn fill:#FEF9C3,stroke:#CA8A04,stroke-width:2px,color:#854D0E,font-weight:bold;
    classDef breach fill:#FEE2E2,stroke:#DC2626,stroke-width:2.5px,color:#7F1D1D,font-weight:bold;

    subgraph CLOCKS["Four Statutory Countdown Clocks"]
        C1["⏱️ Clock T1: Desk Scrutiny<br/>(10 Calendar Days)"]:::c1
        C2["⏳ Clock T2: Deficiency Rectification<br/>(10 Calendar Days)"]:::c2
        C3["📍 Clock T3: EVC Campus Inspection<br/>(15 Calendar Days)"]:::c3
        C4["⚖️ Clock T4: Council Decision Gate<br/>(15 Calendar Days)"]:::c4
    end

    subgraph TRIGGERS["Automated Notification & Escalation Triggers"]
        W["⚠️ 80% SLA Elapsed<br/>(Advance Reminder Notice Dispatched to Officer)"]:::warn
        B["🚨 100% SLA Elapsed (Overdue)<br/>(Overdue Docket Auto-Escalated to Regional Officer)"]:::breach
    end

    C1 -.->|Day 8| W
    C1 -.->|Day 10| B
    C2 -.->|Day 10| B
    C3 -.->|Day 15| B
    C4 -.->|Day 15| B
```

</details>

---

## 👥 Six Role-Based Workspaces

NIYAMSETU provides six dedicated workspaces with strict procedural boundaries and data isolation:

| Workspace | Primary Responsibilities & Functional Views |
| :--- | :--- |
| 🏫 **Institution / Applicant** | Submit statutory applications, upload required evidence and affidavits, cure notified deficiencies within the 10-day window, track live stage progress, and fulfill post-approval compliance obligations. |
| 🔍 **Desk Scrutiny Committee** | Verify document checklists against statutory norms, record clause-by-clause findings, issue Letters of Deficiency (LoD), and re-examine cured items with cleared documents locked. |
| 📍 **Expert Visit Committee (EVC)** | Access assigned physical inspection dockets, verify campus infrastructure with GPS coordinates and walkthrough video evidence, complete lab checklists, and submit finalized reports. |
| 🗂️ **Regional Office (RO)** | Monitor regional application pipelines and ageing metrics, allocate dockets to scrutiny groups and EVC panels, coordinate hearing schedules, and handle overdue escalations. |
| ⚖️ **Approval Bureau / Council** | Review consolidated regional dossiers and committee recommendations under the AICTE Act to issue authorized digital speaking orders (Letter of Approval, Extension of Approval, or Rejection). |
| ⚙️ **Policy Administration** | Configure AICTE regulatory rule parameters, test hypothetical application scenarios in the interactive routing sandbox, monitor system health, and inspect the audit ledger. |

---

## 🎬 Exploring NIYAMSETU — Platform Walkthrough

Visitors can explore the live prototype across its six dedicated workspaces:

- **Institution / Applicant Workspace:** Walk through the application intake process, inspect statutory route determinations and legal citations, access the deficiency cure interface, and track post-approval compliance countdown timers.
- **Desk Scrutiny Workspace:** Experience digital scrutiny checklists, record stage-wise verification findings, and observe how previously approved documents remain locked and protected during re-scrutiny.
- **Expert Visit Committee (EVC) Workspace:** View assigned inspection dockets, review campus location and GPS coordinates, inspect laboratory checklists, and submit on-site verification evidence with walkthrough media.
- **Regional Office Workspace:** Monitor the regional dashboard for active applications and stage-wise pendency, manage committee allocations for scrutiny and EVC panels, and review automated deadline escalations.
- **Approval Bureau / Council Workspace:** Review consolidated application dockets with committee findings and legal references, and issue authorized speaking orders (Letter of Approval, Extension of Approval, or Letter of Rejection).
- **Policy Administration Workspace:** Inspect configurable regulatory rule parameters, test hypothetical cases in the interactive routing sandbox, and review the tamper-evident chronological audit ledger.

---

## 🧱 Technology Stack & Repository Map

### Technology Stack

| Layer | Technologies & Tools |
|:--|:--|
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS 4, Vite 8, Lucide Icons, Recharts |
| **Backend** | Node.js 22/24, Express 4.21, Mongoose 9.11, Socket.io, Helmet, CORS |
| **Database** | MongoDB Community Standalone (Local development) / MongoDB Atlas (Production deployment) |
| **Security & Integrity** | HttpOnly SameSite session cookies, cryptographic audit chaining, role-based access control (RBAC) |
| **Testing & Quality Assurance** | Vitest 5, Supertest, headless automation suites |

### Repository Map

```
NIYAMSETU/
├── dist/                               # Production compiled client bundle
├── docs/
│   ├── assets/                         # Visual assets, logos, and workflow animations
│   ├── final_acceptance/               # System specifications and verification dossiers
│   ├── regulatory/                     # Regulatory source registers, APH handbooks, and citations
│   ├── workflows/                      # 14 modular workflow specifications (Diagrams A–N)
│   └── PS_COMPLIANCE_MATRIX.md         # Problem Statement PS 26262 compliance matrix
├── public/                             # Static web assets, icons, and web manifest
├── scripts/                            # Operational automation and verification scripts
├── src/
│   ├── backend/
│   │   ├── adapters/                   # Single-window intake and digital signature adapters
│   │   ├── core/                       # Express router, application cases, and platform engine
│   │   ├── middleware/                 # Authentication, role verification, and error handling
│   │   ├── models/                     # Mongoose data schemas and persistence models
│   │   ├── modules/                    # Scrutiny, EVC, decision authority, and compliance modules
│   │   ├── persistence/                # Database connection, transaction handling, and repository
│   │   ├── policy/                     # Regulatory rule engine & route classification
│   │   ├── routes/                     # REST API endpoint route definitions
│   │   └── security/                   # RBAC access control and cryptographic audit logger
│   ├── components/                     # Reusable UI components, navigation, and modal dialogues
│   ├── context/                        # React application context and role-scoped state
│   ├── features/                       # Dedicated role workspaces (Applicant, Scrutiny, EVC, RO, Council, Admin)
│   ├── services/                       # API client, HTTP communication, and session management
│   ├── types/                          # Domain TypeScript types and regulatory interfaces
│   └── utils/                          # Common utility functions, formatters, and helpers
├── tests/                              # 40 automated Vitest test suites (485 verified tests)
├── index.html                          # Single-page client application entrypoint
├── package.json                        # Project manifest, dependencies, and build scripts
├── render.yaml                         # Production cloud deployment configuration
├── server.ts                           # Unified Express server and Vite integration entrypoint
├── tsconfig.json                       # TypeScript compiler configuration
├── vite.config.ts                      # Vite build tool and bundler configuration
└── README.md                           # Master project documentation
```

---

## 🚀 Local Setup & Production Deployment

### 1. Local Prerequisites & Installation
Ensure Node.js (`>= 22.12.0`), npm (`>= 9.0.0`), and MongoDB are installed on your workstation:

```bash
# Clone the repository
git clone https://github.com/Parth-Chavan-15/SIH-2026-AICTE.git
cd SIH-2026-AICTE

# Install dependencies
npm install

# Run the full automated test suite (40 suites, 485 tests)
npm test

# Build the client production bundle
npm run build

# Start the unified server (Express + Vite on Port 3000)
npm run dev
```

Open **`http://127.0.0.1:3000`** in your web browser.

### 2. Production Deployment (Render + MongoDB Atlas)
The production application is hosted on **Render** backed by **MongoDB Atlas**:
- **Live URL:** [https://niyamsetu-aicte.onrender.com/](https://niyamsetu-aicte.onrender.com/)
- **Deployment Platform:** Render (Node.js web service with continuous deployment from the main branch).
- **Start Command:** `npm start` (`npx tsx server.ts`)
- **Health Check Endpoints:** `/health` and `/api/v1/ready`
- **Database Backend:** MongoDB Atlas dedicated cluster with automated index management.

---

## 🧪 Testing & Engineering Verification

### Automated Vitest Results: 40/40 Suites Passed, 485/485 Tests Passed (100%)

The codebase includes comprehensive test coverage verifying all functional areas:
- **Regulatory Rules & Routing Decisions:** Automated test suites verify classification across all 22 application categories, accreditation-based inspection waivers, and boundary conditions.
- **Access Control & Tenant Isolation:** Verifies role-based access restrictions, ensuring applicant institutions access only their own records while regional and national officers access appropriate jurisdictional scopes.
- **Operational Reliability & Clocks:** Verifies deadline calculations across all four statutory countdown clocks, automated warning alerts at 80% SLA elapsed, and escalation triggers upon breach.
- **Document Review Safeguards:** Verifies that previously cleared documents remain locked read-only during re-scrutiny rounds and that unauthorized modifications are rejected.
- **End-to-End Workflow Acceptance:** Full regression tests trace complete application lifecycles from intake to final Council order issuance and post-approval compliance tracking.

---

## 📚 Essential Resources

- **[Live prototype](https://niyamsetu-aicte.onrender.com/)** — explore the application.
- **[Demonstration video](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x)** — watch the system in action.
- **[Screen-by-screen walkthrough](https://drive.google.com/file/d/1EYKGkXoUPD9FOBFJl66p46_111cJDODY/view?usp=sharing)** — follow the user journey.
- **[AICTE requirement matrix](./docs/PS_COMPLIANCE_MATRIX.md)** — trace problem-statement coverage.
- **[Regulatory route matrix](./docs/workflows/ROUTE_TO_DIAGRAM_MATRIX.md)** — browse application categories and all detailed route diagrams.
- **[Regulatory source register](./docs/regulatory/SOURCE_REGISTER.md)** — APH, AICTE Act and addendum references.

---

<div align="center">

**NIYAMSETU (नियमसेतु) — The Bridge of Rules**<br/>
Built by **Team DEFENSOR** for **Smart India Hackathon 2026** · **Problem Statement PS 26262**<br/>
*All India Council for Technical Education (AICTE), Ministry of Education, Government of India*

</div>
