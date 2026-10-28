# NIYAMSETU — CHAPTER-SPECIFIC APPEALS (STANDING APPELLATE COMMITTEE)
## Statutory Appellate Workflow & 7-Day Statute of Limitations Specification

**Authoritative Sources:**  
1. AICTE Approval Process Handbook (APH 2024–25 to 2026–27) Chapter I §1.11 (p. 14)  
2. AICTE Approval Process Handbook (APH 2024–25 to 2026–27) Chapter II §2.24 (p. 34)  
3. AICTE Approval Process Handbook (APH 2024–25 to 2026–27) Chapter VIII §8.2 (p. 69)  
**Applicability:** Technical Institutions whose applications have been rejected by the Competent Authority under Chapter I or Chapter II

---

## 1. Statutory Grounding & Distinct Appellate Triggers

The right to appeal an adverse regulatory decision is established by statutory law. Chapter I and Chapter II maintain distinct procedural triggers and statutes of limitations:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ APPELLATE TRIGGER DISAMBIGUATION                                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CHAPTER I: NEW INSTITUTIONS (APH §1.11)                                                │
│ • Appellate Trigger: Communication of Letter of Rejection (LoR) or LoD via speed post /│
│   registered email.                                                                    │
│ • Statute of Limitations: Strictly 7 calendar days from the date of communication.     │
│ • Appellate Body: Standing Appellate Committee (SAC) chaired by a Retired High Court   │
│   Judge (§8.2).                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CHAPTER II: EXISTING INSTITUTIONS (APH §2.24)                                          │
│ • Appellate Trigger: The date the adverse decision / rejection is uploaded on the       │
│   AICTE Web Portal.                                                                    │
│ • Statute of Limitations: Strictly 7 calendar days from the date of portal upload.      │
│ • Rejection of Time-Barred Appeals: Appeals submitted after 7 calendar days are         │
│   summarily rejected as time-barred (HTTP 422: APPEAL_TIME_BARRED).                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Standing Appellate Committee (SAC) Workflow Diagram

```mermaid
flowchart TD
    classDef reject fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
    classDef intake fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef committee fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E;
    classDef gate fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#5B21B6;
    classDef success fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    A["Adverse Decision / Rejection Issued<br>Chapter I: LoR Communicated | Chapter II: Uploaded to Portal"]:::reject
    A --> B["Clock 2: Statutory 7-Calendar-Day Appeal Window Active<br>(APH §1.11 & §2.24 Countdown)"]:::intake

    B --> C{"Appeal Filed Within 7 Days?"}
    
    C -- "No (> 7 Calendar Days)" --> D["Appeal Time-Barred<br>HTTP 422: APPEAL_TIME_BARRED; Case Permanently Closed"]:::reject

    C -- "Yes (<= 7 Calendar Days)" --> E["Appeal Admitted & Fee Verified<br>Applicant uploads grounds of appeal and rebuttal evidence"]:::intake

    E --> F["Standing Appellate Committee (SAC) Convened<br>Chaired by Retired High Court Judge (§8.2)"]:::committee

    F --> G["Appellate Oral Hearing & Document Review<br>Evidence strictly restricted to grounds of rejection"]:::committee

    G --> H{"SAC Hearing Recommendation"}
    
    H -- "Rejection Upheld" --> I["SAC Recommends Rejection Confirmation<br>Grounds of rejection reaffirmed"]:::reject

    H -- "Factual Discrepancy (Requires Re-Inspection)" --> J["SAC Remands Case for Re-EVC Visit<br>Special Expert Committee conducts targeted re-visit"]:::committee

    H -- "Grounds of Rejection Disproved" --> K["SAC Recommends Reversal / Approval<br>Recommendations forwarded to Council"]:::success

    J --> L["Re-EVC Report Submitted to SAC"]:::committee
    L --> H

    I --> M["★ Council / Executive Committee Final Decision ★<br>Adjudication under AICTE Act §10/§11"]:::gate
    K --> M

    M --> N{"Final Council Order"}
    N -- "Appeal Dismissed" --> O["Final Rejection Order Issued<br>No further administrative remedy within AICTE"]:::reject
    N -- "Appeal Allowed" --> P["Letter of Approval / EoA Released<br>Spawns applicable Joint FDR & post-approval obligations"]:::success
```

---

## 3. Strict Enforcement of the 7-Day Statute

In [`tests/production_persistence_idempotency.test.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/tests/production_persistence_idempotency.test.ts) and [`server/routes/appealsAndHearingsRoutes.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/server/routes/appealsAndHearingsRoutes.ts):
- When an applicant submits an appeal, the server calculates:
  `elapsedDays = (submissionTimestamp - rejectionUploadedTimestamp) / (1000 * 60 * 60 * 24)`
- If `elapsedDays > 7.0`, the API immediately rejects the request:
  ```json
  {
    "success": false,
    "error": {
      "code": "APPEAL_TIME_BARRED",
      "message": "Statutory appeal window has expired. Appeals must be filed within strictly 7 calendar days under APH §1.11 / §2.24."
    }
  }
  ```
- This prevents arbitrary administrative extensions and guarantees strict adherence to the Supreme Court mandated academic calendar cutoff.
