import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validator.middleware';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Zod Schemas
const SignupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['User', 'Admin']).optional()
  })
});

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password cannot be empty')
  })
});

// Routes
router.post('/signup', validateRequest(SignupSchema), authController.signup);
router.post('/login', validateRequest(LoginSchema), authController.login);
router.get('/profile', authenticateJwt, authController.getProfile);

export default router;
