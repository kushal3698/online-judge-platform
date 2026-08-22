import { Request, Response, NextFunction } from 'express';

export interface ProblemItem {
  _id: string;
  title: string;
  slug: string;
  statement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  constraints: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
  sampleInput: string;
  sampleOutput: string;
  createdAt: Date;
}

export const inMemoryProblems: ProblemItem[] = [
  {
    _id: 'prob_1_twosum',
    title: 'Two Sum',
    slug: 'two-sum',
    statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    constraints: {
      timeLimitMs: 1000,
      memoryLimitMb: 256
    },
    sampleInput: '4\n2 7 11 15\n9',
    sampleOutput: '0 1',
    createdAt: new Date()
  },
  {
    _id: 'prob_2_reverselist',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    constraints: {
      timeLimitMs: 1000,
      memoryLimitMb: 256
    },
    sampleInput: '5\n1 2 3 4 5',
    sampleOutput: '5 4 3 2 1',
    createdAt: new Date()
  },
  {
    _id: 'prob_3_lru',
    title: 'LRU Cache Design',
    slug: 'lru-cache-design',
    statement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get() and put() operations running in O(1) average time complexity.',
    difficulty: 'Medium',
    tags: ['Design', 'Hash Table', 'Doubly-Linked List'],
    constraints: {
      timeLimitMs: 2000,
      memoryLimitMb: 256
    },
    sampleInput: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2',
    sampleOutput: '1 -1',
    createdAt: new Date()
  }
];

let problemIdCounter = 4;

export class ProblemController {
  async createProblem(req: any, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { title, statement, difficulty, constraints, sampleInput, sampleOutput, tags } = req.body;
      const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

      const newProblem: ProblemItem = {
        _id: `prob_${problemIdCounter++}_${Date.now()}`,
        title,
        slug,
        statement,
        difficulty: difficulty || 'Easy',
        tags: tags || ['Algorithm'],
        constraints: constraints || { timeLimitMs: 1000, memoryLimitMb: 256 },
        sampleInput: sampleInput || '',
        sampleOutput: sampleOutput || '',
        createdAt: new Date()
      };

      inMemoryProblems.unshift(newProblem);

      res.status(201).json({
        success: true,
        data: newProblem
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getProblems(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { difficulty, search } = req.query;
      let filtered = [...inMemoryProblems];

      if (difficulty) {
        filtered = filtered.filter((p) => p.difficulty === difficulty);
      }

      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.statement.toLowerCase().includes(q));
      }

      res.status(200).json({
        success: true,
        meta: {
          total: filtered.length,
          page: 1,
          totalPages: 1
        },
        data: filtered
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getProblemById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const problem = inMemoryProblems.find((p) => p._id === id || p.slug === id);
      if (!problem) {
        res.status(404).json({ success: false, error: { message: 'Problem not found.' } });
        return;
      }

      res.status(200).json({
        success: true,
        data: problem
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getProblemBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.getProblemById(req, res, next);
  }

  async updateProblem(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const problem = inMemoryProblems.find((p) => p._id === id);
      if (!problem) {
        res.status(404).json({ success: false, error: { message: 'Problem not found.' } });
        return;
      }

      Object.assign(problem, req.body);
      res.status(200).json({ success: true, data: problem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async deleteProblem(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idx = inMemoryProblems.findIndex((p) => p._id === id);
      if (idx !== -1) {
        inMemoryProblems.splice(idx, 1);
      }
      res.status(200).json({ success: true, message: 'Problem deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
