# SIH 2026 — AICTE Approval, Grant, Compliance & Monitoring Platform

**Smart India Hackathon 2026 | Problem Statement 26262**  
*Team SIH 2026 — AICTE PS 26262 | Member 3: Obligations, Private Evidence, Timers & Authoritative Monitoring*

---

## 🏛️ Executive Summary & Mission

This repository houses the production-grade full-stack platform for **AICTE Approval, Grant, Compliance, and Monitoring**, engineered for Smart India Hackathon 2026 (Problem Statement 26262). 

As **Member 3**, our core mandate encompasses:
1. **Dynamic Obligations & Materialization**: Automated source-linked obligation generation on conditional decisions (e.g., EVC recommendations, conditional approvals).
2. **Private Document & Version State-Machine**: Secure file storage with cryptographic hashing, size/media guards, version retention, review workflows (never auto-verifying on upload), and supersession tracking.
3. **Deterministic Timers & Authoritative Monitoring**: Virtual clock-controlled scheduling, idempotent retries, outbox-driven event dispatchers, and SLA breach tracking.
4. **Authoritative Analytics & Dynamic Dashboards**: Zero-hardcoded metrics; Recharts dashboards driven by live MongoDB collections (Volume, SLA Overdue, EVC Visits, Compliance Undertakings).
5. **Real-Time Notification Inbox & Escalations**: Rule-driven warning alerts, SLA escalations, and action-oriented notification triage.
6. **Tamper-Proof Audit Trail**: Cryptographic SHA-256 ledger recording every stage transition, document verification, and IP address.

---

## 🚀 Key Features & Architectural Modules

### 1. Backend & Database Architecture (`src/backend/`)
- **Node.js & Express API Server (`server.ts`)**: Integrated Vite middleware in development, robust helmet security, rate limiting, and MongoDB (Mongoose) ODM persistence.
- **Domain Modules**:
  - `src/backend/modules/obligations/`: Materializes and tracks conditional obligations.
  - `src/backend/modules/documents/`: Handles versioned uploads, metadata retention, and verification state machines.
  - `src/backend/modules/notifications/`: Rule-driven notification dispatch and escalation handling.
  - `src/backend/modules/dashboards/`: Aggregates live metrics and audit projections.
  - `src/backend/workers/reminders.ts`: Background reminder & timer scheduler with idempotent deduplication.

### 2. Frontend Architecture (`src/`)
- **React 19, Vite & TypeScript**: Clean component modularity with Tailwind CSS v4 styling.
- **Official AICTE Branding**: Integrated official AICTE emblem (`/public/assets/aistudio/image_e867798b.png`) in the responsive navigation bar.
- **Role-Based Portals**: Seamless role switcher supporting:
  - *Institution / College Portal* (Dr. Arvind Mehta): Document submissions, compliance tracking, and obligation fulfillment.
  - *Regional Officer / Bureau Officer*: EVC inspection review, document verification, and compliance sign-offs.
  - *System Admin / Auditor*: Tamper-proof audit trail and system health monitoring.
- **Interactive Views**:
  - **Command Center Dashboard**: Live metric cards & Recharts analytics.
  - **Institutional Compliance & Document Expiry**: Versioned upload & review workflow.
  - **Notifications & Escalations**: Triage and SLA alert management.
  - **Tamper-Proof Audit Trail**: Cryptographic logging and inspection.

---

## 🛠️ Getting Started & Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or MongoDB Atlas URI configured in `.env`)

### Installation & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (create `.env` if needed):
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sih2026_aicte
   JWT_SECRET=your_secure_jwt_secret
   ```
3. Run development server (Express + Vite middleware):
   ```bash
   npm run dev
   ```
4. Access the application in your browser at:
   `http://localhost:3000`

---

## 🧪 Testing & Verification

The project features a comprehensive test suite covering domain logic, API endpoints, and version state machines.

- **Run all unit & integration tests (Vitest)**:
  ```bash
  npm test
  ```
- **Type-check codebase**:
  ```bash
  npm run lint
  ```
- **Production build**:
  ```bash
  npm run build
  ```

---

## 📖 Step-by-Step UI User Guide

1. **Test Dynamic Dashboard Projections**:
   - Open the application at `http://localhost:3000`.
   - Observe the Command Center Dashboard where metric cards (Total Volume, SLA Overdue, EVC Visits, Compliance Undertakings) and Recharts visualizations compute dynamically from live database records.
2. **Test Document Versioning & Submission Workflow**:
   - Use the **Role Switcher** in the navigation bar to switch to *Institution / College Portal (Dr. Arvind Mehta)*.
   - Navigate to *Institutional Compliance* or *Document Expiry* in the left sidebar.
   - Click **Upload Proof** or **Upload Renewal** on any undertaking or document.
   - *Verify*: Newly uploaded documents display as *Submitted* or *Pending Verification* (ensuring security policy rules where uploads never auto-verify).
3. **Test Officer Verification & Compliance Review**:
   - Switch role to *Regional Officer Dashboard* or *Bureau Officer Dashboard*.
   - Navigate to *Institutional Compliance* or inspect an application dossier.
   - Review submitted evidence and click **Review & Verify** to approve or reject with official remarks.
4. **Test Notifications & Escalations**:
   - Navigate to *Notifications & Escalations* in the sidebar.
   - Inspect rule-driven SLA breach warnings and escalation notices; mark alerts as read or resolve escalation cases.
5. **Test Cryptographic Audit Trail**:
   - Navigate to *Audit Trail* in the sidebar.
   - View the chronological ledger of stage transitions and document verifications with SHA-256 hashes and IP tracking.

---

## 📂 Repository Structure

```text
├── server.ts                  # Express server & API routes entry point
├── src/
│   ├── App.tsx                # Main React router & layout
│   ├── components/            # Navigation, Role Switcher, UI components
│   ├── views/                 # Dashboard, Compliance, Documents, Audit views
│   └── backend/               # Backend modules (obligations, documents, workers)
├── public/
│   └── assets/aistudio/       # Official AICTE emblem & branding assets
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
```

---
*Built with excellence for Smart India Hackathon 2026 (AICTE PS 26262).*