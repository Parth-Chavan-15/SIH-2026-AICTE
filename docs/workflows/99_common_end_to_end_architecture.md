# NIYAMSETU: Common End-to-End Workflow & Platform Architecture

## 1. Architectural Philosophy

NIYAMSETU (नियमसेतु) replaces manual, error-prone, and opaque approval processes with an authoritative, rule-driven, and tamper-evident automated regulatory platform.

Rather than treating regulatory compliance as a single monolithic conveyor belt, NIYAMSETU's architecture models the statutory distinctions established in the **AICTE Approval Process Handbook (APH 2024-27)**:
- **Separation of Jurisdictions**: Chapter I (New Institutions) operates independently from Chapter II (Existing Institutions) and Chapter VII (Penal / Complaint Inquiries).
- **Table 2.3 Route Precision**: 21 distinct technical categories with explicit scrutiny, physical EVC, online EVC, and Council routing.
- **Differential Scope-Lock**: Guarantees natural justice by freezing evidentiary records when entering appellate or hearing stages (`HTTP 409 Conflict` safeguard).
- **Authoritative Clock Separation**: Disambiguates strict 7-day statutory SAC appeals, 10-day operational SLA turnarounds, 15-day §2.25(f) security deposits, and 30-day statutory notifications.

---

## 2. Platform Core Subsystems

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICANT INSTITUTION / USER                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & RBAC PERMISSION ENGINES                    │
│   (JWT Validation, Role Claims: Institution, RO, Scrutiny, EVC, SHC, SAC)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│ CHAPTER I ENGINE      │  │ CHAPTER II ENGINE     │  │ CHAPTER VII ENGINE    │
│ (01_chapter_i_new...) │  │ (Table 2.3 Matrix)    │  │ (07_chapter_vii...)   │
│ - LoD -> LoR -> LoA   │  │ - 02_self_disclosure  │  │ - PGRC -> SCSC -> EVC │
│ - Physical EVC        │  │ - 03_scrutiny_evc     │  │ - SHC -> EC Penalty   │
│ - 10-Yr Joint FDR     │  │ - 04_route_matrix     │  │ - Section 7 Sanctions │
└───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NATURAL JUSTICE & APPELLATE ENGINE                     │
│  - 05_shc_compliance.md (Standing Hearing Committee under §2.23.3)         │
│  - 06_chapter_specific_appeals.md (Standing Appellate Committee §1.11/§2.24)│
│  - Differential Scope-Lock Safeguard (HTTP 409 Snapshot Protection)        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 POST-APPROVAL COMPLIANCE & MONITORING ENGINE                │
│  - 08_post_approval_compliance.md (§2.25(f) FDR, Affidavit 3, 30-Day Clocks)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│       AUDIT & EVIDENCE LEDGER         │ │       STORAGE & PERSISTENCE       │
│  - SHA-256 Cryptographic Hash Check   │ │  - MongoDB Atlas Clustered Replica│
│  - Tamper-Evident Action Log          │ │  - Local / GridFS Blob Storage    │
│  - System Event Journal               │ │  - In-Memory Fallback Adapter     │
└───────────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 3. Complete End-to-End Lifecycle Sequence

```mermaid
flowchart TD
    classDef startStyle fill:#1e40af,stroke:#60a5fa,stroke-width:2px,color:#ffffff
    classDef routeStyle fill:#047857,stroke:#34d399,stroke-width:2px,color:#ffffff
    classDef processStyle fill:#374151,stroke:#9ca3af,stroke-width:2px,color:#ffffff
    classDef judicialStyle fill:#7c2d12,stroke:#fb923c,stroke-width:2px,color:#ffffff
    classDef successStyle fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#ffffff
    classDef rejectStyle fill:#7f1d1d,stroke:#f87171,stroke-width:2px,color:#ffffff

    %% User Initiates
    START([Institution Submits Application]):::startStyle --> ROUTE_SELECT{Classify Application Type}:::startStyle

    %% Routing
    ROUTE_SELECT -->|New Institution Proposal| C1["Chapter I Engine<br/>(docs/workflows/01_chapter_i...)"]:::routeStyle
    ROUTE_SELECT -->|Existing Institution Extension / Change| C2["Chapter II Engine & Table 2.3<br/>(docs/workflows/02, 03, 04...)"]:::routeStyle
    ROUTE_SELECT -->|Citizen / Stakeholder Complaint| C7["Chapter VII Complaint Route<br/>(docs/workflows/07_chapter_vii...)"]:::routeStyle

    %% Chapter I Branch
    C1 --> C1_SCRUT[Chapter I Scrutiny Committee]:::processStyle
    C1_SCRUT -->|Deficiencies Found| C1_DEF[10-Day Operational SLA Cure Intimation]:::processStyle
    C1_DEF -->|Cure Uploaded| C1_SCRUT
    C1_SCRUT -->|Recommended| C1_LOD[Issue Letter of Deficiency / Clearance]:::processStyle
    C1_LOD --> C1_EVC[Mandatory Physical EVC Committee]:::processStyle
    C1_EVC -->|Recommended| C1_LOR[Issue Letter of Recommendation LoR]:::processStyle
    C1_LOR --> COUNCIL_VOTE

    %% Chapter II Branch
    C2 --> C2_CAT{Table 2.3 Category Assessment}:::routeStyle
    C2_CAT -->|Row 1: Annual EoA Self-Disclosure| C2_AUTO[Self-Disclosure EoA Bypass]:::routeStyle
    C2_CAT -->|Rows 2-21: Intake/Course/Site Changes| C2_STD[Standard Chapter II Scrutiny]:::processStyle
    
    C2_AUTO --> COUNCIL_VOTE
    C2_STD --> C2_EVC_REQ{EVC Required by Table 2.3?}:::processStyle
    C2_EVC_REQ -->|No: Scrutiny Only| COUNCIL_VOTE
    C2_EVC_REQ -->|Yes: Physical / Online EVC| C2_EVC[Chapter II EVC Committee]:::processStyle
    C2_EVC --> COUNCIL_VOTE

    %% Rejection & Hearings (SHC / SAC)
    C1_SCRUT -->|Rejected / Severe Shortcomings| SHC_ROUTE["Standing Hearing Committee (SHC)<br/>(docs/workflows/05_shc...)"]:::judicialStyle
    C1_EVC -->|Adverse Inspection| SHC_ROUTE
    C2_STD -->|Shortcomings Detected| SHC_ROUTE
    C2_EVC -->|Adverse Findings| SHC_ROUTE

    SHC_ROUTE -->|Scope-Lock Enforced| SHC_DEC{SHC Recommendation}:::judicialStyle
    SHC_DEC -->|Clearance Granted| COUNCIL_VOTE
    SHC_DEC -->|Shortcomings Upheld| SAC_ROUTE["Standing Appellate Committee (SAC)<br/>(docs/workflows/06_chapter...)"]:::judicialStyle

    %% Appellate Branch
    SAC_ROUTE -->|Strict 7-Day Limitation| SAC_HEAR[SAC Quasi-Judicial Hearing]:::judicialStyle
    SAC_HEAR -->|Appeal Allowed| COUNCIL_VOTE
    SAC_HEAR -->|Appeal Dismissed| REJECT_FINAL[Final Rejection Issued]:::rejectStyle

    %% Executive Committee / Council Approval
    COUNCIL_VOTE[AICTE Executive Committee / Council Evaluation]:::startStyle
    COUNCIL_VOTE -->|Approved| POST_APP["Post-Approval Engine<br/>(docs/workflows/08_post_approval...)"]:::successStyle
    COUNCIL_VOTE -->|Rejected| SAC_ROUTE

    %% Post-Approval Compliance
    POST_APP --> T_15D[§2.25(f) 15-Day Joint FDR & Affidavit 3 Clock]:::processStyle
    POST_APP --> T_30D[30-Day Mandatory Statutory Committees Clock]:::processStyle
    T_15D --> POST_VERIF{RO Verification of FDR & Affidavits}:::processStyle
    T_30D --> POST_VERIF
    POST_VERIF -->|Verified| LOA_FINAL([Active Approved AICTE Institution]):::successStyle
    POST_VERIF -->|Default on Expiry| C7

    %% Complaints Integration
    C7 --> C7_PGRC[Public Grievance Redressal / SCSC]:::judicialStyle
    C7_PGRC -->|Valid Non-Anonymous Complaint| C7_EVC[Special Surprise EVC]:::judicialStyle
    C7_EVC -->|Violations Proven| SHC_ROUTE
