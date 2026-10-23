/** MOCK ONLY: writes caller-supplied obligations, does not implement M3 rules. */
import type { Obligation, EventEnvelope } from '../../../src/shared/contracts';
import type { DecisionObligationParticipant } from '../../../src/shared/ports';
import fixtures from '../fixtures/events.json';
export const fakeDecisionEvent = structuredClone(fixtures.events.find(e => e.type === 'DecisionRecorded')) as EventEnvelope<'DecisionRecorded'>;
export function makeFakeDecisionParticipant(obligations: Obligation[], failAfterWrite = false): DecisionObligationParticipant {
  const supplied = structuredClone(obligations);
  return { async materialize(tx, _command, eventId) {
    for (const obligation of supplied) {
      if (obligation.decisionEventId !== eventId) throw Error('MOCK_DECISION_REFERENCE_MISMATCH');
      await tx.repositories.obligations.insert(structuredClone(obligation));
    }
    if (failAfterWrite) throw Error('MOCK_PARTICIPANT_FAILURE');
    return structuredClone(supplied);
  } };
}
