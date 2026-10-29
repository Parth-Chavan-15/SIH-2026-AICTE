# NIYAMSETU (नियमसेतु) — Comprehensive UX Redesign & Architectural Decisions

**Project:** NIYAMSETU (AICTE PS 26262)  
**Date:** 2026-10-29  
**Guiding Principle:** *"Simplify presentation, not the product. A simpler interface over a complete, coherent workflow engine."*  

---

## 1. Summary of Major Architectural & UX Redesign Decisions

| Area | Before Redesign | After Redesign | Substantive Improvement |
| :--- | :--- | :--- | :--- |
| **Case Dossier (Dossier View)** | 1,613-line modal with 4 nested scroll containers, 8 simultaneous action buttons, and a hardcoded universal 5-stage stepper. | Clean, lifecycle-first hierarchy: Compact Identity $\to$ Prominent Route Banner $\to$ Route-Specific Dynamic Lifecycle $\to$ Single Primary Action. | Immediate clarity: user instantly knows *what case this is, which route it follows, where it is now, and what they are permitted to do*. |
| **Lifecycle Pipeline** | Static 5-step progress rail shown identically for all cases, even when EVC or scrutiny is bypassed. | **Route-Specific Dynamic Lifecycle Engine**: dynamically generates stages matching the application's actual route (Fast-Track EoA, Scrutiny Only, Scrutiny+EVC, EVC+SAC, Only EVC). | Accurately depicts skipped stages (e.g. NBA Tier-1 waiver), conditional stages, and exceptional appellate branches. |
| **Action Hierarchy** | 5 to 8 competing primary buttons (`Accept`, `Flag Deficiency`, `Reject`, `Revert`, `5 Notices`, `Route Rules`) competing for attention. | **One Clear Primary Next Action** tailored to current role and case state. Secondary operations consolidated into clean contextual menus. | Eliminates cognitive overload; prevents unauthorized or premature state transitions. |
| **NSWS Intake Simulation** | 5 cluttered screens with mock OTP verification and contradictory red/green banners during DSC failure. | Streamlined 5-step conceptual journey (Identity $\to$ DSC $\to$ App Details $\to$ Route Eval $\to$ Submit & Dossier Hand-off) with college quick-fill presets. | Clear demonstration of external integration boundaries; eliminates conflicting status messages. |
| **Role Workspace Separation** | Shared screens with visible but disabled controls; risk of applicant seeing confidential committee deliberations. | **Strict Task-Oriented Workspaces**: Applicant views completely conceal internal scoring and draft orders. Authority views focus on queues and adjudication. | Preserves natural justice, role security, and interface confidentiality. |
| **Design System & Density** | Dense card-in-card layout with repeated metadata (case ID, status, and dates repeated up to 4 times per view). | Restrained government aesthetic, high-contrast typography, single outer scroll, consistent status semantics. | Professional, accessible, and responsive across 1920×1080, 1366×768, and 1024px displays. |

---

## 2. Deep Dive: Case Dossier Redesign (Part 4)

### 2.1 The Visual Hierarchy Stack
The redesigned Case Dossier establishes a clear top-down visual hierarchy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. COMPACT CASE IDENTITY HEADER                                             │
│    Institution Name • PID • App Number • Category • AY 2026–27 • State Badge │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PROMINENT ROUTE SUMMARY & RULE DISCLOSURE                                │
│    Selected Route: [Scrutiny + EVC] • Governing APH Clause • [Why this route?]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ROUTE-SPECIFIC DYNAMIC LIFECYCLE RAIL                                    │
│    [App Submitted] ──> [Scrutiny] ──> [EVC Inspection] ──> [Council Gate]   │
│    (Visually marks: Completed, Active Pulse, Upcoming, Bypassed, Reverted)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ROLE-AWARE ACTION CONSOLE (Single Primary Action)                        │
│    Reviewer: [Sign Scrutiny Snapshot v1] • More Actions ▼ [Revert, Reject]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. CONSOLIDATED CONTENT TABS                                                │
│    [📋 Overview & Facts]  [📁 Documents]  [🚁 Telemetry]  [📜 Audit & Orders]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dynamic Lifecycle Rendering Logic
Instead of rendering a fixed 5-step array, the lifecycle component evaluates the case's statutory route:
1. **Self-Disclosure Fast-Track EoA (Table 2.3 Row 1)**:
   `Application Submitted` $\to$ `Executive Committee Approval` $\to$ `Approval Issued (EoA)`  
   *(Desk Scrutiny and EVC explicitly marked as `BYPASSED — Self-Disclosure Renewal`)*
2. **Scrutiny Only (NBA Fast-Track §2.6(c)(1))**:
   `Application Submitted` $\to$ `Desk Scrutiny` $\to$ `Executive Committee Approval` $\to$ `Approval Issued`  
   *(EVC inspection explicitly marked as `WAIVED — NBA Tier-1 Valid till 2028`)*
3. **Scrutiny + Physical EVC (Intake Surge)**:
   `Application Submitted` $\to$ `Desk Scrutiny` $\to$ `EVC Physical Inspection (500m Geo)` $\to$ `Council Gate` $\to$ `Approval Issued`
4. **Direct Physical EVC (Restoration / Site Shifting §2.16.1)**:
   `Application Submitted` $\to$ `Mandatory Physical EVC` $\to$ `Council Gate` $\to$ `Approval Issued`  
   *(Preliminary Desk Scrutiny marked as `WAIVED — Direct Physical Verification`)*
5. **Exceptional Hearing Branches (SAC / SHC / Chapter VII)**:
   When shortcomings or rejection occur, a decoupled quasi-judicial branch is highlighted (`SHC Compliance Hearing §2.23.3` or `SAC Appellate Tribunal §1.11`).

---

## 3. Deep Dive: NSWS Simulation Redesign (Part 6)

### 3.1 Five-Step Conceptual Flow:
1. **Step A: Institution Identity**: One-click selection among the 5 canonical benchmark institutions (COEP, GIITS, PDIMTR, APEX, BATU) or custom input. Pre-populates validated PAN, CIN, and authorized signatory details.
2. **Step B: Class-3 DSC Verification**:
   - Explicitly displays `[SIMULATION: emBridge USB Token Gateway]`.
   - Conditional gate: required for New Institution / Intake Surge; marked `OPTIONAL / WAIVED` for routine self-disclosure renewals.
   - Deterministic test choices: `ePass2003Auto (Valid)`, `WatchKey (Valid)`, `Expired Certificate (Simulate 422 Rejection)`, or `Unsigned Document`.
3. **Step C: AICTE Application Parameters**:
   - Captures only route-relevant facts: Category, Program, Level, Existing Intake, Proposed Intake, NBA Accreditation Status, NBA Score, and Region.
4. **Step D: Dynamic Statutory Route Evaluation**:
   - Executes the authoritative backend route engine directly.
   - Displays real-time verdict, applicable APH rule version (`v2026.1`), and clear explanation before submission.
5. **Step E: Persisted Hand-off to NIYAMSETU**:
   - Displays clear confirmation and persists application directly into MongoDB Atlas / transactional store.
   - Provides one-click action: `"Open Case in Dossier Workspace"`.

---

## 4. Deep Dive: Role-Based Workspace Refinement (Part 5)

1. **Applicant Workspace (Role 1)**:
   - Simplified navigation: `My Applications`, `NSWS Onboarding`, `Deficiency Cure Window`, `Decision Letters`, `SAC Appeals`, `Post-Approval Obligations`, `Alerts`.
   - Stripped of internal committee voting buttons and reviewer evaluation forms.
2. **Scrutiny Reviewer Workspace (Role 2)**:
   - Focused on the verification checklist and Snapshot v1 generation.
   - Enforces Differential Scope-Lock (§1.8(g)): cleared items are read-only; flagged deficiencies editable.
3. **EVC Panel Workspace (Role 3)**:
   - Focused on campus inspection scheduling, 500m geo-fencing telemetry, and 30-min continuous walkthrough video upload verification.
4. **Regional Office Desk (Role 4)**:
   - Workload balancer across 4 regional groups, 10d/15d pendency tracking, and authorized stage revert console.
5. **Competent Authority Chamber (Role 5)**:
   - Human-authorized decision gate with Speaking Order generator and digital certificate signing verification.
6. **Central Policy Administrator (Role 6)**:
   - Active rules registry, handbook version pinning, and immutable WORM audit ledger inspector.
