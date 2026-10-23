import mongoose from 'mongoose';
/** Infrastructure records, not another case model. Never create collections/indexes on import. */
function record(name: string, collection: string, key: string) {
  const schema = new mongoose.Schema({ [key]: { type: String, required: true }, data: { type: mongoose.Schema.Types.Mixed, required: true } }, { collection, autoCreate: false, autoIndex: false, bufferCommands: false });
  schema.index({ [key]: 1 }, { unique: true });
  return mongoose.models[name] ?? mongoose.model(name, schema);
}
export const CoreAudit = record('CoreAudit', 'core_audit', 'id');
export const CoreOutbox = record('CoreOutbox', 'core_outbox', 'eventId');
export const CoreReceipt = record('CoreReceipt', 'core_receipts', 'key');
