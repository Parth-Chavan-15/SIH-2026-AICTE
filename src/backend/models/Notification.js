import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, enum: ['Deadline', 'Overdue', 'EVC', 'Compliance', 'Document Expiry', 'Escalation', 'Workflow'], required: true },
    severity: { type: String, enum: ['critical', 'warning', 'info', 'success'], default: 'info' },
    timestamp: { type: Date, default: Date.now, index: true },
    isRead: { type: Boolean, default: false, index: true },
    applicationId: { type: String, index: true },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
