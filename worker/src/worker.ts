import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { DockerRunner } from './docker/docker.runner';
import { DiffEvaluator } from './evaluator/diff.evaluator';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/online_judge';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null
});

// Define Mongoose schemas for Worker use
const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  sourceCode: { type: String, required: true },
  verdict: { type: String, default: 'Pending' },
  executionTimeMs: { type: Number, default: 0 },
  memoryUsedKb: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

const TestCaseSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  problemsSolved: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 }
});

const SubmissionModel = mongoose.model('Submission', SubmissionSchema);
const TestCaseModel = mongoose.model('TestCase', TestCaseSchema);
const UserModel = mongoose.model('User', UserSchema);

export interface SubmissionJobData {
  submissionId: string;
  problemId: string;
  language: 'cpp' | 'python' | 'java';
  sourceCode: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

const dockerRunner = new DockerRunner();

const startWorker = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[WORKER] Connected to MongoDB database successfully.');

    const worker = new Worker<SubmissionJobData>(
      'code-submissions',
      async (job: Job<SubmissionJobData>) => {
        const { submissionId, problemId, language, sourceCode, timeLimitMs = 1000, memoryLimitMb = 256 } = job.data;
        console.log(`[WORKER] Processing submission ${submissionId} (${language})...`);

        // 1. Update status to Processing
        await SubmissionModel.findByIdAndUpdate(submissionId, { verdict: 'Processing' });

        // 2. Fetch all evaluation testcases
        const testcases = await TestCaseModel.find({
          problemId: new Types.ObjectId(problemId)
        }).sort({ order: 1 });

        if (testcases.length === 0) {
          console.warn(`[WORKER] No testcases found for problem ${problemId}`);
          await SubmissionModel.findByIdAndUpdate(submissionId, {
            verdict: 'Accepted',
            executionTimeMs: 0,
            memoryUsedKb: 0
          });
          return { status: 'NO_TESTCASES' };
        }

        let finalVerdict = 'Accepted';
        let maxExecutionTime = 0;
        let peakMemoryUsed = 0;
        let errorMessage = '';

        // 3. Sequential testcase evaluation loop
        for (let i = 0; i < testcases.length; i++) {
          const testcase = testcases[i];
          const execResult = await dockerRunner.runInSandbox(
            submissionId,
            language,
            sourceCode,
            testcase.input,
            timeLimitMs,
            memoryLimitMb
          );

          maxExecutionTime = Math.max(maxExecutionTime, execResult.executionTimeMs);
          peakMemoryUsed = Math.max(peakMemoryUsed, execResult.memoryUsedKb);

          // Check for Compilation Error
          if (execResult.isCompilationError) {
            finalVerdict = 'Compilation Error';
            errorMessage = execResult.stderr;
            break;
          }

          // Check for Time Limit Exceeded
          if (execResult.isTimeout) {
            finalVerdict = 'Time Limit Exceeded';
            break;
          }

          // Check for Runtime Error
          if (execResult.exitCode !== 0) {
            finalVerdict = 'Runtime Error';
            errorMessage = execResult.stderr || 'Non-zero process exit code.';
            break;
          }

          // Check Output Match
          const isMatch = DiffEvaluator.evaluate(execResult.stdout, testcase.expectedOutput);
          if (!isMatch) {
            finalVerdict = 'Wrong Answer';
            break;
          }
        }

        // 4. Update Submission with final verdict
        const updatedSubmission = await SubmissionModel.findByIdAndUpdate(
          submissionId,
          {
            verdict: finalVerdict,
            executionTimeMs: maxExecutionTime,
            memoryUsedKb: peakMemoryUsed,
            errorMessage
          },
          { new: true }
        );

        // 5. If Accepted, increment user's problemsSolved count
        if (finalVerdict === 'Accepted' && updatedSubmission) {
          await UserModel.findByIdAndUpdate(updatedSubmission.userId, {
            $inc: { problemsSolved: 1 }
          });
        }

        console.log(`[WORKER] Submission ${submissionId} evaluated: Verdict = ${finalVerdict} (${maxExecutionTime}ms)`);
        return { verdict: finalVerdict, executionTimeMs: maxExecutionTime };
      },
      {
        connection: redisConnection,
        concurrency: 4
      }
    );

    worker.on('ready', () => {
      console.log('=============================================');
      console.log('⚙️  Online Judge BullMQ Worker Node Ready');
      console.log('📥 Listening for jobs on queue: code-submissions');
      console.log('⚡ Concurrency: 4');
      console.log('=============================================');
    });

    worker.on('completed', (job) => {
      console.log(`[WORKER] Completed job ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[WORKER] Job ${job?.id} failed:`, err);
    });
  } catch (error) {
    console.error('[WORKER_FATAL] Error initializing worker:', error);
    process.exit(1);
  }
};

startWorker();
