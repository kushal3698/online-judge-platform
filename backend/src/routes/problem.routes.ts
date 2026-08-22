import { Router } from 'express';
import { z } from 'zod';
import { ProblemController } from '../controllers/problem.controller';
import { validateRequest } from '../middleware/validator.middleware';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();
const problemController = new ProblemController();

// Validation Schemas
const CreateProblemSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
    statement: z.string().min(10, 'Statement must be at least 10 characters long'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    tags: z.array(z.string()).optional(),
    constraints: z.object({
      timeLimitMs: z.number().min(100).max(10000).default(1000),
      memoryLimitMb: z.number().min(16).max(512).default(256)
    }).optional(),
    sampleInput: z.string(),
    sampleOutput: z.string()
  })
});

const UpdateProblemSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    statement: z.string().min(10).optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    tags: z.array(z.string()).optional(),
    constraints: z.object({
      timeLimitMs: z.number().min(100).max(10000),
      memoryLimitMb: z.number().min(16).max(512)
    }).optional(),
    sampleInput: z.string().optional(),
    sampleOutput: z.string().optional()
  })
});

// Public Routes
router.get('/', problemController.getProblems);
router.get('/:id', problemController.getProblemById);
router.get('/slug/:slug', problemController.getProblemBySlug);

// Admin-Only Routes
router.post('/', authenticateJwt, requireAdmin, validateRequest(CreateProblemSchema), problemController.createProblem);
router.put('/:id', authenticateJwt, requireAdmin, validateRequest(UpdateProblemSchema), problemController.updateProblem);
router.delete('/:id', authenticateJwt, requireAdmin, problemController.deleteProblem);

export default router;
