# NIYAMSETU — PHASE 5: LOCAL STARTUP & ENVIRONMENT GUIDE
## Step-by-Step Operator Setup, Environment Configuration & Server Launch Manual

**Project:** NIYAMSETU (नियमसेतु) — The Bridge of Rules  
**SIH 2026 Problem Statement:** AICTE Approval Workflow Automation — PS 26262  
**Team:** Defensor  
**Target Branch:** `dev`  
**Host Target:** `http://127.0.0.1:3000` (Unified Express Backend + Vite Frontend)

---

## 1. Local Prerequisites & System Requirements

Before starting NIYAMSETU, ensure the following software is installed on the host machine:

| Component | Minimum Version | Verified Local Version | Purpose |
|:---|:---:|:---:|:---|
| **Node.js** | v20.0.0+ | v24.12.0 / v20+ | JavaScript runtime for server and build tools |
| **npm** | v9.0.0+ | v10.0.0+ | Package manager and script runner |
| **MongoDB Community** | v6.0.0+ | v7.0.0+ (Port 27017) | Local database store (`niyamsetu_dev`) |
| **Google Chrome / Edge** | Modern evergreen | Modern browser | Client interface and demonstration view |

---

## 2. Environment Configuration (`.env`)

The project uses a local `.env` file at the repository root. Ensure `.env` is populated with the verified local settings:

```env
# NIYAMSETU Local Development Configuration
PORT=3000
HOST=127.0.0.1
NODE_ENV=development

# Dedicated Local MongoDB Store
MONGODB_URI=mongodb://127.0.0.1:27017/niyamsetu_dev

# Session & Secret Keys (Local development non-production keys)
JWT_SECRET=local-dev-jwt-secret-key-2026
SESSION_SECRET=local-dev-session-secret-2026
WORM_HMAC_SECRET=local-dev-audit-key-2026
PROTOTYPE_SEAL_SECRET=local-dev-prototype-seal-key-2026

# Client Origin (CORS & SameSite origin validation)
CLIENT_URL=http://localhost:3000
```

> [!NOTE]
> Sensitive production keys or live government API secrets are never committed to version control. The application utilizes high-entropy local development fallback keys for prototype verification.

---

## 3. Step-by-Step Startup Sequence

### Step 1: Verify MongoDB Service
Confirm that the local MongoDB server is running:
```powershell
# In PowerShell:
net start MongoDB
```

### Step 2: Verify Database Connection & Canonical Fixtures
Execute the database verification probe:
```powershell
npm run db:check
```
*Expected Output:*
```
🍃 Connecting to MongoDB and verifying collections...
✅ Successfully connected to MongoDB database [niyamsetu_dev]!
📦 Verified existing collections & indexes. Database is ready.
```

### Step 3: Start the Unified Development Stack
Launch the development server:
```powershell
npm run dev
```
*Expected Output:*
```
🍃 Connected to Production MongoDB Database [niyamsetu_dev].
📦 Verified existing MongoDB collections and indexes.
🏛️ Initializing AICTE NiyamSetu (नियमसेतु) Companion Runtime (AY 2026–27)...
🔗 Companion Application wired directly to MongoDB Storage Adapter.
🚀 AICTE NiyamSetu Server running on http://127.0.0.1:3000
```

> [!TIP]
> The single command `npm run dev` starts **both** the Express REST API backend and the Vite hot-reloading React frontend on `http://127.0.0.1:3000`. No secondary terminal is required.

---

## 4. Health & Readiness Verification

Once started, open a browser or terminal and test the health endpoints:

1. **Service Liveness Probe:**
   - URL: `http://127.0.0.1:3000/health`
   - Expected HTTP Status: `200 OK`
   - Response Payload:
     ```json
     {
       "status": "alive",
       "uptimeSeconds": 15,
       "commit": "aa3117fef487b564a5160fe320c4b9c9406c6eeb",
       "readiness": "/api/v1/ready",
       "version": "/api/version"
     }
     ```
2. **Database Readiness Probe:**
   - URL: `http://127.0.0.1:3000/api/v1/ready`
   - Expected HTTP Status: `200 OK`
   - Response Payload:
     ```json
     {
       "success": true,
       "data": {
         "status": "ready",
         "storageMode": "mongodb",
         "database": {
           "configured": true,
           "connected": true,
           "readyState": 1,
           "dbName": "niyamsetu_dev",
           "pingLatencyMs": 3
         }
       }
     }
     ```
3. **Frontend Application:**
   - Open: `http://127.0.0.1:3000`
   - Expected UI: NIYAMSETU portal with top government header and active institution dashboard.

---

## 5. Production Build & Execution

To test the compiled production distribution:

```powershell
# 1. Compile production bundle
npm run build

# 2. Start server in production mode
$env:NODE_ENV="production"; npm start
```

---

## 6. Troubleshooting Common Issues

1. **Port 3000 Already in Use (`EADDRINUSE`):**
   - Identify the PID using port 3000:
     ```powershell
     netstat -ano | findstr :3000
     ```
   - Terminate the conflicting process:
     ```powershell
     taskkill /PID <PID> /F
     ```
2. **MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`):**
   - Ensure the MongoDB service is started: `net start MongoDB`.
   - If MongoDB runs on a non-standard port, update `MONGODB_URI` in `.env`.
3. **Session Expired / 401 Unauthenticated:**
   - If an expired session cookie is cached in the browser, log in again using the top persona switcher or clear cookies for `localhost:3000`.
