# NIYAMSETU — PHASE 5: SCREEN & MODAL RECONCILIATION REPORT
## Empirical Codebase Audit of 30 Primary Screens & 8 Secondary Interfaces

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Audit Source:** Live Codebase Analysis of [App.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/App.tsx), [Sidebar.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/components/layout/Sidebar.tsx), [Navbar.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/components/layout/Navbar.tsx), and Feature Views.

---

## 1. Resolution of Phase 4 Discrepancies

### Discrepancy 1: R3-S02 Component Mapping (`evc-reports`)
- **Phase 4 Claim:** Some Phase 4 documents stated that R3-S02 was rendered as an internal tab inside `EVCView.tsx`, while others claimed it was a separate report screen.
- **Empirical Code Truth:**
  - In [Sidebar.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/components/layout/Sidebar.tsx) line 87:
    `{ id: 'evc-reports', label: '2. Signed Inspection Reports', icon: FileText }`
  - In [App.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/App.tsx) line 194:
    `{currentTab === 'evc-reports' && <ReportsView />}`
  - **Verdict:** The actual component rendered in the DOM when navigating to `evc-reports` is `ReportsView.tsx`. `EVCView.tsx` handles `evc-inspect` (Screen R3-S01). The Phase 5 inventory reflects this confirmed DOM mapping.

### Discrepancy 2: Secondary Interfaces Count (6 vs 8)
- **Phase 4 Claim:** Phase 4 documentation stated there were 8 secondary interfaces, but the screenshot directory only had `SEC-01.png` through `SEC-06.png`.
- **Empirical Code Truth:**
  - Files `SEC-01.png`, `SEC-02.png`, and `SEC-03.png` were 3 different internal tabs of `ApplicationDetailModal.tsx` (Overview, Documents, EVC).
  - File `SEC-04.png` was `NewApplicationModal.tsx`.
  - File `SEC-05.png` was `CaseSummaryNoticesModal.tsx`.
  - File `SEC-06.png` was `DocumentExpiryView.tsx`.
  - Modals MOD-05 (Compliance Evidence Upload Modal), MOD-06 (Compliance Verification Modal), MOD-07 (Committee Allocation Modal), and MOD-08 (Council Speaking Order Generator) were implemented as inline dialog state within their respective parent views rather than standalone top-level route files.
  - **Verdict:** All 8 secondary interfaces are verified in code, and the artifact registry has been expanded to catalog each interface independently.

---

## 2. Reconciled Primary Screens Inventory (30 Screens)

| Screen ID | Role Workspace | Navigation Key | Component File | Entry Point | Primary Usable Actions | Backend Route | Persistence | Status |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|
| **R1-S01** | Role 1: Applicant | `inst-apps` | `ApplicationsListView.tsx` | Sidebar Tab 1 | View own docket, open case detail, open new app wizard, search/filter | `GET /api/v1/applications` | MongoDB / Memory | **VERIFIED** |
| **R1-S02** | Role 1: Applicant | `inst-nsws` | `NSWSSimulationView.tsx` | Sidebar Tab 2 | 5-step NSWS onboarding wizard, PAN KYC check, emBridge DSC check, dynamic route evaluation, case submission | `POST /api/v1/nsws/onboard`, `/evaluate-route`, `/submit` | MongoDB / Memory | **VERIFIED** |
| **R1-S03** | Role 1: Applicant | `inst-deficiencies` | `InstitutionDeficiencyCureView.tsx` | Sidebar Tab 3 | View scrutiny observations, upload cure documents for flagged items, submit cure package | `POST /api/v1/applications/:id/scrutiny/cure` | MongoDB / Memory | **VERIFIED** |
| **R1-S04** | Role 1: Applicant | `inst-decision-docs`| `GeneratedDocumentsView.tsx` | Sidebar Tab 4 | View dispatched EoA/LoA orders, verify HMAC-SHA256 signature, download signed PDF | `GET /api/v1/decision-docs`, `/download/:caseId` | Disk / PDF Storage | **VERIFIED** |
| **R1-S05** | Role 1: Applicant | `inst-renewals` | `ComplianceView.tsx` | Sidebar Tab 5 | Track 4-clock obligation timers, open evidence upload modal, submit compliance evidence | `GET /api/v1/obligations`, `POST /obligations/:id/upload` | MongoDB / Memory | **VERIFIED** |
| **R1-S06** | Role 1: Applicant | `appeals-hearings` | `AppealsAndHearingsView.tsx` | Sidebar Tab 6 | File SAC appeal petition under Ch. I §1.11 / Ch. II §2.23.3, track hearing status, view bench minutes | `GET /api/v1/appeals-hearings`, `POST /appeals-hearings/appeal` | MongoDB / Memory | **VERIFIED** |
| **R1-S07** | Role 1: Applicant | `notifications` | `NotificationsView.tsx` | Sidebar Tab 7 / Bell Icon | Read priority alerts, filter by urgency, click alert to open case | `GET /api/v1/alerts` | MongoDB / Memory | **VERIFIED** |
| **R2-S01** | Role 2: Scrutiny | `scrutiny-eval` | `ScrutinyEvaluationView.tsx` (mode: `initial`) | Sidebar Tab 1 | Evaluate checklist items C1–C14, toggle accepted/deficient, enter remarks, sign Snapshot v1 | `GET /api/v1/applications/:id/scrutiny`, `POST .../scrutiny` | MongoDB / Memory | **VERIFIED** |
| **R2-S02** | Role 2: Scrutiny | `scrutiny-rescrutiny`| `ScrutinyEvaluationView.tsx` (mode: `rescrutiny`)| Sidebar Tab 2 | Review uploaded cures on flagged items, execute USP B06 Scope Lock Tamper Test, sign Snapshot v2 | `POST /api/v1/applications/:id/corrections` | MongoDB / Memory | **VERIFIED** |
| **R2-S03** | Role 2: Scrutiny | `scrutiny-portal-import`| `PortalImportView.tsx` | Sidebar Tab 3 | Select PDF/JSON fixtures (GIITS, COEP, etc.), preview extracted fields, confirm ingestion | `GET /api/v1/portal-import/fixtures`, `POST /confirm` | MongoDB / Memory | **VERIFIED** |
| **R2-S04** | Role 2: Scrutiny | `scrutiny-committee` | `ScrutinyRosterDeclarationView.tsx` | Sidebar Tab 4 | Inspect 3-member committee roster (Chair, Member 1, DTE Rep), view conflict of interest cards | `GET /api/v1/allocation/groups` | Memory | **VERIFIED** |
| **R2-S05** | Role 2: Scrutiny | `scrutiny-queue` | `ApplicationsListView.tsx` (Reviewer scoped) | Sidebar Tab 5 | Reviewer-filtered queue of cases pending initial evaluation or re-scrutiny | `GET /api/v1/applications` | MongoDB / Memory | **VERIFIED** |
| **R2-S06** | Role 2: Scrutiny | `notifications` | `NotificationsView.tsx` | Sidebar Tab 6 | Committee-scoped notices for cure submissions and SLA review countdowns | `GET /api/v1/alerts` | MongoDB / Memory | **VERIFIED** |
| **R3-S01** | Role 3: EVC | `evc-inspect` | `EVCView.tsx` | Sidebar Tab 1 | View inspection case, inspect demo GPS coordinates & walkthrough video, score infra/faculty/labs, submit report | `GET /api/v1/evc/queue`, `POST /api/v1/evc/:id/report` | MongoDB / Memory | **VERIFIED** |
| **R3-S02** | Role 3: EVC | `evc-reports` | `ReportsView.tsx` | Sidebar Tab 2 | Consolidated regulatory reports and inspection metrics across institutions | `GET /api/v1/reports/consolidated` | MongoDB / Memory | **VERIFIED** |
| **R3-S03** | Role 3: EVC | `notifications` | `NotificationsView.tsx` | Sidebar Tab 3 | Inspection dispatch notices, campus visit schedule updates | `GET /api/v1/alerts` | MongoDB / Memory | **VERIFIED** |
| **R4-S01** | Role 4: Regional Office | `ro-allocation` | `ROAllocationView.tsx` | Sidebar Tab 1 | View expert committee capacity, assign unallocated cases to Desk Scrutiny or EVC, check conflicts | `GET /api/v1/allocation/groups`, `POST /allocation/assign` | MongoDB / Memory | **VERIFIED** |
| **R4-S02** | Role 4: Regional Office | `ro-pendency` | `PendencyView.tsx` | Sidebar Tab 2 | Regional SLA pendency matrix, countdown clocks, bottleneck alerts, CSV export | `GET /api/v1/escalations`, `GET /api/v1/timers` | MongoDB / Memory | **VERIFIED** |
| **R4-S03** | Role 4: Regional Office | `ro-appeals-hearings`| `AppealsAndHearingsView.tsx` (RO mode) | Sidebar Tab 3 | Schedule virtual Standing Hearing Committee (SHC) sessions, record minutes | `POST /api/v1/appeals-hearings/schedule-hearing` | MongoDB / Memory | **VERIFIED** |
| **R4-S04** | Role 4: Regional Office | `ro-obligations` | `ComplianceView.tsx` (RO mode) | Sidebar Tab 4 | Region-wide compliance docket, open verification modal, approve/reject evidence | `GET /api/v1/obligations`, `POST /obligations/:id/verify` | MongoDB / Memory | **VERIFIED** |
| **R4-S05** | Role 4: Regional Office | `notifications` | `NotificationsView.tsx` | Sidebar Tab 5 | Regional escalation notices, impending SLA breaches, new filings | `GET /api/v1/alerts` | MongoDB / Memory | **VERIFIED** |
| **R5-S01** | Role 5: Approval Bureau | `ca-decision` | `CompetentAuthorityDecisionView.tsx` | Sidebar Tab 1 | Council statutory decision gate: Grant EoA/LoA, Issue LoD, Reject; generate speaking order | `POST /api/v1/applications/:id/decisions` | MongoDB / Memory | **VERIFIED** |
| **R5-S02** | Role 5: Approval Bureau | `ca-decision-docs` | `GeneratedDocumentsView.tsx` | Sidebar Tab 2 | Council document generation console (EoA, LoA, LoD, LoR), verify HMAC-SHA256 digest | `POST /api/v1/decision-docs/generate/:caseId` | Disk / PDF Storage | **VERIFIED** |
| **R5-S03** | Role 5: Approval Bureau | `ca-appeals` | `AppealsAndHearingsView.tsx` (Council mode) | Sidebar Tab 3 | Adjudicate Standing Appellate Committee (SAC) appeals, issue final order disposition | `POST /api/v1/appeals-hearings/appeals/:id/dispose` | MongoDB / Memory | **VERIFIED** |
| **R5-S04** | Role 5: Approval Bureau | `notifications` | `NotificationsView.tsx` | Sidebar Tab 4 | Cases awaiting council determination, high-priority escalation dockets | `GET /api/v1/alerts` | MongoDB / Memory | **VERIFIED** |
| **R6-S01** | Role 6: Policy Admin | `admin-policy` | `ConfigRulesView.tsx` | Sidebar Tab 1 | Dynamic policy rule editor (R01–R32), inspect conditions, threshold configuration, run route simulations | `GET /api/v1/rules-registry/rules`, `POST .../simulate-route` | MongoDB / Memory | **VERIFIED** |
| **R6-S02** | Role 6: Policy Admin | `admin-worm` | `AuditView.tsx` | Sidebar Tab 2 | Immutable chained audit trail, inspect SHA-256 block tree, search by actor/case, CSV export | `GET /api/v1/audit-logs` | MongoDB / Memory | **VERIFIED** |
| **R6-S03** | Role 6: Policy Admin | `admin-adapters` | `GovernmentEndpointsView.tsx` | Sidebar Tab 3 | External integration simulator: NSWS, DigiLocker, NBA, DTE, emBridge; toggle mock latency/failures | `GET /api/v1/adapter/status`, `POST /adapter/ingest` | Simulator / Memory | **VERIFIED** |
| **R6-S04** | Role 6: Policy Admin | `admin-analytics` | `ReportsView.tsx` | Sidebar Tab 4 | Executive regulatory KPIs, regional intake distribution, approval ratio charts | `GET /api/v1/reports/consolidated` | MongoDB / Memory | **VERIFIED** |
| **R6-S05** | Role 6: Policy Admin | `notifications` | `NotificationsView.tsx` | Sidebar Tab 5 | System-wide audit confirmations, adapter latency alerts, security event logs | `GET /api/v1/alerts` | MongoDB / Memory | **VERIFIED** |

---

## 3. Reconciled Secondary Interfaces Inventory (8 Modals)

| Modal ID | Modal Name | Component File | Parent Screen / Trigger | Primary Usable Actions | Input Validation & Error Handling | Backend Operation | Persistence | Status |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|
| **MOD-01** | Case Detail & Timeline Modal | `ApplicationDetailModal.tsx` | Any case card / row in `ApplicationsListView` | 4 internal tabs (Overview, Documents, EVC, Compliance); quick stage advance; flag deficiency | Rejects illegal stage transitions via `validateWorkflowTransition()`; requires reason for return | `POST /api/v1/applications/:id/transition` | MongoDB / Memory | **VERIFIED** |
| **MOD-02** | Manual New Application Wizard | `NewApplicationModal.tsx` | "+ New Application" button in header / list | 4-step intake form: Institution, Program, Intake ($X$ & proposed), Dynamic Route Preview & Submit | Validates numerical intake bounds, required text fields, entity type | `POST /api/v1/applications` | MongoDB / Memory | **VERIFIED** |
| **MOD-03** | Deficiency & Hearing Notice Modal | `CaseSummaryNoticesModal.tsx` | "Issue Formal Notice" in `ApplicationDetailModal` | High-fidelity preview of official AICTE Letter of Deficiency (LoD) or Hearing Notice; copy / print | Pre-populates verified committee observations and cure deadline | `GET /api/v1/applications/:id/case-summary` | Memory | **VERIFIED** |
| **MOD-04** | Document Expiry & Renewal Monitor | `DocumentExpiryView.tsx` | Secondary navigation in Documents / Dashboard | Radar tracking 1-year Fire Safety NOC, Structural Certificate, Affiliation; upload renewed NOC | Validates date formatting; calculates 60-day advance renewal alert | `GET /api/v1/documents`, `POST /obligations/:id/upload` | Memory | **VERIFIED** |
| **MOD-05** | Compliance Evidence Upload Modal | `ComplianceView.tsx` | "Upload Evidence" button on pending obligation card | Enter evidence file name, reference URL, check mandatory legal undertaking checkbox, submit | Enforces non-empty file name and mandatory undertaking confirmation | `POST /api/v1/obligations/:id/upload` | MongoDB / Memory | **VERIFIED** |
| **MOD-06** | Regional Compliance Verification Modal | `ComplianceView.tsx` | "Verify Submission" button on submitted obligation | Select determination (`Verified` vs `Rejected`), enter mandatory officer remarks, confirm | Enforces non-empty official remarks before enabling confirm button | `POST /api/v1/obligations/:id/verify` | MongoDB / Memory | **VERIFIED** |
| **MOD-07** | Committee Allocation Modal | `ROAllocationView.tsx` | "Assign Committee" button on unallocated case | Select panel type (`Desk Scrutiny` or `EVC`), choose target panel from capacity list, confirm | Validates conflict of interest declarations before assignment | `POST /api/v1/allocation/assign` | MongoDB / Memory | **VERIFIED** |
| **MOD-08** | Council Speaking Order Generator | `CompetentAuthorityDecisionView.tsx` | "Record Council Decision" button in Bureau workspace | Select statutory determination (`Grant EoA/LoA`, `Issue LoD`, `Reject`), select undertakings, enter order text | Enforces selection of decision type and speaking order legal reasoning | `POST /api/v1/applications/:id/decisions` | MongoDB / Memory | **VERIFIED** |

---

## 4. Reconciliation Verification Conclusion

1. Every single one of the 30 primary screens is independently reachable via [Sidebar.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/components/layout/Sidebar.tsx) and correctly rendered via [App.tsx](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/App.tsx).
2. All 8 secondary interfaces have been traced to their exact triggering actions and parent components.
3. The discrepancy regarding Screen R3-S02 has been definitively resolved: it renders `ReportsView.tsx` in the actual DOM.
4. The discrepancy between 6 vs 8 secondary screenshots has been resolved and cataloged.
