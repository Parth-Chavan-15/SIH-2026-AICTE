# Member 1 — ticket-level tasks and definition of done

## Ticket 0 (NOW, independently)
1. Review source and all provided `07_CONTRACT_STARTER` types, endpoint map and examples. Publish **PR0 shared contract** with all members' review; adapt names to actual codebase without changing semantics. 2. Create ephemeral **fake core port / fixture feed** so M2/M3 already have expected actor, case/version, policy and decision events; these mocks are supplied in the kit. 3. Agree Mongo replica-set availability and the transaction wrapper signature. 4. Author initial deny-by-default API negative tests before refactoring.

## Feature implementation
A. Replace fail-open auth middleware and mock password acceptance with verified fictional demo identities and secure sessions; use sane cookie/session/CSRF handling appropriate to topology and bcrypt/argon as approved; forbid actual credentials in repo. B. Authorize all region/institution-scoped reads, writes, events, notifications and files. C. Add Zod DTO validation, unique references, enum actions, typed errors and expectedVersion/idempotency. D. Make one case DB authority with explicit unavailable handling (no memory fallback). E. Implement policy registry with source revision + effective session/category/facts + reasoned route; 2 reviewed NBA/non-NBA fixtures and unresolved X=360. F. Implement guarded workflow stages; evidence and prerequisites including M2 hook; generic transition never issues final decision. G. Implement protected fictional demo authority `POST /decisions`; synchronously invoke M3 obligation transaction participant before atomic commit; outbox/audit once. H. Replace browser-local authoritative service with typed HTTP adapter; preserve existing UI. I. Fix mixed runner default tests, SPA-loading only after checks, CORS/CSP/socket auth claims. J. Own shared route registration, API envelopes and integration CI.

## Output contract
Contract PR `src/shared/contracts.ts`; verified auth+case+policy endpoints; typed HTTP adapter; seed/demo users; transaction adapter + mocked test port for M2/M3; documented route/error/event map; regression tests; handoff contract version and sample responses.

## Must show other members
Consumes M2 `assertScrutinyComplete`/EVC eligibility and signed snapshot status, M3 `DecisionObligationParticipant` in same transaction. While waiting, stub these interfaces and test blocked/allowed states against fixtures. Member 1 is the integration gatekeeper, not the sole owner of all UI styling.

## Definition of done (all required)
- [ ] Branch based on reviewed PR0 contract; publish SHA and `contractVersion`.
- [ ] No unexpected changes to other members' owned files.
- [ ] Persisted server enforcement, not only UI disabled states.
- [ ] Verify permissions/roles and institution/region access.
- [ ] API commands validated (Zod), expectedVersion + idempotency errors typed.
- [ ] Relevant events emitted exactly once and audit references persisted with command.
- [ ] Authenticated and malicious negative tests pass.
- [ ] Shared adapter compiles and types check; no divergent UI stage enum.
- [ ] Proposed acceptance: Absent/invalid token => 401; wrong password/unknown user => rejection; ordinary admin decision =>403; cross-region/cross-institution list/detail/update/download denied; unknown stage=>422; skipped stage=>409; identical idempotency replay yields same logical event; parallel stale version=>409 and no duplicate decision; API created case persists restart and UI reload; two genuinely approved source fixtures produce different routes; X=360=>review; decision produces exactly one M3-created obligation and one audit/outbox transaction. Never claim Mongo transaction invariants unless tested on real disposable replica set.
- [ ] Synthetic evidence and actual test log attached to PR.
- [ ] `npm test` default runner defect fixed by integration owner before final demo.
- [ ] No fake SHA, official legal authorization, unsupported bank/AICTE integration claims.
