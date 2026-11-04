# NIYAMSETU — PHASE 4: SCREEN-BY-SCREEN IMPLEMENTATION MATRIX
## Comprehensive Operational Specification of all 30 Primary Screens

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev` (HEAD: `aa3117fef487b564a5160fe320c4b9c9406c6eeb`)  
**Scope:** Complete implementation and layout matrix for all 30 primary screens (Roles R1 to R6).

---

## 1. Executive Summary & Topology Overview

NIYAMSETU establishes an interconnected, role-differentiated regulatory workflow engine implementing the AICTE Approval Process Handbook (APH 2026–27). The system spans 6 distinct statutory roles, each served by dedicated primary screens:

| Role ID | Role Name | Primary Screens | Primary Responsibility |
|:---|:---|:---|:---|
| **R1** | Applicant / Institution | `R1-S01` to `R1-S07` (7 screens) | NSWS intake, deficiency cure submission, EoA/LoA document retrieval, post-approval compliance obligations, quasi-judicial appeals, priority notices. |
| **R2** | Scrutiny Committee | `R2-S01` to `R2-S06` (6 screens) | Checklist evaluation (C1–C14), differential re-scrutiny with cryptographic scope locking (USP B06), PDF portal fixture ingestion, 3-member roster declaration. |
| **R3** | Expert Visit Committee (EVC) | `R3-S01` to `R3-S03` (3 screens) | Field telemetry inspection, 30-min campus walkthrough video verification, physical infrastructure/faculty cadre scoring, inspection report submission. |
| **R4** | Regional Office (RO) | `R4-S01` to `R4-S05` (5 screens) | Committee allocation & roster load balancing, regional pendency & SLA monitoring, hearing schedule management, post-approval compliance oversight. |
| **R5** | Approval Bureau / CA | `R5-S01` to `R5-S04` (4 screens) | Council speaking orders, statutory decision gate, digital PDF signing & HMAC sealing, appellate recourse disposition. |
| **R6** | Policy Admin & Auditor | `R6-S01` to `R6-S05` (5 screens) | APH rule editor & dynamic condition builder, WORM-compliant tamper-evident chained audit trail, ecosystem integration simulator, regulatory analytics. |

---

## 2. Role 1: Applicant / Institution Workspace (`R1-S01` to `R1-S07`)

### Screen `R1-S01`: Institutional Docket (`inst-apps`)
- **Component:** `src/features/applications/ApplicationsListView.tsx`
- **Statutory Reference:** APH 2026–27 §1.3.1, §2.3.1; Parshvanath Calendar.
- **Visual Architecture:** High-contrast data grid with institutional filter scoping, dynamic SLA deadline clocks, route badges (e.g., `NBA Fast-Track Route A1`, `Surge Extension Route B1`), and stage indicators.
- **Key User Actions:**
  - View own submitted applications (strictly tenant-isolated: COEP sees only COEP, GIITS sees only GIITS).
  - Open `ApplicationDetailModal` for comprehensive case inspection.
  - Launch `NewApplicationModal` for manual new filings.
  - Filter by stage, route type, or keyword search.
- **Connected Endpoints:** `GET /api/v1/applications`, `GET /api/v1/applications/:id`.
- **Truth Label:** Fully Implemented (Real React Component + In-Memory/Mongo Data Store).

---

### Screen `R1-S02`: NSWS Intake Simulation (`inst-nsws`)
- **Component:** `src/features/nsws/NSWSSimulationView.tsx`
- **Statutory Reference:** APH 2026–27 §1.3.1, §1.4.1, §1.4.3, §2.3.4(a).
- **Visual Architecture:** 5-step wizard stepper:
  1. *Entity KYC & PAN Registration*: Entity details, trust type, state jurisdiction.
  2. *Signatory & DSC Token Verification*: USB token emulator with emBridge gateway response.
  3. *Application Category Selection*: Table 2.3 Category 1–21 selection.
  4. *Dynamic Regulatory Route Engine Preview*: Instant evaluation of rules R01–R32.
  5. *Review & Submission*: Cryptographic dispatch and case generation.
- **Key User Actions:**
  - Fast-load canonical presets (COEP Pune, GIITS Vizag, PDIMTR Nagpur, BATU Lonere, Apex Rajasthan).
  - Enter entity PAN and validate checksum.
  - Select USB token fixture (`ePass2003Auto`, `mToken`, `CryptoSoftToken`, `UnsignedDocument`).
  - Execute live dynamic route evaluation with real-time statutory rule tracing.
  - Submit application into the central workflow engine.
- **Connected Endpoints:** `POST /api/v1/nsws/onboard`, `POST /api/v1/nsws/verify-dsc`, `POST /api/v1/nsws/submit`.
- **Truth Label:** `[SIMULATED - PAN Format Validation]` & `[SIMULATED - Class-3 Crypto Token Format Gate]`. Functional workflow and engine routing are 100% implemented.

---

### Screen `R1-S03`: Deficiency Cure Submission (`inst-deficiencies`)
- **Component:** `src/features/institution/InstitutionDeficiencyCureView.tsx`
- **Statutory Reference:** APH 2026–27 §1.8(g); 10-day statutory cure window / 15-day SLA ceiling.
- **Visual Architecture:** Alert banner displaying remaining countdown clock, deficiency item cards showing checklist reference (e.g., `D1: Faculty Cadre Ratio`, `D2: Fire Safety NOC`), cure upload dropzone, and historical submission timeline.
- **Key User Actions:**
  - View exact observations made by Scrutiny Committee during Snapshot v1.
  - Upload compliance evidence documents for flagged items only.
  - Enter formal clarification remarks.
  - Submit cure package for Differential Re-Scrutiny.
- **Connected Endpoints:** `GET /api/v1/applications/:id/scrutiny`, `POST /api/v1/applications/:id/scrutiny/cure`.
- **Truth Label:** Fully Implemented.

---

### Screen `R1-S04`: Dispatched Decision Documents (`inst-decision-docs`)
- **Component:** `src/features/documents/GeneratedDocumentsView.tsx`
- **Statutory Reference:** APH 2026–27 §1.10, §2.26; AICTE Approval Letters.
- **Visual Architecture:** Grid of issued council documents (EoA, LoA, LoD, LoR) displaying dispatch number, signer authority, SHA-256 digest, and verification badge.
- **Key User Actions:**
  - View official decision letters.
  - Verify cryptographic HMAC-SHA256 signature against council public digest.
  - Download dynamically generated PDF document.
- **Connected Endpoints:** `GET /api/v1/decision-documents`, `GET /api/v1/decision-documents/:caseId/verify`, `GET /api/v1/decision-documents/:caseId/download`.
- **Truth Label:** `[Prototype Integrity Seal — HMAC-SHA256]` (Real client-side/server-side HMAC digest and pdf-lib PDF generator; not backed by e-Mudhra production HSM).

---

### Screen `R1-S05`: Post-Approval Compliance Obligations (`inst-renewals`)
- **Component:** `src/features/compliance/ComplianceView.tsx`
- **Statutory Reference:** APH 2026–27 §1.12, §2.28; Mandatory Disclosures & Annual Returns.
- **Visual Architecture:** 4-clock obligation cards (Total Obligations, Verified & Closed, Pending Evidence, Overdue / Show-Cause Risk), searchable obligation list, and evidence submission modal.
- **Key User Actions:**
  - Filter obligations by status (`Pending Evidence`, `Submitted`, `Verified`, `Overdue`).
  - Open evidence upload modal.
  - Submit compliance document file name and reference URL.
  - Track countdown to statutory show-cause issuance.
- **Connected Endpoints:** `GET /api/v1/compliance`, `POST /api/v1/compliance/:id/evidence`.
- **Truth Label:** Fully Implemented.

---

### Screen `R1-S06`: Quasi-Judicial Appeals & Hearings (`appeals-hearings`)
- **Component:** `src/features/appeals/AppealsAndHearingsView.tsx`
- **Statutory Reference:** APH 2026–27 §1.11, §2.23.3; AICTE Appellate Committee Regulations.
- **Visual Architecture:** Two-column layout with appeal status timeline on left and appeal petition filing form / hearing record on right. Badges for judicial forum (`Standing Appellate Committee - SAC` vs `Standing Hearing Committee - SHC`).
- **Key User Actions:**
  - Select rejection/deficiency order to contest.
  - Formulate grounds of appeal under Chapter I §1.11 or Chapter II §2.23.3.
  - Upload supporting affidavit and annexures.
  - Submit appeal within statutory 15-day cutoff.
  - View scheduled virtual hearing link and speaking order disposition.
- **Connected Endpoints:** `GET /api/v1/appeals-hearings`, `POST /api/v1/appeals-hearings`.
- **Truth Label:** Fully Implemented.

---

### Screen `R1-S07`: Priority Notifications & Alerts (`notifications`)
- **Component:** `src/features/notifications/NotificationsView.tsx`
- **Statutory Reference:** AICTE Citizen Charter & Communication Norms.
- **Visual Architecture:** List of priority alerts color-coded by urgency (`CRITICAL`, `WARNING`, `INFO`), timestamped in IST, with direct navigation links.
- **Key User Actions:**
  - Read incoming deficiency communications, SLA deadline warnings, and hearing notices.
  - Mark alerts as read.
  - Filter by urgency level.
  - Click alert to navigate directly to target case.
- **Connected Endpoints:** `GET /api/v1/alerts`.
- **Truth Label:** Fully Implemented (Tenant-isolated per institution).

---

## 3. Role 2: Desk Scrutiny Committee Workspace (`R2-S01` to `R2-S06`)

### Screen `R2-S01`: Initial Scrutiny Evaluation (`scrutiny-eval`)
- **Component:** `src/features/scrutiny/ScrutinyEvaluationView.tsx` (Mode: `initial`)
- **Statutory Reference:** APH 2026–27 §1.8(a)–(e), Table 2.1; Checklists C1–C14.
- **Visual Architecture:** Comprehensive evaluation workspace with case selector, 14-point statutory checklist cards, observation inputs, deficiency toggles, and multi-member signing block.
- **Key User Actions:**
  - Review applicant submissions against Table 2.1 norms.
  - Mark individual checklist items as `accepted` or `deficient`.
  - Enter item-level remarks and evidence cross-references.
  - Sign and seal Snapshot v1 with 3-member committee digital tokens.
  - Dispatch formal Letter of Deficiency (LoD) or advance to Scrutiny Cleared.
- **Connected Endpoints:** `GET /api/v1/applications/:id/scrutiny`, `POST /api/v1/applications/:id/scrutiny/sign`.
- **Truth Label:** Fully Implemented.

---

### Screen `R2-S02`: Differential Re-Scrutiny & Scope Lock (`scrutiny-rescrutiny`)
- **Component:** `src/features/scrutiny/ScrutinyEvaluationView.tsx` (Mode: `rescrutiny`)
- **Statutory Reference:** APH 2026–27 §1.8(g); Scope Lock Principle (USP B06).
- **Visual Architecture:** Split interface:
  - *Locked Section*: Items accepted during Snapshot v1 (e.g., C3 Land Title, C4 Structural Stability) marked with green lock icons and server-enforced immutability.
  - *Active Review Section*: Only items flagged deficient in Snapshot v1 (e.g., D1 Faculty Cadre, D2 Fire NOC).
- **Key User Actions:**
  - Review uploaded cure documentation for flagged items.
  - Verify remediation adequacy.
  - Execute **Live USP B06 Scope Lock Tamper Test** to prove server HTTP 409/412 rejection of any attempt to re-open locked items.
  - Sign Snapshot v2 (Re-Scrutiny Cleared or Final Rejection recommendation).
- **Connected Endpoints:** `POST /api/v1/applications/:id/scrutiny/correct`, `POST /api/v1/applications/:id/scrutiny/sign`.
- **Truth Label:** Fully Implemented.

---

### Screen `R2-S03`: Portal & PDF Fixture Ingestion (`scrutiny-portal-import`)
- **Component:** `src/features/portalImport/PortalImportView.tsx`
- **Statutory Reference:** APH 2026–27 §1.4.1; Legacy Siebel & NSWS Data Migration.
- **Visual Architecture:** Two-pane interface: Fixture selector and raw PDF/JSON preview on left; parsed statutory field extraction and confirmation on right.
- **Key User Actions:**
  - Select pre-loaded official fixture (e.g., `GIITS-2026-REPORT`, `COEP-FAST-TRACK-EXPORT`, `PDIMTR-DEFICIENCY-RECORD`).
  - Inspect extracted fields (College Code, Proposed Intake, NBA Validity, Built-up Area).
  - Execute import into active case queue.
  - Upload arbitrary JSON/PDF application fixture.
- **Connected Endpoints:** `GET /api/v1/portal-import/fixtures`, `POST /api/v1/portal-import/ingest`.
- **Truth Label:** Fully Implemented.

---

### Screen `R2-S04`: 3-Member Roster Declaration (`scrutiny-committee`)
- **Component:** `src/features/scrutiny/ScrutinyRosterDeclarationView.tsx`
- **Statutory Reference:** AICTE Act §11(2) & APH 2026–27 §1.8(a)–(b).
- **Visual Architecture:** Official roster card showing Chair (Senior Professor), Member 1 (Subject Expert), Member 2 (State DTE Representative), with institutional conflict of interest certificates.
- **Key User Actions:**
  - Review committee credentials and assignment authorization.
  - View digital conflict of interest declarations.
  - Navigate directly to assigned review dockets.
- **Connected Endpoints:** `GET /api/v1/roster/declaration`.
- **Truth Label:** Fully Implemented.

---

### Screen `R2-S05`: Regional Scrutiny Queue (`scrutiny-queue`)
- **Component:** `src/features/applications/ApplicationsListView.tsx` (Scoped to Reviewer)
- **Statutory Reference:** APH 2026–27 §1.8; Regional Allocation Norms.
- **Visual Architecture:** Scrutiny-focused docket filtered to cases awaiting initial evaluation or re-scrutiny, sorted by SLA expiration.
- **Key User Actions:**
  - View cases assigned to current reviewer's committee.
  - Filter by stage (`Application Submitted`, `Deficiency Communicated`).
  - Open review evaluation console.
- **Connected Endpoints:** `GET /api/v1/applications`.
- **Truth Label:** Fully Implemented.

---

### Screen `R2-S06`: Committee Notifications (`notifications`)
- **Component:** `src/features/notifications/NotificationsView.tsx`
- **Statutory Reference:** Council Communication Directives.
- **Visual Architecture:** Committee-scoped alerts regarding assigned cases, re-scrutiny cure submissions, and SLA reminders.
- **Key User Actions:**
  - Receive real-time notice of applicant cure uploads.
  - Track impending scrutiny SLA deadlines.
- **Connected Endpoints:** `GET /api/v1/alerts`.
- **Truth Label:** Fully Implemented.

---

## 4. Role 3: Expert Visit Committee (EVC) Workspace (`R3-S01` to `R3-S03`)

### Screen `R3-S01`: On-Site Inspection Console (`evc-inspect`)
- **Component:** `src/features/evc/EVCView.tsx`
- **Statutory Reference:** APH 2026–27 §1.9, §2.25; On-Site Physical Inspection Norms.
- **Visual Architecture:** Inspection dashboard showing scheduled EVC cases, institutional details, GPS geo-coordinates with `[DEMO Telemetry Fixture]` badge, walkthrough video status, and 3-part verification checklist:
  1. *Walkthrough Video Verification* (§1.9(f)).
  2. *Geo-coordinate Verification* (§1.9(g)).
  3. *Cadre Physical Audit* (Form 16 & biometric cross-verification).
- **Key User Actions:**
  - Select assigned inspection case.
  - Verify GPS telemetry matches registered institutional campus boundaries.
  - Score infrastructure adequacy (0–100%), faculty presence (0–100%), and laboratories (0–100%).
  - Enter executive inspection findings and recommendation (`Recommended` vs `Deficiencies Found`).
  - Submit formal EVC Inspection Report.
- **Connected Endpoints:** `GET /api/v1/evc`, `POST /api/v1/evc/:id/report`.
- **Truth Label:** Checklist, scoring, and workflow fully implemented; GPS data marked `[DEMO Telemetry Fixture]`.

---

### Screen `R3-S02`: EVC Completed Reports Catalog (`evc-reports`)
- **Component:** `src/features/evc/EVCView.tsx` (Reports Tab)
- **Statutory Reference:** APH 2026–27 §1.9(h); Council Record-Keeping.
- **Visual Architecture:** Historical catalog of completed physical inspection reports with scoring summaries, committee chairman sign-offs, and PDF exports.
- **Key User Actions:**
  - Filter reports by recommendation status.
  - Review submitted observations.
  - Export inspection report dossier.
- **Connected Endpoints:** `GET /api/v1/evc`.
- **Truth Label:** Fully Implemented.

---

### Screen `R3-S03`: EVC Notifications (`notifications`)
- **Component:** `src/features/notifications/NotificationsView.tsx`
- **Statutory Reference:** Inspection Dispatch Directives.
- **Visual Architecture:** Inspection schedule updates, travel logistics notices, and campus video upload alerts.
- **Key User Actions:** Read inspection alerts and acknowledge dispatch orders.
- **Connected Endpoints:** `GET /api/v1/alerts`.
- **Truth Label:** Fully Implemented.

---

## 5. Role 4: Regional Office (RO) Workspace (`R4-S01` to `R4-S05`)

### Screen `R4-S01`: Committee Allocation & Load Balancing (`ro-allocation`)
- **Component:** `src/features/ro/ROAllocationView.tsx`
- **Statutory Reference:** APH 2026–27 §1.7, §1.8; Regional Officer Roster Governance.
- **Visual Architecture:** Roster distribution matrix displaying active expert committees, current case loads, institutional conflict indicators, and assignment action modal.
- **Key User Actions:**
  - View regional committee capacity and caseloads.
  - Assign unallocated cases to Desk Scrutiny or EVC panels.
  - Declare and check institutional conflict of interest before assignment.
  - Rebalance workloads across regional panels.
- **Connected Endpoints:** `GET /api/v1/allocation/groups`, `POST /api/v1/allocation/assign`.
- **Truth Label:** Fully Implemented.

---

### Screen `R4-S02`: Regional Pendency & SLA Monitoring (`ro-pendency`)
- **Component:** `src/features/pendency/PendencyView.tsx`
- **Statutory Reference:** Parshvanath Supreme Court Calendar; Public Notice 15 & 31 Jan 2026 Cutoffs.
- **Visual Architecture:** Regional SLA pendency analytics cards:
  - *Active Regional Dockets*: Total cases in region.
  - *Average Turnaround Days*: Historical velocity against SLA.
  - *Imminent SLA Breach*: Cases with < 48h remaining.
  - *Escalations Triggered*: Bureau-level auto-escalation count.
  - *SLA Pendency Table*: Case-by-case breakdown with color-coded countdown clocks.
- **Key User Actions:**
  - Identify bottlenecked cases across scrutiny and inspection stages.
  - Trigger expedited processing notices to assigned committees.
  - Export regional pendency report.
- **Connected Endpoints:** `GET /api/v1/pendency`.
- **Truth Label:** Fully Implemented.

---

### Screen `R4-S03`: Regional Appeals & Hearing Roster (`ro-appeals-hearings`)
- **Component:** `src/features/appeals/AppealsAndHearingsView.tsx` (RO Mode)
- **Statutory Reference:** APH 2026–27 §1.11, §2.23.3; Standing Hearing Committee (SHC).
- **Visual Architecture:** Hearing schedule manager showing listed appeals, scheduled virtual bench meetings, designated SHC members, and speaking order dispositions.
- **Key User Actions:**
  - Schedule virtual SHC hearing sessions.
  - Record hearing proceedings and bench recommendations.
  - Transmit findings to Approval Bureau for Council decision.
- **Connected Endpoints:** `GET /api/v1/appeals-hearings`, `POST /api/v1/appeals-hearings/:id/hearing`.
- **Truth Label:** Fully Implemented.

---

### Screen `R4-S04`: Post-Approval Compliance Oversight (`ro-obligations`)
- **Component:** `src/features/compliance/ComplianceView.tsx` (RO Mode)
- **Statutory Reference:** APH 2026–27 §1.12; Regional Monitoring & Show-Cause Norms.
- **Visual Architecture:** Region-wide compliance docket tracking mandatory undertakings across all regional institutions. Verification modal with `Verified` vs `Rejected` actions and mandatory official remarks.
- **Key User Actions:**
  - Review applicant-submitted compliance evidence.
  - Formally verify or reject submissions.
  - Flag overdue obligations for Show-Cause / Penal action.
- **Connected Endpoints:** `GET /api/v1/compliance`, `POST /api/v1/compliance/:id/verify`.
- **Truth Label:** Fully Implemented.

---

### Screen `R4-S05`: Regional Office Notifications (`notifications`)
- **Component:** `src/features/notifications/NotificationsView.tsx`
- **Statutory Reference:** Regional Operations Alerts.
- **Visual Architecture:** Region-scoped notifications for SLA breaches, new filings, and escalation triggers.
- **Key User Actions:** Monitor regional operational events and dispatch urgent reminders.
- **Connected Endpoints:** `GET /api/v1/alerts`.
- **Truth Label:** Fully Implemented.

---

## 6. Role 5: Approval Bureau / Council Workspace (`R5-S01` to `R5-S04`)

### Screen `R5-S01`: Statutory Decision Gate & Speaking Orders (`ca-decision`)
- **Component:** `src/features/ca/CompetentAuthorityDecisionView.tsx`
- **Statutory Reference:** AICTE Act §10, §11; APH 2026–27 §1.10, §2.26.
- **Visual Architecture:** Council decision bench with case selector, recommendation summary (Scrutiny Cleared, EVC Cleared, SHC/SAC Recourse), statutory decision buttons (`Grant EoA / LoA`, `Issue Letter of Deficiency`, `Reject Application`), and formal speaking order template generator.
- **Key User Actions:**
  - Review consolidated scrutiny, EVC, and appellate records.
  - Select decision type.
  - Insert statutory conditions and undertakings into speaking order.
  - Execute digital council determination, triggering automated document generation and stage advancement.
- **Connected Endpoints:** `POST /api/v1/decisions/issue`.
- **Truth Label:** Fully Implemented.

---

### Screen `R5-S02`: Central Generated Documents Repository (`ca-decision-docs`)
- **Component:** `src/features/documents/GeneratedDocumentsView.tsx` (Bureau Mode)
- **Statutory Reference:** Official AICTE Gazette Records & Dispatch Archive.
- **Visual Architecture:** Council-wide document generation and dispatch hub. Includes manual document generator controls (case selector, document type `EOA`/`LOA`/`LOD`/`LOR`), live signature status, and verification tool.
- **Key User Actions:**
  - Generate official PDF decision documents for any approved case.
  - Verify HMAC-SHA256 signature integrity.
  - Download official signed PDF.
- **Connected Endpoints:** `GET /api/v1/decision-documents`, `POST /api/v1/decision-documents/generate`.
- **Truth Label:** `[Prototype Integrity Seal — HMAC-SHA256]` & `pdf-lib`. Fully functional generator and verifier.

---

### Screen `R5-S03`: Standing Appellate Committee Recourse (`ca-appeals`)
- **Component:** `src/features/appeals/AppealsAndHearingsView.tsx` (Council Mode)
- **Statutory Reference:** APH 2026–27 §1.11, §2.23.3; AICTE Standing Appellate Committee (SAC).
- **Visual Architecture:** SAC appellate docket with judicial bench composition (Retired High Court Judge Chair, Senior Academic, Industry Expert), appeal grounds review, and final order issuance console.
- **Key User Actions:**
  - Adjudicate appeals against Council rejection orders.
  - Record SAC judicial findings.
  - Issue final Council disposition order (Overturn rejection / Affirm rejection).
- **Connected Endpoints:** `GET /api/v1/appeals-hearings`, `POST /api/v1/appeals-hearings/:id/disposition`.
- **Truth Label:** Fully Implemented.

---

### Screen `R5-S04`: Bureau Notifications (`notifications`)
- **Component:** `src/features/notifications/NotificationsView.tsx`
- **Statutory Reference:** Council Communications.
- **Visual Architecture:** High-priority notices regarding cases ready for Council determination and pending appellate filings.
- **Key User Actions:** Monitor incoming dockets ready for executive decision.
- **Connected Endpoints:** `GET /api/v1/alerts`.
- **Truth Label:** Fully Implemented.

---

## 7. Role 6: Policy Admin & Auditor Workspace (`R6-S01` to `R6-S05`)

### Screen `R6-S01`: Policy Rules & Engine Configuration (`admin-policy`)
- **Component:** `src/features/admin/ConfigRulesView.tsx`
- **Statutory Reference:** APH 2026–27 Rules R01–R32; Dynamic Route Evaluation Engine.
- **Visual Architecture:** Policy administration studio featuring rule catalog (R01–R32), clause references, priority weightings, rule active/inactive toggles, and interactive scenario simulator.
- **Key User Actions:**
  - Inspect statutory conditions for any rule.
  - Edit threshold values (e.g., existing intake boundary $X = 360$).
  - Toggle rule enforcement status.
  - Run dynamic route simulations against hypothetical institutional parameters.
- **Connected Endpoints:** `GET /api/v1/rules`, `PUT /api/v1/rules/:id`.
- **Truth Label:** Fully Implemented.

---

### Screen `R6-S02`: WORM Audit Trail & Forensic Log (`admin-worm`)
- **Component:** `src/features/audit/AuditView.tsx`
- **Statutory Reference:** IT Act §43A, §65B; Tamper-Evident Governance Log.
- **Visual Architecture:** WORM-compliant chronological audit trail bearing `[Tamper-Evident Chained Audit Log] • WORM Compliant` badge, event filter, free-text search bar, cryptographic SHA-256 hash tree preview, and CSV export.
- **Key User Actions:**
  - Search audit log by actor, action, case number, or remark.
  - Inspect cryptographic SHA-256 event hash and previous block linkage.
  - Export forensic audit trail in standard CSV format.
- **Connected Endpoints:** `GET /api/v1/audit`.
- **Truth Label:** Fully Implemented.

---

### Screen `R6-S03`: Ecosystem Adapters & API Gateway (`admin-adapters`)
- **Component:** `src/features/regulatory/GovernmentEndpointsView.tsx`
- **Statutory Reference:** National Single Window System (NSWS), NAD/DigiLocker, DTE Portals.
- **Visual Architecture:** Interactive government integration gateway showing live adapter health status, endpoint latency, payload preview, and mock response simulator for 6 external services:
  1. `NSWS Single-Window Gateway`
  2. `DigiLocker / NAD Credential Vault`
  3. `NBA / NAAC Accreditation Registry`
  4. `State DTE NOC Verification Bus`
  5. `CCA India PKI Gateway (emBridge)`
  6. `AICTE Siebel Legacy Sync Bridge`
- **Key User Actions:**
  - Ping external mock gateways.
  - View live request/response JSON payloads.
  - Toggle mock latency and simulate API failure/rejection modes.
- **Connected Endpoints:** `GET /api/v1/adapters/status`, `POST /api/v1/adapters/test`.
- **Truth Label:** Fully Implemented Interactive Gateway Simulator.

---

### Screen `R6-S04`: Regulatory Analytics & Executive KPIs (`admin-analytics`)
- **Component:** `src/features/reports/ReportsView.tsx`
- **Statutory Reference:** AICTE Annual Performance & Statutory Reporting.
- **Visual Architecture:** Executive KPI cards (Total Intake Requests, Average Processing Velocity, Approval Ratio, Regional Distribution), route category distribution charts, and SLA performance metrics.
- **Key User Actions:**
  - Filter reports by academic year, region, or program.
  - Analyze intake expansion trends across disciplines.
  - Export consolidated regulatory report.
- **Connected Endpoints:** `GET /api/v1/reports/consolidated`.
- **Truth Label:** Fully Implemented.

---

### Screen `R6-S05`: Administrative Notifications (`notifications`)
- **Component:** `src/features/notifications/NotificationsView.tsx`
- **Statutory Reference:** System Health & Governance Alerts.
- **Visual Architecture:** Administrative notices covering system events, adapter health failures, and audit integrity validations.
- **Key User Actions:** Review system-wide governance alerts.
- **Connected Endpoints:** `GET /api/v1/alerts`.
- **Truth Label:** Fully Implemented.

---

## 8. Verification & Completeness Confirmation

1. All 30 primary screens are uniquely mapped to their respective roles and components.
2. Every screen has been independently verified against the codebase and build pipeline (`npm run build` passed).
3. Truthful security labels (`[SIMULATED - PAN Format Validation]`, `[SIMULATED - Class-3 Crypto Token Format Gate]`, `[Prototype Integrity Seal — HMAC-SHA256]`, `[Tamper-Evident Chained Audit Log]`, `[DEMO Telemetry Fixture]`) are explicitly embedded in the respective views.
4. Feature elimination is zero; every action and view is preserved and fully demonstrable.
