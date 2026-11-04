# NIYAMSETU (नियमसेतु) — COMPLETE UI AND DUPLICATION AUDIT
## Streamlining Interfaces, Removing Redundant Elements & Preserving Backend Idempotency

**Project:** NIYAMSETU — The Bridge of Rules  
**SIH 2026 Problem Statement ID:** 26262  
**Target Branch:** Local `dev`  
**Phase:** Phase 6 Final Validation

---

## 1. Executive Summary of Audit Findings

The Phase 6 recursive inspection evaluated every component, sidebar navigation entry, modal, and API endpoint to identify redundant, misleading, or duplicated functionality. Prior to Phase 6, several roles were given generic, interchangeable views (e.g. Applicant, Regional Office, and Approval Bureau all rendering the same `AppealsAndHearingsView`). Additionally, institutions had NSWS intake embedded as a standard sidebar navigation item, creating confusion between initial application intake and normal workspace operations.

All duplicate interfaces have been eliminated and replaced with task-specific, role-authorized components, while strictly preserving backend idempotency and multi-document transaction durability.

---

## 2. Redundancy & Duplication Remediation Register

| Area / Component | Identified Defect / Duplication | Architectural Remediation in Phase 6 | Outcome & Value |
| :--- | :--- | :--- | :--- |
| **Appeals & Hearings (Roles 1, 4, 5)** | A single generic 892-line `AppealsAndHearingsView` was shared across Institution, Regional Office, and Council Chamber. Applicants saw authority disposal buttons; Regional Officers saw applicant forms. | Separated into three dedicated views: 1) `ApplicantAppealsView.tsx` (filing & tracking only), 2) `RegionalHearingCoordinationView.tsx` (SHC scheduling & 15-day NOC tracker), 3) `CouncilSACAppealsView.tsx` (SAC judicial adjudication & speaking orders). | Zero cross-role capability bleed. Clean separation of powers. |
| **Institution Sidebar Navigation** | NSWS Simulation was listed as ordinary tab #2 (`inst-nsws`) in the authenticated sidebar, causing applicants to repeatedly restart intake instead of managing active applications. | Removed NSWS from standard nav items. Added a dedicated `+ Start NSWS Intake` header action button in `Sidebar.tsx` and an empty-state action button in `ApplicationsListView.tsx`. | Institution workspace focuses cleanly on managing active dockets, while intake remains accessible on demand. |
| **Tenant Isolation Leak (Document Expiry)** | In `DocumentExpiryView.tsx`, COEP filter logic inadvertently included PDIMTR records (`return doc.institutionName.includes('COEP') \|\| doc.institutionName.includes('PDIMTR')`), and unmapped institutions defaulted to `return true`. | Fixed COEP filter strictly to COEP codes (`INST-SOUTH`, `INST-COEP`) and changed default fallthrough to `return false` (strict default-deny). | 100% strict tenant isolation across institutional logins. |
| **Filtered Apps React State Sync** | In `ApplicationsListView.tsx`, `filteredApps` computed from `scopedApps`, but its `useMemo` dependency array was listening to global `applications` instead of `scopedApps`. | Replaced dependency array with `[scopedApps, searchQuery, selectedRegion, selectedType, selectedStage, selectedSLA, sortBy]`. | Immediate, reliable table filtering without stale data retention. |
| **Step 2 Token Gate State Drift** | Selecting a negative fixture on NSWS Step 2 failed to reset `dscVerified` to false, allowing subsequent submissions with cached validation. | Bound `setDscVerified(false)` on `select.onChange` and in `catch (err)` block. Added live visual badge (`GATE_PASSED`, `GATE_BLOCKED`, `READY`). | Cryptographic rejection is strictly enforced with zero false-positive bypasses. |
| **Backend 422 Error Parsing** | `adapterRoutes.ts` returned error codes `DSC_CERTIFICATE_EXPIRED`, `DSC_CERTIFICATE_REVOKED`, and `DSC_SIGNATURE_REQUIRED`, which were omitted from client `ERROR_STATUS`, causing `session.ts` to throw "Service returned an invalid response". | Added all 3 statutory error codes to `ERROR_STATUS` in `src/shared/contracts.ts`, allowing client `requestJson` to parse and display exact statutory citations. | Clear, statutory error messages displayed directly in UI. |

---

## 3. Preservation of Backend Idempotency Guarantees

While redundant UI elements, competing forms, and duplicated navigation items were removed, **all backend idempotency mechanisms were rigorously preserved**:

1. **Idempotency Keys on Case Mutations:** Every application creation and transition payload requires a unique `idempotencyKey` (UUIDv4). Repeated network requests with the same key do not spawn duplicate applications or state mutations.
2. **Optimistic Version Locking:** State transitions require an `expectedVersion` integer. If two officers attempt concurrent mutations, the second request fails with `409 VERSION_CONFLICT`, preventing race conditions.
3. **WORM Hash Chain Integrity:** Audit ledger events are SHA-256 hashed and linked to `previousHash`. Eliminating duplicate UI buttons ensures no orphaned or duplicated audit records are generated.
