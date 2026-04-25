import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  atmId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  triggeredAt: Date;
  resolved: boolean;
}

const AlertSchema: Schema = new Schema({
  atmId: { type: String, required: true, index: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  message: { type: String, required: true },
  triggeredAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Alert = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
