# NIYAMSETU — PHASE 4: VISUAL QA & SCREENSHOT INDEX
## Comprehensive Visual Quality Assurance Dossier & Artifact Registry

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Screenshot Archive Directory:** `submission-deliverables/website-workflow/screenshots/`  
**Total Captured Artifacts:** 36 verified PNG captures (30 Primary Screens + 6 Secondary Modals)

---

## 1. Visual Quality Assurance Protocol

Every captured screen was evaluated against a 6-point visual quality gate:
1. **Layout Integrity:** Content aligns strictly with grid boundaries; zero horizontal page overflows or clipping.
2. **Typography & Readability:** Inter + JetBrains Mono font hierarchy maintained with high-contrast text against backgrounds.
3. **Semantic Badge Fidelity:** Status badges adhere to color coding (Emerald = Cleared/Approved, Amber = Deficiency/Warning, Rose = Critical/Breach, Blue = Routing/Process).
4. **Truthful Labeling Visibility:** All simulated components bear explicit truth labels (`[SIMULATED]`, `[Prototype Integrity Seal]`, `[DEMO Telemetry Fixture]`).
5. **Interactive Element Polish:** Buttons and dropdowns feature visible hover states, clear iconography (Lucide React), and clean padding.
6. **Data Density:** High-density enterprise dashboard aesthetic without visual crowding or unformatted text blocks.

---

## 2. Primary Screen Artifact Registry (30 Screens)

### Role 1: Applicant / Institution Workspace (`R1-S01` to `R1-S07`)

| Screen ID | File Name | Screen Title | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `R1-S01` | `R1-S01.png` | Institutional Application Docket | `ApplicationsListView.tsx` | 137.7 KB | **PASSED** (Tenant-isolated docket, clean route badges) |
| `R1-S02` | `R1-S02.png` | NSWS Single-Window Intake Simulation | `NSWSSimulationView.tsx` | 292.1 KB | **PASSED** (`[SIMULATED - PAN Validation]` & `[SIMULATED - Crypto Token]` badges visible) |
| `R1-S03` | `R1-S03.png` | Institutional Deficiency Cure Submission | `InstitutionDeficiencyCureView.tsx` | 280.1 KB | **PASSED** (10-day cure countdown clock, upload dropzone) |
| `R1-S04` | `R1-S04.png` | Dispatched Council Decision Orders | `GeneratedDocumentsView.tsx` | 280.9 KB | **PASSED** (`[Prototype Integrity Seal — HMAC-SHA256]` badge visible) |
| `R1-S05` | `R1-S05.png` | Post-Approval Compliance Obligations | `ComplianceView.tsx` | 280.7 KB | **PASSED** (4-clock obligation cards, status badges) |
| `R1-S06` | `R1-S06.png` | Quasi-Judicial Appeals & Hearings | `AppealsAndHearingsView.tsx` | 278.1 KB | **PASSED** (Appellate grounds formulation, SAC/SHC timeline) |
| `R1-S07` | `R1-S07.png` | Priority Institutional Alerts | `NotificationsView.tsx` | 294.1 KB | **PASSED** (Tenant-isolated alerts, IST timestamps) |

---

### Role 2: Desk Scrutiny Committee Workspace (`R2-S01` to `R2-S06`)

| Screen ID | File Name | Screen Title | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `R2-S01` | `R2-S01.png` | Initial Desk Scrutiny Evaluation | `ScrutinyEvaluationView.tsx` | 274.3 KB | **PASSED** (14-point statutory checklist C1–C14, digital signing) |
| `R2-S02` | `R2-S02.png` | Differential Re-Scrutiny & Scope Lock | `ScrutinyEvaluationView.tsx` | 319.4 KB | **PASSED** (USP B06 Scope Lock Tamper Test button & lock icons) |
| `R2-S03` | `R2-S03.png` | Portal & PDF Fixture Ingestion Hub | `PortalImportView.tsx` | 116.2 KB | **PASSED** (JSON/PDF extraction preview, field mapping) |
| `R2-S04` | `R2-S04.png` | 3-Member Committee Roster Declaration | `ScrutinyRosterDeclarationView.tsx` | 243.6 KB | **PASSED** (Conflict of interest cards, statutory clause tags) |
| `R2-S05` | `R2-S05.png` | Scrutiny Assigned Case Queue | `ApplicationsListView.tsx` | 256.1 KB | **PASSED** (Committee-filtered case docket, SLA countdowns) |
| `R2-S06` | `R2-S06.png` | Committee Operational Notifications | `NotificationsView.tsx` | 193.6 KB | **PASSED** (Cure submission notices, review deadlines) |

---

### Role 3: Expert Visit Committee Workspace (`R3-S01` to `R3-S03`)

| Screen ID | File Name | Screen Title | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `R3-S01` | `R3-S01.png` | On-Site Physical Inspection Console | `EVCView.tsx` | 287.6 KB | **PASSED** (`[DEMO Telemetry Fixture]` badge, walkthrough check) |
| `R3-S02` | `R3-S02.png` | Completed Physical Inspection Reports | `EVCView.tsx` | 149.0 KB | **PASSED** (Historical inspection summaries, score breakdown) |
| `R3-S03` | `R3-S03.png` | Inspection Dispatch Notifications | `NotificationsView.tsx` | 183.7 KB | **PASSED** (Inspection assignments, logistics notices) |

---

### Role 4: Regional Office Workspace (`R4-S01` to `R4-S05`)

| Screen ID | File Name | Screen Title | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `R4-S01` | `R4-S01.png` | Committee Allocation & Load Balancing | `ROAllocationView.tsx` | 177.4 KB | **PASSED** (Expert panel capacity bars, conflict indicators) |
| `R4-S02` | `R4-S02.png` | Regional SLA Pendency & Bottlenecks | `PendencyView.tsx` | 248.5 KB | **PASSED** (SLA pendency analytics, overdue case radar) |
| `R4-S03` | `R4-S03.png` | Standing Hearing Committee (SHC) Roster| `AppealsAndHearingsView.tsx` | 142.1 KB | **PASSED** (Virtual hearing calendar, bench allocation) |
| `R4-S04` | `R4-S04.png` | Regional Compliance Monitoring | `ComplianceView.tsx` | 155.3 KB | **PASSED** (Regional obligation tracker, verification action) |
| `R4-S05` | `R4-S05.png` | Regional Office Alerts | `NotificationsView.tsx` | 191.7 KB | **PASSED** (Regional escalation warnings, SLA breach notices) |

---

### Role 5: Approval Bureau / Council Workspace (`R5-S01` to `R5-S04`)

| Screen ID | File Name | Screen Title | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `R5-S01` | `R5-S01.png` | Council Statutory Decision Gate | `CompetentAuthorityDecisionView.tsx` | 209.0 KB | **PASSED** (Speaking order generator, statutory decision buttons) |
| `R5-S02` | `R5-S02.png` | Central Decision Orders Archive | `GeneratedDocumentsView.tsx` | 111.4 KB | **PASSED** (Manual order generator, SHA-256 verification tool) |
| `R5-S03` | `R5-S03.png` | Standing Appellate Committee (SAC) Bench| `AppealsAndHearingsView.tsx` | 139.9 KB | **PASSED** (Judicial appeal dispositions, relief orders) |
| `R5-S04` | `R5-S04.png` | Bureau Executive Alerts | `NotificationsView.tsx` | 187.4 KB | **PASSED** (Dockets awaiting Council determination) |

---

### Role 6: Policy Admin & Auditor Workspace (`R6-S01` to `R6-S05`)

| Screen ID | File Name | Screen Title | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `R6-S01` | `R6-S01.png` | APH Policy Rules & Dynamic Engine | `ConfigRulesView.tsx` | 187.9 KB | **PASSED** (Rules R01–R32 catalog, threshold configuration) |
| `R6-S02` | `R6-S02.png` | WORM Tamper-Evident Chained Audit Trail | `AuditView.tsx` | 126.0 KB | **PASSED** (`[Tamper-Evident Chained Audit Log]` badge, SHA-256 tree) |
| `R6-S03` | `R6-S03.png` | Government Ecosystem Adapters | `GovernmentEndpointsView.tsx` | 295.1 KB | **PASSED** (6 live adapter status cards, JSON payload inspector) |
| `R6-S04` | `R6-S04.png` | Regulatory Analytics & Executive KPIs | `ReportsView.tsx` | 157.0 KB | **PASSED** (Intake distribution charts, regional KPI meters) |
| `R6-S05` | `R6-S05.png` | System & Security Alerts | `NotificationsView.tsx` | 191.9 KB | **PASSED** (Adapter latency warnings, audit chain confirmations) |

---

## 3. Secondary Modal Screen Registry (6 Modals)

| Screen ID | File Name | Modal / Drawer Name | Component File | Size | Visual QA Gate |
|:---:|:---|:---|:---|:---:|:---:|
| `SEC-01` | `SEC-01.png` | Case Detail Modal — Overview & Stepper | `ApplicationDetailModal.tsx` | 131.4 KB | **PASSED** (5-stage sequential workflow stepper, quick actions) |
| `SEC-02` | `SEC-02.png` | Case Detail Modal — Documents & Evidence | `ApplicationDetailModal.tsx` | 281.7 KB | **PASSED** (Document hash table, preview actions) |
| `SEC-03` | `SEC-03.png` | Case Detail Modal — EVC Inspection Data | `ApplicationDetailModal.tsx` | 281.6 KB | **PASSED** (Telemetry coordinates, inspection scorecards) |
| `SEC-04` | `SEC-04.png` | Manual Application Intake Wizard | `NewApplicationModal.tsx` | 111.4 KB | **PASSED** (4-stage progress bar, dynamic intake bounds) |
| `SEC-05` | `SEC-05.png` | Deficiency & Hearing Notice Preview | `CaseSummaryNoticesModal.tsx` | 280.2 KB | **PASSED** (Official AICTE stationery layout, legal citations) |
| `SEC-06` | `SEC-06.png` | Document Expiry & Renewal Radar | `DocumentExpiryView.tsx` | 248.5 KB | **PASSED** (60-day advance renewal radar, validity badges) |

---

## 4. Visual QA Conclusion

All 36 screenshot artifacts have been systematically verified. The screens exhibit outstanding visual consistency, professional government typography, strict WCAG AA contrast, and 100% adherence to regulatory truth labeling.
