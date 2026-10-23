import type { RouteExplanation, Application } from '../../shared/contracts';
import { approvedRule, policyRegistry } from './registry';
import { z } from 'zod';
import { idSchema, utcSchema } from '../../shared/schemas';

/** Server adapter only. Values must come from scoped persisted evidence in this transaction. */
export interface VerifiedFact { value: string | boolean | number; unit: 'none' | 'seats' | 'divisions'; evidenceVersionIds: string[]; verifiedAt: string; validFrom?: string; validTo?: string; }
export type VerifiedFacts = Record<string, VerifiedFact>;
export type PolicyInput = Pick<Application, 'category' | 'session' | 'facts'> & { asOf: string; sessionMode?: 'regular' | 'january' | 'odl' };
export function evaluatePolicy(input: PolicyInput, records: unknown[], verified: VerifiedFacts = {}): RouteExplanation {
  const review = (reason: string): RouteExplanation => ({ session: input.session, category: input.category,
    evaluatedFacts: structuredClone(input.facts), result: 'review_required', stages: [], sources: [],
    reasons: ['POLICY_REVIEW_REQUIRED'], reviewReasons: [reason] });
  if (!Number.isFinite(Date.parse(input.asOf))) return review('Invalid evaluation date');
  const checkedFacts = z.record(z.string(), z.strictObject({ value: z.union([z.string(), z.boolean(), z.number().finite()]), unit: z.enum(['none', 'seats', 'divisions']), evidenceVersionIds: z.array(idSchema).min(1), verifiedAt: utcSchema, validFrom: utcSchema.optional(), validTo: utcSchema.optional() })).safeParse(verified);
  if (!checkedFacts.success) return review('Invalid verified evidence metadata');
  verified = checkedFacts.data;
  // No statutory consequence or hearing is modelled as an automatic stage.
  if (['closure', 'withdrawal', 'penalty'].includes(input.category)) return review('Authorized human review required for this category');
  let all;
  try { all = policyRegistry(records).all(); } catch { return review('Invalid registry identity, revision chain or record; registry review required'); }
  const relevant = all.filter(p => p.category === input.category && p.session === input.session &&
    Date.parse(p.effectiveFrom) <= Date.parse(input.asOf) && (!p.effectiveTo || Date.parse(input.asOf) < Date.parse(p.effectiveTo)));
  if (!relevant.length) return review('No policy for this category, academic session and effective period');
  // Unreviewed changes cannot silently enable a fallback interpretation.
  if (relevant.some(p => !approvedRule(p, input.asOf))) return review('Applicable revision has missing source verification, approval, interpretation or unsupported hearing requirements');
  // Supersession is historical: expiration does not revoke a replacement or
  // revive its ancestors. Follow the whole chain, including expired intermediates.
  const superseded = new Set<string>();
  const byId = new Map(all.map(p => [p.id, p]));
  for (const replacement of all) {
    if (replacement.category !== input.category || replacement.session !== input.session ||
        Date.parse(replacement.effectiveFrom) > Date.parse(input.asOf) || !approvedRule(replacement, input.asOf)) continue;
    let parent = replacement.supersedesId;
    while (parent) { superseded.add(parent); parent = byId.get(parent)?.supersedesId; }
  }
  const candidates = relevant.filter(p => !superseded.has(p.id));
  const matches: { p: typeof all[number]; reasons: string[]; evaluated: Record<string, unknown> }[] = [];
  let uncertain = false;
  for (const p of candidates) {
    const r = approvedRule(p, input.asOf)!;
    if (typeof input.facts.program !== 'string' || !r.programs.includes(input.facts.program)) continue;
    if (!input.sessionMode) { uncertain = true; continue; }
    if (r.sessionMode !== input.sessionMode) continue;
    let eligible = true;
    const reasons: string[] = [], evaluated: Record<string, unknown> = structuredClone(input.facts);
    for (const condition of r.predicates) {
      const observed = Object.hasOwn(verified, condition.fact) ? verified[condition.fact] : undefined;
      if (!observed || !observed.evidenceVersionIds.length || observed.evidenceVersionIds.some(id => !id.trim()) ||
          !Number.isFinite(Date.parse(observed.verifiedAt)) || Date.parse(observed.verifiedAt) > Date.parse(input.asOf) ||
          (condition.fact === 'nbaAccreditation' && observed.value === true && (!observed.validFrom || !observed.validTo)) ||
          (observed.validFrom && Date.parse(observed.validFrom) > Date.parse(input.asOf)) ||
          (observed.validTo && Date.parse(observed.validTo) <= Date.parse(input.asOf)) ||
          observed.unit !== condition.unit || (Object.hasOwn(input.facts, condition.fact) && input.facts[condition.fact] !== observed.value)) {
        uncertain = true; eligible = false; continue;
      }
      evaluated[condition.fact] = { value: observed.value, unit: observed.unit, evidenceVersionIds: [...observed.evidenceVersionIds], verifiedAt: observed.verifiedAt };
      if (condition.ambiguousValues.includes(observed.value)) { uncertain = true; eligible = false; continue; }
      const match = condition.operator === 'eq' ? observed.value === condition.value :
        typeof observed.value === 'number' && typeof condition.value === 'number' &&
        (condition.operator === 'lt' ? observed.value < condition.value : observed.value > condition.value);
      if (!match) eligible = false;
      else reasons.push(condition.explanation);
    }
    if (eligible) matches.push({ p, reasons: [...reasons, r.evcReason], evaluated });
  }
  if (uncertain) return review('Missing verified eligibility evidence, unresolved boundary, mismatched units or academic-session mode');
  if (matches.length !== 1) return review(matches.length ? 'Multiple eligible revisions conflict; confirm precedence' : 'No approved revision matches the verified facts');
  const { p, reasons, evaluated } = matches[0], rule = approvedRule(p, input.asOf)!;
  return { policyRevisionId: p.id, session: p.session, category: p.category, evaluatedFacts: evaluated,
    result: 'selected', stages: [...rule.stages], reasons, sources: [structuredClone(p.source)] };
}
