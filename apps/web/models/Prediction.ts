import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
  atmId: string;
  predictedCashDemand: number;
  riskScore: number;
  confidence: number;
  predictedTimeToCashout: number; // in hours
  modelVersion: string;
  timestamp: Date;
}

const PredictionSchema: Schema = new Schema({
  atmId: { type: String, required: true, index: true },
  predictedCashDemand: { type: Number, required: true },
  riskScore: { type: Number, required: true },
  confidence: { type: Number, required: true },
  predictedTimeToCashout: { type: Number, required: true },
  modelVersion: { type: String, required: true },
  timestamp: { type: Date, required: true, index: true }
}, {
  timestamps: true
});

export const Prediction = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);
