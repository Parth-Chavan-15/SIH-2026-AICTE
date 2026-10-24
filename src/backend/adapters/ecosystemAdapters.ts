/**
 * PravahReg Companion Layer — Ecosystem Adapters
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Enforces Zero-Rewrite Companion Architecture connecting to existing AICTE & National systems:
 * 1. AICTE Web-Portal Automated Committee Selection Sync (APH §1.8(a)-(c), §1.9(a)-(g) & 2026-27 Addendum G02)
 * 2. AICTESigner / mSigner Class-3 DSC Verification Gateway (APH §1.4.3, §1.4.6, §2.3.4(a))
 * 3. API Setu / External Statutory Registries Hub (NBA, NAAC, NIRF, MoE IIC, ABC/APAAR, Anti-Ragging)
 * 4. Affiliating University & State DTE 15-Day NOC Concurrence Tracker (APH §1.4.5 & §2.19(c))
 * 5. Downstream Siebel Status Write-Back & 6-Authority Statutory Bulk Dispatch (APH §2.25)
 * 
 * Honesty & Guardrail Tags:
 * - integrationMode: "SIMULATED_COMPANION_ADAPTER"
 * - evidenceState: "SOURCE_STATUS_OBSERVED"
 * - syncStatus: "SYNCHRONIZED" | "RECONCILIATION_REQUIRED"
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
  gpsInspectionWindow?: string;
  walkthroughVideoStreamUrl?: string;
  campusGpsCoordinates?: string;
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

export interface ExternalRegistriesData {
  adapterType: 'SIMULATED_ADAPTER';
  integrationMode: 'SIMULATED_COMPANION_ADAPTER';
  evidenceState: 'SOURCE_STATUS_OBSERVED';
  authoritativeOwner: 'API_SETU_NATIONAL_DATA_EXCHANGE';
  gateway: 'API_SETU_NATIONAL_EXCHANGE';
  syncStatus: 'SYNCHRONIZED' | 'RECONCILIATION_REQUIRED';
  caseId: string;
  observedAt: string;
  nbaRegistry: {
    status: 'VALID_ACCREDITATION' | 'PROVISIONAL' | 'NOT_ACCREDITED';
    program: string;
    validityWindow: string;
    validUntil: string;
    errataFastTrackEligible: boolean;
    statutoryRule: 'APH 2026-27 Errata G02 p. 42 §2.6(c)(1)';
  };
  naacUgcRegistry: {
    grade: string;
    cgpa: number;
    nirfRankBand: string;
    extendedEoaEligible: boolean;
    statutoryRule: 'APH §2.1(a) Extended EoA for Autonomous/Accredited Institutions';
  };
  moeInnovationCouncil: {
    iicId: string;
    annualActivityStarRating: number;
    status: 'ACTIVE_CERTIFIED';
    statutoryRule: 'APH §6.51 Mandatory IIC Formation';
  };
  abcApaarRegistry: {
    institutionAbcId: string;
    studentEnrolmentPercentage: number;
    status: 'COMPLIANT';
    statutoryRule: 'APH §6.53(a) Academic Bank of Credits';
  };
  antiRaggingPortal: {
    affidavitCompliancePercentage: number;
    complianceStatus: '100%_FILED';
    statutoryRule: 'APH §6.47(f) & UGC Anti-Ragging Regulations';
  };
  studentFacultyFeedbackPortal: {
    feedbackIndex: number;
    totalSubmissions: number;
    status: 'VERIFIED';
    statutoryRule: 'AICTE Student/Faculty Feedback Portal Registry';
  };
}

export interface ConcurrenceTracker {
  adapterType: 'SIMULATED_ADAPTER';
  integrationMode: 'SIMULATED_COMPANION_ADAPTER';
  evidenceState: 'SOURCE_STATUS_OBSERVED';
  authoritativeOwner: 'STATE_DTE_AND_AFFILIATING_UNIVERSITY_PORTAL';
  syncStatus: 'SYNCHRONIZED' | 'RECONCILIATION_REQUIRED';
  caseId: string;
  affiliatingUniversity: {
    universityName: string;
    forwardedAt: string;
    status: 'NOC_CONCURRED' | 'PENDING' | 'DEEMED_CONCURRED';
    viewsReceivedAt?: string;
  };
  stateDte: {
    directorateName: string;
    forwardedAt: string;
    status: 'NOC_CONCURRED' | 'PENDING' | 'DEEMED_CONCURRED';
    viewsReceivedAt?: string;
  };
  concurrenceTimeline: {
    forwardedDate: string;
    prescribedDeadlineDays: 15;
    dueDeadline: string;
    daysElapsed: number;
    daysRemaining: number;
    isDeemedConcurrenceActive: boolean;
    statutoryCitation: 'APH §2.19(c) (p. 26): Absence of receipt of views within 15 days enables Council to proceed';
  };
}

export interface SiebelWritebackResult {
  adapterType: 'SIMULATED_ADAPTER';
  integrationMode: 'SIMULATED_COMPANION_ADAPTER';
  evidenceState: 'SOURCE_STATUS_OBSERVED';
  authoritativeOwner: 'AICTE_SIEBEL_CORE_CRM';
  syncStatus: 'SYNCHRONIZED' | 'RECONCILIATION_REQUIRED';
  targetSystem: 'AICTE_SIEBEL_CORE_CRM_PARTNER_PORTAL';
  caseId: string;
  syncTimestamp: string;
  siebelPartnerSyncId: string;
  syncedStatus: string;
  sixAuthorityDistributionList: Array<{
    authorityDesignation: string;
    deliveryChannel: 'DIGITAL_DISPATCH' | 'SPEED_POST_CONFIRMATION';
    deliveryStatus: 'DISPATCHED_AND_LOGGED';
  }>;
}

/**
 * 1. AICTE Web-Portal Automated Committee Selection Sync (APH §1.8, §1.9, §1.11 & GIITS Real 2026-27 Dossier)
 */
export function getCommitteeRoster(
  caseId: string,
  committeeType: 'SCRUTINY' | 'EVC' | 'SAC_SHC' | 'RE_EVC' = 'EVC'
): CommitteeRosterSync {
  const isGIITS = caseId.includes('GIITS');
  const isNew = caseId.includes('NEW') || caseId.includes('LOA');
  const nowIso = new Date().toISOString();

  let committeeId: string;
  let statutoryRule: string;
  let roster: CommitteeExpert[];

  if (committeeType === 'SCRUTINY') {
    committeeId = '2-SOC1770029225';
    if (isNew) {
      statutoryRule = 'APH 2024–27 §1.8(a) & 2025–26 Scrutiny Proforma: 1 Academic Expert + 1 Legal Expert (Bar Council Def. 4) + 1 Architect';
      roster = [
        {
          expertId: 'EXP-ACAD-01',
          name: 'Prof. S. Velmurugan',
          designation: 'Senior Professor (HAG)',
          organization: 'National Institute of Technology (NIT) Calicut',
          specialization: 'Academic Expert (NIT/IIT)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: '2026-10-24T09:30:00.000Z'
        },
        {
          expertId: 'EXP-LEGAL-01',
          name: 'Adv. K. R. Ramanathan',
          designation: 'Senior Standing Counsel (Bar Council Reg. Def. 4)',
          organization: 'High Court of Judicature',
          specialization: 'Legal Expert (Advocate Bar Council per Def. 4)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: '2026-10-24T09:32:00.000Z'
        },
        {
          expertId: 'EXP-ARCH-01',
          name: 'Dr. B. B. Ahuja',
          designation: 'Former Director & Principal Architect (COA Reg. Def. 11)',
          organization: 'College of Engineering Pune (COEP) / Council of Architecture',
          specialization: 'Architect Expert (COA Registered per Def. 11)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: '2026-10-24T09:35:00.000Z'
        }
      ];
    } else {
      // Real GIITS 2026-27 Scrutiny Committee (04-FEB-2026): 2 Academic Experts per APH §1.8(a)
      statutoryRule = 'APH 2024–27 §1.8(a): 2 Academic Experts for Existing Institution Modification Scrutiny';
      roster = [
        {
          expertId: 'EXP-ACAD-MPS',
          name: 'Prof. Maheshwari Prasad Singh',
          designation: 'Professor (Computer Science & Engineering)',
          organization: 'National Institute of Technology (NIT) Patna',
          specialization: 'Academic Expert (NIT/IIT)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: '2026-02-04T09:30:00.000Z'
        },
        {
          expertId: 'EXP-ACAD-RK',
          name: 'Prof. Rakesh Kumar',
          designation: 'Professor & Dean of Engineering',
          organization: 'Central University of Haryana',
          specialization: 'Academic Expert (NIT/IIT)',
          noConflictDeclarationSigned: true,
          declarationTimestamp: '2026-02-04T09:35:00.000Z'
        }
      ];
    }
  } else if (committeeType === 'SAC_SHC') {
    // Real GIITS 2026-27 Standing Appellate Committee (18-APR-2026)
    committeeId = '2-SOC1776333767';
    statutoryRule = 'APH 2024–27 §1.11(b) & §2.24(b): 1 Committee Chairman + 1 Academic Expert + 1 Registered Architect';
    roster = [
      {
        expertId: 'EXP-SAC-CHAIR',
        name: 'Prof. Sadanand Sadashiv Gokhale',
        designation: 'Former Director & SAC Chairman',
        organization: 'Indian Institute of Technology (IIT) Madras / NIT Nagpur',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-04-18T10:00:00.000Z'
      },
      {
        expertId: 'EXP-SAC-ACAD',
        name: 'Prof. G Yoganandan',
        designation: 'Senior Professor of Management & Technology',
        organization: 'Periyar University',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-04-18T10:05:00.000Z'
      },
      {
        expertId: 'EXP-SAC-ARCH',
        name: 'Architect Umit Saini',
        designation: 'Senior Registered Architect (Reg: CA/2012/55490)',
        organization: 'Council of Architecture (COA)',
        specialization: 'Architect Expert (COA Registered per Def. 11)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-04-18T10:10:00.000Z'
      }
    ];
  } else if (committeeType === 'RE_EVC') {
    // Real GIITS 2026-27 Re-EVC Committee (22-APR-2026)
    committeeId = '2-SOC1776678217';
    statutoryRule = 'APH 2024–27 §1.9 & §2.23.2: 2 Academic Experts + 1 Registered Architect (Re-EVC)';
    roster = [
      {
        expertId: 'EXP-REEVC-01',
        name: 'Assoc. Prof. S K Panda',
        designation: 'Associate Professor (Civil Engineering)',
        organization: 'Indian Institute of Technology (IIT BHU) Varanasi',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-04-22T09:30:00.000Z'
      },
      {
        expertId: 'EXP-REEVC-02',
        name: 'Prof. S. Velmurugan',
        designation: 'Senior Professor',
        organization: 'National Institute of Technology (NIT) Calicut',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-04-22T09:35:00.000Z'
      },
      {
        expertId: 'EXP-REEVC-ARCH',
        name: 'Architect Subramanian Brintha',
        designation: 'Registered Architect (COA Reg: CA/2008/42119)',
        organization: 'Faculty of Technology, MSU Baroda',
        specialization: 'Architect Expert (COA Registered per Def. 11)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-04-22T09:40:00.000Z'
      }
    ];
  } else {
    // EVC-1: Real GIITS 2026-27 Inspection Committee (27-MAR-2026)
    committeeId = '2-SOC1774344316';
    statutoryRule = 'AICTE Act 1987 §11(2) & APH 2024–27 §1.9: 2 Academic Experts + 1 Registered Architect (COA Reg. Def. 11)';
    roster = [
      {
        expertId: 'EXP-EVC-CHAIR',
        name: 'Prof. Sivasubramanian Velmurugan',
        designation: 'Senior Professor & Committee Chairman',
        organization: 'National Institute of Technology (NIT) Calicut',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-03-27T09:30:00.000Z'
      },
      {
        expertId: 'EXP-EVC-ACAD2',
        name: 'Assoc. Prof. Hareesh K',
        designation: 'Associate Professor (Mechanical Engineering)',
        organization: 'K.K. Government Engineering College',
        specialization: 'Academic Expert (NIT/IIT)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-03-27T09:35:00.000Z'
      },
      {
        expertId: 'EXP-EVC-ARCH',
        name: 'Architect Md. Danish',
        designation: 'Registered Architect (COA Reg: CA/2014/61201)',
        organization: 'National Institute of Technology (NIT) Patna / COA',
        specialization: 'Architect Expert (COA Registered per Def. 11)',
        noConflictDeclarationSigned: true,
        declarationTimestamp: '2026-03-27T09:40:00.000Z'
      }
    ];
  }

  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'AICTE_CENTRAL_EXPERT_MANAGEMENT_PORTAL',
    syncStatus: 'SYNCHRONIZED',
    caseId,
    committeeId,
    committeeType,
    constitutedBy: 'AICTE_COUNCIL_EXECUTIVE_COMMITTEE',
    statutoryCompositionRule: statutoryRule,
    roster,
    unbiasedDeclarationComplete: true,
    gpsInspectionWindow: '30-Minute Geo-Tagged Video Walkthrough',
    walkthroughVideoStreamUrl: 'https://storage.aicte-india.org/evc/2026/walkthrough-2-SOC1774344316.mp4',
    campusGpsCoordinates: '17° 42\' 7" N, 83° 6\' 47" E (Gonnavanipalem, Parawada Mandal, Visakhapatnam)',
    syncedAt: nowIso
  };
}

/**
 * 2. AICTESigner / mSigner Class-3 DSC Verification Gateway (APH §1.4.3, §1.4.6, §2.3.4(a))
 */
export function verifyDSCSignature(payload: {
  documentId: string;
  dscSigned: boolean;
  tokenType?: string;
  signatoryName?: string;
  signatoryPan?: string;
}): DSCVerificationResult {
  if (payload.dscSigned === false) {
    throw new Error('DSC_SIGNATURE_REQUIRED: APH §1.4.3 & §2.3.4(a): Document submission requires verified Class-3 Digital Signature Certificate (DSC).');
  }

  const nowIso = new Date().toISOString();
  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'CCA_INDIA_DIGITAL_SIGNATURE_GATEWAY',
    gateway: 'AICTESigner / mSigner V3.2',
    syncStatus: 'SYNCHRONIZED',
    documentId: payload.documentId,
    dscSigned: true,
    certificateLevel: 'Class-3 e-Token',
    tokenType: (payload.tokenType as any) || 'ePass2003Auto USB Cryptographic Token',
    certificateAuthority: 'eMudhra Class-3 Corporate Sub CA',
    certSerialNumber: '8252400885863006',
    signatoryName: payload.signatoryName || 'Dr. D. N. Sonawane (Authorized Signatory)',
    signatoryDesignation: 'Principal / Head of Technical Institution',
    signatoryPan: payload.signatoryPan || 'ABCDE1234F',
    verifiedAt: nowIso,
    integrityHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    statutoryCompliance: 'APH §1.4.3 & §2.3.4(a) VALIDATED'
  };
}

/**
 * 3. API Setu / External Statutory Registries Hub (NBA, NAAC, NIRF, MoE IIC, ABC/APAAR, Anti-Ragging)
 */
export function getExternalRegistriesData(caseId: string): ExternalRegistriesData {
  const isCOEP = caseId.includes('COEP');
  const isGIITS = caseId.includes('GIITS');
  const nowIso = new Date().toISOString();

  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'API_SETU_NATIONAL_DATA_EXCHANGE',
    gateway: 'API_SETU_NATIONAL_EXCHANGE',
    syncStatus: 'SYNCHRONIZED',
    caseId,
    observedAt: nowIso,
    nbaRegistry: {
      status: isCOEP ? 'VALID_ACCREDITATION' : isGIITS ? 'PROVISIONAL' : 'NOT_ACCREDITED',
      program: 'Engineering & Technology (UG B.Tech)',
      validityWindow: isCOEP ? '2023-03-29 to 2027-06-30' : '2024-06-01 to 2025-06-30 (Expired)',
      validUntil: isCOEP ? '2027-06-30' : '2025-06-30',
      errataFastTrackEligible: isCOEP,
      statutoryRule: 'APH 2026-27 Errata G02 p. 42 §2.6(c)(1)'
    },
    naacUgcRegistry: {
      grade: isCOEP ? 'A++' : 'A',
      cgpa: isCOEP ? 3.75 : 3.12,
      nirfRankBand: isCOEP ? 'Top 50' : '101-150',
      extendedEoaEligible: isCOEP,
      statutoryRule: 'APH §2.1(a) Extended EoA for Autonomous/Accredited Institutions'
    },
    moeInnovationCouncil: {
      iicId: `IIC-2026-${caseId.slice(-4)}`,
      annualActivityStarRating: isCOEP ? 5 : 4,
      status: 'ACTIVE_CERTIFIED',
      statutoryRule: 'APH §6.51 Mandatory IIC Formation'
    },
    abcApaarRegistry: {
      institutionAbcId: `ABC-APAAR-${caseId.slice(-4)}`,
      studentEnrolmentPercentage: isCOEP ? 99.2 : 95.8,
      status: 'COMPLIANT',
      statutoryRule: 'APH §6.53(a) Academic Bank of Credits'
    },
    antiRaggingPortal: {
      affidavitCompliancePercentage: 100,
      complianceStatus: '100%_FILED',
      statutoryRule: 'APH §6.47(f) & UGC Anti-Ragging Regulations'
    },
    studentFacultyFeedbackPortal: {
      feedbackIndex: 4.65,
      totalSubmissions: 1240,
      status: 'VERIFIED',
      statutoryRule: 'AICTE Student/Faculty Feedback Portal Registry'
    }
  };
}

/**
 * 4. Affiliating University & State DTE 15-Day NOC Concurrence Tracker (APH §1.4.5 & §2.19(c))
 */
export function getConcurrenceTracker(caseId: string): ConcurrenceTracker {
  const isGIITS = caseId.includes('GIITS');
  const nowIso = new Date().toISOString();
  const forwardedDate = '2026-10-14T00:00:00.000Z';
  const dueDeadline = '2026-10-29T00:00:00.000Z';
  const daysElapsed = Math.max(0, Math.floor((Date.now() - Date.parse(forwardedDate)) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, 15 - daysElapsed);

  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'STATE_DTE_AND_AFFILIATING_UNIVERSITY_PORTAL',
    syncStatus: 'SYNCHRONIZED',
    caseId,
    affiliatingUniversity: {
      universityName: isGIITS ? 'Jawaharlal Nehru Technological University Gurajada (JNTU-GV), Vizianagaram' : 'Savitribai Phule Pune University (SPPU), Pune',
      forwardedAt: forwardedDate,
      status: 'NOC_CONCURRED',
      viewsReceivedAt: '2026-10-20T11:00:00.000Z'
    },
    stateDte: {
      directorateName: isGIITS ? 'Department of Technical Education, Government of Andhra Pradesh' : 'Directorate of Technical Education (DTE), Maharashtra',
      forwardedAt: forwardedDate,
      status: daysRemaining === 0 ? 'DEEMED_CONCURRED' : 'PENDING'
    },
    concurrenceTimeline: {
      forwardedDate,
      prescribedDeadlineDays: 15,
      dueDeadline,
      daysElapsed,
      daysRemaining,
      isDeemedConcurrenceActive: daysRemaining === 0,
      statutoryCitation: 'APH §2.19(c) (p. 26): Absence of receipt of views within 15 days enables Council to proceed'
    }
  };
}

/**
 * 5. Downstream Siebel Status Write-Back & 6-Authority Bulk Dispatch (APH §2.25)
 */
export function executeSiebelWriteback(caseId: string, currentStage: string = 'Approval Issued'): SiebelWritebackResult {
  const nowIso = new Date().toISOString();
  return {
    adapterType: 'SIMULATED_ADAPTER',
    integrationMode: 'SIMULATED_COMPANION_ADAPTER',
    evidenceState: 'SOURCE_STATUS_OBSERVED',
    authoritativeOwner: 'AICTE_SIEBEL_CORE_CRM',
    syncStatus: 'SYNCHRONIZED',
    targetSystem: 'AICTE_SIEBEL_CORE_CRM_PARTNER_PORTAL',
    caseId,
    syncTimestamp: nowIso,
    siebelPartnerSyncId: `SIEBEL-SYNC-${caseId}-${Date.now().toString(36).toUpperCase()}`,
    syncedStatus: currentStage,
    sixAuthorityDistributionList: [
      {
        authorityDesignation: 'The Director of Technical Education (Concerned State Government)',
        deliveryChannel: 'DIGITAL_DISPATCH',
        deliveryStatus: 'DISPATCHED_AND_LOGGED'
      },
      {
        authorityDesignation: 'The Registrar, Affiliating University / State Board of Technical Education',
        deliveryChannel: 'DIGITAL_DISPATCH',
        deliveryStatus: 'DISPATCHED_AND_LOGGED'
      },
      {
        authorityDesignation: 'The Principal / Director of the Institution',
        deliveryChannel: 'DIGITAL_DISPATCH',
        deliveryStatus: 'DISPATCHED_AND_LOGGED'
      },
      {
        authorityDesignation: 'The Chairman / Secretary of the Sponsoring Trust / Society / Company',
        deliveryChannel: 'DIGITAL_DISPATCH',
        deliveryStatus: 'DISPATCHED_AND_LOGGED'
      },
      {
        authorityDesignation: 'The Regional Officer, AICTE Regional Office',
        deliveryChannel: 'DIGITAL_DISPATCH',
        deliveryStatus: 'DISPATCHED_AND_LOGGED'
      },
      {
        authorityDesignation: 'Guard File (AICTE Headquarters, Vasant Kunj, New Delhi)',
        deliveryChannel: 'DIGITAL_DISPATCH',
        deliveryStatus: 'DISPATCHED_AND_LOGGED'
      }
    ]
  };
}
