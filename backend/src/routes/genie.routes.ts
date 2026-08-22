import { Router, Request, Response, NextFunction } from 'express';
import { GenieService } from '../services/genie.service';

const router = Router();
const genieService = new GenieService();

// Allow open mentor queries for active coding assistance
router.post('/mentor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await genieService.processGenieRequest(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
