# Stage 6 disposable acceptance procedure — NOT EXECUTED

Neither infrastructure nor package installation is authorized. These are commands
for separate review, not a record of execution. Do not reuse an existing database.

## Target and compatibility

Installed Mongoose 9.11.3 uses MongoDB driver 7.7.0; Node is 24.20.0 (installed
packages require >=20.19.0). Mongoose's [official compatibility table](https://mongoosejs.com/docs/compatibility.html)
lists MongoDB 8.x with Mongoose ^9.0.0. This supports the proposed Mongo 8.0 series,
but an exact official patch/image digest and platform still require review. No
digest has been selected, downloaded or verified. The old floating mongo:8.0
proposal is not reproducible approval.

Use a NEW named container sih-stage6-disposable, no host mounts, only loopback
27028, replica set sih-rs. localhost:27028 is advertised inside the container;
the client uses loopback plus directConnection=true, so it does not discover an
unreachable container hostname. This is a single-node local unauthenticated test
topology, not deployment security or HA proof. Reject any name/port collision.

After separate explicit approval of image, target, synthetic inserts and indexes:

Use one PowerShell session. The digest variable below must already contain the
separately reviewed official image/platform value. The code checks native exit
codes explicitly (PowerShell does not turn a nonzero Docker exit into a terminating
error automatically). It refuses existing target environment variables rather
than overwriting or deleting a previous operator configuration. No command below
has been executed during this review.

```powershell
# Assign the separately approved official mongo@sha256 digest; never a floating tag.
if ($approvedMongoImage -notmatch '^mongo@sha256:[a-f0-9]{64}$') { throw 'Reviewed image digest required' }
if ((Test-Path Env:SIH_REAL_DB_APPROVAL) -or (Test-Path Env:SIH_REAL_DB_URI)) { throw 'Use a clean target environment' }
function Invoke-Stage6Docker {
  param([string[]]$DockerArguments)
  $dockerResult = & docker @DockerArguments 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Docker command failed; stop and inspect the named disposable resource' }
  $dockerResult
}
$existing = Invoke-Stage6Docker -DockerArguments @('container','ls','-aq','--filter','name=^/sih-stage6-disposable$')
if ($existing) { throw 'Container-name collision; do not remove/reuse the existing resource' }
$portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,27028)
try { $portProbe.Start() } finally { $portProbe.Stop() }
# The probe is not a reservation. Docker must also succeed; a later port collision aborts.
Invoke-Stage6Docker -DockerArguments @('run','--pull=never','--name','sih-stage6-disposable','--label','sih.stage6=disposable','-d','-p','127.0.0.1:27028:27028',$approvedMongoImage,'mongod','--port','27028','--replSet','sih-rs','--bind_ip_all')
# --pull=never requires an already separately approved/pulled digest. No implicit download.
# Pipe JavaScript through stdin to preserve quotes in Windows PowerShell native arguments.
$containerMongoUri='mongodb://127.0.0.1:27028/?directConnection=true&serverSelectionTimeoutMS=1000&connectTimeoutMS=1000'
$pingScript = @'
if (db.adminCommand({ping:1}).ok !== 1) quit(2);
'@
$serverReady=$false
for ($attempt=0; $attempt -lt 40; $attempt++) {
  $pingScript | & docker exec -i sih-stage6-disposable mongosh $containerMongoUri --quiet --file /dev/stdin
  if ($LASTEXITCODE -eq 0) { $serverReady=$true; break }
  Start-Sleep -Milliseconds 500
}
if (-not $serverReady) { throw 'MongoDB did not accept connections; stop for inspection' }
# Startup ping and later primary checks are distinct; neither proves transactions.
$initScript = @'
const result = rs.initiate({_id:"sih-rs",members:[{_id:0,host:"localhost:27028"}]});
if (result.ok !== 1) quit(2);
'@
$initScript | & docker exec -i sih-stage6-disposable mongosh $containerMongoUri --quiet --file /dev/stdin
if ($LASTEXITCODE -ne 0) { throw 'Replica-set initiation failed; stop for inspection' }
$primaryScript = @'
const hello = db.adminCommand({hello:1});
if (hello.ok !== 1 || hello.setName !== "sih-rs" || hello.isWritablePrimary !== true) quit(2);
'@
$primaryReady = $false
for ($attempt=0; $attempt -lt 40; $attempt++) {
  $primaryScript | & docker exec -i sih-stage6-disposable mongosh $containerMongoUri --quiet --file /dev/stdin
  if ($LASTEXITCODE -eq 0) { $primaryReady=$true; break }
  Start-Sleep -Milliseconds 500
}
if (-not $primaryReady) { throw 'Expected replica-set primary did not become ready; stop for inspection' }
# A primary-ready hello is NOT evidence that transactions work.
try {
  $env:SIH_REAL_DB_APPROVAL='approved-disposable-stage6'
  $env:SIH_REAL_DB_URI='mongodb://127.0.0.1:27028/sih_stage6_disposable?replicaSet=sih-rs&directConnection=true'
  & .\node_modules\.bin\vitest.cmd run tests/real-db/native.test.ts --maxWorkers=1
  if ($LASTEXITCODE -ne 0) { throw 'Native acceptance failed; retain container and evidence' }
} finally {
  Remove-Item Env:SIH_REAL_DB_APPROVAL,Env:SIH_REAL_DB_URI -ErrorAction SilentlyContinue
  Remove-Item Function:Invoke-Stage6Docker -ErrorAction SilentlyContinue
}
```

The executable target guard rejects every other URI and absent approval. The suite
refuses a NONEMPTY database before any provisioning. No dropDatabase, automatic
cleanup, index dropping, server failpoints or downloads occur. It leaves synthetic
evidence for review; rerunning against that populated database must fail. Only
after inspecting/approving the exact container's label/image/loopback port and no
host mounts may an operator stop it and remove it with its anonymous volume:

```powershell
docker inspect sih-stage6-disposable
if ($LASTEXITCODE -ne 0) { throw 'Inspection failed; do not continue cleanup' }
# Human verifies the exact resource before these separately approved cleanup commands.
# Require label sih.stage6=disposable, reviewed digest, expected loopback mapping,
# and volume-only /data/db and /data/configdb mounts (no bind mounts).
# Do not run cleanup after an unexpected collision or without exact-resource approval.
docker stop sih-stage6-disposable
if ($LASTEXITCODE -ne 0) { throw 'Stop failed; do not continue cleanup' }
docker rm -v sih-stage6-disposable
if ($LASTEXITCODE -ne 0) { throw 'Removal failed; inspect manually' }
```

The official image's anonymous data/config volumes survive stop/start of this
same container. Removing with `-v` destroys them. Removing without `-v` can leave
orphan volumes which a new container does not automatically reuse. A future
container-recreation durability test needs a separately reviewed named-volume
plan; this procedure establishes none. Do not automatically clean up a failed
run: preserve synthetic evidence until reviewed. The approval environment flag
is a technical gate, not operational authorization or proof of exclusive ownership.

## Nine-index provisioning (prepared, not executed)

native.test.ts imports REQUIRED_INDEXES directly, avoiding a drifting second list.
Every entry is unique ascending single-field, simple collation, no partial filter:
applications caseData.id (sparse true), applications applicationNumber,
institutions id, institutions permanentId, core_audit id, core_outbox eventId,
core_receipts key, policy_revisions id, core_decisions id (all others non-sparse).
The test-only s6_obligations collection additionally has unique
(decisionEventId,conditionKey). This does NOT establish M3's production schema or
authorize its migration. Audit-history and scope/sort performance indexes require
workload measurements later; no migration is made here.

## Prepared versus missing evidence

Prepared REAL_DB tests: nine-index readiness, native unique-ID enforcement, intake
persistence with a recreated connection, ignored-response replay, conflicting
payload rejection, parallel intake, independent-client competing decisions,
same-key conditional replay and current permission/institution/region enforcement.
The twelfth scenario checks synthetic legacy rows remain absent from canonical
list, detail and history; it is prepared only, not native evidence yet.
Faults are injected AFTER actual case/decision/audit/outbox/receipt/obligation writes;
an independent connection checks case unchanged and zero accepted rows. Mongoose
models clone the actual application/record schemas onto each explicit connection.
All operations use the actual adapter's ClientSession. Synthetic M2/M3 participants
deliberately bypass domain proof ONLY INSIDE THIS TEST; never import them in runtime.
No source candidate is activated: the isolated fixture says MOCK ONLY throughout.

All 12 native tests are BLOCKED/NOT RUN. Skipping them in normal Vitest is not a pass.
Further tests still need implementation/approval: native failCommand transient retry
and lost commit acknowledgement; standalone topology target; destructive wrong/missing
index tests; missing policy/decision collections;
service-disconnect/reconnect; application/container restart with volume retained.
Do not equate connection recreation with a process/container restart. Existing mock
adapter tests cover those simulated error classifications, not native behavior.
Native failpoint work must be scoped to a test-only image started with test commands
enabled and separately approved; do not send server-wide failpoints to shared Mongo.

## Browser execution gate

No Playwright/Puppeteer/jsdom/browser runner is installed. The prepared Node test
tests/browser/member1.acceptance.mjs imports playwright only after explicit opt-in;
it never starts a backend, database or browser downloader. Syntax checking alone
does not execute browser tests. Before running, separately approve tooling, browser
installation, the loopback backend, fictional account grants and disposable DB.
Provide a PRIVATE JSON file outside source with email (@demo.invalid), password,
institutionId and otherCaseId (an existing opposite-scope synthetic case). Do not
put it in Git, print its contents, or run tests with traces/password screenshots.
The runner requires an absolute path, resolves symlinks, rejects paths inside this
repository and requires exactly those four fields. External placement does not
prove that another repository/cloud backup cannot track it: the operator must
check privacy, Git exclusion and restrictive file ACLs separately. The account
must be an institution with case.read/create and no decision permission;
configure CLIENT_URL to exactly http://127.0.0.1:3000. Do not reuse localhost cookies.

```powershell
# SIH_BROWSER_IDENTITY_FILE is the separately approved private fixture path.
# Assign it privately before execution; do not paste/print it or its contents here.
if ((Test-Path Env:SIH_BROWSER_APPROVAL) -or (Test-Path Env:SIH_BROWSER_ORIGIN)) { throw 'Use a clean browser target environment' }
if (-not (Test-Path -LiteralPath $env:SIH_BROWSER_IDENTITY_FILE -PathType Leaf)) { throw 'Private fixture is required' }
try {
  $env:SIH_BROWSER_APPROVAL='approved-fictional-stage6'
  $env:SIH_BROWSER_ORIGIN='http://127.0.0.1:3000'
  node --test tests/browser/member1.acceptance.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Browser acceptance failed; inspect only sanitized output' }
} finally {
  # Preserve the preconfigured fixture path; clear only this procedure's new flags.
  Remove-Item Env:SIH_BROWSER_APPROVAL,Env:SIH_BROWSER_ORIGIN -ErrorAction SilentlyContinue
}
```

With SIH_BROWSER_APPROVAL absent, `node --test tests/browser/member1.acceptance.mjs`
runs only pure HARNESS_ONLY configuration assertions and skips REAL_BROWSER before
any fixture read or optional import. A present but malformed approval flag fails
instead of silently skipping. These pure assertions and syntax checking do NOT
establish browser acceptance. Approved execution sanitizes Playwright/assertion
failures to a named stage so form values, IDs and private paths do not enter TAP
failure output; no traces/screenshots are enabled. Cleanup is attempted even after
failure. An absent backend fails the login/navigation stage, without startup fallback.
The fresh context blocks service workers and aborts requests outside the exact
approved origin, including redirects; fixture input starts only after the origin
check. This harness intentionally does not accept external asset dependencies.

Prepared journey: login; HttpOnly/SameSite/Path checks; refresh/restore; canonical
intake/review explanation; no decision controls; direct server decision denial;
cross-scope concealed detail; pending navigation; logout, cookie removal and an
anonymous data-request denial. This does not prove revocation of the old token;
the HTTP bridge tests that independently. Decision denial uses the just-created
in-scope case. The opposite-
scope fixture must be independently confirmed to exist by the approved operator:
a 404 alone cannot distinguish a nonexistent case from a concealed one.
It requires the REAL backend; there is no mocked-fetch browser fallback. If run
with the approved disposable DB this is browser+backend+DB evidence, distinct from
the native suite's synthetic domain adapters.

Still manual/not implemented browser scenarios: officer history/transition, stale
version refresh, decision form/prerequisite denial with authority, rapid case switch,
late intake response, duplicate submits, field cleanup, expiry/reauthentication,
failed logout/retry, login rotation/races, multi-tab session changes, proxy/HTTPS
Secure cookies and unsafe explanation links. All remain NOT TESTED until exercised
with approved actor fixtures and recorded results. Static/transport tests do not
establish these browser claims.
