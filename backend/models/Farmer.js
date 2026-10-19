import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema(
  {
    farmerNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    telephoneNumber: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    membershipDate: { type: Date, required: true },
    cooperativeCode: { type: String, required: true, uppercase: true, trim: true },
    cooperative: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' }
  },
  { timestamps: true }
);

farmerSchema.index({ firstName: 'text', lastName: 'text', farmerNumber: 'text', village: 'text' });
farmerSchema.index({ cooperativeCode: 1, farmerNumber: 1 });

export default mongoose.model('Farmer', farmerSchema);
