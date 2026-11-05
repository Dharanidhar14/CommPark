import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const topUpSchema = z.object({
  amount: z.number().positive('Top-up amount must be greater than zero'),
  paymentMethod: z.string().optional(),
});

router.use(authMiddleware);

// Get User Wallet
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await services.walletService.getWallet(req.user!.id);
      res.json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }
);

// Get Wallet Transaction History
router.get(
  '/transactions',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const transactions = await services.walletService.getTransactions(
        req.user!.id,
        limit
      );
      res.json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }
);

// Wallet Top-up
router.post(
  '/topup',
  validateBody(topUpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.walletService.topUp(
        req.user!.id,
        req.body.amount,
        req.body.paymentMethod
      );
      res.json({
        success: true,
        data: result,
        message: `Wallet credited with ₹${req.body.amount.toFixed(2)} successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
