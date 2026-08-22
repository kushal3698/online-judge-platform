import { Router } from 'express';
import { z } from 'zod';
import { SubmissionController } from '../controllers/submission.controller';
import { validateRequest } from '../middleware/validator.middleware';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();
const submissionController = new SubmissionController();

// Validation Schema supporting both ObjectId and slug IDs
const SubmitCodeSchema = z.object({
  body: z.object({
    problemId: z.string().min(1, 'Problem ID is required'),
    language: z.enum(['cpp', 'python', 'java']),
    sourceCode: z.string().min(1, 'Source code cannot be empty').max(65536, 'Code size exceeds 64KB limit')
  })
});

// Protected Routes
router.post('/', authenticateJwt, validateRequest(SubmitCodeSchema), submissionController.submitCode);
router.get('/history', authenticateJwt, submissionController.getUserHistory);
router.get('/problem/:problemId', submissionController.getProblemSubmissions);
router.get('/:id', submissionController.getSubmissionById);

export default router;
