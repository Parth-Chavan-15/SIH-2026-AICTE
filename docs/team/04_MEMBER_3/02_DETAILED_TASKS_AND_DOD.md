# Member 3 — ticket-level tasks and definition of done

## Ticket 0 (NOW, independently)
1. Consume supplied `DecisionRecorded` event fixture; create pure `materializeDecisionObligations()` handler and test conditional vs unconditional decision behavior without M1 live endpoint. 2. Implement document-version state-machine and fictitious file-metadata fixtures, without asserting secure file storage already exists. 3. Implement pure `dueTimers(clock, events, subjectVersion)` and dedupe/cancel/retry tests using explicit virtual clock fixture. 4. Create accurate derived dashboard projection from synthetic event/case facts; ensure zero EVC records=>zero count, unlike existing hardcodes. 5. Prepare UI layouts and custom hooks against mocked `DashboardPort`.

## Feature implementation
A. On M1 authorized conditional decision, materialize one source-linked obligation per condition inside SAME transaction, unique `(decisionEventId, conditionKey)`; no approval creates no conditional obligations. B. Private upload storage for actual file bytes, scoped owner download, media/size guards and retain old versions; initial submission never auto-verifies; separate reviewer performs verification, metadata retains received/valid/reviewed times and supersedes old version. C. Timer model with due origin/type, event version/generation/dedupeKey; schedule from committed outbox; idempotent retries; recheck subject/version/status at send time; cancel stale tasks upon updated evidence, due date or review; explicit demo clock control local-only. D. In-app notifications and escalation policy using synthetic recipients and real commit events, not email/SMS. E. Dashboard, pendency, analytics and audit views query scoped authoritative records and compute fresh durations; do not hardcode EVC or obligation counts. F. Replace hash/crypto/secure upload/WORM/NIC claims that are not implemented; guard CSV formula injection and error handling; report time-zone expectations. G. Wire existing UI to M1 single adapter and cleanly expose M3 endpoints; keep demo EVC/compliance UI readable.

## Output contract
Decision obligation transaction participant, private document/version API, deterministic timer worker and notification inbox, scoped dashboard projection, case/obligation timeline UI updates, mock and integration test suite, proof of source-origin alert and cancellation.

## Must show other members
Consumes M1 verified actor, case/decision/policy/version, Mongo transactional context and outbox; can work against provided fake decision events and mock port before M1 done. M2 evidence item IDs must resolve to document version IDs. Member 3 does not unilaterally issue decisions or modify global auth.

## Definition of done (all required)
- [ ] Branch based on reviewed PR0 contract; publish SHA and `contractVersion`.
- [ ] No unexpected changes to other members' owned files.
- [ ] Persisted server enforcement, not only UI disabled states.
- [ ] Verify permissions/roles and institution/region access.
- [ ] API commands validated (Zod), expectedVersion + idempotency errors typed.
- [ ] Relevant events emitted exactly once and audit references persisted with command.
- [ ] Authenticated and malicious negative tests pass.
- [ ] Shared adapter compiles and types check; no divergent UI stage enum.
- [ ] Proposed acceptance: One approved conditional decision creates exactly one obligation, same transaction with decision/audit/outbox; replays do not duplicate. A submitted document remains `submitted` until authorized review; bytes downloaded only by authorized actor; next upload creates version, preserves old. Advance simulated time 3/retry times -> one logical reminder, plus review/extension cancels old generation. Zero stored EVC tasks => zero dashboard EVC count; correct authorized scope; case and obligation visible on same timeline. Distinct academic/event-relative/validity clocks and cancellation criteria are explicit.
- [ ] Synthetic evidence and actual test log attached to PR.
- [ ] `npm test` default runner defect fixed by integration owner before final demo.
- [ ] No fake SHA, official legal authorization, unsupported bank/AICTE integration claims.
