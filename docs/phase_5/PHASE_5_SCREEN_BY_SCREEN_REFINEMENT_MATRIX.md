# NIYAMSETU — PHASE 5: SCREEN-BY-SCREEN REFINEMENT MATRIX

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Document Ref:** `PHASE_5_SCREEN_BY_SCREEN_REFINEMENT_MATRIX.md`  

---

## 1. Scope & Screen Inventory

The NIYAMSETU companion application comprises **30 primary screens** organized across 6 statutory roles, plus **8 secondary modals and inspection drawers**. This document verifies the architecture, interactive controls, and feature preservation of each screen following the Phase 5 overhaul.

---

## 2. Master Screen Inventory & Refinement Status

### Role 1: Institution Signatory Portal (Applicant Workspace)
| Screen ID | Title | Tab Route | Component | Key Interactions / Verification | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **R1-S01** | My Applications & Live Lifecycle Tracking | `inst-apps` | `ApplicationsListView` | Real-time stage progression, tenant isolation filter, CSV export, search & filter by region/category. | **VERIFIED** |
| **R1-S02** | NSWS Single-Window Intake Simulation | `inst-nsws` | `NSWSSimulationView` | 5-step single-window intake, PAN KYC, emBridge DSC token check, dynamic route evaluation, case dossier confirmation. | **VERIFIED** |
| **R1-S03** | Deficiency Response & Document Upload | `inst-deficiencies` | `InstitutionDeficiencyCureView` | Scope Lock USP B06 enforcement; institution uploads replacement documents strictly for flagged items. | **VERIFIED** |
| **R1-S04** | Formal Approval / Decision Letters | `inst-decision-docs` | `GeneratedDocumentsView` | Cryptographically signed EoA and LoA PDF letters with QR code verification and WORM hash. | **VERIFIED** |
| **R1-S05** | Post-Approval Undertakings & Renewals | `inst-renewals` | `ComplianceView` | Lease deeds, land conversion undertakings, FDR certificates with 4-clock deadline tracking. | **VERIFIED** |
| **R1-S06** | Standing Appellate / Hearing Applications | `appeals-hearings` | `AppealsAndHearingsView` | SAC statutory appeal submissions within 7-day window; grievance filings with PGRC/SCSC. | **VERIFIED** |
| **R1-S07** | Official Communications & Notices | `notifications` | `NotificationsView` | Tenant-isolated critical alerts, SLA deadline countdowns, hearing schedule summons. | **VERIFIED** |

---

### Role 2: Desk Scrutiny Committee Cell (Document Verification)
| Screen ID | Title | Tab Route | Component | Key Interactions / Verification | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **R2-S01** | Scrutiny Evaluation Console | `scrutiny-eval` | `ScrutinyEvaluationView` | Item-by-item checklist evaluation, deficiency tagging, digital signature snapshot, Scope Lock enforcement. | **VERIFIED** |
| **R2-S02** | Scrutiny Roster & Committee Composition | `scrutiny-committee` | `ScrutinyRosterDeclarationView` | Multi-member committee declaration, conflict of interest disclosure, automated roster assignment. | **VERIFIED** |
| **R2-S03** | Existing AICTE Portal Legacy Ingestion | `scrutiny-portal-import` | `PortalImportView` | Legacy XML/JSON case ingestion adapter with schema validation and automated route tagging. | **VERIFIED** |
| **R2-S04** | Scrutiny Committee Queue | `scrutiny-queue` | `ApplicationsListView` | Committee-assigned pending applications docket with SLA countdown timer. | **VERIFIED** |
| **R2-S05** | Scrutiny Deficiency Register | `scrutiny-deficiencies` | `PendencyView` | Register of issued scrutiny deficiencies and institution cure submissions. | **VERIFIED** |

---

### Role 3: EVC Inspection Committee Portal (Campus Verification)
| Screen ID | Title | Tab Route | Component | Key Interactions / Verification | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **R3-S01** | Campus Inspections & Telemetry | `evc-inspect` | `EVCView` | Geo-tagged GPS coordinates, 30-min walkthrough video evidence check, biometric faculty log review. | **VERIFIED** |
| **R3-S02** | Signed Inspection Reports & Analytics | `evc-reports` | `EVCReportsView` | **DEDICATED OVERHAUL:** 5 real-data KPI cards, 2 visual charts (Recommendation distribution & Rubric analysis), signed report register, dossier modal. | **VERIFIED** |
| **R3-S03** | Inspection Deadlines & Alerts | `notifications` | `NotificationsView` | Schedule reminders, 48-hour report upload deadlines, panel member confirmation alerts. | **VERIFIED** |
| **R3-S04** | EVC Assigned Queue | `evc-queue` | `EVCView` | Docket of upcoming and in-progress physical and virtual campus inspections. | **VERIFIED** |
| **R3-S05** | EVC Appellate & Hearing Referrals | `evc-sac` | `AppealsAndHearingsView` | View inspection findings referred to Standing Hearing Committee (SHC) for clarification. | **VERIFIED** |

---

### Role 4: Regional Office Operations Desk (Pendency & Compliance Desk)
| Screen ID | Title | Tab Route | Component | Key Interactions / Verification | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **R4-S01** | Regional Pendency & Ageing Cockpit | `ro-pendency` | `PendencyView` | Ageing bucket breakdown (0–7d, 8–15d, 16–30d, >30d), regional workload, peak bottleneck stage identifier. | **VERIFIED** |
| **R4-S02** | Committee Allocation Console | `ro-allocation` | `ROAllocationView` | Regional committee member assignment, workload balance check, conflict validation. | **VERIFIED** |
| **R4-S03** | State DTE & University Concurrence | `ro-concurrence` | `GovernmentEndpointsView` | 15-day statutory deemed concurrence tracker (APH Clause 1.8(f)); API Setu and State DTE integration. | **VERIFIED** |
| **R4-S04** | Post-Approval Obligations & FDRs | `ro-obligations` | `ComplianceView` | Compliance monitoring for land conversion, building completion certificates, and joint FDRs. | **VERIFIED** |
| **R4-S05** | Document Expiry & Renewal Alerts | `ro-verify` | `DocumentExpiryView` | 90-day expiry warning ledger, bank guarantee renewal verification, lease deed validity. | **VERIFIED** |
| **R4-S06** | Regional Hearing Summon Docket | `ro-appeals-hearings`| `AppealsAndHearingsView` | Hearing coordination for regional non-compliance and institution defense. | **VERIFIED** |

---

### Role 5: Competent Authority Chamber (Council EC Approval Gate)
| Screen ID | Title | Tab Route | Component | Key Interactions / Verification | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **R5-S01** | Executive Committee Decision Chamber | `ca-decision` | `CompetentAuthorityDecisionView`| Authoritative approval gate; issues Approval, Conditional Approval, or Rejection with mandatory reasons. | **VERIFIED** |
| **R5-S02** | Executive Approval Dossiers | `ca-dossiers` | `ApplicationsListView` | Full dossier review including initial scrutiny snapshot, EVC scores, and SHC recommendations. | **VERIFIED** |
| **R5-S03** | Standing Hearing & Appellate Records | `ca-hearings` | `AppealsAndHearingsView` | Council oversight of SHC speaking orders and SAC appellate modifications. | **VERIFIED** |
| **R5-S04** | Formal Statutory Approvals Repository | `ca-docs` | `GeneratedDocumentsView` | Immutable repository of issued LoA, EoA, and Withdrawal orders signed via digital certificates. | **VERIFIED** |

---

### Role 6: Central Policy Administration (Policy & Audit Ledger)
| Screen ID | Title | Tab Route | Component | Key Interactions / Verification | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **R6-S01** | Regulatory Studio & Policy Sandbox | `admin-policy` | `RegulatoryStudioView` | Dynamic rule testing sandbox, boundary guard simulation (Division X=360), tamper-proof rule verification. | **VERIFIED** |
| **R6-S02** | Official Government Endpoints | `admin-endpoints` | `GovernmentEndpointsView` | Zero-rewrite companion architecture connecting NSWS, Siebel CRM, AICTESigner, and API Setu. | **VERIFIED** |
| **R6-S03** | WORM Cryptographic Audit Ledger | `admin-audit` | `AuditView` | Immutable audit trail displaying event hashes, actors, before/after states, and tamper-detection indicators. | **VERIFIED** |
| **R6-S04** | Configurable Capacity & Rule Settings | `admin-rules` | `ConfigRulesView` | Administrative threshold management (intake limits, SLA day allowances, penalty percentages). | **VERIFIED** |

---

## 3. Secondary Interfaces & Modals Inventory

| Modal ID | Modal Title | Triggering Context | Content / Controls | Status |
| :---: | :--- | :--- | :--- | :---: |
| **MOD-01** | Case Dossier Modal | Any application row click | Complete lifecycle timeline, facts inspector, stage history, and document viewer. | **VERIFIED** |
| **MOD-02** | New Application Intake Modal | "New Application" button | Manual intake form with program selection, intake capacity, and instant route preview. | **VERIFIED** |
| **MOD-03** | Seeded Technical Institution Selector | "Existing Institution? Sign In" | Quick modal listing 5 seeded technical institutions with code, region, and direct login. | **VERIFIED** |
| **MOD-04** | Inspection Report Dossier Modal | "View Dossier" in EVC Reports | Detailed committee findings, rubric score breakdown, geo-coordinates, and export simulation. | **VERIFIED** |
| **MOD-05** | Decision Issuance Modal | "Issue Decision" in CA Chamber | Outcome selection (Approved, Conditional, Rejected), conditions input, and digital signing. | **VERIFIED** |
| **MOD-06** | Revert / Stage Return Modal | "Revert Stage" action | Mandatory reason selection, regulatory clause citation, and immutable audit recording. | **VERIFIED** |
| **MOD-07** | Document Expiry Renewal Modal | "Submit Renewal" in Expiry View | File upload, renewal validity date, and automated timer synchronization. | **VERIFIED** |
| **MOD-08** | Regulatory Clock Control Modal | Top Navbar Clock Click | Fast-forward simulation clock (+1d, +7d, +15d, +30d) to trigger deadline breaches and alerts. | **VERIFIED** |

---

## 4. Feature Preservation Assurance

The Phase 5 overhaul preserved 100% of the underlying business logic, statutory validations, and cryptographic guarantees:
- **Dynamic Routing Engine:** Intact and verified across 32 regulatory rules and 5 campus presets.
- **Tenant Isolation:** Enforced at both the MongoDB query layer and API gateway.
- **Scope Lock (USP B06):** Preserved in Scrutiny Re-evaluation and Deficiency Cure workflows.
- **WORM SHA-256 Audit:** Every state mutation, intake event, and decision generates an immutable cryptographic ledger entry.
