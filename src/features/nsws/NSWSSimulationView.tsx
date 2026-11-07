import { RouteDemonstrationExplorer } from '../policy/RouteDemonstrationExplorer';
import { evaluateDynamicRoute } from '../../backend/policy/dynamicRouteEngine';
import React, { useState, useMemo, useEffect } from 'react';

import { api } from '../../services/api';

import { useSafeApp } from '../../context/AppContext';

import {

  Globe,

  KeyRound,

  ShieldCheck,

  Building,

  CheckCircle2,

  AlertCircle,

  ArrowRight,

  Send,

  HelpCircle,

  ExternalLink,

  Cpu,

  BookmarkCheck,

  FileCheck,

  Sparkles,

  Info,

  ChevronRight,

  RotateCcw,
  ArrowLeft,
  Building2,
  RefreshCw,
  GraduationCap,
  AlertTriangle,
  XCircle,
  X
} from 'lucide-react';



export interface NSWSSimulationViewProps {
  onSelectApplication?: (id: string) => void;
  isUnauthenticatedFlow?: boolean;
  onBackToGateway?: () => void;
  onOpenInstitutionModal?: () => void;
  onContinueToInstitutionPortal?: (presetId: string, email: string, institutionId?: string) => Promise<void>;
}



interface CollegePreset {

  id: string;

  name: string;

  shortName: string;

  badge: string;

  badgeColor: string;

  pan: string;

  signatory: string;

  mobile: string;

  email: string;

  category: string;

  program: string;

  level: string;

  existingIntake: number;

  proposedIntake: number;

  nbaAccredited: boolean;

  nbaScore: number;

  builtUpAreaSqM: number;

  region: string;

  expectedRoute: string;

  regulatoryCite: string;

}



const CANONICAL_PRESETS: CollegePreset[] = [

  {

    id: 'coep',

    name: 'College of Engineering Pune (COEP Tech Univ)',

    shortName: 'COEP Pune',

    badge: 'NBA Tier-1 Fast-Track',

    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',

    pan: 'AAACB1234F',

    signatory: 'Dr. Anand Deshpande',

    mobile: '9876543210',

    email: 'principal@coep.ac.in',

    category: 'increase_intake',

    program: 'Engineering and Technology',

    level: 'Under Graduate',

    existingIntake: 120,

    proposedIntake: 180,

    nbaAccredited: true,

    nbaScore: 680,

    builtUpAreaSqM: 14500,

    region: 'Western',

    expectedRoute: 'Fast-Track / Scrutiny Only',

    regulatoryCite: 'Addendum 2026–27 Item 16 / Clause 2.6(c)(i) & Errata p. 42: Physical EVC waived for NBA accredited programmes (Fast-Track Scrutiny Only)'

  },

  {

    id: 'giits',

    name: 'Godavari Institute of Infrastructure & Tech Sciences',

    shortName: 'GIITS Tech',

    badge: 'Non-Accredited Surge (Dual Track)',

    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',

    pan: 'AABTG5432K',

    signatory: 'Dr. Suresh Rao',

    mobile: '9822012345',

    email: 'director@giits.edu.in',

    category: 'increase_intake',

    program: 'Engineering and Technology',

    level: 'Under Graduate',

    existingIntake: 120,

    proposedIntake: 240,

    nbaAccredited: false,

    nbaScore: 0,

    builtUpAreaSqM: 8800,

    region: 'Western',

    expectedRoute: 'Dual-Track (Scrutiny + Physical EVC)',

    regulatoryCite: 'APH 2024–27 Table 2.3 Row 9 & Addendum Clause 2.6(c)(i): Intake increase without NBA accreditation mandates Desk Scrutiny and physical EVC inspection'

  },

  {

    id: 'pdimtr',

    name: 'Prerna Deshmukh Inst of Mgmt & Tech Research',

    shortName: 'PDIMTR Management',

    badge: 'EoA Annual Self-Disclosure',

    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',

    pan: 'AAATP9988D',

    signatory: 'Dr. Meena Patil',

    mobile: '9823098765',

    email: 'director@pdimtr.ac.in',

    category: 'extension_of_approval',

    program: 'Management',

    level: 'Post Graduate',

    existingIntake: 180,

    proposedIntake: 180,

    nbaAccredited: false,

    nbaScore: 0,

    builtUpAreaSqM: 5200,

    region: 'Western',

    expectedRoute: 'Fast-Track EoA Automated Endorsement',

    regulatoryCite: 'APH 2024–27 Clause 2.5 & Table 2.3 Row 1: Zero-deficiency Self-Disclosure EoA waives pre-approval Scrutiny and EVC'

  },

  {

    id: 'apex',

    name: 'Apex Polytechnic & Technical Institute',

    shortName: 'APEX Institute',

    badge: 'New Institution Chapter I',

    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',

    pan: 'AAATA4321M',

    signatory: 'Dr. Vikram Malhotra',

    mobile: '9811054321',

    email: 'trustee@apextech.edu.in',

    category: 'new_institution',

    program: 'Engineering and Technology',

    level: 'Diploma',

    existingIntake: 0,

    proposedIntake: 300,

    nbaAccredited: false,

    nbaScore: 0,

    builtUpAreaSqM: 16200,

    region: 'North-Western',

    expectedRoute: 'Chapter I Scrutiny + Site EVC + Land Concurrence',

    regulatoryCite: 'APH 2024–27 Chapter I Clauses 1.8–1.9 & Public Notice 26.11.2025: New institution establishment mandates sequential Desk Scrutiny and physical EVC'

  },

  {

    id: 'batu',

    name: 'Dr. BATU Regional Technical Centre',

    shortName: 'BATU Affiliate',

    badge: 'Course Rationalization / Closure',

    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',

    pan: 'AAATB7766N',

    signatory: 'Dr. Rajesh Kulkarni',

    mobile: '9821033445',

    email: 'registrar@dbatu.ac.in',

    category: 'closure',

    program: 'Engineering and Technology',

    level: 'Under Graduate',

    existingIntake: 240,

    proposedIntake: 180,

    nbaAccredited: true,

    nbaScore: 710,

    builtUpAreaSqM: 11000,

    region: 'Western',

    expectedRoute: 'Desk Scrutiny Only (Closure Norms)',

    regulatoryCite: 'APH 2024–27 Clause 2.18 & Table 2.3 Row 16: Progressive course closure processed through Desk Scrutiny only'

  },

  {

    id: 'batu-shifting',

    name: 'Dr. BATU Rural Extension Centre (Shifting/Relocation)',

    shortName: 'BATU Relocation',

    badge: 'Site Shifting / Only EVC',

    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',

    pan: 'AAATB7766N',

    signatory: 'Dr. Rajesh Kulkarni',

    mobile: '9821033445',

    email: 'principal@batu.ac.in',

    category: 'restoration_or_shifting',

    program: 'Engineering and Technology',

    level: 'Under Graduate',

    existingIntake: 180,

    proposedIntake: 180,

    nbaAccredited: false,

    nbaScore: 0,

    builtUpAreaSqM: 12000,

    region: 'Western',

    expectedRoute: 'Physical EVC Mandated (Only EVC)',

    regulatoryCite: 'APH 2024–27 Table 2.3 Row 3: Change of Site / Location mandates physical EVC inspection'

  },

  {

    id: 'boundary-x360',

    name: 'Vidya Vardhini Institute of Technology (Boundary X=360)',

    shortName: 'VVIT Boundary X=360',

    badge: 'Boundary Check / Policy Review',

    badgeColor: 'bg-red-100 text-red-800 border-red-300',

    pan: 'AAATV5544P',

    signatory: 'Dr. Ramesh Kadam',

    mobile: '9822334455',

    email: 'principal@coep.ac.in',

    category: 'increase_intake',

    program: 'Engineering and Technology',

    level: 'Under Graduate',

    existingIntake: 360,

    proposedIntake: 420,

    nbaAccredited: false,

    nbaScore: 0,

    builtUpAreaSqM: 16000,

    region: 'Western',

    expectedRoute: 'Policy Review Required (Table 2.3 Row 9 Boundary Condition)',

    regulatoryCite: 'APH 2024–27 Table 2.3 Row 9 & Boundary Guard: Division boundary X = 360 requires explicit Executive Committee / Policy Review'

  }

];

export const CUSTOM_PRESET_DEF: CollegePreset = {
  id: 'custom',
  name: '',
  shortName: '➕ Custom College',
  badge: 'Manual Dynamic Intake',
  badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-400 font-bold',
  pan: 'AAATA9876C',
  signatory: 'Dr. K. S. Raman',
  mobile: '9876501234',
  email: 'director@aitr.edu.in',
  category: 'increase_intake',
  program: 'Engineering and Technology',
  level: 'Under Graduate',
  existingIntake: 120,
  proposedIntake: 180,
  nbaAccredited: true,
  nbaScore: 680,
  builtUpAreaSqM: 14500,
  region: 'Western',
  expectedRoute: 'Evaluated Live per Clause / Rules',
  regulatoryCite: 'Real-time deterministic route evaluation derived strictly from APH 2024–27 & Errata Page 42'
};

export const ALL_SIMULATION_OPTIONS: CollegePreset[] = [
  ...CANONICAL_PRESETS,
  CUSTOM_PRESET_DEF
];

export const CATEGORY_LABELS: Record<string, string> = {
  increase_intake: 'Increase in Intake / Additional Course(s)',
  new_institution: 'Setting up New Technical Institution',
  extension_of_approval: 'Extension of Approval (EoA Self-Disclosure)',
  nri_seats: 'Introduction / Continuation of NRI Seats',
  conversion_diploma_degree: 'Conversion of Diploma to Degree Level',
  name_change_institution: 'Change in Name of Institution / Board',
  new_programme_level: 'Start New Programme / Level',
  merger_institutions: 'Merger of Institutions in Same Campus',
  break_restoration_hibernation: 'Break in EoA / Restoration / Hibernation',
  supernumerary_fn_oci: 'Supernumerary Seats for FN / OCI / Gulf',
  integrated_dual_degree: 'Introduction of Integrated / Dual Degree Course',
  fellow_programme_fpm: 'Fellow Programme in Management (FPM)',
  course_name_change: 'Change Name of Course / Reduction in Intake',
  collaboration_twinning: 'Collaboration & Twinning Programme',
  change_of_site: 'Change of Site / Location',
  closure: 'Closure of Technical Institution',
  conversion_coeducation: "Conversion of Women's Institution to Co-ed",
  closure_course: 'Closure of Programme(s) / Course(s)',
  bank_change: 'Change in Bank Details',
  trust_change: 'Change in Name of Trust / Society',
  conversion_deemed_university: 'Conversion to Deemed-to-be-University',
  odl_courses: 'Open and Distance Learning (ODL) / Online Learning',
  bba_bca_bms: 'BBA / BCA / BMS Programmes (As-Is-Where-Is Intake)'
};

export function formatStageDisplayName(stage: string): string {
  const s = (stage || '').toLowerCase().trim();
  switch (s) {
    case 'submitted':
      return 'Application Ingested / Submitted';
    case 'scrutiny_pending':
      return 'Desk Scrutiny Review';
    case 'deficiency_communicated':
      return 'Deficiency Communicated (LoD)';
    case 'rescrutiny_pending':
      return 'Protected Re-Scrutiny';
    case 'evc_pending':
      return 'Physical Inspection (EVC)';
    case 'decision_pending':
      return 'Council Determination';
    case 'approved':
      return 'Approval Granted (LoA / EoA)';
    case 'rejected':
      return 'Application Rejected';
    case 'policy_review_required':
      return 'Executive Policy Review';
    case 'ineligible_rejected':
      return 'Statutorily Ineligible (Rejected)';
    default:
      return stage ? stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown Stage';
  }
}

export function formatRouteTypeName(routeType: string): string {
  const r = (routeType || '').toUpperCase().trim();
  switch (r) {
    case 'SCRUTINY_ONLY':
      return 'Desk Scrutiny Only';
    case 'SCRUTINY_AND_EVC':
      return 'Desk Scrutiny & Physical Inspection (EVC)';
    case 'DIRECT_EVC':
      return 'Direct Physical Inspection (EVC)';
    case 'POLICY_REVIEW_REQUIRED':
      return 'Executive Policy Review Required';
    case 'BLOCKED (INELIGIBLE)':
      return 'Statutorily Blocked (Ineligible)';
    default:
      return routeType ? routeType.replace(/_/g, ' ') : 'Standard Regulatory Route';
  }
}



export const NSWSSimulationView: React.FC<NSWSSimulationViewProps> = ({
  onSelectApplication,
  isUnauthenticatedFlow,
  onBackToGateway,
  onOpenInstitutionModal,
  onContinueToInstitutionPortal,
}) => {
  const appCtx = useSafeApp();
  const refreshData = appCtx?.refreshData || (async () => {});
  const [showInstPicker, setShowInstPicker] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');

  const [currentStep, setCurrentStep] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);



  // Form states initialized with Custom Technical Institution preset

  const [pan, setPan] = useState('AAATA9876C');

  const [signatoryName, setSignatoryName] = useState('Dr. K. S. Raman');

  const [mobile, setMobile] = useState('9876501234');

  const [email, setEmail] = useState('director@aitr.edu.in');

  const [otp, setOtp] = useState('123456');

  const [onboardResult, setOnboardResult] = useState<any>(null);



  // DSC state

  const [tokenType, setTokenType] = useState<string>('ePass2003Auto');

  const [dscVerified, setDscVerified] = useState<boolean>(false);



  // AICTE Form State
  const [institutionName, setInstitutionName] = useState('');
  const [category, setCategory] = useState<string>('increase_intake');
  const [program, setProgram] = useState('Engineering and Technology');
  const [level, setLevel] = useState('Under Graduate');
  const [existingIntake, setExistingIntake] = useState<number | string>(120);
  const [proposedIntake, setProposedIntake] = useState<number | string>(180);
  const [nbaAccredited, setNbaAccredited] = useState(true);
  const [nbaScore, setNbaScore] = useState<number | string>(680);
  const [region, setRegion] = useState('Western');
  const [builtUpAreaSqM, setBuiltUpAreaSqM] = useState<number | string>(14500);
  const [isCustomizingForm, setIsCustomizingForm] = useState(true);

  // Custom Intake & Route-Affecting Regulatory Parameters
  const [nbaValidTill, setNbaValidTill] = useState<string>('2027-06-30');
  const [accreditedCoursesCount, setAccreditedCoursesCount] = useState<number | string>(1);
  const [siteVerificationRequired, setSiteVerificationRequired] = useState<boolean>(false);
  const [isRegionalLanguageCourse, setIsRegionalLanguageCourse] = useState<boolean>(false);
  const [landAreaAcre, setLandAreaAcre] = useState<number | string>(5.0);
  const [terChargesPaidInr, setTerChargesPaidInr] = useState<number | string>(200000);
  const [stateName, setStateName] = useState<string>('Maharashtra');
  const [cityName, setCityName] = useState<string>('Pune');
  const [address, setAddress] = useState<string>('Sector 4, Institutional Area');
  const [societyName, setSocietyName] = useState<string>('Vanguard Educational Foundation');
  const [entityType, setEntityType] = useState<string>('Trust');
  const [coreBranchesCount, setCoreBranchesCount] = useState<number | string>(3);
  const [nonCsCoreBranchesCount, setNonCsCoreBranchesCount] = useState<number | string>(2);
  const [passOutBatchesCount, setPassOutBatchesCount] = useState<number | string>(1);
  const [isPartialProgrammeApplication, setIsPartialProgrammeApplication] = useState<boolean>(false);
  const [institutionNameError, setInstitutionNameError] = useState<string | null>(null);
  const REQUIRED_INSTITUTION_NAME_MSG = 'Institution name is required. Please enter the legal name to continue.';

  const handleInstitutionNameChange = (val: string) => {
    setInstitutionName(val);
    if (val.trim().length > 0) {
      setInstitutionNameError(null);
      if (errorMsg === REQUIRED_INSTITUTION_NAME_MSG) {
        setErrorMsg(null);
      }
    } else if (institutionNameError) {
      setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
    }
  };

  // Helper for numeric inputs to eliminate sticky leading 0s and allow free backspacing
  const handleNumericChange = (
    setter: (val: number | string) => void,
    isInteger: boolean = true,
    max?: number
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setter('');
      return;
    }
    if (raw === '-') {
      setter('');
      return;
    }
    let cleaned = raw;
    if (/^0\d+/.test(cleaned)) {
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned === '') cleaned = '0';
    }
    const num = Number(cleaned);
    if (!isNaN(num) && num < 0) {
      setter(0);
      return;
    }
    if (max !== undefined) {
      if (!isNaN(num) && num > max) {
        setter(max);
        return;
      }
    }
    setter(cleaned);
  };



  // Route evaluation and final submission result

  const [routeDecision, setRouteDecision] = useState<any>(null);

  const [submittedApp, setSubmittedApp] = useState<any>(null);
  const [isDuplicateSubmission, setIsDuplicateSubmission] = useState<boolean>(false);
  const [showRouteExplorer, setShowRouteExplorer] = useState<boolean>(false);



  // Apply canonical preset or custom interactive mode
  const applyPreset = (preset: CollegePreset) => {
    setSelectedPresetId(preset.id);
    setInstitutionNameError(null);
    setIsCustomizingForm(preset.id === 'custom');
    setPan(preset.pan);
    setSignatoryName(preset.signatory);
    setMobile(preset.mobile);
    setEmail(preset.email);
    setInstitutionName(preset.name);
    setCategory(preset.category);
    setProgram(preset.program);
    setLevel(preset.level);
    setExistingIntake(preset.existingIntake);
    setProposedIntake(preset.proposedIntake);
    setNbaAccredited(preset.nbaAccredited);
    setNbaScore(preset.nbaScore);
    setBuiltUpAreaSqM(preset.builtUpAreaSqM);
    setRegion(preset.region);

    if (preset.id === 'custom') {
      setInstitutionName('');
      setSignatoryName('Dr. K. S. Raman');
      setPan('AAATA9876C');
      setEmail('director@aitr.edu.in');
      setMobile('9876501234');
      setSocietyName('Vanguard Educational Foundation');
      setEntityType('Trust');
      setStateName('Maharashtra');
      setCityName('Pune');
      setAddress('Sector 4, Institutional Area');
      setNbaValidTill('2027-06-30');
      setAccreditedCoursesCount(1);
      setSiteVerificationRequired(false);
      setIsRegionalLanguageCourse(false);
      setLandAreaAcre(5.0);
      setTerChargesPaidInr(200000);
      setCoreBranchesCount(3);
      setNonCsCoreBranchesCount(2);
      setPassOutBatchesCount(1);
      setIsPartialProgrammeApplication(false);
    }

    setErrorMsg(null);
    setSuccessMsg(
      preset.id === 'custom'
        ? 'Custom Application Mode activated: You can freely configure all statutory parameters and observe live routing in real time.'
        : `Preset applied: ${preset.shortName}. Configured for ${preset.expectedRoute}.`
    );
  };

  const activePreset = ALL_SIMULATION_OPTIONS.find(p => p.id === selectedPresetId) || ALL_SIMULATION_OPTIONS[0];

  // Real-time facts object reflecting every route-affecting input
  const liveFacts = useMemo(() => ({
    category,
    session: '2026-27',
    program,
    level,
    existingIntake: Number(existingIntake || 0),
    proposedIntake: Number(proposedIntake || 0),
    nbaAccredited,
    nbaScore: nbaAccredited ? Number(nbaScore || 0) : 0,
    nbaValidTill,
    accreditedCoursesCount: nbaAccredited ? Number(accreditedCoursesCount || 0) : 0,
    siteVerificationRequired,
    isRegionalLanguageCourse,
    coreBranchesCount: Number(coreBranchesCount || 0),
    nonCsCoreBranchesCount: Number(nonCsCoreBranchesCount || 0),
    passOutBatchesCount: Number(passOutBatchesCount || 0),
    isPartialProgrammeApplication,
    landAreaAcre: Number(landAreaAcre || 0),
    builtUpAreaSqM: Number(builtUpAreaSqM || 0),
    terChargesPaidInr: Number(terChargesPaidInr || 0),
    region,
    state: stateName,
    city: cityName,
    address,
    institutionName,
    institutionType: category === 'new_institution' ? 'new' : 'existing'
  }), [
    category, program, level, existingIntake, proposedIntake,
    nbaAccredited, nbaScore, nbaValidTill, accreditedCoursesCount,
    siteVerificationRequired, isRegionalLanguageCourse, coreBranchesCount,
    nonCsCoreBranchesCount, passOutBatchesCount, isPartialProgrammeApplication,
    landAreaAcre, builtUpAreaSqM, terChargesPaidInr, region, stateName, cityName,
    address, institutionName
  ]);

  // Dynamic Route Engine evaluation in real-time
  const liveRouteResult = useMemo(() => {
    try {
      return evaluateDynamicRoute(liveFacts);
    } catch (e) {
      return null;
    }
  }, [liveFacts]);



  // Step 1: Onboard
  const handleOnboard = async () => {
    if (selectedPresetId === 'custom' && !institutionName.trim()) {
      setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
      setErrorMsg(REQUIRED_INSTITUTION_NAME_MSG);
      setSuccessMsg(null);
      return;
    }

    setInstitutionNameError(null);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const trimmedName = institutionName.trim();
      if (!address || address === 'Sector 4, Institutional Area') {
        if (cityName && stateName) {
          setAddress(`Sector 4, Institutional Area, ${cityName}, ${stateName}`);
        }
      }
      const res = await api.onboardNSWS({
        entityName: trimmedName || 'Demo Technical Institute',
        institutionName: trimmedName,
        pan,
        signatoryName,
        mobile,
        email,
        simulatedOtp: otp
      });

      const data = (res as any)?.data ?? res;
      setOnboardResult(data);
      setCurrentStep(2);
      setSuccessMsg('NSWS Onboarding & PAN KYC verified successfully (Simulated)');
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }

  };



  // Step 2: DSC Verification

  const handleVerifyDSC = async () => {

    setLoading(true);

    setErrorMsg(null);

    setSuccessMsg(null);

    try {

      const res = await api.verifyDSC(
        'NSWS-DSC-' + Date.now(),
        tokenType !== 'UnsignedDocument',
        tokenType,
        signatoryName,
        onboardResult?.investorId || onboardResult?.nswsReference,
        pan
      );

      const data = (res as any)?.data ?? res;

      if (data?.verified) {

        setDscVerified(true);

        setCurrentStep(3);

        setSuccessMsg('Class-3 Cryptographic USB Token DSC validated via emBridge gateway (Simulated)');

      } else {

        setDscVerified(false);
        setErrorMsg('DSC signature verification rejected by gateway');

      }

    } catch (err: any) {

      setDscVerified(false);
      setErrorMsg(err.message || 'DSC Verification failed');

    } finally {

      setLoading(false);

    }

  };



  // Step 3 -> 4: Dynamic Route Pre-evaluation
  const handleEvaluateRoute = async () => {
    if (selectedPresetId === 'custom' && !institutionName.trim()) {
      setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
      setErrorMsg(REQUIRED_INSTITUTION_NAME_MSG);
      setSuccessMsg(null);
      return;
    }
    setInstitutionNameError(null);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const facts = {
        ...liveFacts,
        institutionType: category === 'new_institution' ? 'new' : 'existing'
      };
      const res = await api.evaluateNSWSRoute(facts);
      const data = (res as any)?.data ?? res;
      setRouteDecision(data?.routeDecision ?? data);
      setCurrentStep(4);
    } catch (err: any) {
      if (liveRouteResult) {
        setRouteDecision({
          ...liveRouteResult,
          routeType: liveRouteResult.policyRevisionId.includes('NBA') && !liveRouteResult.policyRevisionId.includes('NON-NBA')
            ? 'SCRUTINY_ONLY'
            : liveRouteResult.stages.includes('evc_pending')
            ? 'SCRUTINY_AND_EVC'
            : 'SCRUTINY_ONLY',
          requiresEVC: liveRouteResult.stages.includes('evc_pending'),
          fastTrackEligible: liveRouteResult.policyRevisionId.includes('NBA'),
          policyVersion: liveRouteResult.ruleVersion
        });
        setCurrentStep(4);
      } else {
        setErrorMsg(err.message || 'Route evaluation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> 5: Submit application
  const handleSubmitApplication = async () => {
    if (routeDecision?.eligibilityStatus === 'INELIGIBLE') {
      setErrorMsg('Submission Blocked: This application has unresolved statutory ineligibilities under AICTE norms and cannot be submitted.');
      setSuccessMsg(null);
      return;
    }
    if (selectedPresetId === 'custom' && !institutionName.trim()) {
      setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
      setErrorMsg(REQUIRED_INSTITUTION_NAME_MSG);
      setSuccessMsg(null);
      return;
    }
    setInstitutionNameError(null);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const isCustom = selectedPresetId === 'custom';
      const trimmedName = institutionName.trim();
      const cleanInstSlug = trimmedName.replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase();
      if (isCustom && !cleanInstSlug) {
        setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
        setErrorMsg(REQUIRED_INSTITUTION_NAME_MSG);
        setSuccessMsg(null);
        setLoading(false);
        return;
      }
      const uniqueSuffix = isCustom ? Math.floor(1000 + Math.random() * 9000).toString() : '';

      const mappedInstId = 
        selectedPresetId === 'coep' ? 'INST-SOUTH' :
        selectedPresetId === 'giits' ? 'INST-NORTH' :
        selectedPresetId === 'pdimtr' ? 'INST-WEST' :
        selectedPresetId === 'apex' ? 'INST-APEX' :
        selectedPresetId === 'batu' || selectedPresetId === 'batu-shifting' ? 'INST-BATU' :
        selectedPresetId === 'boundary-x360' ? 'INST-VVIT' :
        `INST-${cleanInstSlug}${uniqueSuffix ? `-${uniqueSuffix}` : ''}`;

      const presetSlug = selectedPresetId.toUpperCase().replace(/[^A-Z0-9]/g, '-');
      const appId = isCustom 
        ? `APP-2026-NSWS-${cleanInstSlug}-${uniqueSuffix}`
        : `APP-2026-NSWS-${presetSlug}`;
      const reference = isCustom
        ? `1-NSWS-${cleanInstSlug}-${uniqueSuffix}`
        : `1-NSWS-${presetSlug}-2026`;
      const idempotencyKey = isCustom
        ? `NSWS-2026-CUSTOM-${cleanInstSlug}-${uniqueSuffix}`
        : `NSWS-2026-${selectedPresetId}`;

      const payload = {
        id: appId,
        reference,
        idempotencyKey,
        nswsReference: onboardResult?.nswsReference || `NSWS-INV-${isCustom ? cleanInstSlug : presetSlug}`,
        institutionName: isCustom ? trimmedName : institutionName,
        institutionId: mappedInstId,
        regionId: region,
        category,
        session: '2026-27',
        pan,
        signatoryName,
        email,
        mobile,
        city: cityName,
        state: stateName,
        address,
        dscTokenSerial: 'EP2003-8841-A99B',
        facts: {
          institutionName: isCustom ? trimmedName : institutionName,
          entityName: societyName,
          entityType,
          category,
          program,
          level,
          existingIntake: Number(existingIntake || 0),
          proposedIntake: Number(proposedIntake || 0),
          nbaAccredited,
          nbaScore: nbaAccredited ? Number(nbaScore || 0) : 0,
          nbaValidTill,
          accreditedCoursesCount: nbaAccredited ? Number(accreditedCoursesCount || 0) : 0,
          siteVerificationRequired,
          isRegionalLanguageCourse,
          coreBranchesCount: Number(coreBranchesCount || 0),
          nonCsCoreBranchesCount: Number(nonCsCoreBranchesCount || 0),
          passOutBatchesCount: Number(passOutBatchesCount || 0),
          isPartialProgrammeApplication,
          landAreaAcre: Number(landAreaAcre || 0),
          builtUpAreaSqM: Number(builtUpAreaSqM || 0),
          terChargesPaidInr: Number(terChargesPaidInr || 0),
          region,
          state: stateName,
          city: cityName,
          address,
          signatoryName,
          pan,
          email,
          mobile
        }
      };

      const res = await api.submitNSWSApplication(payload);
      const data = (res as any)?.data ?? res;
      const appRecord = data?.application ?? data;
      setSubmittedApp(appRecord);
      const isDupe = Boolean((res as any)?.duplicateDetected || data?.duplicateDetected || (res as any)?.alreadySubmitted);
      setIsDuplicateSubmission(isDupe);

      if (isCustom) {
        try {
          const newEntry = {
            id: appRecord.institutionId || mappedInstId,
            name: trimmedName,
            appId: appRecord.id || appId,
            reference: appRecord.reference || reference,
            email: email || 'principal@custom.ac.in',
            routeType: appRecord.routeType || (routeDecision as any)?.routeType || 'Scrutiny Only'
          };
          const customInstList = JSON.parse(localStorage.getItem('sih_custom_institutions') || '[]');
          const filtered = Array.isArray(customInstList)
            ? customInstList.filter((c: any) => c && c.id !== newEntry.id && c.name?.toLowerCase() !== newEntry.name.toLowerCase() && c.name?.trim() && !/^custom\s+techn/i.test(c.name) && c.name !== 'Custom College' && c.id !== '1-CUSTOM')
            : [];
          const updated = [newEntry, ...filtered];
          localStorage.setItem('sih_custom_institutions', JSON.stringify(updated));
          localStorage.setItem('sih_active_custom_institution', JSON.stringify(newEntry));
          try { localStorage.setItem('sih_selected_college_id', newEntry.id); } catch {}
          window.dispatchEvent(new Event('sih:custom_institution_added'));
        } catch {}
      }

      try {
        await refreshData();
      } catch (e) {
        console.warn('refreshData after NSWS submission error:', e);
      }

      setCurrentStep(5);
      setSuccessMsg('Application submitted to AICTE Portal and persisted successfully with dynamic route snapshot!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const onReset = () => {
      applyPreset(CANONICAL_PRESETS[0]);
      setCurrentStep(1);
      setSubmittedApp(null);
      setRouteDecision(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setInstitutionNameError(null);
    };
    window.addEventListener('sih:custom_institution_reset', onReset);
    return () => window.removeEventListener('sih:custom_institution_reset', onReset);
  }, []);
  const handleReset = () => {
    setCurrentStep(1);
    setSubmittedApp(null);
    setRouteDecision(null);
    setDscVerified(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setInstitutionNameError(null);
  };



  return (

    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Unauthenticated Top Navigation Bar */}
      {isUnauthenticatedFlow && (
        <div className="bg-slate-900 text-white rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
          <div className="flex items-center gap-3">
            {onBackToGateway && (
              <button
                type="button"
                onClick={onBackToGateway}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Gateway</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                National Single Window System (NSWS) — Statutory Ingestion Gateway
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOpenInstitutionModal) onOpenInstitutionModal();
              else setShowInstPicker(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Sign In to Existing Institution Account</span>
          </button>
        </div>
      )}

      {/* Simulation Mandatory Disclosure Banner */}

      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">

        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />

        <div className="text-xs">

          <span className="font-bold uppercase tracking-wider text-amber-800 block text-[11px]">

            Statutory Scope Disclaimer: Interactive NSWS to AICTE Intake Simulation

          </span>

          <p className="mt-0.5 text-amber-700 leading-relaxed">

            This module simulates single-window institutional registration at the National Single Window System (NSWS) and subsequent cryptographic hand-off to the AICTE portal. No live production government API keys or real identity credentials are used. All PAN validations, emBridge DSC token verifications, and OTP validations run against realistic prototype fixtures.

          </p>

        </div>

      </div>



      {/* Stepper Progress Bar */}

      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">

          {[

            { step: 1, label: '1. NSWS Onboarding', desc: 'PAN KYC & Signatory' },

            { step: 2, label: '2. DSC Verification', desc: 'emBridge USB Token' },

            { step: 3, label: '3. AICTE Application', desc: 'Program & Intake Norms' },

            { step: 4, label: '4. Dynamic Route Check', desc: 'APH Table 2.3 Engine' },

            { step: 5, label: '5. Submission Complete', desc: 'Case Ingestion & Intake' },

          ].map((s) => (

            <div

              key={s.step}

              className={`p-2.5 rounded-lg border transition-all text-left flex flex-col justify-between ${

                currentStep === s.step

                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'

                  : currentStep > s.step

                  ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800'

                  : 'border-slate-200 bg-slate-50 text-slate-400'

              }`}

            >

              <div className="flex items-center justify-between">

                <span className="text-[11px] font-semibold">{s.label}</span>

                {currentStep > s.step && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}

              </div>

              <div className="text-[10px] opacity-75 mt-0.5">{s.desc}</div>

            </div>

          ))}

        </div>

      </div>



      {/* Validation Feedback & Notification Banners */}
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between gap-2.5 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer"
            title="Dismiss error message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!errorMsg && successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}



      {/* STEP 1: NSWS Onboarding & Canonical College Presets */}

      {currentStep === 1 && (

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div className="flex items-center gap-2">

              <Globe className="w-5 h-5 text-blue-600" />

              <h3 className="font-bold text-slate-900 text-base">NSWS Single-Window Registration</h3>

              <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono font-semibold">[SIMULATED - PAN Format Validation]</span>

            </div>

            <span className="text-xs text-slate-500">APH §1.3.1 &amp; §1.4.1</span>

          </div>



          {/* PROMINENT CUSTOM INSTITUTION / INTERACTIVE DYNAMIC INTAKE (ABOVE PRESETS) */}
          <div
            onClick={() => applyPreset(CUSTOM_PRESET_DEF)}
            className={`rounded-xl border transition-all p-4.5 space-y-3 cursor-pointer ${
              selectedPresetId === 'custom'
                ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/25 shadow-sm'
                : 'bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/60 border-indigo-200 hover:border-indigo-400 hover:shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Custom Technical Institution / Interactive Dynamic Intake
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono">
                      ★ JUDGE SANDBOX: LIVE EVALUATION
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Create and evaluate any non-seeded institution from scratch. Configure custom programs, intake numbers, and infrastructure to test real-time deterministic statutory routing live.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  applyPreset(CUSTOM_PRESET_DEF);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  selectedPresetId === 'custom'
                    ? 'bg-indigo-700 text-white ring-1 ring-indigo-800'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <span>{selectedPresetId === 'custom' ? '✓ Custom Mode Active' : 'Configure Custom Institution →'}</span>
              </button>
            </div>

            {selectedPresetId === 'custom' && (
              <div
                className="pt-3.5 border-t border-indigo-200/80 space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 block text-xs uppercase tracking-wide">
                    Custom Institution Identity &amp; Sponsoring Body Information
                  </span>
                  <span className="text-[10px] text-indigo-700 font-medium bg-indigo-100 px-2 py-0.5 rounded">
                    Editable Form Fields
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Institution Legal Name <span className="text-rose-500 font-bold">*</span>
                      </label>
                      {institutionNameError && (
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 inline shrink-0" />
                          <span>Required</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      id="nsws-custom-inst-name-step1"
                      className={`w-full px-3 py-2 border rounded-lg bg-white font-medium text-xs transition-colors ${
                        institutionNameError
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20 text-rose-900 focus:ring-rose-400 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-1 focus:ring-indigo-500'
                      }`}
                      value={institutionName}
                      onChange={(e) => handleInstitutionNameChange(e.target.value)}
                      onBlur={() => {
                        if (selectedPresetId === 'custom' && !institutionName.trim()) {
                          setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
                        }
                      }}
                      placeholder="e.g. Aryabhatta Institute of Technology & Research"
                    />
                    {institutionNameError && (
                      <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{institutionNameError}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sponsoring Trust / Society</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-indigo-500"
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      placeholder="e.g. Vanguard Educational Foundation"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Entity Legal Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value)}
                    >
                      <option value="Trust">Registered Trust</option>
                      <option value="Society">Registered Society</option>
                      <option value="Section 8 Company">Section 8 Company (Not-for-Profit)</option>
                      <option value="Government">Government / Constituent</option>
                      <option value="University Managed">University Managed</option>
                      <option value="Private-Self Financing">Private-Self Financing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">AICTE Regional Office Jurisdiction</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="Western">Western Regional Office (Mumbai)</option>
                      <option value="South-Central">South-Central Regional Office (Hyderabad)</option>
                      <option value="North-Western">North-Western Regional Office (Chandigarh)</option>
                      <option value="Southern">Southern Regional Office (Chennai)</option>
                      <option value="Northern">Northern Regional Office (Kanpur)</option>
                      <option value="Eastern">Eastern Regional Office (Kolkata)</option>
                      <option value="South-Western">South-Western Regional Office (Bengaluru)</option>
                      <option value="Central">Central Regional Office (Bhopal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State &amp; City</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="w-full px-2.5 py-2 border rounded-lg bg-white text-xs"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="State"
                      />
                      <input
                        type="text"
                        className="w-full px-2.5 py-2 border rounded-lg bg-white text-xs"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canonical Benchmark Presets (7 Colleges across 6 Institutions) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
                  Or Select a Canonical AICTE Benchmark Scenario:
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Seven statutory scenarios across six institutions &mdash; Dr. BATU models 2 distinct dockets: Progressive Closure / Rationalization (Desk Scrutiny Only) and Rural Campus Relocation (Physical Site EVC).
                </span>
              </div>
              <span className="text-[10px] text-blue-700 font-semibold shrink-0">Click preset to load benchmark</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {CANONICAL_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block truncate text-slate-900">
                        {p.shortName}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium inline-block mt-1 border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Preset Regulatory Info */}
            {selectedPresetId !== 'custom' && (
              <div className="p-2.5 rounded-lg border text-[11px] flex items-start gap-2 bg-blue-50/60 border-blue-200/80 text-blue-950">
                <BookmarkCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <strong>Active Benchmark:</strong> {activePreset.name} &mdash; <em>Expected: {activePreset.expectedRoute}</em>
                  <p className="text-[10px] mt-0.5 text-blue-800/90">{activePreset.regulatoryCite}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

            <div>

              <label className="block font-semibold text-slate-700 mb-1">Entity / Trust PAN (Statutory Format: 5 letters, 4 digits, 1 letter)</label>

              <input

                type="text"

                className="w-full px-3 py-2 border rounded-lg font-mono uppercase bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"

                value={pan}

                onChange={(e) => setPan(e.target.value.toUpperCase())}

                placeholder="AAACB1234F"

              />

            </div>



            <div>

              <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory Name</label>

              <input

                type="text"

                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"

                value={signatoryName}

                onChange={(e) => setSignatoryName(e.target.value)}

              />

            </div>



            <div>

              <label className="block font-semibold text-slate-700 mb-1">Authorized Mobile Number</label>

              <input

                type="text"

                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"

                value={mobile}

                onChange={(e) => setMobile(e.target.value)}

              />

            </div>



            <div>

              <label className="block font-semibold text-slate-700 mb-1">Official Institutional Email Address</label>

              <input

                type="email"

                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

              />

            </div>



            <div>

              <label className="block font-semibold text-slate-700 mb-1">Simulated OTP (Auto-filled: 123456)</label>

              <input

                type="text"

                className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"

                value={otp}

                onChange={(e) => setOtp(e.target.value)}

              />

            </div>

          </div>



          {institutionNameError && selectedPresetId === 'custom' && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{institutionNameError}</span>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">

            <button

              onClick={handleOnboard}

              disabled={loading}

              className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"

            >

              <span>Verify Institutional KYC &amp; Proceed</span>

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      )}



      {/* STEP 2: emBridge DSC Token Verification */}

      {currentStep === 2 && (

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div className="flex items-center gap-2">

              <KeyRound className="w-5 h-5 text-indigo-600" />

              <h3 className="font-bold text-slate-900 text-base">emBridge / Class-3 DSC Token Verification</h3>

              <span className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono font-semibold">[SIMULATED - Class-3 Crypto Token Format Gate]</span>

            </div>

            <span className="text-xs text-slate-500">APH §1.4.3 &amp; §2.3.4(a)</span>

          </div>



          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">

            <div className="flex justify-between items-center">

              <span className="text-slate-500">NSWS Application Ref:</span>

              <span className="font-mono font-bold text-slate-900">{onboardResult?.nswsReference}</span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-slate-500">Verified Signatory:</span>

              <span className="font-semibold text-slate-900">{signatoryName}</span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-slate-500">Entity PAN:</span>

              <span className="font-mono font-bold text-slate-900">{pan}</span>

            </div>

          </div>



          <div className="space-y-2 text-xs">

            <label className="block font-semibold text-slate-700">Cryptographic USB Token / Soft Token Gateway Simulation</label>

            <select

              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-medium"

              value={tokenType}

              onChange={(e: any) => {
                setTokenType(e.target.value);
                setDscVerified(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}

            >

              <option value="ePass2003Auto">ePass2003Auto USB Cryptographic Token (Class-3 - Valid)</option>

              <option value="mToken">mToken Crypto Identity USB Token (Class-3 - Valid)</option>

              <option value="CryptoSoftToken">NIC / eMudhra PKI Software Token (Class-3 - Valid)</option>

              <option value="ExpiredToken">[Negative Fixture] Expired Token Certificate (Simulate Rejection)</option>

              <option value="RevokedCert">[Negative Fixture] Revoked Certificate on CRL (Simulate Rejection)</option>

              <option value="UnsignedDocument">[Negative Fixture] Missing DSC Signature Hash (Simulate Rejection)</option>

            </select>

            <p className="text-[11px] text-slate-500">

              Select negative fixtures to verify that the system strictly enforces cryptographic rejection per APH §1.4.3 without false positives.

            </p>

          </div>



          {/* Real-time Hardware / Token Verification Status Indicator */}
          <div className="p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-2xs"
               style={{
                 background: dscVerified ? '#f0fdf4' : errorMsg ? '#fff1f2' : '#f8fafc',
                 borderColor: dscVerified ? '#86efac' : errorMsg ? '#fecdd3' : '#e2e8f0'
               }}>
            <div className="flex items-center gap-2.5">
              {dscVerified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : errorMsg ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <KeyRound className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-xs" style={{ color: dscVerified ? '#166534' : errorMsg ? '#9f1239' : '#334155' }}>
                  {dscVerified
                    ? 'Class-3 Cryptographic DSC Validated & Sealed'
                    : errorMsg
                    ? 'Cryptographic Verification Rejected'
                    : 'Awaiting Hardware Token Verification'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {dscVerified
                    ? 'eMudhra / NIC CA Certificate & SHA-256 Digest confirmed for ' + signatoryName
                    : errorMsg
                    ? errorMsg
                    : 'Connect USB Token via emBridge driver port 127.0.0.1:4501.'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
              dscVerified
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : errorMsg
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              {dscVerified ? 'GATE_PASSED' : errorMsg ? 'GATE_BLOCKED' : 'READY'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setCurrentStep(1);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Back to Identity
            </button>
            <div className="flex items-center gap-2">
              {errorMsg && (
                <button
                  onClick={() => {
                    setTokenType('ePass2003Auto');
                    setErrorMsg(null);
                    setSuccessMsg('Switched to valid Class-3 USB Token. Click Verify to proceed.');
                  }}
                  className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Use Valid Class-3 Token & Continue</span>
                </button>
              )}
              <button
                onClick={handleVerifyDSC}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{dscVerified ? 'Re-Verify Token' : 'Verify DSC Token via emBridge Gateway'}</span>
              </button>
              {dscVerified && (
                <button
                  onClick={() => {
                    setCurrentStep(3);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <span>Proceed to Application Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div className="flex items-center gap-2">

              <Building className="w-5 h-5 text-blue-600" />

              <h3 className="font-bold text-slate-900 text-base">AICTE Portal Application Form Simulation</h3>

              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">

                AY 2026-27 Intake Norms

              </span>

            </div>

            {selectedPresetId && (

              <button

                onClick={() => setIsCustomizingForm(!isCustomizingForm)}

                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"

              >

                {isCustomizingForm ? 'Lock to Preset Defaults' : 'Customize Scenario Values'}

              </button>

            )}

          </div>



          {!isCustomizingForm && selectedPresetId && selectedPresetId !== 'custom' ? (

            /* Read-Only Structured Benchmark Summary Cards */

            <div className="space-y-4">

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <ShieldCheck className="w-4 h-4 text-emerald-600" />

                  <span className="text-xs font-semibold text-emerald-900">

                    Pre-Populated Canonical Preset: {activePreset.name}

                  </span>

                </div>

                <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">

                  VERIFIED DATA IMMUTABLE

                </span>

              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">

                  <span className="text-[11px] text-slate-500 block mb-1">Institution Legal Name</span>

                  <span className="font-bold text-slate-900 block text-sm">{institutionName}</span>

                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">Region: {region} (Regional Office)</span>

                </div>



                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">

                  <span className="text-[11px] text-slate-500 block mb-1">Application Category & Level</span>

                  <span className="font-bold text-slate-900 block capitalize">

                    {category.replace(/_/g, ' ')} &bull; {level}

                  </span>

                  <span className="text-[10px] text-blue-700 font-medium mt-1 block">Program: {program}</span>

                </div>



                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">

                  <span className="text-[11px] text-slate-500 block mb-1">Intake Expansion Request</span>

                  <div className="flex items-center gap-2 mt-0.5">

                    <span className="font-mono text-slate-600">{existingIntake} Existing Seats</span>

                    <span className="text-slate-400">&rarr;</span>

                    <span className="font-bold font-mono text-slate-900 text-sm">{proposedIntake} Proposed Seats</span>

                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">

                      +{proposedIntake - existingIntake} Seats

                    </span>

                  </div>

                </div>



                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">

                  <span className="text-[11px] text-slate-500 block mb-1">NBA Accreditation & Built-up Area</span>

                  <div className="flex items-center gap-2 mt-0.5">

                    <span

                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${

                        nbaAccredited

                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'

                          : 'bg-slate-200 text-slate-700'

                      }`}

                    >

                      {nbaAccredited ? `NBA Accredited (${nbaScore}/1000)` : 'Non-NBA Course'}

                    </span>

                    <span className="text-slate-500 font-mono text-[11px]">

                      {builtUpAreaSqM.toLocaleString()} m&sup2; Built-Up

                    </span>

                  </div>

                  {nbaAccredited && nbaScore >= 650 && (

                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">

                      &bull; Eligible for EVC Exemption under APH Errata p. 42

                    </span>

                  )}

                </div>

              </div>

            </div>

          ) : (

            /* Interactive Form organized into 4 Clear Demarcated Regulatory Functional Sections */
            <div className="space-y-5">
              
              {/* SECTION 1: STATUTORY ROUTE DETERMINANTS */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                    <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                      1. Statutory Route Determinants
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                    Directly Dictates Route Spine &amp; Verification Stages
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Statutory Application Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-purple-500 font-medium text-xs"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="increase_intake">Increase in Intake / Additional Course(s)</option>
                      <option value="new_institution">Setting up New Technical Institution</option>
                      <option value="extension_of_approval">Extension of Approval (EoA Self-Disclosure)</option>
                      <option value="nri_seats">Introduction / Continuation of NRI Seats</option>
                      <option value="conversion_diploma_degree">Conversion of Diploma to Degree Level</option>
                      <option value="name_change_institution">Change in Name of Institution / Board</option>
                      <option value="new_programme_level">Start New Programme / Level</option>
                      <option value="merger_institutions">Merger of Institutions in Same Campus</option>
                      <option value="break_restoration_hibernation">Break in EoA / Restoration / Hibernation</option>
                      <option value="supernumerary_fn_oci">Supernumerary Seats for FN / OCI / Gulf</option>
                      <option value="integrated_dual_degree">Introduction of Integrated / Dual Degree Course</option>
                      <option value="fellow_programme_fpm">Fellow Programme in Management (FPM)</option>
                      <option value="course_name_change">Change Name of Course / Reduction in Intake</option>
                      <option value="collaboration_twinning">Collaboration & Twinning Programme</option>
                      <option value="change_of_site">Change of Site / Location</option>
                      <option value="closure">Closure of Technical Institution</option>
                      <option value="conversion_coeducation">Conversion of Women's Institution to Co-ed</option>
                      <option value="closure_course">Closure of Programme(s) / Course(s)</option>
                      <option value="bank_change">Change in Bank Details</option>
                      <option value="trust_change">Change in Name of Trust / Society</option>
                      <option value="conversion_deemed_university">Conversion to Deemed-to-be-University</option>
                      <option value="odl_courses">Open and Distance Learning (ODL) / Online Learning</option>
                      <option value="bba_bca_bms">BBA / BCA / BMS Programmes (As-Is-Where-Is Intake)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Academic Programme
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-purple-500 text-xs"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                    >
                      <option value="Engineering and Technology">Engineering and Technology</option>
                      <option value="Management">Management</option>
                      <option value="Computer Applications">Computer Applications (MCA)</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Architecture and Planning">Architecture and Planning</option>
                      <option value="Hotel Management and Catering Technology">Hotel Management and Catering Technology</option>
                      <option value="Applied Arts and Crafts">Applied Arts and Crafts</option>
                      <option value="Design">Design</option>
                    </select>
                    {program === 'Engineering and Technology' && (
                      <span className="text-[10px] text-purple-700 block mt-1">
                        &bull; Engineering programmes require Core Branches check (Clause 2.6(c)(i)).
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Academic Level
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:ring-purple-500 text-xs"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="Under Graduate">Under Graduate (UG)</option>
                      <option value="Post Graduate">Post Graduate (PG)</option>
                      <option value="Diploma">Diploma Level</option>
                      <option value="Post Diploma">Post Diploma</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Existing Approved Intake (X)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white focus:ring-1 focus:ring-purple-500"
                      value={existingIntake}
                      onChange={handleNumericChange(setExistingIntake, true)}
                    />
                    {existingIntake === 360 && (
                      <div className="mt-1 p-1.5 bg-amber-50 border border-amber-300 rounded text-[10px] text-amber-900 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span>Statutory Ambiguity: X = 360 boundary condition is omitted from APH Errata p. 42 table.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* NBA Accreditation & Quality Score */}
                <div className="p-3 bg-white rounded-lg border border-purple-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={nbaAccredited}
                        onChange={(e) => setNbaAccredited(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span className="font-bold text-slate-900 text-xs">
                        NBA Accreditation (National Board of Accreditation)
                      </span>
                    </label>
                    {(() => {
                      const isEvcWaived = liveRouteResult?.skippedStages?.some((s: any) => (typeof s === 'object' ? s.stage : s) === 'evc_pending');
                      const isEvcMandatory = liveRouteResult?.stages?.includes('evc_pending');
                      if (isEvcWaived) {
                        return (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Fast-Track Eligible: Physical EVC Waived (§2.6(c)(i))
                          </span>
                        );
                      }
                      if (isEvcMandatory) {
                        return (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Physical EVC Inspection Mandated (§2.4 / Errata p. 42)
                          </span>
                        );
                      }
                      return (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                          Desk Scrutiny Only (§2.3 / Table 2.3)
                        </span>
                      );
                    })()}
                  </div>

                  {nbaAccredited && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-50 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          NBA Quality Score (0–1000 | Statutory Threshold ≥ 650)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white"
                          value={nbaScore}
                          onChange={handleNumericChange(setNbaScore, true, 1000)}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Accreditation Valid Till
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white text-xs"
                          value={nbaValidTill}
                          onChange={(e) => setNbaValidTill(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Conditional Route Determinants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Engineering Core Branches */}
                  {program === 'Engineering and Technology' && category === 'increase_intake' && (
                    <div className="p-3 bg-white rounded-lg border border-purple-100 space-y-2 col-span-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          Core Engineering Branches (Errata Page 42 Clause 2.6(c)(i))
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-purple-700 font-medium">
                          <input
                            type="checkbox"
                            checked={isRegionalLanguageCourse}
                            onChange={(e) => setIsRegionalLanguageCourse(e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                          />
                          <span>Regional Language Medium (Exempts Core Rule)</span>
                        </label>
                      </div>

                      {!isRegionalLanguageCourse && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">
                              Total Core Branches (Min 3 required)
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-slate-50 focus:bg-white"
                              value={coreBranchesCount}
                              onChange={handleNumericChange(setCoreBranchesCount, true)}
                            />
                            {coreBranchesCount < 3 && (
                              <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                                Deficit: At least 3 core branches required for intake expansion.
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">
                              Non-CS Core Branches (Min 2 required)
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-slate-50 focus:bg-white"
                              value={nonCsCoreBranchesCount}
                              onChange={handleNumericChange(setNonCsCoreBranchesCount, true)}
                            />
                            {nonCsCoreBranchesCount < 2 && (
                              <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                                Deficit: At least 2 non-CS core branches required.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ODL Batches */}
                  {(category === 'odl_courses' || category === 'online_learning') && (
                    <div className="p-3 bg-white rounded-lg border border-purple-100 space-y-1 col-span-1 sm:col-span-2">
                      <label className="block font-bold text-slate-900 text-xs mb-1">
                        Graduated Pass-Out Batches (Clause 5.3.8 &amp; Addendum Item 32)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs bg-slate-50 focus:bg-white"
                        value={passOutBatchesCount}
                        onChange={handleNumericChange(setPassOutBatchesCount, true)}
                      />
                      {passOutBatchesCount < 1 && (
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                          Ineligible: Minimum 1 batch must have graduated to apply for ODL/OL.
                        </span>
                      )}
                    </div>
                  )}

                  {/* University Partial App */}
                  {(category === 'conversion_deemed_university' || (institutionName || '').toLowerCase().includes('univ')) && (
                    <div className="p-3 bg-white rounded-lg border border-purple-100 col-span-1 sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPartialProgrammeApplication}
                          onChange={(e) => setIsPartialProgrammeApplication(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            Partial Programme Application (Prohibited under Public Notice 26.11.2025)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Universities must apply for all technical programmes together. Partial applications trigger regulatory rejection.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Site Verification Trigger */}
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100 col-span-1 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteVerificationRequired}
                        onChange={(e) => setSiteVerificationRequired(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-800 text-xs">
                        Physical Site Relocation / Shifting / Restoration (Mandates On-Site EVC)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: STATUTORY CAPACITY CALCULATIONS */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                      2. Statutory Capacity Calculations (Intake Formulas)
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                    Computes Permissible Ceiling Without Altering Route
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Proposed Sanctioned Intake (Seats)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white focus:ring-1 focus:ring-blue-500"
                      value={proposedIntake}
                      onChange={handleNumericChange(setProposedIntake, true)}
                    />
                    {category === 'increase_intake' && proposedIntake < existingIntake && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                        Inconsistency: Proposed intake cannot be less than existing sanctioned intake in an intake increase application.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Accredited Courses Count (Divisions Allowed: 60 seats/course)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white focus:ring-1 focus:ring-blue-500"
                      value={accreditedCoursesCount}
                      onChange={handleNumericChange(setAccreditedCoursesCount, true, 15)}
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Each accredited course contributes +60 seats to the allowable ceiling under Errata p. 42.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: STATUTORY COMPLIANCE & INFRASTRUCTURE NORMS */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      3. Statutory Compliance &amp; Infrastructure Norms
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    Norm Compliance &amp; Processing Fees
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Total Built-up Area (Sq. Meters)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white focus:ring-1 focus:ring-emerald-500"
                      value={builtUpAreaSqM}
                      onChange={handleNumericChange(setBuiltUpAreaSqM, false)}
                    />
                    {builtUpAreaSqM < 0 && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                        Violation: Negative built-up area violates Annexure 4 norms.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Land Area (Acres)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white focus:ring-1 focus:ring-emerald-500"
                      value={landAreaAcre}
                      onChange={handleNumericChange(setLandAreaAcre, false)}
                    />
                    {Number(landAreaAcre) < 0 && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                        Violation: Negative land area violates Chapter I/II norms.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      TER / Processing Fee Paid (INR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white focus:ring-1 focus:ring-emerald-500"
                      value={terChargesPaidInr}
                      onChange={handleNumericChange(setTerChargesPaidInr, false)}
                    />
                    {Number(terChargesPaidInr) < 0 && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                        Violation: TER fee cannot be negative.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: INSTITUTIONAL IDENTITY & REGIONAL JURISDICTION */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      4. Institutional Identity &amp; Regional Jurisdiction
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    Registry Identification &amp; Office Allocation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Institution Legal Name {selectedPresetId === 'custom' && <span className="text-rose-500 font-bold">*</span>}
                      </label>
                      {institutionNameError && selectedPresetId === 'custom' && (
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 inline shrink-0" />
                          <span>Required</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      id="nsws-custom-inst-name-step3"
                      className={`w-full px-3 py-2 border rounded-lg bg-white font-medium text-xs transition-colors ${
                        institutionNameError && selectedPresetId === 'custom'
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20 text-rose-900 focus:ring-rose-400 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-1 focus:ring-indigo-500'
                      }`}
                      value={institutionName}
                      onChange={(e) => handleInstitutionNameChange(e.target.value)}
                      onBlur={() => {
                        if (selectedPresetId === 'custom' && !institutionName.trim()) {
                          setInstitutionNameError(REQUIRED_INSTITUTION_NAME_MSG);
                        }
                      }}
                      placeholder="e.g. Aryabhatta Institute of Technology & Research"
                    />
                    {institutionNameError && selectedPresetId === 'custom' && (
                      <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{institutionNameError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sponsoring Society / Trust</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Entity Legal Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value)}
                    >
                      <option value="Trust">Registered Charitable Trust</option>
                      <option value="Society">Registered Educational Society</option>
                      <option value="Section 8 Company">Section 8 Company (Not-for-Profit)</option>
                      <option value="Government">Government / Constituent Institution</option>
                      <option value="University Managed">University Managed Institution</option>
                      <option value="Private-Self Financing">Private-Self Financing Institution</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">AICTE Regional Office Jurisdiction</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="Western">Western Regional Office (Mumbai)</option>
                      <option value="South-Central">South-Central Regional Office (Hyderabad)</option>
                      <option value="North-Western">North-Western Regional Office (Chandigarh)</option>
                      <option value="Southern">Southern Regional Office (Chennai)</option>
                      <option value="Northern">Northern Regional Office (Kanpur)</option>
                      <option value="Eastern">Eastern Regional Office (Kolkata)</option>
                      <option value="South-Western">South-Western Regional Office (Bengaluru)</option>
                      <option value="Central">Central Regional Office (Bhopal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State &amp; City</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full px-2.5 py-2 border rounded-lg bg-white text-xs"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full px-2.5 py-2 border rounded-lg bg-white text-xs"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campus Postal Address</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Autofilled & Synchronized Details from Step 1 */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Entity / Trust PAN (Autofilled from Step 1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg font-mono uppercase bg-slate-50 focus:bg-white text-xs"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="AAATA9876C"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory Name (Autofilled from Step 1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      placeholder="Dr. K. S. Raman"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Institutional Email (Autofilled from Step 1)</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="director@aitr.edu.in"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Authorized Mobile Number (Autofilled from Step 1)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876501234"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Route Preview Box */}
              {liveRouteResult && (
                <div className={`p-4 rounded-xl border space-y-3 text-xs ${
                  liveRouteResult.eligibilityStatus === 'INELIGIBLE'
                    ? 'border-rose-300 bg-rose-50/70'
                    : liveRouteResult.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || liveRouteResult.result === 'review_required'
                    ? 'border-amber-300 bg-amber-50/70'
                    : 'border-purple-200 bg-purple-50/70'
                }`}>
                  {liveRouteResult.eligibilityStatus === 'INELIGIBLE' ? (
                    <div className="p-3 bg-white rounded-lg border-2 border-rose-400 text-rose-950 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900">
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span className="uppercase tracking-wide text-xs">🛑 Statutory Ineligibility Detected — Application Cannot Proceed</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                          INELIGIBLE
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 leading-tight">
                        Application parameters fail statutory minimum criteria under AICTE norms. These deficits must be cured before submission.
                      </p>
                      {liveRouteResult.unresolvedFlags && liveRouteResult.unresolvedFlags.length > 0 && (
                        <ul className="list-disc pl-5 text-[11px] space-y-0.5 pt-1 border-t border-rose-100 font-mono text-rose-800">
                          {liveRouteResult.unresolvedFlags.map((flag, fIdx) => (
                            <li key={fIdx}>{flag}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : liveRouteResult.unresolvedFlags && liveRouteResult.unresolvedFlags.length > 0 ? (
                    <div className="p-3 bg-white rounded-lg border-2 border-amber-400 text-amber-950 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="uppercase tracking-wide text-xs">⚠️ Statutory Policy Review Required — Case Held</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          REVIEW REQUIRED
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-tight">
                        Boundary condition or parameter conflict detected. Case requires authoritative Council policy determination.
                      </p>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5 pt-1 border-t border-amber-100 font-mono text-amber-800">
                        {liveRouteResult.unresolvedFlags.map((flag, fIdx) => (
                          <li key={fIdx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-700" />
                      <span className="font-extrabold text-purple-950 tracking-wide uppercase text-xs">
                        ⚡ Real-Time Statutory Route Calculation Engine (APH Table 2.3)
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                      liveRouteResult.eligibilityStatus === 'INELIGIBLE'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : liveRouteResult.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || liveRouteResult.result === 'review_required'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : liveRouteResult.stages.includes('evc_pending')
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {liveRouteResult.eligibilityStatus === 'INELIGIBLE'
                        ? 'BLOCKED (INELIGIBLE)'
                        : liveRouteResult.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || liveRouteResult.result === 'review_required'
                        ? 'POLICY REVIEW REQUIRED'
                        : liveRouteResult.stages.includes('evc_pending')
                        ? 'SCRUTINY + MANDATORY PHYSICAL EVC'
                        : 'SCRUTINY ONLY (FAST-TRACK)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white/90 rounded-lg border border-purple-100 space-y-1.5">
                      <div className="text-[11px] text-slate-500 font-medium">Mandatory Stages Spine:</div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {liveRouteResult.stages.map((st: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-[10px] font-bold">
                            {idx + 1}. {formatStageDisplayName(st)}
                          </span>
                        ))}
                      </div>
                      {liveRouteResult.skippedStages?.length > 0 && (
                        <div className="text-[10px] text-emerald-800 font-medium pt-1 border-t border-purple-100">
                          <strong>Waived Stages:</strong> {liveRouteResult.skippedStages.map((s: any) => formatStageDisplayName(typeof s === 'string' ? s : s.stage)).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-white/90 rounded-lg border border-purple-100 space-y-1">
                      <div className="text-[11px] text-slate-500 font-medium">Statutory Clause &amp; Justification:</div>
                      <div className="font-semibold text-purple-950 text-xs">
                        {liveRouteResult.matchedRules?.[0]?.clause || 'APH 2024–27 Table 2.3'} &mdash; {liveRouteResult.matchedRules?.[0]?.title || 'Approval Norms'}
                      </div>
                      <p className="text-[10px] text-purple-800/90 leading-tight">
                        {liveRouteResult.reasons?.[0] || 'Application evaluated deterministically against version-pinned AICTE rulebook.'}
                      </p>
                    </div>
                  </div>

                  {liveRouteResult.allowedIntakeCalculation && (
                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs flex items-center justify-between">
                      <span className="text-blue-900 font-medium text-[11px]">
                        Intake Formula: <strong>{liveRouteResult.allowedIntakeCalculation.formulaApplied}</strong>
                      </span>
                      <span className="font-mono font-bold text-blue-950 text-[11px]">
                        Allowed Ceiling: {liveRouteResult.allowedIntakeCalculation.allowedIntakeCeiling} Seats {liveRouteResult.allowedIntakeCalculation.isCapped ? '(CAPPED)' : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          )}



          {institutionNameError && selectedPresetId === 'custom' && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{institutionNameError}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-slate-100">

            <button

              onClick={() => {

                setCurrentStep(2);

                setErrorMsg(null);

                setSuccessMsg(null);

              }}

              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"

            >

              Back to DSC

            </button>

            <button

              onClick={handleEvaluateRoute}

              disabled={loading}

              className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"

            >

              <Cpu className="w-4 h-4" />

              <span>Evaluate Route with APH Engine</span>

            </button>

          </div>

        </div>

      )}



      {/* STEP 4: Dynamic Route Engine Result */}

      {currentStep === 4 && routeDecision && (

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div className="flex items-center gap-2">

              <Cpu className="w-5 h-5 text-purple-600" />

              <h3 className="font-bold text-slate-900 text-base">Dynamic Route Evaluation Result</h3>

              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-semibold">{routeDecision.matchedRules?.[0]?.clause || 'APH 2024–27 TABLE 2.3'}</span>

            </div>

            <span className="text-xs font-mono text-purple-800 font-semibold">{routeDecision.policyVersion}</span>

          </div>

          {/* Prominent Statutory Eligibility Status Banner */}
          {routeDecision.eligibilityStatus === 'INELIGIBLE' ? (
            <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-950 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-extrabold text-sm uppercase tracking-wide text-rose-900">
                    🛑 Statutory Ineligibility Detected &mdash; Application Registration Blocked
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-950 border border-rose-300">
                  REGISTRATION BLOCKED
                </span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                This application fails mandatory statutory eligibility criteria specified under AICTE Approval Process Handbook (APH) 2024–27 and Addendum/Errata norms. Under statutory regulations, this application cannot proceed to regional scrutiny or council determination until all deficiencies are cured.
              </p>
              <div className="pt-2 border-t border-rose-200 space-y-1">
                <span className="font-bold text-xs text-rose-900 block">Identified Ineligibility Reasons &amp; Norm Violations:</span>
                <ul className="list-disc list-inside text-xs space-y-0.5 text-rose-800 font-medium">
                  {routeDecision.reasons?.filter((r: string) => {
                    const rl = (r || '').toLowerCase();
                    return rl.includes('ineligible') || rl.includes('deficit') || rl.includes('exceed') || rl.includes('violation');
                  }).map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required') ? (
            <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-950 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-sm uppercase tracking-wide text-amber-900">
                    ⚠️ Case Held for Regulatory Policy Review
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                  POLICY REVIEW REQUIRED
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                This application triggers regulatory boundary conditions, missing baseline parameters, or policy ambiguities that cannot be resolved deterministically without Council / Executive Committee interpretation. Automatic progression is suspended.
              </p>
              {routeDecision.unresolvedFlags && routeDecision.unresolvedFlags.length > 0 && (
                <div className="pt-2 border-t border-amber-200 space-y-1">
                  <span className="font-bold text-xs text-amber-900 block">Unresolved Boundary Conditions:</span>
                  <ul className="list-disc list-inside text-xs space-y-0.5 text-amber-800 font-mono text-[11px]">
                    {routeDecision.unresolvedFlags.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-900">
                  Statutory Eligibility Verified &mdash; Deterministic Route Calculated &amp; Ready for Autonomous Ingestion
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                STATUTORILY COMPLIANT
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">

              <span className="font-bold text-slate-900 block text-xs tracking-wide uppercase">Evaluated Route Profile</span>

              <div className="flex justify-between items-center">

                <span className="text-slate-500">Route Type:</span>

                <span className={`font-bold text-xs ${
                  routeDecision.eligibilityStatus === 'INELIGIBLE'
                    ? 'text-rose-700 font-extrabold'
                    : routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required'
                    ? 'text-amber-800 font-extrabold'
                    : 'text-blue-700'
                }`}>
                  {routeDecision.eligibilityStatus === 'INELIGIBLE'
                    ? 'BLOCKED (INELIGIBLE UNDER STATUTORY NORMS)'
                    : routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required'
                    ? 'POLICY REVIEW REQUIRED (COUNCIL DETERMINATION)'
                    : formatRouteTypeName(routeDecision.routeType)}
                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-slate-500">Physical EVC Inspection:</span>

                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  routeDecision.eligibilityStatus === 'INELIGIBLE'
                    ? 'bg-rose-100 text-rose-900'
                    : routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required'
                    ? 'bg-amber-100 text-amber-900'
                    : routeDecision.requiresEVC
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {routeDecision.eligibilityStatus === 'INELIGIBLE'
                    ? 'NOT APPLICABLE (REGISTRATION BLOCKED)'
                    : routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required'
                    ? 'PENDING POLICY DETERMINATION'
                    : routeDecision.requiresEVC ? 'MANDATORY (§2.4)' : 'WAIVED (§2.6(c)(1))'}
                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-slate-500">Fast-Track Eligibility:</span>

                <span className={`font-bold ${
                  routeDecision.eligibilityStatus === 'INELIGIBLE'
                    ? 'text-rose-700'
                    : routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required'
                    ? 'text-amber-700'
                    : routeDecision.fastTrackEligible ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  {routeDecision.eligibilityStatus === 'INELIGIBLE'
                    ? 'INELIGIBLE'
                    : routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required'
                    ? 'SUSPENDED (HELD FOR REVIEW)'
                    : routeDecision.fastTrackEligible ? 'YES (ACCELERATED)' : 'STANDARD ROUTE'}
                </span>

              </div>

            </div>



            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">

              <span className="font-bold text-slate-900 block text-xs tracking-wide uppercase">Mandatory Stages Spine</span>

              <div className="flex flex-wrap gap-1.5 pt-1">

                {routeDecision.stages?.map((stage: string, idx: number) => {
                  const isRejectStage = stage.includes('rejected') || stage.includes('ineligible');
                  const isReviewStage = stage.includes('review');
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                        isRejectStage
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                          : isReviewStage
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {idx + 1}. {formatStageDisplayName(stage)}
                    </span>
                  );
                })}

              </div>

              {routeDecision.skippedStages?.length > 0 && routeDecision.eligibilityStatus !== 'INELIGIBLE' && (

                <div className="pt-2 border-t border-slate-200">

                  <span className="text-slate-500 block text-[11px] font-medium mb-1.5">

                    Statutorily Waived / Skipped Stages:

                  </span>

                  <div className="space-y-1.5">

                    {routeDecision.skippedStages.map((sk: any, i: number) => {

                      const stageName = typeof sk === 'object' ? (sk.stage || 'evc') : sk;

                      const reason = typeof sk === 'object' ? sk.reason : '';

                      const ruleId = typeof sk === 'object' ? sk.ruleId : '';

                      const sourceLocator = typeof sk === 'object' ? sk.sourceLocator : '';

                      return (

                        <div

                          key={i}

                          className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs"

                        >

                          <span className="line-through text-slate-400 font-mono font-bold text-[11px]">

                            {formatStageDisplayName(String(stageName))}

                          </span>

                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-mono font-bold px-1.5 py-0.5 rounded">

                            {ruleId || 'EXEMPT'}

                          </span>

                          {sourceLocator && (

                            <span className="text-[10px] text-emerald-700 font-semibold">

                              {sourceLocator}

                            </span>

                          )}

                          {reason && (

                            <span className="text-[11px] text-slate-600 truncate max-w-[280px]">

                              &mdash; {reason}

                            </span>

                          )}

                        </div>

                      );

                    })}

                  </div>

                </div>

              )}

            </div>

          </div>



          {/* Regulatory Citations */}

          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2 text-xs">

            <span className="font-bold text-purple-900 block">Primary Source Traceability &amp; Statutory Justifications:</span>

            <ul className="space-y-1 text-purple-900 list-disc list-inside">

              {routeDecision.reasons?.map((r: string, idx: number) => (

                <li key={idx} className="leading-relaxed">{r}</li>

              ))}

            </ul>

            {routeDecision.sourceLocators?.length > 0 && (

              <div className="pt-2 border-t border-purple-200/80 text-[11px] text-purple-950 font-mono">

                <strong>Source Locators: </strong>

                {routeDecision.sourceLocators.map((sl: any, i: number) => (

                  <span key={i} className="mr-3 font-semibold">

                    [{sl.clause} - {sl.document} {sl.page ? `(p. ${sl.page})` : ''}]

                  </span>

                ))}

              </div>

            )}

          </div>



          {/* Institution Legal Name Validation Alert in Step 4 */}
          {institutionNameError && selectedPresetId === 'custom' && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between gap-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span className="font-semibold">{institutionNameError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(3);
                  setErrorMsg(institutionNameError);
                }}
                className="text-xs font-bold text-rose-700 underline hover:text-rose-900 shrink-0 cursor-pointer"
              >
                ← Return to Step 3 to Enter Legal Name
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">

            <button

              onClick={() => {

                setCurrentStep(3);

                setErrorMsg(null);

                setSuccessMsg(null);

              }}

              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                routeDecision.eligibilityStatus === 'INELIGIBLE'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}

            >

              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{routeDecision.eligibilityStatus === 'INELIGIBLE' ? '← Edit Application Facts to Cure Deficiencies' : 'Edit Application Facts'}</span>

            </button>

            {routeDecision.eligibilityStatus === 'INELIGIBLE' ? (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-2 border border-rose-300 cursor-not-allowed opacity-90 shadow-xs"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Submission Blocked: Ineligible under AICTE Norms</span>
              </button>
            ) : (routeDecision.eligibilityStatus === 'POLICY_REVIEW_REQUIRED' || routeDecision.result === 'review_required') ? (
              <button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting for Policy Review…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for Policy Review / Council Determination</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting to AICTE Portal…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application to AICTE (Autonomous Regional Hand-Off)</span>
                  </>
                )}
              </button>
            )}

          </div>

        </div>

      )}



      {/* STEP 5: Successfully Submitted & Statutory Intake Confirmation */}
      {currentStep === 5 && submittedApp && (
        <div className="bg-white rounded-xl border border-emerald-300 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Application Successfully Submitted to AICTE Portal
              </h3>
              <p className="text-xs text-slate-500">
                Single-Window NSWS intake verified &amp; immutable regulatory snapshot pinned
              </p>
            </div>
          </div>

          {isDuplicateSubmission && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-amber-950">
                  Application Already Ingested via NSWS (Idempotent Record Retrieved)
                </div>
                <p className="text-amber-800 leading-relaxed">
                  This application has already been submitted to the AICTE Portal and safely persisted in the database. Exactly one persistent application record (<code>{submittedApp.id || submittedApp.reference}</code>) exists. No duplicate records or redundant intake audits were generated.
                </p>
              </div>
            </div>
          )}

          {/* Complete Submission Confirmation Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Application Reference Number (PID):</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">{submittedApp.reference || submittedApp.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Institution Name:</span>
                <span className="font-bold text-slate-800 text-right max-w-[220px] truncate">{institutionName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Academic Year:</span>
                <span className="font-mono bg-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-bold text-[11px]">AY 2026–27</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Application Category:</span>
                <span className="font-mono text-slate-700 capitalize font-medium">{CATEGORY_LABELS[category] || category.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Submission Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Submitted / Scrutiny Pending
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Calculated Route &amp; Stages:</span>
                <span className="font-bold text-blue-900 text-right max-w-[220px] truncate">
                  {formatRouteTypeName(routeDecision?.route || '') || activePreset.expectedRoute}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Pinned Handbook Version:</span>
                <span className="font-mono font-bold text-slate-800">APH-2024-27-V2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Submission Timestamp:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            The application has successfully traversed the National Single Window System (NSWS) intake adapter and entered the AICTE regional queue. An immutable policy snapshot has been pinned under <code>APH-2024-27-V2</code>. You can now authenticate into the Institution Signatory Portal to monitor real-time review progress.
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
            {isUnauthenticatedFlow ? (
              <>
                <button
                  type="button"
                  disabled={signingIn}
                  onClick={async () => {
                    setSigningIn(true);
                    try {
                      if (onContinueToInstitutionPortal) {
                        await onContinueToInstitutionPortal(selectedPresetId, email, submittedApp?.institutionId);
                      }
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {signingIn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating Institution Session…</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Continue to Institution Portal &amp; Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenInstitutionModal) onOpenInstitutionModal();
                    else setShowInstPicker(true);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sign In as Another Seeded Institution</span>
                </button>
              </>
            ) : (
              onSelectApplication && (
                <button
                  type="button"
                  onClick={() => onSelectApplication(submittedApp.id)}
                  className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Open Case Dossier (Direct Hand-off: {submittedApp.id})</span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Another NSWS Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* Institution Picker Modal for Quick Sign-In */}
      {showInstPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Sign In to Existing Technical Institution
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Select one of the 5 seeded technical institutions to immediately access its Applicant Workspace:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pt-1">
              {[
                { id: 'coep', name: 'COEP Technological University', code: '1-435789102', region: 'Western', email: 'principal@coep.ac.in' },
                { id: 'giits', name: 'GIITS Tech Sciences', code: '1-462589176', region: 'South-Central', email: 'principal@giits.ac.in' },
                { id: 'pdimtr', name: 'PDIMTR Management', code: '1-109704178', region: 'Western', email: 'principal@pdimtr.ac.in' },
                { id: 'apex', name: 'Apex Polytechnic Institute', code: '1-331049280', region: 'Northern', email: 'principal@apex.ac.in' },
                { id: 'batu', name: 'Dr. BATU Tech University', code: '1-192014810', region: 'Western', email: 'principal@batu.ac.in' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  disabled={signingIn}
                  onClick={async () => {
                    setSigningIn(true);
                    try {
                      if (onContinueToInstitutionPortal) {
                        await onContinueToInstitutionPortal(p.id, p.email, p.code);
                      }
                    } finally {
                      setSigningIn(false);
                      setShowInstPicker(false);
                    }
                  }}
                  className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900 line-clamp-1">
                      {p.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      PID: {p.code}
                    </div>
                    <div className="text-[10px] text-blue-600 mt-0.5 truncate">
                      {p.email}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-blue-700">
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};