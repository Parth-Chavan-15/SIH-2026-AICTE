# Stage 4 policy and routing handoff

Status: **PARTIAL development implementation**. No approved AICTE intake fixture,
no live database proof, and existing-case route resolution is contract-blocked.
Branch: `feat/regulatory-policy-routing`. Clean starting HEAD verified as
`43d9aeba7b6957323ee5dee12878df6cbfe11aa7` (published Stage 3), with Stage 2
`0d958f7ae1ba39d396fe5131a92034d213dabb88` in history. No branch changes,
fetch/pull/reset/rebase/merge, staging, commits or pushes performed. PR0 remains
`0.1.0-proposed`, unchanged and not frozen.

## Exact implementation inventory

Modified:
- `src/backend/core/cases.ts`: transactional intake evaluation/pinning and v1 pinned-route guard.
- `src/backend/core/storage.ts`: optional session-bound policy-list read on internal Unit.
- `src/backend/core/router.ts`: injectable server-only PolicyFactsReader.
- `src/backend/persistence/mongoCore.ts`: native policy reads, approval gate and unique revision ID readiness requirement.
- `src/backend/routes/index.js`: type documentation for the forwarded policy reader option only.
- `tests/core/mongo-adapter.test.ts`: policy-list session propagation, policy index/approval/read-failure regression tests.

Created:
- `src/backend/policy/registry.ts`
- `src/backend/policy/evaluator.ts`
- `src/backend/policy/candidates.ts`
- `tests/policy/support.ts`
- `tests/policy/routing.test.ts`
- `tests/policy/http.test.ts`
- `docs/team/02_MEMBER_1/STAGE4_POLICY_HANDOFF.md`

No package, lockfile, shared contract, frontend, auth, or M2/M3 domain edits.

## Regulatory evidence actually checked, 23 October 2026

The supplied readable 23-page consolidated research and Member 1/shared guidance
were used as requirements and source pointers, not independent primary proof.
The repository's three-member ownership and Mongo architecture take precedence
over the research's illustrative six-member/PostgreSQL architecture.

| Source | Actual check | Consequence |
|---|---|---|
| [G01 APH 2024–2027](https://aicte.gov.in/sites/default/files/APH%20Final.pdf) | Retrieved 231-page official PDF. Inspected §1.8(g), PDF p.23 / printed p.7, and located §2.6 intake provisions. Re-scrutiny scope is confined to identified deficiencies. | Supports M2 prerequisite boundary; does NOT independently establish the amended 2026 intake routes. No M2 logic implemented. |
| [G02 updated addendum](https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf) | Official PDF returned HTTP 403; www variant also inaccessible. Reported p.42 §2.6(c)(i), p.11 hearing/deposit provisions not independently verified. | Both intake fixtures remain draft/interpretation_pending; activation blocked. |
| [G03 calendar](https://aicte.gov.in/sites/default/files/Academic%20Calendar%202026-27.pdf) | Official PDF returned HTTP 403. | No date schedule or officer SLA invented; mode separation only. |
| [G07 notice index](https://www.aicte.gov.in/node/3342) and [linked notice](https://aicte.gov.in/downloads/aph/Revised%20Public%20Notice%20(04.02.2026).pdf) | Both accessible, unlike earlier research's access limitation. One-page notice dated 4 February: payment window for pending prescribed charges and a separate BBA/BCA/BMS application window. | This is a scoped notice, not verification of the intake errata or a universal academic deadline. No calendar automation derived from it. |

No claim that all intervening amendments, source precedence, official delegation,
accreditation or institution records were verified. No live AICTE integration.

## Registry, lifecycle and activation boundary

Uses the existing `policy_revisions` collection and PR0 PolicyRevision. No second
policy collection/model, insertion/edit/activation endpoint or startup seed exists.
Stable key/revision/id, status, supersedesId, session/category/effective window and
PolicySource remain the canonical fields. Backend `m1-routing-v1` conditions encode
programme/mode, typed comparisons with explicit units and ambiguous values, exact
supported stage sequence, EVC rationale, hearing/unresolved flags, and review
metadata (source revision/digest, distinct author/approver, verification date,
confirmed applicability and precedence). This is a documented interpretation of
the existing conditions record, not a competing canonical PolicyRevision type.

Read-only registry snapshots clone inputs/outputs, reject duplicate IDs and key /
revision pairs, reversed windows, foreign/missing/self supersession and backwards
revision chains. There is no mutation operation. DB-level immutability against
privileged external administrators is NOT proven: deployment must restrict policy
writes to a reviewed append-only provisioning process, preserve previous rows and
enforce unique policyKey/revision in that process (ideally a separately approved
compound index). The app never upgrades a draft or approves a source itself.

Approval requires approved status, reviewed official HTTPS source URL, matching
source revision, nonempty exact source location, digest/reviewer metadata, distinct
author and approver, confirmed applicability/precedence, and no unresolved issue.
These checks validate trusted registry attestations; a digest-shaped string does
not establish that someone fetched or correctly interpreted a source. Governance
and actual primary review remain essential. All approval metadata in tests is
explicitly MOCK ONLY and never imported by runtime code.

Readiness now additionally requires `policy_revisions` unique `{id:1}`, non-sparse,
non-partial, simple collation. This supplements Stage 3's index list and future
disposable provisioning plan. No index/collection was created here. Missing policy
collection/index =>503, not a memory fallback. Policy reads use the same session.
Mongo pinned-policy reads reject old/incomplete metadata rather than inventing
approval. Legacy Stage 3 fake fixtures remain old regression tests; their metadata
is not sufficient for activation through the new real Mongo boundary.

## Deterministic evaluation and safe integration

1. Registry records are selected by case category/session in the transaction.
2. Validate effective periods, identity and supersession. Unapproved relevant
   revisions block routing conservatively; a pending newer draft never silently
   permits an older interpretation. Explicit effective supersession excludes the
   superseded revision; unrelated eligible revisions conflict.
3. Match programme and independently supplied regular/January/ODL mode. Missing
   mode is review-needed, not inferred from academic-year text.
4. All eligibility predicates require server-supplied verified values, evidence IDs,
   units and verification timestamps. Caller booleans never establish proof.
   Applicable validity intervals must include the evaluation time; positive NBA
   accreditation additionally requires an explicit validity window. Claims that
   disagree with verified facts block selection. No division/seat conversion.
5. Unknown facts, ambiguous values including the candidate X=360, unresolved
   interpretation, human hearing or statutory consequence => review-required with
   `reasons: ['POLICY_REVIEW_REQUIRED']`, reviewReasons and no executable stages.
6. Exactly one fully matching approved revision yields a RouteExplanation with
   pinned ID, source/location/revision, evaluated facts/evidence metadata, condition
   reasons and explicit rationale for inclusion/exclusion of EVC.

The only executable paths supported by this interpreter are submitted → scrutiny
→ decision-pending, and submitted → scrutiny → EVC → decision-pending. No final
approval/rejection, penalty, withdrawal or hearing stage is calculated. A policy
requiring SHC remains review-needed because PR0 cannot represent a hearing stage.
Calendar-mode separation is implemented; real source-specific date calendars and
deadline calculations are not. There is no seven-day policy timer.

Intake validates the unchanged PR0 DTO, checks institution/scope and replay first,
then loads registry/verified facts and saves canonical route, optional policy ID,
case, audit, outbox and receipt in the same existing transaction. Verified route
starts at submitted; unresolved route stays policy_review_required. Intake itself
can succeed in that review state; this is not a successful route activation.
CaseSubmitted already permits policyRevisionId, so no new event was invented.

PolicyFactsReader is a server-only injection, not a request field. Its adapter must
read institution/case-scoped persisted evidence and accreditation validity using
the provided transaction. Default is absent: no route gets verified facts by
magic. PR0 repositories lack session-bound read methods; agree the reader contract
with M2/M3 before real integration. No client-provided reviewer fields accepted.

GET /applications/:id/explanation returns the persisted canonical explanation
under existing authentication/read permission and institution AND region scope.
No unscoped policy read or management endpoint was added.

Transitions load only the pinned revision; they never query latest policies or
reroute existing cases. V1 stored stages must exactly match that revision's route.
Existing M2 evidence, signed-prerequisite, role, version and route adjacency guards
remain. A new policy does not mutate a running case or change an idempotent replay.

## Candidate versus test scenarios and traceability

| Requirement/source | Fixture / condition | Explanation / test | Status |
|---|---|---|---|
| G02 reported p.42 accreditation branch | CANDIDATE-G02-A-r1 | Proposed no-EVC path; complete programme/level/institution/threshold/validity conditions unresolved | DRAFT, not seeded, blocked |
| G02 reported p.42 other eligible branch | CANDIDATE-G02-B-r1 | Proposed EVC path; same missing applicability checks | DRAFT, not seeded, blocked |
| T01/T11 distinct paths | SYN-* approved-shape fixtures in tests/policy/support.ts; verified predicates, explicit mode and evidence | Engine produces different source-linked paths, HTTP explanation persisted | MOCK ONLY engine proof; not source-approved AICTE routes |
| T12/T13 | Existing-intake ambiguousValues [360]; exact unit match | Routing tests reject equality and divisions/seat mismatch | Technical safeguards, full official formula not codified |
| T14 | Explicit mode match | Regular fixture cannot route January/ODL | Mode separation; calendar dates unverified |
| T19/T20 | Human-only categories / hearing flag / restricted stage tuples | No statutory outcome; required hearing blocks rather than fabricates a stage | Implemented fail-closed |
| T26 | Immutable ID, effective supersession and stored case pin | Old intake replay stays unchanged after r2; no policy migration API | MOCK ONLY persistence behavior |

Candidate effective date, programme list and predicates are explicitly placeholders
with unresolved reasons. They do not encode the complete AICTE rule. Merely changing
status/source.reviewState will not activate them: verification metadata and removal
of unresolved issues require a separately reviewed replacement immutable revision.

## Route-resolution contract blocker and proposed smallest extension

NOT IMPLEMENTED, deliberately: PR0 CASE_ACTIONS has no resolve_route, EventPayloads
has no PolicyRouteResolved/CaseRouteResolved, and EndpointTypes has no resolution
endpoint. CaseTransitioned requires an existing CaseAction. Reusing start_scrutiny,
CaseSubmitted or an invented stage for policy activation would mislead M2/M3.
Unknown resolve_route through /transition still returns 422; no /resolve-route
executor is registered. Existing review-needed cases stay unchanged.

Propose for Member 2/3 review, without changing published files:
- `ResolveRouteCommand extends CommandBase { policyRevisionId: ID; evidenceVersionIds: ID[]; reason: string }`.
- `POST /applications/:id/resolve-route`, request above, ApiResult<CommandResult>.
- `CaseRouteResolved` payload `{caseId, policyRevisionId, beforeState, afterState}`;
  restrict beforeState to policy_review_required, afterState to submitted.
- Require server-verified policy_admin plus policy.manage and case.transition,
  explicit institution/region scope, expectedVersion, reason, persisted evidence,
  and evaluation of the complete applicable registry, not just the requested ID.
- Actor/case/resolve_route/key receipt scope, fingerprint and replay before stale
  rejection; already pinned cases cannot reactivate; changing payload conflicts.
- Save route/pin/version + accepted audit/outbox/receipt atomically through Unit;
  preserve facts/evidence and roll back all writes on any failure.

M2/M3 must update event consumers/validators and endpoint contracts together after
approval. This is a proposal, not an implemented operation or a claimed test pass.
Unauthenticated/cross-scope explanation guards and rejection of the unsupported
operation are tested; resolution version/atomicity tests await the actual contract.

### Review-ready contract details and decisions

The smallest proposal keeps CASE_ACTIONS and TransitionCommand unchanged and adds
one separate command, endpoint mapping/EndpointTypes entry and discriminated event
variant. The request schema must be strict, with positive integer expectedVersion,
bounded nonempty idempotencyKey and policyRevisionId, nonempty reason and at least
one valid evidenceVersionId. CommandContext/actor, timestamps, source, route and
target state are server-derived; reject caller copies. Source policy ID is a
requested candidate, not an instruction to override conflicting applicable rules.
Response remains the existing ApiResult<CommandResult>; no new success envelope.

Proposed actor rule is the conjunction of policy_admin role, policy.manage and
case.transition permission, plus explicit institution AND region grants (or a
server-issued global grant). A role alone grants nothing. This deliberately does
not inherit the operational-role list for start_scrutiny and does not confer
decision.record/demo_authority. Deployment must explicitly authorize resolution;
the open ADR is whether to reuse these two permissions or add the narrower
case.resolve_route permission instead. Do not silently provision either grant.

Authenticate and authorize before lookup/replay; concealed out-of-scope/missing
case =>404. Same fingerprint replay precedes stale/already-resolved checks, but
still checks current scope. Same key/different payload =>409 IDEMPOTENCY_CONFLICT;
new key/stale expectedVersion =>409 VERSION_CONFLICT. A new command can only
resolve an unpinned policy_review_required case; otherwise409 PRECONDITION_FAILED.
Source/applicability/evidence ambiguity =>409 POLICY_REVIEW_REQUIRED, zero writes.

CaseRouteResolved uses the existing EventEnvelope fields: contractVersion, unique
id, server actorId/requestId/occurredAt, applicationId and incremented caseVersion.
Payload has caseId, policyRevisionId, literal beforeState policy_review_required
and literal afterState submitted. Audit action resolve_route shares this event ID,
before/after state, new version, reason, pinned policy and evidence IDs; outbox and
receipt share the same transaction. No parallel writes or external publication.
Readers/participants must use that Unit session. Stored facts are not overwritten.

Clock ADR must be settled before implementation: Stage 3 validates policy effective
windows at app.createdAt, whereas evidence and source attestations may be verified
later. Do not use one asOf value to silently switch a delayed case to today's rule
or to reject all newly verified historical evidence. Proposed model retains
app.createdAt as policy applicability time and uses trusted command receipt time
for verification knowledge; evidence validity must cover the source-defined
applicability time. Source reviewers must confirm that convention per rule.
Separate these internal clock checks; no client backdating field or silent
createdAt mutation. Any choice to apply a later amendment needs a distinct reviewed
migration design, not this resolution command.

M2 impact: add CaseRouteResolved to exhaustive event validators/consumers; version
and state synchronization must recognize submitted without treating it as signed
scrutiny or generating an EVC before signed prerequisites. M3 impact: allowlist the
new event for durable audit/outbox handling and document/evidence reference reads;
do not create obligations, timers or statutory outcomes from route resolution.
Both members must review the session-bound read adapter and visibility of safe
evidence IDs. Shared contracts/schemas/eventPayloadSchemas/endpointMap/contract
tests and consumer switches must change together in a separately approved patch.

## High correctness review: confirmed defects corrected

The initial new regression run reproduced five failures; a separate pinned-source
regression also failed before its fix. Evidence below points to corrected code.
This review edited cases.ts, registry.ts, evaluator.ts, tests/policy/routing.test.ts,
tests/policy/http.test.ts, tests/core/mongo-adapter.test.ts and this handoff. The
complete Stage 4 inventory remains the same 13 paths listed above. Nine new test
cases were added: six policy cases and three native-adapter mock cases.

| Severity | Confirmed defect | Correction and code evidence |
|---|---|---|
| HIGH, prospective policy integrity | Expiration of r2 made an already superseded r1 selectable again | evaluator.ts historical supersession set follows approved effective replacements regardless of their later expiry |
| MEDIUM, availability/correctness | Expired intermediate r2 broke r1→r2→r3 suppression, yielding a false conflict | evaluator.ts walks the complete validated ancestor chain |
| MEDIUM, approval integrity | Blank authors and whitespace variants of the same reviewer could satisfy distinct-author checks | registry.ts uses trimmed nonempty idSchema for both identities before comparison |
| LOW, evaluator boundary | String(program) accepted an array such as ['engineering'] | evaluator.ts requires an actual programme string; HTTP intake already rejected this shape |
| LOW, approval boundary | Invalid evaluation dates and string-valued numeric predicates could be called approved | registry.ts validates full policy/asOf and typed ordered/counting predicates; ambiguous boundary types must agree |
| MEDIUM, pinned explanation integrity | V1 transitions accepted altered source URL/title despite matching ID/revision/location | cases.ts compares every source field and requires exactly the single source selected by the interpreter |

These are development correctness findings, not a claim of an exploited deployed
system. The strongest risk is incorrect future routing if real approved policies
are provisioned. All existing AICTE candidates still remain draft/unseeded.
The legacy partial Source.location string only proves a nonempty stored reference;
semantic accuracy of its exact clause/page remains a human source-review duty.

Review also added same-region cross-institution HTTP isolation, absence of policy
insertion/approve/activate endpoints, safe HTTP503 on policy read failure, native
session propagation, policy-index-specific missing/partial/collation rejection,
and malformed/unapproved pinned-record denials. A typo in the expanded Mongo test
double initially caused 12 failures; it was corrected and the complete final suite
rerun. No application bypass or weakened assertion was used.

No change was needed to startup/model binding: explicit connection-bound models,
auto-index/seed restrictions and lack of memory fallback remain in place. Registry
approval remains deliberately conservative: a relevant unresolved draft can block
selection before programme/mode eligibility narrowing. This may require human
review even where a narrower precedence model could select a route; it never
silently activates one. Broader precedence semantics require source confirmation.

### Disposable database plan amendment — NOT EXECUTED

The Stage 3 plan's collection provisioning alone is insufficient for Stage 4.
After separate approval, use ONLY its labeled disposable container/approved image,
loopback port27028 and database sih_stage3_disposable. Apply this additional
mongosh JavaScript in that target before readiness tests (never on a shared DB):

```javascript
const target = db.getSiblingDB('sih_stage3_disposable');
if (target.getName() !== 'sih_stage3_disposable') throw Error('Wrong target');
target.policy_revisions.createIndex({id: 1}, {
  unique: true, sparse: false, collation: {locale: 'simple'}
});
```

Keep all seven prior Stage 3 required indexes. The new index must be single-key,
non-partial, non-sparse and simple; a key/revision compound index cannot replace it.
Test actual duplicate-ID rejection, missing-index503, partial/collated rejection,
policy-read rollback, independent-connection replay and historical pinning with
the approved synthetic-only dataset. Preserve earlier container/name/image/mount
checks and container-specific cleanup. No DB/Docker commands were run in review.

## Verification and remaining work

- Focused `npm test -- tests/policy`: 38 passed / 2 files.
- Full `npm test`, after focused completed: 128 passed / 12 files. Includes all
  previous 87 Stage 2/3/PR0 tests. No auth timeout reproduced.
- Relevant strict TypeScript: passed using installed tsc with --ignoreConfig,
  --noEmit --strict --skipLibCheck --esModuleInterop --allowJs --module ESNext,
  --moduleResolution bundler --target ES2022 --resolveJsonModule,
  --allowImportingTsExtensions --jsx react-jsx over core/persistence/policy/security,
  their tests and server.ts. No full checkJs claim.
- Global lint: failed exit 1 on untouched 3D components: missing Fiber/Three and
  consequent JSX/implicit-any types. Global build: failed exit 1 resolving Fiber;
  it also emits a chunk-size warning and ignored output before failure.
- No packages installed, lockfiles edited, server started, credentials created,
  Mongo connected/provisioned or Docker executed. Real database tests: NOT TESTED.
- All queue/session/rollback/concurrency approval-shape proofs remain MOCK ONLY.

Outstanding: primary errata and calendar review, exact applicable eligibility and
effective dates/units, signed source approval, governed append-only provisioning,
scoped persisted PolicyFactsReader with M2/M3, approved route-resolution contracts,
real replica-set persistence/atomicity checks (including the extra policy index),
frontend DTO migration and browser integration. M2 owns scrutiny/EVC domain checks;
M3 owns evidence/documents/obligations/timers/dashboard/outbox delivery. No such
domain implementation was added. No Stage 5 work.

Suitable for review as a PARTIAL infrastructure checkpoint only. Next: review the
conditions format and smallest PR0 extension with Members 2/3; obtain the primary
errata and approve narrow fixtures before enabling any regulatory route. Complete
isolated DB verification under separate authorization. Do not present mock routes
as official approval or call this Stage 4 complete.
