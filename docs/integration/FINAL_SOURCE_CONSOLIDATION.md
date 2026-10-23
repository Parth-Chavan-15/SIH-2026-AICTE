# Final source consolidation

This merge combines Member 1 Stage 6 commit
87f0254be20e72cbb88acc4174361159481bf165 with team main
db687f662b372bc563e77e16399c4400adc30543. It preserves both histories and source;
it does not establish complete runtime integration, database durability or browser
acceptance. PR0 remains 0.1.0-proposed, not frozen. Policy candidates remain draft.

## Conflict resolutions and preservation

- server.ts retains Member 1's explicit approved database configuration, disabled
  automatic seeding/index creation, no memory fallback, cookie sessions, scoped
  routing and closed unauthenticated realtime subscriptions. The incoming server
  has no unique teammate module registration to recover.
- src/backend/routes/index.js retains canonical authenticated case/transition/
  decision routing. The incoming router is preserved byte-for-byte in
  [legacy-main-router.js.reference](legacy-main-router.js.reference), from the
  exact main commit above. This is NONEXECUTABLE source reference, not an import or
  registered router. It includes the original EVC/undertaking/notification/dashboard
  handlers, alongside legacy dummy-auth/fallback logic which must not run.
- CONTRACT_FREEZE_CANDIDATE.md is retained because main has no replacement.
  Required docs/team handoffs, examples and starter references are also retained,
  including both original starter contracts/ports and main's copied module versions.
  Only src/shared defines canonical runtime contracts; reference copies do not freeze
  or supersede it.
- The unchanged manifest's existing package-lock.json is retained, with no dependency
  resolution/install/update. Incoming README content is retained with a status note.
- All incoming M2 domain modules/tests, M3 models/tests, legacy UI/hooks and assets
  are preserved unchanged. No teammate domain implementation was rewritten.

## Intentionally disconnected runtime source

M2 mountM2Routes and legacy scrutiny/EVC routers remain unregistered: their optional
ports instantiate synthetic actors/cases, their local transaction contract differs
from canonical authenticated command boundaries, and snapshot/task state is held in
module maps. Wrapping those calls alone cannot make them part of a native Mongo
transaction. No mock participant was substituted into canonical production commands.

Legacy ApplicationDetailModal, EVCView and useScrutiny/useEVC source remain intact
but outside the active SessionGate/CanonicalNavigation import graph. Their local
fallbacks are not exposed as persisted success. Canonical pending views disclose
missing integrations. The incoming M3 test-local obligation/document/timer/dashboard
functions and models remain preserved without being represented as live canonical
evidence/obligation participants or delivery services. The legacy router reference
is never loaded, so its unscoped reads, GET seeding and dummy login are inactive.

## Combined validation

- `npm test`: 23 files passed, 1 skipped; 255 tests passed, 12 skipped.
- `npm test -- --maxWorkers=1`: the same pass/skip counts.
- `npm run build`: passed; 119 active frontend modules transformed.
- Established strict TypeScript check for the canonical server, frontend and
  Stage 2-6 sources/tests: passed. This is a scoped check, not global lint.
- `npm run lint`: failed with 117 diagnostics confined to AICTEWorkflow3D.tsx and
  GovernanceGlobe3D.tsx. Missing installed @react-three/fiber and three packages
  cause module-resolution, JSX intrinsic-element and implicit-any errors. These
  files are unchanged; no new combined-source diagnostics were reported.
- Zero unmerged entries, staged deletions or unstaged changes. All 29 incoming
  teammate source/test/UI/asset paths match incoming main. Canonical server,
  router, contracts, manifest and lockfile match Member 1's parent.
- Credential-pattern scan found no private keys, recognized provider tokens or
  credential-bearing database URIs in the staged changes. This is not a security
  certification.
- `git diff --cached --check` flags five inherited trailing-whitespace lines:
  README.md:5, README.md:12, evcEligible.ts:15, evcService.ts:54 and :55. The domain
  files are retained unchanged as required; these are not conflict markers.

Real MongoDB, Docker and browser tooling were not run. The 12 database-gated tests
were skipped; durability, transactions and end-to-end browser integration remain
unverified. No dependencies were installed or updated. Historical Stage 6 handoff
counts describe its earlier branch, not this combined test suite.
