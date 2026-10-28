/**
 * NIYAMSETU — Ecosystem Adapters
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Sourced from:
 * 1. AICTE Web-Portal Committee Roster Sync (APH §1.8, §1.9)
 * 2. AICTESigner / mSigner Class-3 DSC Verification Gateway (APH §1.4.3, §1.4.6, §2.3.4(a))
 * 
 * GUARDRAIL:
 * Per Problem Statement & Brief Mandate:
 * API Setu, State DTE, and Siebel CRM adapters/endpoints have been REMOVED entirely.
 * All remaining adapters are clearly marked as SIMULATED_COMPANION_ADAPTER.
 */

export interface CommitteeExpert {
  expertId: string;
  name: string;
  designation: string;
  organization: string;
  specialization: 'Academic Expert (NIT/IIT)' | 'Architect Expert (COA Registered per Def. 11)' | 'Legal Expert (Advocate Bar Council per Def. 4)' | 'Industry Expert';
  noConflictDeclarationSigned: boolean;
  declarationTimestamp: string;
}

export interface CommitteeRosterSync {
  adapterType: 'SIMULATED_ADAPTER';
  integrationMode: 'SIMULATED_COMPANION_ADAPTER';
  evidenceState: 'SOURCE_STATUS_OBSERVED';
  authoritativeOwner: 'AICTE_CENTRAL_EXPERT_MANAGEMENT_PORTAL';
  syncStatus: 'SYNCHRONIZED' | 'RECONCILIATION_REQUIRED';
  caseId: string;
  committeeId: string;
  committeeType: 'SCRUTINY' | 'EVC' | 'SAC_SHC' | 'RE_EVC';
  constitutedBy: 'AICTE_COUNCIL_EXECUTIVE_COMMITTEE';
  statutoryCompositionRule: string;
  roster: CommitteeExpert[];
  unbiasedDeclarationComplete: boolean;
  syncedAt: string;
}

export interface DSCVerificationResult {
  adapterType: 'SIMULATED_ADAPTER';
  integrationMode: 'SIMULATED_COMPANION_ADAPTER';
  evidenceState: 'SOURCE_STATUS_OBSERVED';
  authoritativeOwner: 'CCA_INDIA_DIGITAL_SIGNATURE_GATEWAY';
  gateway: 'AICTESigner / mSigner V3.2';
  syncStatus: 'SYNCHRONIZED' | 'RECONCILIATION_REQUIRED';
  documentId: string;
  verified?: boolean;
  dscSigned: boolean;
  certificateLevel?: 'Class-3 e-Token';
  tokenType: 'ePass2003Auto USB Cryptographic Token' | 'mSigner Soft Token PKI';
  certificateAuthority: 'eMudhra Class-3 Corporate Sub CA' | 'NIC CA 2022' | 'Capricorn Sub CA';
  certSerialNumber: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatoryPan: string;
  verifiedAt: string;
  integrityHashSha256: string;
  statutoryCompliance: 'APH §1.4.3 & §2.3.4(a) VALIDATED';
}

/**
 * AICTE Central Expert Management Portal Roster Synchronizer
 */
export function getCommitteeRoster(caseId: string, committeeType: string): CommitteeRosterSync {
  const isEVC = committeeType.toUpperCase() === 'EVC' || committeeType.toUpperCase() === 'RE_EVC';
  const now = new Date().toISOString();

  if (isEVC) {
    return {
      adapterType: 'SIMULATED_ADAPTER',
      integrationMode: 'SIMULATED_COMPANION_ADAPTER',
      evidenceState: 'SOURCE_STATUS_OBSERVED',
      authoritativeOwner: 'AICTE_CENTRAL_EXPERT_MANAGEMENT_PORTAL',
      syncStatus: 'SYNCHRONIZED',
      caseId,
      committeeId: `EVC-COMM-${caseId.slice(-4)}-2026`,
      committeeType: 'EVC',
      constitutedBy: 'AICTE_COUNCIL_EXECUTIVE_COMMITTEE',
      statutoryCompositionRule: 'APH 2024-27 Annexure 16.5 & APH §1.9: Minimum 3 Experts (Academician Convener + Subject Expert + Architect/CPWD)',
      roster: [
        {
          expertId: 'EXP-NIT-991',
          name: 'Dr. Anand Kulkarni',
          designation: 'Professor (Mechanical Engineering)',
          organization: 'NIT Warangal / IIT Empanelled',
          specialization: 'Academic Expert (NIT/IIT)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: now
        },
        {
          expertId: 'EXP-CSE-442',
          name: 'Prof. V. Rao',
          designation: 'Professor (Computer Science & AI)',
          organization: 'IIIT Hyderabad Empanelled',
          specialization: 'Academic Expert (NIT/IIT)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: now
        },
        {
          expertId: 'EXP-COA-108',
          name: 'Ar. N. Reddy',
          designation: 'Registered Architect (CA/2004/34821)',
          organization: 'Council of Architecture Registry',
          specialization: 'Architect Expert (COA Registered per Def. 11)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: now
        }
      ],
      unbiasedDeclarationComplete: true,
      syncedAt: now
    };
  }

  // Scrutiny Roster
  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'AICTE_CENTRAL_EXPERT_MANAGEMENT_PORTAL',
    syncStatus: 'SYNCHRONIZED',
    caseId,
    committeeId: `SCR-COMM-${caseId.slice(-4)}-2026`,
    committeeType: 'SCRUTINY',
    constitutedBy: 'AICTE_COUNCIL_EXECUTIVE_COMMITTEE',
    statutoryCompositionRule: 'APH 2024-27 Annexure 16.3/16.4 & §1.8: Two Professors/Associate Professors from IIT/IIM/NIT/Govt. Institutions',
    roster: [
      {
        expertId: 'EXP-SCR-01',
        name: 'Prof. Suresh Deshmukh',
        designation: 'Professor & Dean',
        organization: 'College of Engineering Pune (COEP Technological University)',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: now
      },
      {
        expertId: 'EXP-SCR-02',
        name: 'Prof. M. Joshi',
        designation: 'Associate Professor (Civil & Structural)',
        organization: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: now
      }
    ],
    unbiasedDeclarationComplete: true,
    syncedAt: now
  };
}

/**
 * AICTESigner / mSigner Class-3 DSC Verification Gateway
 */
export function verifyDSCSignature(params: {
  documentId: string;
  dscSigned?: boolean;
  tokenType?: string;
  signatoryName?: string;
  signatoryPan?: string;
}): DSCVerificationResult {
  if (params.dscSigned === false) {
    throw new Error('DSC_SIGNATURE_REQUIRED: Under APH §1.4.3 & §2.3.4(a), documents uploaded without Class-3 Digital Signature are strictly invalid.');
  }

  const now = new Date().toISOString();
  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'CCA_INDIA_DIGITAL_SIGNATURE_GATEWAY',
    gateway: 'AICTESigner / mSigner V3.2',
    syncStatus: 'SYNCHRONIZED',
    documentId: params.documentId,
    verified: true,
    dscSigned: true,
    certificateLevel: 'Class-3 e-Token',
    tokenType: 'ePass2003Auto USB Cryptographic Token',
    certificateAuthority: 'eMudhra Class-3 Corporate Sub CA',
    certSerialNumber: '6A8F-4421-E09B-11D4-99C2',
    signatoryName: params.signatoryName || 'Dr. R. V. Ramana (Authorized Institution Signatory)',
    signatoryDesignation: 'Principal & Authorized Signatory',
    signatoryPan: params.signatoryPan || 'AAACG1234F',
    verifiedAt: now,
    integrityHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    statutoryCompliance: 'APH §1.4.3 & §2.3.4(a) VALIDATED'
  };
}
