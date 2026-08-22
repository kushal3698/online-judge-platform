import { Schema, model, Document, Types } from 'mongoose';

export enum DifficultyLevel {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  statement: string;
  difficulty: DifficultyLevel;
  tags: string[];
  constraints: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
  sampleInput: string;
  sampleOutput: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  statement: { type: String, required: true },
  difficulty: { type: String, enum: Object.values(DifficultyLevel), required: true, index: true },
  tags: [{ type: String, trim: true }],
  constraints: {
    timeLimitMs: { type: Number, default: 1000 },
    memoryLimitMb: { type: Number, default: 256 }
  },
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const ProblemModel = model<IProblem>('Problem', ProblemSchema);
