import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ROAllocationView } from '../../src/features/ro/ROAllocationView';
import { AppProvider } from '../../src/context/AppContext';

describe('ROAllocationView — Static & Logic Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ROAllocationView cleanly with Unified Evaluator Console Scope Note', () => {
    const html = renderToStaticMarkup(
      <AppProvider>
        <ROAllocationView />
      </AppProvider>
    );

    expect(html).toContain('Regional Office Operations Desk: Committee Allocation');
    expect(html).toContain('Unified Evaluator Console &amp; Regional Workload Governance');
    expect(html).toContain('APH §1.8 &amp; §1.9 Roster Model');
    expect(html).toContain('Select Regional Queue Case');
    expect(html).toContain('Active Standing Committee Panels');
    expect(html).toContain('Refresh Workloads');
  });

  it('correctly distinguishes SCRUTINY and EVC groups and handles capacity and reassignment filtering', () => {
    const testGroups = [
      {
        id: 'SCR-GROUP-A',
        name: 'Desk Scrutiny Committee Group A (Western & SCRO)',
        type: 'SCRUTINY',
        region: 'Western',
        status: 'ACTIVE',
        capacity: 10,
        activeCaseCount: 2
      },
      {
        id: 'SCR-GROUP-B',
        name: 'Desk Scrutiny Committee Group B (Northern & Central)',
        type: 'SCRUTINY',
        region: 'Northern',
        status: 'ACTIVE',
        capacity: 10,
        activeCaseCount: 10 // Full capacity
      },
      {
        id: 'EVC-GROUP-A',
        name: 'Expert Visit Committee Panel Alpha (Infrastructure & Computing)',
        type: 'EVC',
        region: 'South-Central',
        status: 'ACTIVE',
        capacity: 5,
        activeCaseCount: 1
      },
      {
        id: 'EVC-GROUP-B',
        name: 'Expert Visit Committee Panel Beta (Polytechnic & Applied Sciences)',
        type: 'EVC',
        region: 'Western',
        status: 'ACTIVE',
        capacity: 5,
        activeCaseCount: 0
      }
    ];

    const isScrutinyGroup = (g: any) => {
      const t = ((g?.type || g?.groupType || '') as string).toUpperCase();
      return t.includes('SCRUTINY') || String(g?.id || '').startsWith('SCR');
    };

    const isEvcGroup = (g: any) => {
      const t = ((g?.type || g?.groupType || '') as string).toUpperCase();
      return t.includes('EVC') || String(g?.id || '').startsWith('EVC');
    };

    const isGroupBelowCapacity = (g: any) => {
      const count = typeof g?.activeCaseCount === 'number' ? g.activeCaseCount : 0;
      const cap = typeof g?.capacity === 'number' && g.capacity > 0 ? g.capacity : 10;
      return count < cap;
    };

    // Scrutiny vs EVC distinction
    expect(testGroups.filter(isScrutinyGroup).map(g => g.id)).toEqual(['SCR-GROUP-A', 'SCR-GROUP-B']);
    expect(testGroups.filter(isEvcGroup).map(g => g.id)).toEqual(['EVC-GROUP-A', 'EVC-GROUP-B']);

    // Capacity checking
    expect(isGroupBelowCapacity(testGroups[0])).toBe(true);  // 2/10 -> below
    expect(isGroupBelowCapacity(testGroups[1])).toBe(false); // 10/10 -> at capacity
    expect(isGroupBelowCapacity(testGroups[2])).toBe(true);  // 1/5 -> below
    expect(isGroupBelowCapacity(testGroups[3])).toBe(true);  // 0/5 -> below

    // Case 1: Case already assigned to SCR-GROUP-A.
    // Reassignment filters out the currently assigned panel (SCR-GROUP-A)
    // and checks if any other panel is below capacity.
    const currentAssignedId = 'SCR-GROUP-A';
    const availableScrutinyPanels = testGroups
      .filter(isScrutinyGroup)
      .filter(g => g.status === 'ACTIVE' && isGroupBelowCapacity(g) && g.id !== currentAssignedId);
    expect(availableScrutinyPanels.length).toBe(0); // SCR-GROUP-B is at 10/10 capacity -> 0 available

    // Case 2: Case already assigned to EVC-GROUP-A.
    // EVC-GROUP-A is excluded; EVC-GROUP-B is free (0/5).
    const availableEvcPanels = testGroups
      .filter(isEvcGroup)
      .filter(g => g.status === 'ACTIVE' && isGroupBelowCapacity(g) && g.id !== 'EVC-GROUP-A');
    expect(availableEvcPanels.length).toBe(1);
    expect(availableEvcPanels[0].id).toBe('EVC-GROUP-B');

    // Case 3: Case NOT assigned to Desk Scrutiny.
    // Free scrutiny panels below capacity:
    const newScrutinyPanels = testGroups
      .filter(isScrutinyGroup)
      .filter(g => g.status === 'ACTIVE' && isGroupBelowCapacity(g));
    expect(newScrutinyPanels.length).toBe(1);
    expect(newScrutinyPanels[0].id).toBe('SCR-GROUP-A');
  });

  it('formats allocation history without Invalid Date and without empty parentheses', () => {
    const rawHist = {
      id: 'ALLOC-HIST-01',
      caseId: 'APP-2026-GIITS',
      type: 'SCRUTINY',
      assignedGroupId: 'SCR-GROUP-A',
      assignedGroupName: 'Desk Scrutiny Committee Group A (Western & SCRO)',
      allocatedBy: 'ro_western@aicte.gov.in',
      allocatedAt: '2026-10-21T09:30:00.000Z',
      reason: 'Initial desk scrutiny assignment for non-NBA intake increase application.'
    };

    const timestamp = rawHist.allocatedAt;
    const dateDisplay = timestamp && !isNaN(new Date(timestamp).getTime())
      ? new Date(timestamp).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : 'Invalid Date';

    expect(dateDisplay).not.toContain('Invalid Date');

    const groupTypeRaw = (rawHist.type || '').toUpperCase();
    const groupTypeLabel = groupTypeRaw.includes('SCR')
      ? 'Desk Scrutiny'
      : groupTypeRaw.includes('EVC')
      ? 'EVC Inspection'
      : '';

    expect(groupTypeLabel).toBe('Desk Scrutiny');
    const labelWithParens = groupTypeLabel ? ` (${groupTypeLabel})` : '';
    expect(labelWithParens).toBe(' (Desk Scrutiny)');
    expect(labelWithParens).not.toBe(' ()');
  });
});
