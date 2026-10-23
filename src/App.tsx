import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Feature Views
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
import { UserManagementView } from './features/admin/UserManagementView';

import { Search, ChevronRight, X, Building, Shield } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, selectedAppId, setSelectedAppId, applications } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const tabLabels: Record<NavTab, string> = {
    overview: 'Command Center Overview',
    applications: 'Application Management',
    workflow: 'Approval Workflow Automation',
    pendency: 'SLA Pendency Monitoring',
    evc: 'EVC Inspection Scheduling',
    compliance: 'Institutional Compliance',
    documents: 'Document & Lease Expiry',
    notifications: 'Notifications & Escalations',
    reports: 'Reports & Analytics',
    audit: 'Immutable Audit Trail',
    rules: 'Rules & SLA Configuration',
    users: 'User Management & RBAC',
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 antialiased" style={{ background: '#f0f2f7' }}>
      {/* Top Government Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenNotifications={() => setCurrentTab('notifications')}
        onSearchClick={() => setShowSearchModal(true)}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          isMobile={isMobile}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col" style={{ background: '#f0f2f7' }}>
          {/* Breadcrumbs and Page Bar */}
          <div className="bg-white/80 px-4 sm:px-8 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Portal</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-bold text-slate-800">{tabLabels[currentTab]}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">
                Operating as: <strong className="text-slate-700">{user.roleTitle}</strong>
              </span>
            </div>
          </div>

          {/* View Container */}
          <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            {currentTab === 'overview' && (
              <DashboardView
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenNewAppModal={() => setShowNewAppModal(true)}
                onSelectApplication={(id) => setSelectedAppId(id)}
              />
            )}

            {currentTab === 'applications' && (
              <ApplicationsListView
                onSelectApplication={(id) => setSelectedAppId(id)}
                onOpenNewAppModal={() => setShowNewAppModal(true)}
              />
            )}

            {currentTab === 'workflow' && (
              <WorkflowView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}

            {currentTab === 'pendency' && (
              <PendencyView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}

            {currentTab === 'evc' && (
              <EVCView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}

            {currentTab === 'compliance' && <ComplianceView />}

            {currentTab === 'documents' && <DocumentExpiryView />}

            {currentTab === 'notifications' && (
              <NotificationsView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'audit' && (
              <AuditView onSelectApplication={(id) => setSelectedAppId(id)} />
            )}

            {currentTab === 'rules' && <ConfigRulesView />}

            {currentTab === 'users' && <UserManagementView />}
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
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-slate-900 mr-2">
                          {app.applicationNumber}
                        </span>
                        <span className="text-slate-700 font-medium">{app.institutionName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">{app.currentStage}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
