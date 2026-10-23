# Architecture and scope — decision record (all three must sign off)

**Status: proposed for approval; not yet implemented or committed.** Enter three approvals below before making the shared-contract PR authoritative.

| ID | Recommendation | Why | Members' approval |
|---|---|---|---|
| ADR-01 | Retain React/Vite/TypeScript/Tailwind/Express and existing screens | Preserve tested build and useful UX | M1 [ ] M2 [ ] M3 [ ] |
| ADR-02 | Retain MongoDB/Mongoose **only if** a transaction-capable replica set and scoped indexes can be established | Source already partially models Mongo; avoids unneeded migration | M1 [ ] M2 [ ] M3 [ ] |
| ADR-03 | No silent production memory fallback. Storage unavailable -> readiness failure/503 | Avoid fake durable approvals | M1 [ ] M2 [ ] M3 [ ] |
| ADR-04 | HTTP API authoritative; `src/services/api.ts` becomes typed HTTP adapter. Any local demo adapter is deliberately isolated and clearly labeled | Frontend/backend currently separate | M1 [ ] M2 [ ] M3 [ ] |
| ADR-05 | Deny-by-default identity/RBAC and institution/region scope on all commands/reads/files/events | Runtime confirms critical bypasses | M1 [ ] M2 [ ] M3 [ ] |
| ADR-06 | Mongo session transaction for case + decision + obligation + audit + outbox; expectedVersion and idempotency key | Concurrency and one obligation guarantee | M1 [ ] M2 [ ] M3 [ ] |
| ADR-07 | Two **reviewed** 2026–27 demonstration policy fixtures, documented scope and source; no inferred rule for X=360 | Respect errata and uncertainty | M1 [ ] M2 [ ] M3 [ ] |
| ADR-08 | Explicit, fictional `demo_authority` privilege; no automated legal decision | AICTE competence boundaries | M1 [ ] M2 [ ] M3 [ ] |
| ADR-09 | One evidence type and one local-only deterministic demo reminder policy initially, distinct from official deadlines | Protect deadline and finish MVP | M1 [ ] M2 [ ] M3 [ ] |
| ADR-10 | Member 1 owns shared files; Member 2 owns scrutiny/EVC; Member 3 owns documents/alerts/dashboards | Minimize merging conflict | M1 [ ] M2 [ ] M3 [ ] |

## Source precedence, not assumptions
The canonical research PDF supports version-sensitive AICTE routes, APH 2024–27 plus updated 2026–27 addendum/errata, and APH §1.8(g) re-scrutiny limited to original deficiencies. It does **not** authorize a complete machine interpretation of ambiguous cases, claim that existing AICTE systems lack an internal feature, authorize current officer roles, or establish internal SLAs. Use `POLICY_REVIEW_REQUIRED` for unresolved exact X=360 and unsupported categories. Do not infer seats from division units. Applicable EVC/SHC/appeal is conditional, never universal. Academic/session cutoffs, event-relative deadlines, validity expiry and fictional internal demo SLAs have distinct types.

## What not to build before gate G5
No predictive AI or AI decision automation; no full BPMN engine or process mining; no claimed live AICTE/NIC/NSWS/banking integration; no real statutory penalty, legal-signature certificate or payment settlement; no advanced hearing/appeal, dual-time query engine or linked-case graph unless core golden path passes. Optional conformance checker last.

## Realistic scope / date
The internal-college submission deadline in this conversation is **25 October 2026 at 19:00 IST**. Preserve sufficient review/demo time and apply honest `SIMULATED`, `IMPLEMENTED`, `VERIFIED` labels. If G0/G1 blocks parallel work, members 2 and 3 continue with stubs/mock ports and fixtures rather than making incompatible backend changes.
