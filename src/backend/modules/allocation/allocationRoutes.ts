import { Router, Request, Response } from 'express';
import {
  getAllGroups,
  getCaseAssignment,
  getHistoryForCase,
  assignCommitteeGroup
} from './allocationService';
import type { CaseStorage } from '../../core/storage';
import type { Actor } from '../../../shared/contracts';

export function createAllocationRouter(storage: CaseStorage): Router {
  const router = Router();

  // GET /api/v1/allocation/groups - List all Scrutiny and EVC groups with active workloads
  router.get('/allocation/groups', (_req: Request, res: Response) => {
    const groups = getAllGroups();
    return res.status(200).json({
      success: true,
      data: {
        groups,
        count: groups.length
      }
    });
  });

  // GET /api/v1/allocation/assignments/:caseId - Get committee assignments for a case
  router.get('/allocation/assignments/:caseId', (req: Request, res: Response) => {
    const assignment = getCaseAssignment(req.params.caseId);
    const history = getHistoryForCase(req.params.caseId);
    return res.status(200).json({
      success: true,
      data: {
        caseId: req.params.caseId,
        assignment,
        currentDeskScrutiny: (assignment as any)?.deskScrutinyGroup || (assignment as any)?.scrutinyGroupId,
        currentEVC: (assignment as any)?.evcGroup || (assignment as any)?.evcGroupId,
        history
      }
    });
  });

  // POST /api/v1/allocation/assign - Regional Officer assigns case to Scrutiny or EVC group
  router.post('/allocation/assign', async (req: Request, res: Response) => {
    const actor = ((req as any).actor as Actor) || {
      id: 'ro_western@aicte.gov.in',
      roles: ['regional_officer', 'bureau_officer'],
      permissions: ['case.transition'],
      scope: 'global',
      institutionIds: [],
      regionIds: ['Western']
    };

    const rawType = ((req.body.type || req.body.groupType) || '').toUpperCase();
    const type: 'SCRUTINY' | 'EVC' = (rawType === 'DESK_SCRUTINY' || rawType === 'SCRUTINY') ? 'SCRUTINY' : 'EVC';
    const { caseId, groupId, leadReviewerId, reason } = req.body;

    if (!caseId || !type || !groupId) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'Missing caseId, type, or groupId in allocation request.' }
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'A substantive allocation reason (minimum 5 characters) must be recorded for audit.' }
      });
    }

    // Fetch case from storage to check route stages
    let caseRouteStages: string[] | undefined;
    let caseCurrentStage: string | undefined;
    try {
      const app = await storage.get(actor, caseId);
      if (app) {
        caseRouteStages = app.route?.stages;
        caseCurrentStage = app.state;
      }
    } catch {}

    const result = assignCommitteeGroup({
      caseId,
      type,
      groupId,
      leadReviewerId,
      allocatedBy: actor.id,
      reason,
      caseRouteStages,
      caseCurrentStage
    });

    if (!result.success) {
      const code = result.error?.includes('EVC') ? 'EVC_NOT_APPLICABLE_FOR_ROUTE' : 'PRECONDITION_FAILED';
      return res.status(422).json({
        success: false,
        error: { code, message: result.error }
      });
    }

    return res.status(200).json({
      success: true,
      data: result.assignment,
      message: `Case ${caseId} assigned to ${result.assignment?.assignedGroupName}`
    });
  });

  return router;
}
