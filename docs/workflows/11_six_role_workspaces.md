# NIYAMSETU (नियमसेतु) — SIX ROLE-BASED WORKSPACES
## Role-Based Access Control, Workflows, Permissions & Workspace Architecture
**Smart India Hackathon 2026 | Problem Statement PS 26262 | Team DEFENSOR**  
**Authoritative Standards:** AICTE Approval Process Handbook (APH 2024–27) & Statutory Delegation of Powers

---

## 1. Multi-Role RBAC Model & Responsibility Separation

NIYAMSETU enforces strict server-side Role-Based Access Control (RBAC). No single actor can execute actions outside their statutory domain:

```mermaid
flowchart TD
    classDef inst fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef scrutiny fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef evc fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
    classDef ro fill:#F3E8FF,stroke:#7C3AED,stroke-width:1.5px,color:#4C1D95;
    classDef ca fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef admin fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;

    R1["Role 1: Technical Institution / Applicant<br/>(principal@coep.ac.in / principal@giits.ac.in)"]:::inst
    R2["Role 2: Desk Scrutiny Committee<br/>(scrutiny.reviewer@aicte.gov.in)"]:::scrutiny
    R3["Role 3: EVC Inspection Committee<br/>(evc.chair@aicte.gov.in)"]:::evc
    R4["Role 4: Regional Approval Officer (RO)<br/>(ro.western@aicte.gov.in)"]:::ro
    R5["Role 5: Approval Bureau / Council Authority<br/>(bureau.approval@aicte.gov.in)"]:::ca
    R6["Role 6: Policy Administrator & Telemetry<br/>(admin@aicte.gov.in)"]:::admin

    R1 -->|"1. Submits Application via NSWS"| R2
    R2 -->|"2. Checks Docs / Signs Snapshot"| R4
    R4 -->|"3. Allocates EVC Panel (if mandated)"| R3
    R3 -->|"4. Submits GPS & Video Report"| R4
    R4 -->|"5. Forwards Verified Docket"| R5
    R5 -->|"6. Signs Official Council Order"| R1
    R6 -.->|"Maintains Rules & Monitors Telemetry"| R2 & R3 & R4 & R5
```

---

## 2. Workspace 1: Role 1 — Technical Institution / Applicant
### Dedicated Portal for Heads of Institutions & Signatories

- **Assigned Personas:** `principal@coep.ac.in` (COEP), `principal@giits.ac.in` (GIITS), `principal@pdimtr.ac.in` (PDIMTR), `principal@apex.ac.in` (Apex), `principal@batu.ac.in` (BATU), `principal@vvit.ac.in` (VVIT).
- **Core Permissions:** `case.read`, `case.create`, `document.read`, `document.submit`, `scrutiny.correct`, `notification.read`.
- **Scope Restriction:** Strictly scoped to the actor's own institution (`scope: "scoped"`). Cannot read other institutions' cases or decision documents.

```mermaid
flowchart LR
    classDef step fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef terminal fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    A["NSWS Single Window Onboarding"]:::step
    --> B["Real-Time Application Tracking<br/>(Stage progress, assigned group, SLA clocks)"]:::step
    --> C["Deficiency Rectification Portal<br/>(Uploads cures during Clock T2 window)"]:::step
    --> D["Dispatched Decision Documents<br/>(Inspects digitally signed EoA/LoA letters)"]:::gate
    --> E["Post-Approval Compliance Workspace<br/>(Uploads FDR, Fire NOC, Lease, Faculty cures)"]:::terminal
```

---

## 3. Workspace 2: Role 2 — Desk Scrutiny Committee Cell
### Standing Scrutiny Committee Review & Scope-Locked Re-Scrutiny

- **Assigned Persona:** `scrutiny.reviewer@aicte.gov.in`.
- **Core Permissions:** `case.read`, `document.read`, `document.review`, `scrutiny.sign`, `scrutiny.rescrutinize`.
- **Guaranteed Invariant:** **USP B06 Scope Lock**. The reviewer cannot edit, comment on, or reject documents that were previously verified (`State 1: VERIFIED`) in Round 1. Attempted mutation returns `HTTP 409 Conflict`.

```mermaid
flowchart TD
    classDef queue fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef check fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef lod fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef seal fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    A["Scrutiny Queue: Regional Applications Allocated"]:::queue
    --> B["Checklist Review (C1–C6 Categories)<br/>Land, Building, Affidavits, Faculty Cadre, FSI"]:::check

    B --> C{"Scrutiny Findings"}
    C -->|All Passed| D["Seal Scrutiny Snapshot<br/>(Generates HMAC-SHA256 digest; sets state scrutiny_cleared)"]:::seal
    C -->|Deficiencies Flagged| E["Issue Letter of Deficiency (LoD)<br/>(Marks D1, D2 deficient; locks C3, C4 verified)"]:::lod

    E --> F["Differential Re-Scrutiny Session<br/>(Examines exclusively cured resubmissions for D1, D2)"]:::check
    F -->|Cured| D
    F -->|Uncured| G["Refer to Standing Hearing Committee (SHC)"]:::lod
```

---

## 4. Workspace 3: Role 3 — Expert Visit Committee (EVC) Portal
### On-Site Inspection Coordination & Video Evidence Verification

- **Assigned Persona:** `evc.chair@aicte.gov.in`.
- **Core Permissions:** `case.read`, `evc.read`, `evc.schedule`, `evc.report`, `document.read`.
- **Statutory Rules:** Only cases where the Dynamic Route Engine mandates an EVC (or cases referred by Regional Officer) appear in the EVC Inspection Queue. Accredited fast-track cases (COEP) are absent.

```mermaid
flowchart TD
    classDef queue fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef inspect fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
    classDef submit fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;

    A["EVC Inspection Queue<br/>(Lists only mandated visits: Non-NBA, New Inst, Site Shifting)"]:::queue
    --> B["Inspection Scheduling & Expert Panel Constitution<br/>(Assigns Convener, Subject Expert, Architecture Expert)"]:::queue
    --> C["Campus Physical Verification<br/>(GPS Coordinates geofenced within 500m of campus boundary)"]:::inspect
    --> D["Timestamped Walkthrough Video Verification<br/>(30-minute high-definition inspection video uploaded)"]:::inspect
    --> E["Institutional Scoring & Recommendation Form<br/>(Infrastructure, Labs, Library, Cadre scored out of 100)"]:::inspect
    --> F["Submit Sealed EVC Report to Council<br/>(Digitally signed; transitions case to decision_pending)"]:::submit
```

---

## 5. Workspace 4: Role 4 — Regional Approval Officer (RO)
### Regional Jurisdiction Oversight, Allocation & Escalations

- **Assigned Persona:** `ro.western@aicte.gov.in`.
- **Core Permissions:** `case.read`, `case.transition`, `scrutiny.sign`, `scrutiny.rescrutinize`, `evc.schedule`, `document.review`, `dashboard.read`, `history.read`.
- **Jurisdiction:** Western Region (Maharashtra, Goa, Gujarat, Daman & Diu).

```mermaid
flowchart TD
    classDef dash fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef alloc fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef esc fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;

    A["Regional Jurisdiction Dashboard<br/>(WRO Applications, Timers, Active Inspections)"]:::dash
    --> B["Committee Allocation Desk<br/>(Assigns Scrutiny Groups Alpha/Beta; Constitutes EVC Panels)"]:::alloc

    A --> C["SLA Escalation Queue<br/>(Monitors Clocks T1–T4; resolves overdue warnings)"]:::esc
    C -->|Breach Notice| D["Intervene / Reallocate Committee with Overdue Flag"]:::esc

    B & D --> E["Consolidated Regional Docket Review<br/>(Synthesizes Scrutiny Snapshot + EVC Scoring + Land Legal Review)"]:::gate
    --> F["Forward with Statutory Recommendation to Council Executive Committee"]:::gate
```

---

## 6. Workspace 5: Role 5 — Approval Bureau / Council Competent Authority
### Statutory Approval Orders & Decision Letters

- **Assigned Persona:** `bureau.approval@aicte.gov.in`.
- **Core Permissions:** `case.read`, `case.transition`, `decision.record`, `document.read`, `document.review`, `policy.read`, `dashboard.read`.
- **Authority:** Exercises executive powers under **Sections 10 and 11 of the AICTE Act, 1987**. Digitally signs Extension of Approval (EoA), Letter of Approval (LoA), or Letter of Rejection (LoR).

```mermaid
flowchart TD
    classDef review fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef order fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef doc fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef appeal fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,stroke-dasharray: 4 4,color:#92400E;

    A["Approval Bureau National Review Queue<br/>(All Regional Recommendations ready for adjudication)"]:::review
    --> B["Executive Committee Docket Adjudication"]:::review

    B --> C{"Competent Authority Decision"}
    C -->|Sanctioned Approval| D["Issue Extension of Approval (EoA) / Letter of Approval (LoA)<br/>(Signs order with HMAC-SHA256 non-production seal)"]:::order
    C -->|Rejected| E["Issue Speaking Letter of Rejection (LoR)<br/>(Detailed grounds; communicates 7-day appeal right)"]:::order

    D --> F["Dispatches Decision Letter to Official Vault<br/>(Watermarked PDF; materializes post-approval obligations)"]:::doc

    E -.->|7-Day Window| G["Standing Appellate Committee (SAC) Hearing Docket<br/>(Quasi-judicial appellate path)"]:::appeal
```

---

## 7. Workspace 6: Role 6 — Policy Administration & Autonomous Telemetry Console
### Rule Registry, System Health & WORM Audit Verification

- **Assigned Persona:** `admin@aicte.gov.in`.
- **Core Permissions:** `case.read`, `policy.read`, `policy.manage`, `history.read`, `dashboard.read`, `notification.read`, `document.read`.
- **Overhauled Scope:** System telemetry console displaying exclusively administrative notifications: Rule Engine Conflicts, WORM Audit Ledger verifications, Ecosystem Adapters health, SLA Escalations, and Worker Outbox status.

```mermaid
flowchart TD
    classDef policy fill:#EDE9FE,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6;
    classDef sandbox fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A;
    classDef audit fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef telem fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;

    A["Version-Pinned Rule Registry<br/>(Inspects active rules: APH-2024-27-AY2026-27-ERRATA-P42)"]:::policy
    --> B["Interactive Custom Route Sandbox<br/>(Mutates category, intake, NBA score in real time to test routing)"]:::sandbox

    C["WORM Cryptographic Audit Console<br/>(Verifies sequential SHA-256 hash chains across all ledger events)"]:::audit
    --> D["Tamper-Detection Engine<br/>(Identifies intentional negative test fixtures and database modifications)"]:::audit

    E["System Alerts & Autonomous Telemetry<br/>(Monitors NSWS Ingestion Webhook, Digilocker, CCA DSC Gateway, Outbox)"]:::telem
    --> F["Automated SLA Escalation Daemon Status (Levels 1-3 Active)"]:::telem
```
