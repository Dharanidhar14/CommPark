import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';

const router = Router();

const processApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
});

// List All Communities
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await services.communityService.getCommunities();
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }
);

// Get Community Details
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const community = await services.communityService.getCommunityById(req.params.id as string);
      if (!community) {
        res.status(404).json({ success: false, error: 'Community not found' });
        return;
      }
      res.json({ success: true, data: community });
    } catch (error) {
      next(error);
    }
  }
);

// Community Admin: Get Pending Listing Approvals
router.get(
  '/:id/approvals',
  authMiddleware,
  requireRoles('COMMUNITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const approvals = await services.communityService.getPendingApprovals(
        req.params.id as string,
        req.user!.id
      );
      res.json({ success: true, data: approvals });
    } catch (error) {
      next(error);
    }
  }
);

// Community Admin: Approve or Reject Parking Listing
router.post(
  '/approvals/:approvalId/process',
  authMiddleware,
  requireRoles('COMMUNITY_ADMIN'),
  validateBody(processApprovalSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.communityService.processApproval(
        req.params.approvalId as string,
        req.body.status,
        req.user!.id,
        req.body.reason
      );
      res.json({
        success: true,
        data: result,
        message: `Listing approval ${req.body.status.toLowerCase()} successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
