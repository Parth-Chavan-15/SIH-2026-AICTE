# Member 3 — Obligations, private evidence, timers and authoritative monitoring

**Role:** Member 3, independent coding agent/workstream. **Priority:** P1 essential obligation continuity + alert engineering USP. **Requirements:** B09 B10 B11 B12 and relevant B08/B13/B14, T10 T17 T18 T22 T23 T27 T28 (T15 for type origin; T24 deferred).

Read `../README.md`, `../00_MANAGEMENT/DECISIONS_AND_SCOPE.md`, `../01_SHARED/CONTRACT_FREEZE_CANDIDATE.md`, `../01_SHARED/SECURITY_AND_POLICY_RULES.md`, `../01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md`, and the 23-page canonical report. The complete audit timeline is in `00_MANAGEMENT/SOURCE_AND_AUDIT_TIMELINE.md`; final handoff in `08_REFERENCE_INPUTS/`.

## Owned files / modules
Existing views owned: `ComplianceView.tsx`, `DocumentExpiryView.tsx`, `NotificationsView.tsx`, `DashboardView.tsx`, `PendencyView.tsx`, `ReportsView.tsx`, `AuditView.tsx` (coordinate M1 audit type). Proposed modules `src/backend/modules/{obligations,documents,notifications,dashboards}/`, `src/backend/workers/reminders.ts`, private local demo file store, models for obligations/doc versions/timers/notifications/outbox. Shared service/context only edited by M1.

## Day-zero tasks — can start before other modules exist
1. Consume supplied `DecisionRecorded` event fixture; create pure `materializeDecisionObligations()` handler and test conditional vs unconditional decision behavior without M1 live endpoint. 2. Implement document-version state-machine and fictitious file-metadata fixtures, without asserting secure file storage already exists. 3. Implement pure `dueTimers(clock, events, subjectVersion)` and dedupe/cancel/retry tests using explicit virtual clock fixture. 4. Create accurate derived dashboard projection from synthetic event/case facts; ensure zero EVC records=>zero count, unlike existing hardcodes. 5. Prepare UI layouts and custom hooks against mocked `DashboardPort`.

## Full implementation checklist
A. On M1 authorized conditional decision, materialize one source-linked obligation per condition inside SAME transaction, unique `(decisionEventId, conditionKey)`; no approval creates no conditional obligations. B. Private upload storage for actual file bytes, scoped owner download, media/size guards and retain old versions; initial submission never auto-verifies; separate reviewer performs verification, metadata retains received/valid/reviewed times and supersedes old version. C. Timer model with due origin/type, event version/generation/dedupeKey; schedule from committed outbox; idempotent retries; recheck subject/version/status at send time; cancel stale tasks upon updated evidence, due date or review; explicit demo clock control local-only. D. In-app notifications and escalation policy using synthetic recipients and real commit events, not email/SMS. E. Dashboard, pendency, analytics and audit views query scoped authoritative records and compute fresh durations; do not hardcode EVC or obligation counts. F. Replace hash/crypto/secure upload/WORM/NIC claims that are not implemented; guard CSV formula injection and error handling; report time-zone expectations. G. Wire existing UI to M1 single adapter and cleanly expose M3 endpoints; keep demo EVC/compliance UI readable.

## Acceptance gate
One approved conditional decision creates exactly one obligation, same transaction with decision/audit/outbox; replays do not duplicate. A submitted document remains `submitted` until authorized review; bytes downloaded only by authorized actor; next upload creates version, preserves old. Advance simulated time 3/retry times -> one logical reminder, plus review/extension cancels old generation. Zero stored EVC tasks => zero dashboard EVC count; correct authorized scope; case and obligation visible on same timeline. Distinct academic/event-relative/validity clocks and cancellation criteria are explicit.

## Deliverables another member can consume
Decision obligation transaction participant, private document/version API, deterministic timer worker and notification inbox, scoped dashboard projection, case/obligation timeline UI updates, mock and integration test suite, proof of source-origin alert and cancellation.

## Cross-member dependencies and mocks
Consumes M1 verified actor, case/decision/policy/version, Mongo transactional context and outbox; can work against provided fake decision events and mock port before M1 done. M2 evidence item IDs must resolve to document version IDs. Member 3 does not unilaterally issue decisions or modify global auth.

## Work rules
- Preserve existing React/Express where possible; source verification > assumed greenfield designs.
- Never modify `main` directly; operate on approved feature branch based on reviewed PR0 contracts.
- Keep modules injectable/mockable. Mark mock screenshots/tests explicitly, do not claim production persistence.
- Name event exports and include structured errors/version fields; no browser role selector is authority.
- `src/services/api.ts`, `AppContext.tsx`, router registration and shared types are owned by Member 1.
- Supply proof for rejected paths as well as happy paths. No unauthorized government claims.
