# Stage 5 decisions and canonical UI

Status: PARTIAL development implementation, not production acceptance. Branch
feat/m1-decisions-ui-integration started clean at Stage 4 commit
074030481bac355c02e24968dd960e9af85ab019. No Git publication performed.
PR0 remains 0.1.0-proposed, unchanged and not frozen.

## Exact inventory

Modified:
- src/App.tsx
- src/backend/core/router.ts
- src/backend/core/storage.ts
- src/backend/persistence/mongoCore.ts
- src/backend/persistence/records.ts
- src/backend/routes/index.js
- src/features/auth/SessionGate.tsx
- src/services/api.ts
- src/services/session.ts
- tests/security/client.test.ts

Created:
- src/backend/core/decisions.ts
- src/features/applications/CanonicalWorkspace.tsx
- tests/decisions/core.test.ts
- tests/frontend/canonical.test.tsx
- docs/team/02_MEMBER_1/STAGE5_DECISIONS_UI_HANDOFF.md

No dependencies, lockfiles, shared contracts, policy fixtures or M2/M3 domain
implementations were changed. No server, database or Docker was started.

## Human decision command and authorization

POST /api/v1/applications/:id/decisions now consumes the existing strict
DecisionCommand and returns ApiResult<Decision>, with eventId. The existing
endpointMap already defines this shape. No new terminal CaseAction was added.
Only server cookie identity, decision.record permission AND demo_authority role
authorize the command. Source institution/region grants intersect; an absent or
out-of-scope case is concealed as404. Origin is mandatory on mutations. Client
actor, role, target-state and prerequisite flags are rejected as unknown fields.
The UI cannot grant authority. All outcomes are explicitly fictional demo records,
not statutory AICTE approval, rejection, withdrawal or penalty.

Require a nonempty human reason, expectedVersion, idempotency key, nonempty
evidence IDs, decision_pending state, approved v1 pinned policy, matching session,
category, effective window, exact route stages and complete source identity. The
approved rule gate also rejects unsupported hearings and unresolved interpretation.
The reason persists in the accepted audit event; PR0 Decision has no reason field.

Require M2's attestation of signed scrutiny completion (including cleared deficiencies
and required re-scrutiny), signed EVC completion when present in the pinned path,
independently verified evidence, and the M3 transaction participant. Every missing
integration blocks with PRECONDITION_FAILED; no positive fallback exists. A checked
intake boolean or mere evidence-reference existence is insufficient.

Conditional source and policy IDs must match the pin; triggerEventId must reference
a returned signed prerequisite. M3 remains responsible for validating substantive
condition applicability and source-derived due dates; M1 does not calculate them.
Conditional outcome must have conditions, other outcomes must not. A statutory
penalty/withdrawal is not a supported outcome.

## Atomic continuity and storage

Within the existing transaction: load scoped case and receipt; replay the same
fingerprint BEFORE stale/finalized checks; reject a changed payload with
IDEMPOTENCY_CONFLICT. New commands check version and all guards, insert a Decision,
await M3, save incremented final case, accepted audit, DecisionRecorded outbox and
receipt. No external publication, notifications or parallel writes occur here.
Participant failure aborts the callback. The receipt stores an internal optional
Decision alongside the existing CommandResult, not a new public receipt contract.
Replay validates decision/case/actor/policy/event/version/outcome bindings and scope.

CoreDecision is an infrastructure record in core_decisions using the same model
connection and ClientSession. Its data is validated by the shared decisionSchema;
default repository writes use the existing TransactionContext.decisions interface.
Additional readiness prerequisite: core_decisions unique single-key {id:1}, simple
collation, non-sparse, non-partial. This extends the earlier approved-test index
plans; provisioning requires separate approval. No collections/indexes were created
automatically or manually. Missing readiness never selects memory storage.

M3 materialize is mandatory even for nonconditional/rejected outcomes (normally no
conditions). For conditional decisions M1 wraps the obligation repository, validates
canonical records and current case/institution/decision/source/trigger/due metadata,
rejects duplicate condition keys, and requires exactly one successful write per
condition before accepting the command. A no-op participant cannot fake conditional
continuity. M3 must return its canonical Obligation[] as the existing port requires.
New obligations must start pending at version 1; the returned array must exactly
match successful wrapped writes. Condition keys are reserved before awaiting insert.
Integration inputs are detached snapshots. Prerequisite/evidence contexts reject
writes; the M3 context denies case/decision/scrutiny/EVC writes owned by core/M2.
Conditional ConditionInput.obligationType is not a field of PR0 Obligation: consumers
must not spread the entire input into a strict canonical Obligation DTO. The full
condition remains available on the Decision.

## Exact M2/M3 integration checklist

M2: ScrutinyPrerequisitePort.assertScrutinyComplete(tx), assertEVCComplete(tx) and
assertEVCEligible(tx), each Promise<PrerequisiteResult>. Decision acceptance consumes
the first two as applicable; eligibility remains in the earlier scrutiny/EVC path.
allowed:true must carry nonempty persisted prerequisiteEventIds for this case,
latest signed round and policy. Historical initial scrutiny alone cannot certify
that current deficiencies/re-scrutiny are complete. Reads must use the supplied
Unit session, scope and immutable snapshots. There is no M1 substitute service.
The actual PR0 PrerequisiteResult contains only allowed/event IDs (or denial), not
case/version/signature metadata. M1 now strictly validates true, nonempty normalized
unique IDs; it CANNOT independently prove those IDs identify the latest signed round
for this case. M2 must resolve them in its session-bound trusted reader and confirm
deficiency/re-scrutiny semantics. Any extension with applicationId,
evaluatedCaseVersion and policyRevisionId requires team approval; none was made.

M3: DecisionObligationParticipant.materialize(tx, command, decisionEventId):
Promise<Obligation[]> must perform all required writes through the supplied wrapped
repositories and await them. No HTTP calls, external notifications or detached
promises during retryable callbacks. Bind actual obligation repository models to
the same native session through createMongoStorage({participants(session)}).

M3 evidence: server-only DecisionEvidenceReader.assertVerified(tx, ids):Promise<void>
must independently verify persisted scoped, current, non-superseded evidence and
required source/status/validity. It is deliberately distinct from the existing
intake EvidencePrerequisite.assertReferences, which only promises reference checks.
The existing DocumentPort.getVersion has no transaction context and cannot by itself
satisfy this read contract. Agree this internal adapter with M3; no published PR0
signature was changed. Default production supplies neither reader nor participant.
TransactionContext contains metadata and write repositories, but neither a native
ClientSession nor document-read capability. Supplying transactionId alone does not
bind a static injected evidence reader to Mongo's session. Smallest proposed internal
integration: create a verified-evidence reader per native session (a reader factory
beside participants(session)), or add a Unit-owned session-bound read capability.
Agree with M3 before implementation. M3 must prove same-case/institution applicability,
verification status, supersession/expiry and source-derived dates; matching a supplied
date/source structurally is insufficient legal verification. No arbitrary future-date
rule was invented. These are blocked integrations, not demonstrated live guarantees.

Consumers must handle the existing DecisionRecorded event at incremented caseVersion,
with envelope ID matching Decision.eventId and payload actor/case/policy/source.
M3 must not materialize the same obligations again asynchronously after the atomic
participant already wrote them. Agree unique(decisionEventId,conditionKey) on the
future obligation store, delivery dedupe and timer-generation semantics separately.

Minimum synthetic real-integration fixture: fictional scoped registry/account,
approved-shaped mock policy (never a claimed verified AICTE policy), decision-ready
case, latest signed clear scrutiny, optional completed EVC, independently verified
document versions, and session-bound obligation repository. Test successful and
failed decisions, lost responses/replay, parallel versions, all required write
failures and restart persistence against an independently approved replica set.
All such real database tests remain NOT TESTED.

## Active frontend migration

App mounts SessionGate and CanonicalWorkspace. The previous dashboard/navigation
shell and its AppContext remain in the repository but are no longer mounted by
the Member 1 entry point. This is a deliberate functional surface change: their
legacy DTOs, local simulation, fake SLA display and unintegrated domain panels are
not presented as working canonical flows. M2/M3 modules were not rewritten. Their
future navigation needs reviewed canonical integration; this does not claim the
old dashboard, 3D view or cross-member screens are migrated.
Unreachable legacy surfaces: overview dashboard, old application list/detail/intake
modals and search, workflow, simulation, pendency, EVC, compliance, document expiry,
notifications, reports, audit, rule configuration and user management. Canonical
case/intake/detail/history/explanation replace only their M1 equivalents. M2/M3
scrutiny/EVC/documents/obligations/notifications screens are not mounted. Neither
AICTEWorkflow3D nor GovernanceGlobe3D is imported by the active entry point.

Navigation plan: agree permission-aware view slots under SessionGate; migrate each
screen to the existing api/session transport and canonical envelopes, with server
scope checks and truthful unavailable states. M2 supplies scrutiny/EVC status and
commands, M3 supplies document/obligation/notification APIs, and dashboard needs their
scoped durable counts. Audit/report/admin views need separately agreed endpoints.
Restore views incrementally with browser/session tests; do not remount the old
AppContext simulation or legacy DTO mutations. The missing cross-member navigation
is a real functional acceptance gap, not evidence that those features were migrated.

The existing api singleton and requestJson cookie transport provide typed canonical
listCases, case, history, explanation, intake, transition and decide methods with
shared-schema response validation. Page items are parsed, not mistaken for arrays.
Canonical payloads contain named actions, expectedVersion and stable per-payload
idempotency keys, not a user profile or targetStage. Legacy mutation/read entry
methods explicitly reject use; old empty-list security fixtures were updated to
the canonical Page shape and test the active methods without weakening auth checks.
No Axios or second transport/client was added. No unsupported cursor/filter invented.

Institution grants expose intake fields and actual persisted ID/status. Review-needed
policy remains review-needed, not rejection. Scoped list/detail, history when granted,
and source-linked explanation render actual API data. Operational named actions and
human-decision controls derive from session permissions and roles; server checks
remain authoritative. Evidence IDs and human reason are required; conditional
decisions accept reviewed canonical condition JSON without calculating legal dates.
No local optimistic transition or approval occurs. Signed-prerequisite status has
no read endpoint in PR0, so the UI explicitly reports that inspection integration is
missing and relies on truthful server guards rather than displaying fake signatures.

Loading, empty, load failure, command failure, retry/refresh and server-confirmed
success are distinct. HTTP403/404/409/422/503 remain errors, with field issue metadata
where supplied. Stale conflicts recommend refresh. Non-JSON errors are sanitized;
401 clears identity. Session generation changes remount private UI; old-session
responses are discarded, older detail/list responses cannot win a newer selection,
and new-case selection clears command fields. A late command cannot jump back to
an old selected case. Repeated identical submissions reuse a key and in-flight
submissions lock; keys are not persisted across page reloads. Reauthentication is
required after expiry. No browser storage of cookies/passwords or credential logs.
Login/logout invalidate local identity before network completion and serialize
session actions in this module; overlapping restoration shares one request for
React StrictMode. Failed sign-out exposes a retry and does not claim cookie revocation.
Cross-tab authentication races and actual cookie/proxy/StrictMode behavior are NOT
browser-tested. CommandContext schema validation is structural: trusted server code
must still obtain identity from authenticate; this domain API does not authenticate
an arbitrary caller merely because its actor/session strings have valid shapes.

## Policy and shared-contract limits

Stage 4 candidates remain DRAFT, unapproved and unseeded. No new regulatory source
claim or source activation was made. Real cases stay policy_review_required until
the proper authorized route-resolution command exists. That PR0 command/event and
its clock/permission ADRs remain blocked exactly as in STAGE4_POLICY_HANDOFF.md.
No start_scrutiny or CaseSubmitted workaround was added. No final generic transition.

## Final review findings and reproductions

Severity describes the impact if a trusted adapter is buggy or miswired, not a claim
that an external caller can inject adapters. Code locations below are after fixes.

| Severity | Confirmed issue / reproduction | Correction and evidence |
| --- | --- | --- |
| HIGH | M3 changed command.outcome after Decision insertion; evidence reader appended unverified IDs. Red test produced divergent state/evidence. | decisions.ts:61,66,70,76 detach adapter arguments and writes; regression checks evidence and final state. Read contexts reject writes. |
| HIGH | Truthy allowed and a string/blank/duplicate prerequisite IDs passed the old checks. Three red cases accepted malformed attestations. | decisions.ts:17-21,55-59 strictly parse attestations and isolate read contexts. Semantic authenticity remains M2's obligation. |
| HIGH | M3 could insert an initial closed version-4 obligation. Red test accepted it. | decisions.ts:71-79 require pending/version 1, correct attribution, one reserved key per condition and exact returned records. |
| MEDIUM | Logout retained identity and accepted a pending private response until HTTP completion. Red test observed retained identity. | session.ts authAction invalidates locally before fetch; delayed-response regression rejects stale data. |
| MEDIUM | Two login requests could overlap cookie rotation. Red test observed the second request rather than a 409 rejection. | session.ts serializes authentication actions; mocked transport regression. Browser cookie ordering remains untested. |
| MEDIUM | Session serialization initially caused concurrent restore calls to conflict (new red 409 test). | session.ts shares restoration Promise; both consumers receive one result. |
| MEDIUM | Replay could accept internally consistent but request-mismatched outcome or changed source. Found by inspection; no pre-fix red run recorded. | decisions.ts:38-43 bind receipt to command outcome/conditions/evidence and current pin/source; corrupt-receipt regression. |
| LOW | Duplicate evidence IDs were accepted. Red test recorded a decision instead of validation failure. | decisions.ts:16 rejects duplicates before integration calls. |
| LOW | Pending intake could navigate back after a newer case selection. Found by inspection; no pre-fix browser reproduction. | CanonicalWorkspace captures selection version before intake; only current tickets navigate. Helper tests cover invalidation/change semantics, not DOM field cleanup. |

Additional hardening from inspection: strict CommandContext shape before permission
checks, deny M3 access to core/M2 write repositories, reserve duplicate obligation
keys before await, validate participant return data against completed writes. Regression
coverage includes wrong-case obligations, forged client triggers, replay after permission
removal, competing decision keys in a serialized MOCK queue, and native-operation
session arguments. Fake transaction rollback/CAS tests are not real Mongo concurrency.

## Tests and actual evidence

Verification used installed dependencies only:
- Final sequential run, npm test -- tests/decisions: PASS 34 (21:17:21, 1.70s;
  MOCK ONLY unit/HTTP transactions).
- npm test -- tests/frontend tests/security/client.test.ts: PASS 23 (21:17:29,
  570ms), comprising 18 transport/static-render/helper cases and 5 security cases.
- npm test -- --maxWorkers=1: PASS 180 tests / 14 files (21:17:37, 22.38s).
- npm test -- --reporter=verbose: PASS 180 tests / 14 files with DEFAULT parallel
  workers (21:18:08, 17.01s). Reporter only changed output, not concurrency/timeouts.
- Relevant strict TypeScript: PASS. The tsc check uses --ignoreConfig --noEmit --strict --skipLibCheck
  --esModuleInterop --allowJs --module ESNext --moduleResolution bundler
  --target ES2022 --resolveJsonModule --allowImportingTsExtensions --jsx react-jsx
  over core/persistence/policy/security TS, their tests, Stage 5 tests, App and server.
- npm run lint: FAIL on unchanged 3D modules missing Fiber/Three and consequent JSX
  types. npm run build: PASS for the active canonical app (118 modules). This no
  longer imports the legacy 3D shell; missing dependencies were not installed/fixed.
  package.json already declares Fiber, Three and Three types, and package-lock.json
  has their entries, but their node_modules package files are absent (Drei is absent
  too). This is an incomplete local dependency tree; tsc still checks unmounted
  files and emits cascading JSX/implicit-any errors. Minimal proposed repair is an
  approved restoration of the existing locked dependency tree, followed by lint and
  legacy-view checks, without changing versions or suppressing errors. Not executed.
- Browser click/session/cookie/proxy integration and Mongo durability/atomicity:
  NOT TESTED. Static React rendering and mocked fetch are not browser E2E evidence.
- Final Git checks: expected branch and unchanged starting HEAD; exactly 10 modified
  and 5 new approved paths, empty index, no unexpected deletion or tracked artifact.
  git diff --check and all-15-file trailing-whitespace checks passed. Pattern scans
  found no private keys, tokens, Mongo URIs, bcrypt hashes or absolute user paths.
  Password literal matches are mocked test inputs only, not configured accounts.
  Content review found synthetic records only; pattern checks are not a certification.

Exact strict check (PowerShell, installed tsc):

```powershell
$stage5Sources = @(Get-ChildItem src/backend/core/*.ts,src/backend/persistence/*.ts,src/backend/policy/*.ts,src/backend/security/*.ts,tests/core/*.ts,tests/security/*.ts,tests/policy/*.ts,tests/decisions/*.ts,tests/frontend/*.tsx | ForEach-Object {$_.FullName})
& .\node_modules\.bin\tsc.exe --ignoreConfig --noEmit --strict --skipLibCheck --esModuleInterop --allowJs --module ESNext --moduleResolution bundler --target ES2022 --resolveJsonModule --allowImportingTsExtensions --jsx react-jsx @stage5Sources src/App.tsx server.ts
```

### Default test instability investigation

Historical implementation runs were 160 passed/2 five-second auth timeouts, then
161 passed/1 timeout (before the 163-test baseline). Preserve these failures; they
were not reruns of the final 180-test code. The affected auth cases were
"empty scope denies reads; global scope must be explicitly granted" and
"rejects non-fictional accounts and unconfigured auth; throttles login attempts".
During this review, isolated verbose auth execution passed 18 tests (19.61s wall
time): these cases took 1418ms and 1675ms. In the final DEFAULT parallel run they
took 1526ms and 1494ms. Final serial and default results are recorded separately above.

Installed Vitest 5.0.5 uses availableParallelism minus one for normal maxWorkers;
this host reports 4 logical CPUs, so its default is 3. VITEST_MAX_WORKERS is unset
and no project worker override exists. "14 workers spawned" counts per-file
isolates, not simultaneous worker slots (even serial runs report 14).
Auth harnesses own isolated stores/identities and ephemeral supertest listeners;
no fixed port or shared database was found. Each harness hashes a random synthetic
password at bcrypt cost 10. The scope case creates three harnesses; throttling
performs ten comparisons. Stage 5 adds one HTTP auth harness; most new tests use
mocked fetch/storage. No demonstrated cross-file state race or persistent handle
explains the old failures. CPU/runner contention is plausible, but this controlled
sample does NOT establish a root cause or prove repeated CI stability. No bcrypt,
timeout, assertions, package or runner configuration was weakened. A config patch
is not justified by the passing final default run; investigate measured recurrence
before proposing one. Real browser/session races remain a separate acceptance task.

## Future approved disposable Mongo verification (NOT EXECUTED)

Readiness checks all NINE entries below; every index is a unique, ascending,
single-field index with simple collation and NO partial filter. Only caseData.id
is sparse. These are requirements for a separately approved disposable environment,
not permission to create or alter indexes now.

| Collection | Key | unique | sparse |
| --- | --- | --- | --- |
| applications | caseData.id: 1 | true | true |
| applications | applicationNumber: 1 | true | false |
| institutions | id: 1 | true | false |
| institutions | permanentId: 1 | true | false |
| core_audit | id: 1 | true | false |
| core_outbox | eventId: 1 | true | false |
| core_receipts | key: 1 | true | false |
| policy_revisions | id: 1 | true | false |
| core_decisions | id: 1 | true | false |

After explicit environment approval: bind every model/participant/reader to the
approved connection/session; verify replica-set or mongos session support, unavailable
and missing/wrong-index startup/readiness (no memory fallback), exact index options,
decision/obligation/audit/outbox/receipt rollback, same-key races, distinct-key CAS,
lost-response replay, driver retry behavior, restart persistence and process-session
revocation. Fault every required write, including decision and obligation writes.
The new mock observes the same session argument for decision/case/audit/outbox/receipt;
M3 obligation native session and evidence reads are still unimplemented. No native
write durability, transaction rollback or restart behavior has been proven here.

Initial development defects corrected: conditional mock fixture incorrectly spread
obligationType into canonical Obligation; tuple-union includes typing; selected-case
command field leakage/race; and the semantic gap between reference existence and
verified decision evidence. The latter now fails closed with a dedicated reader.

## Acceptance and next action

This is a reviewable PARTIAL development checkpoint. Mandatory live services are
absent, historical default timeouts need monitoring despite the current passing run,
real DB guarantees remain mock-only,
and browser interaction needs verification. Full Member 1 acceptance additionally
requires signed/source-reviewed policy fixtures, agreed resolution contracts,
M2/M3 integration, approved real replica-set tests (including core_decisions index),
browser/authenticated workflow testing and canonical navigation for other modules.
Next Git action: after acceptance, separately authorize staging exactly the 15 listed
paths, inspect cached scope/whitespace and create one development commit, suggested
message: feat(decisions): add guarded human decisions and canonical workspace.
No stage/commit/push is authorized by this review. Obtain M2/M3 adapter agreement and
separate disposable database/browser testing authorization before integration acceptance.
Do not start Stage 6 automatically.
