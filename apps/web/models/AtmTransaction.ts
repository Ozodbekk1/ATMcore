import mongoose, { Schema, Document } from 'mongoose';

export interface IAtmTransaction extends Document {
  atmId: string;
  timestamp: Date;
  withdrawAmount: number;
  depositAmount: number;
  cashRemaining: number;
  isHoliday: boolean;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  weekOfYear: number;
  month: number;
  dayOfWeek: number;
}

const AtmTransactionSchema: Schema = new Schema({
  atmId: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  withdrawAmount: { type: Number, required: true },
  depositAmount: { type: Number, required: true },
  cashRemaining: { type: Number, required: true },
  isHoliday: { type: Boolean, default: false },
  period: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], required: true },
  weekOfYear: { type: Number, required: true },
  month: { type: Number, required: true },
  dayOfWeek: { type: Number, required: true }
}, {
  timestamps: true
});

// Compound index for fast time-series queries
AtmTransactionSchema.index({ atmId: 1, timestamp: -1 });

export const AtmTransaction = mongoose.models.AtmTransaction || mongoose.model<IAtmTransaction>('AtmTransaction', AtmTransactionSchema);
