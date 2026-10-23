import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    applicationId: { type: String, index: true },
    applicationNumber: { type: String },
    previousState: { type: String },
    newState: { type: String },
    reason: { type: String },
    tamperProofHash: { type: String, required: true },
    ipAddress: { type: String },
    result: { type: String, enum: ['SUCCESS', 'FAILED', 'FLAGGED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
