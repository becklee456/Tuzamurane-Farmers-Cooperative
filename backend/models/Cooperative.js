import mongoose from 'mongoose';

const cooperativeSchema = new mongoose.Schema(
  {
    cooperativeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    cooperativeName: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    chairpersonName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

cooperativeSchema.index({ cooperativeName: 'text', cooperativeCode: 'text', district: 'text' });

export default mongoose.model('Cooperative', cooperativeSchema);
