import { Router, Request, Response } from 'express';
import {
  ScheduleEVCCommandSchema,
  EVCReportCommandSchema,
  CreateEVCTaskSchema
} from './evcSchemas';
import {
  getAllTasks,
  scheduleEVC,
  submitEVCReport,
  createEVCTask
} from './evcService';
import type { CorePort } from '../scrutiny/ports';
import { makeFakeCorePort } from '../scrutiny/mockCore';

export function createEVCRouter(corePort?: CorePort): Router {
  const router = Router();
  const port = corePort || makeFakeCorePort();

  // GET /api/v1/evc/queue - Get current EVC work queue
  router.get('/evc/queue', async (_req: Request, res: Response) => {
    try {
      const queue = getAllTasks();
      return res.status(200).json({
        success: true,
        data: queue
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'Error loading EVC queue' }
      });
    }
  });

  // POST /api/v1/evc/tasks - Create conditional EVC task
  router.post('/evc/tasks', async (req: Request, res: Response) => {
    const parsed = CreateEVCTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
    }

    const result = await createEVCTask(port, parsed.data.applicationId);
    if (!result.success) {
      const status = result.error.code === 'PRECONDITION_FAILED' || result.error.code === 'VERSION_CONFLICT' ? 409
        : result.error.code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json(result);
    }
    return res.status(201).json(result);
  });

  // POST /api/v1/evc/:id/schedule - Schedule inspection visit
  router.post('/evc/:id/schedule', async (req: Request, res: Response) => {
    const parsed = ScheduleEVCCommandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
    }

    const result = await scheduleEVC(
      req.params.id,
      parsed.data.at,
      parsed.data.expectedVersion,
      parsed.data.idempotencyKey
    );

    if (!result.success) {
      const status = result.error.code === 'VERSION_CONFLICT' ? 409
        : result.error.code === 'PRECONDITION_FAILED' ? 409
        : result.error.code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  });

  // POST /api/v1/evc/:id/report - Submit EVC inspection report (Does not auto-approve)
  router.post('/evc/:id/report', async (req: Request, res: Response) => {
    const parsed = EVCReportCommandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
    }

    const result = await submitEVCReport(req.params.id, parsed.data, port);
    if (!result.success) {
      const status = result.error.code === 'VERSION_CONFLICT' ? 409
        : result.error.code === 'PRECONDITION_FAILED' ? 409
        : result.error.code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  });

  return router;
}
