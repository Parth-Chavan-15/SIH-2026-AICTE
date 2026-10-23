import mongoose from 'mongoose';

const ComplianceUndertakingSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, index: true },
    applicationNumber: { type: String, required: true },
    institutionName: { type: String, required: true },
    conditionTitle: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending Evidence', 'Submitted', 'Under Review', 'Verified', 'Rejected', 'Overdue'],
      default: 'Pending Evidence',
      index: true,
    },
    evidenceDocumentName: { type: String },
    evidenceUploadedAt: { type: Date },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    reviewerRemarks: { type: String },
    isApproaching: { type: Boolean, default: false },
    isOverdue: { type: Boolean, default: false },
    daysRemaining: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.ComplianceUndertaking ||
  mongoose.model('ComplianceUndertaking', ComplianceUndertakingSchema);
