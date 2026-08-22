import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/environment';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Root welcome & status endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Online Judge Platform REST API Gateway',
    author: 'Kuswanth Tumma',
    documentation: '/api/health/live',
    endpoints: {
      health: '/api/health/live',
      problems: '/api/problems',
      submissions: '/api/submissions',
      leaderboard: '/api/leaderboard',
      genie_ai: '/api/genie/mentor'
    }
  });
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  }
});
app.use('/api', globalLimiter);

// API Routes
app.use('/api', apiRouter);

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API endpoint does not exist. Try accessing / or /api/problems or /api/health/live'
    }
  });
});

app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Online Judge Backend API Server LIVE`);
  console.log(`📡 Port: ${ENV.PORT}`);
  console.log(`🌍 URL: http://localhost:${ENV.PORT}/api`);
  console.log(`🏥 Health Live: http://localhost:${ENV.PORT}/api/health/live`);
  console.log(`=============================================`);
});

export default app;
