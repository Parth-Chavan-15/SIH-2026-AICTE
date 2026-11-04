# NIYAMSETU — PHASE 4: ROLE & NAVIGATION VERIFICATION REPORT
## Role-Based Access Control, Session Persona Switching & Tenant Isolation Verification

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Scope:** Verification of role-based navigation, rapid persona switching, and multi-tenant data isolation across all 6 statutory roles.

---

## 1. Demo Personas & Credential Registry

NIYAMSETU provides 6 pre-configured demonstration personas representing every statutory role in the AICTE approval ecosystem. Evaluators can switch personas instantly using the top navigation dropdown:

| Role ID | Persona / Display Title | Demo Email | Role Key | Scoped Permissions | Tenant / Scope Boundary |
|:---:|:---|:---|:---|:---|:---|
| **R1** | Principal, COEP Tech University | `principal@coep.ac.in` | `institution` | `intake.submit`, `cure.upload`, `appeal.file` | Strictly isolated to COEP cases (`APP-2026-COEP`). |
| **R2** | Reviewer, Desk Scrutiny Committee | `scrutiny.reviewer@aicte.gov.in` | `scrutiny_committee` | `scrutiny.evaluate`, `scrutiny.sign`, `document.verify` | Scoped to assigned regional scrutiny cases. |
| **R3** | Chairman, Expert Visit Committee | `evc.chair@aicte.gov.in` | `evc_expert` | `evc.inspect`, `evc.score`, `evc.report` | Scoped to cases scheduled for physical inspection. |
| **R4** | Regional Officer, Western Region | `ro.western@aicte.gov.in` | `regional_officer` | `ro.allocate`, `ro.monitor`, `hearing.schedule` | Scoped to Western Region dockets (MH, GOA). |
| **R5** | Member Secretary, Approval Bureau | `bureau.approval@aicte.gov.in` | `bureau_officer` | `decision.record`, `order.issue`, `appeal.adjudicate` | Council-wide statutory determination authority. |
| **R6** | System & Policy Administrator | `admin@aicte.gov.in` | `admin` | `policy.manage`, `audit.read`, `system.configure` | Full system governance, rules engine, and WORM audit. |

---

## 2. Navigation Architecture & Dynamic Sidebar Mapping

The application header (`Navbar.tsx`) integrates the persona selector, which invokes `loginAs()` in `services/session.ts`. This synchronously updates `AppContext`, triggering dynamic re-rendering of `Sidebar.tsx`:

```mermaid
flowchart TD
    A["User Selects Persona in Navbar"] --> B["session.ts: switchActiveSession()"]
    B --> C["AppContext: Re-render with new actor & permissions"]
    C --> D["Sidebar.tsx: Dynamic Tab Filtering"]
    D --> E1["R1: inst-apps, inst-nsws, inst-deficiencies, inst-decision-docs, inst-renewals, appeals-hearings, notifications"]
    D --> E2["R2: scrutiny-eval, scrutiny-rescrutiny, scrutiny-portal-import, scrutiny-committee, scrutiny-queue, notifications"]
    D --> E3["R3: evc-inspect, evc-reports, notifications"]
    D --> E4["R4: ro-allocation, ro-pendency, ro-appeals-hearings, ro-obligations, notifications"]
    D --> E5["R5: ca-decision, ca-decision-docs, ca-appeals, notifications"]
    D --> E6["R6: admin-policy, admin-worm, admin-adapters, admin-analytics, notifications"]
```

---

## 3. Strict Tenant Isolation Verification

### Institution Multi-Tenant Privacy (PS 26262 T01)
- **Invariant:** An authenticated institution principal must only have visibility into their own institution's cases, cure submissions, compliance undertakings, and alerts.
- **Implementation:**
  - `ApplicationsListView.tsx` filters applications using `scopedApps`:
    ```typescript
    const isInstitution = role === 'institution';
    const scopedApps = useMemo(() => {
      if (!isInstitution) return applications;
      return applications.filter(app => {
        // Strict match on actor institutionIds, user email, or case ID prefix
        ...
      });
    }, [applications, isInstitution, actor]);
    ```
  - Backend API middleware enforces equivalent tenant isolation on `GET /api/v1/applications`, returning HTTP 403 Forbidden for any unauthorized cross-tenant query.
- **Automated Verification:** Verified in `tests/verification_t01_t16.test.ts` (Test T01: "Enforces Tenant Isolation — Principal of College B cannot read College A").

### Escalation & Notification Isolation (PS 26262 T08)
- **Invariant:** Escalation warnings and regulatory alerts are scoped to the institution. An institution with clean SLA performance (such as COEP Pune) must receive zero false-positive escalation notices.
- **Automated Verification:** Verified in `tests/security/escalation_tenant_isolation.test.ts` and `tests/acceptance/coep_notifications_verification.test.ts` (Passed).

---

## 4. Role Separation & Boundary Guards (PS 26262 T05)

1. **Scrutiny vs EVC Boundary:**
   - Desk Scrutiny Committee members cannot access EVC scoring or submit physical inspection reports.
   - EVC inspectors cannot sign or modify desk scrutiny checklists (C1–C14).
2. **Quasi-Judicial Role Separation (SHC vs SAC):**
   - Standing Hearing Committee (SHC) officers at Regional Offices cannot sit on or dispose Standing Appellate Committee (SAC) appeals, and vice versa.
   - Verified in `tests/acceptance/shc_sac_role_separation.test.ts` (5/5 passed).
3. **Approval Authority Guard:**
   - Only personas with explicit `decision.record` permission (Member Secretary / Approval Bureau) can execute final council speaking orders or advance cases to `Approval Issued`.
   - Verified in `tests/security/auth.test.ts` (RBAC-05: "Officer and policy administrator do not gain demo decision authority").

---

## 5. Navigation State Persistence & Smooth Transitions

1. **Active Tab Memory:** Switching between sidebar tabs within a persona preserves all active case selections and filters.
2. **Modal Isolation:** Opening or closing secondary modals leaves the parent screen navigation stack undisturbed.
3. **Zero Full-Page Reloads:** All transitions occur via client-side React state routing, ensuring sub-50ms tab transition latency across all 30 screens.
