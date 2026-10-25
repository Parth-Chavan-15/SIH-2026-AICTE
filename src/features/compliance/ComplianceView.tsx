import React, { useState, useMemo } from 'react';
import { getSession } from '../../services/session';
import { useApp } from '../../context/AppContext';
import { ComplianceUndertaking } from '../../types';
import { formatDateIndian } from '../../utils/slaCalculator';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  FileCheck2,
  AlertCircle,
  X,
  Search,
  Building,
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const {
    role,
    user,
    complianceItems,
    submitComplianceEvidence,
    verifyCompliance,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Upload modal state
  const [uploadTarget, setUploadTarget] = useState<ComplianceUndertaking | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState('');

  // Verification modal state
  const [verifyTarget, setVerifyTarget] = useState<ComplianceUndertaking | null>(null);
  const [verifyDecision, setVerifyDecision] = useState<'Verified' | 'Rejected'>('Verified');
  const [verifyRemarks, setVerifyRemarks] = useState('');

  const session = getSession();
  const actor = session?.actor;
  const isInstitution = role === 'institution';

  const scopedItems = useMemo(() => {
    if (!isInstitution) return complianceItems;
    return complianceItems.filter((item) => {
      const actorId = actor?.id || '';
      const email = (actor as any)?.email || '';
      if (actorId === 'usr-inst-apex' || email === 'principal@apex.ac.in') {
        return item.institutionName.includes('APEX') || item.institutionName.includes('Apex') || item.applicationId.includes('APEX');
      }
      if (actorId === 'usr-inst-batu' || email === 'principal@batu.ac.in') {
        return item.institutionName.includes('BATU') || item.applicationId.includes('BATU');
      }
      if (actorId === 'usr-inst-pdimtr' || email === 'principal@pdimtr.ac.in') {
        return item.institutionName.includes('PDIMTR') || item.institutionName.includes('Prerna');
      }
      if (actorId === 'usr-inst-coep' || email === 'principal@coep.ac.in') {
        return item.institutionName.includes('COEP') || item.institutionName.includes('PDIMTR');
      }
      if (actorId === 'usr-inst-giits' || email === 'principal@giits.ac.in') {
        return item.institutionName.includes('GIITS') || item.institutionName.includes('Gonna');
      }
      if (actorId === 'usr-inst-evit' || email === 'principal@evit.ac.in') {
        return item.institutionName.includes('EVIT') || item.institutionName.includes('East Valley');
      }
      if (actorId === 'usr-inst-vjti' || email === 'principal@vjti.ac.in') {
        return item.institutionName.includes('VJTI');
      }
      return true;
    });
  }, [complianceItems, isInstitution, actor]);

  const filteredItems = scopedItems.filter((item) => {
    const matchesSearch =
      item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.conditionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUploadSubmit = async () => {
    if (!uploadTarget || !evidenceFileName.trim()) return;
    await submitComplianceEvidence(uploadTarget.id, evidenceFileName);
    setUploadTarget(null);
    setEvidenceFileName('');
  };

  const handleVerificationSubmit = async () => {
    if (!verifyTarget || !verifyRemarks.trim()) return;
    await verifyCompliance(verifyTarget.id, verifyDecision, verifyRemarks);
    setVerifyTarget(null);
    setVerifyRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Compliance & Undertaking Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracking post-approval affidavits, cadre ratios, safety provisions, and PwD accessibility norms
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search undertakings by institution, condition title, or application number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Pending Evidence">Pending Evidence</option>
          <option value="Submitted">Submitted (Review Pending)</option>
          <option value="Under Review">Under Review</option>
          <option value="Verified">Verified Compliant</option>
          <option value="Overdue">Overdue Filings</option>
        </select>
      </div>

      {/* Compliance Undertakings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Institution & Case ID</th>
                <th className="py-3 px-4">Regulatory Condition</th>
                <th className="py-3 px-4">Due Date & SLA</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4">Officer Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{item.institutionName}</p>
                    <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      {item.applicationNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-[280px]">
                    <p className="font-bold text-slate-800">{item.conditionTitle}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{item.dueDate}</span>
                    <span
                      className={`block text-[10px] font-semibold mt-1 ${
                        item.isOverdue
                          ? 'text-rose-600'
                          : item.isApproaching
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {item.isOverdue
                        ? `Overdue (${Math.abs(item.daysRemaining)}d)`
                        : `${item.daysRemaining} days remaining`}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                        item.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : item.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : item.status === 'Submitted'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.evidenceDocumentName && (
                      <span className="block text-[11px] text-slate-600 font-mono mt-1 truncate max-w-[150px]">
                        {item.evidenceDocumentName}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-[200px]">
                    {item.reviewerRemarks ? (
                      <p className="text-[11px] italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        &ldquo;{item.reviewerRemarks}&rdquo;
                      </p>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Pending verification</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    {/* Upload evidence for institution */}
                    {item.status !== 'Verified' && (
                      <button
                        onClick={() => {
                          setUploadTarget(item);
                          setEvidenceFileName(`${item.conditionTitle.replace(/\s+/g, '_')}_Proof.pdf`);
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200"
                      >
                        Upload Proof
                      </button>
                    )}

                    {/* Officer verify button */}
                    {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') &&
                      item.status !== 'Verified' && (
                        <button
                          onClick={() => {
                            setVerifyTarget(item);
                            setVerifyRemarks('All stipulated norms and photographic proof verified.');
                          }}
                          className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs"
                        >
                          Review & Verify
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {uploadTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload Compliance Evidence Document</h3>
              <button onClick={() => setUploadTarget(null)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{uploadTarget.conditionTitle}</p>
                <p className="text-slate-500 text-xs mt-0.5">{uploadTarget.institutionName}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Evidence Document File Name / Reference
                </label>
                <input
                  type="text"
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-blue-900 text-[11px] border border-blue-200">
                Uploaded document will be encrypted and stamped with a cryptographic SHA-256 fingerprint in the permanent audit trail.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setUploadTarget(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Compliance Modal */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Official Regulatory Verification</h3>
              <button onClick={() => setVerifyTarget(null)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{verifyTarget.conditionTitle}</p>
                <p className="text-slate-500 text-xs">{verifyTarget.institutionName}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Verification Decision</label>
                <select
                  value={verifyDecision}
                  onChange={(e) => setVerifyDecision(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                >
                  <option value="Verified">Verified Compliant (Approve)</option>
                  <option value="Rejected">Deficient / Rejected (Requires Resubmission)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mandatory Reviewer Remarks & Regulatory Observation
                </label>
                <textarea
                  rows={3}
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  placeholder="Mandatory findings..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setVerifyTarget(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerificationSubmit}
                className={`px-4 py-2 font-bold text-xs rounded-lg text-white shadow-xs ${
                  verifyDecision === 'Verified'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {verifyDecision}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
