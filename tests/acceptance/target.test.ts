import { it, expect } from 'vitest';
import { approvedDbTarget } from '../real-db/target';
const target='mongodb://127.0.0.1:27028/sih_stage6_disposable?replicaSet=sih-rs&directConnection=true';
it.each([
  target.replace('127.0.0.1','localhost'),target.replace('127.0.0.1','[::1]'),
  target.replace('127.0.0.1','user:secret@127.0.0.1'),target.replace('127.0.0.1','127.0.0.1,localhost'),
  target.replace('27028','27017'),target.replace('sih_stage6_disposable','admin'),
  target.replace('sih-rs','other-rs'),target.replace('directConnection=true','directConnection=false'),
  target+'&tls=false',target+'&authSource=admin',target+'&replicaSet=other-rs',
  target.replace('mongodb://','mongodb+srv://'),target+'#ignored',target+' ',
])('rejects alias, credentials, alternate topology or added URI options %#',uri=>{
  expect(()=>approvedDbTarget('approved-disposable-stage6',uri)).toThrow();
});
it.each([undefined,'','true','APPROVED-DISPOSABLE-STAGE6','approved-disposable-stage6 '])('rejects missing or malformed approval even for the exact target %#',flag=>{
  expect(()=>approvedDbTarget(flag,target)).toThrow();
});
it.each([undefined,'mongodb://localhost:27017/production','mongodb://127.0.0.1:27028/sih_stage3_disposable','mongodb://127.0.0.1:27028/sih_stage6_disposable?authSource=admin'])('rejects unapproved or off-target real database inputs %#',uri=>{
  expect(()=>approvedDbTarget(undefined,uri)).toThrow();
  expect(()=>approvedDbTarget('approved-disposable-stage6',uri)).toThrow();
});
it('only accepts the exact disposable topology after an explicit approval flag',()=>{
  const uri='mongodb://127.0.0.1:27028/sih_stage6_disposable?replicaSet=sih-rs&directConnection=true';
  expect(approvedDbTarget('approved-disposable-stage6',uri)).toBe(uri);
});
