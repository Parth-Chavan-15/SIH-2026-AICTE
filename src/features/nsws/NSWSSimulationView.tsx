import React, { useState } from 'react';
import { api } from '../../services/api';
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
  RotateCcw
} from 'lucide-react';

interface NSWSSimulationViewProps {
  onSelectApplication?: (id: string) => void;
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
  category: 'increase_intake' | 'new_institution' | 'extension_of_approval' | 'closure';
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
    regulatoryCite: 'APH 2024-27 §2.6(c)(1) / Table 2.3 Row 3: Physical EVC waived for Tier-1 NBA Score ≥ 650'
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
    regulatoryCite: 'Table 2.3 Row 4 & §2.4: Substantial intake increase without NBA accreditation mandates full EVC'
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
    regulatoryCite: 'APH §2.3.2 & Table 2.3 Row 1: Zero-deficiency recurring renewal waives pre-approval scrutiny and EVC'
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
    regulatoryCite: 'APH Chapter I §1.3–§1.8: New institution establishment mandates dual scrutiny and physical verification'
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
    regulatoryCite: 'APH Chapter II §2.18: Progressive course closure or intake reduction processed through desk SAC scrutiny'
  }
];

export const NSWSSimulationView: React.FC<NSWSSimulationViewProps> = ({ onSelectApplication }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('coep');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states initialized with COEP preset
  const [pan, setPan] = useState('AAACB1234F');
  const [signatoryName, setSignatoryName] = useState('Dr. Anand Deshpande');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('principal@coep.ac.in');
  const [otp, setOtp] = useState('123456');
  const [onboardResult, setOnboardResult] = useState<any>(null);

  // DSC state
  const [tokenType, setTokenType] = useState<string>('ePass2003Auto');
  const [dscVerified, setDscVerified] = useState<boolean>(false);

  // AICTE Form State
  const [institutionName, setInstitutionName] = useState('College of Engineering Pune (COEP Tech Univ)');
  const [category, setCategory] = useState<'increase_intake' | 'new_institution' | 'extension_of_approval' | 'closure'>('increase_intake');
  const [program, setProgram] = useState('Engineering and Technology');
  const [level, setLevel] = useState('Under Graduate');
  const [existingIntake, setExistingIntake] = useState(120);
  const [proposedIntake, setProposedIntake] = useState(180);
  const [nbaAccredited, setNbaAccredited] = useState(true);
  const [nbaScore, setNbaScore] = useState(680);
  const [region, setRegion] = useState('Western');
  const [builtUpAreaSqM, setBuiltUpAreaSqM] = useState(14500);

  // Route evaluation and final submission result
  const [routeDecision, setRouteDecision] = useState<any>(null);
  const [submittedApp, setSubmittedApp] = useState<any>(null);

  // Apply canonical preset
  const applyPreset = (preset: CollegePreset) => {
    setSelectedPresetId(preset.id);
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
    setErrorMsg(null);
    setSuccessMsg(`Preset applied: ${preset.shortName}. Configured for ${preset.expectedRoute}.`);
  };

  const activePreset = CANONICAL_PRESETS.find(p => p.id === selectedPresetId) || CANONICAL_PRESETS[0];

  // Step 1: Onboard
  const handleOnboard = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.onboardNSWS({
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
        `NSWS-DSC-${Date.now()}`,
        tokenType !== 'UnsignedDocument',
        tokenType,
        signatoryName
      );
      const data = (res as any)?.data ?? res;
      if (data?.verified) {
        setDscVerified(true);
        setCurrentStep(3);
        setSuccessMsg('Class-3 Cryptographic USB Token DSC validated via emBridge gateway (Simulated)');
      } else {
        setErrorMsg('DSC signature verification rejected by gateway');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'DSC Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> 4: Dynamic Route Pre-evaluation
  const handleEvaluateRoute = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const facts = {
        category,
        institutionType: 'existing',
        program,
        level,
        proposedIntake,
        existingIntake,
        nbaAccredited,
        nbaScore,
        builtUpAreaSqM,
        region
      };
      const res = await api.evaluateNSWSRoute(facts);
      const data = (res as any)?.data ?? res;
      setRouteDecision(data?.routeDecision ?? data);
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Route evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> 5: Submit application
  const handleSubmitApplication = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        nswsReference: onboardResult?.nswsReference || `NSWS-2026-${Date.now()}`,
        institutionName,
        institutionId: `INST-${selectedPresetId.toUpperCase()}-${region.substring(0, 3).toUpperCase()}`,
        regionId: region,
        category,
        session: '2026-2027',
        pan,
        signatoryName,
        dscTokenSerial: 'EP2003-8841-A99B',
        facts: {
          category,
          program,
          level,
          existingIntake,
          proposedIntake,
          nbaAccredited,
          nbaScore,
          builtUpAreaSqM,
          region
        }
      };
      const res = await api.submitNSWSApplication(payload);
      const data = (res as any)?.data ?? res;
      setSubmittedApp(data?.application ?? data);
      setCurrentStep(5);
      setSuccessMsg('Application submitted to AICTE Portal and persisted successfully with dynamic route snapshot!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSubmittedApp(null);
    setRouteDecision(null);
    setDscVerified(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
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
            { step: 5, label: '5. Persisted Submission', desc: 'Dossier Hand-Off' },
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

      {/* Mutual Exclusion Error / Success Feedback */}
      {errorMsg && !successMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && !errorMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5">
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
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold">SIMULATION</span>
            </div>
            <span className="text-xs text-slate-500">APH §1.3.1 &amp; §1.4.1</span>
          </div>

          {/* Quick Canonical Benchmark Presets */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick-Select Canonical Benchmark College:
              </span>
              <span className="text-[10px] text-slate-500">Click to instantly populate realistic regulatory data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {CANONICAL_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block truncate">{p.shortName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium inline-block mt-1 border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Active Preset Regulatory Info */}
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2">
              <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Active Benchmark:</strong> {activePreset.name} &mdash; <em>Expected: {activePreset.expectedRoute}</em>
                <p className="text-[10px] text-blue-800/90 mt-0.5">{activePreset.regulatoryCite}</p>
              </div>
            </div>
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
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-semibold">CCA INDIA GATEWAY</span>
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
              onChange={(e: any) => setTokenType(e.target.value)}
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

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setCurrentStep(1);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Back to Identity
            </button>
            <button
              onClick={handleVerifyDSC}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify DSC Token via emBridge Gateway</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AICTE Application Form */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">AICTE Portal Application Form Simulation</h3>
            </div>
            <span className="text-xs text-slate-500">AY 2026-27 Intake Norms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Legal Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Category</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs"
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
              >
                <option value="increase_intake">Increase in Intake in Existing Program (Table 2.3)</option>
                <option value="new_institution">Setting up New Technical Institution (Chapter I)</option>
                <option value="extension_of_approval">Extension of Approval (EoA Regular / Self-Disclosure)</option>
                <option value="closure">Closure of Program / Institution (Chapter II §2.18)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Program</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">AICTE Region</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="Western">Western Regional Office (Mumbai)</option>
                <option value="South-Central">South-Central Regional Office (Hyderabad)</option>
                <option value="North-Western">North-Western Regional Office (Chandigarh)</option>
                <option value="Southern">Southern Regional Office (Chennai)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Existing Approved Intake (Seats)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white"
                value={existingIntake}
                onChange={(e) => setExistingIntake(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Intake (Seats)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white"
                value={proposedIntake}
                onChange={(e) => setProposedIntake(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={nbaAccredited}
                  onChange={(e) => setNbaAccredited(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700 text-xs">NBA Accredited Course (Score ≥ 650 for Fast-Track)</span>
              </label>
            </div>

            {nbaAccredited && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NBA Score (Out of 1000 - APH Threshold ≥ 650)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white"
                  value={nbaScore}
                  onChange={(e) => setNbaScore(Number(e.target.value))}
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Built-up Area (Sq. Meters)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white"
                value={builtUpAreaSqM}
                onChange={(e) => setBuiltUpAreaSqM(Number(e.target.value))}
              />
            </div>
          </div>

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
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-semibold">APH 2024–27 TABLE 2.3</span>
            </div>
            <span className="text-xs font-mono text-purple-800 font-semibold">{routeDecision.policyVersion}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-900 block text-xs tracking-wide uppercase">Evaluated Route Profile</span>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Route Type:</span>
                <span className="font-bold text-blue-700 text-xs">{routeDecision.routeType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Physical EVC Inspection:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  routeDecision.requiresEVC
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {routeDecision.requiresEVC ? 'MANDATORY (§2.4)' : 'WAIVED (§2.6(c)(1))'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Fast-Track Eligibility:</span>
                <span className={`font-bold ${routeDecision.fastTrackEligible ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {routeDecision.fastTrackEligible ? 'YES (ACCELERATED)' : 'STANDARD ROUTE'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-900 block text-xs tracking-wide uppercase">Mandatory Stages Spine</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {routeDecision.stages?.map((stage: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-semibold text-[11px]">
                    {idx + 1}. {stage.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              {routeDecision.skippedStages?.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Skipped Stages (By Statutory Rule):</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {routeDecision.skippedStages.map((sk: string, i: number) => (
                      <span key={i} className="line-through text-slate-400 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
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

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setCurrentStep(3);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Edit Application Facts
            </button>
            <button
              onClick={handleSubmitApplication}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit &amp; Hand-Off to Regional Office Desk</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Successfully Submitted & Direct Dossier Hand-off */}
      {currentStep === 5 && submittedApp && (
        <div className="bg-white rounded-xl border border-emerald-300 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Application Ingested &amp; Persisted Successfully</h3>
              <p className="text-xs text-slate-500">Immutable dynamic route snapshot pinned to case file</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-emerald-800 font-semibold">Persisted Application ID:</span>
              <span className="font-mono font-bold text-emerald-950 text-sm">{submittedApp.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-800 font-semibold">Permanent Institution Reference (PID):</span>
              <span className="font-mono text-emerald-950 font-bold">{submittedApp.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-800 font-semibold">Intake Channel:</span>
              <span className="font-mono bg-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-bold text-[11px]">
                {submittedApp.facts?.intakeChannel || 'NSWS_SIMULATION'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-800 font-semibold">Assigned Initial State:</span>
              <span className="font-mono text-emerald-950 uppercase font-bold">{submittedApp.state}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            The application has entered the active AICTE regional queue. The dynamic route snapshot has been pinned immutable to policy version <code>{submittedApp.policyRevisionId || 'aph-2024-2027-v1'}</code>. You can now immediately inspect the live Case Dossier with its tailored lifecycle progress and role-specific action console.
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            {onSelectApplication && (
              <button
                type="button"
                onClick={() => onSelectApplication(submittedApp.id)}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span>Open Case Dossier (Direct Hand-off: {submittedApp.id})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Another NSWS Simulation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
