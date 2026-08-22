import { Request, Response, NextFunction } from 'express';
import { TestCaseService } from '../services/testcase.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const testCaseService = new TestCaseService();

export class TestCaseController {
  async addTestCase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testcase = await testCaseService.addTestCase(req.body);
      res.status(201).json({
        success: true,
        data: testcase
      });
    } catch (error) {
      next(error);
    }
  }

  async getTestCasesForProblem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { problemId } = req.params;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      const testcases = await testCaseService.getTestCasesForProblem(problemId, isAdmin);
      res.status(200).json({
        success: true,
        data: testcases
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTestCase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await testCaseService.deleteTestCase(id);
      res.status(200).json({
        success: true,
        message: 'Test case deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}
