# NIYAMSETU — FUTURE DEVELOPMENT REGULATORY DEPENDENCIES
**Record of Intentionally Deferred UGC Regulations & Extended Regulatory Capabilities**
**Smart India Hackathon 2026 | AICTE Problem Statement 26262 | Team Defensor**
**Status: Strictly Deferred | Tag: `FUTURE_DEVELOPMENT`**

---

## 1. PURPOSE AND MANDATE

In strict accordance with the user instruction:
*"We are deliberately postponing the additional UGC regulatory document collection and implementation to a separate Future Development phase. Do not expand the current scope by independently introducing additional UGC regulations... UGC-dependent extensions must not block completion of the currently supported AICTE routing foundation."*

This document tracks every regulatory dependency that requires external UGC regulations not present among the nine supplied documents. These dependencies are explicitly isolated, tagged as `FUTURE_DEVELOPMENT`, and prevented from blocking the core AICTE approval routing foundation.

---

## 2. DEFERRED REGULATORY DEPENDENCY REGISTER

| Dependency ID | Deferred Regulatory Instrument | Affected APH Clause & Chapter | Functionality Deferred to Future Phase | Reason for Deferral | Engine Action in Current Phase |
|---|---|---|---|---|---|
| **FDD-01** | UGC (Open and Distance Learning Programmes and Online Programmes) Regulations, 2020 | Chapter V, Clause 5.1–5.5; Addendum Item 32 | Detailed eligibility verification of Learner Support Centres (LSCs), Self-Learning Materials (SLM) quality, and e-content hours. | Not included in the nine supplied regulatory documents. | Engine implements documented AICTE stages (Scrutiny + EVC + Council) and one batch pass out requirement; tags detailed UGC curricular compliance as `FUTURE_DEVELOPMENT`. |
| **FDD-02** | UGC (Academic Collaboration between Indian and Foreign Higher Educational Institutions) Regulations, 2022 | Chapter III, Clause 3.2(m); Addendum Item 29 | Equivalence of foreign degrees, mutual recognition of credits, and minimum 30% credit completion in foreign institution. | External UGC statutory regulations not supplied. | Engine validates AICTE Chapter III stages (Scrutiny + Physical EVC) and QS/THE Top 500 ranking; tags credit mapping as `FUTURE_DEVELOPMENT`. |
| **FDD-03** | UGC (Categorisation of Universities for Grant of Graded Autonomy) Regulations, 2018 | Chapter IV, Clause 4.7; Addendum Item 31 | Automated mapping of Category-I and Category-II Graded Autonomy status for universities. | Formal UGC Graded Autonomy gazette regulations not supplied. | Engine flags university Graded Autonomy validation as `FUTURE_DEVELOPMENT`; requires manual administrative certification for Category A fast-track. |
| **FDD-04** | UGC (Institutions Deemed to be Universities) Regulations, 2023 | Chapter IV, Clause 4.1(ii); Table 2.3 Row 20 | Complete off-campus centre approval norms and sponsored research funding thresholds for Deemed Universities. | External UGC regulations not supplied. | Engine enforces binding Supreme Court mandate (`DOC-08` / `DOC-09`) requiring AICTE approval; defers detailed UGC internal governance checks. |
| **FDD-05** | National Assessment and Accreditation Council (NAAC) & National Board of Accreditation (NBA) Live API Standards | Clause 2.6(c), Clause 4.7 | Live programmatic verification of institutional accreditation scores and valid expiry dates via national API gateway. | Live API credentials not available in local testbed. | Engine evaluates verified submitted facts (`facts.hasValidNbaAccreditation`, `facts.nbaValidTill`); tags automated live crawler verification as `FUTURE_DEVELOPMENT`. |

---

## 3. CONFIRMATION OF ARCHITECTURAL ISOLATION

1. None of the five deferred UGC dependencies prevent full, deterministic execution of AICTE Chapter I (New Institutions) or Chapter II (Existing Institutions 21 categories).
2. The routing engine never substitutes an unverified guess or arbitrary default for a deferred UGC dependency.
3. Every evaluated case displaying a deferred dependency clearly surfaces `FUTURE_DEVELOPMENT` in its explainable routing output.
