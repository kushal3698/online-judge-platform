import { SubmissionModel, ISubmission, VerdictType } from '../models/submission.model';
import { ProblemModel } from '../models/problem.model';
import { UserModel } from '../models/user.model';
import { submissionQueue } from '../config/redis';
import { Types } from 'mongoose';

export interface SubmitCodeInput {
  userId: string;
  problemId: string;
  language: 'cpp' | 'python' | 'java';
  sourceCode: string;
}

export interface SubmissionResponse {
  submissionId: string;
  status: VerdictType;
  message: string;
}

export class SubmissionService {
  async submitCode(input: SubmitCodeInput): Promise<SubmissionResponse> {
    // 1. Verify problem exists
    const problem = await ProblemModel.findById(input.problemId);
    if (!problem) {
      const error: any = new Error('Problem not found.');
      error.statusCode = 404;
      error.code = 'PROBLEM_NOT_FOUND';
      throw error;
    }

    // 2. Validate source code size (< 64 KB)
    const codeSizeInBytes = Buffer.byteLength(input.sourceCode, 'utf8');
    if (codeSizeInBytes > 65536) {
      const error: any = new Error('Source code exceeds the 64 KB limit.');
      error.statusCode = 400;
      error.code = 'CODE_SIZE_EXCEEDED';
      throw error;
    }

    // 3. Create initial Submission record with status Pending
    const submission = await SubmissionModel.create({
      userId: new Types.ObjectId(input.userId),
      problemId: new Types.ObjectId(input.problemId),
      language: input.language,
      sourceCode: input.sourceCode,
      verdict: VerdictType.PENDING
    });

    // 4. Increment user totalSubmissions metric
    await UserModel.findByIdAndUpdate(input.userId, {
      $inc: { totalSubmissions: 1 }
    });

    // 5. Enqueue job to Redis BullMQ queue
    await submissionQueue.add(
      'evaluate-submission',
      {
        submissionId: submission._id.toString(),
        problemId: problem._id.toString(),
        language: input.language,
        sourceCode: input.sourceCode,
        timeLimitMs: problem.constraints.timeLimitMs,
        memoryLimitMb: problem.constraints.memoryLimitMb
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true
      }
    );

    return {
      submissionId: submission._id.toString(),
      status: VerdictType.PENDING,
      message: 'Submission enqueued successfully for asynchronous evaluation.'
    };
  }

  async getSubmissionById(id: string): Promise<ISubmission> {
    const submission = await SubmissionModel.findById(id)
      .populate('problemId', 'title slug difficulty')
      .populate('userId', 'name email');

    if (!submission) {
      const error: any = new Error('Submission not found.');
      error.statusCode = 404;
      error.code = 'SUBMISSION_NOT_FOUND';
      throw error;
    }

    return submission;
  }

  async getUserSubmissionHistory(userId: string): Promise<ISubmission[]> {
    return await SubmissionModel.find({ userId: new Types.ObjectId(userId) })
      .populate('problemId', 'title slug difficulty')
      .sort({ submittedAt: -1 })
      .limit(50);
  }

  async getProblemSubmissions(problemId: string): Promise<ISubmission[]> {
    return await SubmissionModel.find({ problemId: new Types.ObjectId(problemId) })
      .populate('userId', 'name')
      .sort({ submittedAt: -1 })
      .limit(20);
  }
}
