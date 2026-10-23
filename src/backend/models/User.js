import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['institution', 'regional_officer', 'bureau_officer', 'evc_committee', 'admin'],
      required: true,
      index: true,
    },
    roleTitle: { type: String, required: true },
    organization: { type: String, required: true },
    region: { type: String, required: true, index: true },
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
