# Member 2 — Scrutiny, scoped re-scrutiny and conditional EVC

**Role:** Member 2, independent coding agent/workstream. **Priority:** P1 essential two USPs (re-scrutiny + conditional EVC). **Requirements:** B06 B07 and relevant B05/B10/B13/B14, T02 T05 T06 T07 T08 T09, support T03 T04.

Read `../README.md`, `../00_MANAGEMENT/DECISIONS_AND_SCOPE.md`, `../01_SHARED/CONTRACT_FREEZE_CANDIDATE.md`, `../01_SHARED/SECURITY_AND_POLICY_RULES.md`, `../01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md`, and the 23-page canonical report. The complete audit timeline is in `00_MANAGEMENT/SOURCE_AND_AUDIT_TIMELINE.md`; final handoff in `08_REFERENCE_INPUTS/`.

## Owned files / modules
Existing views owned: application dossier (`ApplicationDetailModal.tsx`), `WorkflowView.tsx`, `EVCView.tsx` and related feature components; `src/utils/workflowEngine.ts` remains a presentation helper, not server authority. New modules under `src/backend/modules/{scrutiny,evc}/`, domain models/validation, tests, hooks and local component adapters. Member 1 owns `AppContext.tsx` and `src/services/api.ts`; submit interface changes rather than editing them concurrently.

## Day-zero tasks — can start before other modules exist
1. Import proposed contracts and synthetic `fakeCorePort` in isolated work; no need to wait for Mongo or M1 auth. 2. Implement pure `validateCorrections(snapshot, changes)` that rejects C3 even if a malicious client calls server directly; test D1/D2 accepts and C3 rejects. 3. Design immutable signed checklist shape/deficiency IDs and D1/D2 correction history. 4. Implement pure `evcEligible(route, signedPrerequisites, status)` with duplicate active-task and invalid-route tests. 5. Prepare UI tabs/dossier information architecture and signed status copy without replacing existing screens.

## Full implementation checklist
A. Scope checklist items by reviewed policy revision/checklist version and actor/assignment; signed immutable initial snapshot stores D1/D2 deficient and C3 accepted. B. API for scrutiny/sign with validation and transaction hook; emit `ScrutinySigned`. C. Institution correction command can only reference deficiency IDs; retain earlier versions and repeat rounds; emit `CorrectionSubmitted`; no status shortcut. D. Rescrutiny endpoint checks signed snapshot, allowed item IDs, current case version and reviewer; emit `RescrutinyCompleted`, rejects out-of-scope 403/409 without domain mutation, audit attempted denial. E. Guard stage completion using M1 command service and immutable evidence versions. F. Conditional EVC creation only after signed prerequisites if route requires; unique active task per generation, assignee/session role, scheduling/report metadata; evidence and authorized report; emit `EVCTaskCreated`, `EVCScheduled`, `EVCReportSubmitted`. G. Bind existing dossier/workflow/EVC views to M1 typed adapter and D2 hooks; loading/empty/error/accessibility states and honest status labels; preserve chart/interaction UX without fake official authority.

## Acceptance gate
Given snapshot D1 deficient, D2 deficient, C3 accepted, server accepts only D1/D2 corrections (T05-T08), preserves original signed snapshot and round history, rejects C3 through direct API even when UI guard bypassed. An accredited reviewed scrutiny-only case produces NO EVC; qualifying non-accredited case produces exactly ONE task after signed prerequisite; duplicate schedule does not duplicate tasks; EVC report not auto-approve case; permissions and version conflicts rejected; UI displays source-pinned eligibility explanation and actual committed updates.

## Deliverables another member can consume
Scrutiny/EVC API modules with Zod validators, signed snapshots, negative tests and mocked acceptance transcript; UI refit without changing shared context independently; signed D1/D2/C3 screenshot, EVC eligibility screenshot and handoff events list.

## Cross-member dependencies and mocks
Needs M1 `CorePort`, scoped actor, case state/version, policy explanation, transaction hook; early mocked versions are supplied. Needs M3 private `DocumentVersion` references; use synthetic `evidenceVersionIds` until real upload service lands, never claim filename is uploaded file. Exposes completion/prerequisite event to M1 for final decision.

## Work rules
- Preserve existing React/Express where possible; source verification > assumed greenfield designs.
- Never modify `main` directly; operate on approved feature branch based on reviewed PR0 contracts.
- Keep modules injectable/mockable. Mark mock screenshots/tests explicitly, do not claim production persistence.
- Name event exports and include structured errors/version fields; no browser role selector is authority.
- `src/services/api.ts`, `AppContext.tsx`, router registration and shared types are owned by Member 1.
- Supply proof for rejected paths as well as happy paths. No unauthorized government claims.
