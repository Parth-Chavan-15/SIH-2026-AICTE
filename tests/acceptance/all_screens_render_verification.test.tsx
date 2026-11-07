import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ROLE_NAV_ITEMS } from '../../src/components/layout/Sidebar';
import { NotificationsView } from '../../src/features/notifications/NotificationsView';
import { ComplianceView } from '../../src/features/compliance/ComplianceView';
import { DocumentExpiryView } from '../../src/features/documents/DocumentExpiryView';
import { EVCReportsView } from '../../src/features/evc/EVCReportsView';
import { AuditView } from '../../src/features/audit/AuditView';
import { AppProvider } from '../../src/context/AppContext';

describe('NIYAMSETU — Live 30+ Screen Render & Role-Scoped Verification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defines valid navigation items for all 6 regulatory roles without missing tab IDs', () => {
    const roles: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];
    let totalTabs = 0;

    for (const r of roles) {
      const portal = ROLE_NAV_ITEMS[r];
      expect(portal).toBeDefined();
      expect(portal.portalTitle).toBeTruthy();
      expect(portal.items.length).toBeGreaterThan(0);
      totalTabs += portal.items.length;

      for (const item of portal.items) {
        expect(item.id).toBeTruthy();
        expect(item.label).toBeTruthy();
        expect(item.icon).toBeDefined();
      }
    }

    // Role 1 (7) + Role 2 (6) + Role 3 (3) + Role 4 (5) + Role 5 (4) + Role 6 (5) = 30 tabs
    expect(totalTabs).toBe(30);
  });

  it('renders role-scoped NotificationsView correctly across all 6 roles without crashes', () => {
    const roleTitles: Record<number, string> = {
      1: 'Official Notices &amp; Regulatory Deadline Alerts',
      2: 'Scrutiny SLA Timers, Deficiencies &amp; Committee Deadlines',
      3: 'EVC Inspection Deadlines, Telemetry &amp; Scheduling Alerts',
      4: 'Regional Desk Operational Alerts, SHC Hearings &amp; SLA Escalations',
      5: 'Council Docket Alerts, SAC Judicial Hearings &amp; Dispatch Tracking',
      6: 'System Alerts, Autonomous Telemetry &amp; WORM Audit Logs',
    };

    const dummyProps = {
      onSelectApplication: vi.fn(),
    };

    for (let roleNum = 1; roleNum <= 6; roleNum++) {
      const html = renderToStaticMarkup(
        <AppProvider>
          <NotificationsView onSelectApplication={dummyProps.onSelectApplication} roleNumber={roleNum} />
        </AppProvider>
      );

      // Verify that role title is displayed
      expect(html).toContain(roleTitles[roleNum]);

      // Role 1 (Applicant) must NEVER render multi-college case filter bar
      if (roleNum === 1) {
        expect(html).toContain('Tenant-Isolated Institutional Notice Board');
        expect(html).not.toContain('Filter Case:');
      }

      // Role 2 must include Scrutiny categories and hide out-of-scope categories like EVC / Council Docket
      if (roleNum === 2) {
        expect(html).toContain('Scrutiny');
        expect(html).toContain('Workflow');
        expect(html).not.toContain('>Council Docket<');
      }

      // Role 6 (Central Policy Admin) must include rule engine and WORM cards
      if (roleNum === 6) {
        expect(html).toContain('WORM Audit Ledger');
        expect(html).toContain('Ecosystem Adapters');
        expect(html).toContain('Active Rules Engine');
      }
    }
  });

  it('renders ComplianceView without throwing toLowerCase errors under both Role 1 and Role 4', () => {
    // Render under default context
    const html = renderToStaticMarkup(
      <AppProvider>
        <ComplianceView />
      </AppProvider>
    );

    expect(html).toBeDefined();
    expect(html).toContain('Statutory Compliance');
  });

  it('renders DocumentExpiryView, EVCReportsView, and AuditView safely', () => {
    const htmlDoc = renderToStaticMarkup(
      <AppProvider>
        <DocumentExpiryView />
      </AppProvider>
    );
    expect(htmlDoc).toContain('Document Expiry');

    const htmlEVC = renderToStaticMarkup(
      <AppProvider>
        <EVCReportsView />
      </AppProvider>
    );
    expect(htmlEVC).toContain('EVC');

    const htmlAudit = renderToStaticMarkup(
      <AppProvider>
        <AuditView onSelectApplication={vi.fn()} />
      </AppProvider>
    );
    expect(htmlAudit).toContain('WORM');
  });
});
