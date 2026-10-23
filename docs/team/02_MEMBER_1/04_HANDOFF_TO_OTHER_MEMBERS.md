# Member 1 integration handoff — exactly what your work guarantees

**Contract:** `0.1.0-proposed` until the PR0 review. **Required outputs:**

Contract PR `src/shared/contracts.ts`; verified auth+case+policy endpoints; typed HTTP adapter; seed/demo users; transaction adapter + mocked test port for M2/M3; documented route/error/event map; regression tests; handoff contract version and sample responses.

**Consumes / produces:**
Consumes M2 `assertScrutinyComplete`/EVC eligibility and signed snapshot status, M3 `DecisionObligationParticipant` in same transaction. While waiting, stub these interfaces and test blocked/allowed states against fixtures. Member 1 is the integration gatekeeper, not the sole owner of all UI styling.

**Acceptance that others may assume ONLY AFTER it passes:**
Absent/invalid token => 401; wrong password/unknown user => rejection; ordinary admin decision =>403; cross-region/cross-institution list/detail/update/download denied; unknown stage=>422; skipped stage=>409; identical idempotency replay yields same logical event; parallel stale version=>409 and no duplicate decision; API created case persists restart and UI reload; two genuinely approved source fixtures produce different routes; X=360=>review; decision produces exactly one M3-created obligation and one audit/outbox transaction. Never claim Mongo transaction invariants unless tested on real disposable replica set.

Post the filled `01_SHARED/INTER_MEMBER_HANDOFF_TEMPLATE.md` to your PR. Do not replace missing upstream behavior with hidden fixture data in production; show explicit mock/live adapter setting. Attach changed-file diff, tests, sample API responses and denied-command traces.
