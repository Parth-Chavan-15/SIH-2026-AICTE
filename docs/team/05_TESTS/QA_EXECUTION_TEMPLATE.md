# Test evidence log (fill with observed outputs, not predictions)

| Test ID | Branch/SHA | Environment (memory/Mongo/browser) | Command or action | Expected | Actual status/output | PASS/FAIL/BLOCKED | Evidence file or screenshot | Owner |
|---|---|---|---|---|---|---|---|---|
| API01 | | Router synthetic | GET /applications no auth | 401 | | | | Member 1 |
| T07 | | Disposable DB/API | POST /corrections with C3 | Rejected + unchanged | | | | Member 2 |
| T10 | | Disposable DB/API | Authorized conditional decision | One obligation | | | | Member 3 |
| T17 | | Virtual demo clock | Reschedule then fire old generation | No alert | | | | Member 3 |
| T28 | | DB/UI | Compare committed counts | Equal | | | | Member 3 |

## Safety
- Use disposable data and non-public server; never use official credentials.
- If browser Playwright GPU fails, record as environment BLOCKED and use manual Edge/Chrome `InPrivate` for the separate smoke; do not call an unvisited page broken.
- Recheck Git clean before and after; no destructive resets; never commit secrets/caches or large reference PDFs unintentionally.
