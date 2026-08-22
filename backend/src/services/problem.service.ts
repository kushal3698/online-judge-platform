import { ProblemModel, IProblem, DifficultyLevel } from '../models/problem.model';
import { TestCaseModel } from '../models/testcase.model';
import { Types } from 'mongoose';

export interface CreateProblemInput {
  title: string;
  statement: string;
  difficulty: DifficultyLevel;
  tags?: string[];
  constraints?: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
  sampleInput: string;
  sampleOutput: string;
  createdBy: string;
}

export interface UpdateProblemInput {
  title?: string;
  statement?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  constraints?: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
  sampleInput?: string;
  sampleOutput?: string;
}

export interface ProblemQueryOptions {
  page?: number;
  limit?: number;
  difficulty?: DifficultyLevel;
  search?: string;
  tag?: string;
}

export class ProblemService {
  async createProblem(input: CreateProblemInput): Promise<IProblem> {
    const slug = this.generateSlug(input.title);

    const existingSlug = await ProblemModel.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const problem = await ProblemModel.create({
      title: input.title,
      slug: finalSlug,
      statement: input.statement,
      difficulty: input.difficulty,
      tags: input.tags || [],
      constraints: input.constraints || { timeLimitMs: 1000, memoryLimitMb: 256 },
      sampleInput: input.sampleInput,
      sampleOutput: input.sampleOutput,
      createdBy: new Types.ObjectId(input.createdBy)
    });

    return problem;
  }

  async getProblems(options: ProblemQueryOptions): Promise<{ problems: IProblem[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (options.difficulty) {
      query.difficulty = options.difficulty;
    }

    if (options.tag) {
      query.tags = { $in: [options.tag] };
    }

    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { statement: { $regex: options.search, $options: 'i' } }
      ];
    }

    const [problems, total] = await Promise.all([
      ProblemModel.find(query)
        .select('title slug difficulty tags constraints createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProblemModel.countDocuments(query)
    ]);

    return {
      problems: problems as unknown as IProblem[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProblemById(id: string): Promise<IProblem> {
    const problem = await ProblemModel.findById(id).populate('createdBy', 'name email');
    if (!problem) {
      const error: any = new Error('Problem not found.');
      error.statusCode = 404;
      error.code = 'PROBLEM_NOT_FOUND';
      throw error;
    }
    return problem;
  }

  async getProblemBySlug(slug: string): Promise<IProblem> {
    const problem = await ProblemModel.findOne({ slug }).populate('createdBy', 'name email');
    if (!problem) {
      const error: any = new Error('Problem not found.');
      error.statusCode = 404;
      error.code = 'PROBLEM_NOT_FOUND';
      throw error;
    }
    return problem;
  }

  async updateProblem(id: string, input: UpdateProblemInput): Promise<IProblem> {
    const problem = await ProblemModel.findById(id);
    if (!problem) {
      const error: any = new Error('Problem not found.');
      error.statusCode = 404;
      error.code = 'PROBLEM_NOT_FOUND';
      throw error;
    }

    if (input.title && input.title !== problem.title) {
      problem.title = input.title;
      problem.slug = this.generateSlug(input.title);
    }

    if (input.statement) problem.statement = input.statement;
    if (input.difficulty) problem.difficulty = input.difficulty;
    if (input.tags) problem.tags = input.tags;
    if (input.constraints) problem.constraints = input.constraints;
    if (input.sampleInput) problem.sampleInput = input.sampleInput;
    if (input.sampleOutput) problem.sampleOutput = input.sampleOutput;

    await problem.save();
    return problem;
  }

  async deleteProblem(id: string): Promise<void> {
    const problem = await ProblemModel.findByIdAndDelete(id);
    if (!problem) {
      const error: any = new Error('Problem not found.');
      error.statusCode = 404;
      error.code = 'PROBLEM_NOT_FOUND';
      throw error;
    }

    // Cascade delete associated testcases
    await TestCaseModel.deleteMany({ problemId: new Types.ObjectId(id) });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
