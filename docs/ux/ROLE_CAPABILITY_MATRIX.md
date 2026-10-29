# NIYAMSETU (नियमसेतु) — Role-Based Capability & Authorization Matrix

**Project:** NIYAMSETU (AICTE PS 26262)  
**Security Standard:** Strict Tenant Isolation, Principle of Least Privilege, Natural Justice Safeguards  
**Backend Authority Gate:** `src/backend/security/authorization.ts` & `identity.ts`  

---

## 1. Overview of Personas & System Boundaries

NIYAMSETU strictly segregates responsibilities across six official regulatory roles. An action is never permitted purely because a button is visible; every mutation is guarded at the HTTP gateway by signed session claims, tenant scope matching, and granular permission strings.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REGULATORY ROLES HIERARCHY                        │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│ ROLE 1: APPLICANT        │ ROLE 2: SCRUTINY CELL    │ ROLE 3: EVC PANEL     │
│ Institution Signatory    │ Desk Document Verifier   │ On-Site GPS Inspector │
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ ROLE 4: REGIONAL DESK    │ ROLE 5: COMPETENT AUTH   │ ROLE 6: POLICY ADMIN  │
│ Operations & Allocation  │ Approval Bureau Chamber  │ Handbook Engine Admin │
└──────────────────────────┴──────────────────────────┴───────────────────────┘
```

---

## 2. Granular Role-Capability Matrix

### Role 1: Technical Institution Signatory (`institution`)
- **Default Actor ID**: `usr-inst-coep` / `usr-inst-giits` / `usr-inst-pdimtr` / `usr-inst-apex` / `usr-inst-batu`
- **Assigned Workspace**: Applicant Portal
- **Permitted Tabs**:
  1. `inst-apps` (My Applications & Live Status)
  2. `inst-nsws` (NSWS Onboarding & Dynamic Route Simulation)
  3. `inst-deficiencies` (Annexure 7 Deficiency Rectification Window)
  4. `inst-decision-docs` (Official Decision Letters: LoA / EoA / LoR)
  5. `appeals-hearings` (Filing SAC Appeals & Citizen Complaints)
  6. `inst-renewals` (Post-Approval Compliance & Lease Tracking)
  7. `notifications` (Statutory Notices & Action Reminders)
- **Data Readable**: Own institution's applications, deficiency communications, issued orders, post-approval obligations.
- **Data Creatable/Submittable**: New application intake payload via NSWS hand-off, deficiency resolution proofs (Annexure 7), SAC appeal petitions, post-approval FDR/Affidavit-3 documents.
- **Data Editable**: Draft applications and flagged deficiency responses.
- **Decisions Recommended/Recorded**: NONE (Cannot self-adjudicate).
- **Permitted State Transitions**: `draft` $\to$ `submitted`; `correction_required` $\to$ `rescrutiny_pending`.
- **Explicit Prohibitions**:
  - Legally prohibited from viewing internal committee deliberative notes, confidential evaluator scores, or draft speaking orders.
  - Legally prohibited from modifying checklist items marked `VERIFIED` in initial scrutiny (enforced by Differential Scope-Lock HTTP 409).
  - Strictly blocked by tenant isolation middleware (`src/backend/security/authorization.ts`) from accessing cases of other colleges.
- **Backend Permissions Enforcing**: `case.create`, `case.read:own`, `evidence.submit`, `appeal.file`.

---

### Role 2: Desk Scrutiny Committee Cell (`reviewer`)
- **Default Actor ID**: `usr-scrutiny-reviewer`
- **Assigned Workspace**: Scrutiny Committee Workspace
- **Permitted Tabs**:
  1. `scrutiny-eval` (Initial Checklist Verification & Snapshot v1)
  2. `scrutiny-rescrutiny` (Differential Scope-Locked Re-Scrutiny §1.8(g))
  3. `scrutiny-portal-import` (Portal Report Ingestion)
  4. `scrutiny-committee` (Expert Panel Declarations & Roster)
  5. `scrutiny-queue` (All Scrutiny Dossiers)
  6. `notifications` (Scrutiny SLA Watches)
- **Data Readable**: Full documentary evidence for applications assigned to Scrutiny group.
- **Data Creatable/Submittable**: Scrutiny Snapshot v1, deficiency notices (Annexure 7), re-scrutiny verification records.
- **Data Editable**: Checklist item status (`accepted` or `deficient`) with narrative remarks.
- **Decisions Recommended/Recorded**: Scrutiny Recommendation (`Recommended for EVC`, `Recommended for Council Approval`, or `Deficiencies Communicated`).
- **Permitted State Transitions**: `submitted` $\to$ `scrutiny_pending` $\to$ `correction_required` OR `rescrutiny_pending` $\to$ `evc_pending` / `decision_pending`.
- **Explicit Prohibitions**:
  - Cannot alter previously accepted checklist items during re-scrutiny (enforced by `validateCorrections.ts`).
  - Cannot schedule physical EVCs or issue final Letters of Approval.
- **Backend Permissions Enforcing**: `scrutiny.evaluate`, `scrutiny.sign_snapshot`, `scrutiny.rescrutiny`.

---

### Role 3: Expert Visit Committee (EVC) Inspection Panel (`evc`)
- **Default Actor ID**: `usr-evc-chair`
- **Assigned Workspace**: EVC Committee Workspace
- **Permitted Tabs**:
  1. `evc-inspect` (Campus Inspections, GPS Coordinates, 30-min Video Telemetry)
  2. `evc-reports` (Signed Physical Inspection Reports §1.9)
  3. `notifications` (EVC Schedule Reminders)
- **Data Readable**: Institutional infrastructure details, approved site drawings, previous scrutiny reports.
- **Data Creatable/Submittable**: Geo-fenced coordinates verification, 30-minute walkthrough video audit record, committee evaluation scores.
- **Data Editable**: Infrastructure deficiency markings and committee narrative summary.
- **Decisions Recommended/Recorded**: EVC Recommendation (`Recommended`, `Conditional`, or `Not Recommended`).
- **Permitted State Transitions**: `evc_pending` $\to$ `evc_scheduled` $\to$ `decision_pending` (or `sac_shc_review` if severe violations observed).
- **Explicit Prohibitions**:
  - Cannot self-mandate an inspection without Regional Office / Council allocation.
  - Cannot issue final approvals or modify desk scrutiny documentary findings.
- **Backend Permissions Enforcing**: `evc.telemetry_submit`, `evc.report_sign`.

---

### Role 4: Regional Office Operations Desk (`regional_officer`)
- **Default Actor ID**: `usr-ro-western`
- **Assigned Workspace**: Regional Operations & Pendency Workspace
- **Permitted Tabs**:
  1. `ro-allocation` (Committee Allocation & Group Workloads)
  2. `ro-pendency` (Regional Pendency Matrix & 10d/15d SLA Timers)
  3. `ro-appeals-hearings` (Standing Hearing Committee Desk & Complaints Inquiries)
  4. `ro-obligations` (4-Clock Timers & Registered Lease Verification)
  5. `notifications` (Regional Escalations & Alerts)
- **Data Readable**: All regional cases across Western Region (COEP, PDIMTR, BATU, etc.), pendency telemetry, committee workloads.
- **Data Creatable/Submittable**: Group allocations, authorized stage reverts (with mandatory written reason), post-approval lease/FDR verification records.
- **Data Editable**: Committee assignments and verified obligation statuses.
- **Decisions Recommended/Recorded**: Endorsement of scrutiny and EVC reports to Approval Bureau.
- **Permitted State Transitions**: Authorized Revert per APH §1.8(f)-(g) (e.g. `evc_pending` $\to$ `submitted` with audit logging); obligation closure.
- **Explicit Prohibitions**:
  - Cannot record final Council decisions (`APPROVED` / `REJECTED`).
  - Cannot access institutions outside the assigned regional jurisdiction.
- **Backend Permissions Enforcing**: `case.revert`, `allocation.assign`, `compliance.verify`, `ro.monitor`.

---

### Role 5: Competent Authority / Approval Bureau (`bureau_officer` / `demo_authority`)
- **Default Actor ID**: `usr-bureau-hq`
- **Assigned Workspace**: Council Executive Committee Chamber
- **Permitted Tabs**:
  1. `ca-decision` (Statutory Decision Gate APH §1.10 — Human Adjudication)
  2. `ca-decision-docs` (Official Decision Letters & Digital Signature Verification)
  3. `ca-appeals` (Standing Appellate Committee Final Dispositions)
  4. `notifications` (National Escalations & Critical Alerts)
- **Data Readable**: National consolidated dossiers across all regions, full evidentiary history, audit logs.
- **Data Creatable/Submittable**: Formal Speaking Orders, Council Approval Resolutions, Conditional Approval Stipulations.
- **Data Editable**: Council outcome (`APPROVED`, `CONDITIONAL_APPROVED`, `REJECTED`) and specific order conditions.
- **Decisions Recommended/Recorded**: Final Competent Authority Decision (AICTE Act 1987 §10k).
- **Permitted State Transitions**: `decision_pending` $\to$ `approved` / `conditionally_approved` / `rejected`.
- **Explicit Prohibitions**:
  - Cannot bypass statutory scrutiny or EVC prerequisites unless explicitly exempted by handbook rule (e.g. NBA Tier-1).
  - Cannot delegate final decision authority to automated agents.
- **Backend Permissions Enforcing**: `decision.record`, `decision.sign_pdf`, `sac.dispose`.

---

### Role 6: Central Policy Administrator (`policy_admin`)
- **Default Actor ID**: `admin@aicte.gov.in`
- **Assigned Workspace**: Central Policy Administration
- **Permitted Tabs**:
  1. `admin-policy` (Active Rules Registry & Pinned Handbook Configurations)
  2. `admin-worm` (WORM HMAC-SHA256 Cryptographic Audit Ledger)
  3. `admin-adapters` (National Ecosystem Endpoints: NSWS, Siebel, API Setu)
  4. `admin-analytics` (Consolidated Statutory Metrics)
  5. `notifications` (System Alert Logs & Audits)
- **Data Readable**: System configuration, rule registries, immutable audit blocks, adapter statuses.
- **Data Creatable/Submittable**: New policy revisions (for future academic years), ecosystem sync triggers.
- **Data Editable**: System parameter ceilings (e.g. $X=360$ seat threshold hold).
- **Decisions Recommended/Recorded**: NONE (Administrative role only).
- **Explicit Prohibitions**:
  - Cannot alter the pinned handbook version of an active in-flight case.
  - Cannot retroactively alter cryptographic audit blocks without breaking the SHA-256 chain.
  - Cannot approve or reject individual college applications.
- **Backend Permissions Enforcing**: `policy.manage`, `audit.read_all`, `system.configure`.
