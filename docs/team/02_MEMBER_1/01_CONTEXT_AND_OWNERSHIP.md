# Member 1 — Authoritative core, security, policy and integration

**Role:** Member 1, independent coding agent/workstream. **Priority:** P0 auth/storage/guards; P1 two routes/decision integration. **Requirements:** B01 B02 B03 B04 B05 B08 B13 B14, T01 T03 T04 T11 T12 T13 T14 T16 T19 T20 T26 (plus joint T10/T28).

Read `../README.md`, `../00_MANAGEMENT/DECISIONS_AND_SCOPE.md`, `../01_SHARED/CONTRACT_FREEZE_CANDIDATE.md`, `../01_SHARED/SECURITY_AND_POLICY_RULES.md`, `../01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md`, and the 23-page canonical report. The complete audit timeline is in `00_MANAGEMENT/SOURCE_AND_AUDIT_TIMELINE.md`; final handoff in `08_REFERENCE_INPUTS/`.

## Owned files / modules
Existing files M1 solely coordinates: `server.ts`, `src/backend/routes/index.js`, `src/backend/middleware/auth.js`, `src/backend/models/{User,Application,AuditLog,Notification}.js`, `src/services/api.ts`, `src/context/AppContext.tsx`, `src/types/index.ts`, `package.json` and test scripts. Proposed new modules `src/shared/contracts.ts`, `src/backend/core/{errors,transaction,events,idempotency,rbac}.ts`, `src/backend/modules/{identity,policy,cases,decisions}/`, Mongo persistence/repository adapter, authoritative HTTP-client adapter. Verify exact paths against current main before editing.

## Day-zero tasks — can start before other modules exist
1. Review source and all provided `07_CONTRACT_STARTER` types, endpoint map and examples. Publish **PR0 shared contract** with all members' review; adapt names to actual codebase without changing semantics. 2. Create ephemeral **fake core port / fixture feed** so M2/M3 already have expected actor, case/version, policy and decision events; these mocks are supplied in the kit. 3. Agree Mongo replica-set availability and the transaction wrapper signature. 4. Author initial deny-by-default API negative tests before refactoring.

## Full implementation checklist
A. Replace fail-open auth middleware and mock password acceptance with verified fictional demo identities and secure sessions; use sane cookie/session/CSRF handling appropriate to topology and bcrypt/argon as approved; forbid actual credentials in repo. B. Authorize all region/institution-scoped reads, writes, events, notifications and files. C. Add Zod DTO validation, unique references, enum actions, typed errors and expectedVersion/idempotency. D. Make one case DB authority with explicit unavailable handling (no memory fallback). E. Implement policy registry with source revision + effective session/category/facts + reasoned route; 2 reviewed NBA/non-NBA fixtures and unresolved X=360. F. Implement guarded workflow stages; evidence and prerequisites including M2 hook; generic transition never issues final decision. G. Implement protected fictional demo authority `POST /decisions`; synchronously invoke M3 obligation transaction participant before atomic commit; outbox/audit once. H. Replace browser-local authoritative service with typed HTTP adapter; preserve existing UI. I. Fix mixed runner default tests, SPA-loading only after checks, CORS/CSP/socket auth claims. J. Own shared route registration, API envelopes and integration CI.

## Acceptance gate
Absent/invalid token => 401; wrong password/unknown user => rejection; ordinary admin decision =>403; cross-region/cross-institution list/detail/update/download denied; unknown stage=>422; skipped stage=>409; identical idempotency replay yields same logical event; parallel stale version=>409 and no duplicate decision; API created case persists restart and UI reload; two genuinely approved source fixtures produce different routes; X=360=>review; decision produces exactly one M3-created obligation and one audit/outbox transaction. Never claim Mongo transaction invariants unless tested on real disposable replica set.

## Deliverables another member can consume
Contract PR `src/shared/contracts.ts`; verified auth+case+policy endpoints; typed HTTP adapter; seed/demo users; transaction adapter + mocked test port for M2/M3; documented route/error/event map; regression tests; handoff contract version and sample responses.

## Cross-member dependencies and mocks
Consumes M2 `assertScrutinyComplete`/EVC eligibility and signed snapshot status, M3 `DecisionObligationParticipant` in same transaction. While waiting, stub these interfaces and test blocked/allowed states against fixtures. Member 1 is the integration gatekeeper, not the sole owner of all UI styling.

## Work rules
- Preserve existing React/Express where possible; source verification > assumed greenfield designs.
- Never modify `main` directly; operate on approved feature branch based on reviewed PR0 contracts.
- Keep modules injectable/mockable. Mark mock screenshots/tests explicitly, do not claim production persistence.
- Name event exports and include structured errors/version fields; no browser role selector is authority.
- `src/services/api.ts`, `AppContext.tsx`, router registration and shared types are owned by Member 1.
- Supply proof for rejected paths as well as happy paths. No unauthorized government claims.
