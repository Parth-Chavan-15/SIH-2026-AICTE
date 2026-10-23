import mongoose from 'mongoose';

const EscalationRecordSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, index: true },
    applicationNumber: { type: String, required: true },
    institutionName: { type: String, required: true },
    region: { type: String, required: true },
    currentStage: { type: String, required: true },
    escalationReason: { type: String, required: true },
    previousAuthority: { type: String, required: true },
    escalatedTo: { type: String, required: true },
    escalationTimestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Escalated - Action Required', 'Under Investigation', 'Resolved'],
      default: 'Escalated - Action Required',
    },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.EscalationRecord ||
  mongoose.model('EscalationRecord', EscalationRecordSchema);
