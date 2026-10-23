# Stage 6 final integration and acceptance handoff

Overall: **PARTIAL**. This is uncommitted development work, not release acceptance,
penetration-test certification or official regulatory decision authority.
Branch: feat/m1-final-integration-acceptance. Starting HEAD:
6894ad2d46296bfc30cf472d0ae0d96ff8160cb6. PR0 remains 0.1.0-proposed, unchanged,
not frozen. No stage/commit/push, fetch/merge/reset, database/container execution,
dependency install, credential creation or policy activation was performed.

## Deliverables and traceability

- [Acceptance matrix](STAGE6_ACCEPTANCE_MATRIX.md): all A-Z capability groups,
  B/T requirement references, owner, implementation, evidence, gaps and eight
  system scenarios. Every end-to-end system scenario remains PARTIAL/BLOCKED.
- [Disposable acceptance procedure](STAGE6_DISPOSABLE_ACCEPTANCE.md): exact gated
  DB/browser commands, all nine indexes, topology, compatibility, cleanup and gaps.
- Executable source: core/integrationGuards.ts, CanonicalNavigation.tsx,
  tests/acceptance, tests/real-db and tests/browser/member1.acceptance.mjs.

## Actual baseline and ownership

Read the published shared contract/schemas/ports/endpoints/compatibility and Stage
2-5 handoffs, M1 DoD, M2/M3 handoff expectations and B01-B14/T01-T28 catalogs.
Backend runtime has only M1 core/security/persistence/policy modules and the
synthetic legacy test router. No approved M2 scrutiny/EVC or M3 document/obligation/
delivery implementations or recorded contract approvals were found. Their legacy
React screens use AppContext/legacy DTOs and cannot be treated as live integrations.
No branch was fetched or merged to obtain absent teammate work.

## Newly corrected security defects

These are trusted-adapter boundary defects, not evidence that an HTTP client can
inject adapter objects. Five initial adversarial tests failed before correction:

| Severity | Confirmed reproduction | Correction / source |
| --- | --- | --- |
| HIGH | Three malformed positive M2 results (truthy allowed/string IDs, blank IDs, duplicate IDs) finalized a scrutiny transition | integrationGuards.prerequisiteIds now used by cases.transition for completion AND EVC eligibility; strict true and normalized unique nonempty IDs |
| HIGH | Evidence reader changed actor ID and appended unverified IDs; accepted audit used forged attribution | cases.evidence sends detached read-only metadata and a copied ID array; policyFacts.load also receives a detached reader context |
| HIGH | Prerequisite reader appended an arbitrary accepted audit row during a transition | readerContext denies every repository write and emit; no longer gives readers transaction write capabilities |

Core create/transition also structurally parse CommandContext before authorization,
matching the decision path's approach. This is not session authentication by itself:
domain commands are trusted server APIs; raw HTTP actor/context fields remain rejected.
Decision behavior is unchanged; its existing reader safeguards moved to the same
internal helper so the two paths cannot drift. No PR0 interface changed.

New regression coverage: malformed M2 completions and EVC eligibility, mutation of
audit/evidence/intake snapshots, reader write denial, permission-aware navigation,
explicit pending views, strict disposable-target gates, and actual frontend client
roundtrip through Express/Supertest. The latter proves canonical intake/list/detail/
history/explanation/replay, Origin rejection, decision permission denial and logout
revocation together against MOCK storage. It is NOT a browser or DB test.

One existing core test expected a writable evidence-reader handle and subsequent
transaction expiry. It now asserts the stricter read-only denial both inside and
after the callback. Native repository lifetime/rollback tests remain in
core/mongo-adapter.test.ts; they were not removed or disabled. The first combined
run failed this old error-message expectation (1 failed/114 passed); after updating
the capability expectation all core regressions pass. No security assertion,
bcrypt rounds, test timeout or worker configuration was weakened.

## M2/M3 adapter agreement — PROPOSAL, approval absent

Current interfaces (unchanged):

```typescript
// src/shared/ports.ts
assertScrutinyComplete(tx: TransactionContext): Promise<PrerequisiteResult>;
assertEVCEligible(tx: TransactionContext): Promise<PrerequisiteResult>;
assertEVCComplete(tx: TransactionContext): Promise<PrerequisiteResult>;
materialize(tx: TransactionContext, command: DecisionCommand, decisionEventId: ID): Promise<Obligation[]>;
// Internal M1 evidence interface, src/backend/core/decisions.ts
assertVerified(tx: TransactionContext, ids: string[]): Promise<void>;
```

Connected live implementations: NONE. Production still fails closed when signed
M2 checks, verified evidence or M3 obligations are missing. No successful fake
adapter is installed in runtime; all positive fixtures are test-only.

M2 must resolve each returned event in the same native snapshot and establish
same case/institution, pinned policy, current signed round, cleared deficiencies,
deficiency-limited re-scrutiny and applicable EVC. PrerequisiteResult carries only
allowed/event IDs; structural validation CANNOT establish these semantics. Reads
now have no write capability. If a proposed M2 assert method writes, split the
signed domain command from the read assertion before integrating. M2 owns semantics.

M3 must resolve current, independently verified, non-superseded, valid document
versions in scope, with applicable document types/sources. DocumentPort.getVersion
has no native session and cannot substitute for this verification. transactionId
is correlation only. Proposed minimal internal wiring (NOT IMPLEMENTED):
native-session-bound reader factory on Unit creation, alongside participants(session),
returning the M2 prerequisite reader and M3 reference/facts/verified-evidence readers
closed over that ClientSession. Expire readers with the Unit. No native session
or raw database handle is serialized to DTOs. M2/M3 and M1 must approve the factory
API and context lifecycle before runtime wiring; static router-level injection
alone does not prove native snapshot binding.

M3 materialize must await exact wrapped obligation inserts, pending/version1,
same case/institution/decision/source/trigger/condition/dates and canonical return
records. ConditionInput.obligationType is not an Obligation property. Date/source
matching is structural, not source-derived applicability proof. M3 must confirm
domain calculation and uniqueness(decisionEventId,conditionKey), use the Unit's
native repository, avoid external effects/reentrant core writes and avoid creating
the same obligations again from DecisionRecorded. M3 alone owns timer generations,
delivery dedupe/cancellation and durable notification/dashboard projections.
Only staged outbox persistence exists; no delivery worker is connected.

## Route-resolution decision record — NOT APPROVED / NOT IMPLEMENTED

No recorded M2/M3 or shared-owner approval exists. Keep policy_review_required
cases unchanged; no undocumented action or CaseSubmitted workaround was added.
The complete original proposal remains in STAGE4_POLICY_HANDOFF.md, sections
"Review-ready contract details and decisions" and
"Route-resolution contract blocker and proposed smallest extension".

Ready-for-review minimal extension:

```typescript
interface ResolveRouteCommand {
  expectedVersion: number;
  idempotencyKey: string;
  policyRevisionId: ID;
  reason: string;
  evidenceVersionIds: ID[];
}
// POST /api/v1/applications/:id/resolve-route -> ApiResult<CommandResult>
// CaseRouteResolved payload:
// { caseId, policyRevisionId, beforeState:'policy_review_required', afterState:'submitted' }
```

Use existing envelope/version/error conventions, strict nonempty fields and
evidence; derive actor/time/source/route server-side. Proposed narrower permission
case.resolve_route plus policy_admin role and BOTH grants requires approval; Stage 4
also describes policy.manage AND case.transition reuse. No grant is provisioned.
Authenticate/authorize before scoped lookup and replay; concealed 404, conflicting
payload 409, replay before stale check, expectedVersion CAS. Only unpinned review
cases qualify. Re-evaluate all competing revisions and supersession; a requested
candidate cannot override ambiguity. Preserve original facts/evidence/createdAt.
Save pin/route/version, audit, outbox and receipt together; no external effects.

Clock ADR: propose case.createdAt for historical applicability, trusted receipt
time for verification knowledge, source-defined validity periods and separate
decision time. This needs source-review approval; do not use today's rules for
historical cases or reject later verification merely because it is later. Amendment
migration is separate. Update shared contracts/schemas/endpointMap/event validators,
M2 exhaustive consumers and M3 outbox allowlists together only after recorded consent.

AICTE candidates remain DRAFT/UNAPPROVED/UNSEEDED. No new legal source was interpreted
or activated. Official 2026-27 amendments, applicability, source digest/revision and
independent reviewer attestations remain outstanding. Synthetic test fixtures are
not official rules. Existing PR0 ADR-01 through ADR-10 still require recorded team
sign-off: roles/scope, session topology, action guards, transaction uniqueness,
review-needed semantics, decision payload, sources/delegation, uploads, package
ownership and case/task/evidence version boundaries. Earlier technical choices do
not silently constitute shared-contract freeze approval.

## Frontend and browser status

App mounts SessionGate -> CanonicalNavigation -> canonical cases or an explicitly
pending view. Visibility requires current session permissions; reviewer navigation
also requires an operational role. Server authorization remains final. Navigating
away unmounts case forms; session revision remounts the complete navigation shell.
Pending scrutiny/EVC/documents/obligations/notifications/dashboard panels show no
live records/forms and do not claim implementation. Legacy dashboard/search/modals,
simulation/3D, reports, audit/admin views and AppContext remain unmounted, intact.
No approved compatible M2/M3 live API was available to connect.

Browser evidence: NOT TESTED. Prepared executable institution journey and remaining
officer/decision/error/race/multi-tab/proxy scenarios are specified in the disposable
procedure. No Playwright, Puppeteer, jsdom or renderer framework is installed; only
node --check was run on the browser file. Mocked transport, static markup, selection
helpers and Supertest cannot establish actual DOM cleanup, browser expiry, cookie
rotation, failed logout retry or multi-tab privacy. A failed network logout may
leave a valid server cookie; local clearing does not claim server revocation.

## Real persistence status

REAL_DB: BLOCKED/NOT RUN. Twelve prepared native tests are skipped by default and
fail closed on unapproved target inputs. All nine required indexes are specified
from the adapter itself. New connections clone actual connection-bound schemas;
faults follow real writes and checks read independently. Positive M2/M3 dependencies
remain synthetic INSIDE tests. No native transaction, durability, restart, rollback,
retry or obligation-persistence guarantee has been proven. Additional native
failpoint/topology/index-mutation/process-restart scenarios remain unimplemented,
as itemized in the procedure. No DB access occurred during test collection/skips.

## Initial Stage 6 verification record (historical; before Ultra audit)

All commands used installed dependencies only, run sequentially:

| Check | Result |
| --- | --- |
| npm test -- tests/security | PASS 24, 10.19s |
| npm test -- tests/core | PASS 38, 3.35s |
| npm test -- tests/policy | PASS 38, 1.39s |
| npm test -- tests/decisions | PASS 34, 1.43s |
| npm test -- tests/frontend tests/security/client.test.ts | PASS 23, 592ms |
| npm test -- tests/acceptance tests/real-db | PASS 15; 11 REAL_DB skipped, 2.18s |
| npm test (final, 21:56:27) | PASS 195; 11 REAL_DB skipped, 19.88s |
| npm test -- --maxWorkers=1 (final, 21:58:32) | PASS 195; 11 REAL_DB skipped, 24.63s |
| Relevant strict TypeScript including tests/real-db | PASS |
| node --check tests/browser/member1.acceptance.mjs | PASS syntax only; browser NOT RUN |
| npm run lint | FAIL, only legacy AICTEWorkflow3D/GovernanceGlobe3D missing Fiber/Three and cascading JSX/implicit-any errors |
| npm run build | PASS, 119 modules, 474ms bundle step |
| Scope / whitespace / credential and personal-path review | PASS: exactly 4 modified/12 new; no deletions/staged files, no secret/personal-path matches |

Before the final HTTP-client addition, full runs passed 194 tests with 11 skipped:
default 14.01s, single worker 28.44s. Those are intermediate results, not the final
195-test tree. Historical Stage 5 default auth failures (160/2 and 161/1) remain in
that handoff. No auth timeout recurred in this Stage 6 sample. CPU contention remains
a hypothesis; a passing sample does not establish repeated CI stability.

Strict PowerShell command:

```powershell
$stage6Sources = @(Get-ChildItem src/backend/core/*.ts,src/backend/persistence/*.ts,src/backend/policy/*.ts,src/backend/security/*.ts,tests/core/*.ts,tests/security/*.ts,tests/policy/*.ts,tests/decisions/*.ts,tests/frontend/*.tsx,tests/acceptance/*.ts,tests/acceptance/*.tsx,tests/real-db/*.ts | ForEach-Object {$_.FullName})
& .\node_modules\.bin\tsc.exe --ignoreConfig --noEmit --strict --skipLibCheck --esModuleInterop --allowJs --module ESNext --moduleResolution bundler --target ES2022 --resolveJsonModule --allowImportingTsExtensions --jsx react-jsx @stage6Sources src/App.tsx server.ts
```

Environment: package.json and package-lock declare Fiber/Three/types (Drei too),
but package files are absent from node_modules. The active canonical bundle excludes
legacy 3D views; tsc still checks them. Proposed minimal repair is a separately
approved npm ci restoring the existing lockfile, followed by lint/build/strict and
legacy-view validation; do not change versions or suppress type checking. No install
was attempted. .env.example is absent; do not infer a safe configured environment
from older startup docs. Use the Stage 2 fictional-account configuration procedure
only after separate deployment approval, with hashes/private config outside Git.

## Ultra final correctness audit

This section supersedes current-result claims above without deleting the earlier
195/11 checkpoint or historical failing runs. Overall remains PARTIAL.

| Priority / classification | Finding and evidence | Repair / regression |
| --- | --- | --- |
| P1 boundary defect under an extended adapter (not external actor injection) | integrationGuards.readerContext spread copied unexpected callable properties and invoked unrelated enumerable getters | Explicit canonical-field allowlist. New pre-fix test failed (1 failed/18 passed); after repair 20 boundary tests pass, including nested alias isolation, all write denials and retained handles. Existing native adapter exposes no such extra capability; no remote exploit is claimed. |
| P1 MISSING TEST / false-positive risk | Native rollback tests accepted any STORAGE_UNAVAILABLE, even before the intended write | Each of six fault paths records completed native write in active ClientSession; test asserts that exact marker before inspecting rollback independently. Native code is typechecked ONLY, not executed; no pre-fix native reproduction claimed. |
| P1 MISSING TEST | HTTP client test used a cleared cookie jar to claim logout revocation and omitted cross-scope rows | Reuse saved old cookie independently after logout; explicit institution-only/region-only hidden fixtures, list total, detail/history/explanation concealment, transport headers and rejection state invariance. Focused HTTP/navigation: 5 passed. |
| P1 harness privacy/correctness (inspection) | Browser fixture could be inside repository; Playwright/assertion failures could print fixture detail; decision denial used a nonexistent case; click failure could orphan response wait | Resolved external private-file guard, strict fixture shape, stage-only sanitized errors, in-scope decision target and Promise.all wait/click. Optional tooling remains gated; no browser reproduction/run. |
| P2 gate evidence / procedure executability (inspection) | Malformed browser opt-in silently skipped; procedure lacked native exit checks, startup readiness and collision handling | Malformed present flag now fails. Added pure HARNESS_ONLY configuration test, bounded startup ping then separate primary check, native exit checks, quote-safe stdin JS, digest/no-implicit-pull, explicit name/port collision aborts, environment preservation and scoped cleanup/volume notes. PowerShell AST parse proves syntax only. |

No P0 remotely reachable security/data-integrity defect was established in this
audit. Design/integration risks remain: JavaScript clones are not native database
snapshot isolation or a sandbox against an arbitrary trusted adapter's own closures;
an allowlisted URI/environment flag is not resource ownership or human approval.
No claim of exhaustive penetration testing is made.

### Guard and historical-pinning verdict

Strict positive prerequisite parsing rejects absent/negative/malformed/extra fields,
empty/invalid/duplicate IDs including normalization collisions. All three M2 checks
use it. Reader objects expose only canonical metadata snapshots, replacement deny
repositories and deny emit; no unknown spread properties or unrelated getters are
forwarded. Exact IDs still do NOT prove same-case/current-round/signature/deficiency
or policy provenance; trusted M2 native readers remain absent. M3 verified evidence
and actual session-bound reader factory still require approval and implementation.

The suspected expired-historical-pin bug was NOT reproduced because approvedRule
does not compare effectiveFrom/effectiveTo to its asOf argument. That current-time
argument limits verification knowledge (verifiedAt), while cases.transition compares
case.createdAt to the pinned policy's effective window. New regression passes for
a January case progressing after its February expiry without reading/migrating to
a successor; a case created outside the window is denied with zero accepted writes.
No timestamp replacement or policy runtime change was made. A policy no longer
approved/reviewed still fails closed. Source-specific amendments, retrospective
verification and explicit case migration remain governed by the unresolved clock ADR.

### Harness and navigation verdict

Native target.ts was already an exact-string allowlist: aliases, credentials,
multiple hosts, different ports/databases/replica sets, extra/duplicate options,
fragments and malformed flags are now covered by 24 pure target tests. No parsing
normalization widens the target. Both approval variables absent means skip before
connection; present malformed values fail before createConnection. The operator
must still approve the exact empty target and exclusive container ownership.
An independent-MongoClient assertion and twelfth legacy-isolation native scenario
were added. All 12 remain NOT RUN. Nine required readiness indexes are unchanged;
s6_obligations is still synthetic infrastructure, not a production M3 schema.
Process/container restart, ambiguous commit/transient failpoints, standalone/index
faults, missing collections and network recovery remain unimplemented native scenarios.

The browser runner has one HARNESS_ONLY pure test, distinct from its skipped
REAL_BROWSER journey. It does not read a fixture or import Playwright when opt-in is
absent. The plain PowerShell origin string was already correct; no Markdown-link
origin defect existed. The prepared journey now checks actual cookie attributes,
cookie removal and anonymous 401 if executed, but old-token revocation is proven
only by the HTTP/Supertest test, not by cleared-cookie browser assertions. No
browser, Docker or DB execution occurred. The procedure's three PowerShell blocks
parse but have not been executed; actual image/digest/platform remain unverified.

Canonical navigation needed no production repair. Added static cases cover missing
session and restricted dashboard-only pending fallback/current-navigation semantics,
with no form/domain fetch. SessionGate revision remount and stale-response transport
checks remain in place; interactive effects, field cleanup, races, multiple tabs
and Secure-cookie/proxy behavior remain NOT TESTED. Pending M2/M3 sections are
unavailable, not completed live views. Old AppContext/3D remains unmounted.

### Ultra final verification (current corrected tree)

| Command / check | Actual result |
| --- | --- |
| npm test -- tests/acceptance/boundaries.test.ts | PASS 20 after one demonstrated pre-fix failure |
| npm test -- tests/security | PASS 24, 15.26s |
| npm test -- tests/core | PASS 38, 6.79s |
| npm test -- tests/policy | PASS 38, 1.68s |
| npm test -- tests/decisions | PASS 34, 2.24s |
| npm test -- tests/frontend tests/security/client.test.ts | PASS 23, 1.47s |
| npm test -- tests/acceptance tests/real-db | PASS 49; 12 REAL_DB skipped, 3.09s |
| npm test | PASS 229; 12 REAL_DB skipped, 14.25s |
| npm test -- --maxWorkers=1 | PASS 229; 12 REAL_DB skipped, 23.18s |
| Relevant strict TypeScript command above | PASS after type-only test annotation correction |
| node --check tests/browser/member1.acceptance.mjs | PASS, syntax only |
| node --test tests/browser/member1.acceptance.mjs, approval absent | 1 HARNESS_ONLY passed; 1 REAL_BROWSER skipped; no tooling/fixture access |
| Three PowerShell documentation blocks | AST syntax PASS; no commands executed |
| npm run build / npm run lint | Build PASS 119 modules (602ms bundle); lint FAIL only existing legacy 3D dependency/type errors |
| Scope, whitespace, credential/personal-path check | PASS exact 4 modified/12 new, no deletions or staged files; no actual secret/personal-path findings |

The first strict check found TS18046 in the new test's heterogeneous Object.values
write loop. An explicit function type annotation fixed it with no runtime change;
the 20-test boundary group and strict check then passed. The full runs above precede
only that erased type annotation; no runtime logic changed afterward. Browser pure
configuration run: 1 passed, 1 REAL_BROWSER skipped (155.55ms); PowerShell AST checked
all three procedure blocks without executing any commands.

No auth timeout recurred in focused or full runs; historical root cause remains unproven.
The exact 16-path scope and unchanged HEAD remain required. No shared contract,
M2/M3 domain module, dependency manifest/lockfile or policy fixture was changed.

### Operator approvals still required

1. M1/M2/M3: recorded consent on native reader factory/provenance semantics,
   obligation repositories/dedupe, event consumers and route-resolution permission/
   clock contract; absence of comment is not approval.
2. Dependency owner: approve lockfile-respecting npm ci, preserving source/lockfile,
   then rerun lint/build/strict and legacy 3D compatibility checks.
3. Infrastructure owner: approve exact official image digest/platform, dedicated
   loopback container/empty DB, nine-index plus synthetic test provisioning, evidence
   retention and exact-resource cleanup; run the reviewed procedure separately.
4. Browser/deployment owner: approve tooling/binaries, exact backend origin, fictional
   private account file/grants/ACLs and synthetic opposite-scope records; run the
   institution journey plus the remaining officer/race/expiry/proxy scenarios.
5. Source reviewers: approve applicable AICTE revisions/amendments and clock rules;
   candidates stay draft/unseeded. Only after native/browser evidence and cross-member
   review can final acceptance or an integration PR be considered.

Safe for a PARTIAL development checkpoint review if the final gates below match;
not release acceptance. Recommended later message remains
feat(acceptance): harden integration boundaries and prepare gated acceptance suites.
No commit, push or PR is authorized by this audit.

## Exact uncommitted inventory

Modified:

- src/App.tsx
- src/backend/core/cases.ts
- src/backend/core/decisions.ts
- tests/core/commands.test.ts

New/untracked:

- src/backend/core/integrationGuards.ts
- src/features/applications/CanonicalNavigation.tsx
- tests/acceptance/boundaries.test.ts
- tests/acceptance/http-client.test.ts
- tests/acceptance/navigation.test.tsx
- tests/acceptance/target.test.ts
- tests/real-db/target.ts
- tests/real-db/native.test.ts
- tests/browser/member1.acceptance.mjs
- docs/team/02_MEMBER_1/STAGE6_ACCEPTANCE_MATRIX.md
- docs/team/02_MEMBER_1/STAGE6_DISPOSABLE_ACCEPTANCE.md
- docs/team/02_MEMBER_1/STAGE6_FINAL_ACCEPTANCE_HANDOFF.md

Deleted: none. main and earlier milestone refs unchanged. Runtime server/config,
shared contracts, package manifests/lockfiles, policy candidates, M2/M3 domain
modules and legacy UI implementations were deliberately left untouched. Test-only
connection strings describe rejected inputs or the exact disposable loopback target,
not real credentials. No production records or user-specific machine paths added.

## Readiness and next actions

| Category | Assessment |
| --- | --- |
| M1 isolated code | Suitable for PARTIAL development review after recorded checks |
| Real persistence | BLOCKED; native suite not executed |
| M2/M3 integration | BLOCKED; approved native adapters absent |
| Browser | BLOCKED; tooling and environment unapproved |
| Regulatory source | BLOCKED; draft fixtures and unresolved clocks |
| Demonstration | PARTIAL; canonical guarded shell; no complete workflow demo |
| Production/regulatory | NOT READY |

No invented completion percentage. Accept code review first; agree M2/M3 reader/
participant signatures and route-resolution ADRs; authorize tooling/dependency
restoration and exact disposable DB/browser targets separately; execute native and
browser scenarios and retain evidence; then review a final acceptance checkpoint.
Recommended later commit: feat(acceptance): harden integration boundaries and prepare gated acceptance suites.
Publication/PR sequence: separate reviewed Stage 6 development commit on this branch,
cross-member contract review, approved infrastructure evidence, integration PR only
after comparing actual main differences. Do not auto-merge/restore docs or freeze PR0.
