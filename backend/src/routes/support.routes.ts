import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { TicketCategory } from '../repositories/ISupportRepository';

const router = Router();

const createTicketSchema = z.object({
  category: z.enum([
    'ACCESS_PROBLEM',
    'SPACE_UNAVAILABLE',
    'PAYMENT_ISSUE',
    'BOOKING_ISSUE',
    'INCORRECT_LISTING',
    'DISPUTE',
    'SAFETY_CONCERN',
    'OTHER',
  ]),
  categoryLabel: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  relatedBookingId: z.string().optional(),
  relatedBookingNumber: z.string().optional(),
  imageUri: z.string().optional(),
});

router.use(authMiddleware);

// Submit Support Ticket
router.post(
  '/tickets',
  validateBody(createTicketSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await services.supportService.createTicket(req.user!.id, {
        ...req.body,
        category: req.body.category as TicketCategory,
      });
      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Support ticket submitted successfully. Our team will review it shortly.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get User Tickets
router.get(
  '/tickets',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tickets = await services.supportService.getUserTickets(req.user!.id);
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }
);

// Get Single Ticket
router.get(
  '/tickets/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await services.supportService.getTicketById(
        req.params.id as string,
        req.user!.id,
        req.user!.activeRole === 'COMMUNITY_ADMIN'
      );
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
