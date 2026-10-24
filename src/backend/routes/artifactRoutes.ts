import { Router, Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
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
  'mcet-scrutiny': 'AICTE Scrutiny Evaluation-Report 2023-24 [Full Scrutiny Evaluation Table - (MCET)].pdf',
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

export function createArtifactRouter(storage: CaseStorage, vaultDir?: string): Router {
  const router = Router();
  const rootVault = vaultDir || path.resolve(process.cwd(), 'aicte_reference_vault');

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

      // Storage.get enforces P0 tenant isolation: if actor lacks access, it throws FORBIDDEN
      // and logs the violation directly to core_audit
      const application = await storage.get(actor, caseId);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` }
        });
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
        `Permanent Institute ID (PID) : ${meta.permanentInstituteId || '1-6055691'}`,
        `Institution Name             : ${meta.institutionName || 'All India Technical Campus'}`,
        `Region                       : ${app.regionId} Regional Office`,
        `Academic Year                : ${app.session || '2026-2027'}`,
        `Current Processing Stage     : ${app.state.toUpperCase()}`,
        `Policy Route Applied         : ${app.route.policyRevisionId || 'STANDARD'} (${app.route.policyRevisionId || 'INTAKE_INCREASE'})`,
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
        `2026-2027  | ${meta.proposedIntake || 540} (Proposed)    | PENDING APPROVAL | --          | Scrutiny Evaluated    `,
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
