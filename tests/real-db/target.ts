/** This allowlist is not approval. A human must approve the exact disposable target. */
export function approvedDbTarget(flag: string | undefined, uri: string | undefined): string {
  if (flag !== 'approved-disposable-stage6' || !uri) throw Error('REAL_DB approval and explicit disposable URI required');
  const expected = 'mongodb://127.0.0.1:27028/sih_stage6_disposable?replicaSet=sih-rs&directConnection=true';
  if (uri !== expected) throw Error('REAL_DB target is outside the reviewed allowlist');
  return uri;
}
