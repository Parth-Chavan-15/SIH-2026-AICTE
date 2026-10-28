import { Router, Request, Response } from 'express';
import {
  getAllHearings,
  getAllComplaints,
  lodgeComplaint,
  submitStatutoryAppeal,
  referShortcomingsToSHC,
  scheduleHearing,
  disposeAppeal,
  hearingsDB,
  complaintsDB
} from './appealsAndHearingsService';
import type { Actor } from '../../../shared/contracts';

export function createAppealsAndHearingsRouter(): Router {
  const router = Router();

  // Helper to serialize hearings for frontend and API consistency
  const getAppealsAndHearingsPayload = (caseIdFilter?: string) => {
    let rawHearings = getAllHearings();
    let rawComplaints = getAllComplaints();

    if (caseIdFilter) {
      rawHearings = rawHearings.filter(h => h.caseId === caseIdFilter);
      rawComplaints = rawComplaints.filter(c => c.caseId === caseIdFilter);
    }

    const appeals = rawHearings
      .filter(h => h.type === 'SAC_STATUTORY_APPEAL')
      .map(h => ({
        id: h.id,
        caseId: h.caseId,
        institutionName: h.institutionName,
        grounds: h.issuesConsidered?.[0] || h.triggerEvent,
        appellantDscToken: 'DSC-TOKEN-APPEL-7718',
        lodgedAt: h.referredAt,
        status: h.status === 'DECIDED_BY_COUNCIL' ? 'DISPOSED' : (h.status === 'SCHEDULED' ? 'SCHEDULED' : 'LODGED'),
        recommendation: h.recommendation,
        observations: h.observations,
        committeeMembers: h.committeeMembers,
        governingClause: h.governingClause
      }));

    const shcHearings = rawHearings
      .filter(h => h.type !== 'SAC_STATUTORY_APPEAL')
      .map(h => ({
        id: h.id,
        caseId: h.caseId,
        institutionName: h.institutionName,
        hearingType: 'SHC',
        scheduledDate: h.hearingDate || 'Pending Schedule',
        venueOrLink: 'https://aicte-hearings.gov.in/room-shc-3',
        status: h.status,
        committeeMembers: h.committeeMembers,
        observations: h.observations
      }));

    const complaints = rawComplaints.map(c => ({
      id: c.complaintId,
      caseId: c.caseId,
      institutionName: c.institutionName,
      complainantName: c.complainantName,
      status: c.scscScrutinyStatus === 'ADMISSIBLE' ? 'UNDER_SCSC_REVIEW' : c.scscScrutinyStatus,
      complaintDetails: c.description,
      filedAt: c.lodgedAt,
      isAnonymous: c.isAnonymous
    }));

    return {
      appeals,
      hearings: shcHearings,
      complaints,
      summary: {
        activeHearingsCount: shcHearings.length,
        activeAppealsCount: appeals.length,
        activeComplaintsCount: complaints.length
      }
    };
  };

  // GET /api/v1/appeals-hearings AND /api/v1/appeals-hearings/overview
  router.get('/appeals-hearings', (req: Request, res: Response) => {
    const caseId = req.query.caseId as string | undefined;
    const payload = getAppealsAndHearingsPayload(caseId);
    return res.status(200).json({
      success: true,
      data: payload
    });
  });

  router.get('/appeals-hearings/overview', (req: Request, res: Response) => {
    const caseId = req.query.caseId as string | undefined;
    const payload = getAppealsAndHearingsPayload(caseId);
    return res.status(200).json({
      success: true,
      data: payload
    });
  });

  // POST /api/v1/appeals-hearings/appeal - Institution submits statutory SAC appeal
  router.post('/appeals-hearings/appeal', (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const caseId = req.body.caseId;
    const institutionName = req.body.institutionName || req.body.institutionId || 'Applicant Institution';
    const appealedDecisionRef = req.body.appealedDecisionRef || `DEC-${caseId || 'REF'}`;
    const decisionDate = req.body.decisionDate || new Date().toISOString();
    const chapterType = req.body.chapterType || 'CHAPTER_II';
    const groundsOfAppeal = req.body.groundsOfAppeal || req.body.grounds;
    const supportingDocuments = req.body.supportingDocuments;

    if (!caseId || !groundsOfAppeal) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'caseId and groundsOfAppeal are required.' }
      });
    }

    const result = submitStatutoryAppeal({
      caseId,
      institutionName,
      appealedDecisionRef,
      decisionDate,
      chapterType,
      groundsOfAppeal,
      supportingDocuments,
      submittedBy: actor?.id || 'institution_signatory'
    });

    if (!result.success) {
      return res.status(409).json({
        success: false,
        error: { code: 'APPEAL_TIME_BARRED', message: result.error }
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        ...result.hearing,
        hearingType: 'SAC',
        appeal: {
          ...result.hearing,
          hearingType: 'SAC'
        }
      },
      message: `Statutory appeal submitted to Standing Appellate Committee (SAC) under ${result.hearing?.governingClause}`
    });
  });

  // POST /api/v1/appeals-hearings/refer-shc - Officer refers shortcomings to SHC
  router.post('/appeals-hearings/refer-shc', (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const { caseId, institutionName, originReportRef, shortcomings } = req.body;

    if (!caseId || !originReportRef || !Array.isArray(shortcomings) || shortcomings.length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'caseId, originReportRef, and non-empty shortcomings array required.' }
      });
    }

    const hearing = referShortcomingsToSHC({
      caseId,
      institutionName: institutionName || 'Institution under Scrutiny/EVC',
      originReportRef,
      shortcomings,
      referredBy: actor?.id || 'Regional_Officer'
    });

    return res.status(201).json({
      success: true,
      data: {
        ...hearing,
        hearingType: 'SHC'
      },
      message: 'Case referred to Standing Hearing Committee (SHC) for compliance hearing under APH §2.23.3'
    });
  });

  // POST /api/v1/appeals-hearings/complaint - Lodge complaint with PGRC
  router.post('/appeals-hearings/complaint', (req: Request, res: Response) => {
    const caseId = req.body.caseId;
    const institutionName = req.body.institutionName || req.body.institutionId || 'Target Institution';
    const complainantName = req.body.complainantName;
    const isAnonymous = req.body.isAnonymous === true;
    const category = req.body.category || 'Infrastructure Deficit';
    const description = req.body.description || req.body.complaintDetails;
    const evidenceDocuments = req.body.evidenceDocuments || req.body.evidenceLinks;

    if (isAnonymous) {
      return res.status(422).json({
        success: false,
        error: { code: 'ANONYMOUS_COMPLAINT_REJECTED', message: 'Anonymous complaints are barred per Chapter VII §7.10' }
      });
    }

    if (!description) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'description is required.' }
      });
    }

    const result = lodgeComplaint({
      caseId,
      institutionName,
      complainantName,
      isAnonymous,
      category,
      description,
      evidenceDocuments
    });

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: { code: 'ANONYMOUS_COMPLAINT_REJECTED', message: result.message },
        data: result.complaint
      });
    }

    const comp = result.complaint!;
    return res.status(201).json({
      success: true,
      data: {
        ...comp,
        id: comp.complaintId,
        status: comp.scscScrutinyStatus === 'ADMISSIBLE' ? 'UNDER_SCSC_REVIEW' : comp.scscScrutinyStatus,
        complaint: {
          ...comp,
          id: comp.complaintId,
          status: comp.scscScrutinyStatus === 'ADMISSIBLE' ? 'UNDER_SCSC_REVIEW' : comp.scscScrutinyStatus
        }
      },
      message: result.message
    });
  });

  // POST /api/v1/appeals-hearings/schedule-hearing - Regional Office / Council schedules SHC/SAC hearing
  router.post('/appeals-hearings/schedule-hearing', (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const { caseId, hearingType, committeeMembers, scheduledDate, hearingMode, venueOrLink } = req.body;

    if (!caseId || !scheduledDate) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'caseId and scheduledDate are required to schedule hearing.' }
      });
    }

    const hearing = scheduleHearing({
      caseId,
      hearingType: hearingType || 'SHC',
      committeeMembers: committeeMembers || [],
      scheduledDate,
      hearingMode: hearingMode || 'VIRTUAL',
      venueOrLink: venueOrLink || 'https://aicte-hearings.gov.in',
      scheduledBy: actor?.id || 'Regional_Officer'
    });

    return res.status(201).json({
      success: true,
      data: {
        hearing,
        id: hearing.id
      },
      message: `Hearing ${hearing.id} scheduled successfully.`
    });
  });

  // POST /api/v1/appeals-hearings/appeals/:id/dispose - Council Authority / SAC Bench disposes appeal
  router.post('/appeals-hearings/appeals/:id/dispose', (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const appealId = req.params.id;
    const { decision, remarks, committeeMembers } = req.body;

    if (!decision || !remarks) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'decision and remarks are required to dispose appeal.' }
      });
    }

    const result = disposeAppeal(appealId, {
      decision,
      remarks,
      committeeMembers,
      disposedBy: actor?.id || 'Council_Authority'
    });

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: result.error || 'Appeal not found.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...result.appeal,
        appeal: result.appeal,
        status: 'DISPOSED'
      },
      message: `Appeal ${appealId} disposed with decision: ${decision}.`
    });
  });

  return router;
}
