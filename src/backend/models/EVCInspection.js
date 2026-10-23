import mongoose from 'mongoose';

const EVCInspectionSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, index: true },
    applicationNumber: { type: String, required: true },
    institutionName: { type: String, required: true },
    region: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    committeeChairman: { type: String, required: true },
    committeeMembers: [String],
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Delayed / Rescheduled', 'Cancelled'],
      default: 'Scheduled',
    },
    isDelayed: { type: Boolean, default: false },
    delayDays: { type: Number, default: 0 },
    reportSubmitted: { type: Boolean, default: false },
    reportSubmissionDate: { type: Date },
    reportSummary: { type: String },
    recommendation: {
      type: String,
      enum: ['Recommended', 'Recommended with Conditions', 'Not Recommended'],
    },
    infrastructureScore: { type: Number, default: 0 },
    facultyScore: { type: Number, default: 0 },
    laboratoriesScore: { type: Number, default: 0 },
    assignedOfficer: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.EVCInspection ||
  mongoose.model('EVCInspection', EVCInspectionSchema);
