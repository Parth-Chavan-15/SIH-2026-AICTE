# Shared contracts candidate v0.1.0 — review before any merge

This is a **fully supplied proposed output of Member 1**, so Members 2/3 do not wait for Member 1 to invent DTOs. Source files live in `07_CONTRACT_STARTER/src/`. Copy into the repository only through reviewed PR0 after confirming repo imports/types and accepting ADRs.

## Global conventions
- Resource IDs: opaque, server-generated; never derive from timestamp fragments. Timestamps ISO 8601 UTC, UI may display IST. API prefix `/api/v1`. Consistent envelope `{ success:true, data, eventId? }` or `{ success:false, error:{code,message,failedRule?,currentVersion?} }`.
- Server derives actor identity + institution/region grants from verified session, never UI-selected persona. `demo_authority` is fictional and cannot be confused with a legally appointed officer.
- Every command has `expectedVersion` plus `idempotencyKey`; case state and event changes atomic. Roles and scope checked **before** reading or changing restricted data.
- Explanations pin policy/source revision, category, academic session, evaluation facts; ambiguous applicability returns review-needed (not inferred official decision).
- Document upload -> `submitted`; a separate authorized review -> `verified`/`rejected`. Document version never overwritten.
- Timer has type (`event_relative`, `calendar_cutoff`, `validity_expiry`, `internal_demo_sla`), source/time origin, obligation/version generation, dedupe key and cancellation state.
- Error HTTP semantics: 401 unauthenticated; 403 forbidden/scope; 404 absent or concealed; 409 stale/conflict/precondition/policy review; 422 DTO validation; 413/415 unsafe files; 503 storage unavailable.

## Action / stage design
Case states are **demo modeling candidates**: `submitted`, `scrutiny_pending`, `correction_required`, `rescrutiny_pending`, `evc_pending`, `decision_pending`, `approved`, `conditionally_approved`, `rejected`, `policy_review_required`. Actual enum and transitions must be jointly reviewed against case categories, not hardcoded universally.
- `POST .../transition` MUST NOT accept arbitrary `targetStage`; accept named actions and evaluate pinned route, state, actor, evidence and version.
- `POST .../decisions` exclusively records human demo decisions; no generic `admin` final approval.
- `scrutiny` signed snapshot must precede corrections; only deficiency item IDs mutable during ordinary rescrutiny.
- EVC created only for applicable route + signed prerequisite; one active task per generation.
- Obligations created in **the same DB transaction** as conditional decision (Member 3 transaction participant called by Member 1); worker messaging follows outbox after commit.

## Module interaction contract / anti-blocking design
**Member 1 (core) provides:** typed `Actor`, `Application`, `PolicyRevision`, `RouteExplanation`, `CommandContext`, `ContractApi`, error/event envelope and a documented transactional `decide` hook.
**Member 2 provides:** `ScrutinyPort` and `EVCPort` facade modules and transaction-side effect operations; during G0/G1 uses `fakeCorePort` with only synthetic fixtures.
**Member 3 provides:** `DecisionObligationParticipant` invoked synchronously *within* Member 1's transaction, `DocumentPort`, `TimerPort`, `DashboardPort`, and `fakeDecisionPort` until live events exist.

**Rule:** M2/M3 may implement, locally test, and display UI with MOCK adapter from day 0; `MOCK` is visibly labelled. They must not claim integration until real command API, DB and cross-module tests pass. Neither edits `src/services/api.ts`, `AppContext.tsx` or `src/types/index.ts` without M1 PR review.

## Endpoints / ownership (not yet implemented)
| Route | Owner | Notes |
|---|---|---|
| POST `/auth/login`, POST `/auth/logout`, GET `/auth/me` | M1 | Real/synthetic credentials, sanitize responses |
| POST/GET `/applications`, GET `/applications/:id` | M1 | scoped, validated persistent case |
| GET `/applications/:id/explanation`, POST `/applications/:id/transition` | M1 | pinned policy and guarded action |
| POST `/applications/:id/scrutiny`, `/corrections`, `/rescrutiny` | M2 | signed snapshot, D1/D2/C3 guards |
| GET `/evc/queue`, POST `/evc/:id/schedule`, `/evc/:id/report` | M2 | conditional, scoped, unique task |
| POST `/applications/:id/decisions` | M1 + M3 participant | atomic decision + sourced obligation |
| POST `/documents`, GET `/documents/:versionId/content` | M3 | private, type/size/auth checks |
| POST `/obligations/:id/evidence`, `/obligations/:id/review` | M3 | versioned submitted->reviewed |
| GET `/notifications`, PATCH `/notifications/:id/read` | M3 | recipient-scoped |
| GET `/dashboard/summary`, GET `/applications/:id/history` | M3/M1 | authoritative aggregates/events |

## Avoid inconsistencies
- Existing UI `stage` labels vs backend state keys: create **one mapping function** centrally; do not let M2/M3 invent stage strings independently.
- Frontend `id` and Mongo `_id`: serializable normalized DTO, no direct Mongoose doc objects.
- Policy evidence documents: `evidenceVersionIds` always references scoped, persisted versions; in early mock tests use synthetic opaque IDs.
- Fake timer is a **virtual demonstration clock**, no real queue/email/SMS. Production time may differ and must use explicit origins.
- Events carry `caseVersion` and `eventId`; WebSocket/UI projection must not broadcast before DB commit.

## Contract change procedure
Any proposed DTO endpoint/event edit -> open contract-change note -> update this candidate code + fixture + consumer tests -> get M1 and affected member review -> bump `contractVersion` -> merge single PR. No local unilateral variants. Every member reports `contractVersion: 0.1.0-proposed` until frozen.
