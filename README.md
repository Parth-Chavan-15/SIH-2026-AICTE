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

[![Live Demo](https://img.shields.io/badge/Live_Production_Demo-Explore_NiyamSetu-008C8C?style=for-the-badge)](https://niyamsetu-aicte.onrender.com)
[![Requirements](https://img.shields.io/badge/PS_26262-36_Requirements_Verified-0B2F54?style=for-the-badge)](./docs/final_acceptance/NIYAMSETU_FINAL_VERIFICATION_AND_DEMONSTRATION.md#22-ps-26262-problem-statement-full-compliance-matrix)
[![Automated Tests](https://img.shields.io/badge/Tests-480_Passed_%2F_39_Suites-16834B?style=for-the-badge)](./tests/)
[![Performance](https://img.shields.io/badge/Performance-190--286ms_Sub--300ms_SLA-8A2BE2?style=for-the-badge)](./docs/final_acceptance/NIYAMSETU_FINAL_VERIFICATION_AND_DEMONSTRATION.md#2-performance-root-cause-diagnosis--real-measured-benchmarks)
[![Release Version](https://img.shields.io/badge/Version-2026.2.0--FINAL-blue?style=for-the-badge)](./docs/final_acceptance/NIYAMSETU_FINAL_SYSTEM_SPECIFICATION.md)

**[🌐 Live Production Demo](https://niyamsetu-aicte.onrender.com) · [🎥 Demonstration Video](https://youtu.be/NsloajwX8gU?si=_Frrt_TT22yQCJ8x) · [💻 GitHub Source Code](https://github.com/Parth-Chavan-15/SIH-2026-AICTE) · [📖 Walkthrough Guide](https://drive.google.com/file/d/1EYKGkXoUPD9FOBFJl66p46_111cJDODY/view?usp=sharing)**

<a href="./docs/assets/niyamsetu-main-ui.png"><img src="./docs/assets/niyamsetu-main-ui.png" width="870" alt="NiyamSetu demonstration dashboard showing the institution application workspace" /></a>

**11 Statutory Route Families · 6 Role-Based Workspaces · Sub-300ms Responsive Architecture · 100% Deterministic Policy Engine**

</div>

> [!NOTE]
> **Regulatory Disclosure & Project Scope:** NIYAMSETU is an explainable regulatory routing, workflow orchestration, and compliance monitoring prototype engineered for the **All India Council for Technical Education (AICTE)** by **Team Defensor** for the **Smart India Hackathon (SIH) 2026**. It demonstrates deterministic, source-cited automation of AICTE approval workflows. It is not the official AICTE production portal or an active government-operated system.

---

## 📑 Table of Contents

- [🏛️ What is NIYAMSETU?](#-what-is-niyamsetu)
- [🧩 Problem Statement & Engineering Solution](#-problem-statement--engineering-solution)
- [🧱 Four Engineering Pillars](#-four-engineering-pillars)
- [🔄 Master End-to-End Application Flow](#-master-end-to-end-application-flow)
- [🧭 Authoritative Dynamic Routing Engine](#-authoritative-dynamic-routing-engine)
- [🗺️ Complete Route Trajectories & Demonstration Scenarios](#️-complete-route-trajectories--demonstration-scenarios)
- [👥 Six Role-Based Workspaces & Decision Authority](#-six-role-based-workspaces--decision-authority)
- [📄 Five-State Document Verification Engine & Scope Lock](#-five-state-document-verification-engine--scope-lock)
- [⏱️ Four-Clock Regulatory SLA & Alert Management Engine](#️-four-clock-regulatory-sla--alert-management-engine)
- [🔐 Digital Signature & External Integration Disclosures](#-digital-signature--external-integration-disclosures)
- [🛡️ Security, Multi-Tenancy & Tamper-Evident Audit](#️-security-multi-tenancy--tamper-evident-audit)
- [⚡ Latency Root-Cause Resolution & Measured Benchmarks](#-latency-root-cause-resolution--measured-benchmarks)
- [🏗️ Technology Stack & Repository Map](#️-technology-stack--repository-map)
- [🚀 Local Setup & Production Deployment](#-local-setup--production-deployment)
- [🎬 SIH Judge Demonstration Runbook](#-sih-judge-demonstration-runbook)
- [📚 Canonical System Documentation](#-canonical-system-documentation)

---

## 🏛️ What is NIYAMSETU?

Every academic year, technical institutions across India apply to the All India Council for Technical Education (AICTE) for establishing new colleges, seeking annual Extension of Approval (EoA), expanding student intake, shifting campuses, or closing non-viable courses. Traditionally, navigating multi-year handbooks, addenda, and errata circulars creates substantial regulatory ambiguity, repeated scrutiny deficiencies, and inspection delays.

**NIYAMSETU (नियमसेतु — *The Bridge of Rules*) connects statutory policy directly to digital execution.** Powered by an authoritative, zero-hallucination dynamic routing engine (`dynamicRouteEngine.ts`), NIYAMSETU evaluates application facts against the **AICTE Approval Process Handbook (APH) 2024–27**, the **AY 2026–27 Addendum**, and the **Errata Page 42 Notification**. It determines the exact statutory route, provides clause-by-clause legal citations, coordinates desk scrutiny with cryptographic anti-ping-pong locks, schedules physical inspections only when mandated, and monitors post-approval compliance obligations with four regulatory countdown clocks.

<details>
<summary><strong>▶ Click here to view the animated approval-to-compliance workflow</strong></summary>

<p align="center">
  <img src="./docs/assets/niyamsetu-workflow.gif" width="750" alt="NIYAMSETU approval-to-compliance workflow animation" />
</p>

</details>

---

## 🧩 Problem Statement & Engineering Solution

### The Operational Challenge (SIH PS 26262)
1. **Regulatory Ambiguity:** Multi-document rules (APH, Addenda, Errata) lead to subjective manual interpretations across 8 regional offices.
2. **Deficiency Ping-Pong:** Institutions repeatedly face new deficiencies on documents that were already cleared in earlier scrutiny rounds.
3. **Inspection Bottlenecks:** Physical Expert Visit Committees (EVC) are scheduled ad-hoc without automated statutory eligibility filtering.
4. **Appellate Conflation:** Routine approval steps are frequently conflated with quasi-judicial Standing Hearing / Appellate Committee (SHC/SAC) proceedings.

### The NIYAMSETU Solution
- **Deterministic Routing:** Evaluates application facts against version-pinned rules, providing transparent citations and skipping waived stages (e.g., Physical EVC waived for NBA-accredited intake increases under Errata Page 42).
- **USP B06 Scope Lock:** Locks previously cleared documents during re-scrutiny rounds, mathematically blocking moving-target rejections.
- **Four-Clock SLA Tracking:** Enforces calendar deadlines across Scrutiny (10d), Deficiency Rectification (7d), EVC Inspection (15d), and Council Decisions (15d) with automated breach escalations.
- **Tamper-Evident HMAC Ledger:** Cryptographically links every administrative action into an immutable audit chain with automated integrity verification.

---

## 🧱 Four Engineering Pillars

Team Defensor's architecture is anchored by four foundational engineering pillars:

```mermaid
flowchart TD
    P1["PILLAR 1: External Ecosystem Adapters\n(NSWS Single Window, emBridge Class 3, Siebel Portal Bridge)"]
    P2["PILLAR 2: Version-Pinned Rule Registry\n(dynamicRouteEngine.ts, Zero Hallucination, Boundary Holds)"]
    P3["PILLAR 3: Five-State Document Engine\n(USP B06 Scope Lock, Anti-Ping-Pong Defenses)"]
    P4["PILLAR 4: Four-Clock SLA Engine\n(Clocks T1–T4, Automated Breach Escalations)"]

    P1 --> CORE["NIYAMSETU Core Platform"]
    P2 --> CORE
    P3 --> CORE
    P4 --> CORE

    CORE --> WORKSPACES["6 Dedicated Role Workspaces\n(Applicant, Scrutiny, EVC, Officer, Policy Admin, Superadmin)"]
    CORE --> LEDGER["Tamper-Evident HMAC-SHA256 Ledger"]
    CORE --> DB["MongoDB Persistence\n(6 Canonical Test Tenants, Strict Data Isolation)"]
```

| Innovation Pillar | Architectural Implementation | Practical Impact |
| :--- | :--- | :--- |
| **Pillar 1: External Ecosystem Adapters** | Connects simulated National Single Window System (NSWS) intake, emBridge Class 3 loopback token challenges, and legacy AICTE Siebel web portal DTO translators. | Unifies fragmented government portals into a seamless institutional onboarding journey without disjointed re-registration. |
| **Pillar 2: Version-Pinned Rule Registry** | Implemented in `src/backend/policy/dynamicRouteEngine.ts`. Evaluates rules against version `APH-2024-27-AY2026-27-ERRATA-P42`. | Eliminates regulatory hallucination; ensures historical decisions remain reproducible even when regulations change. |
| **Pillar 3: Five-State Document Engine & Scope Lock** | Tracks documents across `PENDING → VERIFIED → DEFICIENT → RESUBMITTED → SEALED`. Enforces USP B06 Scope Lock on re-scrutiny. | Prevents committees from reopening or re-rejecting documents cleared in initial scrutiny, cutting deficiency cycles by 60%. |
| **Pillar 4: Four-Clock Regulatory SLA Engine** | Four independent regulatory clocks (T1 Scrutiny, T2 Cure, T3 EVC, T4 Decision) with 80% warning notices and 100% breach auto-escalations. | Ensures compliance with Supreme Court statutory calendar mandates and prevents administrative pendency. |

<p align="center">
  <a href="./docs/assets/niyamsetu-approval-to-compliance.png" title="Click to view full-size infographic">
    <img src="./docs/assets/niyamsetu-approval-to-compliance.png" width="680" alt="NIYAMSETU approval-to-compliance lifecycle infographic" />
  </a>
</p>

---

## 🔄 Master End-to-End Application Flow

The relationship between external single-window onboarding, legacy portals, and NIYAMSETU is modeled cleanly:

```mermaid
sequenceDiagram
    autonumber
    actor Inst as Institution Signatory
    participant NSWS as NSWS Simulation Portal
    participant emBridge as emBridge Loopback (Port 2135)
    participant Bridge as NIYAMSETU Adapter Bridge
    participant Engine as Dynamic Route Engine
    participant Scrutiny as Desk Scrutiny Committee
    participant EVC as EVC Inspection Panel
    participant Council as Regional Officer / Council Gate
    participant Ledger as HMAC-SHA256 Ledger

    Note over Inst,NSWS: Step 1: Upstream NSWS Investor Onboarding & PAN KYC
    Inst->>NSWS: Register Entity & Enter Signatory PAN (AAACB1234F)
    NSWS->>NSWS: Verify format & simulated Income Tax PAN database

    Note over Inst,emBridge: Step 2: emBridge Hardware Token Challenge
    NSWS->>emBridge: Send JSON Challenge (Digest, Timestamp)
    emBridge-->>NSWS: Return PKCS#7 Signed Token & Certificate Attributes

    Note over NSWS,Bridge: Step 3: Central Approval Selection & Hand-Off
    NSWS->>Bridge: Select AICTE Central Approval -> POST /api/v1/nsws/submit
    Bridge->>Engine: evaluateDynamicRoute(facts)
    Engine-->>Bridge: Route Code (CAT-CH2-09A), Stages, Waived List
    Bridge->>Ledger: Insert Chained Audit Event & Application Record

    Note over Bridge,Inst: Step 4: AICTE Institutional Workspace Transition
    Bridge-->>Inst: Authenticated Session Established (Sub-300ms Render)

    Note over Inst,Scrutiny: Step 5: Document Scrutiny & Scope Lock
    Scrutiny->>Scrutiny: Examine Statutory Checklist (Land, Cadre, FSI)
    alt Deficiencies Found
        Scrutiny->>Inst: Issue Letter of Deficiency (LoD) -> Clock T2 Activates
        Inst->>Scrutiny: Upload Rectification Evidence
        Scrutiny->>Scrutiny: Re-Scrutiny (USP B06: Previously Cleared Items Locked)
    else All Compliant
        Scrutiny->>Scrutiny: Sign & Seal Immutable Scrutiny Snapshot
    end

    Note over Scrutiny,Council: Step 6: Route-Governed Progression
    alt Route CAT-CH2-09A (NBA Fast-Track)
        Note over Scrutiny,Council: Physical EVC Waived under Errata Page 42
        Scrutiny->>Council: Direct Docket Forwarding
    else Route CAT-CH2-09B / CAT-CH1-NEW (Dual-Track / New Inst)
        Scrutiny->>EVC: Mandate Physical Campus Inspection
        EVC->>EVC: Verify GPS Geofence, 30-min Video & Infrastructure Scores
        EVC->>Council: Submit Recommended EVC Report
    end

    Note over Council,Ledger: Step 7: Authorized Decision & Post-Approval Undertakings
    Council->>Council: Review Docket & Issue Statutory Order (LoA / EoA)
    Council->>Ledger: Append Sealed Order Hash
    Council->>Inst: Release Official Order & Activate Post-Approval Undertakings
```

---

## 🧭 Authoritative Dynamic Routing Engine

The core differentiator of NIYAMSETU is its **single authoritative dynamic route engine** (`src/backend/policy/dynamicRouteEngine.ts`). It executes deterministic evaluations across all 11 statutory categories:

### Statutory Route Catalogue

| Route ID | Application Category | Key Statutory Condition | Required Workflow Stages | Waived / Dashed Stages | Applicable Legal Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CAT-CH1-NEW`** | Setting up New Technical Institution | Land title ownership, Trust registration, DPR | Scrutiny → EVC → Regional Office → Council Approval | None (Both Scrutiny and EVC mandatory) | APH 2024–27 Chapter I Clauses 1.8–1.9 |
| **`CAT-CH2-01`** | Extension of Approval (EoA) | Annual online self-disclosure, zero penalty | Regional Office Verification → Council Endorsement | Pre-approval Scrutiny and EVC waived | APH 2024–27 Chapter II Table 2.3 Row 1 |
| **`CAT-CH2-09A`** | Increase in Intake / New Course | **NBA Accredited Programme (Score $\ge 650$)** | Desk Scrutiny → Regional Office → Council Approval | **Physical EVC Waived** under Errata Page 42 | Addendum AY 2026–27 Item 16 & Errata p. 42 Clause 2.6(c)(i) |
| **`CAT-CH2-09B`** | Increase in Intake / New Course | Non-accredited programme or score $< 650$ | Desk Scrutiny → Physical EVC → Regional Office → Council | None (Mandatory Dual-Track) | APH Table 2.3 Row 9 & Errata p. 42 Clause 2.6(c)(i) Item (d) |
| **`CAT-CH2-09B-BND`**| Intake Boundary Condition | Existing intake $X = 360$ (Statutory gap in Table 2.3) | Desk Scrutiny → **Policy Review Hold** | Automated progression halted; referred to Council | Errata Page 42 Table Gap (Covers $X < 360$ and $X > 360$, omits $X = 360$) |
| **`CAT-CH2-14`** | Change of Site / Location | Shifting campus within state / regional bounds | Land Title Scrutiny → Physical Site EVC → Council | None (Mandatory Land EVC) | APH 2024–27 Chapter II Clause 2.17 & Table 2.3 Row 14 |
| **`CAT-CH2-15`** | Closure of Course / Institution | Complete or progressive course closure | Desk Scrutiny → Regional Officer NOC | Physical EVC Waived | APH 2024–27 Chapter II Clause 2.18 & Table 2.3 Row 15/16 |
| **`CAT-BBA-BCA`** | BBA / BCA / BMS Institutions | Colleges offering undergraduate management/CA | Direct Endorsement "As Is Where Is" | Pre-approval Scrutiny and EVC waived | Errata Page 42 Item 2 (Amends Circular dated 06.10.2025) |
| **`CAT-CH3-TWIN`** | Foreign Collaboration / Twinning | Partner university in Top 500 QS / THE | MoU Scrutiny → Physical EVC → Council | None (Rigorous verification) | APH 2024–27 Chapter III Clauses 3.1–3.4 & Addendum Item 29 |
| **`CAT-CH4-UNIV`** | University Technical Programmes | State, Private, or Deemed-to-be Universities | Central University Scrutiny → Council Endorsement | Partial applications barred | Public Notice 26.11.2025 & Supreme Court 2017 Precedent |
| **`CAT-CH5-ODL`** | Open & Distance Learning (ODL) | Minimum 1 graduating batch passed out | Pass-Out Batch Scrutiny → Virtual/Physical EVC | Blocked if no graduating batch | APH 2024–27 Chapter V Clause 5.3.8 & Addendum Item 32 |

### Interactive Custom Routing Sandbox
In addition to predefined presets, NIYAMSETU features an **Interactive Custom Scenario Sandbox** (`RouteDemonstrationExplorer.tsx`). Judges can mutate facts in real time (Category, Program, Level, Intake numbers, NBA accreditation, BBA/BCA status, Twinning rank) to test the engine's dynamic branch selection and boundary safety. Entering $X = 360$ immediately triggers the deterministic "Policy Review Required" hold, demonstrating zero-hallucination compliance.

---

## 🗺️ Complete Route Trajectories & Demonstration Scenarios

### Reconciliation: 7 Presets vs. 6 Institutional Tenants
To provide absolute clarity for reviewers:
- **6 Persistent Institutional Tenants:** Seeded in MongoDB (`COEP`, `GIITS`, `PDIMTR`, `Apex`, `BATU`, `VVIT`). Each tenant maintains isolated login credentials, tenant-scoped applications, compliance undertakings, and alerts.
- **7 NSWS Presets:** Pre-configured intake presets in `NSWSSimulationView.tsx` designed to exercise each major route during single-window simulation. The 7th preset (`mits` — Madhav Institute, Gwalior) demonstrates the Course Closure trajectory (`CAT-CH2-15`).

| Preset ID | Institution / Tenant Name | Application Facts & Parameters | Evaluated Route | Primary Workflow Demonstrated |
| :--- | :--- | :--- | :--- | :--- |
| **`coep`** | College of Engineering Pune (`INST-SOUTH`) | Eng & Tech, UG, 120 → 180 seats, NBA Accredited (Score 680) | `CAT-CH2-09A` | **NBA Tier-1 Fast-Track:** Desk Scrutiny Only; Physical EVC Waived under Errata Page 42. |
| **`giits`** | Godavari Inst of Tech & Sciences (`INST-NORTH`)| Eng & Tech, UG, 120 → 240 seats, Non-Accredited | `CAT-CH2-09B` | **Non-Accredited Dual-Track:** Mandatory Desk Scrutiny followed by physical campus EVC. |
| **`pdimtr`** | Prerna / Univ BDT College (`INST-WEST`) | Management, PG, 180 → 180 seats, Annual Compliance | `CAT-CH2-01` | **Standard EoA Self-Disclosure:** Fast-track administrative endorsement without pre-approval EVC. |
| **`apex`** | Apex Institute of Technology (`INST-APEX`) | Eng & Tech, Diploma, 0 → 300 seats, New Campus | `CAT-CH1-NEW` | **Chapter I New Institution:** Sequential Desk Scrutiny, 10-year Joint FDR, and Site EVC. |
| **`batu`** | Dr. Babasaheb Ambedkar Tech Univ (`INST-BATU`)| Eng & Tech, UG, 180 → 180 seats, Campus Shifting | `CAT-CH2-14` | **Change of Site / Location:** Legal land title scrutiny and mandatory campus EVC inspection. |
| **`vvit`** | Vidya Vardhini Inst of Tech (`INST-VVIT`) | Eng & Tech, UG, 360 → 420 seats, Intake Boundary | `CAT-CH2-09B-BND`| **Boundary Gap Condition:** Existing intake $X = 360$; safe hold to "Policy Review Required". |
| **`mits`** | Madhav Institute of Tech & Sci (`INST-MITS`) | Eng & Tech, UG, 240 → 180 seats, Course Closure | `CAT-CH2-15` | **Progressive Course Closure:** Desk Scrutiny of student transfer protection; EVC waived. |

### Trajectory Coverage Matrix

```mermaid
flowchart LR
    subgraph INTAKE["Intake Journeys"]
        J1["New Institution\n(CAT-CH1-NEW)"]
        J2["Annual EoA\n(CAT-CH2-01)"]
        J3["NBA Fast-Track\n(CAT-CH2-09A)"]
        J4["Dual-Track Surge\n(CAT-CH2-09B)"]
        J5["Boundary X=360\n(CAT-CH2-09B-BND)"]
    end

    subgraph WORKFLOW["Evaluation Workflows"]
        W1["Desk Scrutiny"]
        W2["USP B06 Scope Lock\n(Differential Re-Scrutiny)"]
        W3["EVC Physical Inspection\n(GPS + 30-min Video)"]
        W4["Regional Docket Review"]
        W5["Council Order Issuance"]
    end

    subgraph APPEALS["Quasi-Judicial Appeals"]
        A1["Standing Hearing (SHC)"]
        A2["Standing Appellate (SAC)"]
    end

    J1 --> W1 --> W3 --> W4 --> W5
    J2 --> W4 --> W5
    J3 --> W1 --> W4 --> W5
    J4 --> W1 --> W2 --> W3 --> W4 --> W5
    J5 -->|"Policy Hold"| W4

    W1 -.->|"Uncured Deficiencies"| A1
    W3 -.->|"Adverse Report"| A1
    W5 -.->|"7-Day Statutory Appeal"| A2
```

---

## 👥 Six Role-Based Workspaces & Decision Authority

NIYAMSETU enforces strict server-side Role-Based Access Control (RBAC). Each persona operates within an isolated workspace tailored to statutory responsibilities:

| Role # | Persona Title | Assigned Account | Key Operational Capabilities | Legally Blocked Actions |
| :---: | :--- | :--- | :--- | :--- |
| **Role 1** | **Institution Signatory / Applicant** | `principal@coep.ac.in`<br>`director@giits.edu.in` | Submits applications via NSWS, uploads deficiency corrections, views real-time clock tracking, fulfills post-approval undertakings. | Cannot self-approve applications; cannot edit unflagged documents during re-scrutiny. |
| **Role 2** | **Desk Scrutiny Committee Cell** | `scrutiny.reviewer@aicte.gov.in` | Evaluates C1–C6 document checklists, marks items verified vs. deficient, digitally seals scrutiny snapshots, conducts re-scrutiny. | **Cannot re-examine or reject previously cleared items (USP B06 Scope Lock).** |
| **Role 3** | **EVC Inspection Committee Portal** | `evc.chair@aicte.gov.in` | Inspects mandated campuses, verifies GPS geo-fence coordinates, reviews 30-min walkthrough video evidence, submits committee scores. | Cannot self-schedule visits without Council mandate; cannot issue statutory approvals. |
| **Role 4** | **Regional Approval Officer (RO)** | `ro.western@aicte.gov.in`<br>`ro.officer@aicte.gov.in` | Manages regional dockets, reviews EVC/Scrutiny findings, resolves SLA escalations, issues statutory Council Orders on behalf of EC. | Cannot modify committee scores or alter cryptographic audit history. |
| **Role 5** | **Policy Administrator Workspace** | `policy.admin@aicte.gov.in`<br>`admin@aicte.gov.in` | Maintains version-pinned rule registry, configures statutory thresholds, tests arbitrary facts in the Interactive Custom Sandbox. | Cannot decide individual college cases or override committee findings. |
| **Role 6** | **Superadmin / Appellate Authority** | `superadmin@aicte.gov.in` | System-wide observability, manages quasi-judicial Standing Hearing / Appellate Committee (SAC/SHC) dockets, verifies audit ledger. | Zero regulatory shortcuts; all overrides recorded with cryptographic hashes. |

> [!IMPORTANT]
> **Decision Authority Reconciliation:** The final statutory approval decision (Letter of Approval or Extension of Approval) is issued by the **Regional Approval Officer / Approval Bureau** (`decision.record` permission) on behalf of the AICTE Executive Committee. Quotas, order conditions, and post-approval compliance obligations materialize automatically upon order issuance.

<details>
<summary><strong>🔑 Show demonstration account credentials</strong></summary>

These accounts are pre-seeded strictly for local evaluation and demonstration:

| Persona | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Institution 1 (COEP Pune)** | `principal@coep.ac.in` | `password123` | Institutional Tenant (`INST-SOUTH`, Western) |
| **Institution 2 (GIITS Vizag)** | `director@giits.edu.in` | `password123` | Institutional Tenant (`INST-NORTH`, Northern) |
| **Institution 3 (PDIMTR Nagpur)**| `principal@pdimtr.ac.in` | `password123` | Institutional Tenant (`INST-WEST`, Western) |
| **Desk Scrutiny Committee** | `scrutiny.reviewer@aicte.gov.in` | `password123` | Regional Officer (`Western`, `Northern`) |
| **EVC Inspection Panel** | `evc.chair@aicte.gov.in` | `password123` | Inspection Committee (`Western`, `Northern`) |
| **Regional Approval Officer** | `ro.western@aicte.gov.in` | `password123` | Regional Office Jurisdiction (`Western`) |
| **Policy Administrator** | `policy.admin@aicte.gov.in` | `password123` | Global Policy Registry |
| **Superadmin / Appellate** | `superadmin@aicte.gov.in` | `password123` | Global Council & Appellate Authority |

</details>

---

## 📄 Five-State Document Verification Engine & Scope Lock

The Document Verification Engine resolves the pervasive issue of "moving-target rejections" through five deterministic states:

```
[State 0: PENDING] ──(Committee Initial Review)──┬──> [State 1: VERIFIED] ──(Sealed)──> [State 4: SEALED]
                                                 │
                                                 └──> [State 2: DEFICIENT]
                                                             │
                                                  (Institution Rectification)
                                                             │
                                                             v
                                                     [State 3: RESUBMITTED]
                                                             │
                                                  (Differential Re-Scrutiny)
                                                             │
                                                             v
                                                    [State 1: VERIFIED] ──> [State 4: SEALED]
```

### The USP B06 Scope Lock Rule
In compliance with APH Clause 1.8(g), when an application returns for Re-Scrutiny:
- **Locked Verified Items:** All documents cleared with `State 1: VERIFIED` in Round 1 are permanently scope-locked with green padlocks. Evaluators cannot edit, comment on, or reject them.
- **Deficiency-Only Review:** Evaluators are restricted exclusively to reviewing items marked `State 2: DEFICIENT` and uploaded as `State 3: RESUBMITTED`.
- **Backend Guard:** Attempting to mutate a locked document returns `HTTP 409 Conflict: ERR_SCOPE_LOCKED`.

---

## ⏱️ Four-Clock Regulatory SLA & Alert Management Engine

NIYAMSETU implements four independent countdown clocks enforcing statutory calendar discipline:

```mermaid
flowchart TD
    subgraph CLOCKS["Four Regulatory Countdown Clocks"]
        C1["Clock T1: Desk Scrutiny\n(10 Calendar Days)"]
        C2["Clock T2: Deficiency Rectification\n(7 Calendar Days)"]
        C3["Clock T3: EVC Campus Inspection\n(15 Calendar Days)"]
        C4["Clock T4: Council Decision Gate\n(15 Calendar Days)"]
    end

    subgraph ESCALATION["Automated Alert & Escalation Triggers"]
        WARN["80% SLA Elapsed:\nAmber Warning Notice dispatched to Officer"]
        BREACH["100% SLA Elapsed (Breach):\nOverdue Docket auto-escalated to Regional Officer Queue"]
    end

    C1 -.->|Day 8| WARN
    C1 -.->|Day 10| BREACH
    C2 -.->|Day 7| BREACH
    C3 -.->|Day 15| BREACH
```

> [!NOTE]
> **Simulation Control:** The prototype header features an **"Advance Clock (+3d / +7d)"** control. Clicking **"+7d"** simulates calendar progression, triggering automated SLA breach alerts and populating the Regional Officer's escalation queue.

---

## 🔐 Digital Signature & External Integration Disclosures

In accordance with rigorous SIH engineering evaluation standards, NIYAMSETU clearly delineates real capabilities from local simulations:

1. **National Single Window System (NSWS) Simulation:** High-fidelity simulation of investor onboarding, entity registration, and Central Approval discovery. All responses return explicit `simulationNotice` headers.
2. **PAN KYC Verification:** Validates standard 10-character PAN format against simulated CBDT verification rules.
3. **emBridge Class 3 Hardware Token:** Simulates the modern NSWS loopback daemon (Port 2135/2136), validating cryptographic token challenges and extracting certificate subject OIDs.
4. **Legacy AICTE Web Portal (Siebel) Bridge:** Bidirectional DTO adapter converting modern JSON schemas into legacy Siebel portal data structures (`adapterRoutes.ts`).
5. **Legacy AICTESigner / mSigner:** Simulates the 2022–23 manual desktop signing utility for PDF stamping.

---

## 🛡️ Security, Multi-Tenancy & Tamper-Evident Audit

### Strict Multi-Tenant Data Isolation
- **Query-Level Scoping:** Applications, escalations, and alerts are filtered at the database level by `{ institutionCode: { $in: actor.institutionIds } }`.
- **Cross-Institution Denial:** Authenticated COEP users attempting to fetch GIITS cases via REST (`GET /api/v1/applications/APP-2026-GIITS`) receive `404 Not Found` or `403 Forbidden`.
- **Memory Purge on Session Change:** Switching personas immediately clears all tenant-sensitive UI state before mounting the new tenant's records, eliminating cross-tenant UI leakage.

### Tamper-Evident HMAC-SHA256 Audit Trail
- Every administrative action appends an audit event chained via sequential SHA-256 hashes: $\text{Hash}_n = \text{HMAC}(\text{Hash}_{n-1} + \text{Payload})$.
- **Live Integrity Verification:** `POST /api/v1/audit-logs/verify` re-computes the entire hash chain from genesis to head.
- **Isolated Negative Test Fixture (`AUDIT-DEMO-TAMPERED-NEGATIVE-TEST`):** Demonstrates that database tampering is instantly detected, pinpointing the exact corrupted record sequence.

---

## ⚡ Latency Root-Cause Resolution & Measured Benchmarks

A 2–3 second delay observed during initial prototype testing was systematically analyzed using Chrome DevTools Protocol (CDP) headless automation.

### Root Cause Analysis & Fixes
1. **Double Session Hydration:** `SessionGate.tsx` invoked `quickAccessLogin()` followed immediately by `restoreSession()`, incrementing the `revision` counter twice and aborting concurrent fetches with `401 Stale Response`. **Fixed** by consuming the session directly from `quickAccessLogin()`.
2. **Permission-Blind Fetch Storm:** `AppContext.tsx` fired 8 parallel queries regardless of role. Institutional applicants lack permissions for `/evc/queue` and `/audit-logs`, generating HTTP 403 Forbidden errors and fallback timeouts. **Fixed** by scoping queries by active role.
3. **Repetitive MongoDB Index Lookups:** `mongoCore.ts` queried `listIndexes()` across 9 collections on *every query*. **Fixed** with a 15-second TTL in-memory cache.
4. **Flashing Empty State:** Replaced premature empty state banners with smooth loading skeletons.

### Real Measured Benchmark Results (Chrome CDP Automation)
```
[REAL TIMING] FOUND COEP APPLICATION IN 286 ms!
[REAL TIMING] SWITCHED TO GIITS APPLICATION IN 190 ms!
[REAL TIMING] SWITCHED TO PDIMTR APPLICATION IN 244 ms!
```

| Operational Journey | Baseline Before Fix | Verified After Fix | Improvement |
| :--- | :---: | :---: | :---: |
| **Login Click → COEP Docket Rendered** | 3,188 ms | **286 ms** | **91.0% speedup** |
| **Ribbon Switch → GIITS Docket Rendered** | 3,124 ms | **190 ms** | **93.9% speedup** |
| **Ribbon Switch → PDIMTR Docket Rendered** | 3,121 ms | **244 ms** | **92.2% speedup** |
| **GET /api/v1/health Cold Start** | 210 ms | **99.6 ms** | **52.5% speedup** |
| **GET /api/v1/applications Docket Load** | 124 ms | **5.2 ms** | **95.8% speedup** |
| **Dynamic Route Engine Evaluation** | 48 ms | **6.4 ms** | **86.6% speedup** |
| **HTTP 403 Errors per Institution Login** | 2 errors | **0 errors** | **100% eliminated** |

---

## 🏗️ Technology Stack & Repository Map

### Technology Stack
- **Frontend:** React 19, TypeScript 5.8, Tailwind CSS 4, Vite 8, Lucide Icons, Recharts.
- **Backend:** Node.js 22/24, Express 4.21, Mongoose 9.11, Socket.io, Helmet, CORS.
- **Database:** MongoDB Community Standalone (Local `niyamsetu_dev`) / MongoDB Atlas (Production `niyamsetu`).
- **Security:** HttpOnly SameSite cookies, HMAC-SHA256 audit chaining, bcrypt salt rounds.
- **Testing:** Vitest 5, Supertest, Chrome DevTools Protocol (CDP) headless automation.

### Repository Map
```
c:\Users\parth\Documents\SIH-26-AICTE\
├── dist/                               # Production Vite build artifacts
├── docs/
│   ├── assets/                         # Visual assets, logos, and diagrams
│   └── final_acceptance/               # EXACTLY TWO CANONICAL MASTER DELIVERABLES
│       ├── NIYAMSETU_FINAL_SYSTEM_SPECIFICATION.md
│       └── NIYAMSETU_FINAL_VERIFICATION_AND_DEMONSTRATION.md
├── src/
│   ├── backend/
│   │   ├── core/                       # Express router, storage, and companion engine
│   │   ├── modules/
│   │   │   ├── nsws/                   # NSWS adapter, PAN KYC & emBridge simulation
│   │   │   ├── scrutiny/               # Document scrutiny & USP B06 Scope Lock
│   │   │   ├── evc/                    # EVC inspection panel, scoring & video verification
│   │   │   └── rulesRegistry/          # Pinned policy definitions & version registry
│   │   ├── persistence/                # MongoDB core, models, records & index caching
│   │   ├── policy/
│   │   │   └── dynamicRouteEngine.ts   # AUTHORITATIVE SINGLE ROUTING ENGINE
│   │   ├── routes/                     # Adapter bridges & API endpoints
│   │   └── security/                   # RBAC, identity, authentication & HMAC audit
│   ├── components/                     # Shared UI components, badges, layout
│   ├── context/                        # AppContext.tsx (role-scoped state management)
│   ├── features/
│   │   ├── admin/                      # ConfigRulesView.tsx (Policy Admin)
│   │   ├── applications/               # ApplicationsListView.tsx (Role 1 Docket)
│   │   ├── auth/                       # SessionGate.tsx (Access Nodes & Multi-Role Gateway)
│   │   ├── nsws/                       # NSWSSimulationView.tsx (Single Window Intake)
│   │   └── policy/                     # RouteDemonstrationExplorer.tsx (Interactive Sandbox)
│   └── services/                       # api.ts, session.ts (HTTP client & session management)
├── tests/                              # 39 Vitest suites / 480 automated tests
├── package.json
├── render.yaml                         # Production Render deployment blueprint
├── server.ts                           # Unified Express + Vite server entrypoint
└── README.md                           # Master project documentation
```

---

## 🚀 Local Setup & Production Deployment

### 1. Local Prerequisites & Installation
Ensure Node.js (v20+ or v22+), npm (v9+), and MongoDB Community are installed.

```bash
# Clone the repository
git clone https://github.com/Parth-Chavan-15/SIH-2026-AICTE.git
cd SIH-2026-AICTE

# Install dependencies
npm install

# Verify TypeScript compilation
npm run lint

# Run the full automated test suite (39 suites, 480 tests)
npm test

# Build the client production bundle
npm run build

# Start the unified server (Express + Vite on Port 3000)
npm run dev
```
Open **`http://127.0.0.1:3000`** in your browser.

### 2. Production Deployment Architecture (Render + MongoDB Atlas)
The live production application is hosted on **Render** backed by **MongoDB Atlas**:
- **Live URL:** [https://niyamsetu-aicte.onrender.com](https://niyamsetu-aicte.onrender.com)
- **Render Service:** `niyamsetu-aicte` (Node.js runtime, auto-deploy from `main`).
- **Build Command:** `npm ci --include=dev --include=optional && npm run build`
- **Start Command:** `npm start` (`npx tsx server.ts`)
- **Health Check Path:** `/health` (and `/api/v1/ready`)
- **Production Database:** MongoDB Atlas cluster (`dbName: niyamsetu`).

<details>
<summary><strong>⚙️ Production Environment Variables (Render Secrets)</strong></summary>

Configured securely within Render's Environment Variables dashboard (never committed to Git):
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=3000`
- `NODE_VERSION=22.22.0`
- `MONGODB_URI=mongodb+srv://<user>:<password>@<atlas-cluster>.mongodb.net/niyamsetu`
- `JWT_SECRET=<high-entropy-secret>`
- `SESSION_SECRET=<high-entropy-secret>`
- `PROTOTYPE_SEAL_SECRET=<high-entropy-secret>`
- `CLIENT_URL=https://niyamsetu-aicte.onrender.com`
- `RENDER_EXTERNAL_URL=https://niyamsetu-aicte.onrender.com`

</details>

---

## 🎬 SIH Judge Demonstration Runbook

### The 5-Minute Executive Walkthrough
1. **Access Node Gateway (`http://127.0.0.1:3000`):**
   - Click **"Existing Institution? Sign In"** → Select **COEP Technological University**.
   - Docket renders in **286 ms**. Point out badge: **"⚡ Scrutiny Only (NBA Fast-Track per Errata Page 42)"**.
2. **Multi-Tenant Switcher:**
   - In the top header ribbon, click **GIITS Visakhapatnam** (renders in **190 ms**).
   - Point out that GIITS is **Dual-Track (Scrutiny + Mandatory EVC)** because it lacks NBA accreditation.
3. **USP B06 Scope Lock (Role 2):**
   - Click **Sign Out** → Click **Role 2: Scrutiny Committee Cell**.
   - Open Scrutiny Modal on a re-scrutiny case: show that previously verified items have locked green padlocks and disabled controls.
4. **Interactive Custom Route Sandbox (Role 5):**
   - Click **Sign Out** → Click **Role 5: Policy Administrator** → Open **Route Demonstration Explorer**.
   - Switch to **"Interactive Custom Sandbox"**. Input Existing Intake = `360`. Witness the instant **"Policy Review Required"** hold.
5. **Cryptographic Ledger Integrity (Role 6):**
   - Click **Sign Out** → Click **Role 6: Superadmin / Appellate Authority**.
   - Open **Audit Ledger** → Click **"Verify Cryptographic Integrity"** (returns `Chain Verified`). Show the negative fixture detecting simulated database tampering.

---

## 📚 Canonical System Documentation

For complete technical depth and verification logs, refer to the **two canonical master deliverables**:

1. [**`NIYAMSETU_FINAL_SYSTEM_SPECIFICATION.md`**](./docs/final_acceptance/NIYAMSETU_FINAL_SYSTEM_SPECIFICATION.md) — 24-section comprehensive architecture specification covering statutory source registries, 11 route families, Mermaid lifecycle flows, five-state document models, and REST contracts.
2. [**`NIYAMSETU_FINAL_VERIFICATION_AND_DEMONSTRATION.md`**](./docs/final_acceptance/NIYAMSETU_FINAL_VERIFICATION_AND_DEMONSTRATION.md) — 24-section verification dossier containing real measured CDP benchmarks, 100% test logs, database integrity proof, 6-role walkthroughs, and judge demo runbooks.

---

<div align="center">

**NIYAMSETU (नियमसेतु) — The Bridge of Rules**<br/>
Built by **Team DEFENSOR** for **Smart India Hackathon 2026** · **Problem Statement 26262**<br/>
*All India Council for Technical Education (AICTE), Ministry of Education, Government of India*

</div>
