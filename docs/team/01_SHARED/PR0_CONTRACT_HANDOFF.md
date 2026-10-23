# PR0 proposed shared-contract handoff

Status: **PROPOSED / MOCK ONLY where noted**, `0.1.0-proposed`. Not frozen or reviewed by M2/M3.
Branch: `handoff/shared-contracts`. Observed base HEAD: `5457ba9e86b7591ff26cb4be93af79fd126592f8`.
No commit, PR, push, migration, runtime registration or deployment was performed. Live remote freshness remains unverified.

## Inputs and research boundary

Read the supplied `PS26262_FINAL_RESEARCH_23_PAGES_READABLE_FOR_CODEX.txt`, titled
**FINAL CONSOLIDATED RESEARCH & ENGINEERING SPECIFICATION / AICTE APPROVAL WORKFLOW**,
research synthesis 22 October 2026. Requirements B01-B14, section 4 policy rules,
sections 13-16 interfaces/transactions/security, section 19 acceptance tests and the
developer appendix are accessible in the extraction. The original PDF layout and
linked official clauses were not independently verified in this PR0.

The research is the requirements benchmark, not authorization to migrate this repo
to its illustrative PostgreSQL stack. Keep React/Vite/Express/Mongoose. APH 1.8(g)
deficiency restrictions, conditional EVC/SHC, separate clocks, X=360 uncertainty,
division-unit ambiguity, human-only decisions and pinned sources remain requirements.
No policy-routing function or definitive source interpretation is implemented.

## Exact files

Created:
- `src/shared/contracts.ts`
- `src/shared/schemas.ts`
- `src/shared/ports.ts`
- `src/shared/endpointMap.ts`
- `src/shared/compatibility.ts`
- `tests/shared/contracts.test.ts`
- `tests/shared/ports.test.ts`
- `tests/shared/fixtures/cases.json`
- `tests/shared/fixtures/events.json`
- `tests/shared/fixtures/responses.json`
- `tests/shared/support/mockCore.ts`
- `tests/shared/support/mockDecision.ts`
- `docs/team/01_SHARED/PR0_CONTRACT_HANDOFF.md`

Updated only `docs/team/01_SHARED/CONTRACT_FREEZE_CANDIDATE.md` to point at the
proposed canonical imports, compatibility requirements and review decisions.

## Consumer imports and boundaries

Import DTOs from `src/shared/contracts`, structural Zod schemas from
`src/shared/schemas`, interfaces from `src/shared/ports`, and method/path/request/
response definitions from `src/shared/endpointMap`. No runtime file imports these
yet. The documentation starter is historical proposed reference, not a second
canonical source for new consumers. Reconcile its older signatures deliberately.

Shared DTOs include Actor, Permission, CommandContext, Institution, Application,
PolicySource, PolicyRevision, RouteExplanation, intake/transition/scrutiny/correction/
re-scrutiny/EVC/decision/upload/review commands, Decision, Obligation, public
DocumentVersion, AuditEvent, EventEnvelope, Outbox, Timer, Notification, ApiResult,
ApiError, Page and DashboardSummary. Application describes the existing aggregate's
future transport boundary; it introduces no collection/model. Storage keys are
absent from public document metadata. `verified` denotes authorized demo review,
never certified legal authenticity; `source_status_observed` is distinct.

M2 consumes CorePort and TransactionContext, implements ScrutinyPort, EVCPort and
ScrutinyPrerequisitePort (`assertScrutinyComplete`, `assertEVCEligible`,
`assertEVCComplete`). M1 later supplies WorkflowGuardPort and authenticated command
boundary. M2 performs its own domain validation and staged writes through session-
bound scrutiny/EVC repositories; PR0 implements none of those rules.

M3 consumes DecisionObligationParticipant, DocumentPort, TimerPort and DashboardPort.
`materialize(tx, command, decisionEventId)` runs before the decision transaction
commits. DecisionRecorded carries the full Decision, including evidence, conditions,
policy revision, source, decision/event/actor/case references, due origin and clock
kind. No asynchronous HTTP callback may substitute for atomic obligation creation.
TimerPort consumes committed events only, rechecks active generations on delivery,
and must dedupe retries. PR0 implements no worker or obligation derivation.

Type-level consumers for M2/M3 live in `tests/shared/ports.test.ts`; strict tsc
checks these against real proposed interfaces. Mocks only return fixed prerequisite
answers or stage caller-supplied fixtures; they do not implement either domain.

## Event names

CaseSubmitted, CaseTransitioned, ScrutinySigned, CorrectionSubmitted,
RescrutinyCompleted, EVCTaskCreated, EVCScheduled, EVCReportSubmitted,
DecisionRecorded, ObligationCreated, EvidenceSubmitted, EvidenceReviewed,
DocumentSuperseded, TimerCanceled, ReminderDelivered, CommandDenied.

Domain envelopes require contract version, actor/request IDs, case ID/version and
UTC time; payload discriminants and case/decision references are checked. Denials
may precede a case and are independently logged without a domain commit. Outbox
wraps the typed envelope with matching eventId; it is not a second business event.

## Scope, commands and transaction contract

- Actors come from verified server sessions. Roles alone confer no permission or
  global scope. Scoped actors require BOTH institution and region membership;
  either empty grant set denies. Explicit global scope requires server delegation.
  Assigned-reviewer/EVC and decision-delegation constraints remain service checks.
- Intake has idempotencyKey and no expectedVersion. Existing-record mutations
  require a positive integer expectedVersion. Create idempotency is scoped by
  actor/institution/operation/key; existing commands by actor/case/operation/key.
- Authenticate and authorize before replay. Identical stored fingerprint returns
  the original result before stale-version rejection; changed payload returns
  IDEMPOTENCY_CONFLICT. A production adapter must compute canonical fingerprints
  server-side and atomically persist results; the mock uses supplied test strings.
- Transactions expose session-bound cases, decisions, obligations, scrutiny, EVC,
  audit and outbox repository operations. All handles expire after callback exit;
  only the adapter commits. transactionId is correlation, not proof of atomicity.
- One real Mongo session must include version update, idempotency result, decision,
  applicable obligations, audit and outbox. Repository implementations, uniqueness
  indexes and retry-safe callbacks are future work, not supplied by these types.
- No arbitrary targetStage command exists. M1 guards named actions using current
  state, pinned route, permission, evidence and M2 prerequisite results. No action
  in TransitionCommand can issue approval/rejection. Those use /decisions only.

## Endpoints and compatibility

Prefix `/api/v1`; retain starter paths and owners in endpointMap.ts. All JSON
responses use ApiResult. Upload success uses the same envelope; file content
success is binary with an error envelope on failure. Proposed uploads are multipart
metadata plus bytes, not filename-only evidence. No live endpoints were added.

Legacy /verify and /dashboards/pendency in research are illustrative; starter
/review and /dashboard/summary remain proposed canonical paths. Institution/policy
management endpoints are deferred pending review rather than invented here.
Notification read remains PATCH and idempotent; logout is session-scoped.

The single LEGACY_STAGE_MAP covers every current WorkflowStage. Unknown values
are flagged; Draft, Scrutiny Cleared, completed EVC, SAC/SHC and approval labels
need context. Approval Issued cannot distinguish conditional/unconditional outcome
and never silently maps to approval. This is presentation compatibility, not a
workflow guard. Mongo IDs must be explicitly serialized strings. Legacy category,
region, academicYear and policy/version/grant reconciliation is deferred; do not
fabricate them or replace `src/types/index.ts` wholesale.

## Open ADRs and recommended review decisions

All ADR-01 through ADR-10 remain awaiting recorded team sign-off. Recommend retaining
the current stack, explicit 503/no fallback, authoritative HTTP, separate fictional
decision delegation and existing ownership. Specifically review:

1. Confirm strict institution AND region scope and explicit global grants; decide
   legacy admin/evc_committee mapping without automatic authority escalation.
2. Choose cookie/session topology, CSRF/CORS and secure credential handling later.
3. Review action/state table per category: completion-to-EVC/decision depends on
   pinned route; no universal EVC/SHC. Approve M2 prerequisite signatures.
4. Confirm session-bound repositories, create idempotency boundary and replay
   ordering; specify uniqueness for permanent IDs/references, command keys,
   (decisionEventId, conditionKey), event/outbox IDs, EVC generations and timers.
5. Decide ambiguous intake semantics. These fixtures PROPOSE a persisted
   policy_review_required case; 409 POLICY_REVIEW_REQUIRED remains available for
   blocked commands. This is not implemented intake behavior.
6. Review full DecisionRecorded payload for private fields and M3 condition needs.
7. Independently review two applicable policy source mappings and demo authority.
   Both supplied case fixtures intentionally remain review-needed; synthetic decision
   shape fixtures are independent examples, not a valid executed workflow.
8. Agree review vs verify endpoint naming, public metadata and multipart details.
9. Confirm package-manager ownership and investigate deleted .env.example in a
   separate authorized change; neither lockfile is changed here.
10. Confirm expectedVersion targets: CorePort validates the case; EVC mutations
    target the task, and evidence review targets its record. Before adapter wiring,
    agree how M2/M3 supply the associated case version and distinguish immutable
    document content sequence from mutable review concurrency revision.

## Verification and blockers

- `npm test -- tests/shared`: PASS, 15 tests / 2 files (MOCK ONLY where labelled).
- `npm test`: PASS, 28 tests / 4 files including the original 13.
- Strict standalone tsc over src/shared, tests/shared and mock support: PASS.
  Command: `node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck --module ESNext --moduleResolution bundler --target ES2022 --resolveJsonModule --allowImportingTsExtensions <all PR0 .ts paths>`.
- `npm run lint`: FAIL in untouched 3D components: cannot resolve
  @react-three/fiber / three, plus consequent JSX/implicit-any errors.
- `npm run build`: FAIL, Rolldown cannot resolve @react-three/fiber from untouched
  `src/components/3d/AICTEWorkflow3D.tsx`. Generated bundle output does not mean success.

No dependencies were installed. Global lint/build status must not be represented
as green while the installed 3D dependency environment is incomplete. No MongoDB,
browser, authentication, official source API or durable transaction acceptance was
performed. Need an approved disposable transaction-capable Mongo deployment and
actual session-bound adapters before asserting persistence/atomicity (T10/T16).

Mock tests establish only proposed staging/rollback, replay/conflict, serial
concurrency, supplied condition uniqueness and isolation semantics. They do not
prove production authorization, Mongo indexes or durability.

## Handoff and next gate

Send reviewers the branch/base SHA, proposed version, exact import paths,
endpointMap, event/decision examples, fixture warnings, consumer tests, validation
results and open ADRs above. No PR URL or approved SHA exists yet. M2/M3 may review
and develop isolated modules against these interfaces; merge/freeze needs both
reviews and recorded decisions. No production functions or adapters exist in PR0.
Stop here for review; do not advance into authentication, persistence or routing.
