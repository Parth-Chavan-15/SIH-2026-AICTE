import React, { useState, useMemo } from 'react';
import { getSession } from '../../services/session';
import { useApp } from '../../context/AppContext';
import { ExpiringDocument } from '../../types';
import {
  FileWarning,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Calendar,
  X,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const DocumentExpiryView: React.FC = () => {
  const {
    role,
    user,
    expiringDocs,
    submitDocumentRenewal,
    verifyDocumentRenewal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Renewal upload modal state
  const [renewalTarget, setRenewalTarget] = useState<ExpiringDocument | null>(null);
  const [renewalFileName, setRenewalFileName] = useState('');

  const session = getSession();
  const actor = session?.actor;
  const isInstitution = role === 'institution';

  const scopedDocs = useMemo(() => {
    if (!isInstitution) return expiringDocs;
    return expiringDocs.filter((doc) => {
      const actorId = actor?.id || '';
      const email = (actor as any)?.email || '';
      if (actorId === 'usr-inst-apex' || email === 'principal@apex.ac.in') {
        return doc.institutionName.includes('APEX') || doc.institutionName.includes('Apex') || doc.institutionCode === 'INST-APEX';
      }
      if (actorId === 'usr-inst-batu' || email === 'principal@batu.ac.in') {
        return doc.institutionName.includes('BATU') || doc.institutionCode === 'INST-BATU';
      }
      if (actorId === 'usr-inst-pdimtr' || email === 'principal@pdimtr.ac.in') {
        return doc.institutionName.includes('PDIMTR') || doc.institutionName.includes('Prerna');
      }
      if (actorId === 'usr-inst-coep' || email === 'principal@coep.ac.in') {
        return doc.institutionName.includes('COEP') || doc.institutionName.includes('PDIMTR');
      }
      if (actorId === 'usr-inst-giits' || email === 'principal@giits.ac.in') {
        return doc.institutionName.includes('GIITS') || doc.institutionName.includes('Gonna');
      }
      
      return true;
    });
  }, [expiringDocs, isInstitution, actor]);

  const filteredDocs = scopedDocs.filter((doc) => {
    const matchesSearch =
      doc.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doc.renewalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRenewalSubmit = async () => {
    if (!renewalTarget || !renewalFileName.trim()) return;
    await submitDocumentRenewal(renewalTarget.id, renewalFileName);
    setRenewalTarget(null);
    setRenewalFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Mandatory Document Expiry & Land Lease Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated advance warning alert engine for Fire NOC, Structural Soundness, and 30-Year Land Leases
          </p>
        </div>

        {/* Expiry summary cards */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Expired: {expiringDocs.filter((d) => d.renewalStatus === 'Expired').length}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Expiring &le; 30d: {expiringDocs.filter((d) => d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 30).length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Institution, Document Type (Lease, Fire, Building), or Registration Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
        >
          <option value="All">All Renewal Statuses</option>
          <option value="Expired">Expired</option>
          <option value="Expiring Soon">Expiring Soon</option>
          <option value="Renewal Submitted">Renewal Submitted (Review Pending)</option>
          <option value="Renewal Verified">Renewal Verified</option>
          <option value="Valid">Valid</option>
        </select>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Prescribed Document</th>
                <th className="py-3 px-4">Issue & Expiry Dates</th>
                <th className="py-3 px-4">Time Until Expiry</th>
                <th className="py-3 px-4">Renewal Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{doc.institutionName}</p>
                    <span className="font-mono text-[10px] text-slate-400">
                      Code: {doc.institutionCode} &bull; {doc.region} Region
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{doc.documentType}</p>
                    <span className="font-mono text-[10px] text-slate-500">
                      Reg: {doc.documentNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="space-y-0.5">
                      <p>Issued: <span className="font-medium text-slate-800">{doc.issuedDate}</span></p>
                      <p>Expiry: <strong className="text-slate-900">{doc.expiryDate}</strong></p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {doc.daysUntilExpiry < 0 ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Expired {Math.abs(doc.daysUntilExpiry)} days ago
                      </span>
                    ) : (
                      <span
                        className={`font-bold px-2 py-0.5 rounded border ${
                          doc.daysUntilExpiry <= 30
                            ? 'text-amber-800 bg-amber-50 border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {doc.daysUntilExpiry} days left
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                        doc.renewalStatus === 'Renewal Verified'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : doc.renewalStatus === 'Expired'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : doc.renewalStatus === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      {doc.renewalStatus}
                    </span>
                    {doc.renewalDocumentName && (
                      <span className="block text-[10px] text-slate-500 font-mono mt-1 truncate max-w-[150px]">
                        {doc.renewalDocumentName}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    {/* Institution upload renewal */}
                    {doc.renewalStatus !== 'Renewal Verified' && (
                      <button
                        onClick={() => {
                          setRenewalTarget(doc);
                          setRenewalFileName(`Renewed_${doc.documentType.replace(/\s+/g, '_')}_2027.pdf`);
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200"
                      >
                        Upload Renewal
                      </button>
                    )}

                    {/* Officer verify renewal */}
                    {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') &&
                      doc.renewalStatus === 'Renewal Submitted' && (
                        <button
                          onClick={() => verifyDocumentRenewal(doc.id)}
                          className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs"
                        >
                          Verify Renewal
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Renewal Modal */}
      {renewalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload Renewed Regulatory Document</h3>
              <button onClick={() => setRenewalTarget(null)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{renewalTarget.documentType}</p>
                <p className="text-slate-500 text-xs">{renewalTarget.institutionName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Current Expiry Date: <strong>{renewalTarget.expiryDate}</strong>
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Renewed Document Filename (PDF)
                </label>
                <input
                  type="text"
                  value={renewalFileName}
                  onChange={(e) => setRenewalFileName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                Upon upload, the Regional Officer will receive an automated task notice to inspect the renewal certificate.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setRenewalTarget(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRenewalSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Submit Renewed Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
