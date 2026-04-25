import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // optional for future OAuth support
  name: { type: String, required: true },
  role: { type: String, enum: ['SUPERADMIN', 'ADMIN', 'USER'], default: 'USER' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

UserSchema.methods.comparePassword = async function(password: string) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
