# NIYAMSETU (नियमसेतु) — PHASE 3.1
## Route Scenario & Institution Demonstration Matrix

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T16:50:00+05:30  
**Verification Method:** End-to-End Simulation, State Machine Execution & Test Verification

---

## 1. Scenario Catalog Overview

This matrix links real regulatory operational records and canonical scenarios to their exact route engine paths, demonstrating the end-to-end traversal across all institutional types and lifecycle variations.

---

## 2. Master Scenario Matrix

| Scenario Ref | Demonstration Institution | Intake Channel | Regulatory Category | Key Input Facts | Evaluated Statutory Route | Mandatory Stages | Applicable Role Workspaces | Source Citation / Operational Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SCEN-01** | **COEP Tech University, Pune** | NSWS Simulation | `increase_intake` | UG Engineering, Existing: 120, Proposed: 180, NBA Accredited (Score: 680), Area: $14,500m^2$ | **Desk Scrutiny Only (Fast-Track)** | Submitted -> Scrutiny Pending -> Decision Pending -> Approved | Institution Portal, Scrutiny Reviewer, Regional Officer (Western) | Addendum Item 16 / Clause 2.6(c)(i), Errata p. 42 |
| **SCEN-02** | **GIITS Tech, Visakhapatnam** | NSWS Simulation | `increase_intake` | UG Engineering, Existing: 120, Proposed: 240, Non-NBA, Area: $8,800m^2$ | **Dual-Track (Scrutiny + Physical EVC)** | Submitted -> Scrutiny Pending -> EVC Scheduled -> Decision Pending | Institution Portal, Scrutiny Reviewer, EVC Committee, RO | APH Table 2.3 Row 9, Addendum Clause 2.6(c)(i) |
| **SCEN-03** | **PDIMTR Management, Nagpur** | NSWS Simulation | `extension_of_approval` | PG Management (MBA), Existing: 180, Proposed: 180, Zero Deficiency Self-Disclosure | **Fast-Track EoA Automated Endorsement** | Submitted -> Decision Pending -> Approved | Institution Portal, Approval Bureau, Regional Officer | APH Clause 2.5 & Table 2.3 Row 1 |
| **SCEN-04** | **Apex Polytechnic & Tech Inst** | NSWS Simulation | `new_institution` | Diploma Engineering, Intake: 300, Land: 5 Acres, Area: $16,200m^2$, Northern Region | **Chapter I Scrutiny + Site EVC + Land Concurrence** | Submitted -> Scrutiny Pending -> EVC Scheduled -> Decision Pending | Institution Portal, Scrutiny Reviewer, EVC Team, Approval Bureau | APH Chapter I Clauses 1.8–1.9, Gazette Reg 4 |
| **SCEN-05** | **BATU Lonere (Relocation / Shifting)** | NSWS Simulation | `restoration_or_shifting` | UG Engineering, Shifting from rural campus to new academic zone, Area: $12,000m^2$ | **Physical EVC Mandated (Only EVC)** | Submitted -> EVC Scheduled -> Decision Pending | Institution Portal, EVC Committee, Regional Officer | APH Table 2.3 Row 3 |
| **SCEN-06** | **BATU Regional Centre (Course Closure)** | NSWS Simulation | `closure` | UG Engineering, Discontinuation of legacy specialization, Progressive closure | **Desk Scrutiny Only (Closure Norms)** | Submitted -> Scrutiny Pending -> Decision Pending | Institution Portal, Scrutiny Reviewer, Regional Officer | APH Clause 2.18 & Table 2.3 Row 16 |
| **SCEN-07** | **Vidya Vardhini Inst (Boundary X=360)** | NSWS Simulation | `increase_intake` | UG Engineering, Existing: 360, Proposed: 420 (Exceeds division boundary $X = 360$) | **Policy Review Required (Executive Committee Block)** | Submitted -> Policy Review Block -> Executive Committee | Institution Portal, Policy Administrator, Competent Authority | APH Table 2.3 Row 9 & Division Ceiling Guard |
| **SCEN-08** | **Chaudhary Ranbir Singh Univ (CRSU Jind)** | Operational Record | `new_institution` | State University Faculty of Engineering, New Establishment, Concurrence Letter | **Chapter I Scrutiny + EVC + University Concurrence** | Submitted -> Scrutiny Cleared -> EVC Recommended -> LoA Issued | State Govt / Univ Docket, Approval Bureau | Operational Record CRSU-Jind `1-46666167495` |
| **SCEN-09** | **Trinity Academy of Engg (TAE Pune)** | Operational Record | `extension_of_approval` | Part 1-2 AppReport with deficiency in Faculty Cadre Ratio (1:20 vs 1:15 required) | **Deficiency Communicated -> Re-Scrutiny Cure** | Submitted -> Scrutiny Pending -> Deficiency Communicated -> Re-Scrutiny -> EoA | Institution Cure Desk, Scrutiny Reviewer | Operational Record TAE-Pune `1-46209958886` |
| **SCEN-10** | **Hindustan College of Science & Tech** | Operational Record | `increase_intake` | Connected Set (App, Scrutiny, EVC, Compliance) with multi-deficiency remediation | **Connected Set Multi-Stage Verification** | Submitted -> Scrutiny -> EVC -> Compliance Review -> EoA Issued | All Roles (Scrutiny, EVC, Compliance, Bureau) | Operational Record Hindustan College `1-46282160952` |
| **SCEN-11** | **LNJPIT Chhapra (SAC/SHC Appeal)** | Operational Record | `deficiency_appeal` | Adverse scrutiny finding on laboratory space; personal hearing before Appellate Committee | **Standing Appellate Committee (SAC) Adjudication** | Hearing Notice -> SAC Proceeding -> Speaking Order Issued | Legal / Appellate Bureau, Standing Appellate Committee | Operational Record LNJPIT-Chhapra `1-46222876360` |
| **SCEN-12** | **Govt Polytechnic Vanavasi (Adverse LoR)** | Operational Record | `deficiency_appeal` | Persistent un-cured land deficiency leading to Letter of Rejection (LoR) Speaking Order | **Deficiency Final Rejection Flow (LoR Speaking Order)** | Scrutiny -> EVC -> SAC Rejection -> LoR Order Issued | Regional Officer, Bureau HQ, Legal Directorate | Operational Record GovtPoly-Vanavasi `1-3652420861` |
