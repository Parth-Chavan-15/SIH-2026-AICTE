# NIYAMSETU (नियमसेतु) — PHASE 4
## Implementation Reality Audit: Unimplemented & Simulated Feature Register

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T20:55:00+05:30  
**Directive:** Audit every screen and action against backend code. Preserve simulated demonstration capabilities while clearly labeling them to ensure complete truthfulness.

---

## 1. Feature Implementation Classification Standard

Every functional capability across NIYAMSETU is classified into one of five rigorous tiers:
1. **Implemented (Tier 1):** Full end-to-end functionality backed by real backend handlers, storage operations, and automated test coverage.
2. **Partially Implemented (Tier 2):** Core workflow operates; certain edge cases or non-critical sub-actions rely on simplified mock helpers.
3. **Intentionally Simulated (Tier 3):** Deliberately simulated integration gateways representing external government services (NSWS, Income Tax Dept PAN, emBridge USB Crypto-Tokens, State Concurrence portals). Preserved for demonstration and clearly labeled.
4. **UI-Only / Mock (Tier 4):** Visual representations that do not currently execute persistent database mutations.
5. **Unverified (Tier 5):** Insufficient empirical evidence to prove full production readiness.

---

## 2. Register of Implemented, Simulated & Unimplemented Features

| Feature ID | Screen / View Location | Feature Name | Classification Tier | Underlying Code & Endpoint | Truthful Description & UI Label | Demonstration Impact & Preservation Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FEAT-01** | `NSWSSimulationView.tsx` | PAN KYC Verification | **Intentionally Simulated** | `POST /api/v1/nsws/onboard`, `/verify-pan` | Regex format check against ITD syntax (`/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`). No live NSDL/ITD API call. Label: `[SIMULATED - PAN Format Validation]` | **PRESERVED.** Vital for demonstration of NSWS investor onboarding pipeline. |
| **FEAT-02** | `NSWSSimulationView.tsx`, `adapterRoutes.ts` | Class-3 Hardware Token (DSC) | **Intentionally Simulated** | `POST /api/v1/nsws/verify-dsc`, `/adapter/dsc-verify` | Validates token identifier (`ePass2003Auto`, `mSigner V3.2`). Does not query Windows USB smartcard driver. Label: `[SIMULATED - Crypto Token Format Gate]` | **PRESERVED.** Demonstrates statutory digital signature prerequisite. |
| **FEAT-03** | `NSWSSimulationView.tsx`, `nswsRoutes.ts` | Case Ingestion & Persistence | **Implemented** | `POST /api/v1/nsws/submit`, `mongoCore.ts` | Fully operational. Inserts case into MongoDB `niyamsetu_dev`, records audit event, appears in institution portal immediately. | **PRESERVED & ENHANCED.** Core workflow backbone. |
| **FEAT-04** | `dynamicRouteEngine.ts` | Dynamic Route Evaluation | **Implemented** | `evaluateDynamicRoute(facts)` | Fully operational. Evaluates Table 2.3 rules, NBA waivers, and boundary conditions without hardcoded institution checks. | **PRESERVED.** Preserved as single authoritative routing engine. |
| **FEAT-05** | `ScrutinyEvaluationView.tsx` | Desk Scrutiny & Observation Logging | **Implemented** | `POST /api/v1/scrutiny/:id/evaluate`, `/applications/:id/transition` | Fully operational. Verifies documents, flags deficiencies, records observations, and communicates with applicant. | **PRESERVED.** Primary academic vetting console. |
| **FEAT-06** | `ScrutinyEvaluationView.tsx` | Differential Re-Scrutiny Lock | **Implemented** | `validateCorrections.ts`, `validateCorrections.test.ts` | Fully operational. Cleared items locked read-only; edits permitted only on un-cleared deficiency IDs per APH §1.8(g). | **PRESERVED.** Protects previously cleared scrutiny items. |
| **FEAT-07** | `EVCView.tsx` | EVC Campus Telemetry & Inspection | **Partially Implemented** | `GET /api/v1/evc/inspections`, `POST /report` | Inspection checklist and report submission operational. Geotagged coordinates and photos are realistic demo fixtures. Label: `[DEMO Telemetry Fixture]` | **PRESERVED.** Demonstrates physical/hybrid inspection parameters. |
| **FEAT-08** | `ROAllocationView.tsx` | Committee Roster Allocation | **Implemented** | `allocationService.ts`, `POST /api/v1/allocation/roster` | Fully operational. Enforces 3-expert quorum, prevents conflicted institution assignments. | **PRESERVED.** Regional Office workflow backbone. |
| **FEAT-09** | `AppealsAndHearingsView.tsx` | SHC Hearing & SAC Appellate Adjudication | **Implemented** | `appealsAndHearingsService.ts`, `POST /appeals-hearings` | Fully operational. Enforces strict committee member separation between SHC and SAC panels. | **PRESERVED.** Quasi-judicial appeals backbone. |
| **FEAT-10** | `CompetentAuthorityDecisionView.tsx` | Statutory Decision Gate | **Implemented** | `POST /api/v1/applications/:id/decisions` | Fully operational. Requires demo authority role; records decision and speaking order. | **PRESERVED.** Final Council approval stage. |
| **FEAT-11** | `decisionDocumentsService.ts` | Cryptographic Decision Document (PDF) | **Implemented / Prototype Seal** | `POST /api/v1/artifacts/generate-doc` | Real PDF generation using `pdf-lib` with embedded HMAC-SHA256 QR code. Label: `[Prototype Integrity Seal — HMAC-SHA256]` | **PRESERVED.** Tamper-evident PDF output. Not an official PKI certificate. |
| **FEAT-12** | `memoryAdapter.ts`, `mongoCore.ts` | Tamper-Evident Chained Audit Log | **Implemented** | `computeAuditHash`, `core_audit` collection | Real software HMAC-SHA256 hash chaining creating tamper-evident event tree. Label: `[Tamper-Evident Chained Audit Log]` | **PRESERVED.** Chained software log, not optical hardware WORM. |
| **FEAT-13** | `ComplianceView.tsx` | Post-Approval 4-Clock Timers | **Implemented** | `complianceService.ts`, `m3_obligations_timers.ts` | Fully operational. Enforces 6-month, 1-year timers with leap year month clamping. | **PRESERVED.** Post-approval compliance tracking. |
| **FEAT-14** | `GovernmentEndpointsView.tsx` | Upstream Government Sync Gateways | **Intentionally Simulated** | `GovernmentEndpointsView.tsx` | UI simulation of DigiLocker, State Higher Ed Dept, and Affiliating University portals. Label: `[SIMULATED - Ecosystem Endpoints]` | **PRESERVED.** Illustrates national interoperability. |
| **FEAT-15** | `PortalImportView.tsx` | Web-Portal PDF Report Ingestion | **Implemented** | `portalImportService.ts`, `GET /fixtures` | Parses structured text from legacy AICTE Web-Portal PDF reports into live case structures. | **PRESERVED.** Legacy migration capability. |

---

## 3. Explicit UI Transparency Commitments

1. No simulated integration is presented to evaluators as a live production API.
2. The UI consistently displays badges such as `[SIMULATED - PAN Validation]` and `[Prototype Integrity Seal — HMAC-SHA256]`.
3. Every simulated feature has a real local functional loop: user actions result in valid state transitions, real database persistence in `niyamsetu_dev`, and auditable events.
