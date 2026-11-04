# NIYAMSETU (नियमसेतु) — PHASE 4
## Comprehensive Screen, Feature & Navigation Inventory

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T20:55:00+05:30  
**Audit Source:** Actual Local Repository Codebase (`src/`)

---

## 1. Inventory Summary Across 6 Regulatory Roles

The NIYAMSETU application implements 30 primary screen IDs organized into 6 statutory regulatory role portals, complemented by dedicated secondary interfaces, detail views, and interactive modals.

```
+-------------------------------------------------------------------------------+
|                       NIYAMSETU APPLICATION INVENTORY                         |
|-------------------------------------------------------------------------------|
|  Total Primary Role Screens:       30 screens (R1-S01 to R6-S05)              |
|  Secondary Screens / Modals:       8 dedicated modals, drawers & dialogs      |
|  Functional User Roles:            6 distinct regulatory actors               |
|  Top-Level Workspaces:             6 Portals (Accessible via Navbar Switcher) |
|  Connected API Operations:         24 distinct backend REST endpoints         |
|  Active UI Event Handlers:         120+ interactive buttons and forms         |
+-------------------------------------------------------------------------------+
```

---

## 2. Primary Screen Inventory by Role

### Role 1: Institution / Applicant Portal (`RolePortalId = 1`)
- **Default Actor:** Principal of COEP Pune (`usr-inst-coep`, `principal@coep.ac.in`)
- **Primary Mission:** Track institutional applications, execute NSWS single-window onboarding, remediate scrutiny deficiencies, download signed approval orders, and comply with post-approval obligations.

| Screen ID | Navigation Tab | Screen Title | Primary Component | Backend APIs Connected | Primary User Task & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1-S01** | `inst-apps` | My Applications & Live Status | `ApplicationsListView.tsx` | `GET /api/v1/applications` | View institutional docket (scoped by tenant isolation); search, filter by stage/SLA; open deep dossier. |
| **R1-S02** | `inst-nsws` | NSWS Onboarding & Dynamic Route | `NSWSSimulationView.tsx` | `POST /api/v1/nsws/onboard`, `/verify-dsc`, `/evaluate-route`, `/submit` | Complete single-window intake simulation; PAN validation; Class-3 token check; route pre-check; persist into queue. |
| **R1-S03** | `inst-deficiencies`| Deficiency Responses & Document Cures | `InstitutionDeficiencyCureView.tsx` | `POST /api/v1/scrutiny/:id/cure`, `GET /applications` | Inspect flagged deficiencies from Scrutiny/EVC; upload compliance proof; submit within 10-day statutory SLA. |
| **R1-S04** | `inst-decision-docs`| Decision Letters (LoA / EoA) | `GeneratedDocumentsView.tsx` | `GET /api/v1/artifacts/decision-docs`, `/verify-signature` | View and download tamper-evident Letter of Approval (LoA) or EoA PDF; verify embedded HMAC-SHA256 QR seal. |
| **R1-S05** | `inst-renewals` | Post-Approval Obligations & Undertakings | `ComplianceView.tsx` | `GET /api/v1/compliance/obligations`, `/close` | Track 4-clock compliance timers (Building completion, FDR security deposit, Affiliation, Faculty cadres). |
| **R1-S06** | `appeals-hearings` | Standing Appellate Committee (SAC) | `AppealsAndHearingsView.tsx` | `POST /api/v1/appeals-hearings/lodge`, `/schedule` | Lodge statutory appeal against adverse order under APH §1.11; view judicial hearing schedule and speaking orders. |
| **R1-S07** | `notifications` | Official Notices & Deadline Alerts | `NotificationsView.tsx` | `GET /api/v1/alerts`, `POST /alerts/mark-read` | Receive isolated institutional alerts, SLA breach warnings, hearing notices, and Council communications. |

---

### Role 2: Scrutiny Committee Portal (`RolePortalId = 2`)
- **Default Actor:** Scrutiny Committee Reviewer (`usr-scrutiny-reviewer`, `scrutiny.reviewer@aicte.gov.in`)
- **Primary Mission:** Evaluate uploaded institutional documents, record compliance observations, flag deficiencies, and execute differential re-scrutiny.

| Screen ID | Navigation Tab | Screen Title | Primary Component | Backend APIs Connected | Primary User Task & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R2-S01** | `scrutiny-eval` | Desk Scrutiny Evaluation & Deficiencies | `ScrutinyEvaluationView.tsx` | `POST /api/v1/scrutiny/:id/evaluate`, `/applications/:id/transition` | Scrutinize 14 canonical checklist items; record observations; flag mandatory deficiencies; finalize report. |
| **R2-S02** | `scrutiny-rescrutiny`| Differential Re-Scrutiny (Locked C3) | `ScrutinyEvaluationView.tsx` (`isRescrutiny=true`) | `POST /api/v1/scrutiny/:id/evaluate` | Review remediated documents with previously cleared items locked read-only per APH §1.8(g). |
| **R2-S03** | `scrutiny-portal-import`| Portal Report Ingestion | `PortalImportView.tsx` | `GET /api/v1/portal-import/fixtures`, `POST /preview`, `POST /confirm` | Ingest legacy AICTE Web-Portal PDF reports (Part 1-2 AppReports) into structured case records. |
| **R2-S04** | `scrutiny-committee`| Expert Roster & Declarations | `ScrutinyRosterDeclarationView.tsx` | `GET /api/v1/scrutiny/roster`, `POST /declaration` | Declare 3-member Scrutiny Committee composition; record absence/conflict of interest declarations. |
| **R2-S05** | `scrutiny-queue` | Assigned Application Queue | `ApplicationsListView.tsx` | `GET /api/v1/applications` | Review regional pool of applications pending initial or re-scrutiny; filter by SLA urgency. |
| **R2-S06** | `notifications` | Scrutiny SLA Timers & Deadlines | `NotificationsView.tsx` | `GET /api/v1/alerts` | Monitor 7-day scrutiny communication timers and regional pendency alerts. |

---

### Role 3: Expert Visit Committee Portal (`RolePortalId = 3`)
- **Default Actor:** EVC Committee Chairman (`usr-evc-chair`, `evc.chair@aicte.gov.in`)
- **Primary Mission:** Conduct physical or hybrid campus inspections, review geotagged infrastructure evidence, assess land/laboratory compliance, and sign inspection findings.

| Screen ID | Navigation Tab | Screen Title | Primary Component | Backend APIs Connected | Primary User Task & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R3-S01** | `evc-inspect` | Campus Inspections & Telemetry | `EVCView.tsx` | `GET /api/v1/evc/inspections`, `POST /report`, `/sync-committee` | Verify physical/hybrid inspection parameters; inspect geotagged photos; validate built-up area; sign EVC report. |
| **R3-S02** | `evc-reports` | Signed Inspection Reports | `ReportsView.tsx` | `GET /api/v1/reports/evc-consolidated` | Access archived EVC inspection dockets, committee findings, and deficiency summaries. |
| **R3-S03** | `notifications` | Inspection Deadlines & Alerts | `NotificationsView.tsx` | `GET /api/v1/alerts` | Track scheduled visit dates, 48-hour report upload deadlines, and emergency inspection directives. |

---

### Role 4: Regional Office Portal (`RolePortalId = 4`)
- **Default Actor:** Regional Officer Western Region (`usr-ro-western`, `ro.western@aicte.gov.in`)
- **Primary Mission:** Manage regional dockets, allocate experts to Scrutiny/EVC committees, monitor SLA pendency, conduct Standing Hearing Committee (SHC) hearings, and verify post-approval compliance.

| Screen ID | Navigation Tab | Screen Title | Primary Component | Backend APIs Connected | Primary User Task & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R4-S01** | `ro-allocation` | Committee Allocation & Workloads | `ROAllocationView.tsx` | `GET /api/v1/allocation/groups`, `POST /assign`, `/roster` | Allocate academic experts to Scrutiny and EVC panels; prevent institutional bias conflicts; track expert workload. |
| **R4-S02** | `ro-pendency` | Regional Pendency & SLA Matrix | `PendencyView.tsx` | `GET /api/v1/applications`, `/dashboard/summary` | Real-time regional SLA tracker; identify cases approaching 7-day/10-day deadlines; issue expedited notices. |
| **R4-S03** | `ro-appeals-hearings`| Standing Hearing Committee (SHC) | `AppealsAndHearingsView.tsx` | `GET /api/v1/appeals-hearings`, `POST /schedule`, `/minutes` | Convene SHC personal hearings under APH §1.10; record hearing minutes and relief recommendations. |
| **R4-S04** | `ro-obligations`| Post-Approval Compliance & Timers | `ComplianceView.tsx` | `GET /api/v1/compliance/obligations`, `POST /verify` | Monitor and verify 6-month undertakings (FDR deposit, building construction, land use certificate). |
| **R4-S05** | `notifications` | Regional Alerts & Escalations | `NotificationsView.tsx` | `GET /api/v1/alerts` | Monitor region-wide SLA breach escalations, court directives, and public notice extension alerts. |

---

### Role 5: Approval Bureau / Competent Authority Portal (`RolePortalId = 5`)
- **Default Actor:** Bureau Head / Competent Authority (`usr-bureau-hq`, `bureau.approval@aicte.gov.in`)
- **Primary Mission:** Exercise statutory decision authority under AICTE Act §10, issue Letters of Approval (LoA) or Extension of Approval (EoA), record rejection speaking orders, and monitor SAC judicial appeals.

| Screen ID | Navigation Tab | Screen Title | Primary Component | Backend APIs Connected | Primary User Task & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R5-S01** | `ca-decision` | Statutory Decision Gate | `CompetentAuthorityDecisionView.tsx` | `POST /api/v1/applications/:id/decisions` | Review consolidated case dockets; execute statutory approval/rejection; record formal speaking orders. |
| **R5-S02** | `ca-decision-docs`| Decision Letters & PDF Signing | `GeneratedDocumentsView.tsx` | `POST /api/v1/artifacts/generate-doc`, `/verify-signature` | Cryptographically seal decision orders; generate PDF with dynamic QR and HMAC-SHA256 prototype seal. |
| **R5-S03** | `ca-appeals` | SAC Appeals & Dispositions | `AppealsAndHearingsView.tsx` | `GET /api/v1/appeals-hearings`, `POST /dispose` | Review Standing Appellate Committee dispositions headed by retired High Court Judge under APH §1.11. |
| **R5-S04** | `notifications` | Council Alerts & Escalations | `NotificationsView.tsx` | `GET /api/v1/alerts` | High-priority Council alerts, court filings, pending Executive Committee policy overrides. |

---

### Role 6: Policy Administration & System Oversight (`RolePortalId = 6`)
- **Default Actor:** Policy Administrator (`usr-admin`, `admin@aicte.gov.in`)
- **Primary Mission:** Manage versioned regulatory policy revisions, inspect tamper-evident audit trails, monitor national ecosystem adapters, and analyze statutory approval trends.

| Screen ID | Navigation Tab | Screen Title | Primary Component | Backend APIs Connected | Primary User Task & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R6-S01** | `admin-policy` | Policy Registry & Dynamic Rules | `ConfigRulesView.tsx` | `GET /api/v1/rules-registry`, `POST /revision`, `/simulate` | Maintain APH versioned rule definitions; configure Table 2.3 conditions; run route simulations. |
| **R6-S02** | `admin-worm` | WORM Cryptographic Audit Trail | `AuditView.tsx` | `GET /api/v1/audit-logs` | Inspect chronological, tamper-evident HMAC-SHA256 hash-chained audit events across all cases. |
| **R6-S03** | `admin-adapters`| National Ecosystem Endpoints | `GovernmentEndpointsView.tsx` | `POST /api/v1/adapter/dsc-verify`, `/ingest-upstream` | Test and monitor simulated integration gateways (NSWS, emBridge DSC, ITD PAN, DigiLocker). |
| **R6-S04** | `admin-analytics`| Consolidated Statutory Analytics | `ReportsView.tsx` | `GET /api/v1/reports/consolidated` | Multi-dimensional regulatory dashboards: application volumes, route distributions, and regional SLA performance. |
| **R6-S05** | `notifications` | System Alert Logs & Audits | `NotificationsView.tsx` | `GET /api/v1/alerts` | System-wide health logs, unauthorized access attempt alerts, and database diagnostic alerts. |

---

## 3. Secondary Screens, Modals & Detail Interfaces

| Modal / Secondary View | Parent Context | Component File | Trigger Mechanism | Key Capabilities & Features |
| :--- | :--- | :--- | :--- | :--- |
| **Application Detail Dossier Modal** | Any application row | `ApplicationDetailModal.tsx` | Click on application row or "View Dossier" | 8 dedicated tabs: Overview, Documents, Deficiency Cures, Dynamic Route Engine, EVC Telemetry, Obligations, Decision PDF, Audit Trail. |
| **New Application Intake Modal** | Header / Docket | `NewApplicationModal.tsx` | "New Application +" button | Multi-step manual filing wizard: Institute identity, Academic session, Program, Intake numbers, Land area, TER charges. |
| **Summary Notices Modal** | Header / Dossier | `CaseSummaryNoticesModal.tsx` | "Summary Notices" button | Concise modal summarizing all active statutory deficiency letters, hearing notices, and orders for a case. |
| **Document Expiry & Verification Drawer** | Regional Desk | `DocumentExpiryView.tsx` | `ro-verify`, `inst-dossier` | Inspect institution document vault, land titles, building plans, and fire safety certificate expirations. |
| **Government Endpoints Console** | Policy Admin / RO | `GovernmentEndpointsView.tsx` | `admin-adapters`, `ca-dispatch` | Interactive simulator for external government APIs (emBridge DSC, NSWS, PAN KYC, State Concurrence). |
