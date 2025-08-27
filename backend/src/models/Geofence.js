import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true, unique: true },
  targetLat: { type: Number, required: true },
  targetLong: { type: Number, required: true },
  radius: { type: Number, required: true }, // meters
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Geofence', geofenceSchema);
