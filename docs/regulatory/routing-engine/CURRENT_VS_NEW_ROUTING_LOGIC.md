# NIYAMSETU — CURRENT VS NEW ROUTING LOGIC GAP ANALYSIS
**Forensic Comparison of Prototype Routing vs New Authoritative Deterministic Engine**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**

---

## 1. ARCHITECTURAL COMPARISON SUMMARY

| Architectural Dimension | Old Prototype Implementation | New Deterministic Routing Engine | Regulatory Basis / Remediation |
|---|---|---|---|
| **Category Coverage** | 4 hardcoded categories (`new_institution`, `extension_of_approval`, `restoration_or_shifting`, `increase_intake`) + generic fallback | Complete taxonomy across Chapter I, Chapter II Table 2.3 (all 21 categories), Chapter III, Chapter IV, Chapter V | APH 2024–27 Table 2.3 (p. 46); no generic collapsing |
| **Increase in Intake Rules** | Simple boolean `nbaAccredited` without core course or intake volume checks | Implements Addendum Page 42 Errata: Core branch check ($\ge 3$), Non-CS core check ($\ge 2$), Regional language exception, and formula for $X < 360$ vs $X > 360$ | Addendum 2026–27 Page 42 Errata to Clause 2.6(c)(i) |
| **50% NBA Rule** | Injected an unsupported rule requiring 50% accredited courses for intake expansion | **REMOVED.** Sourced strictly from Errata p. 42 which links allowed intake to valid accredited divisions $n$ | Strict source restriction; unsupported 50% threshold eliminated |
| **BBA / BCA / BMS Institutions** | Treated as general existing technical institutions | Implements Page 42 Errata Item 2: Issued LoA/EoA on *"As Is Where Is"* for AY 2026–27, superseding 6.10.2025 circular | Addendum Errata Page 42 Item 2 |
| **ODL & Online Courses** | Mocked under generic administrative category | Implements Addendum Page 13 Item 32: One batch pass out requirement + Mandatory Scrutiny & EVC | Addendum Page 13 Item 32 Note |
| **UGC Regulations** | Implied full implementation of UGC ODL and Graded Autonomy rules | Explicitly isolates missing UGC regulations and tags them as `FUTURE_DEVELOPMENT` | Strict adherence to user mandate; zero unverified claims |
| **Ambiguity Handling** | Silently guessed or collapsed ambiguous cases into a default route | Formally halts automated routing and tags as `POLICY_REVIEW_REQUIRED` (e.g. boundary $X = 360$) | Non-negotiable audit restriction against inventing rules |
| **Route Explanations** | Generic reasons string | Detailed explainable snapshot: category, rule version, matched rules, exact APH clause, source document, physical PDF page, printed page, evaluated inputs | Prompt Section 9: "Explainable Routing — Why this route?" |
