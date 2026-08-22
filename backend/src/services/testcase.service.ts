import { TestCaseModel, ITestCase } from '../models/testcase.model';
import { ProblemModel } from '../models/problem.model';
import { Types } from 'mongoose';

export interface CreateTestCaseInput {
  problemId: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  order?: number;
}

export class TestCaseService {
  async addTestCase(input: CreateTestCaseInput): Promise<ITestCase> {
    const problem = await ProblemModel.findById(input.problemId);
    if (!problem) {
      const error: any = new Error('Problem not found.');
      error.statusCode = 404;
      error.code = 'PROBLEM_NOT_FOUND';
      throw error;
    }

    const testcase = await TestCaseModel.create({
      problemId: new Types.ObjectId(input.problemId),
      input: input.input,
      expectedOutput: input.expectedOutput,
      isHidden: input.isHidden !== undefined ? input.isHidden : true,
      order: input.order || 0
    });

    return testcase;
  }

  async getTestCasesForProblem(problemId: string, isAdmin: boolean): Promise<ITestCase[]> {
    const query: any = { problemId: new Types.ObjectId(problemId) };
    if (!isAdmin) {
      query.isHidden = false; // Public users can only see sample/public testcases
    }

    return await TestCaseModel.find(query).sort({ order: 1 });
  }

  async deleteTestCase(id: string): Promise<void> {
    const testcase = await TestCaseModel.findByIdAndDelete(id);
    if (!testcase) {
      const error: any = new Error('Test case not found.');
      error.statusCode = 404;
      error.code = 'TESTCASE_NOT_FOUND';
      throw error;
    }
  }
}
