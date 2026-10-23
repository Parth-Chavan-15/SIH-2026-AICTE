/** SYNTHETIC MOCK ONLY: enables M2/M3 to start before M1. Never authorize real actions via this. */
import type { Actor, Application, EventEnvelope, Obligation, RouteExplanation } from './contracts';
import type { CorePort, TransactionContext } from './ports';

export const fakeActor:Actor={id:'SYNTHETIC-REVIEWER-1',roles:['reviewer'],institutionIds:['SYNTHETIC-INST-W'],regionIds:['SYNTHETIC-REGION-W'],permissions:['scrutiny.sign','evc.read']};
export const fakeExplanation:RouteExplanation={policyRevisionId:'DEMO-AY2627-INTAKE-REVIEW-01',session:'2026-27',evaluatedFacts:{nbaAccreditation:true},result:'selected',stages:['submitted','scrutiny_pending','decision_pending'],reasons:['SYNTHETIC DEMO: eligibility review required before official mapping'],sources:[{documentId:'G02',title:'2026–27 addendum/errata',location:'PDF p.42'}]};
export const fakeCase:Application={id:'SYNTHETIC-CASE-1',reference:'DEMO-CASE-0001',institutionId:'SYNTHETIC-INST-W',regionId:'SYNTHETIC-REGION-W',category:'increase_intake',session:'2026-27',facts:{nbaAccreditation:true,intakeX:320},policyRevisionId:fakeExplanation.policyRevisionId,state:'scrutiny_pending',route:fakeExplanation,version:1,stageEnteredAt:'2026-10-23T05:00:00.000Z',createdAt:'2026-10-23T05:00:00.000Z',updatedAt:'2026-10-23T05:00:00.000Z'};
/** A non-durable in-memory transaction simulator with deliberately obvious caveats. */
export function makeFakeCorePort():CorePort & {events:EventEnvelope[];obligations:Obligation[]}{
 let current={...fakeCase};const events:EventEnvelope[]=[];const obligations:Obligation[]=[];
 return {events,obligations,async getActor(){return {...fakeActor};},async getApplication(id){if(id!==current.id)throw Error('SYNTHETIC_CASE_NOT_FOUND');return {...current};},async getRouteExplanation(id){if(id!==current.id)throw Error('SYNTHETIC_CASE_NOT_FOUND');return fakeExplanation;},async withCaseTransaction<T>(caseId:string, fn:(tx:TransactionContext)=>Promise<T>):Promise<T>{
   if(caseId!==current.id)throw Error('SYNTHETIC_CASE_NOT_FOUND');
   const stagedEvents:EventEnvelope[]=[];const stagedObligations:Obligation[]=[];let stagedCase={...current};
   const tx:TransactionContext={actor:fakeActor,application:{...current},transactionId:'MOCK-NOT-ATOMIC',emit:(e)=>{stagedEvents.push(e);},saveCase:async (a)=>{stagedCase={...a};},saveObligation:async(o)=>{stagedObligations.push(o);}};
   const result=await fn(tx);current=stagedCase;events.push(...stagedEvents);obligations.push(...stagedObligations);return result;
 }};
}
