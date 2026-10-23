import { Router } from 'express';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { memoryDB } from '../data/memoryStore.js';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';
import { getIdentity, SecurityError, SESSION_COOKIE } from '../security/identity.ts';
import { authenticate, requirePermission, assertPermission, assertScope, inScope, scopeQuery, safeQueryFilter, deny } from '../security/authorization.ts';

/** Injectable router: tests use isolated synthetic stores and never connect/seed Mongo.
 * @param {{identity?: () => import('../security/identity').Identity, store?: {applications: any[], notifications: any[], auditLogs: any[]}, applicationModel?: any, auditModel?: any, connected?: () => boolean}} [options]
 */
export function createApiRouter({ identity = getIdentity, store = memoryDB, applicationModel = Application, auditModel = AuditLog, connected = () => mongoose.connection.readyState === 1 } = {}) {
  const router = Router();
  const wrap = fn => async (req, res, next) => { try { await fn(req, res, next); } catch (error) { deny(res, error); } };
  const missing = res => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
  async function applications(actor, filters = {}) {
    if (connected()) return applicationModel.find({ $and: [scopeQuery(actor), filters] }).sort({ createdAt: -1 });
    return store.applications.filter(a => inScope(actor, a) && Object.entries(filters).every(([key, value]) => a[key] === value));
  }
  async function findApplication(actor, id) {
    if (connected()) {
      const ids = [{ applicationNumber: id }];
      if (mongoose.isValidObjectId(id)) ids.push({ _id: id });
      return applicationModel.findOne({ $and: [scopeQuery(actor), { $or: ids }] });
    }
    return store.applications.find(a => (a.id === id || a.applicationNumber === id) && inScope(actor, a));
  }
  router.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'SIH fictional demonstration' }));
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.post('/auth/login', wrap(async (req, res) => {
    const service = identity();
    service.verifyOrigin(req.get('origin'));
    const { token, session } = await service.login(req.body, req.ip ?? 'unknown', req.headers.cookie);
    res.cookie(SESSION_COOKIE, token, service.cookieOptions).json({ success: true, data: session });
  }));
  router.use(authenticate(identity));
  router.get('/auth/me', (req, res) => {
    const { actor, expiresAt } = identity().authenticate(req.headers.cookie);
    res.json({ success: true, data: { actor, expiresAt } });
  });
  router.post('/auth/logout', (req, res) => {
    identity().logout(req.headers.cookie);
    const { maxAge: _maxAge, ...options } = identity().cookieOptions;
    res.clearCookie(SESSION_COOKIE, options).json({ success: true, data: null });
  });
  router.get('/applications', requirePermission('case.read'), wrap(async (req, res) => {
    const data = await applications(req.actor, safeQueryFilter(req));
    res.json({ success: true, data });
  }));
  router.get('/applications/:id', requirePermission('case.read'), wrap(async (req, res) => {
    const record = await findApplication(req.actor, req.params.id);
    if (!record) return missing(res);
    res.json({ success: true, data: record });
  }));
  router.post('/applications', requirePermission('case.create'), wrap(async (req, res) => {
    const { institutionCode, region } = req.body ?? {};
    if (typeof institutionCode !== 'string' || !institutionCode.startsWith('SYN-') || typeof region !== 'string') throw new SecurityError('VALIDATION_FAILED', 'Synthetic institutionCode and region required');
    assertScope(req.actor, { institutionCode, region });
    // This is legacy case intake, not the Stage 3 durable command implementation.
    const appData = {
      applicationNumber: `DEMO-${randomUUID()}`, institutionCode, region,
      institutionName: typeof req.body.institutionName === 'string' ? req.body.institutionName : 'Synthetic demonstration institution',
      state: typeof req.body.state === 'string' ? req.body.state : 'Demo state',
      city: typeof req.body.city === 'string' ? req.body.city : 'Demo city',
      applicationType: typeof req.body.applicationType === 'string' ? req.body.applicationType : 'Extension of Approval (EoA)',
      academicYear: '2026-27', program: typeof req.body.program === 'string' ? req.body.program : 'Engineering & Technology',
      proposedIntake: Number.isInteger(req.body.proposedIntake) && req.body.proposedIntake > 0 ? req.body.proposedIntake : 300,
      routeType: 'Unreviewed demo route', currentStage: 'Application Submitted',
      currentStageStartedAt: new Date(), submittedAt: new Date(), stageDeadlineDays: 7,
      assignedOfficer: '', priority: 'Medium', slaStatus: 'within_sla', documents: [], observations: [], timeline: [],
    };
    const durable = connected();
    const record = durable ? await applicationModel.create(appData) : { id: randomUUID(), ...appData };
    if (!durable) store.applications.unshift(record);
    // No global socket broadcast. Scoped subscriptions are disabled pending a reviewed port.
    res.status(201).json({ success: true, data: record });
  }));
  router.post('/applications/:id/transition', requirePermission('case.transition'), wrap(async (req, res) => {
    const record = await findApplication(req.actor, req.params.id);
    if (!record) return missing(res);
    if (['Approval Issued', 'Executive Committee Approval', 'Application Rejected', 'approved', 'conditionally_approved', 'rejected'].includes(req.body?.targetStage) || ['approve', 'reject', 'decide'].includes(req.body?.action)) {
      assertPermission(req.actor, 'decision.record');
      throw new SecurityError('FORBIDDEN', 'Generic transitions cannot record decisions');
    }
    // Existing arbitrary-stage mutator is closed until Stage 3 named-action/version guards exist.
    return res.status(409).json({ success: false, error: { code: 'PRECONDITION_FAILED', message: 'Guarded workflow command service is not implemented' } });
  }));
  router.get('/dashboard/summary', requirePermission('dashboard.read'), wrap(async (req, res) => {
    const data = await applications(req.actor, safeQueryFilter(req));
    const approved = data.filter(a => a.currentStage === 'Approval Issued').length;
    res.json({ success: true, data: { totalApplications: data.length, pendingApplications: data.length - approved, overdueApplications: data.filter(a => a.slaStatus === 'overdue').length, approvedApplications: approved } });
  }));
  const ownNotification = (actor, item) => item.recipientId === actor.id && (!item.applicationId || store.applications.some(a => (a.id === item.applicationId || a.applicationNumber === item.applicationId) && inScope(actor, a)));
  router.get('/notifications', requirePermission('notification.read'), (req, res) => res.json({ success: true, data: store.notifications.filter(n => ownNotification(req.actor, n)) }));
  router.patch('/notifications/:id/read', requirePermission('notification.read'), (req, res) => {
    const item = store.notifications.find(n => n.id === req.params.id && ownNotification(req.actor, n));
    if (!item) return missing(res);
    item.isRead = true;
    res.json({ success: true, data: item });
  });
  router.get('/audit-logs', requirePermission('history.read'), wrap(async (req, res) => {
    const visible = await applications(req.actor);
    const ids = visible.flatMap(a => [a.id ?? (a._id instanceof mongoose.Types.ObjectId ? a._id.toString() : a._id), a.applicationNumber])
      .filter(id => typeof id === 'string' && id.trim().length > 0);
    const logs = connected() ? await auditModel.find({ applicationId: { $in: ids } }).sort({ timestamp: -1 }).limit(100) : store.auditLogs.filter(log => ids.includes(log.applicationId)).slice(-100).reverse();
    res.json({ success: true, data: logs });
  }));
  // Reserve authority checks without implementing a decision endpoint/domain.
  router.use('/applications/:id/decisions', requirePermission('decision.record'));
  router.use((_req, res) => missing(res));
  return router;
}
export default createApiRouter();
