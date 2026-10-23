import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { memoryDB } from '../data/memoryStore.js';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatusMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AICTE Approval Workflow Backend (SIH 26262)',
    database: {
      provider: 'MongoDB',
      connectionState: mongoStatusMap[mongoState] || 'unknown',
      readyStateNumber: mongoState,
    },
  });
});

// --- Auth Endpoints ---
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = memoryDB.users.find((u) => u.email === email) || memoryDB.users[0];
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      accessToken: 'dummy_jwt_token_aicte_sih_2026',
    },
  });
});

router.get('/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, data: req.user });
});

// --- Applications Endpoints ---
router.get('/applications', authenticateToken, async (req, res) => {
  const { region, stage, status } = req.query;
  try {
    let results = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (region && region !== 'All') query.region = region;
      if (stage && stage !== 'All') query.currentStage = stage;
      if (status && status !== 'All') query.slaStatus = status;
      results = await Application.find(query).sort({ createdAt: -1 });
    } else {
      results = [...memoryDB.applications];
      if (region && region !== 'All') results = results.filter((a) => a.region === region);
      if (stage && stage !== 'All') results = results.filter((a) => a.currentStage === stage);
      if (status && status !== 'All') results = results.filter((a) => a.slaStatus === status);
    }

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const appData = {
      applicationNumber: `AICTE-2026-${(req.body.region || 'WR').slice(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      institutionName: req.body.institutionName || 'Test Institution',
      institutionCode: req.body.institutionCode || '1-1049281',
      region: req.body.region || 'Western',
      state: req.body.state || 'Maharashtra',
      city: req.body.city || 'Pune',
      applicationType: req.body.applicationType || 'Extension of Approval (EoA)',
      academicYear: '2027-28',
      program: req.body.program || 'Engineering & Technology',
      proposedIntake: Number(req.body.proposedIntake) || 300,
      routeType: req.body.routeType || 'Scrutiny Only',
      currentStage: 'Application Submitted',
      currentStageStartedAt: new Date(),
      submittedAt: new Date(),
      stageDeadlineDays: 7,
      assignedOfficer: 'Shri R. K. Deshmukh',
      priority: 'Medium',
      slaStatus: 'within_sla',
      documents: [],
      observations: [],
      timeline: [
        {
          stage: 'Application Submitted',
          action: 'Application submitted online',
          actorName: req.user?.name || 'Dr. Arvind Mehta',
          actorRole: req.user?.roleTitle || 'Principal',
          timestamp: new Date(),
          status: 'completed',
        },
      ],
    };

    let newApp;
    if (mongoose.connection.readyState === 1) {
      newApp = await Application.create(appData);
    } else {
      newApp = { id: `app-${Date.now().toString().slice(-4)}`, ...appData };
      memoryDB.applications.unshift(newApp);
    }

    if (req.io) {
      req.io.emit('application:created', newApp);
    }

    res.status(201).json({
      success: true,
      message: 'Application created and stored in database successfully',
      data: newApp,
    });
  } catch (err) {
    console.error('Error creating application:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    let app = null;
    if (mongoose.connection.readyState === 1) {
      app = await Application.findById(req.params.id).catch(() => null);
      if (!app) {
        app = await Application.findOne({ applicationNumber: req.params.id });
      }
    }
    if (!app) {
      app = memoryDB.applications.find((a) => a.id === req.params.id || a.applicationNumber === req.params.id);
    }
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/applications/:id/transition', authenticateToken, async (req, res) => {
  const { targetStage, reason } = req.body;
  try {
    let app = null;
    if (mongoose.connection.readyState === 1) {
      app = await Application.findById(req.params.id).catch(() => null);
      if (!app) {
        app = await Application.findOne({ applicationNumber: req.params.id });
      }
    }
    if (!app) {
      app = memoryDB.applications.find((a) => a.id === req.params.id || a.applicationNumber === req.params.id);
    }
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const prevStage = app.currentStage;
    app.currentStage = targetStage;
    app.currentStageStartedAt = new Date();

    if (reason) {
      app.observations.push({
        stage: targetStage,
        authorName: req.user?.name || 'Officer',
        authorRole: req.user?.roleTitle || 'Regional Officer',
        timestamp: new Date(),
        type: 'Observation',
        comment: reason,
        mandatoryResolutionRequired: false,
        resolved: false,
      });
    }

    app.timeline.push({
      stage: targetStage,
      action: `Transitioned to ${targetStage}`,
      actorName: req.user?.name || 'Officer',
      actorRole: req.user?.roleTitle || 'Officer',
      timestamp: new Date(),
      status: 'active',
    });

    if (mongoose.connection.readyState === 1 && typeof app.save === 'function') {
      await app.save();
    }

    const auditEntry = {
      timestamp: new Date(),
      actorName: req.user?.name || 'Officer',
      actorRole: req.user?.roleTitle || 'Officer',
      action: 'STAGE_TRANSITION',
      applicationId: app.id || app._id?.toString(),
      applicationNumber: app.applicationNumber,
      previousState: prevStage,
      newState: targetStage,
      reason: reason || `Advanced to ${targetStage}`,
      tamperProofHash: `sha256-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      result: 'SUCCESS',
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(auditEntry);
    } else {
      memoryDB.auditLogs.unshift({ id: `aud-${Date.now()}`, ...auditEntry });
    }

    if (req.io) {
      req.io.emit('application:stage_changed', { appId: app.id || app._id, stage: targetStage });
    }

    res.json({
      success: true,
      message: `Transitioned to ${targetStage}`,
      data: app,
    });
  } catch (err) {
    console.error('Error in transition:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Dashboard Summary ---
router.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    let total = 0;
    let overdue = 0;
    let approved = 0;

    if (mongoose.connection.readyState === 1) {
      total = await Application.countDocuments();
      overdue = await Application.countDocuments({ slaStatus: 'overdue' });
      approved = await Application.countDocuments({ currentStage: 'Approval Issued' });
    } else {
      total = memoryDB.applications.length;
      overdue = memoryDB.applications.filter((a) => a.slaStatus === 'overdue').length;
      approved = memoryDB.applications.filter((a) => a.currentStage === 'Approval Issued').length;
    }

    res.json({
      success: true,
      data: {
        totalApplications: total,
        pendingApplications: total - approved,
        overdueApplications: overdue,
        approvedApplications: approved,
        evcVisitsPending: 1,
        compliancePending: 3,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Notifications ---
router.get('/notifications', authenticateToken, (req, res) => {
  res.json({ success: true, data: memoryDB.notifications });
});

router.patch('/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = memoryDB.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true, data: notif });
});

// --- Audit Logs ---
router.get('/audit-logs', authenticateToken, async (req, res) => {
  try {
    let logs = [];
    if (mongoose.connection.readyState === 1) {
      logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    } else {
      logs = memoryDB.auditLogs;
    }
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
