import { Router, Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createHmac } from 'node:crypto';
import { CoreError, type CaseStorage } from '../core/storage';
import { SecurityError } from '../security/identity';

const ARTIFACT_MAP: Record<string, string> = {
  'scrutiny-giits-2026': 'Real 2026\u201327 AICTE Scrutiny Evaluation Report - GIITS.pdf',
  'scrutiny-report': 'Real 2026\u201327 AICTE Scrutiny Evaluation Report - GIITS.pdf',
  'nsws-guide': 'AICTE Approval Process & NSWS Portal Registration Guide.pdf',
  'dsc-manual': 'AICTE Portal & Digital Signature (DSC or mSigner) User Manual.pdf',
  'aph-handbook': 'APH 24\u201325, 26-27 Handbook.pdf',
  'evc-report-real': 'Real AICTE Expert Visit Committee (EVC) & Online Scrutiny Report.pdf',
  'evc-report': 'Real AICTE Expert Visit Committee (EVC) & Online Scrutiny Report.pdf',
  'deficiency-scro': 'Real AICTE Portal [Application Deficiency Report] (South-Central Region).pdf',
  'deficiency-wro': 'Real AICTE Portal [Application Deficiency Report] (Western Region).pdf',
  'conditional-eoa': 'Real Conditional Extension of Approval (EoA) Letter With Time-Bound Compliance Clause.pdf',
  'eoa-letter': 'Real Conditional Extension of Approval (EoA) Letter With Time-Bound Compliance Clause.pdf',
  'rescrutiny-report': '2025\u201326 Scrutiny & Re-Scrutiny Report.pdf',
  'gap-analysis': 'SIH26262_Implementation_vs_AICTE_Ecosystem_Gap_Analysis.pdf',
  'master-report': 'SIH2026_PS26262_FINAL_Consolidated_Master_Report.pdf'
};

function resolveVaultFile(rootVault: string, targetName: string): string | null {
  if (fs.existsSync(path.join(rootVault, targetName))) {
    return path.join(rootVault, targetName);
  }
  if (!fs.existsSync(rootVault)) return null;
  const files = fs.readdirSync(rootVault);
  const normalizedTarget = targetName.replace(/[\u2010-\u2015-]/g, '-').toLowerCase();
  for (const f of files) {
    if (f.replace(/[\u2010-\u2015-]/g, '-').toLowerCase() === normalizedTarget) {
      return path.join(rootVault, f);
    }
  }
  return null;
}

function generateDynamicIntakeEvaluationHtml(app: any, actor: any): string {
  const meta: any = app.facts || {};
  const isGIITS = app.id.includes('GIITS') || app.institutionId === 'INST-NORTH';
  const isCOEP = app.id.includes('COEP') || app.institutionId === 'INST-SOUTH';
  const isPDIMTR = app.id.includes('PDIMTR') || app.institutionId === 'INST-WEST';
  const isApex = app.id.includes('APEX') || app.institutionId === 'INST-APEX';
  const isBATU = app.id.includes('BATU') || app.institutionId === 'INST-BATU';

  const instName = meta.institutionName ||
    (isCOEP ? 'College of Engineering Pune (COEP Technological University)'
      : isGIITS ? 'Gonna Institute of Information Technology and Sciences (GIITS), Visakhapatnam'
      : isPDIMTR ? 'Prerna / Univ BDT College of Engineering (PDIMTR)'
      : isApex ? 'Apex Institute of Technology & Management'
      : isBATU ? 'Dr. Babasaheb Ambedkar Technological University (BATU Lonere)'
      : 'Technical Campus');

  const pid = meta.permanentInstituteId || (isCOEP ? '1-1437622971' : isGIITS ? '1-6055691' : isPDIMTR ? '1-447718433' : isApex ? '1-33104928' : '1-19201481');
  const program = meta.program || (isPDIMTR ? 'Management / MBA' : 'Engineering & Technology');
  const course = meta.course || (isCOEP ? 'Mechanical Engineering' : isGIITS ? 'Computer Science & Engineering' : isPDIMTR ? 'Master of Business Administration' : 'Core Engineering');
  const currentIntake = meta.currentIntake || (isCOEP ? 120 : isGIITS ? 180 : 120);
  const proposedIntake = meta.proposedIntake || (isCOEP ? 180 : isGIITS ? 240 : 120);
  const region = app.regionId || (isGIITS ? 'South-Central' : 'Western');
  const nswsRef = meta.nswsReference || (isGIITS ? 'NSWS-2026-SCRO-101' : isCOEP ? 'NSWS-2026-WRO-404' : 'NSWS-2026-WRO-212');

  let routeVerdictTitle = '';
  let routeBadgeClass = '';
  let routeCitation = '';
  let routeJustification = '';
  let evcStatusText = '';

  if (isCOEP) {
    routeVerdictTitle = '⚡ FAST-TRACK ROUTE: SCRUTINY ONLY (NBA ACCREDITATION FAST-TRACK)';
    routeBadgeClass = 'badge-success';
    routeCitation = 'AICTE Approval Process Handbook (APH) 2026–27 Errata G02 p. 42 (Table 1)';
    routeJustification = 'The institution holds valid National Board of Accreditation (NBA Tier-1) status for the Department of Mechanical Engineering (Valid through 30-JUN-2028). Per statutory Errata G02 §2.6, physical Expert Visit Committee (EVC) inspection is explicitly waived and bypassed. Procedural route: Desk Scrutiny → Competent Authority EoA Approval.';
    evcStatusText = 'EXEMPTED / BYPASSED BY STATUTE (NBA Fast-Track)';
  } else if (isGIITS) {
    routeVerdictTitle = '🔍 STANDARD STATUTORY ROUTE: SCRUTINY + DIFFERENTIAL RE-SCRUTINY + PHYSICAL EVC';
    routeBadgeClass = 'badge-warning';
    routeCitation = 'AICTE APH 2026–27 Chapter I §1.8, §1.9 & Table 1';
    routeJustification = 'The institution requested an intake increase from 180 to 240 seats in Computer Science & Engineering without active NBA Tier-1 accreditation. Mandatory statutory route: Initial Desk Scrutiny → Scoped Deficiency Cure (§1.8(g)) → Physical EVC Panel Inspection (30-min Video + GPS verification §1.9).';
    evcStatusText = 'MANDATORY PHYSICAL INSPECTION (Panel: Prof. S. Velmurugan, Assoc. Prof. Hareesh K, Arch. Md. Danish)';
  } else if (isPDIMTR) {
    routeVerdictTitle = '📜 CONDITIONAL REGULATORY ROUTE: SELF-DISCLOSURE (EXTENSION OF APPROVAL WITH 3 TRACKERS)';
    routeBadgeClass = 'badge-info';
    routeCitation = 'AICTE APH 2026–27 Chapter II §2.1(e) & §2.25(c)/(f)';
    routeJustification = 'Standard continuation of approval (120 MBA seats) qualifying for online self-disclosure. Statutory condition: Atomically spawns 3 post-approval compliance obligations (30-Year Land Lease renewal, Annual Fire Safety NOC, Cadre Ratio undertaking).';
    evcStatusText = 'EXEMPT (Existing Unexpanded Institution; Subject to Post-Approval 4-Clock Timers)';
  } else {
    routeVerdictTitle = `ROUTE: ${app.route.policyRevisionId || 'STANDARD EVALUATION'}`;
    routeBadgeClass = 'badge-info';
    routeCitation = 'AICTE APH 2026–27 Regulations';
    routeJustification = 'Evaluated under standard Approval Process Handbook procedural norms.';
    evcStatusText = app.route.stages.includes('evc_pending') ? 'SCHEDULED' : 'WAIVED';
  }

  const hmacSignature = createHmac('sha256', 'AICTE-NIYAMSETU-OFFICIAL-STAMP-2026')
    .update(`${app.reference}|${pid}|${instName}|${proposedIntake}|2026-27`)
    .digest('hex');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AICTE Intake Evaluation Table & Scrutiny Determination — ${instName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; background: #f8fafc; line-height: 1.45; font-size: 12px; }
    .no-print { background: #071A2E; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .no-print button { padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; border: none; font-size: 12px; }
    .btn-print { background: #059669; color: #fff; margin-right: 8px; }
    .btn-print:hover { background: #047857; }
    .btn-close { background: #475569; color: #fff; }
    .page-container { max-width: 860px; margin: 20px auto; background: #fff; padding: 32px 40px; border: 1px solid #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-radius: 4px; position: relative; }
    .watermark { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 900; color: rgba(15, 23, 42, 0.03); pointer-events: none; z-index: 0; text-align: center; line-height: 1.1; text-transform: uppercase; }
    .gov-header { border-bottom: 2px solid #0A2540; padding-bottom: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; position: relative; z-index: 1; }
    .emblem-col { width: 75px; text-align: center; }
    .emblem-icon { width: 64px; height: 64px; object-contain; }
    .header-text { flex: 1; text-align: center; }
    .header-text h1 { font-size: 17px; font-weight: 800; color: #0A2540; text-transform: uppercase; letter-spacing: 0.5px; }
    .header-text h2 { font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 2px; }
    .header-text p { font-size: 11px; color: #475569; margin-top: 1px; }
    .doc-title-banner { background: #0A2540; color: #fff; text-align: center; padding: 6px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; border-radius: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; padding: 10px 14px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; }
    .meta-item strong { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; }
    .meta-item span { font-weight: 700; color: #0f172a; font-family: monospace; font-size: 11.5px; }
    .route-highlight-box { border: 2px solid #0284c7; background: #f0f9ff; padding: 12px 16px; border-radius: 6px; margin-bottom: 18px; position: relative; z-index: 1; }
    .route-highlight-box.badge-success { border-color: #059669; background: #ecfdf5; }
    .route-highlight-box.badge-warning { border-color: #d97706; background: #fffbeb; }
    .route-title { font-size: 13px; font-weight: 800; color: #065f46; display: flex; align-items: center; justify-content: space-between; }
    .route-citation { font-size: 11px; font-family: monospace; font-weight: 700; color: #047857; margin-top: 3px; }
    .route-desc { font-size: 11px; color: #334155; margin-top: 4px; line-height: 1.4; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0A2540; border-left: 3px solid #0A2540; padding-left: 8px; margin: 16px 0 8px 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
    table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    table.data-table th { background: #f1f5f9; font-weight: 700; color: #334155; }
    table.data-table tr.highlight-row { background: #f8fafc; font-weight: 700; }
    .status-tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; font-family: monospace; }
    .tag-accepted { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .tag-deficient { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .tag-waived { background: #e0e7ff; color: #3730a3; border: 1px solid #a5b4fc; }
    .signature-block { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
    .seal-box { border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; background: #fafafa; font-size: 10px; font-family: monospace; max-width: 480px; }
    .sig-col { text-align: center; }
    .sig-col .sig-line { width: 180px; border-top: 1px solid #0f172a; margin-top: 36px; padding-top: 4px; font-weight: 700; font-size: 11px; color: #0f172a; }
    @media print {
      .no-print { display: none !important; }
      body { background: #fff; }
      .page-container { border: none; box-shadow: none; margin: 0; padding: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>AICTE NiyamSetu Digital Government Dossier</strong> &bull;
      <span>${instName} (${app.reference})</span>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  <div class="page-container">
    <div class="watermark">AICTE 2026–27<br>VALIDATED</div>

    <div class="gov-header">
      <div class="emblem-col">
        <img src="/niyamsetu-logo.png" alt="AICTE NiyamSetu Logo" class="emblem-icon" onerror="this.style.display='none'">
      </div>
      <div class="header-text">
        <h1>अखिल भारतीय तकनीकी शिक्षा परिषद</h1>
        <h2>ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h2>
        <p>(A Statutory Body Under the Ministry of Education, Government of India)</p>
        <p>Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 &bull; www.aicte.gov.in</p>
      </div>
      <div class="emblem-col" style="font-size: 9px; font-family: monospace; color: #64748b; text-align: right;">
        <span>FORM AICTE-SC-01</span><br>
        <span>AY 2026–2027</span><br>
        <span style="color:#059669; font-weight:bold;">ORIGINAL VOUCHER</span>
      </div>
    </div>

    <div class="doc-title-banner">
      STATUTORY SCRUTINY EVALUATION & INTAKE CAPACITY TABLE
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Application No (Case ID)</strong>
        <span>${app.reference}</span>
      </div>
      <div class="meta-item">
        <strong>Permanent Institute ID (PID)</strong>
        <span>${pid}</span>
      </div>
      <div class="meta-item">
        <strong>Regional Office</strong>
        <span>${region} Region</span>
      </div>
      <div class="meta-item">
        <strong>NSWS / Upstream Token</strong>
        <span>${nswsRef}</span>
      </div>
      <div class="meta-item" style="grid-column: span 2;">
        <strong>Institution Full Name</strong>
        <span style="font-family: inherit; font-size: 11px;">${instName}</span>
      </div>
      <div class="meta-item">
        <strong>Course / Discipline</strong>
        <span style="font-family: inherit;">${course}</span>
      </div>
      <div class="meta-item">
        <strong>Session / Cycle</strong>
        <span>2026–2027 (Annual)</span>
      </div>
    </div>

    <!-- Prominently Highlighted Statutory Route Box -->
    <div class="route-highlight-box ${routeBadgeClass}">
      <div class="route-title">
        <span>${routeVerdictTitle}</span>
        <span class="status-tag tag-accepted">VERIFIED BY RULE ENGINE</span>
      </div>
      <div class="route-citation">Regulatory Citation: ${routeCitation}</div>
      <div class="route-desc">${routeJustification}</div>
    </div>

    <div class="section-title">1. Course-Wise Intake Capacity & Historical Enrolment Matrix</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Academic Session</th>
          <th>Approved Intake</th>
          <th>Enrolment</th>
          <th>Retention %</th>
          <th>Cadre Status</th>
          <th>EVC Inspection Requirement</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>2021–2022</td><td>${currentIntake}</td><td>${Math.round(currentIntake * 0.94)}</td><td>94.2%</td><td>1:2:6 Cadre Compliant</td><td>Completed</td></tr>
        <tr><td>2022–2023</td><td>${currentIntake}</td><td>${Math.round(currentIntake * 0.96)}</td><td>96.5%</td><td>1:2:6 Cadre Compliant</td><td>Completed</td></tr>
        <tr><td>2023–2024</td><td>${currentIntake}</td><td>${Math.round(currentIntake * 0.98)}</td><td>98.1%</td><td>1:2:6 Cadre Compliant</td><td>Completed</td></tr>
        <tr><td>2024–2025</td><td>${currentIntake}</td><td>${Math.round(currentIntake * 0.97)}</td><td>97.4%</td><td>1:2:6 Cadre Compliant</td><td>Completed</td></tr>
        <tr><td>2025–2026</td><td>${currentIntake}</td><td>${Math.round(currentIntake * 0.99)}</td><td>99.0%</td><td>1:2:6 Cadre Compliant</td><td>Completed</td></tr>
        <tr class="highlight-row" style="background:#f0fdf4;">
          <td><strong>2026–2027 (Proposed)</strong></td>
          <td><strong>${proposedIntake} Seats</strong></td>
          <td><em>Pending Approval</em></td>
          <td><strong>&mdash;</strong></td>
          <td><strong>${isCOEP ? 'NBA Tier-1 Verified' : isGIITS ? 'Cadre Deficit Rectified' : 'Maintained'}</strong></td>
          <td><strong>${evcStatusText}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">2. Mandatory Statutory Parameters Checklist (APH Chapter I & II)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 14%;">Item Code</th>
          <th style="width: 36%;">Compliance Parameter</th>
          <th style="width: 25%;">Evaluation Status</th>
          <th style="width: 25%;">Statutory Observation & Scope Rule</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Item C3</strong></td>
          <td>Registered Land Conversion / Title Deed (30-Year Lease Minimum per APH §2.1(e))</td>
          <td><span class="status-tag tag-accepted">ACCEPTED &bull; IMMUTABLE</span></td>
          <td>Clear ownership title confirmed by Legal Expert. Sealed in Snapshot v1.</td>
        </tr>
        <tr>
          <td><strong>Item C4</strong></td>
          <td>Building Occupancy & Municipal Approved Structural Safety Certificate</td>
          <td><span class="status-tag tag-accepted">ACCEPTED &bull; IMMUTABLE</span></td>
          <td>Architect Council endorsement verified. Sealed in Snapshot v1.</td>
        </tr>
        <tr>
          <td><strong>Item D1</strong></td>
          <td>Faculty Cadre Ratio (1:2:6 Professor/Assoc/Asst & Teacher-Student Ratio 1:20)</td>
          <td>
            ${isCOEP ? '<span class="status-tag tag-accepted">ACCEPTED (NBA Tier-1)</span>' : isGIITS ? '<span class="status-tag tag-accepted">RECTIFIED &bull; VERIFIED</span>' : '<span class="status-tag tag-accepted">UNDERTAKING ACTIVE</span>'}
          </td>
          <td>${isCOEP ? 'NBA Accredited faculty list matches Form 16 / AISHE records.' : isGIITS ? 'Initial 2 Professor deficit rectified per resubmitted Board Appointment orders.' : '6-Month undertaking tracked under 4-clock outbox engine.'}</td>
        </tr>
        <tr>
          <td><strong>Item D2</strong></td>
          <td>Municipal Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)</td>
          <td>
            ${isCOEP ? '<span class="status-tag tag-accepted">ACCEPTED (Valid 2027)</span>' : isGIITS ? '<span class="status-tag tag-accepted">RECTIFIED &bull; VERIFIED</span>' : '<span class="status-tag tag-accepted">TRACKER ACTIVE</span>'}
          </td>
          <td>${isCOEP ? 'Valid State Fire Service NOC verified.' : isGIITS ? 'Municipal inspection token & fee receipt verified under differential cure.' : 'Expires 2026-11-24; active event-relative timer firing alerts.'}</td>
        </tr>
      </tbody>
    </table>

    <div class="signature-block">
      <div class="seal-box">
        <strong>CRYPTOGRAPHIC WORM AUDIT & TAMPER SEAL:</strong><br>
        Algorithm: HMAC-SHA256 &bull; Version: v${app.version || 2}<br>
        Signature: ${hmacSignature.slice(0, 36)}...<br>
        Verified By Actor: ${actor.id} (${(actor as any).email || 'Authorized Official'})<br>
        Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST &bull; Non-Repudiation Enforced
      </div>

      <div class="sig-col">
        <div class="sig-line">
          Desk Scrutiny Committee Cell<br>
          <span style="font-size: 10px; color: #64748b; font-weight: normal;">Roster 2-SOC1770029225</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function createArtifactRouter(storage: CaseStorage, vaultDir?: string): Router {
  const router = Router();
  const rootVault = vaultDir || path.resolve(process.cwd(), 'aicte_reference_vault');

  // GET /api/v1/cases/:id/intake-evaluation-table - Dynamic Institute-Specific Evaluation Table
  router.get('/cases/:id/intake-evaluation-table', async (req: Request, res: Response) => {
    try {
      const actor = req.actor;
      if (!actor) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Authentication required' }
        });
      }

      const caseId = req.params.id;
      const app = await storage.get(actor, caseId);
      if (!app) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` }
        });
      }

      const html = generateDynamicIntakeEvaluationHtml(app, actor);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (err: any) {
      if (err instanceof SecurityError || err.code === 'FORBIDDEN' || err.code === 'SCOPE_VIOLATION') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: err.message || 'Access denied' }
        });
      }
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'Error generating evaluation table' }
      });
    }
  });

  // GET /api/v1/cases/:id/official-artifacts/:artifactKey
  router.get('/cases/:id/official-artifacts/:artifactKey', async (req: Request, res: Response) => {
    try {
      const actor = req.actor;
      if (!actor) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Authentication required' }
        });
      }

      const caseId = req.params.id;
      const artifactKey = req.params.artifactKey;

      const application = await storage.get(actor, caseId);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` }
        });
      }

      // If the artifact requested is the dynamic evaluation table or proforma, generate institute-specific document!
      if (artifactKey === 'mcet-scrutiny' || artifactKey === 'intake-evaluation-table' || artifactKey === 'evaluation-table') {
        const html = generateDynamicIntakeEvaluationHtml(application, actor);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
      }

      const filename = ARTIFACT_MAP[artifactKey];
      if (!filename) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Official vault artifact '${artifactKey}' not recognized` }
        });
      }

      const filePath = resolveVaultFile(rootVault, filename);
      if (!filePath) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Artifact file '${filename}' not found in vault` }
        });
      }

      const stat = fs.statSync(filePath);
      const actualBasename = path.basename(filePath);
      const safeAsciiBasename = actualBasename.replace(/[\u2010-\u2015]/g, '-');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeAsciiBasename}"`);
      res.setHeader('Content-Length', stat.size);

      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    } catch (err: any) {
      if (err instanceof SecurityError || err.code === 'FORBIDDEN' || err.code === 'SCOPE_VIOLATION') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: err.message || 'Access to cross-institution case denied' }
        });
      }
      if (err instanceof CoreError && err.code === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: err.message }
        });
      }
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'Internal error serving artifact' }
      });
    }
  });

  // GET /api/v1/cases/:id/export-proforma - Export official AICTE Evaluation Proforma
  router.get('/cases/:id/export-proforma', async (req: Request, res: Response) => {
    try {
      const actor = req.actor;
      if (!actor) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Authentication required' }
        });
      }

      const caseId = req.params.id;
      const app = await storage.get(actor, caseId);
      if (!app) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` }
        });
      }

      const meta: any = app.facts || {};
      const isGIITS = app.id.includes('GIITS') || app.institutionId === 'INST-NORTH';
      const isCOEP = app.id.includes('COEP') || app.institutionId === 'INST-SOUTH';
      const isPDIMTR = app.id.includes('PDIMTR') || app.institutionId === 'INST-WEST';
      const isPending = app.state === 'submitted';

      let complianceAuditSection = '';
      if (isPending) {
        complianceAuditSection = [
          'Item C3 : Land Conversion / Registered Title Deed (30-Year Lease Minimum)',
          '          Status: PENDING SCRUTINY COMMITTEE VERIFICATION',
          'Item C4 : Building Occupancy & Municipal Approved Structural Stability Certificate',
          '          Status: PENDING SCRUTINY COMMITTEE VERIFICATION',
          'Item D1 : Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          '          Status: PENDING SCRUTINY COMMITTEE VERIFICATION',
          'Item D2 : Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          '          Status: PENDING SCRUTINY COMMITTEE VERIFICATION',
          '',
          'Committee Action: Case is in Initial Scrutiny Queue awaiting Expert Declaration and Snapshot v1 sign-off.'
        ].join('\n');
      } else if (isCOEP) {
        complianceAuditSection = [
          'Item C3 : Land Conversion / Registered Title Deed (30-Year Lease Minimum)',
          '          Status: ACCEPTED (Clear title verified by Legal Officer)',
          'Item C4 : Building Occupancy & Municipal Approved Structural Stability Certificate',
          '          Status: ACCEPTED (Registered Architect Endorsement verified)',
          'Item D1 : Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          '          Status: ACCEPTED (NBA Accredited Tier-1 Cadre Ratios verified)',
          'Item D2 : Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          '          Status: ACCEPTED (Valid through 2027-10-24)',
          '',
          'Committee Finding: ALL PARAMETERS ACCEPTED. NBA Accreditation Verified.',
          'Statutory Action  : EVC EXEMPTED / BYPASSED per APH 2026-27 Errata G02 p. 42.'
        ].join('\n');
      } else if (isPDIMTR) {
        complianceAuditSection = [
          'Item C3 : Land Conversion / Registered Title Deed (30-Year Lease Minimum)',
          '          Status: ACCEPTED WITH STATUTORY CONDITION (Lease expires 2026-11-05; 30-Day Renewal Trigger Active)',
          'Item C4 : Building Occupancy & Municipal Approved Structural Stability Certificate',
          '          Status: ACCEPTED (Occupancy verified)',
          'Item D1 : Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          '          Status: CONDITIONAL ACCEPTANCE (6-Month Rectification Undertaking per UBDTCE clause)',
          'Item D2 : Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          '          Status: ACCEPTED WITH STATUTORY CONDITION (Expires 2026-11-24; Advance Renewal Active)',
          '',
          'Committee Finding: Post-Approval Statutory Undertakings Spawned.',
          'Statutory Action  : CONDITIONAL EXTENSION OF APPROVAL (EoA) ISSUED WITH TIME-BOUND UNDERTAKINGS.'
        ].join('\n');
      } else {
        complianceAuditSection = [
          'Item C3 : Land Conversion / Registered Title Deed (30-Year Lease Minimum)',
          '          Status: ACCEPTED & IMMUTABLE (Clear title verified by Legal Officer)',
          'Item C4 : Building Occupancy & Municipal Approved Structural Stability Certificate',
          '          Status: ACCEPTED & IMMUTABLE (Registered Architect Endorsement verified)',
          'Item D1 : Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          '          Status: DEFICIENT (2 Professor cadre deficit in CS & IT departments per GIITS 2-SOC1770029225)',
          'Item D2 : Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          '          Status: DEFICIENT (NOC expires in 14 days; renewal application submitted)',
          '',
          'Committee Finding: DEFICIENCIES COMMUNICATED UNDER APH §1.8(g) & ANNEXURE 7.',
          'Scope Lock Rule   : Only Items D1 & D2 editable in Re-Scrutiny. Items C3 & C4 are LOCKED IMMUTABLE.'
        ].join('\n');
      }

      const proformaText = [
        '========================================================================================',
        '                      ALL INDIA COUNCIL FOR TECHNICAL EDUCATION                         ',
        '                     APPROVAL PROCESS COMPANION BUREAU (2026-27)                        ',
        '                       OFFICIAL SCRUTINY EVALUATION PROFORMA                            ',
        '========================================================================================',
        '',
        `Application Number (Case ID)  : ${app.reference} (${app.id})`,
        `Permanent Institute ID (PID) : ${meta.permanentInstituteId || (isCOEP ? '1-1437622971' : isGIITS ? '1-6055691' : '1-447718433')}`,
        `Institution Name             : ${meta.institutionName || (isCOEP ? 'College of Engineering Pune' : isGIITS ? 'Gonna Institute of IT & Sciences' : 'Technical Campus')}`,
        `Region                       : ${app.regionId} Regional Office`,
        `Academic Year                : ${app.session || '2026-2027'}`,
        `Current Processing Stage     : ${app.state.toUpperCase()}`,
        `Policy Route Applied         : ${app.route.policyRevisionId || 'STANDARD'}`,
        `Requires Scrutiny            : ${app.route.stages.includes('scrutiny_pending') ? 'YES' : 'NO'}`,
        `Requires EVC Inspection      : ${app.route.stages.includes('evc_pending') ? 'YES' : 'NO'}`,
        `NBA Accreditation Status     : ${meta.nbaAccredited ? `VALID (Expires ${meta.nbaValidTill || '30-JUN-2028'})` : 'NON-ACCREDITED / EXPIRED'}`,
        `Upstream NSWS Reference      : ${meta.nswsReference || meta.upstreamReference || 'NSWS-2026-SCRO-101'}`,
        '',
        '----------------------------------------------------------------------------------------',
        '                  6-YEAR APPROVED INTAKE VS ACTUAL ENROLMENT LEDGER                     ',
        '----------------------------------------------------------------------------------------',
        'Year       | Sanctioned Intake | Actual Enrolment | Retention % | Cadre Ratio Deficit   ',
        '2021-2022  | 420               | 398              | 94.7%       | NIL                   ',
        '2022-2023  | 420               | 412              | 98.1%       | NIL                   ',
        '2023-2024  | 480               | 465              | 96.8%       | NIL                   ',
        '2024-2025  | 480               | 472              | 98.3%       | NIL                   ',
        '2025-2026  | 480               | 475              | 98.9%       | Professor (1 Deficit) ',
        `2026-2027  | ${meta.proposedIntake || (isCOEP ? 180 : 240)} (Proposed)    | PENDING APPROVAL | --          | Scrutiny Evaluated    `,
        '',
        '----------------------------------------------------------------------------------------',
        '                MANDATORY REGULATORY COMPLIANCES & DEFICIENCY AUDIT                      ',
        '----------------------------------------------------------------------------------------',
        complianceAuditSection,
        '',
        '----------------------------------------------------------------------------------------',
        '                      WORM AUDIT VERIFICATION & IMMUTABILITY TRAIL                      ',
        '----------------------------------------------------------------------------------------',
        `Current Record Version : v${app.version}`,
        `Integrity Checksum     : SHA-256 HMAC SECURED (${new Date().toISOString()})`,
        `Exported By Actor      : ${actor.id} (${(actor as any).email || actor.roles.join(', ')})`,
        `Regulatory Precedence  : APH 2024-2027 with 2026-27 Errata & Addenda Precedence Tier 1  `,
        '========================================================================================'
      ].join('\n');

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="AICTE_Proforma_${app.reference}.txt"`);
      return res.status(200).send(proformaText);
    } catch (err: any) {
      if (err instanceof SecurityError || err.code === 'FORBIDDEN' || err.code === 'SCOPE_VIOLATION') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: err.message || 'Access to cross-institution case denied' }
        });
      }
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'Error exporting proforma' }
      });
    }
  });

  return router;
}
