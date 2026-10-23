import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationType, WorkflowRouteType } from '../../types';
import { X, Building, Check, ArrowRight, Upload, FileText, Send, Save } from 'lucide-react';

interface NewApplicationModalProps {
  onClose: () => void;
  onSuccess: (appId: string) => void;
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (isDraft: boolean) => {
    setIsSubmitting(true);
    try {
      const created = await createApplication({
        ...formData,
        currentStage: isDraft ? 'Draft' : 'Application Submitted',
      });
      onSuccess(created.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">New AICTE Regulatory Application</h3>
              <p className="text-xs text-slate-300">Approval Process Cycle 2027-28 Filing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-semibold">
          <span className={step >= 1 ? 'text-blue-600' : 'text-slate-400'}>
            1. Institution & Type
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span className={step >= 2 ? 'text-blue-600' : 'text-slate-400'}>
            2. Program & Workflow Route
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span className={step >= 3 ? 'text-blue-600' : 'text-slate-400'}>
            3. Affidavits & Submission
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Institution Legal Entity Name
                </label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">AICTE Permanent ID</label>
                  <input
                    type="text"
                    value={formData.institutionCode}
                    onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Regional Jurisdiction</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Western">Western (Mumbai)</option>
                    <option value="Northern">Northern (Kanpur)</option>
                    <option value="Southern">Southern (Chennai)</option>
                    <option value="Eastern">Eastern (Kolkata)</option>
                    <option value="South-Western">South-Western (Bangalore)</option>
                    <option value="Central">Central (Bhopal)</option>
                    <option value="North-West">North-West (Chandigarh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Application Category</label>
                <select
                  value={formData.applicationType}
                  onChange={(e) =>
                    setFormData({ ...formData, applicationType: e.target.value as ApplicationType })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
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

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program / Faculty</label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management">Management (MBA/PGDM)</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Applied Arts">Applied Arts & Crafts</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proposed Intake (Seats)</label>
                  <input
                    type="number"
                    value={formData.proposedIntake}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedIntake: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Configurable Workflow Processing Route
                </label>
                <div className="space-y-2 mt-1">
                  {[
                    {
                      route: 'Scrutiny Only' as WorkflowRouteType,
                      title: 'Route 1: Scrutiny Only',
                      desc: 'Standard routine desk scrutiny by Regional Officer for compliant running institutions.',
                    },
                    {
                      route: 'Scrutiny + EVC' as WorkflowRouteType,
                      title: 'Route 2: Scrutiny + EVC Inspection',
                      desc: 'Requires physical or virtual Expert Visit Committee inspection for infrastructure verification.',
                    },
                    {
                      route: 'Fast-Track EoA' as WorkflowRouteType,
                      title: 'Route 3: Fast-Track EoA with Self-Disclosure',
                      desc: 'Automated rapid processing for accredited and high NIRF ranking technical colleges.',
                    },
                  ].map((r) => (
                    <label
                      key={r.route}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.routeType === r.route
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="routeType"
                          value={r.route}
                          checked={formData.routeType === r.route}
                          onChange={() => setFormData({ ...formData, routeType: r.route })}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{r.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900 text-xs">
                  Mandatory Undertakings Under Regulation 2026
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  I solemnly declare that our institution complies with land area, faculty cadre ratio, and infrastructure norms as stipulated in the AICTE Approval Process Handbook.
                </p>
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="font-bold text-slate-800 text-xs">
                  Default Document Package Pre-Attached
                </p>
                <p className="text-[11px] text-slate-500">
                  Affidavit Form 16, Land Deed, Fire NOC, and Building Stability certificates attached automatically.
                </p>
              </div>

              <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 space-y-1">
                <p><strong>Note:</strong> Once submitted, the application locks for official scrutiny.</p>
                <p>An audit log event with SHA-256 fingerprint will be recorded immediately.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold hover:bg-slate-50"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
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
