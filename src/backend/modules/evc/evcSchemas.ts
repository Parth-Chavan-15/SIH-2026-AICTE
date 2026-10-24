import { z } from 'zod';

export const ScheduleEVCCommandSchema = z.object({
  at: z.string().datetime({ message: 'Must be a valid ISO datetime string' }),
  expectedVersion: z.number().int().nonnegative().default(1),
  idempotencyKey: z.string().min(1).default(() => `CMD-EVC-${Date.now()}`),
  reason: z.string().optional()
});

export const EVCReportCommandSchema = z.object({
  evidenceVersionIds: z.array(z.string()).default([]),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  recommendation: z.enum(['recommended', 'conditional', 'not_recommended']),
  expectedVersion: z.number().int().nonnegative().default(1),
  idempotencyKey: z.string().min(1).default(() => `CMD-EVC-${Date.now()}`),
  reason: z.string().optional()
});

export const CreateEVCTaskSchema = z.object({
  applicationId: z.string().min(1, 'applicationId is required'),
  expectedVersion: z.number().int().nonnegative().default(1),
  idempotencyKey: z.string().min(1).default(() => `CMD-EVC-${Date.now()}`)
});

export type ScheduleEVCInput = z.infer<typeof ScheduleEVCCommandSchema>;
export type EVCReportInput = z.infer<typeof EVCReportCommandSchema>;
export type CreateEVCTaskInput = z.infer<typeof CreateEVCTaskSchema>;
