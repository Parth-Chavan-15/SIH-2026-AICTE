# Shared contract starter — NOT yet merged / reviewed

**Purpose:** Members 2 and 3 can write against stable *proposed* inputs **before** Member 1 finishes their backend. This is a standalone, vendor-neutral TypeScript boundary; adapting it to existing `src/types/index.ts` must be reviewed before copying into the actual repo. Do not assume it already passes your project's TS config without running the project's typecheck after integration.

| File | Why it exists |
|---|---|
| `src/contracts.ts` | Single proposed DTO, enums, events and error envelope |
| `src/ports.ts` | Minimal dependency ports for modules and transaction participants |
| `src/mockCore.ts` | Clearly marked synthetic fixture ports; not real server security or database |
| `src/endpointMap.ts` | Canonical API pathname ownership |
| `fixtures/cases.json` | Fictional case/route snapshots, deficiency and ambiguity examples |
| `fixtures/events.json` | Synthetic causal event sequence for Member 3 |
| `examples/*.json` | Response and command shape examples for all team members |

**Contract state:** `0.1.0-proposed`. `Member 1` to publish reviewed `v0.1.0` in PR0, all three approve. Member 2/3 use these copies locally *immediately* with mock clients; no waiting for live API. After PR0 merge, update each branch to the canonical shared package and remove duplicate local contract copies.

Do not commit the source PDFs or multiagent context pack into production without project-owner approval; use the zip as external reference.
