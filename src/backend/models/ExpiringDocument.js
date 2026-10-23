import mongoose from 'mongoose';

const ExpiringDocumentSchema = new mongoose.Schema(
  {
    institutionName: { type: String, required: true },
    institutionCode: { type: String, required: true, index: true },
    region: { type: String, required: true },
    documentType: { type: String, required: true },
    documentNumber: { type: String, required: true },
    issuedDate: { type: String, required: true },
    expiryDate: { type: String, required: true, index: true },
    daysUntilExpiry: { type: Number, required: true },
    renewalStatus: {
      type: String,
      enum: ['Valid', 'Expiring Soon', 'Expired', 'Renewal Submitted', 'Renewal Verified'],
      default: 'Valid',
    },
    renewalDocumentName: { type: String },
    renewalSubmittedAt: { type: Date },
    renewalVerifiedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ExpiringDocument ||
  mongoose.model('ExpiringDocument', ExpiringDocumentSchema);
