import mongoose, { Schema, Document } from 'mongoose';

export interface IAtm extends Document {
  atmId: string;
  location: {
    lat: number;
    lng: number;
  };
  branch: string;
  capacity: number;
  currentCash: number;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  metadata?: Record<string, any>;
}

const AtmSchema: Schema = new Schema({
  atmId: { type: String, required: true, unique: true, index: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  branch: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentCash: { type: Number, required: true },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE'], default: 'ONLINE' },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Avoid OverwriteModelError in Next.js development
export const Atm = mongoose.models.Atm || mongoose.model<IAtm>('Atm', AtmSchema);
