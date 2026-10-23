import mongoose from 'mongoose';

const DocumentSubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: String },
  verificationDate: { type: Date },
  status: { type: String, enum: ['Verified', 'Pending Verification', 'Rejected', 'Needs Resubmission'], default: 'Pending Verification' },
  rejectionReason: { type: String },
  expiryDate: { type: Date },
});

const ObservationSubSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['Observation', 'Deficiency', 'Clarification Request', 'Recommendation', 'Compliance Note'], required: true },
  comment: { type: String, required: true },
  mandatoryResolutionRequired: { type: Boolean, default: false },
  resolved: { type: Boolean, default: false },
});

const TimelineSubSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
  status: { type: String, enum: ['completed', 'active', 'pending', 'returned', 'overdue'], default: 'active' },
  durationDays: { type: Number, default: 0 },
});

const ApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, required: true, unique: true, index: true },
    institutionName: { type: String, required: true },
    institutionCode: { type: String, required: true, index: true },
    region: { type: String, required: true, index: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    applicationType: { type: String, required: true },
    academicYear: { type: String, required: true, default: '2027-28' },
    program: { type: String, required: true },
    proposedIntake: { type: Number, required: true },
    routeType: { type: String, required: true, default: 'Scrutiny Only' },
    currentStage: { type: String, required: true, default: 'Application Submitted', index: true },
    currentStageStartedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: Date.now },
    stageDeadlineDays: { type: Number, default: 7 },
    assignedOfficer: { type: String },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    slaStatus: { type: String, enum: ['within_sla', 'approaching_deadline', 'overdue'], default: 'within_sla', index: true },
    isEscalated: { type: Boolean, default: false },
    escalatedTo: { type: String },
    documents: [DocumentSubSchema],
    observations: [ObservationSubSchema],
    timeline: [TimelineSubSchema],
    evcId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
