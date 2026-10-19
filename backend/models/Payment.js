import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    farmerNumber: { type: String, required: true, uppercase: true, trim: true },
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
    totalAmountPaid: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    receiptNumber: { type: String, uppercase: true, trim: true },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

paymentSchema.index({ farmerNumber: 1, paymentStatus: 1, paymentDate: -1 });

export default mongoose.model('Payment', paymentSchema);
