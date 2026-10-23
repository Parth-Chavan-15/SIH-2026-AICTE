# Stage 3 case storage and command handoff

Status: **PARTIAL**. Implemented Mongo adapter and command infrastructure; real
Mongo durability/atomicity acceptance is **BLOCKED, NOT TESTED**. No database was
started/contacted. Branch `feat/case-persistence-commands`, base
`0d958f7ae1ba39d396fe5131a92034d213dabb88`. PR0 stays `0.1.0-proposed` unchanged.

## Architecture and exact scope

Modified: `server.ts`, `src/backend/models/Application.js`,
`src/backend/routes/index.js`.

Created:
- `src/backend/core/storage.ts`
- `src/backend/core/cases.ts`
- `src/backend/core/router.ts`
- `src/backend/persistence/records.ts`
- `src/backend/persistence/mongoCore.ts`
- `tests/core/support.ts`
- `tests/core/commands.test.ts`
- `tests/core/http.test.ts`
- `tests/core/mongo-adapter.test.ts`
- `docs/team/02_MEMBER_1/STAGE3_CORE_HANDOFF.md`

Application remains the same existing Mongoose model/collection. Its `caseData`
contains the canonical PR0 Application DTO. Existing required legacy fields are a
write-through compatibility projection, not another authoritative model or case
collection. Command reads use caseData only. Old documents without it are NOT
migrated or automatically interpreted: they remain untouched and excluded from
canonical reads. A reviewed legacy-data mapping is required before admitting them.
The old User/security/session code and shared contracts are unchanged.

Default API registration uses the Mongo core. The old router is accessible only
through explicit `store` injection when NODE_ENV=test; it has no default memory
store. Its Stage 2 tests remain legacy regression checks, not proof of the new API.
No runtime error/disconnection selects that router. Production notifications return
503 until a durable M3 adapter exists; recipient-less memory notifications are not
treated as durable data. No scrutiny/EVC/obligation/document worker was implemented.

Server startup removes default DB URI, automatic seed imports/writes and memory
seeding. Only explicitly configured MONGODB_URI is used. No server was run here.
autoCreate/autoIndex/buffering are disabled for the authoritative path. There are
no startup migrations, index creation, collection creation or destructive repairs.

## Readiness and indexes (manual approval required)

GET /api/v1/health is liveness only. GET /api/v1/ready returns 503 unless connected,
hello reports replica-set/mongos session support, and these exact unique indexes
exist. All case reads/writes also check readiness; a standalone server, dropped
index or DB outage never produces fake successful memory writes.

| Collection | Required unique key | Sparse |
|---|---|---|
| applications | caseData.id | yes (preserves unmigrated legacy documents) |
| applications | applicationNumber | no |
| institutions | id | no |
| institutions | permanentId | no |
| core_audit | id | no |
| core_outbox | eventId | no |
| core_receipts | key | no |

Partial/non-simple-collation indexes cannot substitute for these constraints.
Infrastructure models store a unique identifier and validated `data` payload.
Institution rows use canonical Institution fields; no institution creation API is
invented. An approved synthetic registry row must exist before intake. Pinned
policies are read-only PR0 PolicyRevision records from `policy_revisions`; registry
creation, reviewed source mapping and activation belong to Stage 4.

## API and validation

All protected endpoints retain verified Stage 2 cookie identity, exact Origin for
mutations, explicit permissions and institution AND region scope. Empty grants
deny; global access is never inferred from a role. No body actor/role/region grant
is trusted. Mongo filters enforce canonical scope before returning records.

- POST /api/v1/applications accepts PR0 IntakeCommand (strict unknown-field denial),
  returns ApiResult<CommandResult>, 201. Institution region comes from the persisted
  active registry row, checked against grants. Opaque UUID ID/reference, version 1.
- Accepted provisional software categories: extension_of_approval, new_institution,
  increase_intake, closure, conversion_coeducation, change_site. These are technical
  DTO keys, not regulatory interpretations; team review remains required.
- Academic session must be consecutive YYYY-YY. Facts currently require program
  (engineering/management/pharmacy/architecture/applied_arts), positive integer
  proposedIntake (technical bound 100000), optional boolean nbaAccreditation. No
  seats/divisions conversion or eligibility rule is inferred. Further category
  facts require Stage 4 schema/source review, not silent arbitrary fact acceptance.
- Supplied evidenceVersionIds require an injected scoped persisted-version reader.
  The default missing reader fails closed for nonempty references. Empty evidence
  is allowed for intake into review; it does not claim evidence was verified.
- Without Stage 4 routing, intake stores policy_review_required with an explicit
  review explanation and NO executable stages or invented policy revision.
- GET /applications returns ApiResult<Page<Application>>; GET /applications/:id
  returns a normalized canonical DTO or concealed 404. GET /:id/explanation returns
  the stored route. Region/stage filters narrow grants; unsupported legacy SLA
  filters return 422. Full cursor pagination is not implemented.
- POST /applications/:id/transition accepts strict PR0 TransitionCommand. Unknown
  action/targetStage/final decision text =>422; stale version =>409; illegal state,
  absent evidence or domain service =>409; unresolved policy =>409 review-required.
- GET /applications/:id/history returns Page<AuditEvent>. /audit-logs remains a
  scoped compatibility audit read. Dashboard returns explicit 503 until a complete
  PR0 DashboardSummary adapter exists; partial counts are not a successful summary.
  /decisions remains a permission guard
  with no executor. Auth endpoints remain available independently of DB readiness.

The legacy frontend adapter still submits the older intake/stage shapes and expects
array lists. These are now rejected/different canonical responses, not translated
into fake success. A reviewed frontend DTO/action migration remains an explicit
integration dependency; no frontend changes or browser integration claim here.

## Workflow and ports

Allowed implemented state edges, always constrained by adjacent stages in a pinned
route and an approved PolicyRevision with matching source/session/category/window:

| Action | State edge | Dependencies |
|---|---|---|
| start_scrutiny | submitted -> scrutiny_pending | persisted evidence references |
| complete_scrutiny | scrutiny_pending -> evc_pending or decision_pending | evidence, M2 signed scrutiny; EVC eligibility if applicable |
| send_for_decision | scrutiny_pending -> decision_pending | evidence and signed scrutiny; cannot skip required EVC |
| complete_evc | evc_pending -> decision_pending | evidence and M2 completed EVC |

Operational actor role plus case.transition permission is required; complete_evc
permits evc/regional_officer/bureau_officer, other edges reviewer/regional_officer/
bureau_officer. These are fictional operational grants, not statutory delegation.
Terminal approval/rejection is absent from generic actions. New review-needed cases
cannot progress until Stage 4 supplies a separately authorized route-resolution
operation. No automatic policy migration or decision execution exists.

M2 ScrutinyPrerequisitePort is consumed directly. Default missing dependency blocks
dependent actions; tests supply clearly synthetic positive/negative results.
return_deficiencies, submit_corrections, complete_rescrutiny and prepare_evc remain
known enum values but fail 409: their domain transaction operations are not supplied.
PR0 only exposes completion/eligibility assertions and write repositories; it lacks
signed-deficiency/correction/task-generation hooks. Do not simulate those domains
in M1. Review exact signatures plus case-version responsibilities with M2.

Unit.context supplies PR0 TransactionContext. Mongo participant repository factories
receive the actual ClientSession, with no commit method exposed. Case/domain writes
are constrained to the current case; absent decision/obligation/scrutiny/EVC
repositories fail closed. Audit/outbox writes also enforce case, actor and request
attribution; new outbox entries must be pending with zero attempts. Context DTOs
are copies, so participant mutation cannot change the closed-over guards. Case
saves must advance the expected version exactly once. M3 DecisionObligationParticipant is not executed in this
stage, but its future repositories can share this transaction. PR0 has no snapshot/
document-read methods; agree session-bound reader adapters (or reviewed port
extensions) before integrating M2/M3 assertions. No canonical port changes made.

## Atomicity, retries and error behavior

Each accepted command serially writes case/version, audit action, typed outbox and
idempotency receipt inside one Mongo ClientSession.withTransaction callback,
snapshot read concern, majority write concern. Every operation explicitly carries
that session. No parallel operations/HTTP/socket publication inside transactions.
Context methods expire at callback exit. Callback retries cannot publish effects.
See [Mongoose transaction guidance](https://mongoosejs.com/docs/transactions.html).

Create receipt scope is actor/institution/intake/key; transition scope is actor/
case/action/key. Server computes SHA-256 fingerprints over canonical sorted-key
validated JSON, including expectedVersion. Authenticate/authorize and load scoped
case/institution BEFORE receipt replay. Same request returns original event/result
before stale-version rejection; changed request =>409 IDEMPOTENCY_CONFLICT.
Unique receipt key prevents concurrent duplicate create commits. Compare-and-swap
matches case ID/version/ownership; a losing non-replay update =>409 VERSION_CONFLICT.
Driver transient/commit retries use withTransaction; a receipt-key E11000 retries a
fresh transaction (bounded three attempts) to read the winner's committed receipt.
Only E11000 from the receipt insertion with the exact key pattern receives that
fresh retry; unrelated duplicate keys return PRECONDITION_FAILED, not a false
IDEMPOTENCY_CONFLICT. Exhausted receipt races return 503. Connection/index/transaction failures
return sanitized 503; a possibly committed response failure is recovered by replay.
An unresolved driver commit result does not trigger an application-level callback
rerun. Session creation failures are sanitized; cleanup failure cannot overwrite
an acknowledged result or the primary command error. Receipt replay validates the
stored DTO and its binding to the requested key/case/institution before returning
it. Corrupt canonical rows/receipts fail closed with 503, without exposing raw data.

Compatibility updates preserve registry name/location and submittedAt rather than
overwriting them with synthetic defaults. New intake still uses explicit synthetic
location placeholders because PR0 Institution has no location fields; this is not
registry enrichment. Route projection reflects review-needed, scrutiny-only or
scrutiny-with-EVC status. Custom connections require explicitly bound models;
readiness rejects a model/connection mismatch before using a foreign session.

Readiness is a topology/session/index preflight, not a write-permission test or
proof that transactions succeed. The installed MongoDB driver owns transient and
commit retry semantics (`node_modules/mongodb/src/sessions.ts`, withTransaction).
Its internal retry window is separate from the three fresh receipt attempts.
Trusted M2/M3 adapters must await every session-bound operation and must never
publish externally during callbacks; mocks cannot establish those future adapters.

Accepted audit ID equals event ID; outbox stores that typed envelope with pending
delivery state. There is no publisher or M3 reminder engine. A failing audit/outbox/
receipt/required participant aborts the transaction. Denied domain commands leave
no accepted event or outbox; Stage 2 denial telemetry remains bounded in memory,
not a durable denial log or certified audit system.

## Final correctness review: confirmed defects corrected

Evidence below points to the corrected implementation. No claim of a remotely
exploitable production deployment is made; the participant boundary is currently
unintegrated and must still receive trusted, reviewed server adapters.

| Severity | Original defect | Correction / evidence |
|---|---|---|
| HIGH, participant integration integrity | Participant audit/outbox/emit accepted other cases or forged attribution; guards closed over mutable objects exposed to participants | mongoCore.ts Unit.context now copies context and case, and validates case/actor/request on audit/outbox/emit |
| HIGH, concurrency integrity | Case save could persist the same version, allowing a participant to defeat version advancement | mongoCore.ts Unit.save requires expectedVersion + 1 before CAS |
| MEDIUM, projection/data integrity | Every transition overwrote institution/location metadata with placeholders and labeled selected routes as review-required | mongoCore.ts projection separates insert-only placeholders from updates and reflects canonical route |
| MEDIUM, error/retry correctness | All E11000 errors were called idempotency conflicts; any key-shaped duplicate triggered an unrelated callback retry | mongoCore.ts ReceiptCollision is raised only by receipt insertion; other unique errors are PRECONDITION_FAILED |
| MEDIUM, response truthfulness | startSession errors bypassed normalization; endSession errors could mask an acknowledged commit or primary failure | mongoCore.ts transaction normalizes creation failure and protects the result during cleanup |
| MEDIUM, transaction binding | Custom connection without supplied models silently used global-connection models | mongoCore.ts readiness rejects missing/mismatched connection-bound models |
| MEDIUM, stored-data boundary | Receipt Mixed payload returned without DTO/binding validation | cases.ts replay validates key/result, then checks current scope and requested case/institution |
| MEDIUM, contract integration | Dashboard returned a successful partial object that did not implement PR0 DashboardSummary | router.ts returns explicit 503 until the full summary adapter exists |

Additional defensive checks reject an inconsistent policy/route identity. Existing
PR0 application validation already checks route/session/category agreement on Mongo
reads; this does not introduce a new canonical contract or policy interpretation.

Regression assertions cover exact error codes, structurally valid foreign-case
events, mutable-context attempts, version advancement, receipt corruption, fresh
retry bounds, ambiguous commit handling, cleanup errors, same-session reads/writes,
canonical HTTP Origin and permission gates, EVC sequencing, and malformed canonical
rows. Scope-query assertions verify generated Mongo filters only; actual server
query behavior remains in the real verification plan.

## Verification

All new fake queue/rollback/model/session tests are **MOCK ONLY**. They cannot prove
MongoDB durability, isolation, native retries, indexes or restart persistence.
The disconnected default Mongo boundary is exercised through authenticated HTTP,
without any connection. Stage 2 tests and PR0 tests remain unchanged and passing.

Actual results:

- `npm test -- tests/core`: PASS, 35 tests / 3 files (13 added regressions).
- `npm test` (focused run finished first): PASS, 87 tests / 10 files, including all 52 existing tests.
  A previous simultaneous focused/full run had 73 pass and one existing Stage 2
  five-second timeout under load; the isolated default rerun passed without source,
  timeout, assertion or bcrypt changes. Test runtime under contention remains a
  release-environment concern, not a suppressed failure. The timeout did not
  reproduce in the sequential final review runs; no timeout was increased.
- Relevant strict TypeScript: PASS. Installed tsc used `--ignoreConfig --noEmit
  --strict --skipLibCheck --esModuleInterop --allowJs --module ESNext
  --moduleResolution bundler --target ES2022 --resolveJsonModule
  --allowImportingTsExtensions --jsx react-jsx` over core/persistence/security TS,
  core tests, server.ts and imported router/security test consumers. JS routes are
  exercised via HTTP; no claim of full checkJs coverage.
- `npm run lint`: FAIL, exit 1, diagnostics only in existing AICTEWorkflow3D.tsx
  and GovernanceGlobe3D.tsx: missing installed Fiber/Three and consequent JSX types.
- `npm run build`: FAIL, exit 1, unresolved @react-three/fiber in AICTEWorkflow3D.tsx.
  Vite also emitted a large-chunk warning and ignored dist artifacts before failing;
  generated output is not evidence of a successful build. Fiber, Three and
  @types/three are declared/locked but absent from node_modules. Recommended repair
  is a separately approved restore of installed packages from the existing lockfile
  with the agreed package manager, rather than source/manifest/lockfile edits.
- Scope, credential-pattern and `git diff --check`: PASS. Three expected modified
  files and ten new files. No dependency/lockfile/PR0/M2/M3 domain changes.
- Live Mongo restart, concurrency, unique-index enforcement, rollback and durable
  outbox tests: BLOCKED pending separate approval and infrastructure.

## Proposed isolated real verification — NOT executed, requires approval

Suggested disposable single-member replica set, no host mounts/shared data,
loopback only. Everything below is a future approved procedure, NOT executed.
`mongo:8.0` is a floating series tag, not a reproducible image version. Separately
approve an official Mongo 8.0 patch/digest and compatible Docker platform, then
record the resolved image digest. Image availability and Docker are unverified.
Check that port 27028 and the container name are unused; abort on any collision.
Set `$approvedMongoImage` to that approved `mongo@sha256:...` value before running:

```powershell
docker run --name sih-stage3-disposable --label sih.stage3=disposable -d -p 127.0.0.1:27028:27028 $approvedMongoImage mongod --port 27028 --replSet sih-rs --bind_ip_all
docker exec sih-stage3-disposable mongosh --port 27028 --quiet --eval 'rs.initiate({_id:"sih-rs",members:[{_id:0,host:"localhost:27028"}]})'
docker exec sih-stage3-disposable mongosh --port 27028 --quiet --eval 'db.adminCommand({hello:1})'
```

Wait for mongod to accept connections before rs.initiate, then wait for hello to
report `setName: "sih-rs"`, `isWritablePrimary: true` and session support. Abort on
election/startup errors. The host test process and mongod use the SAME port 27028;
the advertised localhost name is reachable from that host. The test process must
run on the host, not in a second container where localhost means something else.
Use 127.0.0.1 in the seed URI to avoid IPv6 localhost resolution differences.
`directConnection=true` deliberately avoids discovering inaccessible Docker names
for this single-node test topology, as described in the
[MongoDB connection options](https://www.mongodb.com/docs/manual/reference/connection-string-options/).
This is not a production HA configuration or network/authentication test.

Proposed URI: mongodb://127.0.0.1:27028/sih_stage3_disposable?replicaSet=sih-rs&directConnection=true&serverSelectionTimeoutMS=3000
Approve image download/container startup, this exact target, collection/index
provisioning above and synthetic fixtures separately. Check local Docker/image
availability first. No existing DB, credentials, production deployment or migration
is authorized by this proposal. Never point these commands at a shared target.

After approval, execute the following provisioning JavaScript via mongosh INSIDE
that exact labeled container, after verifying its image, port and lack of host
mounts. Never run against another URI. `getSiblingDB` selects only the disposable
database. Do not invoke Application.syncIndexes, a seed importer or a migration.

```javascript
const target = db.getSiblingDB('sih_stage3_disposable');
if (target.getName() !== 'sih_stage3_disposable') throw Error('Wrong database');
const specs = [
  ['applications', 'caseData.id', true], ['applications', 'applicationNumber', false],
  ['institutions', 'id', false], ['institutions', 'permanentId', false],
  ['core_audit', 'id', false], ['core_outbox', 'eventId', false], ['core_receipts', 'key', false]
];
for (const name of [...new Set([...specs.map(s => s[0]), 'policy_revisions'])]) {
  if (!target.getCollectionNames().includes(name)) target.createCollection(name);
}
for (const [name, key, sparse] of specs) {
  target.getCollection(name).createIndex({ [key]: 1 }, { unique: true, sparse, collation: { locale: 'simple' } });
}
target.institutions.insertOne({ id: 'SYN-INST-W', permanentId: 'SYN-PERM', name: 'Synthetic institution', regionId: 'Western', status: 'active' });
```

Run provisioning once on an empty target; abort on duplicate fixture/index errors.
No partial or language-collated index substitutes for these exact constraints.
Use the synthetic policy and selected case from tests/core/support.ts only after
reviewing them as MOCK ONLY fixtures. Insert a selected case through the adapter's
transactional insert (so all required legacy fields exist), and the policy in the
same disposable DB. Do not activate a real policy or migrate existing records.
For real HTTP tests, supply an approved synthetic identity fixture to the router;
no production/demo credentials need to be generated or persisted for this test.

Acceptance tests to implement/run against the real adapter after approval:

1. Create/replay intake through HTTP, restart the application process, authenticate
   afresh (sessions intentionally do not survive), and verify identical case,
   version, audit, outbox and receipt. Restart the SAME container with its anonymous
   data volume retained and repeat. This single-node test does not prove HA.
2. Parallel identical intake keys: one case/audit/outbox/receipt, identical event.
   Changed payload with the same key: one winner and IDEMPOTENCY_CONFLICT, no loser
   rows. Use independent connections/processes, not the fake serialized queue.
3. Parallel transitions at one expectedVersion with distinct keys: exactly one
   commit and one VERSION_CONFLICT. Identical-key retries replay the winner.
4. Inject awaited failures on audit, outbox, receipt and session-bound participant
   writes: assert absence of ALL command writes from an independent connection.
5. Use controlled failpoints only in this disposable test setup to trigger native
   transient retry and lost commit acknowledgement; require no duplicate events.
   Also discard an HTTP response after a successful commit and replay the same key.
6. Verify actual unique index enforcement; drop/recreate one index only in this
   disposable DB and confirm readiness 503. Test non-simple/partial substitutions.
   A separate approved standalone container is needed for standalone rejection.
7. Seed fictional opposite-region/institution and legacy-only/partial rows; assert
   list/detail/history/count isolation, concealed 404 and safe malformed-row 503.
8. Stop only this container: all authoritative operations return 503 with no memory
   writes. Restart, await primary, verify existing data and replay lost responses.
   Confirm startup never seeded collections or changed indexes.

Safe cleanup, only after recording results: inspect the exact container and confirm
label `sih.stage3=disposable`, approved image, the loopback 27028 binding and no host
mounts. Then `docker stop sih-stage3-disposable` followed by
`docker rm -v sih-stage3-disposable` removes only it and its anonymous volumes.
Do not use system/volume prune, wildcard deletion or dropDatabase on another URI.
No Docker command, image pull, DB operation or fixture setup was performed here.
Do not claim T16/T10 or durability until the real acceptance tests actually pass.

Next checkpoint: review this development diff and approve an isolated database
test plan. Do not start Stage 4 policy or Stage 5 decisions automatically.
