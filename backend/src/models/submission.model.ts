import { Schema, model, Document, Types } from 'mongoose';

export enum VerdictType {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  ACCEPTED = 'Accepted',
  WRONG_ANSWER = 'Wrong Answer',
  TIME_LIMIT_EXCEEDED = 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED = 'Memory Limit Exceeded',
  RUNTIME_ERROR = 'Runtime Error',
  COMPILATION_ERROR = 'Compilation Error'
}

export interface ISubmission extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  language: 'cpp' | 'python' | 'java';
  sourceCode: string;
  verdict: VerdictType;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  errorMessage?: string;
  submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  language: { type: String, required: true, enum: ['cpp', 'python', 'java'] },
  sourceCode: { type: String, required: true },
  verdict: { type: String, enum: Object.values(VerdictType), default: VerdictType.PENDING, index: true },
  executionTimeMs: { type: Number, default: 0 },
  memoryUsedKb: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now, index: true }
});

export const SubmissionModel = model<ISubmission>('Submission', SubmissionSchema);
