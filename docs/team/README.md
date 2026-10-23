# PS 26262 — Three-Member Implementation & Integration Kit

**Start with `00_START_HERE.md`.** One ZIP; three numbered members; one proposed shared contract; independent parallel execution; explicit merge and acceptance gates. Prepared 23 October 2026 for SIH PS 26262.

## Important evidence boundary
The actual private repository's source was **not re-fetched or independently run to generate this kit**. The code findings derive from the supplied Codex static audit and observed test reports. The consolidated 23-page research PDF is the **requirements authority**, not proof that its proposed design exists. The 138-page historical PDF (last page blank) preserves the linear audit conversation. The final engineering handoff text is the most recent technical proposal. Validate the version of the live repo before changing anything.

Known Git baseline: `Mayuresh-1306/SIH-2026-AICTE`, `main` at `0b61969996d512b5ad2745c79fde1e1cd7c3b14d` (Codex reports matching origin/main on its final handoff date). A teammate may have pushed changes since then; always fetch/review non-destructively.

### Where to begin
1. `00_START_HERE.md` — precise checklist and who does what now.
2. `00_MANAGEMENT/DECISIONS_AND_SCOPE.md` — decisions requiring three-member agreement.
3. `01_SHARED/CONTRACT_FREEZE_CANDIDATE.md` and `07_CONTRACT_STARTER` — **proposed** shared contract before Member 1 writes its backend.
4. One member's `02_MEMBER_1`, `03_MEMBER_2`, `04_MEMBER_3` folders — their tasks, prompt and expected outputs.
5. `01_SHARED/PARALLEL_INTEGRATION_PLAYBOOK.md`, `05_TESTS`, `06_GITHUB` — keep modules connected.

### No false claims
- 585 packages installed, TS validation and Vite build passed; 8 Node utility and 5 API tests passed separately; the default `npm test` **fails** from mixed test runners.
- Router-only synthetic API tests confirmed absent/invalid token acceptance, invalid credential acceptance, unscoped reads, arbitrary/skipped transitions and hardcoded counts.
- Frontend browser validation was **blocked by Chrome startup**, not shown to fail in-app.
- All four USPs and the complete golden path remain to be implemented and accepted end-to-end.
- No connection to official AICTE systems, authority to issue legal decisions, legal digital signatures, financial proof or production certification is claimed.

### Distribution
You may give each member the matching *individual member ZIP* in addition to the full kit. They use the same versioned shared contract and `shared fixtures`, not separate independently invented API shapes.
