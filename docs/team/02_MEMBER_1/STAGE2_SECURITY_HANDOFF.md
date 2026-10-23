# Stage 2 authentication and scope implementation

Branch: `feat/security-policy-case-core`, based on PR0 `3c045449e31a28d22d4d278e494bd8c2e58f9f7a`.
PR0 stays `0.1.0-proposed`; no contract changes, commits, pushes or DB runs.

## Implemented design

`src/backend/security/identity.ts` validates an explicitly configured fictional account
list with bcrypt cost 10-14 hashes (one consistent work factor), `.invalid` emails and `SYN-` actor IDs. There are
no built-in credentials, no plaintext password comparison and no JWT/persona
fallback. Passwords over bcrypt's 72-byte limit are rejected rather than truncated.
Unknown, inactive, malformed and wrong-password logins have the same rejection;
unknown accounts perform dummy bcrypt work. Login attempts are bounded per IP
(10/minute), sessions are bounded (1000), and client-supplied grants are rejected.

Sessions use 256-bit random opaque cookie values; only SHA-256 digests are retained
in a server-only Map. Session lifetime is 15 minutes, login rotates an existing
session, logout revokes it, and restart invalidates all sessions. Cookies are
HttpOnly, SameSite=Strict, path=/api/v1, Secure in production. Tokens/passwords/hashes
are never returned in JSON, written to localStorage or logged. The cookie is the
only session transport; legacy bearer tokens are deliberately rejected. Response
JSON matches PR0 SessionResponse: actor and expiresAt. PR0 CommandContext uses a
separate non-secret session correlation ID and request ID.

The implementation follows OWASP guidance for [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
and [origin-based CSRF protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
Mutations, including login/logout, require Origin exactly matching configured
CLIENT_URL; missing, null or foreign origins fail closed. CORS no longer uses a
wildcard. Production requires HTTPS; HTTP is permitted only for loopback demo
origins. Requests must go through the same-origin frontend/API deployment.

`authorization.ts` checks explicit verified permissions and institution AND region
scope; either empty grant list yields no records. A role never implies global
scope. decision.record requires both that permission and demo_authority role;
policy_admin and regional_officer cannot substitute. Institution-only actors cannot
transition cases even if misconfigured with that permission. Database queries
include scope before reads; memory test/demo storage uses the same predicate.
Legacy institutionCode/region values must exactly match configured PR0 IDs; no fuzzy
mapping or inferred grants. Denials generate bounded sanitized in-memory telemetry,
not a durable/certified security audit. No secrets or raw request body/query are
included. Mongoose User remains unused for authentication: there is no approved
durable demo-user store yet. Old memory persona credentials and JWT default removed.

## Local provisioning (required; no credentials supplied in Git)

Provide CLIENT_URL (default http://localhost:3000; production must use HTTPS) and
DEMO_AUTH_USERS_JSON through the process environment or private local secret setup.
The latter is an array of objects with this schema (placeholders, not credentials):

```json
[{"email":"institution@demo.invalid","passwordHash":"<locally generated bcrypt cost 10-14 hash>","active":true,"actor":{"id":"SYN-INSTITUTION","roles":["institution"],"permissions":["case.read","case.create","history.read","dashboard.read","notification.read"],"scope":"scoped","institutionIds":["SYN-INST-W"],"regionIds":["Western"]}}]
```

Generate hashes locally using the already installed bcryptjs and a privately
entered strong demo password (at most 72 UTF-8 bytes); do not put the password in
shell arguments, source, logs or chat. Do not use old fixture emails or dummy hashes.
Use separate explicitly scoped accounts for reviewers/officers. Giving a reviewer
all institutions in its region requires an explicit institutionIds list; an empty
list is not a wildcard. Review global grants and fictional authority separately.
An unconfigured/invalid account list cannot authenticate; valid-origin login
returns 503 when no accounts are configured. Restart to apply account/grant changes
and invalidate previous sessions. No env file or credentials were generated here.

No full app/server was started: server.ts still auto-connects/seeds its configured
database. Obtain approval for an isolated DB before running it. Tests instantiate
only the router and synthetic stores, never server.ts or Mongo connections.

## Route protection

| Existing route | Protection / behavior |
|---|---|
| GET /health | Public, no account/token material |
| POST /auth/login | Exact Origin, strict credentials, bcrypt, throttle; session cookie |
| GET /auth/me | Verified cookie, safe SessionResponse |
| POST /auth/logout | Verified cookie + Origin, revoke + clear cookie |
| GET /applications | case.read; scope added to storage query; client filters only narrow access |
| GET /applications/:id | case.read + scope; inaccessible/absent => concealed 404 |
| POST /applications | case.create + Origin + institution/region scope; SYN- institution required; ignores client identity/state/route authority |
| POST /applications/:id/transition | case.transition + officer role + scope + Origin; arbitrary mutator closed with 409 until Stage 3; final decision shortcuts forbidden |
| GET /dashboard/summary | dashboard.read; counts only scoped cases; fabricated domain counts removed |
| GET /audit-logs | history.read; audit application IDs restricted to visible cases |
| GET /notifications | notification.read, exact recipient and linked-case scope; legacy recipient-less records hidden |
| PATCH /notifications/:id/read | Same recipient/scope checks + Origin, concealed 404 outside grants |
| /applications/:id/decisions | Permission/authority reservation only; no decision executor; unauthorized 403, otherwise nonexistent endpoint 404 |
| Other API paths | Verified authentication then 404; no SPA fallback for missing API routes |
| Socket.IO | Connections rejected; arbitrary room subscription and global case broadcasts removed |

Future document/evidence endpoints require document.read/submit/review, verified
session, Origin for writes, institution/region ownership, and a persisted-version
lookup before private bytes are accessible. Future history/report/dashboard domain
endpoints require the same centralized checks plus safe exports. Future M2 scrutiny/
EVC commands require assignment checks and existing PR0 prerequisite ports. No M2/M3
domain endpoints or logic were implemented in this stage.

## Frontend compatibility and deliberate closures

SessionGate restores /auth/me or presents an accessible email/password form before
mounting existing screens. Sign-out/401 unmounts protected context. The role selector
cannot change identity; it directs users to authenticate another account. Reviewer
maps to the legacy regional_officer display label only; permissions stay server-side.
The HTTP adapter sends same-origin cookies and never sends UserProfile/role as
authentication. HTTP errors propagate; failed create/transition cannot produce
optimistic local success. Application, audit and notification reads use the server.

Old localStorage/mock authoritative data and simulated domain writes are removed
from the adapter. Unintegrated M2/M3/config getters yield empty arrays, writes report
explicit unavailable errors, and a visible demo banner identifies pending services.
Their UI files/3D work remain untouched. This closes fake local success without
implementing their domains. Complete frontend live data/DTO migration remains a
later integration stage, not proof supplied by this security work.

## Validation and boundaries

Tests exercise actual Express middleware/routes via HTTP, configured fictional
accounts and isolated memory case stores. The Mongo query test uses model doubles,
not real persistence; frontend adapter tests mock fetch. The production server,
browser, sockets over a real network and MongoDB were not started or certified.

AUTH-01..04 and RBAC-01..06 are covered, plus expiry/rotation/logout, exact-origin
CSRF, spoofed roles/actor IDs, empty grants, explicit global scope, query injection,
scoped audit/dashboard/notifications, missing permissions and pending workflow denial.
PR0 types/schemas are unchanged and consumed directly. No packages or lockfiles
changed. B14 security foundation and B01 scope checks are implemented/tested in the
isolated environment; B08 decision denial is tested, execution is absent. B02/B05
and B13 durable command/audit acceptance are not complete.

Actual verification:

- `npm test -- tests/security tests/workflow.test.ts`: PASS, 29 tests / 4 files.
- `npm test`: PASS, 52 tests / 7 files (includes unchanged PR0 and utility suites).
- Strict changed-file TypeScript: PASS. Used installed `typescript/bin/tsc` with
  `--ignoreConfig --noEmit --strict --skipLibCheck --esModuleInterop --allowJs
  --module ESNext --moduleResolution bundler --target ES2022 --resolveJsonModule
  --allowImportingTsExtensions --jsx react-jsx` over security modules/tests, session
  and API clients, SessionGate, AppContext, workflow tests and server.ts. Imported
  JS is exercised by HTTP tests; this does not claim full checkJs coverage.
- `npm run lint`: FAIL (exit 1); diagnostics only in untouched
  AICTEWorkflow3D.tsx and GovernanceGlobe3D.tsx: unresolved @react-three/fiber/three
  and consequent JSX/implicit-any errors.
- `npm run build`: FAIL (exit 1); Rolldown cannot resolve @react-three/fiber from
  AICTEWorkflow3D.tsx. Generated asset output is not a successful build.
- `git diff --check`: PASS. No dependency/lockfile/PR0/M2/M3 domain changes.

Browser verification and production/deployment security acceptance remain unverified.

## Remaining Stage 3 prerequisites and risks

- Obtain an approved disposable transaction-capable Mongo deployment; replace
  legacy case memory fallback and auto-seeding with explicit readiness/503 behavior.
  Scoped legacy create currently remains non-durable when DB is unavailable.
- Implement validated intake, expectedVersion/idempotency, named-action workflow
  guards, transactional case/audit/outbox writes before reopening transitions.
- Review two source-linked routes; keep unresolved applicability in policy review.
- Add real M2 prerequisite/assignment services and M3 atomic obligation participant
  before any authorized demo decision execution.
- Single-process sessions/throttles are intentionally ephemeral, not a multi-node
  session service. Production needs approved session distribution, revocation,
  operational secrets, proxy/TLS configuration and real durable security logging.
- Resolve the existing 3D dependency environment separately and run real browser
  acceptance before claiming end-to-end sign-in or UI integration.
- Agree how this branch integrates with main's known docs/team deletion; no history
  manipulation, main edit, PR0 freeze, commit or push was performed here.


## Final security review and checkpoint

Confirmed STAGE 2 DEFECTS corrected in this review (references are current source):

| Severity | Evidence and original failure | Correction |
|---|---|---|
| Medium | routes/index.js:104: old audit allowlist used String(a.id ?? a._id) and unfiltered applicationNumber; incomplete visible legacy records added undefined, allowing unlinked memory audit rows (and null/missing Mongo matches) | Accept only nonempty string identifiers; preserve actual ObjectId conversion; HTTP regression with incomplete legacy record |
| Medium | services/session.ts:25: response.json previously ran before 401 handling; malformed/HTML 401 skipped identity invalidation | Process 401 status before JSON; regression verifies metadata clearing |
| Medium | services/session.ts:22,30: late responses could clear a newer identity or repopulate private data after logout | Capture session revision; suppress old 401 invalidation and reject old successful responses; deferred-response regressions |
| Medium | services/session.ts:6,17: idle protected views stayed mounted past session expiry until another request | Browser expiry timer and synchronous metadata expiry check; fake-clock regression (not browser acceptance) |
| Low | features/auth/SessionGate.tsx:22: failed login retained entered password in component state | Clear password in finally on both outcomes |

Also corrected a Medium misleading-success defect in AppContext.tsx:378: the reset
callback only clears client cache/reloads server data, yet claimed all records were
restored. Its notification now explicitly says server records were not reset.

No confirmed credential-validation, server permission, Origin-check or ordinary
cross-institution/region bypass was found in reviewed existing routes. This is a
bounded review, not proof that no vulnerability exists. Previous tests would have
passed despite the audit/401/race issues above. Added restart, inactive-account,
duplicate-cookie, 72-byte bcrypt-boundary and misconfigured-permission tests make
those security claims explicit. Query doubles still do not prove real MongoDB behavior.

Safe local password hashing instructions (PowerShell, optional; NOT executed here):
use a private, untranscribed terminal and the installed bcryptjs. The password is
entered through SecureString, piped through stdin and never placed in a command
argument or printed. Only capture the hash in a variable; do not display it.

```powershell
$demoSecret = Read-Host 'Private fictional demo password (max 72 UTF-8 bytes)' -AsSecureString
$demoPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($demoSecret)
try {
  $demoPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($demoPointer)
  $demoHash = $demoPlain | node --input-type=module -e "import bcrypt from 'bcryptjs'; let input=''; process.stdin.setEncoding('utf8'); process.stdin.on('data', x=>input+=x); process.stdin.on('end', async()=>{const p=input.replace(/\r?\n$/,''); if(!p || Buffer.byteLength(p)>72) {process.exitCode=1; return;} process.stdout.write(await bcrypt.hash(p,12));});"
  if ($LASTEXITCODE -ne 0) { throw 'Hash generation failed' }
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($demoPointer)
  $demoPlain = $null
  $demoSecret.Dispose()
}
```

Use $demoHash as passwordHash in the fictional account structure above; serialize
with ConvertTo-Json -Depth 8 -Compress into process-local DEMO_AUTH_USERS_JSON,
without echoing it. Keep all account hashes at cost 12 if using this example.
Use UTF-8 pipeline encoding when entering non-ASCII passwords; client and hashing
input must use identical UTF-8 bytes. This handles plaintext briefly in process
memory, not a guarantee of forensic erasure. No password/hash was generated here.
Do not launch server.ts until its database target has separate approval.

Remaining blocker classification:

- CONFIGURATION REQUIRED: privately provision accounts/grants, exact CLIENT_URL,
  same-origin frontend/API reverse proxy and production HTTPS. Express currently
  does not trust proxy IP headers; behind a proxy the throttle shares that proxy's
  address. Configure trusted proxy hops only after reviewing the deployment.
- STAGE 3+: durable case storage/readiness, removal of fallback/auto-seeding,
  guarded commands/idempotency, durable audit/outbox, production distributed
  session/throttle operations. Transitions remain closed; no decision executor.
- OTHER MEMBER INTEGRATION: M2 assignment/prerequisite services and M3 private
  document/obligation participant/worker services, with the same central guards.
- EXISTING ENVIRONMENT ISSUE: all four packages are declared and resolved in the
  existing package-lock, but absent from node_modules: three 0.186.1,
  @types/three 0.186.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9.
  Manifest dependency/devDependency specs match lock root. Recommended repair,
  only after approval: npm ci using this package-lock to restore installed state,
  then rerun lint/build. Do not add packages or regenerate lockfiles for this defect.
- Browser integration, live Mongo queries and production TLS/proxy behavior remain
  unverified; no database was contacted, no packages installed and no Git staging,
  commit, fetch, history operation or push was performed in this review.

Checkpoint recommendation: Stage 2 implementation PASS for tested isolated scope;
overall closure PARTIAL pending configuration/browser/environment verification.
Safe as a development checkpoint, not a release. Suggested commit message:
`feat(security): enforce demo sessions and scoped authorization`.
Stage 3 development can proceed under separate authorization; real DB tests need
an approved disposable transaction-capable database first.

## Exact checkpoint file inventory

```text
docs/team/02_MEMBER_1/STAGE2_SECURITY_HANDOFF.md
server.ts
src/App.tsx
src/backend/data/memoryStore.js
src/backend/middleware/auth.js
src/backend/routes/index.js
src/backend/security/authorization.ts
src/backend/security/identity.ts
src/context/AppContext.tsx
src/features/auth/SessionGate.tsx
src/services/api.ts
src/services/session.ts
tests/security/auth.test.ts
tests/security/client.test.ts
tests/security/helpers.ts
tests/security/mongo-scope.test.ts
tests/workflow.test.ts
```
