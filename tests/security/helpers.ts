import express from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { createApiRouter } from '../../src/backend/routes/index.js';
import { createIdentity, type DemoAccount } from '../../src/backend/security/identity';
import type { Actor } from '../../src/shared/contracts';
export const origin = 'http://localhost:3000';
export const actor = (id = 'SYN-INSTITUTION'): Actor => ({ id, roles: ['institution'], permissions: ['case.read', 'case.create', 'dashboard.read', 'history.read', 'notification.read'], scope: 'scoped', institutionIds: ['SYN-INST-W'], regionIds: ['Western'] });
export const records = [
  { id: 'SYN-CASE-W', applicationNumber: 'SYN-REF-W', institutionCode: 'SYN-INST-W', institutionName: 'Synthetic West', region: 'Western', currentStage: 'Application Submitted', slaStatus: 'within_sla' },
  { id: 'SYN-CASE-OTHER', applicationNumber: 'SYN-REF-OTHER', institutionCode: 'SYN-INST-OTHER', institutionName: 'Synthetic Other', region: 'Western', currentStage: 'Application Submitted', slaStatus: 'overdue' },
  { id: 'SYN-CASE-N', applicationNumber: 'SYN-REF-N', institutionCode: 'SYN-INST-N', institutionName: 'Synthetic North', region: 'Northern', currentStage: 'Approval Issued', slaStatus: 'within_sla' },
];
export async function harness(custom: Actor = actor(), clock?: () => number) {
  const password = randomBytes(24).toString('hex');
  const account: DemoAccount = { email: 'member@demo.invalid', passwordHash: await bcrypt.hash(password, 10), actor: custom, active: true };
  const identity = createIdentity({ accounts: [account], origin, secure: false, now: clock });
  const store = { applications: structuredClone(records), notifications: [
    { id: 'SYN-NOTIF-OWN', applicationId: 'SYN-CASE-W', recipientId: custom.id, isRead: false },
    { id: 'SYN-NOTIF-OTHER', applicationId: 'SYN-CASE-W', recipientId: 'SYN-OTHER', isRead: false },
    { id: 'SYN-NOTIF-CROSS', applicationId: 'SYN-CASE-N', recipientId: custom.id, isRead: false },
    { id: 'SYN-NOTIF-LEGACY', applicationId: 'SYN-CASE-W', isRead: false },
  ], auditLogs: records.map(a => ({ id: `AUDIT-${a.id}`, applicationId: a.id })) };
  const app = express(); app.use(express.json());
  app.use('/api/v1', createApiRouter({ identity: () => identity, store, connected: () => false }));
  return { app, store, identity, password, account };
}
