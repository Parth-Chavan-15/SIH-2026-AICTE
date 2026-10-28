import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getSession } from '../../services/session';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Key,
  Layers,
  ExternalLink,
  RefreshCw,
  Eye,
  Award,
  Clock,
  Info
} from 'lucide-react';

export const GeneratedDocumentsView: React.FC = () => {
  const { applications } = useApp();
  const session = getSession();
  const actor = session?.actor;
  const isInstitution = Boolean(
    actor?.roles?.includes('institution') || actor?.id?.startsWith('usr-inst-')
  );
  const canGenerate = Boolean(actor?.permissions?.includes('decision.record'));

  // Target application identification for institution scoping
  const targetAppId = isInstitution
    ? (actor?.id === 'usr-inst-coep' || (actor as any)?.email === 'principal@coep.ac.in') ? 'APP-2026-COEP'
      : (actor?.id === 'usr-inst-giits' || (actor as any)?.email === 'principal@giits.ac.in') ? 'APP-2026-GIITS'
      : (actor?.id === 'usr-inst-pdimtr' || (actor as any)?.email === 'principal@pdimtr.ac.in') ? 'APP-2026-PDIMTR'
      : (actor?.id === 'usr-inst-apex' || (actor as any)?.email === 'principal@apex.ac.in') ? 'APP-2026-APEX'
      : (actor?.id === 'usr-inst-batu' || (actor as any)?.email === 'principal@batu.ac.in') ? 'APP-2026-BATU'
      : (actor?.institutionIds?.[0] ? applications.find(a => a.institutionCode === actor.institutionIds[0] || a.id === actor.institutionIds[0])?.id : null) || applications[0]?.id
    : null;

  const [selectedCaseId, setSelectedCaseId] = useState<string>(targetAppId || '');
  const [documentType, setDocumentType] = useState<string>('EOA');
  const [docsList, setDocsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const activeApp = applications.find((a) => a.id === selectedCaseId) || applications[0];

  const fetchDocs = async () => {
    try {
      const res = await api.getGeneratedDecisionDocs();
      setDocsList(res.data?.documents || []);
      if (!selectedCaseId && applications.length > 0) {
        setSelectedCaseId(targetAppId || applications[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load decision documents:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [targetAppId]);

  const handleGenerate = async () => {
    if (!activeApp) return;
    setLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);
    try {
      const res = await api.generateDecisionDoc(activeApp.id, documentType);
      setSuccessMsg(
        `Successfully generated and digitally signed ${documentType} letter for ${activeApp.institutionName}!`
      );
      await fetchDocs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Document generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (caseId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.verifyDocSignature(caseId);
      setVerificationResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Signature verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents: institutions only see their own official orders
  const displayedDocs = isInstitution && targetAppId
    ? docsList.filter((doc) => doc.caseId === targetAppId || (doc.institutionName && activeApp && doc.institutionName.toLowerCase().includes(activeApp.institutionName.toLowerCase().split(' ')[0])))
    : docsList;

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider text-amber-900">
            Official Decision Letters &amp; Prototype Digital Signature Verification
          </p>
          <p className="mt-1 text-amber-800">
            Per deliverable specifications, generated PDFs are rendered per-case using <code>pdf-lib</code> and signed with an automated Non-Production Test Certificate. Every document bears the mandatory prominent notice: <strong>DEMO DIGITAL SIGNATURE — NOT AN OFFICIAL AICTE SIGNATURE / NOT AN OFFICIAL ORDER</strong>. Official government seals and live production CA keys are strictly excluded.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Generator Controls - Visible ONLY to authorized Council / Bureau decision makers */}
      {canGenerate && !isInstitution && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Generate Institute-Specific Decision Document</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              pdf-lib &bull; SHA-256 Digest
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Target Application</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.id} &bull; {app.institutionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="EOA">Extension of Approval (EoA) / Approval Order</option>
                <option value="LOA">Letter of Approval (LoA) - New Institution</option>
                <option value="LOD">Letter of Deficiency (LoD) - Shortcomings Noted</option>
                <option value="LOR">Letter of Rejection (LoR) - Non-Compliance Order</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate &amp; Digitally Sign PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional View Header - For Applicants / Institutions */}
      {isInstitution && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-base">
              My Official AICTE Decision Orders &amp; Dispatched Letters
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Institutional repository of formal decision letters (EoA, LoA, LoD, LoR) dispatched by AICTE Competent Authority for Academic Year 2026–27. Each document is cryptographically verified against server integrity digests.
          </p>
        </div>
      )}

      {/* Generated Documents Catalog */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {isInstitution ? 'Dispatched Decision Documents' : 'Generated Decision Letters Repository'}
          </h3>
          <button
            onClick={fetchDocs}
            className="text-xs text-blue-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {displayedDocs && displayedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDocs.map((doc) => {
              const downloadUrl = api.getDocDownloadUrl(doc.caseId, doc.documentType);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {doc.documentType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{doc.dispatchNumber}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{doc.institutionName}</h4>
                    <div className="text-xs text-slate-500 font-mono">
                      <span>Case: <strong>{doc.caseId}</strong></span> &bull;{' '}
                      <span>AY: <strong>{doc.academicYear}</strong></span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Signer:</span>
                        <span className="font-semibold text-slate-800">{doc.signerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Signature Status:</span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {doc.signatureStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SHA-256 Digest:</span>
                        <span className="font-mono text-slate-600 text-[10px] truncate max-w-[180px]">
                          {doc.documentDigest}
                        </span>
                      </div>
                    </div>

                    {doc.orderConditions?.length > 0 && (
                      <div className="text-[11px] text-slate-600">
                        <strong className="block text-slate-700 mb-1">Represented Undertakings / Conditions:</strong>
                        <ul className="list-disc list-inside space-y-0.5">
                          {doc.orderConditions.map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleVerify(doc.caseId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Verify Signature</span>
                    </button>

                    <a
                      href={downloadUrl}
                      download={`AICTE_${doc.documentType}_${doc.caseId}.pdf`}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isInstitution ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Official Decision Order Pending AICTE Council Dispatch</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The Competent Authority (AICTE Council / Executive Committee) has not yet dispatched a final decision order for your application ({targetAppId || activeApp?.id}: {activeApp?.institutionName}). Formal decision letters (EoA, LoA, LoD, or LoR) with digital integrity seals are generated and released strictly following Executive Committee evaluation per APH Chapter I/II regulations.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">
              <span>Current Application Status:</span>
              <strong className="text-slate-800">{activeApp?.currentStage || 'Active Review'}</strong>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
            No decision documents generated yet. Use the controls above to render the first decision letter.
          </div>
        )}
      </div>

      {/* Verification Result Modal */}
      {verificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Digital Signature Verification Report</h3>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-800 font-semibold">Verification Status:</span>
                <span className="font-mono font-bold text-emerald-950">
                  {verificationResult.valid ? 'VALID_DEMO_SIGNATURE' : 'SIGNING_NOT_CONFIGURED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-semibold">Signer Common Name:</span>
                <span className="font-mono text-emerald-950">{verificationResult.signer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-semibold">Issuer CA:</span>
                <span className="font-mono text-emerald-950">{verificationResult.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-semibold">Algorithm:</span>
                <span className="font-mono text-emerald-950">{verificationResult.algorithm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-semibold">Digest:</span>
                <span className="font-mono text-emerald-950 text-[10px] truncate max-w-[220px]">
                  {verificationResult.digest}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong className="block text-slate-800 mb-1">Notice:</strong>
              {verificationResult.notice}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVerificationResult(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
