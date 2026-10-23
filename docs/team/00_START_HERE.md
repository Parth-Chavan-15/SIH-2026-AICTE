# Start here — numbered Member 1, Member 2, Member 3

## 0. Do not paste the entire old greenfield 83-file agent context pack into the working repository
It assumes a different implementation architecture and can misdirect an agent. **Keep the existing React 19 / Vite / TS / Tailwind, Express, and partial Mongoose work.** Preserve usable screens and interaction patterns; replace the unsafe data pathways.

## 1. Safety / coordination preflight (all three, before coding)
- Clone/fetch without overwriting or resetting: `git fetch origin`, `git status`, `git branch --show-current`, `git log -1 --oneline`, `git rev-parse origin/main`. If the remote differs from `0b61969996d512b5ad2745c79fde1e1cd7c3b14d`, inspect new commits and reconcile this plan.
- Do not code concurrently directly on `main`. No secrets in Git; only fictional institutions/accounts.
- All three read: `README.md`, `00_MANAGEMENT/DECISIONS_AND_SCOPE.md`, `01_SHARED/CONTRACT_FREEZE_CANDIDATE.md`, `01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md`, canonical research pp.5, 8–16 and final handoff.
- Choose how a local transaction-capable MongoDB replica set will be available; if not, **explicitly mark blocked**, do not silently fall back to process memory.
- Member 1 opens PR0 for the shared contract (use `07_CONTRACT_STARTER` as proposed source); Members 2 and 3 **review PR0 while immediately building against the supplied local contract copies/mocks**, not waiting idle.
- Each member uses ONLY the corresponding personal prompt; tag changes to shared contracts and request integration-owner review.

## 2. Member ownership at a glance
| Member | Code scope | Early independent deliverable | Must integrate with |
|---|---|---|---|
| **Member 1** | Core, identity, scope, Mongo transaction, policy, case, decision, frontend HTTP adapter, central integration | Typed DTO/route/error/event contracts, mock fixtures/ports, test harness and PR0 | Member 2's scrutiny/EVC validator, Member 3's obligation participant |
| **Member 2** | Signed scrutiny, correction guard, re-scrutiny, conditional EVC, related screens | Snapshot/correction/EVC domain module with fake Member 1 ports and its own negative tests | Case/policy/evidence/auth contracts; Member 1 command boundary |
| **Member 3** | Obligation, secure evidence versions, timers/outbox, dashboard, related screens | Decision-obligation participant and timer simulation, fake decision events and tests | Member 1 transaction/event hooks; Member 2 EVC completion when applicable |

## 3. Milestone gates, not independent feature wishlists
- **Gate G0 — Contract reviewed:** all three endorse `07_CONTRACT_STARTER`, exact role/state enums, error envelope, IDs, timestamps and API routes; PR0 merged.
- **Gate G1 — Trustworthy core:** unauthenticated/cross-scope/skipped/invalid-stage requests denied; durable case create/reload; transactional version conflict; 2 reviewed source-linked routes.
- **Gate G2 — Scrutiny/EVC:** signed D1/D2/C3 snapshot; only D1/D2 can be corrected; conditional EVC exactly once, no EVC on other path.
- **Gate G3 — Decision/compliance:** designated *fictional* demo authority, one sourced obligation, actual private file version and submitted-versus-verified review.
- **Gate G4 — Timers & monitoring:** one deterministic reminder, stale-generation cancellation, correctly scoped dashboard/timeline and green default tests.
- **Gate G5 — 5-minute demo:** second route + full case path + rejection proofs + screenshot/video + honest research claims.

**Before implementation**, have all three accept the decisions in `00_MANAGEMENT/DECISIONS_AND_SCOPE.md`. That file is a recommendation awaiting your team's approval—not an assertion that the design was already frozen or merged.

## 4. Source folders
- `08_REFERENCE_INPUTS/`: exact three provided inputs, unchanged.
- `00_MANAGEMENT/SOURCE_AND_AUDIT_TIMELINE.md`: the linear 138-page history map.
- `05_TESTS/`: requirement and acceptance ledgers, test/runbook, negative controls.
- `06_GITHUB/`: PR description and file ownership.

## 5. Questions when something conflicts
1. Public official clause verified for the applicable session? If unclear, stop rule automation -> `POLICY_REVIEW_REQUIRED`.
2. Conflict between illustrative PostgreSQL diagram and existing Mongoose? Prefer minimal-change MongoDB **conditional on transaction-capable configuration**; do not migrate without agreement.
3. Conflict between an old generated agent prompt and actual repo? Actual inspected repo plus final approved contracts win.
4. A claimed feature has only UI/mock evidence? Mark it `DEMO / UNVERIFIED` until integrated acceptance proves otherwise.
