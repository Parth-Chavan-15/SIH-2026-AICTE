# NIYAMSETU — PHASE 5: DATABASE & DEMO DATA MANAGEMENT GUIDE
## MongoDB Configuration, Fixture Health, Seed Idempotency & Safe Demonstration Reset

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Database URI:** `mongodb://127.0.0.1:27017/niyamsetu_dev`  
**Data Isolation Principle:** Never drop `niyamsetu_dev`. Seed operations must remain strictly idempotent.

---

## 1. Local Database Configuration & Connectivity

NIYAMSETU connects to local MongoDB Community Edition on `127.0.0.1:27017`.

### Prerequisites:
- MongoDB Community Server installed and running locally as a Windows service or via command line:
  ```powershell
  # Start MongoDB service (if stopped)
  net start MongoDB
  ```
- Connection verification command:
  ```powershell
  npm run db:check
  ```
- Expected output:
  ```
  🍃 Connecting to MongoDB and verifying collections...
  ✅ Successfully connected to MongoDB database [niyamsetu_dev]!
  📦 Verified existing collections & indexes. Database is ready.
  ```

---

## 2. Master Demonstration Fixture Registry

The demonstration environment is seeded with complete statutory records across 9 core collections:

### 2.1 Demo Accounts & Authentication Credentials
All accounts are pre-configured with the standard local development password: **`password123`**.

| Role Name | Demo Email | Role Key | Scoped Institution / Region |
|:---|:---|:---|:---|
| **Role 1: Principal (COEP Tech)** | `principal@coep.ac.in` | `institution` | COEP Pune (`INST-SOUTH` / `INST-COEP`) |
| **Role 1: Principal (GIITS Vizag)** | `principal@giits.ac.in` | `institution` | GIITS Vizag (`INST-NORTH` / `INST-GIITS`) |
| **Role 1: Principal (PDIMTR Nagpur)**| `principal@pdimtr.ac.in` | `institution` | PDIMTR Nagpur (`INST-WEST` / `INST-PDIMTR`) |
| **Role 1: Principal (Apex Rajasthan)**| `principal@apex.ac.in` | `institution` | Apex Polytechnic (`INST-APEX`) |
| **Role 1: Principal (BATU Lonere)** | `principal@batu.ac.in` | `institution` | Dr. BATU University (`INST-BATU`) |
| **Role 2: Desk Scrutiny Reviewer** | `scrutiny.reviewer@aicte.gov.in` | `scrutiny_committee`| Regional Scrutiny Panel Reviewer |
| **Role 3: EVC Inspection Chairman** | `evc.chair@aicte.gov.in` | `evc_expert` | Expert Visit Committee Chairman |
| **Role 4: Regional Officer (WRO)** | `ro.western@aicte.gov.in` | `regional_officer` | Western Regional Office, Mumbai |
| **Role 5: Member Secretary (Council)**| `bureau.approval@aicte.gov.in` | `bureau_officer` | Council Approval Bureau, New Delhi |
| **Role 6: Policy Administrator** | `admin@aicte.gov.in` | `admin` | National System & Policy Admin |

---

### 2.2 Canonical Applications Docket (`applications` Collection)
| Case ID | Institution Name | Program | Existing $X$ | Proposed | Stage | Route |
|:---|:---|:---|:---:|:---:|:---|:---|
| `APP-2026-COEP` | College of Engineering Pune | Engineering | $360$ | $480$ | `Scrutiny in Progress` | Route A1 (NBA Fast-Track) |
| `APP-2026-GIITS` | GIITS Tech Sciences | Engineering | $240$ | $420$ | `Deficiency Communicated` | Route B1 (Non-NBA Surge EVC) |
| `APP-2026-BATU` | Dr. BATU State Tech Univ | Engineering | $300$ | $300$ | `EVC Scheduled` | Route D1 (Campus Conversion) |
| `APP-2026-APEX` | Apex Polytechnic & Tech | Engineering | $120$ | $180$ | `SAC / SHC Review` | Route F1 (Appellate Recourse) |
| `APP-2026-PDIMTR`| PDIMTR Management Inst | Management | $180$ | $180$ | `Approval Issued` | Standard EoA Cleared Route |

---

### 2.3 Regional Expert Panels (`allocation` Module)
| Panel ID | Panel Title | Role Type | Active Caseload | Designated Members | Conflict Status |
|:---|:---|:---:|:---:|:---|:---:|
| `GRP-WRO-SCRUTINY-A` | Western Desk Scrutiny Panel A | Desk Scrutiny | 4 cases | Prof. S. Joshi, Dr. R. Kulkarni, DTE Rep | Clear (No conflicts) |
| `GRP-WRO-SCRUTINY-B` | Western Desk Scrutiny Panel B | Desk Scrutiny | 2 cases | Prof. M. Shinde, Dr. A. Patil, DTE Rep | Clear (No conflicts) |
| `GRP-WRO-EVC-01` | Western Physical EVC Inspection Team| On-Site EVC | 1 case | Prof. S. K. Ramanathan, Industry Expert | Clear (No conflicts) |

---

## 3. Database Idempotency & Safe Demo Reset

### 3.1 Idempotent Seeding
Running `npm run db:check` or `npm run seed:mongo` multiple times executes upsert operations (`updateOne({ 'caseData.id': c.id }, { $set: ... }, { upsert: true })`).
- Duplicate application IDs: **0**
- Duplicate institutions: **0**
- Duplicate user accounts: **0**

### 3.2 Safe Demonstration Reset (Zero Data Loss)
During evaluation, evaluators may advance stages, create test applications, or submit observations. To reset the demonstration environment to its clean baseline **without dropping the database or destroying unrelated user data**:

Execute via HTTP:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/v1/demo/reset" -Method POST
```
Or via Node:
```javascript
fetch('http://127.0.0.1:3000/api/v1/demo/reset', { method: 'POST' });
```
Response:
```json
{
  "success": true,
  "message": "Companion demo state reset to canonical seed with 5 real-world college cases"
}
```

---

## 4. Local Database Backup & Restore Instructions

To take a complete backup before a major live demonstration:

### Create Backup:
```powershell
mongodump --db niyamsetu_dev --out ./backup/demo_backup
```

### Restore Backup:
```powershell
mongorestore --db niyamsetu_dev ./backup/demo_backup/niyamsetu_dev --drop
```
*(Note: `--drop` drops collections inside `niyamsetu_dev` only before restoring from the designated backup archive).*
