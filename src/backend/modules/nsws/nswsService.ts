/**
 * NIYAMSETU — National Single Window System (NSWS) Simulation Service
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Sourced from:
 * - AICTE Approval Process & NSWS Portal Registration Guide (2024–27)
 * - Member 2 Research on NSWS Onboarding, emBridge and crypto-tokens
 * 
 * GUARDRAIL:
 * SIMULATION ONLY. Never claim live NSWS or AICTE API transactions.
 * Fictional test accounts only. Never collect real PANs or token secrets.
 */

import { evaluateDynamicRoute, DynamicRouteResult } from '../../policy/dynamicRouteEngine';
import type { Application } from '../../../shared/contracts';

export interface NSWSSimulatedProfile {
  investorId: string;
  entityName: string;
  entityType: 'Trust' | 'Society' | 'Section 8 Company' | 'Government / Autonomous';
  contactPerson: string;
  email: string;
  mobile: string;
  pan: string;
  panVerified: boolean;
  dscVerified: boolean;
  dscDetails?: {
    certSerialNumber: string;
    signatoryName: string;
    tokenType: 'ePass2003Auto USB Cryptographic Token' | 'mSigner Soft Token PKI';
    verifiedAt: string;
  };
  onboardedAt: string;
}

export interface NSWSSubmissionPayload {
  investorId: string;
  institutionName: string;
  institutionCode?: string;
  region: 'Western' | 'South-Central' | 'Northern' | 'Eastern' | 'Southern' | 'Central' | 'North-West' | 'South-Western';
  state: string;
  city: string;
  address: string;
  category: 'new_institution' | 'increase_intake' | 'extension_of_approval' | 'restoration_or_shifting';
  session: string;
  program: 'engineering' | 'management' | 'pharmacy' | 'applied_arts';
  course: string;
  currentIntake: number;
  proposedIntake: number;
  nbaAccredited?: boolean;
  nbaValidTill?: string;
  siteVerificationRequired?: boolean;
  landAreaAcre: number;
  builtUpAreaSqm: number;
  terChargesPaidInr: number;
}

// In-memory store of simulated NSWS profiles
export const simulatedProfiles: Map<string, NSWSSimulatedProfile> = new Map([
  [
    'NSWS-INV-DEMO-01',
    {
      investorId: 'NSWS-INV-DEMO-01',
      entityName: 'Pratibha Educational & Welfare Trust',
      entityType: 'Trust',
      contactPerson: 'Dr. R. K. Verma',
      email: 'trustee.verma@demo-institution.org',
      mobile: '+91 98765 43210',
      pan: 'AAATP1234F',
      panVerified: true,
      dscVerified: true,
      dscDetails: {
        certSerialNumber: 'CCA-DEMO-2026-9988',
        signatoryName: 'Dr. R. K. Verma (Authorized Trustee)',
        tokenType: 'ePass2003Auto USB Cryptographic Token',
        verifiedAt: '2026-10-25T10:00:00.000Z'
      },
      onboardedAt: '2026-10-25T10:00:00.000Z'
    }
  ]
]);

export function onboardInvestor(data: {
  entityName: string;
  entityType: NSWSSimulatedProfile['entityType'];
  contactPerson: string;
  email: string;
  mobile: string;
}): NSWSSimulatedProfile {
  const investorId = `NSWS-INV-${Date.now().toString().slice(-6)}`;
  const profile: NSWSSimulatedProfile = {
    investorId,
    entityName: data.entityName,
    entityType: data.entityType,
    contactPerson: data.contactPerson,
    email: data.email,
    mobile: data.mobile,
    pan: '',
    panVerified: false,
    dscVerified: false,
    onboardedAt: new Date().toISOString()
  };
  simulatedProfiles.set(investorId, profile);
  return profile;
}

export function verifyPan(investorId: string, panNumber: string): { success: boolean; pan: string; message: string } {
  const profile = simulatedProfiles.get(investorId);
  if (!profile) throw new Error('NSWS Investor profile not found.');

  // Validate format (5 letters, 4 digits, 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panNumber.toUpperCase())) {
    throw new Error('Invalid PAN format. Sample valid demo format: AAATP1234F');
  }

  profile.pan = panNumber.toUpperCase();
  profile.panVerified = true;
  simulatedProfiles.set(investorId, profile);

  return {
    success: true,
    pan: profile.pan,
    message: 'SIMULATED: PAN record verified via simulated Income Tax Department database.'
  };
}

export function verifyDSC(investorId: string): { success: boolean; dscDetails: any; message: string } {
  const profile = simulatedProfiles.get(investorId);
  if (!profile) throw new Error('NSWS Investor profile not found.');
  if (!profile.panVerified) throw new Error('PAN must be verified before DSC authentication.');

  profile.dscVerified = true;
  profile.dscDetails = {
    certSerialNumber: `CCA-DEMO-${Date.now().toString().slice(-4)}`,
    signatoryName: `${profile.contactPerson} (${profile.entityName})`,
    tokenType: 'ePass2003Auto USB Cryptographic Token',
    verifiedAt: new Date().toISOString()
  };
  simulatedProfiles.set(investorId, profile);

  return {
    success: true,
    dscDetails: profile.dscDetails,
    message: 'SIMULATED: emBridge USB crypto-token signature validated successfully.'
  };
}

export function buildApplicationFromNSWS(payload: NSWSSubmissionPayload): {
  application: Application;
  routeExplanation: DynamicRouteResult;
} {
  const investorId = payload.investorId || (payload as any).nswsReference;
  let profile = investorId ? simulatedProfiles.get(investorId) : undefined;
  if (!profile && investorId) {
    profile = {
      investorId,
      entityName: payload.institutionName || 'Applicant Institution',
      entityType: 'Trust',
      contactPerson: (payload as any).signatoryName || 'Authorized Signatory',
      email: 'applicant@aicte.gov.in',
      mobile: '+91 98765 43210',
      pan: (payload as any).pan || 'AAACB1234F',
      panVerified: true,
      dscVerified: true,
      onboardedAt: new Date().toISOString()
    };
    simulatedProfiles.set(investorId, profile);
  }
  if (!profile) throw new Error('NSWS Investor profile not found.');

  if ((payload as any).pan) profile.panVerified = true;
  if ((payload as any).dscTokenSerial || (payload as any).dscSigned) profile.dscVerified = true;

  if (!profile.panVerified || !profile.dscVerified) {
    throw new Error('PRECONDITION_FAILED: Both PAN and DSC authentication must be successfully simulated before application submission.');
  }

  const nowIso = new Date().toISOString();
  const appId = `APP-2026-NSWS-${Date.now().toString().slice(-5)}`;
  const reference = `1-NSWS${Date.now().toString().slice(-8)}`;

  const nestedFacts = (payload as any).facts || {};
  // Evaluate route dynamically using source-grounded route engine
  const factsForRoute = {
    category: payload.category || nestedFacts.category,
    session: payload.session || nestedFacts.session || '2026-27',
    program: payload.program || nestedFacts.program,
    level: (payload as any).level || nestedFacts.level,
    currentIntake: payload.currentIntake || nestedFacts.currentIntake,
    proposedIntake: payload.proposedIntake || nestedFacts.proposedIntake,
    nbaAccredited: (payload.nbaAccredited ?? nestedFacts.nbaAccredited) ?? false,
    nbaScore: (payload as any).nbaScore ?? nestedFacts.nbaScore,
    nbaValidTill: payload.nbaValidTill || nestedFacts.nbaValidTill,
    siteVerificationRequired: payload.siteVerificationRequired ?? nestedFacts.siteVerificationRequired ?? false
  };

  const routeResult = evaluateDynamicRoute(factsForRoute);

  const application: Application = {
    id: appId,
    reference,
    institutionId: (payload as any).institutionId || `INST-${appId.slice(-5)}`,
    regionId: (payload.region || (payload as any).regionId || 'Western') as any,
    category: (payload.category || 'increase_intake') as any,
    session: payload.session || '2026-27',
    facts: {
      ...nestedFacts,
      institutionName: payload.institutionName,
      entityName: profile.entityName,
      entityType: profile.entityType,
      contactPerson: profile.contactPerson,
      email: profile.email,
      mobile: profile.mobile,
      pan: profile.pan,
      dscSignatory: profile.dscDetails?.signatoryName || (payload as any).signatoryName,
      city: payload.city,
      state: payload.state,
      address: payload.address,
      program: payload.program || nestedFacts.program,
      course: payload.course || nestedFacts.course,
      currentIntake: payload.currentIntake || nestedFacts.currentIntake,
      proposedIntake: payload.proposedIntake || nestedFacts.proposedIntake,
      nbaAccredited: (payload.nbaAccredited ?? nestedFacts.nbaAccredited) || false,
      nbaValidTill: payload.nbaValidTill,
      siteVerificationRequired: payload.siteVerificationRequired || false,
      landAreaAcre: payload.landAreaAcre,
      builtUpAreaSqm: payload.builtUpAreaSqm,
      terChargesPaidInr: payload.terChargesPaidInr,
      intakeChannel: 'NSWS_SIMULATION',
      isDemo: true,
      nswsInvestorId: investorId,
      submittedAt: nowIso
    },
    policyRevisionId: routeResult.policyRevisionId,
    state: 'submitted',
    version: 1,
    route: {
      policyRevisionId: routeResult.policyRevisionId,
      session: routeResult.session,
      category: routeResult.category,
      evaluatedFacts: routeResult.evaluatedFacts,
      result: routeResult.result,
      stages: routeResult.stages,
      reasons: routeResult.reasons,
      sources: routeResult.sources,
      reviewReasons: routeResult.unresolvedFlags
    },
    stageEnteredAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  return { application, routeExplanation: routeResult };
}
