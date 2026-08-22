import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin'
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  problemsSolved: number;
  totalSubmissions: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  problemsSolved: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 }
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);
