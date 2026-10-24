import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SessionGate } from './features/auth/SessionGate';
import { getSession } from './services/session';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Feature Views
import { RegulatoryStudioView } from './features/regulatory/RegulatoryStudioView';
import { GovernmentEndpointsView } from './features/regulatory/GovernmentEndpointsView';
import { DashboardView } from './features/dashboard/DashboardView';
import { ApplicationsListView } from './features/applications/ApplicationsListView';
import { ApplicationDetailModal } from './features/applications/ApplicationDetailModal';
import { NewApplicationModal } from './features/applications/NewApplicationModal';
import { WorkflowView } from './features/workflow/WorkflowView';
import { PendencyView } from './features/pendency/PendencyView';
import { EVCView } from './features/evc/EVCView';
import { ComplianceView } from './features/compliance/ComplianceView';
import { DocumentExpiryView } from './features/documents/DocumentExpiryView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { ReportsView } from './features/reports/ReportsView';
import { AuditView } from './features/audit/AuditView';
import { ConfigRulesView } from './features/admin/ConfigRulesView';
import { ScrutinyEvaluationView } from './features/scrutiny/ScrutinyEvaluationView';
import { InstitutionDeficiencyCureView } from './features/institution/InstitutionDeficiencyCureView';
import { ScrutinyRosterDeclarationView } from './features/scrutiny/ScrutinyRosterDeclarationView';
import { CompetentAuthorityDecisionView } from './features/ca/CompetentAuthorityDecisionView';

import { Search, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { selectedAppId, setSelectedAppId, applications } = useApp();
  const [sessionRevision, setSessionRevision] = useState(0);

  useEffect(() => {
    const handleSessionChange = () => setSessionRevision((r) => r + 1);
    window.addEventListener('sih:sessionchanged', handleSessionChange);
    return () => window.removeEventListener('sih:sessionchanged', handleSessionChange);
  }, []);

  const session = getSession();
  const activeActor = session?.actor;

  // Determine active role portal (1-6)
  const roleNumber: number = 
    (activeActor?.id === 'usr-inst-coep' || activeActor?.roles?.includes('institution')) ? 1 :
    (activeActor?.id === 'usr-scrutiny-reviewer' || activeActor?.roles?.includes('reviewer')) ? 2 :
    (activeActor?.id === 'usr-evc-chair' || activeActor?.roles?.includes('evc')) ? 3 :
    (activeActor?.id === 'usr-ro-western' || activeActor?.roles?.includes('regional_officer')) ? 4 :
    (activeActor?.id === 'usr-bureau-hq' || activeActor?.roles?.includes('demo_authority') || activeActor?.roles?.includes('bureau_officer')) ? 5 :
    6;

  const defaultTab = 
    roleNumber === 1 ? 'inst-apps' :
    roleNumber === 2 ? 'scrutiny-eval' :
    roleNumber === 3 ? 'evc-inspect' :
    roleNumber === 4 ? 'ro-pendency' :
    roleNumber === 5 ? 'ca-decision' : 'admin-policy';

  const [currentTab, setCurrentTab] = useState<string>(defaultTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update default tab if active role changes
  useEffect(() => {
    setCurrentTab(defaultTab);
  }, [activeActor?.id]);

  // Responsive window check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchQuery.trim()
    ? applications.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.currentStage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 antialiased" style={{ background: '#f0f2f7' }}>
      {/* Top Government Navbar matching media_1792851811454_e4202197.png */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenNotifications={() => setCurrentTab('notifications')}
        onSearchClick={() => setShowSearchModal(true)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Role-Specific Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          isMobile={isMobile}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col" style={{ background: '#f0f2f7' }}>
          <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            {/* Role 1: Institution (Applicant) Pages */}
            {currentTab === 'inst-apps' && (
              <ApplicationsListView
                onSelectApplication={(id) => setSelectedAppId(id)}
                onOpenNewAppModal={() => setShowNewAppModal(true)}
              />
            )}
            {currentTab === 'inst-deficiencies' && (
              <InstitutionDeficiencyCureView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'inst-renewals' && <ComplianceView />}
            {currentTab === 'inst-dossier' && <DocumentExpiryView />}

            {/* Role 2: Scrutiny Reviewer Pages */}
            {currentTab === 'scrutiny-queue' && (
              <ApplicationsListView
                onSelectApplication={(id) => setSelectedAppId(id)}
                onOpenNewAppModal={() => setShowNewAppModal(true)}
              />
            )}
            {currentTab === 'scrutiny-eval' && (
              <ScrutinyEvaluationView
                mode="initial"
                onSelectApplication={(id) => setSelectedAppId(id)}
              />
            )}
            {currentTab === 'scrutiny-rescrutiny' && (
              <ScrutinyEvaluationView
                mode="rescrutiny"
                onSelectApplication={(id) => setSelectedAppId(id)}
              />
            )}
            {currentTab === 'scrutiny-committee' && (
              <ScrutinyRosterDeclarationView onNavigateToScrutiny={() => setCurrentTab('scrutiny-eval')} />
            )}

            {/* Role 3: EVC Coordinator / Member Pages */}
            {currentTab === 'evc-queue' && (
              <EVCView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'evc-inspect' && (
              <EVCView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'evc-sac' && (
              <EVCView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'evc-reports' && <ReportsView />}

            {/* Role 4: Regional / Bureau Officer Pages */}
            {currentTab === 'ro-pendency' && (
              <PendencyView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'ro-schedule' && (
              <EVCView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'ro-obligations' && <ComplianceView />}
            {currentTab === 'ro-verify' && <DocumentExpiryView />}
            {currentTab === 'ro-concurrence' && <GovernmentEndpointsView />}

            {/* Role 5: Competent Authority Pages */}
            {currentTab === 'ca-dossiers' && (
              <ApplicationsListView
                onSelectApplication={(id) => setSelectedAppId(id)}
                onOpenNewAppModal={() => setShowNewAppModal(true)}
              />
            )}
            {currentTab === 'ca-decision' && (
              <CompetentAuthorityDecisionView
                onSelectApplication={(id) => setSelectedAppId(id)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}
            {currentTab === 'ca-gazette' && <ReportsView />}
            {currentTab === 'ca-dispatch' && <GovernmentEndpointsView />}

            {/* Role 6: System Policy Administrator Pages */}
            {currentTab === 'admin-policy' && <ConfigRulesView />}
            {currentTab === 'admin-worm' && (
              <AuditView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
            {currentTab === 'admin-adapters' && <GovernmentEndpointsView />}
            {currentTab === 'admin-analytics' && <ReportsView />}

            {/* Auxiliary Universal Views */}
            {currentTab === 'notifications' && (
              <NotificationsView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {selectedAppId && (
        <ApplicationDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      )}

      {showNewAppModal && (
        <NewApplicationModal
          onClose={() => setShowNewAppModal(false)}
          onSuccess={(newId) => setSelectedAppId(newId)}
        />
      )}

      {/* Quick Search Dialog (Ctrl+K) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-start justify-center pt-[15vh] p-4" onClick={() => setShowSearchModal(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-xl overflow-hidden anim-scale-in"
            style={{ boxShadow: '0 24px 80px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input
                type="text"
                autoFocus
                placeholder="Type application number, institute name, or stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 text-sm focus:outline-none bg-transparent"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-100 text-slate-400 border border-slate-200">
                ESC
              </kbd>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {searchQuery ? 'No matching applications found.' : 'Search across all AICTE application records...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {searchResults.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedAppId(app.id);
                        setShowSearchModal(false);
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-blue-50 flex items-center justify-between text-xs transition-all duration-150"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{app.institutionName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{app.applicationNumber}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                          {app.currentStage}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{app.region} Region</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between px-4">
              <span>Use ↑↓ to navigate</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <SessionGate>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </SessionGate>
  );
}

export default App;
