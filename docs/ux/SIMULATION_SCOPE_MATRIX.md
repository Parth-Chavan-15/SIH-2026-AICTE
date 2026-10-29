# NIYAMSETU (नियमसेतु) — Simulation Scope & External Integration Matrix

**Project:** NIYAMSETU (AICTE PS 26262)  
**Primary Reference:** `AICTE Approval Process & NSWS Portal Registration Guide(1).pdf` (54-page walkthrough)  
**Official Verification Sources:**
- National Single Window System (NSWS) User Guide: `https://www.nsws.gov.in/portal/user-guide`
- NSWS DSC & PAN Verification Guidelines: `https://www.nsws.gov.in/faqs`
- AICTE Approval Process Handbook (APH 2024–27) & Errata G02 p. 42  

---

## 1. Principles of Prototype Simulation Discipline

During hackathon demonstrations, presenting an entire simulated alternative portal or collecting irrelevant personal data obscures the core product innovation. NIYAMSETU enforces strict simulation discipline:

1. **Demonstrate Integration Boundaries, Not Alternative Portals**:
   - NIYAMSETU models the *interface* between external government registries (NSWS, API Setu, Siebel) and its internal rule engines. It does not reproduce all 54 screens of NSWS registration.
2. **Transparent Labelling**:
   - Every simulated operation is explicitly marked with `[SIMULATION]` badges to prevent misrepresentation to evaluators.
3. **Safe Synthetic Credentials**:
   - Never solicit real PANs, passwords, biometric tokens, or private keys. All demo data is pre-seeded with canonical institutional records (COEP, GIITS, PDIMTR, APEX, BATU).
4. **Deterministic Failure & Conditional Paths**:
   - Support realistic edge cases (e.g. expired DSC token returns `422`, missing accreditation routes to physical EVC, intake $>360$ triggers policy hold).

---

## 2. Exhaustive Simulation Inventory & Scope Matrix

| Simulation Flow | External Process Ref | Real World Operation | NIYAMSETU Prototype Scope | Redesign Action & Justification |
| :--- | :--- | :--- | :--- | :--- |
| **SIM-01: NSWS Account & KYC** | 54-pg Guide pp. 2–16; NSWS PAN Guide | Investor registers on NSWS with corporate email, OTP verification, CBDT PAN validation, CIN/Trust lookup. | Captures compact identity (PAN, Signatory Name, Email, Region). Pre-fills safe defaults for 5 colleges. | **Consolidate**: Eliminate multi-step password & dummy OTP screens into a unified Step A identity context card. |
| **SIM-02: Class-3 DSC / emBridge** | 54-pg Guide pp. 17–28; CCA Guidelines | Local emBridge service interacts with USB crypto-token (ePass2003Auto/WatchKey) to sign payload. | Mock gateway (`/api/v1/adapter/dsc-verify`). Verifies token type, signatory match, and validity. | **Condition & Label**: Explicitly label as `Hardware Token Simulation`. Make DSC conditional (waived for simple EoA). |
| **SIM-03: AICTE Form Intake** | 54-pg Guide pp. 29–48; APH Table 2.3 | Applicant inputs 10+ tabs of land, building, faculty, academic, and financial proformas. | Inputs critical route-driving parameters: Category, Level, Program, Existing vs Proposed Intake, NBA Status & Score. | **Focus**: Restrict fields strictly to those consumed by the APH Table 2.3 Route Engine. |
| **SIM-04: Dynamic Route Engine** | APH 2024–27 Table 2.3 & Errata G02 p. 42 | Internal AICTE Approval Bureau committee assigns statutory path based on rules. | **Live Real Execution**: Calls pure deterministic route engine (`src/backend/policy/engine.ts`). Returns route & explanation. | **Elevate**: Make the route decision and "Why this route?" prominent before submission. |
| **SIM-05: Case Persistence & Hand-off** | AICTE Siebel CRM Dispatch | NSWS pushes application via API to Siebel CRM backend; generates PID and Application No. | **Live Real Execution**: Persists real case in MongoDB Atlas / transactional store; generates unique ID (`APP-2026-XXXX`). | **Direct Navigation**: Automatically transitions user into the redesigned Case Dossier with initial milestone active. |
| **SIM-06: API Setu Registry Lookup** | API Setu / Digilocker Gateway | Queries NBA, NAAC, and NIRF repositories for accreditation dates and scores. | Simulated adapter returning verified accreditation payload or expired status. | **Contextual Access**: Surface inside Route Engine explanation drawer rather than separate disconnected page. |
| **SIM-07: Committee Auto-Selection** | AICTE Expert Empanelment Norms | Algorithms pick 3 experts without conflict of interest from regional roster. | Automated group allocation across 4 Regional Office groups in Western Region. | **Task-Focused**: Maintain in Regional Office Allocation view (`ROAllocationView.tsx`). |
| **SIM-08: DTE / University Concurrence** | APH §2.19(c) | 15-day statutory clock for State Higher Education Dept and Affiliating Univ to issue NOC. | Countdown timer displaying remaining days and deemed concurrence status on expiry. | **Preserve**: Keep countdown active in Regional Office Pendency view; suppress on manual NOC upload. |
| **SIM-09: Outbox Dispatch Simulation** | National SMS / Email Gateway | Sends official notices and SMS alerts to authorized signatories. | Atomic write to `core_outbox` table with delivery status and attempt timestamps. | **Preserve**: Maintain in system audit view; do not falsely claim SMS was physically transmitted. |

---

## 3. Redesigned NSWS / AICTE 5-Step Conceptual Journey

The redesigned intake flow in [`NSWSSimulationView.tsx`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/features/nsws/NSWSSimulationView.tsx) follows a cohesive 5-step progression:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 5-STEP STREAMLINED INTAKE JOURNEY                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ STEP A: Institution Identity & NSWS Context                                 │
│         Select canonical institution (COEP, GIITS, PDIMTR, APEX, BATU).     │
│         Pre-fills validated PAN, signatory name, and NSWS reference.       │
│                                                                             │
│ STEP B: Authorised Signatory & DSC Verification (Conditional)               │
│         Demonstrates Class-3 USB token verification.                        │
│         Conditional: Required for New Inst / Intake Surge; optional for EoA.│
│                                                                             │
│ STEP C: Academic Program & Intake Configuration                             │
│         Select technical program, course level, and proposed intake seats. │
│         Toggle NBA Tier-1 accreditation and enter assessment score.        │
│                                                                             │
│ STEP D: Dynamic Statutory Route Evaluation (APH Table 2.3)                  │
│         Real-time engine execution. Computes route, EVC mandate/waiver,     │
│         and regulatory rule citations with "Why this route?" disclosure.    │
│                                                                             │
│ STEP E: Submission Confirmation & Case Dossier Hand-off                     │
│         Summarizes case facts; writes through to MongoDB Atlas / Store;     │
│         Navigates user directly to active Case Dossier.                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Contradictory State Guardrails:
- **No Conflicting Banners**: The previous UI occasionally displayed a red "DSC Verification Failed" error banner while simultaneously rendering a green "Registration Succeeded" block. In the redesign, step advancement is strictly blocked on failure, and failure displays an actionable retry state with clear diagnostic guidance.
- **Explicit Simulation Disclosures**: Prominently displays:  
  *`"SIMULATION ENVIRONMENT — Demonstrates NSWS-to-AICTE integration hand-off for SIH 2026. External portal communication is simulated; internal route determination and case persistence are live."`*
