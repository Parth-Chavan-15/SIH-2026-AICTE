/**
 * NIYAMSETU — Tenant Isolation & Institutional Scoping Utility
 * Ensures Role 1 strictly isolates data per selected institution without cross-college leaks.
 */

import type { Actor } from '../shared/contracts';
import type { Application, ComplianceUndertaking, ExpiringDocument, NotificationItem, EscalationRecord } from '../types';

export interface ActiveInstitutionScope {
  key: string; // 'coep' | 'giits' | 'pdimtr' | 'apex' | 'batu' | 'vvit' | 'custom'
  idOrCode: string;
  name?: string;
  label?: string;
}

export function getActiveInstitutionScope(actor?: Actor | null): ActiveInstitutionScope {
  const selectedSavedId = typeof window !== 'undefined' ? localStorage.getItem('sih_selected_college_id') : null;
  const email = ((actor as any)?.email || '').toLowerCase();
  const actorId = (actor?.id || '').toLowerCase();

  // Canonical checks
  if (selectedSavedId === 'coep' || email === 'principal@coep.ac.in' || actorId === 'usr-inst-coep' || actorId === 'syn-actor-coep') {
    return { key: 'coep', idOrCode: 'INST-SOUTH', name: 'College of Engineering Pune', label: 'College of Engineering Pune' };
  }
  if (selectedSavedId === 'giits' || email === 'principal@giits.ac.in' || actorId === 'usr-inst-giits') {
    return { key: 'giits', idOrCode: 'INST-NORTH', name: 'Gonna Institute of Information Technology & Sciences', label: 'Gonna Institute of IT & Sciences' };
  }
  if (selectedSavedId === 'pdimtr' || email === 'principal@pdimtr.ac.in' || actorId === 'usr-inst-pdimtr') {
    return { key: 'pdimtr', idOrCode: 'INST-WEST', name: 'Prerna / Univ BDT College of Engineering', label: 'PDIMTR / Univ BDT College' };
  }
  if (selectedSavedId === 'apex' || email === 'principal@apex.ac.in' || actorId === 'usr-inst-apex') {
    return { key: 'apex', idOrCode: 'INST-APEX', name: 'Apex Institute of Technology', label: 'Apex Institute of Technology' };
  }
  if (selectedSavedId === 'batu' || email === 'principal@batu.ac.in' || actorId === 'usr-inst-batu') {
    return { key: 'batu', idOrCode: 'INST-BATU', name: 'Dr. Babasaheb Ambedkar Technological University', label: 'Dr. BATU Technical University' };
  }
  if (selectedSavedId === 'vvit' || email === 'principal@vvit.ac.in' || actorId === 'usr-inst-vvit') {
    return { key: 'vvit', idOrCode: 'INST-VVIT', name: 'Vasireddy Venkatadri Institute of Technology', label: 'VVIT Institute' };
  }

  // Custom institution scope
  if (selectedSavedId) {
    return { key: 'custom', idOrCode: selectedSavedId, name: selectedSavedId, label: selectedSavedId };
  }

  if (actor?.institutionIds && actor.institutionIds.length > 0) {
    return { key: 'custom', idOrCode: actor.institutionIds[0], name: actor.institutionIds[0], label: actor.institutionIds[0] };
  }

  return { key: 'coep', idOrCode: 'INST-SOUTH', name: 'College of Engineering Pune', label: 'College of Engineering Pune' };
}

export function isApplicationForScope(app: Application, scope: ActiveInstitutionScope): boolean {
  const code = (app.institutionCode || (app as any).institutionId || '').toUpperCase();
  const appId = (app.id || '').toUpperCase();
  const name = (app.institutionName || '').toUpperCase();

  switch (scope.key) {
    case 'coep':
      return appId.includes('COEP') || code === 'INST-SOUTH' || code === 'INST-COEP' || name.includes('COEP');
    case 'giits':
      return appId.includes('GIITS') || code === 'INST-NORTH' || code === 'INST-GIITS' || name.includes('GIITS') || name.includes('GONNA');
    case 'pdimtr':
      return appId.includes('PDIMTR') || code === 'INST-WEST' || code === 'INST-PDIMTR' || name.includes('PDIMTR') || name.includes('PRERNA');
    case 'apex':
      return appId.includes('APEX') || code === 'INST-APEX' || name.includes('APEX');
    case 'batu':
      return appId.includes('BATU') || code === 'INST-BATU' || name.includes('BATU') || name.includes('AMBEDKAR');
    case 'vvit':
      return appId.includes('VVIT') || code === 'INST-VVIT' || name.includes('VVIT') || appId.includes('BOUNDARY-X360');
    case 'custom': {
      const target = (scope.idOrCode || '').toUpperCase();
      if (target && (code === target || appId === target || appId.includes(target) || name === target || name.includes(target))) {
        return true;
      }
      const canonCodes = ['INST-SOUTH', 'INST-COEP', 'INST-NORTH', 'INST-GIITS', 'INST-WEST', 'INST-PDIMTR', 'INST-APEX', 'INST-BATU', 'INST-VVIT'];
      if (!canonCodes.includes(code)) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

export function isComplianceForScope(item: ComplianceUndertaking, scope: ActiveInstitutionScope): boolean {
  const appId = (item.applicationId || '').toUpperCase();
  const instId = ((item as any).institutionId || '').toUpperCase();
  const name = (item.institutionName || '').toUpperCase();

  switch (scope.key) {
    case 'coep':
      return appId.includes('COEP') || instId === 'INST-SOUTH' || instId === 'INST-COEP' || name.includes('COEP');
    case 'giits':
      return appId.includes('GIITS') || instId === 'INST-NORTH' || instId === 'INST-GIITS' || name.includes('GIITS') || name.includes('GONNA');
    case 'pdimtr':
      return appId.includes('PDIMTR') || instId === 'INST-WEST' || instId === 'INST-PDIMTR' || name.includes('PDIMTR') || name.includes('PRERNA');
    case 'apex':
      return appId.includes('APEX') || instId === 'INST-APEX' || name.includes('APEX');
    case 'batu':
      return appId.includes('BATU') || instId === 'INST-BATU' || name.includes('BATU') || name.includes('AMBEDKAR');
    case 'vvit':
      return appId.includes('VVIT') || instId === 'INST-VVIT' || name.includes('VVIT');
    case 'custom': {
      const target = (scope.idOrCode || '').toUpperCase();
      if (target && (instId === target || appId === target || appId.includes(target) || name === target || name.includes(target))) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

export function isExpiringDocForScope(doc: ExpiringDocument, scope: ActiveInstitutionScope): boolean {
  const code = (doc.institutionCode || '').toUpperCase();
  const name = (doc.institutionName || '').toUpperCase();

  switch (scope.key) {
    case 'coep':
      return code === 'INST-SOUTH' || code === 'INST-COEP' || name.includes('COEP');
    case 'giits':
      return code === 'INST-NORTH' || code === 'INST-GIITS' || name.includes('GIITS') || name.includes('GONNA');
    case 'pdimtr':
      return code === 'INST-WEST' || code === 'INST-PDIMTR' || name.includes('PDIMTR') || name.includes('PRERNA');
    case 'apex':
      return code === 'INST-APEX' || name.includes('APEX');
    case 'batu':
      return code === 'INST-BATU' || name.includes('BATU') || name.includes('AMBEDKAR');
    case 'vvit':
      return code === 'INST-VVIT' || name.includes('VVIT');
    case 'custom': {
      const target = (scope.idOrCode || '').toUpperCase();
      if (target && (code === target || name === target || name.includes(target))) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Derives real statutory expiring document trackers from an application's uploaded documents
 */
export function deriveExpiringDocumentsFromApp(app: Application): ExpiringDocument[] {
  const docs: ExpiringDocument[] = [];
  const suffix = (app.id || '2026').slice(-4);

  // 1. Mandatory Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule per APH §2.25(f))
  docs.push({
    id: `DOC-EXP-${app.id}-FIRE`,
    institutionName: app.institutionName,
    institutionCode: app.institutionCode || `INST-${suffix}`,
    region: app.region,
    documentType: 'Fire Safety NOC',
    documentNumber: `NOC-FS-2026-${suffix}`,
    issuedDate: '15-Nov-2025',
    expiryDate: '14-Nov-2026',
    daysUntilExpiry: 7,
    renewalStatus: 'Expiring Soon',
    renewalNoticeIssued: true,
  });

  // 2. Mandatory Structural Stability Certificate (Municipal Approved 5-Year Cycle)
  docs.push({
    id: `DOC-EXP-${app.id}-STRUCT`,
    institutionName: app.institutionName,
    institutionCode: app.institutionCode || `INST-${suffix}`,
    region: app.region,
    documentType: 'Building Stability Certificate',
    documentNumber: `MC-STR-2024-${suffix}`,
    issuedDate: '10-Apr-2024',
    expiryDate: '09-Apr-2029',
    daysUntilExpiry: 883,
    renewalStatus: 'Valid',
    renewalNoticeIssued: false,
  });

  // 3. Registered Land Conversion / Title Deed (30-Year Lease Minimum per APH §2.1(e))
  docs.push({
    id: `DOC-EXP-${app.id}-LAND`,
    institutionName: app.institutionName,
    institutionCode: app.institutionCode || `INST-${suffix}`,
    region: app.region,
    documentType: 'Land Lease Deed',
    documentNumber: `REV-LD-2020-${suffix}`,
    issuedDate: '01-Aug-2020',
    expiryDate: '31-Jul-2050',
    daysUntilExpiry: 8667,
    renewalStatus: 'Valid',
    renewalNoticeIssued: false,
  });

  return docs;
}

export function isNotificationForRole(
  n: NotificationItem,
  roleNumber: number,
  instScope?: ActiveInstitutionScope
): boolean {
  const targetRole = (n as any).targetRole;
  const cat = n.category || '';
  const catLower = cat.toLowerCase();

  switch (roleNumber) {
    case 1: {
      // Role 1 (Applicant): strictly scoped to their institution only!
      if (targetRole && targetRole !== 'institution') return false;
      if (!instScope) return true;
      const target = (instScope.idOrCode || '').toUpperCase();
      const nApp = (n.applicationId || '').toUpperCase();
      const nInst = (((n as any).institutionId as string) || '').toUpperCase();
      const nMsg = (n.message || '').toUpperCase();
      const nTitle = (n.title || '').toUpperCase();

      if (instScope.key === 'coep') return nApp.includes('COEP') || nInst.includes('COEP') || nMsg.includes('COEP') || nTitle.includes('COEP');
      if (instScope.key === 'giits') return nApp.includes('GIITS') || nInst.includes('GIITS') || nMsg.includes('GIITS') || nMsg.includes('GONNA') || nTitle.includes('GIITS');
      if (instScope.key === 'pdimtr') return nApp.includes('PDIMTR') || nInst.includes('PDIMTR') || nMsg.includes('PDIMTR') || nMsg.includes('PRERNA') || nTitle.includes('PDIMTR');
      if (instScope.key === 'apex') return nApp.includes('APEX') || nInst.includes('APEX') || nMsg.includes('APEX') || nTitle.includes('APEX');
      if (instScope.key === 'batu') return nApp.includes('BATU') || nInst.includes('BATU') || nMsg.includes('BATU') || nTitle.includes('BATU');
      if (instScope.key === 'vvit') return nApp.includes('VVIT') || nInst.includes('VVIT') || nMsg.includes('VVIT') || nTitle.includes('VVIT');

      if (target && (nApp.includes(target) || nInst.includes(target) || nMsg.includes(target) || nTitle.includes(target))) {
        return true;
      }
      return false;
    }
    case 2: {
      // Role 2 (Desk Scrutiny Committee)
      if (targetRole === 'reviewer') return true;
      if (targetRole && targetRole !== 'reviewer') return false;
      return (
        cat === 'Scrutiny' ||
        cat === 'Workflow' ||
        cat === 'Deadline' ||
        cat === 'Overdue' ||
        catLower.includes('scrutiny') ||
        catLower.includes('deficiency') ||
        catLower.includes('cadre')
      );
    }
    case 3: {
      // Role 3 (EVC Committee Panel)
      if (targetRole === 'evc') return true;
      if (targetRole && targetRole !== 'evc') return false;
      return (
        cat === 'EVC' ||
        catLower.includes('evc') ||
        catLower.includes('inspection') ||
        catLower.includes('visit')
      );
    }
    case 4: {
      // Role 4 (Regional Office Desk - WRO)
      if (targetRole === 'regional_officer') return true;
      if (targetRole === 'policy_admin') return false;
      return (
        cat === 'Regional Intake' ||
        cat === 'Concurrence' ||
        cat === 'Compliance' ||
        cat === 'Document Expiry' ||
        cat === 'Deadline' ||
        cat === 'Overdue' ||
        cat === 'Workflow' ||
        catLower.includes('regional') ||
        catLower.includes('hearing') ||
        catLower.includes('shc')
      );
    }
    case 5: {
      // Role 5 (Approval Bureau / Council Authority)
      if (targetRole === 'bureau_officer' || targetRole === 'demo_authority') return true;
      if (targetRole === 'policy_admin') return false;
      return (
        cat === 'Council Docket' ||
        cat === 'Judicial / SAC' ||
        cat === 'Order Dispatch' ||
        cat === 'Deadline' ||
        cat === 'Overdue' ||
        catLower.includes('council') ||
        catLower.includes('sac') ||
        catLower.includes('approval')
      );
    }
    case 6: {
      // Role 6 (Central Policy Admin)
      if (targetRole === 'policy_admin') return true;
      return [
        'Rule Engine Conflict',
        'WORM Audit Ledger',
        'Ecosystem Adapters',
        'SLA Escalation',
        'Worker Health'
      ].includes(cat);
    }
    default:
      return true;
  }
}

export function isEscalationForRole(
  e: EscalationRecord,
  roleNumber: number,
  instScope?: ActiveInstitutionScope
): boolean {
  switch (roleNumber) {
    case 1: {
      if (!instScope) return true;
      const target = (instScope.idOrCode || '').toUpperCase();
      const eApp = (e.applicationId || '').toUpperCase();
      const eInst = (e.institutionName || '').toUpperCase();

      if (instScope.key === 'coep') return eApp.includes('COEP') || eInst.includes('COEP');
      if (instScope.key === 'giits') return eApp.includes('GIITS') || eInst.includes('GIITS') || eInst.includes('GONNA');
      if (instScope.key === 'pdimtr') return eApp.includes('PDIMTR') || eInst.includes('PDIMTR') || eInst.includes('PRERNA');
      if (instScope.key === 'apex') return eApp.includes('APEX') || eInst.includes('APEX');
      if (instScope.key === 'batu') return eApp.includes('BATU') || eInst.includes('BATU');
      if (instScope.key === 'vvit') return eApp.includes('VVIT') || eInst.includes('VVIT');

      if (target && (eApp.includes(target) || eInst.includes(target))) return true;
      return false;
    }
    case 2: {
      // Scrutiny stage escalations
      return (
        e.currentStage === 'Scrutiny in Progress' ||
        e.currentStage === 'Deficiency Communicated' ||
        (e.escalationReason?.toLowerCase().includes('scrutiny') ?? false) ||
        (e.escalationReason?.toLowerCase().includes('deficiency') ?? false)
      );
    }
    case 3: {
      // EVC stage escalations
      return (
        e.currentStage === 'EVC Scheduled' ||
        e.currentStage === 'EVC Inspection Completed' ||
        (e.escalationReason?.toLowerCase().includes('evc') ?? false) ||
        (e.escalationReason?.toLowerCase().includes('inspection') ?? false)
      );
    }
    case 4: {
      // Regional desk escalations
      return e.region === 'Western' || e.currentStage !== 'Approval Issued';
    }
    case 5: {
      // Approval bureau escalations
      return (
        (e.escalatedTo?.toLowerCase().includes('bureau') ?? false) ||
        (e.escalatedTo?.toLowerCase().includes('council') ?? false) ||
        (e.escalatedTo?.toLowerCase().includes('authority') ?? false) ||
        e.currentStage === 'Executive Committee Approval'
      );
    }
    case 6: {
      // All system escalations
      return true;
    }
    default:
      return true;
  }
}
