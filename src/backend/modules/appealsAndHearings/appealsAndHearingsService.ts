/**
 * NIYAMSETU — Conditional Appeals, Hearings & Grievances Engine
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Mandates:
 * - SHC, SAC and Complaints are separate conditional branches, NOT compulsory steps on main spine!
 * - A rejection alone does not send a case to SHC/SAC.
 * - Exact Chapter I (§1.11, 7 days from LoD) vs Chapter II (§2.24, 7 days from uploaded decision) appeal triggers.
 * - Chapter VII §7.10 complaint route: PGRC -> SCSC -> Show-Cause/EVC -> SHC -> EC decision.
 * - Anonymous complaints rejected under §7.10(h).
 * - Human decision gates maintained.
 */

import mongoose from 'mongoose';

export interface HearingRecord {
  id: string;
  type: 'SHC_COMPLIANCE_HEARING' | 'SAC_STATUTORY_APPEAL' | 'PGRC_COMPLAINT_HEARING';
  caseId: string;
  institutionName: string;
  referredBy: string;
  referredAt: string;
  governingClause: string;
  triggerEvent: string;
  issuesConsidered: string[];
  institutionResponse?: string;
  evidenceSubmitted?: string[];
  committeeMembers: string[];
  hearingDate?: string;
  observations?: string;
  recommendation?: 'RECOMMEND_APPROVAL' | 'RECOMMEND_RE_EVC' | 'UPHOLD_REJECTION' | 'SEEK_FURTHER_COMPLIANCE';
  status: 'PENDING_SCHEDULE' | 'SCHEDULED' | 'HEARING_COMPLETED' | 'DECIDED_BY_COUNCIL';
  councilDecisionRef?: string;
}

export interface ComplaintRecord {
  complaintId: string;
  caseId?: string;
  institutionName: string;
  complainantName: string;
  isAnonymous: boolean;
  lodgedAt: string;
  category: 'Ragging' | 'Excess Fee' | 'Capitation' | 'Faculty Pay Scales' | 'Infrastructure Deficit';
  description: string;
  evidenceDocuments: string[];
  scscScrutinyStatus: 'ADMISSIBLE' | 'REJECTED_ANONYMOUS' | 'PENDING_SCRUTINY';
  scscRemarks?: string;
  nextStep?: 'SHOW_CAUSE_NOTICE' | 'EVC_INSPECTION' | 'HEARING_BEFORE_SHC' | 'DISMISSED';
}

// In-Memory state for hearings and complaints
export const hearingsDB: Map<string, HearingRecord> = new Map([
  [
    'HEAR-SAC-APEX-01',
    {
      id: 'HEAR-SAC-APEX-01',
      type: 'SAC_STATUTORY_APPEAL',
      caseId: 'APP-2026-APEX',
      institutionName: 'Apex Institute of Technology & Management',
      referredBy: 'Principal, Apex Institute (Statutory Appeal)',
      referredAt: '2026-10-24T10:00:00.000Z',
      governingClause: 'APH Chapter I §1.11 & 2026-27 Addendum G02 p. 11 §2.23.3',
      triggerEvent: 'Aggrieved by EVC Inspection Report deficiency on Instructional Computer Lab Area',
      issuesConsidered: [
        'EVC measured Computer Lab Area as 110 sqm vs required 150 sqm for intake expansion',
        'College submits registered architect floor plan asserting adjacent server room (42 sqm) is contiguous'
      ],
      committeeMembers: [
        'Hon. Justice (Retd.) R. S. Pathak (Chairman SAC)',
        'Prof. D. K. Sharma (Director, NIT Kurukshetra - Member)',
        'Ar. Sunita Rao (Council of Architecture Nominee - Member)'
      ],
      hearingDate: '2026-10-29T11:00:00.000Z',
      status: 'SCHEDULED'
    }
  ]
]);

export const complaintsDB: Map<string, ComplaintRecord> = new Map([
  [
    'COMP-2026-001',
    {
      complaintId: 'COMP-2026-001',
      caseId: 'APP-2026-GIITS',
      institutionName: 'Gonna Institute of Information Technology and Sciences',
      complainantName: 'Faculty Welfare Association (Registered)',
      isAnonymous: false,
      lodgedAt: '2026-10-22T08:00:00.000Z',
      category: 'Faculty Pay Scales',
      description: 'Complaint regarding 7th CPC arrears and delay in PF deposit for junior faculty.',
      evidenceDocuments: ['Bank_Salary_Statements_Aug2026.pdf'],
      scscScrutinyStatus: 'ADMISSIBLE',
      scscRemarks: 'SCSC examined complaint on 2026-10-23. Found prima facie merit. Referred for Show-Cause notice under APH §7.10(c).',
      nextStep: 'SHOW_CAUSE_NOTICE'
    }
  ]
]);

export function getAllHearings(): HearingRecord[] {
  return Array.from(hearingsDB.values());
}

export function getAllComplaints(): ComplaintRecord[] {
  return Array.from(complaintsDB.values());
}

export async function persistHearingToMongo(h: HearingRecord): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection('appeals_hearings').updateOne(
        { id: h.id },
        { $set: h },
        { upsert: true }
      );
    }
  } catch {
    // Non-blocking fallback
  }
}

export async function persistComplaintToMongo(c: ComplaintRecord): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection('chapter_vii_complaints').updateOne(
        { complaintId: c.complaintId },
        { $set: c },
        { upsert: true }
      );
    }
  } catch {
    // Non-blocking fallback
  }
}

export async function syncAppealsAndHearingsFromMongo(): Promise<{ hearings: number; complaints: number }> {
  let hearingsCount = 0;
  let complaintsCount = 0;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const hItems = await mongoose.connection.db.collection('appeals_hearings').find({}).toArray();
      for (const item of hItems) {
        if (item && (item as any).id) {
          hearingsDB.set((item as any).id, item as any);
          hearingsCount++;
        }
      }
      const cItems = await mongoose.connection.db.collection('chapter_vii_complaints').find({}).toArray();
      for (const item of cItems) {
        if (item && (item as any).complaintId) {
          complaintsDB.set((item as any).complaintId, item as any);
          complaintsCount++;
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }
  return { hearings: hearingsCount, complaints: complaintsCount };
}

export function lodgeComplaint(data: {
  caseId?: string;
  institutionName: string;
  complainantName: string;
  isAnonymous: boolean;
  category: ComplaintRecord['category'];
  description: string;
  evidenceDocuments?: string[];
}): { success: boolean; complaint?: ComplaintRecord; message: string } {
  const complaintId = `COMP-${Date.now().toString().slice(-6)}`;
  
  // Guardrail: APH Chapter VII §7.10(h): Anonymous/Pseudonymous complaints shall not be processed
  if (data.isAnonymous || !data.complainantName || data.complainantName.trim().toLowerCase() === 'anonymous') {
    const rejectedRecord: ComplaintRecord = {
      complaintId,
      caseId: data.caseId,
      institutionName: data.institutionName,
      complainantName: 'Anonymous / Pseudonymous',
      isAnonymous: true,
      lodgedAt: new Date().toISOString(),
      category: data.category,
      description: data.description,
      evidenceDocuments: data.evidenceDocuments || [],
      scscScrutinyStatus: 'REJECTED_ANONYMOUS',
      scscRemarks: 'APH Chapter VII §7.10(h) Statutory Rule: As per CVC guidelines, Anonymous/Pseudonymous Complaints shall not be processed.',
      nextStep: 'DISMISSED'
    };
    complaintsDB.set(complaintId, rejectedRecord);
    persistComplaintToMongo(rejectedRecord);
    return {
      success: false,
      complaint: rejectedRecord,
      message: 'REJECTED: Under APH §7.10(h) & CVC guidelines, anonymous complaints cannot be processed.'
    };
  }

  const record: ComplaintRecord = {
    complaintId,
    caseId: data.caseId,
    institutionName: data.institutionName,
    complainantName: data.complainantName,
    isAnonymous: false,
    lodgedAt: new Date().toISOString(),
    category: data.category,
    description: data.description,
    evidenceDocuments: data.evidenceDocuments || [],
    scscScrutinyStatus: 'PENDING_SCRUTINY',
    scscRemarks: 'Awaiting Standing Complaint Scrutiny Committee (SCSC) preliminary verification under §7.10(c).',
    nextStep: 'SHOW_CAUSE_NOTICE'
  };

  complaintsDB.set(complaintId, record);
  persistComplaintToMongo(record);
  return {
    success: true,
    complaint: record,
    message: 'Complaint registered with Public Grievance Redressal Cell (PGRC) and queued for SCSC examination.'
  };
}

export function submitStatutoryAppeal(data: {
  caseId: string;
  institutionName: string;
  appealedDecisionRef: string;
  decisionDate: string;
  chapterType: 'CHAPTER_I' | 'CHAPTER_II';
  groundsOfAppeal: string;
  supportingDocuments?: string[];
  submittedBy: string;
}): { success: boolean; hearing?: HearingRecord; error?: string } {
  const hearingId = `HEAR-SAC-${Date.now().toString().slice(-6)}`;

  // Calculate appeal window (7 calendar days)
  const decisionTime = Date.parse(data.decisionDate);
  const now = Date.now();
  const elapsedDays = (now - decisionTime) / (1000 * 60 * 60 * 24);

  const governingClause = data.chapterType === 'CHAPTER_I'
    ? 'APH Chapter I §1.11 (Appeal within 7 days of Letter of Deficiency)'
    : 'APH Chapter II §2.24 (Appeal within 7 days of uploading Executive Committee decision)';

  if (elapsedDays > 7.0) {
    return {
      success: false,
      error: `APPEAL_TIME_BARRED: Appeal submitted ${elapsedDays.toFixed(1)} days after decision. Statutory limit is 7 days under ${governingClause}.`
    };
  }

  const hearing: HearingRecord = {
    id: hearingId,
    type: 'SAC_STATUTORY_APPEAL',
    caseId: data.caseId,
    institutionName: data.institutionName,
    referredBy: data.submittedBy,
    referredAt: new Date().toISOString(),
    governingClause,
    triggerEvent: `Statutory appeal against decision ${data.appealedDecisionRef}`,
    issuesConsidered: [data.groundsOfAppeal],
    evidenceSubmitted: data.supportingDocuments || [],
    committeeMembers: [
      'Hon. Retired High Court Judge (Chairman SAC per Annexure 16.6)',
      'Academician of Eminence (NIT/IIT - Member)',
      'Officer not below Deputy Director Revenue / Registered Architect (Member)'
    ],
    status: 'PENDING_SCHEDULE'
  };

  hearingsDB.set(hearingId, hearing);
  persistHearingToMongo(hearing);
  return { success: true, hearing };
}

export function referShortcomingsToSHC(data: {
  caseId: string;
  institutionName: string;
  originReportRef: string;
  shortcomings: string[];
  referredBy: string;
}): HearingRecord {
  const hearingId = `HEAR-SHC-${Date.now().toString().slice(-6)}`;
  const hearing: HearingRecord = {
    id: hearingId,
    type: 'SHC_COMPLIANCE_HEARING',
    caseId: data.caseId,
    institutionName: data.institutionName,
    referredBy: data.referredBy,
    referredAt: new Date().toISOString(),
    governingClause: 'APH Chapter II §2.23.3 (Verification of Compliance through Standing Hearing Committee)',
    triggerEvent: `Shortcomings noted in report ${data.originReportRef}`,
    issuesConsidered: data.shortcomings,
    committeeMembers: [
      'Retired High Court Judge / Senior Vice-Chancellor (Chairman SHC per Annexure 16.6)',
      'Expert Member from IIT/IIM/NIT (Member)',
      'Architect / Professor of Civil Engineering (Member)'
    ],
    status: 'PENDING_SCHEDULE'
  };

  hearingsDB.set(hearingId, hearing);
  persistHearingToMongo(hearing);
  return hearing;
}

export function scheduleHearing(data: {
  caseId: string;
  hearingType: 'SHC' | 'SAC';
  committeeMembers: string[];
  scheduledDate: string;
  hearingMode: 'VIRTUAL' | 'PHYSICAL';
  venueOrLink: string;
  scheduledBy?: string;
}): HearingRecord {
  const hearingId = `HEAR-${data.hearingType}-${Date.now().toString().slice(-6)}`;
  const hearing: HearingRecord = {
    id: hearingId,
    type: data.hearingType === 'SAC' ? 'SAC_STATUTORY_APPEAL' : 'SHC_COMPLIANCE_HEARING',
    caseId: data.caseId,
    institutionName: data.caseId,
    referredBy: data.scheduledBy || 'Regional_Officer',
    referredAt: new Date().toISOString(),
    governingClause: data.hearingType === 'SAC' ? 'APH Chapter II §2.24' : 'APH Chapter II §2.23.3',
    triggerEvent: `Hearing scheduled via Regional Office / Council portal`,
    issuesConsidered: ['Hearing on observed compliance and institution representations'],
    committeeMembers: data.committeeMembers && data.committeeMembers.length > 0
      ? data.committeeMembers
      : ['Dr. V. K. Paul (Chair)', 'Prof. A. S. Pant', 'Adv. S. K. Hegde (Legal Expert)'],
    hearingDate: data.scheduledDate,
    status: 'SCHEDULED'
  };

  hearingsDB.set(hearingId, hearing);
  persistHearingToMongo(hearing);
  return hearing;
}

export function disposeAppeal(appealId: string, data: {
  decision: 'RELIEF_GRANTED' | 'REJECTION_UPHELD' | 'REFERRED_TO_SHC';
  remarks: string;
  committeeMembers?: string[];
  disposedBy?: string;
}): { success: boolean; appeal?: HearingRecord; error?: string } {
  const appeal = hearingsDB.get(appealId);
  if (!appeal) {
    return { success: false, error: `Appeal ${appealId} not found in docket` };
  }
  appeal.status = 'DECIDED_BY_COUNCIL';
  appeal.observations = data.remarks;
  appeal.recommendation = data.decision === 'RELIEF_GRANTED' ? 'RECOMMEND_APPROVAL'
    : data.decision === 'REFERRED_TO_SHC' ? 'SEEK_FURTHER_COMPLIANCE' : 'UPHOLD_REJECTION';
  if (data.committeeMembers && data.committeeMembers.length > 0) {
    appeal.committeeMembers = data.committeeMembers;
  }
  hearingsDB.set(appealId, appeal);
  persistHearingToMongo(appeal);
  return { success: true, appeal };
}
