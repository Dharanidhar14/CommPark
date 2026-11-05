import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';

const router = Router();

const verifyPassSchema = z.object({
  qrCodeToken: z.string().min(1, 'QR Pass token is required'),
  licensePlate: z.string().min(4, 'License plate is required'),
  gateNumber: z.string().optional(),
});

const exitSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  gateNumber: z.string().optional(),
});

router.use(authMiddleware);
router.use(requireRoles('SECURITY', 'COMMUNITY_ADMIN'));

// Verify QR Pass & License Plate at Gate
router.post(
  '/verify',
  validateBody(verifyPassSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.securityService.verifyPass(
        req.user!.id,
        req.body
      );
      res.json({
        success: result.status === 'APPROVED',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Record Vehicle Exit
router.post(
  '/exit',
  validateBody(exitSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.securityService.recordExit(
        req.user!.id,
        req.body.bookingId,
        req.body.gateNumber
      );
      res.json({
        success: true,
        data: result,
        message: 'Vehicle exit recorded and booking completed.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Guard: Get Recent Verifications
router.get(
  '/recent',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await services.securityService.getRecentVerifications(req.user!.id);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
