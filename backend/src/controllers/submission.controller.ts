import { Request, Response, NextFunction } from 'express';

interface InMemSubmission {
  _id: string;
  userId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  verdict: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  submittedAt: Date;
}

const inMemorySubmissions: InMemSubmission[] = [];
let subCounter = 1;

export class SubmissionController {
  async submitCode(req: any, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || 'guest_user';
      const { problemId, language, sourceCode } = req.body;

      const newSub: InMemSubmission = {
        _id: `sub_${subCounter++}_${Date.now()}`,
        userId,
        problemId,
        language: language || 'cpp',
        sourceCode: sourceCode || '',
        verdict: 'Pending',
        executionTimeMs: 0,
        memoryUsedKb: 0,
        submittedAt: new Date()
      };

      inMemorySubmissions.unshift(newSub);

      // Async evaluation simulation
      setTimeout(() => {
        newSub.verdict = 'Processing';
        setTimeout(() => {
          if (sourceCode.includes('while(true)') || sourceCode.includes('while (true)')) {
            newSub.verdict = 'Time Limit Exceeded';
            newSub.executionTimeMs = 1000;
          } else if (sourceCode.includes('throw') || sourceCode.includes('segfault')) {
            newSub.verdict = 'Runtime Error';
            newSub.executionTimeMs = 12;
          } else if (sourceCode.includes('syntax_error')) {
            newSub.verdict = 'Compilation Error';
          } else {
            newSub.verdict = 'Accepted';
            newSub.executionTimeMs = Math.floor(Math.random() * 15) + 4;
            newSub.memoryUsedKb = 3420;
          }
        }, 1200);
      }, 500);

      res.status(202).json({
        success: true,
        data: {
          submissionId: newSub._id,
          status: 'Pending',
          message: 'Submission enqueued for asynchronous evaluation.'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getSubmissionById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const sub = inMemorySubmissions.find((s) => s._id === id);
      if (!sub) {
        res.status(404).json({ success: false, error: { message: 'Submission not found.' } });
        return;
      }

      res.status(200).json({
        success: true,
        data: sub
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getUserHistory(req: any, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const history = inMemorySubmissions.filter((s) => s.userId === userId);
      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getProblemSubmissions(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { problemId } = req.params;
      const subs = inMemorySubmissions.filter((s) => s.problemId === problemId);
      res.status(200).json({ success: true, data: subs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
