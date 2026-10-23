import { z } from 'zod';

export const ScrutinyItemSchema = z.object({
  itemId: z.string().min(1, 'itemId is required'),
  result: z.enum(['accepted', 'deficient']),
  reason: z.string().optional(),
  evidenceVersionIds: z.array(z.string()).default([])
});

export const SignScrutinyCommandSchema = z.object({
  checklistVersion: z.string().min(1, 'checklistVersion is required'),
  items: z.array(ScrutinyItemSchema).min(1, 'At least one scrutiny item is required'),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
  reason: z.string().optional()
});

export const CorrectionInputSchema = z.object({
  itemId: z.string().min(1, 'itemId is required'),
  evidenceVersionIds: z.array(z.string()).default([]),
  response: z.string().min(1, 'response explanation is required')
});

export const CorrectionCommandSchema = z.object({
  snapshotId: z.string().min(1, 'snapshotId is required'),
  changes: z.array(CorrectionInputSchema),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
  reason: z.string().optional()
});

export const RescrutinyOutcomeSchema = z.object({
  itemId: z.string().min(1, 'itemId is required'),
  result: z.enum(['accepted', 'deficient']),
  reason: z.string().optional()
});

export const RescrutinyCommandSchema = z.object({
  snapshotId: z.string().min(1, 'snapshotId is required'),
  outcomes: z.array(RescrutinyOutcomeSchema).min(1, 'At least one outcome required'),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
  reason: z.string().optional()
});

export type SignScrutinyCommandInput = z.infer<typeof SignScrutinyCommandSchema>;
export type CorrectionCommandInput = z.infer<typeof CorrectionCommandSchema>;
export type RescrutinyCommandInput = z.infer<typeof RescrutinyCommandSchema>;
