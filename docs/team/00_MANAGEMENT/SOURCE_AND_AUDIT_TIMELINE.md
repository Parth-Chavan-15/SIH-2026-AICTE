# Source provenance and complete linear decision timeline

Three supplied inputs were inspected locally:
1. `SIH2026_PS26262_FINAL_Consolidated_Master_Report(2).pdf`: **23 pages**, canonical final requirements blueprint; 24 named chapters with research/source register and appendix.
2. `SIH2026_PS26262_FINAL_Consolidated_Master_Report (2).pdf`: **138 PDF pages** (the last is blank), a research + audit + assistant/Codex conversation compendium. Pages 1–23 repeat the research section with layout/text-level differences after page 7; page 24 onward documents the audit journey.
3. `Pasted text(20261023-082411).txt`: **457-ish lines**, Codex's final engineering handoff; contains the proposed TypeScript DTOs/endpoints and Member 1–3 work division. This supersedes preliminary tasks as the latest *proposal*, not as committed code.

## Detailed page crosswalk in the long compendium
| Pages (PDF numbering) | What this recorded | Engineering implication |
|---|---|---|
| 1–23 | Consolidated research, six domains, B01–B14, MVP/USPs, source restrictions, T01–T28 | Requirements benchmark only |
| 24–48 | Codex read-only static audit, code-level inventory, feature matrix, risks and backlog | Frontend can be preserved, core isn't integrated |
| 49–61 | Analysis and Phase 2 execution requirements | Separate code claims from runtime facts |
| 62–72 | Initial Bun metadata approval and technical safety | Protect package/lockfile and current repo |
| 73–75 | Bun 1.4.4 native acquisition + frozen dry-run output | Tool works; dependencies not yet validated |
| 76–82 | Approved frozen dependency install and typecheck/build scope | Controlled validation boundary |
| 83–85 | 585-package install, TS pass, Vite build pass, warnings | No rewrite required just to build |
| 86–91 | Approval for existing automated-test execution | Test behavior not same as full system |
| 92–94 | 8/8 Node utility + 5/5 Vitest API pass; default `npm test` fails | Repair mixed test runner before submission |
| 95–107 | Plan for controlled frontend/API checks; model/capacity continuation | No need to repeat work |
| 108–114 | Phase 2E plan; isolated loopback preview/router, synthetic-only cases | Limited testing design |
| 115–123 | Authorization and risk limits for Phase 2E | Static safety limits persist |
| 124–126 | Phase 2E observed router failures; Chrome GPU failed before navigation | Confirmed P0 backend defects; browser NOT tested |
| 127–137 | Final interpretation and planning prompt for engineering handoff | Ready for 3-way ownership planning |
| 138 | Blank closing page | No additional requirement |

## Timeline facts that may never be silently changed
- Codex's final reported baseline: `main`, `0b61969996d512b5ad2745c79fde1e1cd7c3b14d`; final handoff reported `origin/main` identical at its check. **Recheck remote before coding.**
- Existing code: React 19 / Vite / Tailwind / Express router, Mongoose paths and a separate browser localStorage service.
- Build tool: Bun 1.4.4 Windows x64; project install 585 packages; TypeScript and Vite builds passed; large JS chunk and `__dirname` future-warning.
- Test runner: 8 utility tests separately pass, 5 API tests separately pass; default `npm test` fails.
- Router smoke: no/invalid auth accepted, credentials ignored, cross-region reads, skipped/unknown stage accepted, dashboard hardcoded metrics.
- Frontend: Playwright/Chrome failed on GPU startup **before navigation**; UI behavior and UI/API comparison stay unverified.
- No tracked repository edits were made in any completed audit stage; untracked ignored build directories were produced.

## Principle
Research PDF = desired behavior; static audit = code hypothesis; runtime tests = narrow observed evidence; final handoff = proposal; merged feature branch + acceptance proof = actual implementation. These evidence levels are **not interchangeable**.
