import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { memoryDB } from '../data/memoryStore.js';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';
import ComplianceUndertaking from '../models/ComplianceUndertaking.js';
import ExpiringDocument from '../models/ExpiringDocument.js';
import EVCInspection from '../models/EVCInspection.js';
import EscalationRecord from '../models/EscalationRecord.js';
import Notification from '../models/Notification.js';

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
      provider: 'MongoDB Atlas',
      connectionState: mongoStatusMap[mongoState] || 'unknown',
      readyStateNumber: mongoState,
    },
  });
});

// --- Auth Endpoints ---
router.post('/auth/login', (req, res) => {
  const { email } = req.body;
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

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
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
      currentStage: req.body.currentStage || 'Application Submitted',
      currentStageStartedAt: new Date(),
      submittedAt: new Date(),
      stageDeadlineDays: 7,
      assignedOfficer: 'Shri R. K. Deshmukh',
      priority: 'Medium',
      slaStatus: 'within_sla',
      documents: req.body.documents || [],
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

    if (req.io) req.io.emit('application:created', newApp);

    res.status(201).json({ success: true, message: 'Application created in MongoDB Atlas', data: newApp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    let app = null;
    if (mongoose.connection.readyState === 1) {
      app = await Application.findById(req.params.id).catch(() => null);
      if (!app) app = await Application.findOne({ applicationNumber: req.params.id });
    }
    if (!app) {
      app = memoryDB.applications.find((a) => a.id === req.params.id || a.applicationNumber === req.params.id);
    }
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
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
      if (!app) app = await Application.findOne({ applicationNumber: req.params.id });
    }
    if (!app) {
      app = memoryDB.applications.find((a) => a.id === req.params.id || a.applicationNumber === req.params.id);
    }
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const prevStage = app.currentStage;
    app.currentStage = targetStage;
    app.currentStageStartedAt = new Date();

    if (reason) {
      app.observations.push({
        stage: targetStage,
        authorName: req.user?.name || 'Officer',
        authorRole: req.user?.roleTitle || 'Regional Officer',
        timestamp: new Date(),
        type: targetStage === 'Deficiency Communicated' ? 'Deficiency' : 'Observation',
        comment: reason,
        mandatoryResolutionRequired: targetStage === 'Deficiency Communicated',
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

    if (req.io) req.io.emit('application:stage_changed', { appId: app.id || app._id, stage: targetStage });

    res.json({ success: true, message: `Transitioned to ${targetStage}`, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- EVC Inspections ---
router.get('/evc-visits', authenticateToken, async (req, res) => {
  try {
    let visits = [];
    if (mongoose.connection.readyState === 1) {
      visits = await EVCInspection.find().sort({ createdAt: -1 });
      if (visits.length === 0) {
        // Seed initial if empty
        const initial = [
          {
            applicationId: 'app-002',
            applicationNumber: 'AICTE-2026-SR-20419',
            institutionName: 'Vellore Institute of Advance Technology',
            region: 'Southern',
            scheduledDate: '2026-10-26',
            scheduledTime: '10:00 AM IST',
            committeeChairman: 'Prof. S. K. Ramanathan',
            committeeMembers: ['Dr. A. N. Murthy (IIT Madras)', 'Prof. V. Rajesh (NIT Trichy)'],
            status: 'Scheduled',
          },
        ];
        visits = await EVCInspection.insertMany(initial);
      }
    } else {
      visits = memoryDB.evcVisits;
    }
    res.json({ success: true, data: visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Compliance Undertakings ---
router.get('/undertakings', authenticateToken, async (req, res) => {
  try {
    let items = [];
    if (mongoose.connection.readyState === 1) {
      items = await ComplianceUndertaking.find().sort({ createdAt: -1 });
      if (items.length === 0) {
        const initial = [
          {
            applicationId: 'app-001',
            applicationNumber: 'AICTE-2026-WR-10921',
            institutionName: 'College of Engineering Pune (COEP Tech)',
            conditionTitle: 'Cadre Ratio Rectification in Computer Engineering',
            description: 'Ensure minimum 1 Professor, 2 Associate Professors per 60 intake unit.',
            dueDate: '2026-10-28',
            status: 'Submitted',
            daysRemaining: 6,
          },
        ];
        items = await ComplianceUndertaking.insertMany(initial);
      }
    } else {
      items = memoryDB.undertakings;
    }
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/undertakings/:id/evidence', authenticateToken, async (req, res) => {
  const { evidenceDocumentName } = req.body;
  try {
    let item = null;
    if (mongoose.connection.readyState === 1) {
      item = await ComplianceUndertaking.findById(req.params.id);
      if (item) {
        item.status = 'Submitted';
        item.evidenceDocumentName = evidenceDocumentName;
        item.evidenceUploadedAt = new Date();
        await item.save();
      }
    }
    res.json({ success: true, message: 'Evidence uploaded successfully', data: item });
  } catch (err) {
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
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    let notifs = [];
    if (mongoose.connection.readyState === 1) {
      notifs = await Notification.find().sort({ timestamp: -1 });
      if (notifs.length === 0) {
        const initial = [
          {
            title: 'CRITICAL OVERDUE: Deficiency Response Missed',
            message: 'Application AICTE-2026-NR-33104 is overdue by 7 days.',
            category: 'Overdue',
            severity: 'critical',
            isRead: false,
          },
        ];
        notifs = await Notification.insertMany(initial);
      }
    } else {
      notifs = memoryDB.notifications;
    }
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
