import { Schema, model, Document, Types } from 'mongoose';

export interface ITestCase extends Document {
  problemId: Types.ObjectId;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  order: number;
}

const TestCaseSchema = new Schema<ITestCase>({
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

export const TestCaseModel = model<ITestCase>('TestCase', TestCaseSchema);
