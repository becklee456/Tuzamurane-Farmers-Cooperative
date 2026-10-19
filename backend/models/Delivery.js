import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    deliveryId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    farmerNumber: { type: String, required: true, uppercase: true, trim: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    cropType: {
      type: String,
      enum: ['Maize', 'Beans', 'Irish Potatoes'],
      required: true
    },
    weightKg: { type: Number, required: true, min: 0.01 },
    pricePerKg: { type: Number, required: true, min: 0.01 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryDate: { type: Date, required: true }
  },
  { timestamps: true }
);

deliverySchema.pre('validate', function calculateTotal(next) {
  this.totalAmount = Number((this.weightKg * this.pricePerKg).toFixed(2));
  next();
});

deliverySchema.index({ farmerNumber: 1, cropType: 1, deliveryDate: -1 });

export default mongoose.model('Delivery', deliverySchema);
