# NIYAMSETU — CHAPTER II: SCRUTINY & EVC REGULATORY ROUTES
## Statutory Workflow Specification for Variations, Expansions & Relocations

**Authoritative Source:** AICTE Approval Process Handbook (APH 2024–25 to 2026–27) Chapter II (§2.6–§2.20, pp. 20–30), Table 2.3 & AY 2026–27 Addendum Item 16  
**Category Scope:** Existing Technical Institutions applying for Increase in Intake, Additional Courses, Campus Relocation, Break-in-EoA Restoration, or Administrative Restructuring  
**Governing Code Module:** [`src/backend/policy/dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts)

---

## 1. Regulatory Route Classification Matrix

Applications under Chapter II require distinct evaluation pathways depending on the statutory risk profile of the request:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHAPTER II VARIATION PATHWAYS (Table 2.3 & Addendum 2026–27)                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PATH A: INTAKE EXPANSION WITH VALID NBA ACCREDITATION (>=50% Courses)                  │
│ • Statutory Basis: Addendum 2026–27 Item 16 / Clause 2.6(c)(1) & Table 2.3 Row 9       │
│ • Processing: Desk Scrutiny Only (Fast-Track); Physical EVC is EXPLICITLY WAIVED       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PATH B: INTAKE EXPANSION WITHOUT VALID NBA ACCREDITATION                               │
│ • Statutory Basis: APH 2024–27 Table 2.3 Row 9 & Clause 2.6(c)(1)(e)-(f)               │
│ • Processing: Sequential Desk Scrutiny followed by mandatory Physical EVC Inspection   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PATH C: CAMPUS SITE RELOCATION OR BREAK-IN-EOA RESTORATION                             │
│ • Statutory Basis: APH 2024–27 Table 2.3 Rows 7 & 14, Clauses 2.16.1(c) & 2.17(e)      │
│ • Processing: Bypasses Desk Scrutiny; Proceeds DIRECTLY to On-Site Physical EVC        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PATH D: ADMINISTRATIVE MODIFICATIONS (Name Change, Merger, Closure, Reduction)         │
│ • Statutory Basis: APH 2024–27 Table 2.3 Rows 4, 6, 12, 15, 17                         │
│ • Processing: Desk Scrutiny Only; Physical EVC is NOT APPLICABLE                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Integrated Scrutiny & EVC Workflow Diagram

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef bypass fill:#F3F4F6,stroke:#9CA3AF,stroke-width:1.5px,stroke-dasharray: 4 4,color:#4B5563;

    A["1. Application Ingestion (NSWS / AICTE Portal)<br>Evaluates facts: Category, NBA Accreditation, Site Details"]:::intake
    A --> B{"Dynamic Route Engine Classification"}

    %% Path C: Site Shifting / Break-in-EoA
    B -- "Campus Relocation / Break-in-EoA<br>(Table 2.3 Rows 7, 14)" --> C1["Desk Scrutiny BYPASSED<br>Proceeds directly to physical check"]:::bypass
    C1 --> EVC["3. Physical EVC Inspection<br>On-site GPS geo-fence & laboratory verification"]:::committee

    %% Path A & B & D
    B -- "Intake Expansion or Admin Mod" --> SCRUT["2. Desk Scrutiny Committee<br>C1–C6 Digital Checklist Evaluation"]:::committee

    SCRUT --> DEF{"Checklist Deficiencies Flagged?"}
    
    DEF -- "Yes (D1 Flagged)" --> RESCRUT["★ Differential Scope-Locked Re-Scrutiny ★<br>Previously cleared items locked with immutable hash (HTTP 409)<br>Applicant cures only deficient items"]:::committee

    RESCRUT --> CURE{"Deficiency Resolved?"}
    CURE -- "No (Persistent Shortcomings)" --> SHC["Standing Hearing Committee (SHC)<br>Referred under APH §2.23.3"]:::reject
    CURE -- "Yes (Rectified)" --> POST_SCRUT{"Application Sub-Category?"}
    DEF -- "No (Clean Scrutiny)" --> POST_SCRUT

    %% Sub-Routing after Scrutiny
    POST_SCRUT -- "Admin Mod (Name/Closure)<br>(Table 2.3 Rows 4, 12, 15)" --> AUTH_GATE["★ 4. Council Decision Gate ★<br>Human Competent Authority (Role 5)"]:::gate
    
    POST_SCRUT -- "Intake Increase with >=50% NBA<br>(Addendum Item 16 / §2.6(c)(1))" --> NBA_BYPASS["★ Fast-Track Clearance ★<br>Physical EVC visit explicitly waived"]:::bypass
    NBA_BYPASS --> AUTH_GATE

    POST_SCRUT -- "Intake Increase without NBA<br>(Table 2.3 Row 9)" --> EVC

    EVC --> EVC_CHECK{"EVC Inspection Result?"}
    EVC_CHECK -- "Severe Infrastructure Deficit" --> SHC
    EVC_CHECK -- "Satisfactory Report" --> AUTH_GATE

    SHC --> SHC_REC{"SHC Recommendation"}
    SHC_REC -- "Grant Conditional Approval" --> AUTH_GATE
    SHC_REC -- "Reject / Issue Show Cause" --> REJECT["5. Letter of Rejection (LoR) Issued<br>7-Day SAC Appeal Window Activated (§2.24)"]:::reject

    AUTH_GATE --> APPROVE["6. Extension of Approval (EoA) Granted<br>Post-approval obligations spawned from order conditions"]:::success
```

---

## 3. Product Safeguards in Action

1. **Differential Scope-Lock Enforcement:**  
   Once Scrutiny clears an item (e.g. Land or Built-up Area), its state is cryptographically locked with an SHA-256 hash snapshot. During re-scrutiny, if an officer attempts to reopen a cleared item, [`validateCorrections()`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/modules/scrutiny/validateCorrections.ts) rejects the request with **HTTP 409 Conflict**.
2. **Deterministic NBA Fast-Track Evaluation:**  
   The system queries verified accreditation records. If eligible courses have >=50% NBA accreditation valid through April 30 of the academic year, physical EVC scheduling is locked in bypassed state.
3. **Internal SLA Timers vs Statutory Windows:**  
   - Scrutiny turnaround: 10 working days (Internal Operational SLA).
   - Re-scrutiny cure turnaround: 10 working days (Internal Operational SLA).
   - Joint FDR submission: Strictly 15 calendar days from approval intimation (Statutory §2.25(f) requirement).
