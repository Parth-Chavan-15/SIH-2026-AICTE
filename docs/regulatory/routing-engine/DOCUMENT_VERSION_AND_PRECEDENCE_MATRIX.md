# NIYAMSETU — DOCUMENT VERSION & PRECEDENCE MATRIX
**Strict Precedence Hierarchy & Conflict Resolution Principles**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**

---

## 1. REGULATORY PRECEDENCE HIERARCHY

To ensure deterministic and legally sound routing decisions, the nine regulatory sources are organized into a strict six-tier hierarchy of legal precedence:

```
+-----------------------------------------------------------------------------------+
| LEVEL 1: PRIMARY LEGISLATION (Parent Statute)                                     |
| Source: AICTE Act, 1987 (Act No. 52 of 1987) [DOC-03]                             |
| Binding authority: Non-delegable Council powers (Section 10(k)), inspections (11) |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| LEVEL 2: SUBORDINATE LEGISLATION (Statutory Regulations)                          |
| Source: Gazette of India Guidelines / Regulations, 2024–27 [DOC-04]               |
| Binding authority: Formal legal requirements published under Section 23 of Act   |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| LEVEL 3: PROCEDURAL REGULATORY FRAMEWORK (Handbook)                                |
| Source: Approval Process Handbook (APH) 2024–25 to 2026–27 [DOC-02]               |
| Binding authority: Detailed procedural workflow, Table 2.3 categories, deadlines |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| LEVEL 4: ANNUAL SESSIONAL AMENDMENTS & ERRATA                                    |
| Source: AICTE Addendum-Corrigendum 2026–27 & Final Errata (p. 42) [DOC-01]        |
| Binding authority: Overrides/modifies APH 2024–27 provisions for AY 2026–27      |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| LEVEL 5: SESSIONAL NOTICES & PROGRAMME INSTRUCTIONS                               |
| Sources: Revised Notice (04.02.2026) [DOC-05], Public Notice (26.11.2025) [DOC-06]|
|          BBA/BMS/BCA Circular (06.10.2025) [DOC-07]                               |
| Binding authority: Session deadlines, NSWS onboarding mandate, portal schedules  |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| LEVEL 6: JUDICIAL PRECEDENTS & INTERPRETATIONS                                    |
| Sources: SC Judgment (03.11.2017) [DOC-08], SC Clarification (22.01.2018) [DOC-09]|
| Binding authority: Interpretation of statutory scope (Deemed Universities, ODL)  |
+-----------------------------------------------------------------------------------+
```

---

## 2. EXPLICIT CONFLICT RESOLUTION RULES

1. **Rule 1: Lower Tiers Yield to Higher Tiers**
   - If a handbook provision conflicts with the Gazette Regulation or AICTE Act, the statutory provision prevails.
   - Example: Section 10(k) of AICTE Act mandates that final authority to grant approval vests in the Council. No internal delegation or committee recommendation can replace the non-delegable statutory Council decision gate.

2. **Rule 2: Later Sessional Amendments Override Earlier Base Provisions (Lex Posterior Derogat Priori)**
   - Addendum 2026–27 (`DOC-01`) explicitly modifies base APH 2024–27 (`DOC-02`) for Academic Year 2026–27.
   - Example: APH Clause 2.25(f) referenced Clause 2.3.2. Addendum Item 28 corrects this reference to Clause 2.12. The engine evaluates the corrected Clause 2.12.

3. **Rule 3: Errata Page 42 Has Highest Sessional Precedence within Addendum**
   - The Errata published on Page 42 of `DOC-01` represents the final post-consultation corrigendum.
   - Where the text on Page 42 modifies earlier text in the Addendum or APH, the Page 42 text is authoritative:
     - Clause 2.6(c)(i): Core branch requirement mandates at least two non-Computer Science disciplines.
     - Intake expansion formulas evaluate the Page 42 table ($X < 360$ vs $X > 360$).
     - Point 2 on Page 42 explicitly supersedes Circular dated 06.10.2025 for BBA/BCA/BMS, granting LoA/EoA on *"As Is Where Is"* for AY 2026–27.

4. **Rule 4: Connected Public Notice Sequence**
   - Public Notice dated 26.11.2025 (`DOC-06`) establishes the application categories, NSWS mandate for new institutions, university coverage, and base schedule.
   - Revised Public Notice dated 04.02.2026 (`DOC-05`) modifies only specific payment and submission dates (payment enabled up to 11 Feb 2026 with late fees; BBA/BCA/BMS applications up to 28 Feb 2026). It does NOT invalidate the procedural rules of `DOC-06`.

5. **Rule 5: Judicial Sources Limited to Actual Holdings**
   - The 2017 Judgment (`DOC-08`) established that 1994 AICTE Regulations apply to Deemed Universities and restrained distance technical education without AICTE approval.
   - The 2018 Order (`DOC-09`) clarified that diplomas were outside the judgment and provided a one-time relief window for the 2001–2005 batch up to 31 July 2018.
   - Neither judgment serves as a general approval-routing rule or an ongoing waiver for future academic sessions.

6. **Rule 6: Irreconcilable Ambiguity Handling**
   - If an explicit contradiction or boundary gap exists that cannot be resolved through the text of the nine documents:
     - Tag: `POLICY_REVIEW_REQUIRED`.
     - The engine holds the case for human administrative determination and halts automated stage transition.
     - Never invent an arbitrary default, boundary, or threshold.
