# Member 3 integration handoff — exactly what your work guarantees

**Contract:** `0.1.0-proposed` until the PR0 review. **Required outputs:**

Decision obligation transaction participant, private document/version API, deterministic timer worker and notification inbox, scoped dashboard projection, case/obligation timeline UI updates, mock and integration test suite, proof of source-origin alert and cancellation.

**Consumes / produces:**
Consumes M1 verified actor, case/decision/policy/version, Mongo transactional context and outbox; can work against provided fake decision events and mock port before M1 done. M2 evidence item IDs must resolve to document version IDs. Member 3 does not unilaterally issue decisions or modify global auth.

**Acceptance that others may assume ONLY AFTER it passes:**
One approved conditional decision creates exactly one obligation, same transaction with decision/audit/outbox; replays do not duplicate. A submitted document remains `submitted` until authorized review; bytes downloaded only by authorized actor; next upload creates version, preserves old. Advance simulated time 3/retry times -> one logical reminder, plus review/extension cancels old generation. Zero stored EVC tasks => zero dashboard EVC count; correct authorized scope; case and obligation visible on same timeline. Distinct academic/event-relative/validity clocks and cancellation criteria are explicit.

Post the filled `01_SHARED/INTER_MEMBER_HANDOFF_TEMPLATE.md` to your PR. Do not replace missing upstream behavior with hidden fixture data in production; show explicit mock/live adapter setting. Attach changed-file diff, tests, sample API responses and denied-command traces.
