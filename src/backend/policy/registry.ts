import { z } from 'zod';
import type { PolicyRevision } from '../../shared/contracts';
import { policyRevisionSchema, utcSchema, idSchema } from '../../shared/schemas';

// Backend interpretation of PolicyRevision.conditions, not another transport DTO.
const scalar = z.union([z.string(), z.boolean(), z.number().finite()]);
export const ruleSchema = z.strictObject({
  format: z.literal('m1-routing-v1'),
  programs: z.array(z.string().trim().min(1)).min(1),
  sessionMode: z.enum(['regular', 'january', 'odl']),
  predicates: z.array(z.strictObject({
    fact: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{0,79}$/),
    operator: z.enum(['eq', 'lt', 'gt']), value: scalar,
    unit: z.enum(['none', 'seats', 'divisions']),
    ambiguousValues: z.array(scalar), explanation: z.string().min(1),
  }).superRefine((p, ctx) => {
    if ((p.operator !== 'eq' || p.unit !== 'none') && typeof p.value !== 'number') ctx.addIssue({ code: 'custom', message: 'Ordered or counted predicates require numeric values' });
    if (p.ambiguousValues.some(value => typeof value !== typeof p.value)) ctx.addIssue({ code: 'custom', message: 'Ambiguous boundary types must match predicate values' });
  })).min(1),
  stages: z.union([
    z.tuple([z.literal('submitted'), z.literal('scrutiny_pending'), z.literal('decision_pending')]),
    z.tuple([z.literal('submitted'), z.literal('scrutiny_pending'), z.literal('evc_pending'), z.literal('decision_pending')]),
  ]),
  evcReason: z.string().min(1), requiresHearing: z.boolean(),
  unresolved: z.array(z.string().min(1)),
  verification: z.strictObject({
    sourceRevision: z.string().trim().min(1), sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    authoredBy: idSchema, approvedBy: idSchema, verifiedAt: utcSchema,
    applicabilityConfirmed: z.boolean(), precedenceConfirmed: z.boolean(),
  }).optional(),
});
export type Rule = z.infer<typeof ruleSchema>;
export function approvedRule(p: PolicyRevision, asOf: string): Rule | null {
  const policy = policyRevisionSchema.safeParse(p);
  if (!policy.success || !utcSchema.safeParse(asOf).success) return null;
  p = policy.data;
  const checked = ruleSchema.safeParse(p.conditions);
  if (!checked.success) return null;
  const r = checked.data, v = r.verification;
  if (p.status !== 'approved' || p.source.reviewState !== 'reviewed' || !p.source.url ||
      !/^https:\/\/(?:www\.)?aicte\.gov\.in\//.test(p.source.url) || !v ||
      v.authoredBy === v.approvedBy || v.sourceRevision !== p.source.sourceRevision ||
      !v.applicabilityConfirmed || !v.precedenceConfirmed || Date.parse(v.verifiedAt) > Date.parse(asOf) ||
      r.unresolved.length || r.requiresHearing) return null;
  return r;
}

/** Read-only snapshot: no edit/activation API, no references to caller-owned objects. */
export function policyRegistry(records: unknown[]) {
  const revisions = records.map(row => policyRevisionSchema.parse(structuredClone(row)) as PolicyRevision);
  const ids = new Set<string>(), numbers = new Set<string>();
  for (const p of revisions) {
    const key = JSON.stringify([p.policyKey, p.revision]);
    if (ids.has(p.id) || numbers.has(key)) throw Error('Duplicate immutable policy revision');
    if (p.effectiveTo && Date.parse(p.effectiveTo) <= Date.parse(p.effectiveFrom)) throw Error('Invalid policy window');
    ids.add(p.id); numbers.add(key);
  }
  for (const p of revisions) if (p.supersedesId) {
    const previous = revisions.find(row => row.id === p.supersedesId);
    if (!previous || previous.policyKey !== p.policyKey || previous.revision >= p.revision ||
        previous.category !== p.category || previous.session !== p.session ||
        Date.parse(previous.effectiveFrom) > Date.parse(p.effectiveFrom)) throw Error('Invalid supersession chain');
  }
  return { all: () => structuredClone(revisions), get: (id: string) => structuredClone(revisions.find(p => p.id === id) ?? null) };
}
