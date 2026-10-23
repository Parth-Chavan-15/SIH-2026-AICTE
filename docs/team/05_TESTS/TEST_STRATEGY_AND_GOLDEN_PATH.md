# Acceptance test and release strategy

## Current evidence, not an imaginary green suite
- Actual authored tests: `node --import tsx --test src/utils/workflowEngine.test.ts` 8/8; `npm test -- tests/workflow.test.ts` 5/5. **`npm test` failed**, since Vitest discovers Node's `node:test` suite as an empty suite. Integrator must repair command coverage, not merely hide the file.
- Test environment: router-only process-memory synthetic tests; not `server.ts`, Mongo durability, browser, sockets or external integration.
- Critical runtime failures: missing/invalid token, unknown/wrong password login, cross-region reads, arbitrary/skipped stage; hardcoded EVC/compliance metrics. No fix is proven yet.
- Automated browser run blocked before reaching page; delegate manual local-only smoke and preserve evidence.

## Independent gates
G1 security/core: negative auth, scope, unknown/skipped transition, expectedVersion and idempotency; validated session; Mongo restart persistence and a transaction test on a disposable transaction-capable Mongo instance.
G2 scrutiny/EVC: T01,T02,T05–T09; original D1/D2/C3 snapshot, tampered direct API attempt C3 denied, no task for ineligible case.
G3 decisions/documents: T04,T10,T18,T19,T27; authorized fictional actor only; same transaction produces conditional obligation, versioned private file submitted/verified.
G4 timers/analytics: T17,T22,T23,T28; deterministic clock, dedupe and cancel; persisted query counts, event trace.
G5 policy: T11–T14,T26, conditional SHC test T20 as guard. Defer full T15/T21/T24/T25 UIs if necessary, document unavailable scope.

## Repeatable golden-path demonstration — two cases
**Case A:** Reviewed qualifying 2026–27 route; synthetic institution submits → source/revision pinned → initial scrutiny signed D1/D2 deficient, C3 accepted → correction only D1/D2 → direct C3 update returns policy denial, case untouched → if eligible, EVC once after authorized prerequisite → EVC report → `demo_authority` records a conditional **simulated** outcome → exactly one linked obligation with source and due origin → evidence upload remains `submitted` until reviewer verifies → advance fake clock to send one in-app reminder only when still active → replace/review evidence; stale queued generation cannot send → dashboard/history show committed event IDs and counts.

**Case B:** Reviewed different applicable route to demonstrate no EVC requirement; expected branch and source reasons visible. Any exact intake X=360 sample must result in policy review rather than automatic decision.

## Negative suite (priority order)
| Test | Expected after fix | Old observed baseline |
|---|---|---|
| Missing bearer/session | 401 | 200 returned |
| Invalid token | 401 | 200 returned |
| Unknown/wrong credentials | Reject without user body | 200 and a user returned |
| Cross-institution/region GET & mutation | 403 or concealed 404 | Cross-region list 200 |
| Skipped stage, invalid enum | 409 / 422 | 200, stage mutated |
| Ordinary admin final decision | 403 | Client guard insufficient |
| Unauthorized document download | 403 or 404 | Actual file download unimplemented |
| D1/D2 correction with C3 injection | 403/409; no mutation | Scope guard missing |
| Parallel stale expectedVersion | 409 and one event | No test/guard |
| Repeated identical idempotencyKey | One result/event/obligation | No test/guard |
| Retry old reminder after cancel | No delivery | No implementation |

## Metrics that judges can inspect
- Wrong-role accepted commands: 0 in synthetic acceptance set.
- Duplicate logical alerts after 3 retries: 0.
- Out-of-scope correction writes accepted: 0.
- Case route provenance: 100% of demonstrated cases include policyRevisionId/source/reasons.
- Dashboard delta vs authoritative DB counts: 0 on scripted scenario.
- Every accepted command => 1 event with actor/case version/source where applicable.

No percentages here are empirical production results; they are demo acceptance **targets**.
