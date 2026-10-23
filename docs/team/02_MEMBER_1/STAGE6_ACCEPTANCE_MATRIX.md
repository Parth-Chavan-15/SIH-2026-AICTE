# Stage 6 Member 1 acceptance inventory

Evidence levels: UNIT = installed-runner service/transport tests; HTTP = real Express
middleware with synthetic in-memory storage; MOCK_TX = fake/native-operation mocks;
REAL_DB and REAL_BROWSER require separately approved execution. A prepared/skipped
test is not a pass. No coverage percentage or regulatory certification is claimed.

Ultra audit update: reader contexts now use an explicit field allowlist; strict
attestation checks cover all M2 prerequisite branches. HTTP client integration now
asserts both scope dimensions, concealed reads, mutation invariance and revoked old
cookies. Navigation additions are STATIC/UNIT only. There are 12 prepared native
tests (including legacy isolation), all REAL_DB NOT RUN. The browser runner's one
HARNESS_ONLY configuration pass and syntax check are not REAL_BROWSER execution.
All original A-Z and scenario statuses below remain PARTIAL/BLOCKED where native,
browser, regulatory or teammate dependencies are absent; no row gains E2E PASS.

Every row below has implementation, owner, expected behavior, evidence and missing
acceptance action. Relative source roots are src/backend unless otherwise stated.
Requirement references are the existing B01-B14 / T01-T28 catalogs in ../05_TESTS.

| ID / requirement | Owner | Expected / implementation | Tested evidence | Status / remaining action |
| --- | --- | --- | --- | --- |
| A Identity / B14 | M1 | security/identity.ts verifies fictional accounts, bcrypt, generic failures, bounded attempts | tests/security/auth.test.ts HTTP | Implemented; deployment account configuration and browser proof pending |
| B Sessions / B14 | M1 | identity.ts opaque hashed sessions, expiry, rotation/revocation; services/session.ts stale response rejection | security/auth + client + frontend/canonical HTTP/UNIT | Implemented; browser/proxy/cross-tab NOT TESTED |
| C Permissions / T04 | M1 | security/authorization.ts explicit grants, decision.record AND demo_authority | security/auth, decisions/core HTTP/UNIT | Implemented; deployment delegation pending |
| D Scope / B01,B14,T27 | M1; M3 files | institution AND region filters, concealed case lookup; no file implementation | security/mongo-scope MOCK_TX, auth HTTP | Case enforcement implemented; REAL_DB pending; file scope owned by M3 |
| E Intake / B02 | M1 | core/cases.ts strict canonical input, unique references, review-required safe result | core/commands + http UNIT/HTTP | Implemented; REAL_DB native suite prepared, not run |
| F Persistence / B02 | M1 | persistence/mongoCore.ts one case authority, no fallback | core/mongo-adapter MOCK_TX | Implemented/mock-tested; native durability/restart blocked |
| G Transitions / B05,T03,T19,T20 | M1 | named actions; role/state/pin/evidence/prerequisite guards | core/commands + acceptance/boundaries UNIT, core/http HTTP | Implemented; new reader/attestation defects corrected; live adapters absent |
| H Concurrency / T16 | M1 | version CAS and native retry callback | core/mongo-adapter MOCK_TX; real-db/native prepared | Native competing-client proof BLOCKED |
| I Replay / B05,T16 | M1 | fingerprints; current permission/scope; replay precedes stale check | core/commands, decisions/core UNIT/MOCK_TX | Implemented; native duplicate/uncertain-commit proof pending |
| J Audit/outbox / B13 | M1; M3 delivery | unit writes audit/outbox/receipt atomically; no external publication | core/commands + mongo-adapter + decisions/core MOCK_TX | Native rollback BLOCKED; M3 delivery/export/denial durability absent |
| K Registry / B03,T26 | M1 | policy/registry.ts immutable approved-shaped revisions/supersession | policy/routing UNIT | Implemented; real source approvals absent |
| L Evaluation / B04,T01,T11-T15,T19,T20 | M1 + source reviewers | policy/evaluator.ts units, boundary ambiguity and unsupported conditions fail closed | policy/routing UNIT, synthetic fixtures ONLY | Technical engine implemented; official applicable sources unverified |
| M Explanation / B04 | M1 | pinned reasons/facts/sources; escaped text, official HTTPS links | policy/http HTTP; frontend/canonical static/UNIT | Implemented; browser/source acceptance pending |
| N Pinning / B03,T26 | M1 | no silent revision replacement of existing cases | policy/routing, core/commands, acceptance/boundaries historical-expiry UNIT | Expired but historically applicable pin progresses; out-of-window case denied; no migration. Native restart/source-clock approval pending |
| O Route resolution / B03 | M1 + M2/M3 contract review | proposed separate command/endpoint/event; current API rejects undocumented action | policy/http negative HTTP | NOT IMPLEMENTED; permission/clock/event agreement missing |
| P Signed prerequisites / B06,B07,T02,T05-T09 | M2; M1 boundary | strict positive attestation structure, same-case/current-signed-round semantics delegated to M2 | acceptance/boundaries UNIT; decisions/core MOCK_TX | Consumer validation implemented; authoritative provenance BLOCKED |
| Q Decisions / B08,T04,T19 | M1 | core/decisions.ts human reason, strict context, pin, scope and authority | decisions/core UNIT/HTTP | Implemented/mock-tested; production deps intentionally absent |
| R Obligations / B09,T10 | M3; M1 boundary | pending/version1, exact writes/return, condition attribution, atomic participant | decisions/core MOCK_TX; real-db/native synthetic participant prepared | Live M3 implementation/session/domain dates BLOCKED |
| S Canonical API / B02,B05,B08 | M1 | shared schemas/endpoints + services/api; legacy mutations rejected | shared tests, core/http, frontend/canonical | Implemented for M1 endpoints; M2/M3 endpoints not registered |
| T React journeys / B02,B05,B08 | M1 | CanonicalWorkspace under SessionGate; no optimistic approvals | frontend/canonical static/transport/helper UNIT | Implemented; interactive browser/field cleanup NOT TESTED |
| U Navigation / B06-B12 | M1 shell; M2/M3 views | CanonicalNavigation permission-aware cases and explicit pending views | acceptance/navigation static/UNIT | Shell implemented; domain screens unavailable |
| V Readiness/durability / B02,T10,T16 | M1 + infrastructure approver | topology + all nine exact indexes; no model autoprovision | core/mongo-adapter MOCK_TX; real-db/native prepared | REAL_DB BLOCKED; no DB contacted |
| W Browser / B14 | M1 + environment approver | cookie/Origin, refresh, institution journey, session clearing | browser script prepared; syntax + one HARNESS_ONLY config test | REAL_BROWSER NOT RUN/BLOCKED; no framework/browser installed |
| X Recovery / B05,B14 | M1 | typed errors, no stale private data/fake success | security/client, frontend/canonical, core/mongo-adapter UNIT | Implemented; browser and uncertain native outcomes unproven |
| Y Deployment / B14 | M1 + deploy owner | loopback server, explicit URI, no seed; realtime closed | code inspection server.ts; auth HTTP | PARTIAL: config, proxy/CSP/browser/DB acceptance, dependency restoration pending |
| Z Handoff / all | M1 | traceable scope, evidence and blocker ownership | Stage 6 handoff + this matrix + infrastructure procedure | Prepared; team review pending |

## Full-system scenarios (no isolated mock becomes E2E PASS)

| Scenario | Preconditions / actor / input | Expected | Actual evidence / owner / result |
| --- | --- | --- | --- |
| A Route/review | scoped institution; synthetic intake, no approved source | review-required with explanation + audit | policy/core tests UNIT/HTTP, native/browser prepared; M1; PARTIAL |
| B Deficiency scrutiny | signed D1/D2 deficient, C3 accepted; assigned reviewer | only D1/D2 correction, immutable signed rounds | no live scrutiny engine; M2; BLOCKED |
| C Conditional EVC | reviewed-shaped EVC vs non-EVC path; reviewer | required EVC enforced, no fabricated task | policy/routing and decisions/core MOCK; M2/M1; PARTIAL |
| D Human decision | demo_authority + permission + both grants; reason/version/evidence | accept only signed M2 and verified M3, otherwise deny | decisions/core + HTTP denied integration; M1/M2/M3; PARTIAL |
| E Obligations | conditional decision; exact canonical conditions | one linked obligation per condition or abort whole command | decisions/core MOCK_TX; native synthetic participant prepared; M3/M1; PARTIAL |
| F Alerts | obligation changed or deficiency resolved | obsolete generations stop; delivery dedupes | no worker/delivery implementation; M3; BLOCKED |
| G Scope/session | institution A requests B; expired/revoked session | conceal B, unauthorized reads denied | auth HTTP + client UNIT; browser not run; M1/M3 files; PARTIAL |
| H Retry/restart | duplicate/lost response, competing clients, new connection/process | one durable command/event, no session resurrection | MOCK_TX; native reconnect tests prepared, process/container restart and failpoint tests still needed; M1/infra; BLOCKED |

B10/B11/B12, T17/T18/T21-T24/T27/T28 remain M2/M3-owned beyond M1 guards.
T15/T20/T25 are unsupported/deferred: do not invent appeal clocks, universal SHC
or linked-case operations. Source candidates remain draft/unseeded. File-security,
alert cancellation and actual dashboard count accuracy cannot pass in this branch.
