import React, { useState, useMemo } from 'react';
import {
  evaluateDynamicRoute,
  type DynamicRouteResult
} from '../../backend/policy/dynamicRouteEngine';
import {
  Route,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Scale,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Sliders,
  Settings2
} from 'lucide-react';

interface RouteScenario {
  id: string;
  name: string;
  categoryCode: string;
  aphChapter: string;
  statutoryCite: string;
  summary: string;
  facts: Record<string, any>;
  badgeColor: string;
  keyRule: string;
}

export const DEMO_ROUTE_SCENARIOS: RouteScenario[] = [
  {
    id: 'ch1-new',
    name: 'Chapter I — New Technical Institution',
    categoryCode: 'CAT-CH1-NEW',
    aphChapter: 'Chapter I',
    statutoryCite: 'APH 2024–27 Clauses 1.8–1.9 & Public Notice 26.11.2025',
    summary: 'New institution establishment requiring mandatory sequential Desk Scrutiny and Physical EVC verification.',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    keyRule: 'Desk Scrutiny + Mandatory Site EVC + NSWS Origination Mandate',
    facts: {
      category: 'new_institution',
      program: 'Engineering and Technology',
      level: 'Diploma',
      existingIntake: 0,
      proposedIntake: 300,
      nbaAccredited: false,
      region: 'North-Western'
    }
  },
  {
    id: 'ch2-eoa',
    name: 'Table 2.3 Row 1 — Annual EoA Self-Disclosure',
    categoryCode: 'CAT-CH2-01',
    aphChapter: 'Chapter II',
    statutoryCite: 'APH 2024–27 Clause 2.5 & Table 2.3 Row 1',
    summary: 'Annual EoA based on online self-disclosure without prior deficiencies. Pre-approval Scrutiny and EVC waived.',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    keyRule: 'Fast-Track Automated EoA Endorsement (Pre-approval Scrutiny & EVC dashed)',
    facts: {
      category: 'extension_of_approval',
      program: 'Management',
      level: 'Post Graduate',
      existingIntake: 180,
      proposedIntake: 180,
      nbaAccredited: false,
      region: 'Western'
    }
  },
  {
    id: 'ch2-nba-fasttrack',
    name: 'Table 2.3 Row 9 — Intake Increase (NBA Accredited)',
    categoryCode: 'CAT-CH2-09A',
    aphChapter: 'Chapter II & Errata p. 42',
    statutoryCite: 'Addendum AY 2026–27 Item 16 / Errata Page 42 Clause 2.6(c)(i)',
    summary: 'Intake expansion with valid NBA accreditation. Physical EVC waived; evaluated through Desk Scrutiny only.',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    keyRule: 'Physical EVC Waived under Errata Page 42; Formula: 360 + 60 + 1 div',
    facts: {
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 120,
      proposedIntake: 180,
      nbaAccredited: true,
      nbaScore: 680,
      region: 'Western'
    }
  },
  {
    id: 'ch2-non-nba-dual',
    name: 'Table 2.3 Row 9 — Intake Increase (Non-NBA Dual-Track)',
    categoryCode: 'CAT-CH2-09B',
    aphChapter: 'Chapter II & Errata p. 42',
    statutoryCite: 'APH Table 2.3 Row 9 & Errata Page 42 Clause 2.6(c)(i) Item (d)',
    summary: 'Intake increase without NBA accreditation. Mandates sequential Desk Scrutiny followed by Physical EVC.',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    keyRule: 'Mandatory Dual-Track (Scrutiny + Physical EVC Inspection)',
    facts: {
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 120,
      proposedIntake: 240,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'Western'
    }
  },
  {
    id: 'ch2-boundary-x360',
    name: 'Table 2.3 Row 9 — Boundary Condition X = 360',
    categoryCode: 'CAT-CH2-09B-BOUNDARY',
    aphChapter: 'Chapter II & Errata p. 42 Gap',
    statutoryCite: 'Errata Page 42 Table Gap (Covers X < 360 and X > 360, omits X = 360)',
    summary: 'Intake division boundary condition X = 360. System safely halts to Policy Review Required instead of inventing arbitrary rules.',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    keyRule: 'Deterministic Policy Review Hold (Zero hallucinated rules)',
    facts: {
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 360,
      proposedIntake: 420,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'Western'
    }
  },
  {
    id: 'ch2-site-shifting',
    name: 'Table 2.3 Row 14 — Change of Site / Location',
    categoryCode: 'CAT-CH2-14',
    aphChapter: 'Chapter II',
    statutoryCite: 'APH 2024–27 Chapter II Clause 2.17 & Table 2.3 Row 14',
    summary: 'Change of campus location. Desk Scrutiny of legal land documents followed by mandatory Physical EVC verification.',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    keyRule: 'Legal Title Scrutiny + Mandatory Physical Site EVC',
    facts: {
      category: 'change_of_site',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 180,
      proposedIntake: 180,
      nbaAccredited: false,
      region: 'Western'
    }
  },
  {
    id: 'ch2-closure',
    name: 'Table 2.3 Row 15 — Closure of Institution / Course',
    categoryCode: 'CAT-CH2-15',
    aphChapter: 'Chapter II',
    statutoryCite: 'APH 2024–27 Clause 2.18 & Table 2.3 Row 15/16',
    summary: 'Progressive or complete closure of technical courses. Verified through Desk Scrutiny only; EVC skipped.',
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    keyRule: 'Desk Scrutiny Only (Closure Norms & Student Protection)',
    facts: {
      category: 'closure',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 240,
      proposedIntake: 180,
      nbaAccredited: true,
      region: 'Western'
    }
  },
  {
    id: 'bba-bca-as-is',
    name: 'Errata p. 42 — BBA / BCA / BMS (As Is Where Is)',
    categoryCode: 'CAT-BBA-BCA',
    aphChapter: 'Addendum 2026–27 & Errata',
    statutoryCite: 'Errata Page 42 Item 2 (Amends Circular 06.10.2025)',
    summary: 'Institutions running BBA/BCA/BMS approved on "as is where is basis" for AY 2026–27. Pre-approval Scrutiny & EVC waived.',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    keyRule: 'Direct Endorsement on As-Is-Where-Is Basis (Scrutiny & EVC Waived)',
    facts: {
      category: 'extension_of_approval',
      program: 'Applied Arts and Crafts',
      course: 'BBA/BCA/BMS Integrated',
      level: 'Under Graduate',
      existingIntake: 120,
      proposedIntake: 120,
      bbaBcaAsIsWhereIs: true,
      region: 'Western'
    }
  },
  {
    id: 'ch3-twinning',
    name: 'Chapter III — Foreign University Collaboration & Twinning',
    categoryCode: 'CAT-CH3-TWIN',
    aphChapter: 'Chapter III',
    statutoryCite: 'APH 2024–27 Chapter III Clauses 3.1–3.4 & Addendum Item 29',
    summary: 'Collaboration with foreign university in top 500 QS/THE. Requires rigorous Desk Scrutiny and EVC inspection.',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    keyRule: 'Top 500 QS/THE MoU + Desk Scrutiny + Mandatory EVC',
    facts: {
      category: 'collaboration_twinning',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      foreignUniversityRank: 320,
      hasMoU: true,
      region: 'Western'
    }
  },
  {
    id: 'ch4-universities',
    name: 'Chapter IV — University Technical Programmes',
    categoryCode: 'CAT-CH4-UNIV',
    aphChapter: 'Chapter IV & Public Notice',
    statutoryCite: 'Public Notice 26.11.2025 & Supreme Court 2017 Precedent',
    summary: 'Grant of approval for State/Private/Deemed Universities. Mandatory for all programmes; partial applications prohibited.',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    keyRule: 'Full Technical Programme Coverage (Partial Application Barred)',
    facts: {
      category: 'university_approval',
      institutionType: 'Deemed to be University',
      allProgrammesIncluded: true,
      region: 'Western'
    }
  },
  {
    id: 'ch5-odl',
    name: 'Chapter V — ODL & Online Learning Approval',
    categoryCode: 'CAT-CH5-ODL',
    aphChapter: 'Chapter V',
    statutoryCite: 'APH 2024–27 Chapter V Clause 5.3.8 & Addendum Item 32',
    summary: 'Open and Distance Learning approval. Requires at least one graduating batch pass-out, Desk Scrutiny, and EVC.',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-300',
    keyRule: 'Minimum 1 Batch Pass-Out + Desk Scrutiny + EVC Inspection',
    facts: {
      category: 'odl_online_learning',
      graduatingBatchPassed: true,
      program: 'Management',
      level: 'Post Graduate',
      region: 'Western'
    }
  }
];

export const RouteDemonstrationExplorer: React.FC<{
  onLaunchInNSWS?: (presetId: string) => void;
}> = ({ onLaunchInNSWS }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ch2-nba-fasttrack');
  const activeScenario = DEMO_ROUTE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_ROUTE_SCENARIOS[0];

  // Custom scenario sandbox state
  const [customCategory, setCustomCategory] = useState<string>('increase_intake');
  const [customProgram, setCustomProgram] = useState<string>('Engineering and Technology');
  const [customLevel, setCustomLevel] = useState<string>('Under Graduate');
  const [customExistingIntake, setCustomExistingIntake] = useState<number>(120);
  const [customProposedIntake, setCustomProposedIntake] = useState<number>(180);
  const [customNbaAccredited, setCustomNbaAccredited] = useState<boolean>(true);
  const [customNbaScore, setCustomNbaScore] = useState<number>(680);
  const [customBbaAsIs, setCustomBbaAsIs] = useState<boolean>(false);
  const [customTwinningRank, setCustomTwinningRank] = useState<number>(350);
  const [customHasMoU, setCustomHasMoU] = useState<boolean>(true);
  const [customAllPrograms, setCustomAllPrograms] = useState<boolean>(true);
  const [customGradBatchPassed, setCustomGradBatchPassed] = useState<boolean>(true);
  const [customRegion, setCustomRegion] = useState<string>('Western');

  const customFacts = useMemo(() => {
    return {
      category: customCategory,
      program: customProgram,
      level: customLevel,
      existingIntake: Number(customExistingIntake),
      proposedIntake: Number(customProposedIntake),
      nbaAccredited: Boolean(customNbaAccredited),
      nbaScore: Number(customNbaScore),
      bbaBcaAsIsWhereIs: Boolean(customBbaAsIs),
      foreignUniversityRank: Number(customTwinningRank),
      hasMoU: Boolean(customHasMoU),
      allProgrammesIncluded: Boolean(customAllPrograms),
      graduatingBatchPassed: Boolean(customGradBatchPassed),
      region: customRegion
    };
  }, [
    customCategory, customProgram, customLevel, customExistingIntake,
    customProposedIntake, customNbaAccredited, customNbaScore,
    customBbaAsIs, customTwinningRank, customHasMoU, customAllPrograms,
    customGradBatchPassed, customRegion
  ]);

  const activeFacts = activeTab === 'presets' ? activeScenario.facts : customFacts;
  // Execute real dynamic route evaluation on active scenario facts
  const routeResult: DynamicRouteResult = evaluateDynamicRoute(activeFacts);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Statutory Route Engine Demonstration Explorer
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              AICTE AY 2026–27 Dynamic Routing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore every source-grounded route implemented in <code>dynamicRouteEngine.ts</code>. Verified against indexed APH 2024–27 chapters, Addendum AY 2026–27, and Errata Page 42.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Statutory Presets (11)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Custom Sandbox</span>
            </button>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono hidden md:block">
            Engine: <span className="font-bold text-slate-800">{routeResult.ruleVersion}</span>
          </div>
        </div>
      </div>

      {activeTab === 'presets' ? (
        /* Scenario Selector Chips */
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Regulatory Route Scenario to Evaluate:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DEMO_ROUTE_SCENARIOS.map((s) => {
              const isSelected = s.id === selectedScenarioId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{s.aphChapter}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${s.badgeColor}`}>
                        {s.categoryCode}
                      </span>
                    </div>
                    <div className={`font-bold text-xs ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {s.name}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 font-medium line-clamp-1">
                    {s.keyRule}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Interactive Custom Fact Builder Sandbox */
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>Interactive Fact Input Sandbox — Real-Time Evaluation Against dynamicRouteEngine.ts</span>
            </span>
            <span className="text-[11px] text-indigo-700 font-medium">
              Mutate inputs to witness dynamic branch selection &amp; boundary detection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Approval Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="increase_intake">Increase in Intake / Additional Course (Table 2.3 Row 9)</option>
                <option value="extension_of_approval">Extension of Approval (EoA Table 2.3 Row 1)</option>
                <option value="new_institution">New Technical Institution (Chapter I)</option>
                <option value="change_of_site">Change of Site / Location (Table 2.3 Row 14)</option>
                <option value="closure">Closure of Institution / Course (Table 2.3 Row 15)</option>
                <option value="collaboration_twinning">Foreign Collaboration / Twinning (Chapter III)</option>
                <option value="university_approval">University Technical Programme (Chapter IV)</option>
                <option value="odl_online_learning">ODL / Online Learning (Chapter V)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Academic Program</label>
              <select
                value={customProgram}
                onChange={(e) => setCustomProgram(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Engineering and Technology">Engineering and Technology</option>
                <option value="Management">Management</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Architecture and Town Planning">Architecture and Town Planning</option>
                <option value="Applied Arts and Crafts">Applied Arts and Crafts</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Level</label>
              <select
                value={customLevel}
                onChange={(e) => setCustomLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Under Graduate">Under Graduate (UG)</option>
                <option value="Post Graduate">Post Graduate (PG)</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Regional Office</label>
              <select
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Western">Western (Mumbai)</option>
                <option value="Northern">Northern (Kanpur)</option>
                <option value="Southern">Southern (Chennai)</option>
                <option value="Eastern">Eastern (Kolkata)</option>
                <option value="Central">Central (Bhopal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Existing Intake (Seats)</label>
              <input
                type="number"
                value={customExistingIntake}
                onChange={(e) => setCustomExistingIntake(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Test Boundary: 360</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Proposed Intake (Seats)</label>
              <input
                type="number"
                value={customProposedIntake}
                onChange={(e) => setCustomProposedIntake(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Requested total</span>
            </div>

            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={customNbaAccredited}
                  onChange={(e) => setCustomNbaAccredited(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-slate-700 text-xs">NBA Accredited Programme</span>
              </label>
            </div>

            {customNbaAccredited && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">NBA Score (out of 1000)</label>
                <input
                  type="number"
                  value={customNbaScore}
                  onChange={(e) => setCustomNbaScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">&gt;= 650 eligible for Fast-Track</span>
              </div>
            )}
          </div>

          {/* Conditional parameters based on category */}
          <div className="flex flex-wrap gap-4 pt-1 border-t border-slate-200 text-xs">
            {customCategory === 'extension_of_approval' && (
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customBbaAsIs}
                  onChange={(e) => setCustomBbaAsIs(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">BBA/BCA/BMS As-Is-Where-Is (Errata p. 42 Item 2)</span>
              </label>
            )}

            {customCategory === 'collaboration_twinning' && (
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <span className="font-bold text-slate-700">Foreign University QS/THE Rank:</span>
                  <input
                    type="number"
                    value={customTwinningRank}
                    onChange={(e) => setCustomTwinningRank(Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500">(&le; 500 required)</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customHasMoU}
                    onChange={(e) => setCustomHasMoU(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Valid Executed MoU</span>
                </label>
              </div>
            )}

            {customCategory === 'university_approval' && (
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customAllPrograms}
                  onChange={(e) => setCustomAllPrograms(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">All Technical Programmes Included in Application</span>
              </label>
            )}

            {customCategory === 'odl_online_learning' && (
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customGradBatchPassed}
                  onChange={(e) => setCustomGradBatchPassed(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">At least 1 graduating batch has passed out</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Live Route Engine Decision Display */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">
                {activeTab === 'presets' ? activeScenario.name : 'Custom Interactive Scenario Evaluation'}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                activeTab === 'presets' ? activeScenario.badgeColor : 'bg-indigo-100 text-indigo-800 border-indigo-300'
              }`}>
                {routeResult.category}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              {routeResult.categoryName} &bull; <span className="font-semibold">{routeResult.aphChapter}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Evaluation Result:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                routeResult.result === 'selected'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : routeResult.result === 'review_required'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {routeResult.result === 'review_required' ? 'Policy Review Required' : routeResult.result}
            </span>
          </div>
        </div>

        {/* Visual Stage Sequence Flow */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
            Statutory Workflow Progression Stages:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {routeResult.stages.map((stg, i) => (
              <React.Fragment key={stg}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 shadow-2xs font-mono text-xs font-bold text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <span>{stg.replace(/_/g, ' ')}</span>
                </div>
                {i < routeResult.stages.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Skipped Stages Callout */}
        {routeResult.skippedStages && routeResult.skippedStages.length > 0 && (
          <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Statutotily Waived / Dashed Stages:</span>
            </div>
            <p className="mt-1 leading-relaxed">
              {routeResult.skippedStages.join('; ')}
            </p>
          </div>
        )}

        {/* Reasons & Regulatory Grounding */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Statutory Citations &amp; Decision Rationale:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside bg-white p-3.5 rounded-lg border border-slate-200">
            {routeResult.reasons.map((r, idx) => (
              <li key={idx} className="leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Source Documents & Official Locators */}
        <div className="text-[11px] text-slate-500 font-mono bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            Official Sources:
          </span>
          {routeResult.sources.map((src, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {(src as any).id || (src as any).documentId || `SRC-${i + 1}`} ({src.title})
            </span>
          ))}
          <span className="text-slate-400">&bull;</span>
          <span className="text-indigo-700 font-bold">
            Citation: {activeScenario.statutoryCite}
          </span>
        </div>
      </div>
    </div>
  );
};
