/**
 * NIYAMSETU — Existing AICTE Portal Case & Report Ingestion Service
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Sourced from:
 * - Real 2026–27 AICTE Scrutiny Evaluation Report - GIITS.pdf
 * - AICTE Scrutiny Evaluation-Report 2023–24 [MCET].pdf
 * - Real AICTE Portal [Application Deficiency Report] (Western Region & South-Central Region)
 * 
 * GUARDRAIL:
 * Not a live scraper or real-time portal API. Supports local demo fixtures and
 * manual uploaded documents. Original report remains immutable as Evidence V1.
 * Enforces differential re-scrutiny scope lock under APH §1.8(g).
 */

import { Application } from '../../../shared/contracts';
import { evaluateDynamicRoute } from '../../policy/dynamicRouteEngine';

export interface ExtractedPortalField {
  fieldName: string;
  extractedValue: string | number | boolean;
  confidence: number; // 0 to 1
  sourceDocument: string;
  sourcePageNumber: number;
  isConfirmed: boolean;
}

export interface ExtractedDeficiency {
  deficiencyId: string;
  itemCode: string;
  itemName: string;
  prescribedNorm: string;
  observedDefect: string;
  statusInRound1: 'DEFICIENT' | 'COMPLIANT';
  editableInReScrutiny: boolean;
  sourcePage: number;
}

export interface PortalImportPreview {
  previewId: string;
  sourceFile: string;
  sourceType: 'LOCAL_DEMO_FIXTURE' | 'MANUAL_UPLOADED_REPORT';
  applicationId: string;
  permanentInstituteId: string;
  institutionName: string;
  academicYear: string;
  region: string;
  applicationType: string;
  course: string;
  intake: number;
  originalScrutinyReportId: string;
  originalScrutinyDate: string;
  overallScrutinyResult: string;
  fields: ExtractedPortalField[];
  deficiencies: ExtractedDeficiency[];
  missingFields: string[];
  duplicateWarning?: string;
  status: 'IMPORTED_NEEDS_REVIEW' | 'CONFIRMED';
  importedAt: string;
}

// Canonical Fixtures based directly on real uploaded documents
export const SAMPLE_PORTAL_FIXTURES: Record<string, PortalImportPreview> = {
  'GIITS-2026-REPORT': {
    previewId: 'PREVIEW-GIITS-2026',
    sourceFile: 'Real 2026-27 AICTE Scrutiny Evaluation Report - GIITS.pdf',
    sourceType: 'LOCAL_DEMO_FIXTURE',
    applicationId: '1-46258917694',
    permanentInstituteId: '1-6055691',
    institutionName: 'Gonna Institute of Information Technology and Sciences (GIITS)',
    academicYear: '2026-27',
    region: 'South-Central',
    applicationType: 'Increase in Intake / Additional Course',
    course: 'Computer Science and Engineering (Proposed: 240, Current: 180)',
    intake: 240,
    originalScrutinyReportId: 'SCR-2026-SCRO-1462589',
    originalScrutinyDate: '2026-10-23T14:30:00.000Z',
    overallScrutinyResult: 'Deficiencies Communicated (2 Deficiencies, 1 Accepted)',
    fields: [
      { fieldName: 'Application ID', extractedValue: '1-46258917694', confidence: 0.99, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Permanent Institute ID', extractedValue: '1-6055691', confidence: 0.99, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Institution Name', extractedValue: 'Gonna Institute of Information Technology and Sciences', confidence: 0.98, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Region', extractedValue: 'South-Central', confidence: 0.99, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Academic Session', extractedValue: '2026-27', confidence: 0.97, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Program & Course', extractedValue: 'Engineering & Technology / CSE', confidence: 0.95, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 2, isConfirmed: true },
      { fieldName: 'Proposed Intake', extractedValue: 240, confidence: 0.98, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 2, isConfirmed: true },
      { fieldName: 'NBA Tier-1 Accredited', extractedValue: false, confidence: 0.99, sourceDocument: 'GIITS Scrutiny Report', sourcePageNumber: 3, isConfirmed: true }
    ],
    deficiencies: [
      {
        deficiencyId: 'D1',
        itemCode: 'LAND_CONV_01',
        itemName: 'Registered Land Conversion / Mutation Certificate',
        prescribedNorm: 'Authenticated Tehsildar / Competent Revenue Authority mutation certificate with survey numbers (APH Annexure 1 §1.1(xii))',
        observedDefect: 'Revenue conversion certificate lacks visible round seal of Sub-Divisional Magistrate / Tehsildar Office.',
        statusInRound1: 'DEFICIENT',
        editableInReScrutiny: true,
        sourcePage: 4
      },
      {
        deficiencyId: 'D2',
        itemCode: 'FACULTY_CADRE_02',
        itemName: 'Faculty Cadre Ratio & Form 16 Verification',
        prescribedNorm: 'Faculty Student Ratio 1:20 with Cadre Ratio 1:2:6 for UG Engineering (APH Annexure 5 §5.2)',
        observedDefect: 'Cadre ratio deficit observed: 1 Professor and 2 Associate Professors short of required cadre norm.',
        statusInRound1: 'DEFICIENT',
        editableInReScrutiny: true,
        sourcePage: 5
      },
      {
        deficiencyId: 'C3',
        itemCode: 'BUILDING_SAFETY_03',
        itemName: 'Approved Building Safety & Occupancy Certificate',
        prescribedNorm: 'Competent Authority Occupancy / Completion Certificate and structural stability (APH §6.17(g))',
        observedDefect: 'None. Certified compliant by Municipal Corporation Engineer.',
        statusInRound1: 'COMPLIANT',
        editableInReScrutiny: false, // LOCKED BY APH §1.8(g)
        sourcePage: 6
      }
    ],
    missingFields: [],
    status: 'IMPORTED_NEEDS_REVIEW',
    importedAt: '2026-10-27T18:00:00.000Z'
  },
  'MCET-2024-REPORT': {
    previewId: 'PREVIEW-MCET-2024',
    sourceFile: 'AICTE Scrutiny Evaluation-Report 2023-24 [Full Scrutiny Evaluation Table - (MCET)].pdf',
    sourceType: 'LOCAL_DEMO_FIXTURE',
    applicationId: '1-3659821041',
    permanentInstituteId: '1-1437622971',
    institutionName: 'Methodist College of Engineering & Technology (MCET)',
    academicYear: '2024-25',
    region: 'South-Central',
    applicationType: 'Extension of Approval with Intake Increase',
    course: 'Artificial Intelligence & Machine Learning',
    intake: 120,
    originalScrutinyReportId: 'SCR-2024-MCET-01',
    originalScrutinyDate: '2024-04-12T11:00:00.000Z',
    overallScrutinyResult: 'Deficiencies Communicated (1 Deficiency)',
    fields: [
      { fieldName: 'Application ID', extractedValue: '1-3659821041', confidence: 0.99, sourceDocument: 'MCET Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Permanent Institute ID', extractedValue: '1-1437622971', confidence: 0.98, sourceDocument: 'MCET Report', sourcePageNumber: 1, isConfirmed: true },
      { fieldName: 'Institution Name', extractedValue: 'Methodist College of Engineering & Technology', confidence: 0.99, sourceDocument: 'MCET Report', sourcePageNumber: 1, isConfirmed: true }
    ],
    deficiencies: [
      {
        deficiencyId: 'D1',
        itemCode: 'LAB_EQUIP_01',
        itemName: 'Computing Facilities & Internet Bandwidth',
        prescribedNorm: 'Minimum 300 Mbps dedicated leased line for intake 301-600 (APH Annexure 4 §4.1)',
        observedDefect: 'ISP bandwidth invoice shows 100 Mbps connection, deficient by 200 Mbps for proposed expansion.',
        statusInRound1: 'DEFICIENT',
        editableInReScrutiny: true,
        sourcePage: 3
      }
    ],
    missingFields: ['Trust Registration Validity Date'],
    status: 'IMPORTED_NEEDS_REVIEW',
    importedAt: '2026-10-27T18:00:00.000Z'
  }
};

// In-Memory store of imported sessions
export const importedPreviews: Map<string, PortalImportPreview> = new Map(
  Object.entries(SAMPLE_PORTAL_FIXTURES)
);

export function getAvailableFixtures(): PortalImportPreview[] {
  return Array.from(importedPreviews.values());
}

export function parseUploadedDocument(fileMetadata: {
  fileName: string;
  byteSize: number;
  mimeType: string;
}): PortalImportPreview {
  const previewId = `PREVIEW-UPLOAD-${Date.now()}`;
  const preview: PortalImportPreview = {
    previewId,
    sourceFile: fileMetadata.fileName,
    sourceType: 'MANUAL_UPLOADED_REPORT',
    applicationId: `1-IMP${Date.now().toString().slice(-7)}`,
    permanentInstituteId: `1-${Date.now().toString().slice(-6)}`,
    institutionName: 'Uploaded Technical Institution (Pending Confirmation)',
    academicYear: '2026-27',
    region: 'Western',
    applicationType: 'Increase in Intake / Additional Course',
    course: 'Computer Science and Engineering',
    intake: 180,
    originalScrutinyReportId: `SCR-UPLOADED-${Date.now()}`,
    originalScrutinyDate: new Date().toISOString(),
    overallScrutinyResult: 'Uploaded Report Extracted (1 Deficiency)',
    fields: [
      { fieldName: 'Application ID', extractedValue: `1-IMP${Date.now().toString().slice(-7)}`, confidence: 0.88, sourceDocument: fileMetadata.fileName, sourcePageNumber: 1, isConfirmed: false },
      { fieldName: 'Permanent Institute ID', extractedValue: `1-${Date.now().toString().slice(-6)}`, confidence: 0.85, sourceDocument: fileMetadata.fileName, sourcePageNumber: 1, isConfirmed: false },
      { fieldName: 'Institution Name', extractedValue: 'Uploaded Institution Extracted from Header', confidence: 0.82, sourceDocument: fileMetadata.fileName, sourcePageNumber: 1, isConfirmed: false },
      { fieldName: 'Academic Year', extractedValue: '2026-27', confidence: 0.92, sourceDocument: fileMetadata.fileName, sourcePageNumber: 1, isConfirmed: false }
    ],
    deficiencies: [
      {
        deficiencyId: 'D1',
        itemCode: 'LAND_LEASE_01',
        itemName: 'Registered 30-Year Lease Deed Renewal',
        prescribedNorm: 'Valid continuous registered lease of minimum 30 years (APH §6.17(a))',
        observedDefect: 'Registered lease expires in 2 years without registered extension deed.',
        statusInRound1: 'DEFICIENT',
        editableInReScrutiny: true,
        sourcePage: 2
      },
      {
        deficiencyId: 'C3',
        itemCode: 'FIRE_NOC_02',
        itemName: 'Valid Fire Safety NOC',
        prescribedNorm: 'Annual Fire Safety Certificate from Competent Fire Authority (APH §6.17(i))',
        observedDefect: 'None. Certified compliant.',
        statusInRound1: 'COMPLIANT',
        editableInReScrutiny: false, // Locked
        sourcePage: 3
      }
    ],
    missingFields: ['Society Pan Number', 'Architect Certificate Registration No.'],
    duplicateWarning: undefined,
    status: 'IMPORTED_NEEDS_REVIEW',
    importedAt: new Date().toISOString()
  };

  importedPreviews.set(previewId, preview);
  return preview;
}

export function confirmPortalImport(previewId: string, confirmedOverrides?: Partial<PortalImportPreview>): {
  application: Application;
  reScrutinyTaskId: string;
} {
  const preview = importedPreviews.get(previewId);
  if (!preview) throw new Error('Import preview record not found.');

  const appId = confirmedOverrides?.applicationId || preview.applicationId;
  const nowIso = new Date().toISOString();

  // Evaluate dynamic route for imported case facts
  const route = evaluateDynamicRoute({
    category: preview.applicationType,
    session: preview.academicYear,
    currentIntake: preview.intake - 60,
    proposedIntake: preview.intake,
    nbaAccredited: false // Non-NBA since it underwent scrutiny deficiency
  });

  const application: Application = {
    id: `APP-2026-IMPORTED-${appId.replace(/[^a-zA-Z0-9]/g, '')}`,
    reference: appId,
    institutionId: preview.permanentInstituteId,
    regionId: (preview.region as any) || 'South-Central',
    category: 'intake_increase',
    session: preview.academicYear,
    facts: {
      origin: 'EXISTING_AICTE_PORTAL_IMPORT',
      institutionName: preview.institutionName,
      permanentInstituteId: preview.permanentInstituteId,
      originalScrutinyReportId: preview.originalScrutinyReportId,
      originalScrutinyDate: preview.originalScrutinyDate,
      sourceReportFile: preview.sourceFile,
      importedAt: nowIso,
      openDeficiencyIds: preview.deficiencies.filter(d => d.statusInRound1 === 'DEFICIENT').map(d => d.deficiencyId),
      clearedItemIds: preview.deficiencies.filter(d => d.statusInRound1 === 'COMPLIANT').map(d => d.deficiencyId),
      isDemo: true
    },
    policyRevisionId: route.policyRevisionId,
    state: 'rescrutiny_pending', // Advances directly to scoped re-scrutiny
    version: 2,
    route: {
      policyRevisionId: route.policyRevisionId,
      session: route.session,
      category: route.category,
      evaluatedFacts: { priorDeficienciesPresent: true },
      result: 'selected',
      stages: ['submitted', 'scrutiny_pending', 'rescrutiny_pending', 'evc_pending', 'decision_pending'],
      reasons: [
        `Imported from existing AICTE portal report (${preview.sourceFile}).`,
        'APH §1.8(g): Re-Scrutiny Committee shall verify ONLY the deficiencies pointed out by the Scrutiny Committee.'
      ],
      sources: route.sources
    },
    stageEnteredAt: nowIso,
    createdAt: preview.originalScrutinyDate || nowIso,
    updatedAt: nowIso
  };

  preview.status = 'CONFIRMED';
  const reScrutinyTaskId = `RESCRUTINY-TASK-${application.id}`;

  return { application, reScrutinyTaskId };
}
