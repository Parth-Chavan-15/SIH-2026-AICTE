# NIYAMSETU — PHASE 4: UI ACTION & API VERIFICATION MATRIX
## Comprehensive Mapping and Live Interaction Verification across All 30 Screens

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Scope:** Verification that every interactive control, button, form submission, and data table across all 30 primary screens and 8 modals connects to real backend endpoints and provides proper user feedback.

---

## 1. Interaction & API Mapping Matrix

The table below maps primary UI actions across all 6 roles directly to their underlying REST API endpoints, HTTP methods, payloads, expected responses, and UI feedback:

| Screen ID | UI Control / Action | REST Endpoint | HTTP Method | Expected Payload / Params | Response Status | UI Feedback / State Transition |
|:---|:---|:---|:---:|:---|:---:|:---|
| `R1-S01` | Filter by Status / Stage | Client-side filter | - | `status`, `routeType` | - | Instant data grid filter without page reload. |
| `R1-S01` | Open Application Detail | `GET /api/v1/applications/:id` | `GET` | `appId` | 200 OK | Opens `ApplicationDetailModal` with full telemetry. |
| `R1-S02` | NSWS Preset Selector | Client-side state | - | Preset ID (`COEP`, `GIITS`, etc.) | - | Auto-populates all 5 steps with realistic data. |
| `R1-S02` | NSWS Onboarding Submit | `POST /api/v1/nsws/onboard` | `POST` | `{ entityName, pan, trustType }` | 201 Created | Success toast; advances stepper to Step 2. |
| `R1-S02` | Verify DSC Token | `POST /api/v1/nsws/verify-dsc` | `POST` | `{ tokenSerial, tokenType }` | 200 OK | Green checkmark; advances to Step 3. |
| `R1-S02` | Evaluate Route Preview | `POST /api/v1/policy/evaluate` | `POST` | `{ existingIntake, proposedIntake, nba }` | 200 OK | Renders dynamic rule trace (R01–R32) & route badge. |
| `R1-S02` | Submit Application | `POST /api/v1/nsws/submit` | `POST` | Full application DTO | 201 Created | Success toast; navigates to `inst-apps` with new case. |
| `R1-S03` | Upload Deficiency Cure | `POST /api/v1/applications/:id/scrutiny/cure` | `POST` | `{ itemId, evidenceFile, remarks }` | 200 OK | Success toast; updates cure status badge to `Submitted`. |
| `R1-S04` | Download Decision PDF | `GET /api/v1/decision-documents/:caseId/download` | `GET` | `caseId`, `type` | 200 OK | Streams generated PDF file to browser download manager. |
| `R1-S04` | Verify Signature | `GET /api/v1/decision-documents/:caseId/verify` | `GET` | `caseId` | 200 OK | Renders green verified modal with SHA-256 digest match. |
| `R1-S05` | Upload Compliance Evidence | `POST /api/v1/compliance/:id/evidence` | `POST` | `{ evidenceFileName, url }` | 200 OK | Closes modal; updates obligation status to `Submitted`. |
| `R1-S06` | Submit Appeal Petition | `POST /api/v1/appeals-hearings` | `POST` | `{ caseId, grounds, forum }` | 201 Created | Success toast; lists appeal under pending judicial bench. |
| `R1-S07` | Mark Alert Read | Client-side state | - | `alertId` | - | Removes badge count and marks notification read. |
| `R2-S01` | Toggle Checklist Item Status | Client-side state | - | `itemId`, `status` (`accepted`/`deficient`) | - | Updates card color; toggles observation text input. |
| `R2-S01` | Sign Snapshot v1 | `POST /api/v1/applications/:id/scrutiny/sign` | `POST` | `{ version: 1, items, remarks }` | 200 OK | Generates LoD if deficient or moves to `Scrutiny Cleared`. |
| `R2-S02` | Differential Re-Scrutiny Sign | `POST /api/v1/applications/:id/scrutiny/sign` | `POST` | `{ version: 2, remediations }` | 200 OK | Advances case to `EVC Scheduled` or Council review. |
| `R2-S02` | Scope Lock Tamper Test | `POST /api/v1/applications/:id/scrutiny/correct` | `POST` | `{ itemId: 'C3', illegalMod: true }` | 409 / 412 | Renders red modal proving server rejected locked item mod. |
| `R2-S03` | Select Portal Fixture | Client-side state | - | Fixture ID | - | Renders fixture JSON/PDF extraction preview. |
| `R2-S03` | Confirm Fixture Ingestion | `POST /api/v1/portal-import/ingest` | `POST` | Fixture payload | 201 Created | Success toast; case appears in Scrutiny queue. |
| `R3-S01` | Score Infra / Faculty / Labs | Client-side slider | - | Scores (0–100%) | - | Dynamic composite score calculation. |
| `R3-S01` | Submit EVC Report | `POST /api/v1/evc/:id/report` | `POST` | `{ scores, recommendation, summary }` | 200 OK | Advances case to `EVC Inspection Completed`. |
| `R4-S01` | Assign Committee | `POST /api/v1/allocation/assign` | `POST` | `{ caseId, groupId, type }` | 200 OK | Closes modal; updates panel caseload and case queue. |
| `R4-S02` | Export Pendency Report | Client-side CSV generator | - | Filtered pendency list | - | Downloads `AICTE_Regional_Pendency_Report.csv`. |
| `R4-S03` | Schedule Hearing Bench | `POST /api/v1/appeals-hearings/:id/hearing` | `POST` | `{ hearingDate, benchMembers }` | 200 OK | Success toast; sends notification to institution. |
| `R4-S04` | Verify Compliance Submission | `POST /api/v1/compliance/:id/verify` | `POST` | `{ decision: 'Verified', remarks }` | 200 OK | Updates obligation to `Verified & Closed`. |
| `R5-S01` | Issue Statutory Approval | `POST /api/v1/decisions/issue` | `POST` | `{ decision: 'Grant EoA', conditions }` | 200 OK | Transitions stage to `Approval Issued`; emits audit event. |
| `R5-S02` | Generate Council Decision PDF | `POST /api/v1/decision-documents/generate` | `POST` | `{ caseId, documentType: 'EOA' }` | 201 Created | Success toast; document appears in repository grid. |
| `R5-S03` | Record SAC Disposition | `POST /api/v1/appeals-hearings/:id/disposition` | `POST` | `{ disposition: 'OVERTURN', orderText }` | 200 OK | Updates judicial status to `Disposed — Relief Granted`. |
| `R6-S01` | Toggle Rule Active Status | `PUT /api/v1/rules/:id` | `PUT` | `{ active: boolean }` | 200 OK | Updates policy registry; refreshes simulation engine. |
| `R6-S02` | Export Audit Trail CSV | Client-side CSV generator | - | Filtered audit logs | - | Downloads `AICTE_Cryptographic_Audit_Trail.csv`. |
| `R6-S03` | Ping External Gateway | `POST /api/v1/adapters/test` | `POST` | `{ adapterId: 'NSWS' }` | 200 OK | Displays mock latency (ms) and JSON response payload. |
| `R6-S04` | Export Regulatory KPI Report | Client-side CSV generator | - | Consolidated report data | - | Downloads `AICTE_Consolidated_Regulatory_KPIs.csv`. |

---

## 2. Error Handling & Validation Guarantees

1. **Network & Server Disconnections:**
   - All async calls wrap in `try / catch` blocks with standard error dispatch:
     ```typescript
     try {
       await api.call(...);
       addToast({ type: 'success', title: '...', message: '...' });
     } catch (err: any) {
       addToast({ type: 'error', title: 'Operation Failed', message: err.message || 'Server error' });
     }
     ```
2. **Form Validation:**
   - Empty required fields, malformed PAN formats, and out-of-bound numerical inputs are blocked before dispatch with clear client-side validation messages.
3. **Optimistic Mutation Prevention:**
   - Critical governance actions (stage advancement, digital signing, council speaking orders) never apply optimistic local updates; UI state changes only upon receipt of verified `200/201` server confirmation.
4. **Zero Uncaught Exceptions:**
   - The test suite `tests/acceptance/http-client.test.ts` and `tests/interaction_audit.test.ts` verify all error pathways, confirming 100% resilient interaction.
