# NIYAMSETU (नियमसेतु) — UNVERIFIED & CONFLICTING REGULATORY RULES DOSSIER
## Explicit Accounting of Statutory Ambiguities, Textual Discrepancies, and Deliberate Policy Safeguards

**Document Version:** 2.0  
**Inspection Commit:** `bc341e6`  
**Governing Standard:** AICTE Approval Process Handbook 2024–27 & AY 2026–27 Addendum  
**Code Reference:** [`src/backend/policy/dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts#L107-L123)

---

## 1. Statutory Neutrality & Fail-Safe Design Principle

In accordance with strict hackathon and public governance ethics, **NIYAMSETU does not hard-code arbitrary assumptions when official regulatory sources contain unresolved contradictions or textual ambiguities.** 

When authoritative evidence is contradictory, ambiguous, or contested:
1. The platform **flags the exact unresolved clause and source discrepancy**.
2. The system **halts automated branch progression** and places the case in a transparent `review_required` hold.
3. The platform **presents the case to the Human Policy Administrator (Role 6)** along with the conflicting citations for authoritative determination.
4. The system **never presents an unresolved interpretation as verified AICTE policy**.

---

## 2. Inventory of Unresolved Regulatory Ambiguities & Conflicts

### 2.1 Ambiguity 1 — The Intake Threshold `X = 360` Boundary
- **Discrepancy Description:**  
  AICTE Addendum for AY 2026–27 (Errata G02, p. 42, §2.6(c)(1)) introduces an expedited pathway for institutions with intake `X > 360`, while base APH 2024–27 Table 2.3 Row 9 prescribes sequential Scrutiny + EVC for institutions where `X <= 360`. Neither document explicitly specifies whether an application with total proposed intake **exactly equal to 360** falls under the expedited threshold (`X >= 360`) or the traditional scrutiny bracket (`X <= 360`).
- **Potential Real-World Harm:**  
  An automated rule guessing `<=` or `>=` could either unlawfully bypass a required physical EVC inspection or subject an eligible institution to weeks of unnecessary administrative delay.
- **NIYAMSETU Engineered Handling:**  
  In [`src/backend/policy/dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts#L108-L110):
  ```ts
  if (facts.proposedIntake === 360 || facts.existingIntake === 360) {
    unresolvedFlags.push('RULE_AMBIGUITY: Intake threshold X = 360 boundary in Addendum 2026-27 p. 42 is ambiguous; held for policy verification');
  }
  ```
  The application fails safely to `result: 'review_required'`. It requires manual policy sign-off from the National Approval Bureau before routing can proceed.
- **Test Evidence:** Covered by automated boundary tests in `tests/policy/routing.test.ts`.

---

### 2.2 Conflict 2 — Experiential Learning Program (ELP) Curriculum Threshold
- **Discrepancy Description:**  
  AICTE Addendum AY 2026–27 p. 14 states that for the new Experiential Learning Scheme, institutions must maintain a *"Minimum 50% experiential learning component in the curriculum."* Conversely, the official AICTE Concept Note on Experiential Learning (Circular Annexure p. 19) states that the experiential component must be *"Up to 50% of total course credits."*
- **Potential Real-World Harm:**  
  An institution submitting a syllabus with 45% experiential credits would be accepted under the Concept Note but rejected as non-compliant under the Addendum text.
- **NIYAMSETU Engineered Handling:**  
  In [`src/backend/policy/dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts#L111-L113):
  ```ts
  if (facts.isExperientialLearningProgram) {
    unresolvedFlags.push('CONFLICT: Addendum p. 14 states "Minimum 50% experiential learning" while Concept Note p. 19 states "Up to 50%". Held for policy review');
  }
  ```
  Case is placed on deliberate policy hold (`review_required`) citing both authoritative publications.
- **Test Evidence:** Verified in `tests/policy/routing.test.ts`.

---

### 2.3 Discrepancy 3 — Institutional Hibernation Heading vs Text
- **Discrepancy Description:**  
  Under Addendum AY 2026–27 Item 24 amending Clause 2.16.1(d), the section heading reads: *"Institutions undergoing Hibernation after a Break in EoA in the preceding academic year"*. However, the operative body text specifies that the clause applies only to institutions that have remained inactive for *"two consecutive preceding academic years"*.
- **Potential Real-World Harm:**  
  Institutions with a single year break could erroneously claim Hibernation status or be improperly forced into a complete restoration inspection.
- **NIYAMSETU Engineered Handling:**  
  In [`src/backend/policy/dynamicRouteEngine.ts`](file:///c:/Users/parth/Documents/SIH-26-AICTE/src/backend/policy/dynamicRouteEngine.ts#L114-L116):
  ```ts
  if (facts.hibernationTiming) {
    unresolvedFlags.push('RULE_AMBIGUITY: Hibernation timing heading vs body discrepancy under Addendum Item 24 / §2.16.1(d). Requires human verification');
  }
  ```
- **Test Evidence:** Verified in `tests/policy/routing.test.ts`.

---

## 3. Disclosures of Prototype Safeguards vs Statutory Mandates

To maintain complete truth in reporting, NIYAMSETU explicitly distinguishes internal engineering safeguards from statutory law:

| Feature / Control | Current Implementation in NIYAMSETU | Statutory Basis in APH / Act | Truthful Technical Classification |
|---|---|---|---|
| **EVC Geo-Fencing** | Mandates committee submission within 200m/500m radius of campus geo-coordinates. | APH Chapter II §2.13 requires on-site physical conduct and GPS-tagged photographs. APH does not specify an exact 200m or 500m radius. | **Internal Product Safeguard** (Engineered to satisfy the statutory on-site verification mandate; not a statutory metric). |
| **Differential Scope-Lock** | Cleared checklist items are locked with immutable SHA-256 hashes; server returns HTTP 409 Conflict if modified. | APH Chapter II §2.14 and Principles of Natural Justice require that re-scrutiny be restricted to previously identified deficiencies. | **Core Innovation USP** (Engineered server-side enforcement of the natural justice principle). |
| **Checklist Nomenclature (`C1–C6`, `D1/D2`)** | Categories: Land (C1), Building (C2), Faculty (C3), Labs (C4), Amenities (C5), Legal (C6). Deficiencies tagged D1/D2. | APH Annexure 7 provides structured proforma categories and deficiency reports. Specific shorthand `C1–C6` is internal prototype mapping. | **Internal System Nomenclature** (Derived from official AICTE proforma sections). |
| **National Ecosystem Adapters (NSWS, emBridge, NBA)** | Client-server simulation bridges with deterministic test fixtures (valid, expired, revoked certs). | IT Act 2000 §35 and NSWS Single Window guidelines require live PKI infrastructure and national portal webhooks. | **Simulated Companion Bridges** (High-fidelity prototype simulation; clearly disclosed as non-production external connections). |
| **Audit Ledger Storage** | Continuous SHA-256 hash chaining where each block hashes previous hash, actor, action, and payload. | Indian Evidence Act §65B and IT Act §65B mandate tamper-evident admissibility of electronic records. | **Cryptographic Tamper-Evident Ledger** (Mathematical hash-chaining; not hardware optical WORM media). |
