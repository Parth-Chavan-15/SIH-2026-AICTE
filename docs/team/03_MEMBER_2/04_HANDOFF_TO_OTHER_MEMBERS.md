# Member 2 integration handoff — exactly what your work guarantees

**Contract:** `0.1.0-proposed` until the PR0 review. **Required outputs:**

Scrutiny/EVC API modules with Zod validators, signed snapshots, negative tests and mocked acceptance transcript; UI refit without changing shared context independently; signed D1/D2/C3 screenshot, EVC eligibility screenshot and handoff events list.

**Consumes / produces:**
Needs M1 `CorePort`, scoped actor, case state/version, policy explanation, transaction hook; early mocked versions are supplied. Needs M3 private `DocumentVersion` references; use synthetic `evidenceVersionIds` until real upload service lands, never claim filename is uploaded file. Exposes completion/prerequisite event to M1 for final decision.

**Acceptance that others may assume ONLY AFTER it passes:**
Given snapshot D1 deficient, D2 deficient, C3 accepted, server accepts only D1/D2 corrections (T05-T08), preserves original signed snapshot and round history, rejects C3 through direct API even when UI guard bypassed. An accredited reviewed scrutiny-only case produces NO EVC; qualifying non-accredited case produces exactly ONE task after signed prerequisite; duplicate schedule does not duplicate tasks; EVC report not auto-approve case; permissions and version conflicts rejected; UI displays source-pinned eligibility explanation and actual committed updates.

Post the filled `01_SHARED/INTER_MEMBER_HANDOFF_TEMPLATE.md` to your PR. Do not replace missing upstream behavior with hidden fixture data in production; show explicit mock/live adapter setting. Attach changed-file diff, tests, sample API responses and denied-command traces.
