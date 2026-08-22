import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import problemRoutes from './problem.routes';
import testcaseRoutes from './testcase.routes';
import submissionRoutes from './submission.routes';
import leaderboardRoutes from './leaderboard.routes';
import genieRoutes from './genie.routes';

const apiRouter = Router();

// Health Check Probes
apiRouter.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime()
  });
});

apiRouter.get('/health/ready', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'READY',
    database: 'CONNECTED',
    timestamp: new Date().toISOString()
  });
});

// Domain Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/problems', problemRoutes);
apiRouter.use('/testcases', testcaseRoutes);
apiRouter.use('/submissions', submissionRoutes);
apiRouter.use('/leaderboard', leaderboardRoutes);
apiRouter.use('/genie', genieRoutes);

export default apiRouter;
