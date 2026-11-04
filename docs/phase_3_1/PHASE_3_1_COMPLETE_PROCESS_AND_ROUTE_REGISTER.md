# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Complete Process & Regulatory Route Register (Open Route Discovery)

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**Regulatory Basis:** APH 2024–27 Table 2.3 (Rows 1–21), Chapter I & Addendum 2026–27

---

## 1. Route Discovery & Architectural Principles

In strict adherence to the prompt mandate, NIYAMSETU **does not artificially cap routes** at 5 prototype routes, 21 table rows, or 5 test colleges.

Instead, NIYAMSETU implements an open, extensible statutory routing taxonomy where routes are dynamically evaluated from applicant facts, accreditation status, land/infrastructure compliance, and statutory chapters.

---

## 2. Comprehensive Regulatory Route Taxonomy

| Route Code | Formal Statutory Route Title | Governing AICTE Clause | Input Trigger Conditions | Mandatory Lifecycle Stages Spine | Waived / Skipped Stages | Expected Legal Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ROUTE-01** | **Fast-Track EoA (Zero Deficiency Self-Disclosure)** | APH §2.5, Table 2.3 Row 1 | Existing institution, zero deficiencies, valid accreditation/affiliation, no punitive actions. | 1. Submitted<br>2. Decision Pending<br>3. Approved | Pre-approval Desk Scrutiny & physical EVC waived. | Automated EoA with cryptographic QR seal. |
| **ROUTE-02** | **Desk Scrutiny Only (NBA Fast-Track Intake Surge)** | APH §2.6(c)(i), Table 2.3 Row 9, Addendum Item 16 | Intake increase / new course with valid NBA accreditation (Score >=650), infrastructure verified. | 1. Submitted<br>2. Scrutiny Pending<br>3. Decision Pending<br>4. Approved | Physical EVC waived under Addendum Item 16. | Scrutiny cleared; intake expansion granted. |
| **ROUTE-03** | **Dual-Track (Non-NBA Surge Scrutiny + Physical EVC)** | APH §2.6, Table 2.3 Row 9 | Intake increase without NBA accreditation; expansion above standard divisions. | 1. Submitted<br>2. Scrutiny Pending<br>3. EVC Pending<br>4. Decision Pending | None. Both Desk Scrutiny and physical inspection mandatory. | LoA / Revised EoA upon satisfactory EVC report. |
| **ROUTE-04** | **Chapter I New Institution Establishment** | APH Chapter I §§1.8–1.9, Gazette Reg 4 | New Technical Institution establishment filing (Technical/Polytechnic/Diploma). | 1. Submitted<br>2. Scrutiny Pending<br>3. EVC Pending<br>4. SAC/SHC (if contested)<br>5. Decision Pending | None. Strict sequential vetting. | Letter of Approval (LoA) with initial approved intake. |
| **ROUTE-05** | **Physical EVC Mandated (Change of Site / Location)** | APH Table 2.3 Row 3 | Shifting of institution to a new geographical site/campus. | 1. Submitted<br>2. EVC Scheduled<br>3. Decision Pending | Desk Scrutiny of academics waived; physical site infrastructure inspection mandatory. | Site Shifting Approval Order upon land verification. |
| **ROUTE-06** | **Physical EVC Mandated (Restoration of Intake / Break-in-EoA)** | APH Table 2.3 Row 14 | Institution seeking restoration after punitive reduction or break in annual EoA. | 1. Submitted<br>2. EVC Pending<br>3. Decision Pending | Desk Scrutiny waived; physical verification of rectified deficiencies mandatory. | Restoration of original sanctioned intake. |
| **ROUTE-07** | **Desk Scrutiny Only (Progressive Course Closure)** | APH §2.18, Table 2.3 Row 16 | Progressive discontinuation / closure of an existing course/discipline. | 1. Submitted<br>2. Scrutiny Pending<br>3. Decision Pending | Physical EVC waived. | Course closure endorsed without physical inspection. |
| **ROUTE-08** | **Desk Scrutiny Only (Complete Institution Closure)** | APH §2.19, Table 2.3 Row 17 | Complete closure of technical institution; requires State & University NOC. | 1. Submitted<br>2. Scrutiny Pending<br>3. Decision Pending | Physical EVC waived. | Formal Institution Closure Speaking Order. |
| **ROUTE-09** | **Quasi-Judicial Standing Hearing (SHC Appeal)** | APH §1.10, REC-07 | Application rejected or deficiency un-cured after Scrutiny / EVC. | 1. Hearing Notice<br>2. Personal Hearing<br>3. SHC Recommendation<br>4. Decision Pending | Normal automated progression suspended. | SHC Recommendation to grant or uphold rejection. |
| **ROUTE-10** | **Quasi-Judicial Standing Appellate Committee (SAC)** | APH §1.11, REC-07 | Institution aggrieved by SHC adverse decision; final internal appeal under High Court Judge. | 1. SAC Filing<br>2. Judicial Hearing<br>3. Final Speaking Order | Maximum 1 appeal; re-hearings barred. | Final Speaking Order (LoA / EoA / LoR). |
| **ROUTE-11** | **Policy Review Required (Boundary Condition $X = 360$)** | APH Table 2.3 Row 9 & Intake Formula Ceiling | Institutional intake surge exceeding statutory division boundary $X = 360$. | 1. Submitted<br>2. Policy Review Block<br>3. Executive Committee Adjudication | Automated pipeline halts at boundary guard. | Executive Committee Policy Review Decision. |
| **ROUTE-12** | **ODL / Online Learning (UGC Dependency Route)** | UGC (ODL) Reg 2020, APH Ch III | Institution offering or applying for Open and Distance Learning programs. | 1. Submitted<br>2. UGC Concurrence Gate<br>3. Joint Scrutiny | Standalone AICTE decision barred pending UGC DEB approval. | Joint AICTE-UGC Approval. |
| **ROUTE-13** | **Change of Name / Change of Affiliating University** | APH Table 2.3 Rows 4, 6 | Administrative modification of Society/Trust name or University affiliation. | 1. Submitted<br>2. Document Scrutiny<br>3. Decision Pending | Physical EVC waived. | Administrative Name/Affiliation Endorsement. |
| **ROUTE-14** | **Introduction of Supernumerary Seats (FN/OCI/CIWG/NRI)** | APH Table 2.3 Row 11 | Institution applying for 15% supernumerary quota for foreign nationals / NRI. | 1. Submitted<br>2. Scrutiny Pending<br>3. Decision Pending | Physical EVC waived if infrastructure satisfies Table 2.3 norms. | Supernumerary Approval Endorsement. |
