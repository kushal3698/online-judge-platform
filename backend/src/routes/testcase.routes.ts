import { Router } from 'express';
import { z } from 'zod';
import { TestCaseController } from '../controllers/testcase.controller';
import { validateRequest } from '../middleware/validator.middleware';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();
const testCaseController = new TestCaseController();

// Validation Schema
const CreateTestCaseSchema = z.object({
  body: z.object({
    problemId: z.string().min(1, 'Problem ID is required'),
    input: z.string(),
    expectedOutput: z.string(),
    isHidden: z.boolean().optional(),
    order: z.number().optional()
  })
});

// Admin-Only Routes
router.post('/', authenticateJwt, requireAdmin, validateRequest(CreateTestCaseSchema), testCaseController.addTestCase);
router.get('/problem/:problemId', authenticateJwt, testCaseController.getTestCasesForProblem);
router.delete('/:id', authenticateJwt, requireAdmin, testCaseController.deleteTestCase);

export default router;
