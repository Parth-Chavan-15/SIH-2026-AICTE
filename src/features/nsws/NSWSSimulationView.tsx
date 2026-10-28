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
  Layers,
  FileCheck,
  Send,
  HelpCircle,
  ExternalLink,
  Cpu
} from 'lucide-react';

export const NSWSSimulationView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [pan, setPan] = useState('AAACB1234F');
  const [signatoryName, setSignatoryName] = useState('Dr. Anand Deshpande');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('principal@coep.ac.in');
  const [otp, setOtp] = useState('123456');
  const [onboardResult, setOnboardResult] = useState<any>(null);

  // DSC state
  const [tokenType, setTokenType] = useState<'ePass2003Auto' | 'mToken' | 'CryptoSoftToken'>('ePass2003Auto');
  const [dscVerified, setDscVerified] = useState<boolean>(false);

  // AICTE Form State
  const [institutionName, setInstitutionName] = useState('College of Engineering Pune');
  const [category, setCategory] = useState<'increase_intake' | 'new_institution' | 'extension_of_approval' | 'closure'>('increase_intake');
  const [program, setProgram] = useState('Engineering and Technology');
  const [level, setLevel] = useState('Under Graduate');
  const [existingIntake, setExistingIntake] = useState(300);
  const [proposedIntake, setProposedIntake] = useState(360);
  const [nbaAccredited, setNbaAccredited] = useState(true);
  const [nbaScore, setNbaScore] = useState(680);
  const [region, setRegion] = useState('Western');
  const [builtUpAreaSqM, setBuiltUpAreaSqM] = useState(12500);

  // Route evaluation and final submission result
  const [routeDecision, setRouteDecision] = useState<any>(null);
  const [submittedApp, setSubmittedApp] = useState<any>(null);

  // Step 1: Onboard
  const handleOnboard = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.onboardNSWS({
        pan,
        signatoryName,
        mobile,
        email,
        simulatedOtp: otp
      });
      setOnboardResult(res.data);
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
    try {
      const res = await api.verifyDSC(
        `NSWS-DSC-${Date.now()}`,
        true,
        tokenType,
        signatoryName
      );
      if (res.data?.verified) {
        setDscVerified(true);
        setCurrentStep(3);
        setSuccessMsg('Class-3 Cryptographic USB Token DSC validated via emBridge gateway (Simulated)');
      } else {
        setErrorMsg('DSC verification failed');
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
      setRouteDecision(res.data?.routeDecision);
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
    try {
      const payload = {
        nswsReference: onboardResult?.nswsReference || `NSWS-2026-${Date.now()}`,
        institutionName,
        institutionId: 'INST-COEP-PUNE',
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
      setSubmittedApp(res.data?.application);
      setCurrentStep(5);
      setSuccessMsg('Application submitted to AICTE Portal and persisted successfully with dynamic route snapshot!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider text-amber-800">
            Mandatory Disclosure: Interactive NSWS to AICTE Portal Simulation
          </p>
          <p className="mt-1 text-amber-700">
            This module simulates single-window onboarding at the National Single Window System (NSWS) and subsequent cryptographic handoff to the AICTE portal. No live government APIs are called. All PAN validations, emBridge DSC verifications, and OTP checks are real client-server prototype simulations.
          </p>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, label: '1. NSWS Onboarding', desc: 'PAN & OTP Check' },
            { step: 2, label: '2. DSC Verification', desc: 'emBridge USB Token' },
            { step: 3, label: '3. AICTE Application', desc: 'Program & Intake Norms' },
            { step: 4, label: '4. Dynamic Route Check', desc: 'APH Table 2.3 Evaluator' },
            { step: 5, label: '5. Persisted Submission', desc: 'RO Hand-off & Spine' },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === s.step
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                  : currentStep > s.step
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="font-semibold">{s.label}</div>
              <div className="text-[10px] opacity-75">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP 1: NSWS Onboarding */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">NSWS Single-Window Registration</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">SIMULATION</span>
          </div>

          <p className="text-xs text-slate-500">
            Per APH §1.3.1 &amp; §1.4.1, technical institutions register via the National Single Window System with PAN-verified institutional KYC.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Entity / Trust PAN (Format: 5 letters, 4 digits, 1 letter)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg font-mono uppercase bg-slate-50 focus:bg-white"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="AAACB1234F"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Mobile Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Simulated OTP (Auto-filled: 123456)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg font-mono bg-slate-50 focus:bg-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleOnboard}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2"
            >
              <span>Verify KYC &amp; Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: emBridge DSC Token Verification */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">emBridge / Class-3 DSC Token Verification</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">CCA INDIA SIMULATION</span>
          </div>

          <p className="text-xs text-slate-500">
            APH §1.4.3 &amp; §2.3.4(a) mandate Class-3 Cryptographic Digital Signature for institutional submissions.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">NSWS Application Ref:</span>
              <span className="font-mono font-bold text-slate-800">{onboardResult?.nswsReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Verified Signatory:</span>
              <span className="font-semibold text-slate-800">{signatoryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entity PAN:</span>
              <span className="font-mono font-bold text-slate-800">{pan}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block font-semibold text-slate-700">Cryptographic USB Token / Soft Token Gateway</label>
            <select
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white"
              value={tokenType}
              onChange={(e: any) => setTokenType(e.target.value)}
            >
              <option value="ePass2003Auto">ePass2003Auto USB Cryptographic Token (Class-3)</option>
              <option value="mToken">mToken Crypto Identity USB Token</option>
              <option value="CryptoSoftToken">NIC / eMudhra PKI Software Token</option>
            </select>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-3 py-2 rounded-lg border text-slate-600 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleVerifyDSC}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify DSC Token via emBridge Gateway</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AICTE Application Form */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">AICTE Portal Application Form Simulation</h3>
          </div>

          <p className="text-xs text-slate-500">
            Provide institutional details, proposed category, intake norms, and accreditation facts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Category</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
              >
                <option value="increase_intake">Increase in Intake in Existing Program (Table 2.3)</option>
                <option value="new_institution">Setting up New Technical Institution (Chapter I)</option>
                <option value="extension_of_approval">Extension of Approval (EoA Regular)</option>
                <option value="closure">Closure of Program / Institution</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Program</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">AICTE Region</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
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
              <label className="block font-semibold text-slate-700 mb-1">Existing Approved Intake</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg font-mono"
                value={existingIntake}
                onChange={(e) => setExistingIntake(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Intake</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg font-mono"
                value={proposedIntake}
                onChange={(e) => setProposedIntake(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nbaAccredited}
                  onChange={(e) => setNbaAccredited(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-700">NBA Accredited Course (Score ≥ 650)</span>
              </label>
            </div>

            {nbaAccredited && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NBA Score (Out of 1000)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  value={nbaScore}
                  onChange={(e) => setNbaScore(Number(e.target.value))}
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Built-up Area (Sq. Meters)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg font-mono"
                value={builtUpAreaSqM}
                onChange={(e) => setBuiltUpAreaSqM(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-3 py-2 rounded-lg border text-slate-600 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleEvaluateRoute}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Evaluate Route with APH Engine</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Dynamic Route Engine Result */}
      {currentStep === 4 && routeDecision && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-base">Dynamic Route Decision &amp; Explanations</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">APH 2024–27 &amp; G02</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Evaluated Route Profile</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Route Type:</span>
                <span className="font-bold text-blue-700">{routeDecision.routeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requires EVC Inspection:</span>
                <span className={`font-bold ${routeDecision.requiresEVC ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {routeDecision.requiresEVC ? 'YES' : 'NO (BYPASSED)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fast-Track Eligible:</span>
                <span className="font-bold">{routeDecision.fastTrackEligible ? 'YES' : 'NO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Policy Version Pinned:</span>
                <span className="font-mono text-purple-700 font-bold">{routeDecision.policyVersion}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Mandatory Stages Spine</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {routeDecision.stages?.map((stage: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-medium text-[11px]">
                    {idx + 1}. {stage.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              {routeDecision.skippedStages?.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 block">Skipped Stages (By Rule):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {routeDecision.skippedStages.map((sk: string, i: number) => (
                      <span key={i} className="line-through text-slate-400 font-mono text-[10px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Regulatory Citations */}
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2 text-xs">
            <span className="font-bold text-purple-900 block">Primary Source Traceability &amp; Justifications:</span>
            <ul className="space-y-1 text-purple-800 list-disc list-inside">
              {routeDecision.reasons?.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
            <div className="pt-2 border-t border-purple-200 text-[11px] text-purple-900 font-mono">
              <strong>Source Locators: </strong>
              {routeDecision.sourceLocators?.map((sl: any, i: number) => (
                <span key={i} className="mr-3">
                  [{sl.clause} - {sl.document} {sl.page ? `(p. ${sl.page})` : ''}]
                </span>
              ))}
            </div>
          </div>

          {routeDecision.unresolvedFlags?.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 text-xs">
              <span className="font-bold">Unresolved Regulatory Items Held for Verification:</span>
              <ul className="mt-1 list-disc list-inside">
                {routeDecision.unresolvedFlags.map((flag: string, i: number) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-3 py-2 rounded-lg border text-slate-600 text-xs font-semibold"
            >
              Edit Application Facts
            </button>
            <button
              onClick={handleSubmitApplication}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit &amp; Hand-Off to Regional Office Desk</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Successfully Submitted */}
      {currentStep === 5 && submittedApp && (
        <div className="bg-white rounded-xl border border-emerald-300 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-lg">Application Ingested &amp; Persisted Successfully</h3>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Persisted Application ID:</span>
              <span className="font-mono font-bold text-emerald-950 text-sm">{submittedApp.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Permanent Institution Reference (PID):</span>
              <span className="font-mono text-emerald-950">{submittedApp.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Intake Channel:</span>
              <span className="font-mono bg-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-bold">
                {submittedApp.facts?.intakeChannel || 'NSWS_SIMULATION'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 font-semibold">Assigned Initial State:</span>
              <span className="font-mono text-emerald-950 uppercase font-bold">{submittedApp.state}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            The application has entered the active AICTE regional queue. The dynamic route snapshot has been pinned immutable to version <code>{submittedApp.policyRevisionId}</code>. Regional officers can now review the application at the Operations Desk.
          </p>

          <div className="pt-3">
            <button
              onClick={() => {
                setCurrentStep(1);
                setSubmittedApp(null);
                setRouteDecision(null);
              }}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs"
            >
              Start Another NSWS Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
