import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { repositories } from '../repositories';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  city: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

router.use(authMiddleware);

router.get('/me', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await repositories.userRepository.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/me',
  validateBody(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await repositories.userRepository.update(req.user!.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      const { passwordHash, ...safeUser } = updated;
      res.json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
