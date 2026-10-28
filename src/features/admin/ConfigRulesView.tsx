import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Edit2,
  Save,
  X,
  FileCheck,
  Globe2,
  Search,
  Cpu,
  BookOpen,
  GitCompare,
  Send,
  RefreshCw,
  HelpCircle,
  Layers
} from 'lucide-react';

export const ConfigRulesView: React.FC = () => {
  const { role, user, configRules, updateConfigRule } = useApp();
  const [activeTab, setActiveTab] = useState<'RULES_LIST' | 'SIMULATOR' | 'CONFLICTS' | 'SLA_CONFIG'>('RULES_LIST');

  // Rules Registry States
  const [rules, setRules] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [diffData, setDiffData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit/Revision Modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [revisedTitle, setRevisedTitle] = useState<string>('');
  const [revisedClause, setRevisedClause] = useState<string>('');
  const [revisedPage, setRevisedPage] = useState<number>(1);
  const [revisedSummary, setRevisedSummary] = useState<string>('');
  const [revisionReason, setRevisionReason] = useState<string>('Updated per official Gazette Corrigendum notification');

  // Simulator States
  const [simCategory, setSimCategory] = useState<string>('increase_intake');
  const [simProgram, setSimProgram] = useState<string>('Engineering and Technology');
  const [simLevel, setSimLevel] = useState<string>('Under Graduate');
  const [simProposedIntake, setSimProposedIntake] = useState<number>(360);
  const [simNbaAccredited, setSimNbaAccredited] = useState<boolean>(true);
  const [simNbaScore, setSimNbaScore] = useState<number>(680);
  const [simResult, setSimResult] = useState<any>(null);

  // SLA config states
  const [editingConfigRule, setEditingConfigRule] = useState<any>(null);
  const [newConfigValue, setNewConfigValue] = useState<any>('');

  const fetchRegistryData = async () => {
    try {
      const rulesRes = await api.getActiveRules();
      setRules(rulesRes.data?.rules || []);
      const conflictsRes = await api.getConflictRegister();
      setConflicts(conflictsRes.data?.conflicts || []);
    } catch (err: any) {
      console.error('Failed to load rules registry:', err);
    }
  };

  useEffect(() => {
    fetchRegistryData();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const facts = {
        category: simCategory,
        program: simProgram,
        level: simLevel,
        proposedIntake: simProposedIntake,
        nbaAccredited: simNbaAccredited,
        nbaScore: simNbaScore
      };
      const res = await api.simulateRoute(facts);
      setSimResult(res.data?.simulation);
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (rule: any) => {
    setSelectedRule(rule);
    setRevisedTitle(rule.title);
    setRevisedClause(rule.clause);
    setRevisedPage(rule.page);
    setRevisedSummary(rule.summary);
    setShowEditModal(true);
  };

  const handleSaveRevision = async () => {
    if (!selectedRule) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const draftRes = await api.createRuleRevision({
        ruleId: selectedRule.id,
        academicYear: selectedRule.academicYear,
        clause: revisedClause,
        page: revisedPage,
        title: revisedTitle,
        summary: revisedSummary,
        proposedBy: user?.id || 'usr-policy-admin'
      });
      const diffRes = await api.getRuleDiff(selectedRule.id, draftRes.data?.draft?.id);
      setDiffData(diffRes.data);
      setSuccessMsg('Draft rule revision created. Review diff and confirm publication.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Draft revision creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishRevision = async () => {
    if (!selectedRule) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.publishRuleRevision(selectedRule.id, {
        reason: revisionReason,
        approvedBy: user?.id || 'bureau.approval@aicte.gov.in'
      });
      setSuccessMsg(`Rule ${selectedRule.id} revision successfully published to active registry!`);
      setShowEditModal(false);
      setDiffData(null);
      await fetchRegistryData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Publish revision failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Active Rules &amp; Routing Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
              Role 6 Policy Admin Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Source-versioned regulatory rules, exact APH page/clause citations, versioned editor, before/after diffs, and conflict register
          </p>
        </div>

        <button
          onClick={fetchRegistryData}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Registry</span>
        </button>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('RULES_LIST')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'RULES_LIST'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Active Rules Registry ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'SIMULATOR'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Route Simulation &amp; Regression Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFLICTS')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'CONFLICTS'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Conflict Register ({conflicts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SLA_CONFIG')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'SLA_CONFIG'
              ? 'border-slate-800 text-slate-900 bg-slate-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Workflow SLA Parameters</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE RULES REGISTRY */}
      {activeTab === 'RULES_LIST' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rules by ID, clause, title, or regulatory keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-purple-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                      {rule.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rule.status === 'ACTIVE_VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rule.status === 'NEEDS_VERIFICATION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{rule.summary}</p>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document:</span>
                      <span className="font-semibold text-slate-800">{rule.document}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source Clause:</span>
                      <span className="font-mono text-purple-700 font-bold">{rule.clause}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Physical Page:</span>
                      <span className="font-mono text-slate-700">p. {rule.page}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Effective AY:</span>
                      <span className="font-mono text-slate-700">{rule.academicYear}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">v{rule.version || '1.0'}</span>
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Create Revision / Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ROUTE SIMULATION SANDBOX */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Simulate Route Decision</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="increase_intake">Increase in Intake</option>
                  <option value="new_institution">New Technical Institution</option>
                  <option value="extension_of_approval">Extension of Approval</option>
                  <option value="closure">Closure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program</label>
                <input
                  type="text"
                  value={simProgram}
                  onChange={(e) => setSimProgram(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Intake</label>
                <input
                  type="number"
                  value={simProposedIntake}
                  onChange={(e) => setSimProposedIntake(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NBA Score</label>
                <input
                  type="number"
                  value={simNbaScore}
                  onChange={(e) => setSimNbaScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simNbaAccredited}
                    onChange={(e) => setSimNbaAccredited(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Course is NBA Accredited</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Run Route Simulation</span>
            </button>
          </div>

          {/* Simulation Output */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Simulation Output</h3>

            {simResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-purple-800 font-semibold">Evaluated Route:</span>
                    <span className="font-bold text-purple-950">{simResult.routeDecision?.routeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800 font-semibold">Requires EVC:</span>
                    <span className="font-bold text-purple-950">
                      {simResult.routeDecision?.requiresEVC ? 'YES' : 'NO (BYPASSED)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800 font-semibold">Fast-Track Eligible:</span>
                    <span className="font-bold text-purple-950">
                      {simResult.routeDecision?.fastTrackEligible ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Applicable Stages Spine:</span>
                  <div className="flex flex-wrap gap-1">
                    {simResult.routeDecision?.stages?.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="font-bold text-slate-800 block">Matching Rule Citations:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {simResult.routeDecision?.reasons?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                Configure facts on the left and run simulation to preview route evaluation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONFLICT REGISTER */}
      {activeTab === 'CONFLICTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider text-amber-900">
                Statutory Conflict &amp; Unresolved Rule Hold Register
              </p>
              <p className="mt-1 text-amber-800">
                Where primary regulatory texts (APH 2024–27 vs Addendum 2026–27) contain contradictory thresholds or ambiguous drafting, the engine explicitly flags and holds automated decisions for policy review rather than silently guessing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {conf.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {conf.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{conf.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{conf.description}</p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="text-slate-500 font-medium">Contradictory Sources:</div>
                    <div className="font-mono text-slate-800 text-[11px]">{conf.sources?.join(' vs ')}</div>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                  <strong>Safe Path: </strong>
                  {conf.safeHandlingPath}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WORKFLOW SLA PARAMETERS */}
      {activeTab === 'SLA_CONFIG' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {configRules.map((cr) => (
              <div
                key={cr.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs"
              >
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{cr.name}</span>
                  <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {cr.currentValue} {cr.unit}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{cr.description}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Status: {cr.status} &bull; Category: {cr.category} &bull; Updated by: {cr.updatedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT / REVISION MODAL WITH DIFF */}
      {showEditModal && selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Draft Versioned Rule Revision: {selectedRule.id}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Title</label>
                <input
                  type="text"
                  value={revisedTitle}
                  onChange={(e) => setRevisedTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Clause Locator</label>
                  <input
                    type="text"
                    value={revisedClause}
                    onChange={(e) => setRevisedClause(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Page Number</label>
                  <input
                    type="number"
                    value={revisedPage}
                    onChange={(e) => setRevisedPage(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Summary &amp; Norms</label>
                <textarea
                  rows={3}
                  value={revisedSummary}
                  onChange={(e) => setRevisedSummary(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Amendment Reason</label>
                <input
                  type="text"
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* DIFF VIEW */}
            {diffData && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-purple-600" />
                  <span>Before vs After Revision Diff</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-900">
                    <strong className="block text-rose-950 mb-1">CURRENT ACTIVE (v{selectedRule.version}):</strong>
                    <div>{selectedRule.summary}</div>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                    <strong className="block text-emerald-950 mb-1">PROPOSED REVISION:</strong>
                    <div>{revisedSummary}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1.5 rounded-lg border text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveRevision}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 text-xs font-semibold hover:bg-purple-50"
                >
                  Generate Diff
                </button>
                <button
                  onClick={handlePublishRevision}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Versioned Revision</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
