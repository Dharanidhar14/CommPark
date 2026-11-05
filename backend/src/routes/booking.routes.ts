import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const createBookingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  startTime: z.string().datetime({ message: 'Start time must be a valid ISO datetime' }),
  endTime: z.string().datetime({ message: 'End time must be a valid ISO datetime' }),
  paymentMethod: z.string().optional(),
  specialInstructions: z.string().optional(),
});

const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

router.use(authMiddleware);

// Customer: Create Reservation
router.post(
  '/',
  validateBody(createBookingSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const booking = await services.bookingService.createBooking(
        req.user!.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: booking,
        message: 'Parking reservation confirmed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Customer: List My Bookings
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookings = await services.bookingService.getCustomerBookings(req.user!.id);
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  }
);

// Customer or Owner: Get Booking Details
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const booking = await services.bookingService.getBookingById(
        req.params.id as string,
        req.user!.id
      );
      res.json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }
);

// Customer: Cancel Reservation & Receive Refund
router.post(
  '/:id/cancel',
  validateBody(cancelBookingSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.bookingService.cancelBooking(
        req.params.id as string,
        req.user!.id,
        req.body.reason
      );
      res.json({
        success: true,
        data: result.booking,
        refundAmount: result.refundAmount,
        message: `Booking cancelled successfully. ₹${result.refundAmount.toFixed(2)} refunded to your wallet.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
