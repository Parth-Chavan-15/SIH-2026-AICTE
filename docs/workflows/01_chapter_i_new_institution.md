# NIYAMSETU — CHAPTER I: GRANT OF APPROVAL FOR NEW TECHNICAL INSTITUTION
## Statutory Regulatory Workflow Specification

**Authoritative Source:** AICTE Approval Process Handbook (APH 2024–25 to 2026–27) Chapter I (§1.1–§1.11, pp. 1–14) & Annexure 7  
**Category Scope:** Setting up a New Technical Institution (Diploma / Degree / Post-Graduate / Standalone)  
**Excluded Scope:** Existing technical institutions applying for Extension of Approval (EoA) or intake variations (governed strictly by Chapter II)

---

## 1. Regulatory Context & Procedural Rules

Under Chapter I of the AICTE Approval Process Handbook, establishing a new technical institution is a multi-tier statutory process with mandatory sequential stages:
1. **Intake & Verification:** Applications submitted through the National Single Window System (NSWS) or AICTE Web Portal are verified for permanent Land, Registered Trust/Society deeds, Bank Guarantees, and NOC from State Government and Affiliating University.
2. **Desk Scrutiny:** Evaluated by a Scrutiny Committee comprising senior academic experts and an advocate. Evaluates Land area, Land use certificate, Building plans, Barrier-free environment, and Financial stability.
3. **Deficiency Communication (LoD):** If deficiencies are identified, an official **Letter of Deficiency (LoD)** is issued. The applicant is granted an opportunity to submit rectifications during **Differential Re-Scrutiny**, where previously cleared items are strictly scope-locked.
4. **Mandatory Physical EVC:** Unlike existing institutions where EVC may be waived for accredited programs, **all new institutions must undergo an on-site physical inspection by an Expert Visit Committee (EVC)** to verify infrastructure, laboratories, and physical readiness.
5. **Council Adjudication:** Recommendations of Scrutiny and EVC are placed before the Executive Committee / Council for final determination under Sections 10 and 11 of the AICTE Act, 1987.
6. **Decision Outcomes:**
   - **Letter of Approval (LoA):** Issued only after Council decision and verified deposit of the prescribed Joint Fixed Deposit Receipt (FDR) in favor of AICTE and Society for 10 years, accompanied by Affidavit-3 (§1.9/§1.10).
   - **Letter of Rejection (LoR):** If rejected, the applicant has a statutory right to appeal before the Standing Appellate Committee (SAC) within **7 calendar days** of communication (§1.11).

---

## 2. Chapter I Regulatory Workflow Diagram

```mermaid
flowchart TD
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef appeal fill:#FFFBEB,stroke:#B45309,stroke-width:1.5px,stroke-dasharray: 4 4,color:#78350F;

    A["1. National Portal Intake (NSWS / AICTE)<br>ARN Generation & Canonical Schema Validation"]:::intake
    A --> B["2. Desk Scrutiny Committee (Annexure 7)<br>Verifies Land, Building Plans, NOC & Affidavits"]:::committee

    B --> C{"Checklist Deficiencies Flagged?"}
    
    C -- "Yes (Deficiencies Found)" --> D["3. Letter of Deficiency (LoD) Issued<br>Deficiencies intimated to applicant"]:::reject
    D --> E["4. Scope-Locked Re-Scrutiny<br>Cleared items locked (HTTP 409); cure evaluated"]:::committee
    E --> F{"Re-Scrutiny Clearance?"}
    F -- "Rejected / Incurable" --> G["5. Letter of Rejection (LoR) Issued<br>Grounds of rejection formally communicated"]:::reject

    C -- "No (Compliant)" --> H["6. Mandatory Physical EVC Inspection<br>On-site campus verification (GPS, Labs, Infrastructure)"]:::committee
    F -- "Compliant" --> H

    H --> I{"EVC Inspection Findings?"}
    I -- "Severe Deficiencies" --> G
    I -- "Satisfactory / Rectified" --> J["7. Regional Office Review & Executive Summary<br>Dossier consolidated for Competent Authority"]:::intake

    J --> K["★ 8. Council / Executive Committee Decision Gate ★<br>Human Authority sign-off under AICTE Act §10/§11"]:::gate

    K --> L{"Council Adjudication"}
    L -- "Rejected" --> G
    L -- "Sanctioned Approval" --> M["9. Statutory Security Deposit Gate (§1.9/§1.10)<br>Submission of 10-Yr Joint FDR & Affidavit 3"]:::gate

    M --> N["10. Letter of Approval (LoA) Issued<br>Digital order served to 6 statutory authorities"]:::success
    N --> O["11. Post-Approval Compliance Tracking<br>Permanent building NOC & infrastructure obligations"]:::success

    G -.-> P["Standing Appellate Committee (SAC) Appeal<br>Strictly 7 Calendar Days from LoR Communication (§1.11)"]:::appeal
    P -.-> Q{"SAC Recommendation"}
    Q -.->|Remand for Re-EVC| H
    Q -.->|Upheld / Final Rejection| R["Final Legal Rejection"]:::reject
    Q -.->|Reversal Approved| M
```

---

## 3. Key Distinctions from Chapter II

| Distinction Category | Chapter I (New Institutions) | Chapter II (Existing Institutions) |
|---|---|---|
| **EVC Requirement** | **Mandatory 100% on-site physical inspection** for all applications; no exceptions. | Conditional under Table 2.3; **Fast-Track EVC waiver** for institutions with >=50% NBA-accredited courses. |
| **Decision Order** | **Letter of Approval (LoA)** granting initial establishment. | **Extension of Approval (EoA)** renewing operational approval for the academic year. |
| **Security Deposit** | Joint FDR for **10 years** in favor of AICTE and Society (§1.9/§1.10). | Joint FDR required only for new programs or intake expansion (§2.25(f)). |
| **Deficiency Intimation** | Formally issued as a **Letter of Deficiency (LoD)** under Annexure 7. | Deficiency notice issued online through portal dashboard under §2.14. |
| **Appellate Statutory Trigger** | 7 calendar days from the date of communication of rejection letter (§1.11). | 7 calendar days from the date the rejection decision is uploaded to the AICTE portal (§2.24). |
