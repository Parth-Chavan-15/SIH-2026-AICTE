# Policy fixture approval checklist — no invented regulatory automation

## Before activate a rule
1. Identify an **exact** official source ID, URL/document revision, printed/PDF page and clause/table; verify latest applicable errata and effective dates.
2. Record application category, academic session (e.g. AY 2026–27), region/programme where relevant, eligibility details, NBA accreditation validity, any special exception and why those facts satisfy the clause.
3. Create **reviewed immutable** `PolicyRevision` with source-precedence link and approved reviewer (fictional policy administrator for demo only).
4. Define result: scrutiny-only vs scrutiny+conditional EVC *only after exact eligibility review*, never as a universal intake category branch.
5. For missing facts, amendment conflict, exact X=360 or unknown n-division meaning, return `POLICY_REVIEW_REQUIRED`. Do not guess.
6. Pin existing case to exact policy revision and route explanation; a new policy must not silently change a running case. Migration requires authorized reason/event.

## Special cases from canonical report
- The 2026–27 updated addendum's **final errata page 42** is relevant to qualifying intake/accreditation routes; do not substitute older APH version alone.
- APH §1.8(g): only originally noted deficiencies revisited in normal rescrutiny; signed snapshot and ID-allowlist on server.
- SHC "wherever applicable" and appeal applicability are conditional, not always required; full hearing/appeal UI deferred.
- January session and external academic approval deadlines are not interchangeable with fictional officer SLAs.
- Security deposit/Affidavit 3 example starts from **intimation** and may include distinct cutoff (do not auto-penalize).
- Applicable existing-institution appeals may start from **publication/upload** of EC decision (not case creation).
- `n divisions` not mapped to `n seats` without source support; exact X=360 ambiguity review.
- Uploaded evidence, rent/lease paper or payment reference is not official verification or bank settlement.

## Two-case route fixture approval sheet
| Field | Case A | Case B |
|---|---|---|
| Synthetic institution | SYN-INST-W | SYN-INST-N |
| Session | 2026–27 | 2026–27 |
| Category | increase_intake | increase_intake |
| Accreditation | valid applicable NBA (subject to policy verification) | no valid applicable NBA (subject to policy verification) |
| Reviewed source | G02 final errata PDF p.42 | G02 final errata PDF p.42 |
| Expected candidate route | scrutiny + decision | scrutiny + EVC + decision |
| Rule validity status | MUST BE REVIEWED AND SIGNED OFF | MUST BE REVIEWED AND SIGNED OFF |
| Explanation | source revision + evaluated facts | source revision + evaluated facts |

**This sheet provides seed candidates, not legally comprehensive route decisions.** Until the applicability review is complete, the engine must return review-required rather than silently activate them.
