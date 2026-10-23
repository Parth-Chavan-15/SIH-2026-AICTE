# Message to send all three members

We are building SIH 2026 — AICTE PS 26262 from the **existing React/Vite/Express project**, not rewriting it. The earlier UI is useful, but the backend audit proved missing-token/login bypasses, cross-region data leaks, illegal stage transitions and separate localStorage/backend records. TypeScript and Vite build passed; existing 13 tests passed separately, though the default test command fails; automated browser verification was blocked by Chrome startup.

**Member 1** owns verified identity/tenant access, Mongo authoritative case, policy explanation and guarded commands, one central HTTP adapter, shared contracts, decision authority and PR integration. **Member 2** owns signed scrutiny snapshots, D1/D2 correction/C3 server rejection, conditional EVC and related UI. **Member 3** owns decision-generated obligations, versioned private evidence, one deduplicated/cancelable in-app reminder, accurate dashboards and related UI.

**Start independently today:** the kit contains `07_CONTRACT_STARTER` with exact proposed DTOs, API paths, `fakeCorePort`, fictional cases, example events and responses, so Members 2/3 build their modules immediately without waiting for Member 1. All three review the same contract; Member 1 integrates the one canonical copy in PR0. Don't each invent different API shapes.

Read `00_START_HERE.md` and your numbered member folder. Keep work off `main`, don't modify shared AppContext/API/types/router registration without Member 1 review, and attach negative tests with actual results. No real AICTE records or authority claims. The target is one real, defensible 10-step golden path and four research-grounded USPs, not 20 disconnected screens.
