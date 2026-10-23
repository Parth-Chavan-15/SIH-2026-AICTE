# Current state — precise facts versus work remaining

## Verified / demonstrated
- React/Vite/TS frontend typechecked and built successfully; actual render untested because Chrome automation failed.
- 8 standalone node:test utilities and 5 backend Vitest/Supertest tests passed; default command fails (runner clash).
- Router in synthetic memory created cases and emitted sampled audit/timeline entries; no durability/atomicity proven.
- Backend runtime tests verified dangerous fail-open auth, login acceptance, cross-region listing, skipped/unknown stage acceptance and hardcoded metrics.

## Code-only useful foundation (preserve, adapt)
Existing screens: overview, applications, new-case wizard, dossier tabs, workflow, pendency, EVC, compliance, document expiry, notifications/escalations, reports, audit, rules, user-management/persona; utilities, toasts, badges, charts, filters, CSV concept. Client API service currently writes localStorage from fixtures; Express/Mongo/memory is separate.

## Missing or incomplete integrated behavior
- B01–B14: none accepted as complete in final handoff.
- Ten-step MVP: no fully accepted step end-to-end.
- Four USPs: source-linked policy route, scope-bound re-scrutiny, human decision-to-obligation continuity, and deduplicated/cancelable source-aware alerts all require construction/verification.
- Security: fail-open auth, route guards and tenancy isolation P0.
- Core infrastructure: explicit durable data, atomic command/audit/outbox, idempotency/version, real file versions, test runner fix.

## Strict prioritization
**P0-A:** deny-by-default auth/login, cross-institution/region scoping; protect all reads/writes.
**P0-B:** authoritative DB/HTTP adapter; validated IDs/session; guarded commands; decision privilege.
**P1-A:** two reviewed explained route examples + pinned revisions; ambiguous inputs -> review.
**P1-B:** signed checklist, immutable D1/D2 scope, conditional EVC.
**P1-C:** one sourced obligation, private uploaded evidence status/version, one deterministic cancelable reminder.
**P1-D:** dashboard/audit accurate, default tests green, honest UI/demo.
**Defer:** predictive AI, real integration, SSO, BPMN, broad conformance or advanced appeals.
