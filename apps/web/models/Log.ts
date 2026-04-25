import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRIT' | 'AUTH' | 'SYNC' | 'NODE';
  message: string;
  source?: string;
  metadata?: any;
  timestamp: Date;
}

const LogSchema = new Schema({
  level: { type: String, required: true },
  message: { type: String, required: true },
  source: { type: String },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export const Log = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
