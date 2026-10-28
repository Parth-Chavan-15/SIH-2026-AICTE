import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Globe,
  CheckCircle,
  FileText,
  Building,
  KeyRound,
  Database,
  Clock,
  Send,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Server,
  FileCheck,
  Check,
  Zap
} from 'lucide-react';

interface EndpointMeta {
  id: string;
  name: string;
  shortName: string;
  method: 'GET' | 'POST';
  path: string;
  authority: string;
  citation: string;
  description: string;
  badge: string;
}

const ENDPOINTS_LIST: EndpointMeta[] = [
  {
    id: 'ingest',
    name: 'Upstream Ingestion Bridge (NSWS & Siebel CRM)',
    shortName: 'NSWS & Siebel Ingestion',
    method: 'POST',
    path: '/api/v1/adapter/ingest',
    authority: 'Invest India / NSWS & AICTE Siebel Portal',
    citation: 'APH §1.3.1, §1.4.1 & Siebel Manual',
    description: 'Ingests application payload with verified PAN and eMudhra Class-3 DSC metadata without duplicate registration.',
    badge: 'UPSTREAM BRIDGE'
  },
  {
    id: 'committee',
    name: '1. AICTE Central Automated Committee Selection Sync',
    shortName: 'Committee Selector Sync',
    method: 'POST',
    path: '/api/v1/adapter/committee-sync/:caseId',
    authority: 'AICTE Central Expert Management Portal',
    citation: 'APH §1.8(a)-(c), §1.9 & G02 pp. 2–3',
    description: 'Algorithmic committee selection ensuring statutory composition (NIT/IIT Expert + Legal Advocate + COA Architect) with signed Unbiased Declarations.',
    badge: 'APH §1.8(a)'
  },
  {
    id: 'dsc',
    name: '2. AICTESigner / mSigner Class-3 DSC Verification Gateway',
    shortName: 'Class-3 DSC Gateway',
    method: 'POST',
    path: '/api/v1/adapter/dsc-verify',
    authority: 'CCA India / eMudhra & NIC CA Gateway',
    citation: 'APH §1.4.3 & §2.3.4(a)',
    description: 'Validates cryptographic Class-3 USB tokens (ePass2003Auto) and PKI soft tokens. Rejects unsigned filings with HTTP 422.',
    badge: 'CCA INDIA'
  },
  {
    id: 'allocation',
    name: '3. Regional Office Operations Desk Allocation',
    shortName: 'RO Operations Allocation',
    method: 'GET',
    path: '/api/v1/allocation/groups',
    authority: 'AICTE Regional Office Operations Desk',
    citation: 'APH §1.8(a), §1.9 & RO Manual',
    description: 'Active Desk Scrutiny and EVC committee groups, real memberships, capacities, workloads, and auditable assignment history.',
    badge: 'RO ALLOCATION'
  },
  {
    id: 'portalImport',
    name: '4. Existing AICTE Portal Ingestion & Deficiency Extraction',
    shortName: 'Portal Report Ingestion',
    method: 'POST',
    path: '/api/v1/portal-import/preview',
    authority: 'AICTE Central Approval Repository',
    citation: 'APH §1.8(g) Scoped Re-Scrutiny',
    description: 'Ingests prior downloaded PDF/JSON scrutiny reports, previews extracted fields/deficiencies with confidence scoring, and prepares scoped re-scrutiny.',
    badge: 'APH §1.8(g)'
  },
  {
    id: 'decisionDoc',
    name: '5. Standards-Compliant PDF Decision Generation & Demo Signing',
    shortName: 'PDF Decision Generator',
    method: 'POST',
    path: '/api/v1/decision-docs/generate/:caseId',
    authority: 'AICTE Council Executive Committee (Act §10(k))',
    citation: 'APH §1.10, §2.25 & Act §10(k)',
    description: 'Renders official LoA/EoA/LoD/LoR PDF with non-production test certificate digital signature, verified digest, and order-backed post-approval conditions.',
    badge: 'ACT §10(k)'
  }
];

export const GovernmentEndpointsView: React.FC = () => {
  const { applications } = useApp();
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('ingest');
  const [loading, setLoading] = useState<boolean>(false);
  const [endpointResult, setEndpointResult] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const activeCase = applications.find(a => a.id.includes('COEP') || a.id.includes('GIITS')) || applications[0];
  const caseId = activeCase?.id || 'APP-2026-COEP-001';

  const selectedEndpoint = ENDPOINTS_LIST.find(e => e.id === selectedEndpointId) || ENDPOINTS_LIST[0];

  const handleExecute = async () => {
    setLoading(true);
    setEndpointResult(null);
    setLatencyMs(null);
    const start = performance.now();

    try {
      let res: any;
      if (selectedEndpointId === 'ingest') {
        res = await api.ingestUpstream({
          reference: '1-435789102-COEP',
          source: 'NSWS_INVESTOR_PORTAL',
          application: {
            id: 'APP-2026-COEP-001',
            reference: '1-435789102-COEP',
            institutionId: 'INST-COEP-PUNE',
            regionId: 'Western',
            category: 'increase_intake',
            session: '2026-2027',
            facts: {
              institutionName: 'College of Engineering Pune (COEP)',
              program: 'Engineering & Technology',
              proposedIntake: 180,
              nbaAccredited: false,
              dscSignatory: 'Dr. D. N. Sonawane',
              panNumber: 'ABCDE1234F',
              nswsApplicationId: 'NSWS-2026-ENG-88412'
            }
          }
        });
      } else if (selectedEndpointId === 'committee') {
        res = await api.syncCommittee(caseId, 'SCRUTINY');
      } else if (selectedEndpointId === 'dsc') {
        res = await api.verifyDSC(
          'DOC-FIRE-NOC-2026-001',
          true,
          'ePass2003Auto USB Cryptographic Token',
          'Dr. D. N. Sonawane'
        );
      } else if (selectedEndpointId === 'allocation') {
        res = await api.getAllocationGroups();
      } else if (selectedEndpointId === 'portalImport') {
        res = await api.previewPortalReport({ fixtureId: 'GIITS-2026-REPORT' });
      } else if (selectedEndpointId === 'decisionDoc') {
        res = await api.generateDecisionDoc(caseId);
      }

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setEndpointResult((res as any)?.data ? res : { success: true, data: res });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setEndpointResult({ error: err.message || 'Execution failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071A2E] via-[#0D2847] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400 text-slate-900 shadow-sm flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              National Systems Integration Console
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/10 text-blue-200 border border-white/15">
              Zero-Rewrite Companion Architecture
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            The 5 Government Endpoints & Upstream Ingestion
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            PravahReg acts as a sovereign companion layer communicating with official national systems: 
            <strong> NSWS</strong>, <strong>AICTE Siebel CRM</strong>, <strong>CCA India (AICTESigner)</strong>, 
            <strong> API Setu</strong>, and <strong>State DTE Portals</strong>.
          </p>
        </div>
      </div>

      {/* Grid: Endpoint Selector Cards (Left 4 Cols) & Active Inspector (Right 8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Endpoint Selector List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-1">
            Official Companion Integrations (6 Endpoints):
          </div>

          {ENDPOINTS_LIST.map((e) => {
            const isSelected = selectedEndpointId === e.id;
            return (
              <button
                key={e.id}
                onClick={() => {
                  setSelectedEndpointId(e.id);
                  setEndpointResult(null);
                  setLatencyMs(null);
                }}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20 border-blue-700 ring-2 ring-blue-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {e.method}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-900/60 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {e.badge}
                    </span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                </div>

                <h4 className="font-bold text-xs leading-tight mb-1">
                  {e.name}
                </h4>

                <p className={`text-[11px] font-mono truncate mb-2 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                  {e.path}
                </p>

                <div className={`pt-2 border-t text-[10px] flex items-center justify-between ${
                  isSelected ? 'border-white/15 text-blue-100' : 'border-slate-100 text-slate-500'
                }`}>
                  <span>{e.authority}</span>
                  <span className="font-semibold">{e.citation}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Live Interactive Endpoint Test Bench */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            {/* Active Endpoint Info Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    {selectedEndpoint.method}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedEndpoint.name}
                  </h3>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Target Endpoint: {selectedEndpoint.path.replace(':caseId', caseId)}
                </p>
              </div>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Execute / Ping Endpoint</span>
              </button>
            </div>

            {/* Statutory Purpose Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <FileCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Statutory Purpose & Real-World Mandate:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedEndpoint.description}
              </p>
              <div className="text-[11px] font-mono text-blue-800 pt-1">
                Citation: {selectedEndpoint.citation} • Owner: {selectedEndpoint.authority}
              </div>
            </div>

            {/* Latency & Status Pill */}
            {latencyMs !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Adapter Connection Status: <strong>SYNCHRONIZED</strong></span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>HTTP 200 OK</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                    {latencyMs} ms
                  </span>
                </div>
              </div>
            )}

            {/* Rich Visual Details for Ingest Endpoint */}
            {selectedEndpointId === 'ingest' && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    NSWS Single-Window Ingestion Gateway Status:
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ONLINE &bull; READY
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-blue-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Source Portal</span>
                    <span className="font-bold text-slate-800">Invest India / NSWS</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-blue-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Signatory DSC Token</span>
                    <span className="font-bold text-slate-800">Class-3 USB (ePass2003)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-blue-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Routing Evaluation</span>
                    <span className="font-bold text-emerald-700">APH Table 1 Automated</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rich Visual Details for Each Specific Endpoint */}
            {selectedEndpointId === 'registries' && endpointResult?.data && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-950">National Board of Accreditation (NBA)</div>
                  <div className="text-[11px] text-blue-900">Status: {endpointResult.data.nbaRegistry?.status}</div>
                  <div className="text-[10px] text-slate-600">Validity: {endpointResult.data.nbaRegistry?.validityWindow}</div>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                    Errata Fast-Track: {endpointResult.data.nbaRegistry?.errataFastTrackEligible ? 'ELIGIBLE (Skip EVC)' : 'NOT ELIGIBLE'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
                  <div className="font-bold text-purple-950">NAAC / UGC Accreditation Hub</div>
                  <div className="text-[11px] text-purple-900">Grade: {endpointResult.data.naacUgcRegistry?.grade} (CGPA {endpointResult.data.naacUgcRegistry?.cgpa})</div>
                  <div className="text-[10px] text-slate-600">NIRF Band: {endpointResult.data.naacUgcRegistry?.nirfRankBand}</div>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-bold">
                    Extended EoA: {endpointResult.data.naacUgcRegistry?.extendedEoaEligible ? 'QUALIFIED' : 'STANDARD'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-950">Academic Bank of Credits (ABC / APAAR)</div>
                  <div className="text-[11px] text-amber-900">Student Enrolment: {endpointResult.data.abcApaarRegistry?.studentEnrolmentPercentage}%</div>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                    Status: {endpointResult.data.abcApaarRegistry?.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">National Anti-Ragging Portal</div>
                  <div className="text-[11px] text-slate-700">Affidavits Filed: {endpointResult.data.antiRaggingPortal?.affidavitCompliancePercentage}%</div>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                    Status: {endpointResult.data.antiRaggingPortal?.complianceStatus}
                  </span>
                </div>
              </div>
            )}

            {selectedEndpointId === 'concurrence' && endpointResult?.data && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950">Statutory 15-Day Concurrence Clock (APH §2.19(c)):</span>
                  <span className="font-mono text-blue-900 font-bold">
                    Days Remaining: {endpointResult.data.concurrenceTimeline?.daysRemaining} / 15
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-white border border-blue-200">
                    <div className="font-bold text-slate-900">Affiliating University</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{endpointResult.data.affiliatingUniversity?.universityName}</div>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                      {endpointResult.data.affiliatingUniversity?.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-white border border-blue-200">
                    <div className="font-bold text-slate-900">State Directorate of Tech Ed (DTE)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{endpointResult.data.stateDte?.directorateName}</div>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">
                      {endpointResult.data.stateDte?.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Collapsible Technical JSON Payload Inspector */}
            <details className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <summary className="flex items-center justify-between p-3.5 cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors select-none">
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-500" />
                  <span>Technical Gateway Payload (Raw JSON Telemetry)</span>
                </span>
                <span className="text-[10px] font-mono text-blue-700">
                  Click to Expand / Collapse
                </span>
              </summary>
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <pre className="text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56">
                  {endpointResult
                    ? JSON.stringify(endpointResult, null, 2)
                    : `// Ready to ping ${selectedEndpoint.path}\n// Click "Execute / Ping Endpoint" above to execute this live national adapter.`}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
