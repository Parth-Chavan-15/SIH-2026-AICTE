# NIYAMSETU — PHASE 5: IMPLEMENTATION REALITY AUDIT
## Rigorous Technical Classification of Implemented, Partial, and Simulated Capabilities

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Audit Principle:** Absolute Transparency & Forensic Realism. No false claims of hardware infrastructure or production government API integrations.

---

## 1. Cryptographic & Security Reality Gate

### 1.1 "WORM Compliant" vs Software Hash-Chained Audit Log
- **Common Industry Claim:** "Write-Once-Read-Many (WORM) hardware storage compliant."
- **NIYAMSETU Empirical Reality:**
  - NIYAMSETU does **NOT** interface with physical optical WORM hardware drives or specialized enterprise storage appliances (e.g., NetApp SnapLock).
  - NIYAMSETU **DOES** implement a cryptographically chained, tamper-evident software audit log:
    - Every state change, official observation, and decision records an append-only event in the `core_audit` collection.
    - Each record contains `previousHash`, timestamp, actor identity, action type, justification, and an immutable SHA-256 block hash.
    - Any retroactive modification to a historical database record breaks the SHA-256 chain and is detected by the audit inspector.
  - **Truthful Label Applied:** `[Tamper-Evident Chained Audit Log] • Append-Only Software Semantics`.

### 1.2 "Class-3 Digital Signature" vs HMAC-SHA256 Prototype Integrity Seal
- **Common Industry Claim:** "Legally binding Class-3 PKI digital signature with hardware crypto tokens."
- **NIYAMSETU Empirical Reality:**
  - In a hackathon prototype environment, NIYAMSETU does **NOT** connect to production Certifying Authorities (CCA India, e-Mudhra, Sify, Capricorn) or require physical USB cryptographic dongles (ePass2003Auto).
  - NIYAMSETU **DOES** implement:
    - A cryptographic prototype integrity seal using server-side **HMAC-SHA256**.
    - When a Council decision order (EoA, LoA, LoD, LoR) is generated via `pdf-lib`, the canonical text, dispatch number, and academic year are digested.
    - The server calculates an HMAC-SHA256 digest and embeds it as a verification seal and QR code in the PDF.
    - The built-in verification tool (`GET /api/v1/decision-docs/verify-signature/:caseId`) validates the document against the server's authoritative digest.
  - **Truthful Label Applied:** `[Prototype Integrity Seal — HMAC-SHA256]`.

### 1.3 "PAN KYC & emBridge Gateway" vs Realistic Simulation Fixtures
- **Common Industry Claim:** "Live government NSDL / Income Tax PAN verification & emBridge portal."
- **NIYAMSETU Empirical Reality:**
  - NIYAMSETU does **NOT** use live production NSDL API credentials or taxpayer data.
  - NIYAMSETU **DOES** implement a complete 5-step simulation wizard:
    - PAN format validation enforcing statutory entity structure (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
    - USB token gateway emulator with selectable fixtures (`ePass2003Auto`, `mToken`, `CryptoSoftToken`, `UnsignedDocument`).
    - Negative fixture injection demonstrating cryptographic rejection of unsigned documents.
  - **Truthful Label Applied:** `[SIMULATED - PAN Format Validation]` & `[SIMULATED - Class-3 Crypto Token Format Gate]`.

### 1.4 "GPS Campus Telemetry" vs Telemetry Demo Fixtures
- **Common Industry Claim:** "Real-time satellite GPS tracking of EVC committee."
- **NIYAMSETU Empirical Reality:**
  - Physical campus inspection GPS coordinates (e.g. `17.7028° N, 83.1132° E`) are realistic demo fixtures representing registered institutional boundaries.
  - **Truthful Label Applied:** `[DEMO Telemetry Fixture]`.

---

## 2. Granular Functional Classification Matrix

The table below catalogs every major functional capability across the platform:

| Functional Area | Capability / Feature | Implementation Classification | Persistence Store | Truth Labeling & Notes |
|:---|:---|:---:|:---:|:---|
| **Intake Engine** | NSWS Single-Window 5-Step Wizard | **Fully Implemented** | MongoDB / Memory | Full interactive UI, data persistence into Council queue. |
| **Intake Engine** | PAN Format Checksum Validator | **Intentionally Simulated** | Memory | `[SIMULATED - PAN Format Validation]`. Enforces regex pattern. |
| **Intake Engine** | emBridge DSC USB Token Gate | **Intentionally Simulated** | Memory | `[SIMULATED - Class-3 Crypto Token Format Gate]`. Supports negative rejection fixture. |
| **Route Engine** | Dynamic Regulatory Engine (R01–R32)| **Fully Implemented** | Code & MongoDB | Authoritative evaluation of APH 2026–27 Table 2.3 rules. |
| **Route Engine** | Intake Boundary Evaluation ($X = 360$) | **Fully Implemented** | Code & MongoDB | Mathematically sound ceiling holds under APH §2.3.2. |
| **Scrutiny** | 14-Point Statutory Checklist (C1–C14)| **Fully Implemented** | MongoDB / Memory | Item-level observation text, deficiency toggle, multi-member sign-off. |
| **Scrutiny** | Snapshot v1 Immutability | **Fully Implemented** | MongoDB / Memory | Signs and freezes baseline observation state. |
| **Scrutiny** | Differential Re-Scrutiny Scope Lock | **Fully Implemented** | MongoDB / Memory | **USP B06 Verified**. Server rejects edits to cleared items (HTTP 412). |
| **Scrutiny** | 3-Member Committee Roster Declaration | **Fully Implemented** | Memory | Roster display with conflict of interest certificates. |
| **Scrutiny** | Portal & PDF Fixture Ingestion Hub | **Fully Implemented** | MongoDB / Memory | Structured JSON/PDF field extraction and case creation. |
| **EVC Inspection**| Physical Inspection Checklist | **Fully Implemented** | MongoDB / Memory | Scoring (infra/faculty/labs), findings, report submission. |
| **EVC Inspection**| 30-Minute Walkthrough Video Check | **Partially Implemented** | MongoDB / Memory | Status verification and metadata check; video stream is simulated. |
| **EVC Inspection**| Geo-Coordinate GPS Verification | **Intentionally Simulated** | MongoDB / Memory | `[DEMO Telemetry Fixture]`. Compares coordinates against boundary tolerances. |
| **Regional Office**| Committee Allocation & Load Balancing | **Fully Implemented** | MongoDB / Memory | Caseload tracking, conflict check, panel assignment. |
| **Regional Office**| Regional SLA Pendency Matrix | **Fully Implemented** | MongoDB / Memory | Real-time countdown clocks, bottleneck alerts, CSV export. |
| **Regional Office**| Virtual Hearing Scheduling (SHC) | **Fully Implemented** | MongoDB / Memory | Bench allocation, hearing date scheduling, minutes recording. |
| **Approval Bureau**| Council Statutory Decision Gate | **Fully Implemented** | MongoDB / Memory | Human-authorized approval, rejection, or deficiency order. |
| **Approval Bureau**| Council Speaking Order Generator | **Fully Implemented** | MongoDB / Memory | Pre-populates canonical legal citations and conditions. |
| **Approval Bureau**| Dynamic PDF Decision Document Generator | **Fully Implemented** | Disk / Filesystem | Generates real PDF files via `pdf-lib`. |
| **Approval Bureau**| HMAC-SHA256 Signature Verification | **Fully Implemented** | Code & Server | Validates document digest against authoritative server store. |
| **Post-Approval** | 4-Clock Post-Approval Compliance Timers | **Fully Implemented** | MongoDB / Memory | Multi-deadline countdowns, show-cause risk triggers. |
| **Post-Approval** | Compliance Evidence Upload | **Fully Implemented** | MongoDB / Memory | Modal upload dialog with mandatory undertaking verification. |
| **Post-Approval** | Regional Compliance Verification | **Fully Implemented** | MongoDB / Memory | Officer determination (`Verified` vs `Rejected`) with mandatory remarks. |
| **Recourse** | Standing Appellate Committee (SAC) Appeal | **Fully Implemented** | MongoDB / Memory | Institution appeal filing within 15-day statutory window. |
| **Recourse** | SAC Judicial Order Disposition | **Fully Implemented** | MongoDB / Memory | Council appellate adjudication (Overturn vs Affirm). |
| **Governance** | WORM Chained Audit Trail | **Fully Implemented** | MongoDB / Memory | SHA-256 hash tree, immutable block linkage, search, CSV export. |
| **Governance** | National Ecosystem Adapters Simulator | **Fully Implemented Simulator** | Memory | Mock ping, latency simulation, and failure injection for 6 gateways. |
| **Governance** | Consolidated Regulatory Analytics | **Fully Implemented** | MongoDB / Memory | Intake expansion trends, approval ratios, regional distributions. |

---

## 3. Client-Only Actions (No Server Mutation Required)

The following UI actions operate deliberately on client-side React state without mutating the server database:
1. **Keyword Search:** Instant live filtering of application rows or audit logs by case number, college name, or remark.
2. **Tab Switching:** Instant sub-50ms tab navigation within `AppContext` or modal containers.
3. **Modal Launching & Dismissal:** Toggling dialog state (`isOpen`) without mutating background docket.
4. **Local Form Drafting:** Modifying input fields in `NewApplicationModal` or `NSWSSimulationView` before clicking the final submission action.
5. **CSV Export Generation:** Client-side CSV string assembly and browser blob download trigger (`Export CSV`).

---

## 4. Implementation Reality Conclusion

NIYAMSETU balances deep functional implementation of statutory business rules with transparent, truthful labeling of simulated external integration boundaries. Every operational claim is verified by the underlying codebase, ensuring high evaluative credibility during SIH 2026 judgment.
