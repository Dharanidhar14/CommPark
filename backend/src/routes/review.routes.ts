import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  overallRating: z.number().min(1).max(5),
  parkingExperience: z.number().min(1).max(5).optional(),
  accessExperience: z.number().min(1).max(5).optional(),
  cleanlinessSuitability: z.number().min(1).max(5).optional(),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

// Submit Review for Completed Booking
router.post(
  '/',
  authMiddleware,
  validateBody(createReviewSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await services.reviewService.createReview(
        req.user!.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get Reviews for Listing
router.get(
  '/listing/:listingId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await services.reviewService.getListingReviews(req.params.listingId as string);
      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
