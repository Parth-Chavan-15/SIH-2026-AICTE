import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationType, WorkflowRouteType } from '../../types';
import {
  X,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Send,
  Save,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface NewApplicationModalProps {
  onClose: () => void;
  onSuccess: (appId: string) => void;
}

interface ValidationErrors {
  institutionName?: string;
  institutionCode?: string;
  proposedIntake?: string;
  declarationChecked?: string;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { user, createApplication } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<{
    institutionName: string;
    institutionCode: string;
    region: 'Northern' | 'Western' | 'Southern' | 'Eastern' | 'South-Western' | 'Central' | 'North-West' | 'South-Central';
    state: string;
    city: string;
    applicationType: ApplicationType;
    academicYear: string;
    program: 'Engineering & Technology' | 'Management' | 'Pharmacy' | 'Architecture' | 'Applied Arts';
    proposedIntake: number;
    routeType: WorkflowRouteType;
    declarationChecked: boolean;
  }>({
    institutionName: user.organization || 'College of Engineering Pune (COEP Tech)',
    institutionCode: '1-1049281',
    region: 'Western',
    state: 'Maharashtra',
    city: 'Pune',
    applicationType: 'Extension of Approval (EoA)' as ApplicationType,
    academicYear: '2027-28',
    program: 'Engineering & Technology',
    proposedIntake: 720,
    routeType: 'Scrutiny Only' as WorkflowRouteType,
    declarationChecked: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    id: string;
    applicationNumber: string;
    isDraft: boolean;
  } | null>(null);

  // Validation function per GOV.UK pattern
  const validateStep = (currentStep: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (currentStep === 1) {
      if (!formData.institutionName.trim()) {
        newErrors.institutionName = 'Enter the full legal entity name of the institution';
      }
      if (!formData.institutionCode.trim()) {
        newErrors.institutionCode = 'Enter the AICTE Permanent Institute ID';
      }
    }

    if (currentStep === 2) {
      if (!formData.proposedIntake || formData.proposedIntake <= 0) {
        newErrors.proposedIntake = 'Proposed intake must be at least 1 student seat';
      } else if (formData.proposedIntake > 3000) {
        newErrors.proposedIntake = 'Intake cannot exceed 3,000 seats per regulatory handbook ceiling';
      }
    }

    if (currentStep === 3) {
      if (!formData.declarationChecked) {
        newErrors.declarationChecked = 'You must accept the statutory declaration before submitting';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setErrors({});
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createApplication({
        institutionName: formData.institutionName,
        institutionCode: formData.institutionCode,
        region: formData.region,
        state: formData.state,
        city: formData.city,
        applicationType: formData.applicationType,
        academicYear: formData.academicYear,
        program: formData.program,
        proposedIntake: formData.proposedIntake,
        routeType: formData.routeType,
        currentStage: isDraft ? 'Draft' : 'Application Submitted',
      });

      // Show GOV.UK style confirmation panel
      setSubmittedResult({
        id: created.id,
        applicationNumber: created.applicationNumber,
        isDraft,
      });
    } catch (e) {
      console.error(e);
      setErrors({ institutionName: 'An unexpected error occurred while saving the application.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // CONFIRMATION SCREEN (GOV.UK Confirmation Pattern)
  // -------------------------------------------------------------
  if (submittedResult) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Green Confirmation Banner */}
          <div className="bg-[#00703c] text-white p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-200" />
            <h2 className="text-2xl font-bold tracking-tight">
              {submittedResult.isDraft ? 'Application Draft Saved' : 'Application Submitted Successfully'}
            </h2>
            <p className="text-emerald-100 text-xs mt-2">
              Your submission reference number:
            </p>
            <p className="font-mono text-xl sm:text-2xl font-bold mt-1 tracking-wider bg-[#005a30] inline-block px-4 py-1.5 rounded-lg border border-emerald-400/30">
              {submittedResult.applicationNumber}
            </p>
          </div>

          {/* What happens next (GOV.UK Standard Section) */}
          <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">What happens next</h3>
              <p className="text-slate-600 leading-relaxed">
                {submittedResult.isDraft
                  ? 'Your draft application is saved locally. You can edit and file it for formal scrutiny anytime from the Applications list.'
                  : 'We have initiated the official workflow clock and registered your statutory submission with the Regional Office.'}
              </p>
            </div>

            {!submittedResult.isDraft && (
              <div className="space-y-3 border-l-2 border-emerald-600 pl-4 py-1">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">1. Regional Office Scrutiny (7 Working Days)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Your assigned officer at Western Regional Office (WRO) will verify land, faculty cadre, and safety certificates against APH 2026-27 norms.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">2. Deficiency Notification (If Any)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    If discrepancies are observed, an official observation will be issued with a 10-day rectification window before EVC escalation.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">3. Digital Audit Signature</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    All stage updates are recorded with a tamper-resistant SHA-256 state digest in the application ledger.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Need to make corrections?</p>
              <p className="text-[11px]">
                You can review or attach additional certified documents directly in the Case Dossier evidence tab before scrutiny commencement.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  onSuccess(submittedResult.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Case Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MULTI-STEP INTAKE FORM
  // -------------------------------------------------------------
  const errorCount = Object.keys(errors).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#183B56] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                AICTE Regulatory Approval Application
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Approval Process Cycle 2027-28 &bull; Applicant Intake Wizard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header (GOV.UK Style Task Guidance) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              Step {step} of 3:
            </span>
            <span className="text-slate-600">
              {step === 1 && 'Institution & Category'}
              {step === 2 && 'Program & Workflow Route'}
              {step === 3 && 'Statutory Declarations & Filing'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            All fields are mandatory unless marked optional
          </span>
        </div>

        {/* Form Body with Scroll */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-slate-800">

          {/* GOV.UK ERROR SUMMARY COMPONENT */}
          {errorCount > 0 && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 border-2 border-[#d4351c] text-slate-900 space-y-2 animate-in fade-in"
            >
              <div className="flex items-center gap-2 text-[#d4351c] font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h4>There is a problem</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#d4351c] pl-1 font-medium">
                {errors.institutionName && <li>{errors.institutionName}</li>}
                {errors.institutionCode && <li>{errors.institutionCode}</li>}
                {errors.proposedIntake && <li>{errors.proposedIntake}</li>}
                {errors.declarationChecked && <li>{errors.declarationChecked}</li>}
              </ul>
            </div>
          )}

          {/* STEP 1: INSTITUTION & CATEGORY */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block text-xs mb-1">
                  Institution Legal Entity Name <span className="text-rose-600">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  As registered in university affiliation records and trust / society deed.
                </p>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.institutionName ? 'border-[#d4351c] bg-rose-50/50' : 'border-slate-300'
                  }`}
                  placeholder="e.g. College of Engineering Pune (COEP Tech)"
                />
                {errors.institutionName && (
                  <p className="text-[#d4351c] text-[11px] font-semibold mt-1">
                    {errors.institutionName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block text-xs mb-1">
                    AICTE Permanent Institute ID <span className="text-rose-600">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">Format: 1-XXXXXXXXX</p>
                  <input
                    type="text"
                    value={formData.institutionCode}
                    onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.institutionCode ? 'border-[#d4351c] bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {errors.institutionCode && (
                    <p className="text-[#d4351c] text-[11px] font-semibold mt-1">
                      {errors.institutionCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-xs mb-1">
                    Regional Office Jurisdiction <span className="text-rose-600">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">Governing AICTE Regional Bureau</p>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Western">Western Regional Office (Mumbai)</option>
                    <option value="Northern">Northern Regional Office (Kanpur)</option>
                    <option value="Southern">Southern Regional Office (Chennai)</option>
                    <option value="Eastern">Eastern Regional Office (Kolkata)</option>
                    <option value="South-Western">South-Western Office (Bangalore)</option>
                    <option value="Central">Central Regional Office (Bhopal)</option>
                    <option value="North-West">North-West Regional Office (Chandigarh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block text-xs mb-1">
                  Application Category <span className="text-rose-600">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Select the statutory approval request as defined in Approval Process Handbook Chapter II.
                </p>
                <select
                  value={formData.applicationType}
                  onChange={(e) =>
                    setFormData({ ...formData, applicationType: e.target.value as ApplicationType })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                  <option value="New Technical Institution">New Technical Institution</option>
                  <option value="Increase in Intake / Additional Course">Increase in Intake / Additional Course</option>
                  <option value="Closure of Course / Institution">Closure of Course / Institution</option>
                  <option value="Conversion to Co-Education">Conversion to Co-Education</option>
                  <option value="Change of Site / Location">Change of Site / Location</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: PROGRAM & WORKFLOW ROUTE */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block text-xs mb-1">
                    Program Domain / Faculty <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management">Management (MBA/PGDM)</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Applied Arts">Applied Arts & Crafts</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-xs mb-1">
                    Proposed Sanctioned Intake <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.proposedIntake}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedIntake: Number(e.target.value) })
                    }
                    className={`w-full p-2.5 rounded-lg border text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.proposedIntake ? 'border-[#d4351c] bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {errors.proposedIntake && (
                    <p className="text-[#d4351c] text-[11px] font-semibold mt-1">
                      {errors.proposedIntake}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block text-xs mb-1">
                  Procedural Workflow Route
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select the required evaluation pipeline. The policy engine will cross-verify route eligibility.
                </p>

                <div className="space-y-2">
                  {[
                    {
                      route: 'Scrutiny Only' as WorkflowRouteType,
                      title: 'Route 1: Scrutiny Only (Desk Verification)',
                      desc: 'Document verification by Regional Scrutiny Officer for existing compliant institutions. Standard 7-day SLA.',
                    },
                    {
                      route: 'Scrutiny + EVC' as WorkflowRouteType,
                      title: 'Route 2: Scrutiny + EVC Inspection Panel',
                      desc: 'Requires physical inspection by Expert Visit Committee for capacity increase or infrastructure compliance check.',
                    },
                    {
                      route: 'Fast-Track EoA' as WorkflowRouteType,
                      title: 'Route 3: Fast-Track EoA with Self-Disclosure',
                      desc: 'Accelerated desk clearance for institutions holding NAAC A++ or NIRF Top-100 standing.',
                    },
                  ].map((r) => (
                    <label
                      key={r.route}
                      className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.routeType === r.route
                          ? 'bg-blue-50/70 border-blue-600 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="routeType"
                          value={r.route}
                          checked={formData.routeType === r.route}
                          onChange={() => setFormData({ ...formData, routeType: r.route })}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{r.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STATUTORY DECLARATIONS & FILE-UPLOAD GUIDANCE */}
          {step === 3 && (
            <div className="space-y-5">
              {/* GOV.UK WARNING TEXT COMPONENT */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  !
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-900">
                    Statutory Warning (AICTE Regulations 2026, Section 10-K):
                  </p>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Submission of fabricated land records, non-existent faculty profiles, or forged municipal stability certificates will result in immediate rejection, forfeiture of processing fees, and de-registration.
                  </p>
                </div>
              </div>

              {/* GOV.UK FILE UPLOAD GUIDANCE COMPONENT */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-xs">
                    Mandatory Evidence Attachment Guidance
                  </h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                  <li>Attach clear digital scans of original registered documents (PDF format only).</li>
                  <li>Maximum file size limit: 10MB per document.</li>
                  <li>Every upload must bear digital signatures or seal of the Principal / Chairman.</li>
                </ul>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Pre-attached bundle: Affidavit Form 16 &bull; Land Title &bull; Building Stability</span>
                  <span className="font-mono text-emerald-700 font-semibold">Ready</span>
                </div>
              </div>

              {/* STATUTORY DECLARATION CHECKBOX */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declarationChecked}
                    onChange={(e) => setFormData({ ...formData, declarationChecked: e.target.checked })}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">
                      Solemn Undertaking & Declaration <span className="text-rose-600">*</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      I hereby certify that all facilities, faculty cadre ratios, and land documents specified in this application strictly conform to AICTE Approval Process Handbook (APH 2026-27).
                    </p>
                  </div>
                </label>
                {errors.declarationChecked && (
                  <p className="text-[#d4351c] text-[11px] font-semibold mt-2 pl-7">
                    {errors.declarationChecked}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => {
                  setErrors({});
                  setStep((s) => (s - 1) as 1 | 2 | 3);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#00703c] hover:bg-[#005a30] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
