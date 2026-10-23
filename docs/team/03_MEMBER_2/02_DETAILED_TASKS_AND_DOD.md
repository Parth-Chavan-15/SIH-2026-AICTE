# Member 2 — ticket-level tasks and definition of done

## Ticket 0 (NOW, independently)
1. Import proposed contracts and synthetic `fakeCorePort` in isolated work; no need to wait for Mongo or M1 auth. 2. Implement pure `validateCorrections(snapshot, changes)` that rejects C3 even if a malicious client calls server directly; test D1/D2 accepts and C3 rejects. 3. Design immutable signed checklist shape/deficiency IDs and D1/D2 correction history. 4. Implement pure `evcEligible(route, signedPrerequisites, status)` with duplicate active-task and invalid-route tests. 5. Prepare UI tabs/dossier information architecture and signed status copy without replacing existing screens.

## Feature implementation
A. Scope checklist items by reviewed policy revision/checklist version and actor/assignment; signed immutable initial snapshot stores D1/D2 deficient and C3 accepted. B. API for scrutiny/sign with validation and transaction hook; emit `ScrutinySigned`. C. Institution correction command can only reference deficiency IDs; retain earlier versions and repeat rounds; emit `CorrectionSubmitted`; no status shortcut. D. Rescrutiny endpoint checks signed snapshot, allowed item IDs, current case version and reviewer; emit `RescrutinyCompleted`, rejects out-of-scope 403/409 without domain mutation, audit attempted denial. E. Guard stage completion using M1 command service and immutable evidence versions. F. Conditional EVC creation only after signed prerequisites if route requires; unique active task per generation, assignee/session role, scheduling/report metadata; evidence and authorized report; emit `EVCTaskCreated`, `EVCScheduled`, `EVCReportSubmitted`. G. Bind existing dossier/workflow/EVC views to M1 typed adapter and D2 hooks; loading/empty/error/accessibility states and honest status labels; preserve chart/interaction UX without fake official authority.

## Output contract
Scrutiny/EVC API modules with Zod validators, signed snapshots, negative tests and mocked acceptance transcript; UI refit without changing shared context independently; signed D1/D2/C3 screenshot, EVC eligibility screenshot and handoff events list.

## Must show other members
Needs M1 `CorePort`, scoped actor, case state/version, policy explanation, transaction hook; early mocked versions are supplied. Needs M3 private `DocumentVersion` references; use synthetic `evidenceVersionIds` until real upload service lands, never claim filename is uploaded file. Exposes completion/prerequisite event to M1 for final decision.

## Definition of done (all required)
- [ ] Branch based on reviewed PR0 contract; publish SHA and `contractVersion`.
- [ ] No unexpected changes to other members' owned files.
- [ ] Persisted server enforcement, not only UI disabled states.
- [ ] Verify permissions/roles and institution/region access.
- [ ] API commands validated (Zod), expectedVersion + idempotency errors typed.
- [ ] Relevant events emitted exactly once and audit references persisted with command.
- [ ] Authenticated and malicious negative tests pass.
- [ ] Shared adapter compiles and types check; no divergent UI stage enum.
- [ ] Proposed acceptance: Given snapshot D1 deficient, D2 deficient, C3 accepted, server accepts only D1/D2 corrections (T05-T08), preserves original signed snapshot and round history, rejects C3 through direct API even when UI guard bypassed. An accredited reviewed scrutiny-only case produces NO EVC; qualifying non-accredited case produces exactly ONE task after signed prerequisite; duplicate schedule does not duplicate tasks; EVC report not auto-approve case; permissions and version conflicts rejected; UI displays source-pinned eligibility explanation and actual committed updates.
- [ ] Synthetic evidence and actual test log attached to PR.
- [ ] `npm test` default runner defect fixed by integration owner before final demo.
- [ ] No fake SHA, official legal authorization, unsupported bank/AICTE integration claims.
