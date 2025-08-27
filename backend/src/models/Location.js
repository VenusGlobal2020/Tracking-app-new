import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['moving', 'stationary'], required: true },
}, { timestamps: true });

locationSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('Location', locationSchema);
